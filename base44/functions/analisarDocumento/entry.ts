import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

interface AnalisarDocumentoRequest {
  verificacao_id: string;
  document_url: string;
}

// Domínios confiáveis para URLs de documento (uploads via plataforma + buckets de OCR).
const ALLOWED_DOC_HOSTS = [
  "media.base44.com",
  "files.base44.com",
  "upload.wikimedia.org",
];

/**
 * Valida uma URL de documento externa para prevenir SSRF:
 * - Aceita apenas http/https
 * - Bloqueia hosts não listados em ALLOWED_DOC_HOSTS
 * - Bloqueia IPs privados, loopback, link-local e reservados
 */
function validateDocUrl(rawUrl: string): { ok: true; url: URL } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "URL inválida" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Protocolo não permitido" };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (!ALLOWED_DOC_HOSTS.includes(hostname)) {
    return { ok: false, reason: `Host não confiável: ${hostname}` };
  }
  // Mesmo com whitelist de domínio, bloqueia IPs literais por segurança adicional.
  const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const [a, b] = [parseInt(ipMatch[1], 10), parseInt(ipMatch[2], 10)];
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      a === 169 && b === 254 ||
      a === 172 && b >= 16 && b <= 31 ||
      a === 192 && b === 168 ||
      a >= 224 // multicast/reservado
    ) {
      return { ok: false, reason: "Endereço IP privado/reservado bloqueado" };
    }
  }
  return { ok: true, url: parsed };
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { verificacao_id, document_url }: AnalisarDocumentoRequest = await req.json();

    if (!verificacao_id || !document_url) {
      return Response.json({ error: "verificacao_id e document_url são obrigatórios" }, { status: 400 });
    }

    // Validação SSRF: bloqueia hosts não confiáveis e IPs privados/loopback/link-local.
    const docValidation = validateDocUrl(document_url);
    if (!docValidation.ok) {
      return Response.json({ error: `URL de documento rejeitada: ${docValidation.reason}` }, { status: 400 });
    }
    const safeDocUrl = docValidation.url.toString();

    // Buscar a verificação
    const verificacao = await base44.asServiceRole.entities.Verificacao.get(verificacao_id);
    if (!verificacao) {
      return Response.json({ error: "Verificação não encontrada" }, { status: 404 });
    }

    const serviceProviderId = (verificacao as any).service_provider_id;
    if (!serviceProviderId) {
      return Response.json({ error: "service_provider_id não encontrado na verificação" }, { status: 400 });
    }

    // 1. Baixar a imagem do documento (URL validada contra SSRF)
    const imageResponse = await fetch(safeDocUrl);
    if (!imageResponse.ok) {
      return Response.json({ error: "Não foi possível baixar a imagem do documento" }, { status: 400 });
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // 2. Chamar OCR da Infosimples
    const token = Deno.env.get("INFOSIMPLES_API_KEY");
    if (!token) {
      return Response.json({ error: "INFOSIMPLES_API_KEY não configurada" }, { status: 500 });
    }

    const ocrUrl = "https://api.infosimples.com/api/v2/imagens/ocr/cnh";
    const ocrParams = new URLSearchParams();
    ocrParams.append("token", token);
    ocrParams.append("image_base64", imageBase64);

    const ocrResponse = await fetch(ocrUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: ocrParams.toString(),
    });

    const ocrData = await ocrResponse.json() as any;

    if (ocrData.code !== 200) {
      return Response.json({
        success: false,
        error: ocrData.code_message || "Erro no OCR do documento",
        api_code: ocrData.code,
        api_errors: ocrData.errors,
      }, { status: 502 });
    }

    // 3. Extrair campos da CNH
    const ocrResult = Array.isArray(ocrData.data) ? ocrData.data[0] : ocrData.data;
    const campos = ocrResult?.campos || {};

    const nomeExtraido = campos.nome?.valor || "";
    const cpfExtraido = campos.cpf?.valor || "";
    const nascimentoExtraido = campos.nascimento?.valor || ""; // formato DD/MM/YYYY
    const filiacaoExtraida = campos.filiacao?.valor || ""; // pode ter nome da mãe e pai
    const validadeCnh = campos.validade?.valor || "";
    const categoriaCnh = campos.categoria?.valor || "";
    const registroCnh = campos.registro?.valor || "";
    const identidadeCnh = campos.identidade?.valor || "";

    // Converter data de nascimento de DD/MM/YYYY para YYYY-MM-DD (formato exigido pela API de antecedentes)
    let birthdateIso = "";
    if (nascimentoExtraido) {
      const parts = nascimentoExtraido.split("/");
      if (parts.length === 3) {
        birthdateIso = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }

    // Extrair nome da mãe da filiação (geralmente primeira linha)
    let nomeMaeExtraido = "";
    if (filiacaoExtraida) {
      const linhas = filiacaoExtraida.split("\n").map((l: string) => l.trim()).filter((l: string) => l);
      nomeMaeExtraido = linhas[0] || ""; // primeira linha = nome da mãe
    }

    if (!nomeExtraido || !cpfExtraido) {
      return Response.json({
        success: false,
        error: "Não foi possível extrair nome e CPF da CNH. Peça ao prestador para enviar uma foto mais nítida.",
        ocr_campos: Object.keys(campos),
      }, { status: 422 });
    }

    // 4. Atualizar o ServiceProvider com os dados extraídos
    const providerUpdate: Record<string, any> = {
      cpf: cpfExtraido,
      full_name: nomeExtraido,
      data_nascimento: birthdateIso,
      nome_mae: nomeMaeExtraido,
      cnh_numero: registroCnh,
      cnh_categoria: categoriaCnh,
      cnh_validade: validadeCnh,
      cnh_identidade: identidadeCnh,
      documento_verificado: true,
      documento_verificado_em: new Date().toISOString(),
    };

    await base44.asServiceRole.entities.ServiceProvider.update(serviceProviderId, providerUpdate);

    // 5. Atualizar a verificação com resultado do OCR
    await base44.asServiceRole.entities.Verificacao.update(verificacao_id, {
      ocr_status: "concluido",
      ocr_resultado: JSON.stringify({
        nome: nomeExtraido,
        cpf: cpfExtraido,
        nascimento: nascimentoExtraido,
        filiacao: filiacaoExtraida,
        validade: validadeCnh,
        categoria: categoriaCnh,
      }),
      documento_autenticado: true,
    });

    // 6. Chamar a API de Antecedentes Criminais com os dados extraídos
    const antecedentesUrl = "https://api.infosimples.com/api/v2/consultas/antecedentes-criminais/pf/emit";
    const antecedentesParams = new URLSearchParams();
    antecedentesParams.append("token", token);
    antecedentesParams.append("nome", nomeExtraido);
    antecedentesParams.append("birthdate", birthdateIso);
    antecedentesParams.append("cpf", cpfExtraido);
    antecedentesParams.append("timeout", "120");
    if (nomeMaeExtraido) antecedentesParams.append("nome_mae", nomeMaeExtraido);

    const antecedentesResponse = await fetch(antecedentesUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: antecedentesParams.toString(),
    });

    const antecedentesData = await antecedentesResponse.json() as any;

    let statusVerificacao = "em_analise_manual";
    let relatorioVerificacao = "";

    if (antecedentesData.code === 200 || antecedentesData.code === 201) {
      const antResult = Array.isArray(antecedentesData.data) ? antecedentesData.data[0] : antecedentesData.data;
      const nadaConsta = antResult?.conseguiu_emitir_certidao_negativa === true;
      const certidaoNumero = antResult?.numero || "";
      const certidaoValidade = antResult?.validade_data || "";
      const mensagem = antResult?.mensagem || "";

      if (nadaConsta) {
        statusVerificacao = "aprovado";
        relatorioVerificacao = `✅ VERIFICAÇÃO COMPLETA — APROVADO\n\n📄 CNH: Validada via OCR\nNome: ${nomeExtraido}\nCPF: ${cpfExtraido}\nNascimento: ${nascimentoExtraido}\nCNH: ${registroCnh} (${categoriaCnh})\n\n🔍 ANTECEDENTES CRIMINAIS — NADA CONSTA\nCertidão nº: ${certidaoNumero}\nValidade: ${certidaoValidade}`;
      } else {
        statusVerificacao = "em_analise_manual";
        relatorioVerificacao = `⚠️ VERIFICAÇÃO — ANÁLISE MANUAL NECESSÁRIA\n\n📄 CNH: Validada via OCR\nNome: ${nomeExtraido}\nCPF: ${cpfExtraido}\n\n🔍 ANTECEDENTES CRIMINAIS — REGISTROS ENCONTRADOS\nMensagem: ${mensagem}\nCertidão nº: ${certidaoNumero}`;
      }

      // Atualizar prestador com resultado
      await base44.asServiceRole.entities.ServiceProvider.update(serviceProviderId, {
        status_verificacao: statusVerificacao,
        relatorio_verificacao: relatorioVerificacao,
        data_verificacao_antecedentes: new Date().toISOString(),
        antecedentes_status: nadaConsta ? "nada_consta" : "registros_encontrados",
        antecedentes_certidao_numero: certidaoNumero,
        antendentes_certidao_validade: certidaoValidade,
      });

      // Atualizar verificação com resultado final
      await base44.asServiceRole.entities.Verificacao.update(verificacao_id, {
        antecedentes_status: nadaConsta ? "nada_consta" : "registros_encontrados",
        antecedentes_certidao_numero: certidaoNumero,
        status: statusVerificacao,
        relatorio_completo: relatorioVerificacao,
      });

    } else {
      // Erro na consulta de antecedentes — OCR foi bem, mas antecedentes falhou
      const saldoErro = (antecedentesData.errors || []).some((e: string) => e.toLowerCase().includes("saldo"));
      relatorioVerificacao = `📄 CNH: Validada via OCR ✅\nNome: ${nomeExtraido}\nCPF: ${cpfExtraido}\nNascimento: ${nascimentoExtraido}\n\n🔍 ANTECEDENTES: Erro na consulta (code ${antecedentesData.code})\n${antecedentesData.code_message}\n${saldoErro ? "⚠️ Conta Infosimples sem saldo." : ""}`;

      await base44.asServiceRole.entities.ServiceProvider.update(serviceProviderId, {
        status_verificacao: "em_analise_manual",
        relatorio_verificacao: relatorioVerificacao,
        cnh_verificada: true,
        antecedentes_erro: antecedentesData.code_message,
      });

      await base44.asServiceRole.entities.Verificacao.update(verificacao_id, {
        status: "em_analise_manual",
        antecedentes_erro: antecedentesData.code_message,
        relatorio_completo: relatorioVerificacao,
      });
    }

    return Response.json({
      success: true,
      verificacao_id: verificacao_id,
      provider_id: serviceProviderId,
      ocr_resultado: {
        nome: nomeExtraido,
        cpf: cpfExtraido,
        nascimento: nascimentoExtraido,
        filiacao: filiacaoExtraida,
        validade_cnh: validadeCnh,
        categoria: categoriaCnh,
      },
      antecedentes_resultado: antecedentesData.code === 200 || antecedentesData.code === 201 ? {
        status: (Array.isArray(antecedentesData.data) ? antecedentesData.data[0] : antecedentesData.data)?.conseguiu_emitir_certidao_negativa ? "nada_consta" : "registros_encontrados",
        certidao_numero: (Array.isArray(antecedentesData.data) ? antecedentesData.data[0] : antecedentesData.data)?.numero,
      } : {
        status: "erro",
        codigo: antecedentesData.code,
        mensagem: antecedentesData.code_message,
      },
      status_final: statusVerificacao,
      relatorio: relatorioVerificacao,
    });

  } catch (error) {
    console.error("[analisarDocumento] Error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});