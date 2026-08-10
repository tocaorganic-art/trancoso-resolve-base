import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

interface VerificarAntecedentesRequest {
  service_provider_id: string;
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { service_provider_id }: VerificarAntecedentesRequest = await req.json();

    if (!service_provider_id) {
      return Response.json({ error: "service_provider_id é obrigatório" }, { status: 400 });
    }

    const provider = await base44.entities.ServiceProvider.get(service_provider_id);

    if (!provider) {
      return Response.json({ error: "Prestador não encontrado" }, { status: 404 });
    }

    const cpf = (provider as any).cpf || (provider as any).document_number;
    const nome = (provider as any).full_name || (provider as any).name;
    const birthdate = (provider as any).data_nascimento || (provider as any).birthdate;
    const nome_mae = (provider as any).nome_mae || (provider as any).mother_name;
    const nome_pai = (provider as any).nome_pai || (provider as any).father_name;
    const uf_nascimento = (provider as any).uf_nascimento || (provider as any).birth_state || "BA";

    if (!cpf) {
      return Response.json({ error: "CPF do prestador não encontrado no cadastro" }, { status: 400 });
    }
    if (!nome) {
      return Response.json({ error: "Nome completo do prestador é obrigatório para a consulta" }, { status: 400 });
    }
    if (!birthdate) {
      return Response.json({ error: "Data de nascimento do prestador é obrigatória para a consulta (formato YYYY-MM-DD)" }, { status: 400 });
    }

    const token = Deno.env.get("INFOSIMPLES_API_KEY");
    if (!token) {
      return Response.json({ error: "INFOSIMPLES_API_KEY não configurada" }, { status: 500 });
    }

    // ENDPOINT CORRETO: api.infosimples.com (não data.infosimples.com)
    const apiUrl = "https://api.infosimples.com/api/v2/consultas/antecedentes-criminais/pf/emit";

    const formParams = new URLSearchParams();
    formParams.append("token", token);
    formParams.append("nome", nome);
    formParams.append("birthdate", birthdate);
    formParams.append("cpf", cpf);
    formParams.append("timeout", "120");
    if (nome_mae) formParams.append("nome_mae", nome_mae);
    if (nome_pai) formParams.append("nome_pai", nome_pai);
    if (uf_nascimento) formParams.append("uf_nascimento", uf_nascimento);

    // BODY DEVE SER application/x-www-form-urlencoded (não JSON!)
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formParams.toString(),
    });

    const apiData = await apiResponse.json() as any;

    // code 601 = token inválido, 603 = sem autorização/sem saldo, 602 = serviço inválido
    if (apiData.code === 603 || apiData.code === 601 || apiData.code === 602) {
      const saldoInsuficiente = (apiData.errors || []).some((e: string) => e.toLowerCase().includes("saldo"));
      return Response.json({
        success: false,
        error: saldoInsuficiente
          ? "Conta Infosimples sem saldo. Adicione créditos em infosimples.com → Área do Cliente."
          : (apiData.code_message || "Erro de autenticação com a Infosimples"),
        api_code: apiData.code,
        api_errors: apiData.errors,
        provider_id: service_provider_id,
      }, { status: 402 });
    }

    if (apiData.code !== 200 && apiData.code !== 201) {
      return Response.json({
        success: false,
        error: apiData.code_message || "Erro ao consultar antecedentes criminais",
        api_code: apiData.code,
        api_errors: apiData.errors,
        provider_id: service_provider_id,
      }, { status: 502 });
    }

    const dataResult = Array.isArray(apiData.data) ? apiData.data[0] : apiData.data;

    const conseguiuEmitirNegativa = dataResult?.conseguiu_emitir_certidao_negativa === true;
    const certidaoCodigo = dataResult?.certidao_codigo || "";
    const certidaoNumero = dataResult?.numero || "";
    const certidaoValidade = dataResult?.validade_data || "";
    const certidaoEmissao = dataResult?.emissao_data || "";
    const mensagemApi = dataResult?.mensagem || "";

    let statusVerificacao = "aprovado";
    let relatorioVerificacao = "";

    if (conseguiuEmitirNegativa) {
      statusVerificacao = "aprovado";
      relatorioVerificacao = `✅ ANTECEDENTES CRIMINAIS — NADA CONSTA\nCertidão nº: ${certidaoNumero}\nCódigo: ${certidaoCodigo}\nEmissão: ${certidaoEmissao}\nValidade: ${certidaoValidade}`;
    } else {
      statusVerificacao = "em_analise_manual";
      relatorioVerificacao = `⚠️ ANTECEDENTES CRIMINAIS — REGISTROS ENCONTRADOS\nMensagem: ${mensagemApi}\nCertidão nº: ${certidaoNumero}\nEmissão: ${certidaoEmissao}\n\nEncaminhado para análise manual do administrador.`;
    }

    await base44.entities.ServiceProvider.update(service_provider_id, {
      status_verificacao: statusVerificacao,
      relatorio_verificacao: relatorioVerificacao,
      data_verificacao_antecedentes: new Date().toISOString(),
      antecedentes_status: conseguiuEmitirNegativa ? "nada_consta" : "registros_encontrados",
      antecedentes_certidao_numero: certidaoNumero,
      antendentes_certidao_validade: certidaoValidade,
    });

    return Response.json({
      success: true,
      provider_id: service_provider_id,
      antecedentes_status: conseguiuEmitirNegativa ? "nada_consta" : "registros_encontrados",
      status_verificacao: statusVerificacao,
      certidao_numero: certidaoNumero,
      certidao_validade: certidaoValidade,
      mensagem: conseguiuEmitirNegativa
        ? "Antecedentes criminais verificados — Nada Consta"
        : "Registros encontrados — encaminhado para análise manual",
    });

  } catch (error) {
    console.error("[verificarAntecedentes] Error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});