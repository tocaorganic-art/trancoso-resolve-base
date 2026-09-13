import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// ─── Verificar Antecedentes ──────────────────────────────────────────────────
// Consulta antecedentes criminais na Infosimples (api.infosimples.com, body
// x-www-form-urlencoded) e atualiza ServiceProvider + Verificacao.
//
// Dois caminhos de invocação:
// 1. HTTP normal (app/painel): exige usuário logado — admin ou dono do cadastro.
// 2. Automação interna (On Create de ServiceProvider): validada pelo
//    AUTOMATION_WEBHOOK_SECRET — opera com asServiceRole, sem usuário logado.
//    Se o prestador autorizou mas faltam CPF/data de nascimento, não falha em
//    silêncio: marca 'em_analise_manual' e cria Verificacao pendente (fila admin).

interface VerificarAntecedentesRequest {
  service_provider_id?: string;
  internal_secret?: string;
  data?: { id?: string };
  event?: { entity_id?: string };
}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}) as VerificarAntecedentesRequest);

    // Origem da chamada: automação interna vs usuário logado
    const expectedSecret = Deno.env.get("AUTOMATION_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-automation-secret") || body.internal_secret;
    const isInternal = Boolean(expectedSecret && providedSecret === expectedSecret);

    // Suporta payload direto ({service_provider_id}) e payload de automação
    // On Create ({event: {entity_id}, data: {registro criado}})
    const service_provider_id =
      body.service_provider_id || body.data?.id || body.event?.entity_id;

    if (!service_provider_id) {
      return Response.json({ error: "service_provider_id é obrigatório" }, { status: 400 });
    }

    // Sempre asServiceRole: a consulta opera sobre dados administrativos e a
    // checagem de permissão é feita abaixo (não pelo escopo do usuário).
    // WORKAROUND CRÍTICO (06/09/2026): o .get(id) via asServiceRole falha em
    // runtime para registros existentes (retorna "Entity ... not found"), enquanto
    // o .filter() localiza normalmente. get substituído por filter por id.
    let provider: any = null;
    try {
      const providerRows = await base44.asServiceRole.entities.ServiceProvider.filter({ id: service_provider_id });
      provider = (providerRows && providerRows.length > 0) ? providerRows[0] : null;
    } catch {
      provider = null;
    }

    if (!provider) {
      return Response.json({ error: "Prestador não encontrado" }, { status: 404 });
    }

    // Gate de segurança: chamadas HTTP normais exigem admin ou dono do cadastro.
    // Automações internas (secret válido) não exigem usuário logado.
    if (!isInternal) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }
      const canVerify = user.role === 'admin'
        || (provider as any).created_by === user.email
        || (provider as any).email === user.email;
      if (!canVerify) {
        return Response.json({ error: "Você só pode verificar o próprio cadastro" }, { status: 403 });
      }
    }

    const cpf = (provider as any).cpf || (provider as any).document_number;
    const nome = (provider as any).full_name || (provider as any).name;
    const birthdate = (provider as any).data_nascimento || (provider as any).birthdate;
    const nome_mae = (provider as any).nome_mae || (provider as any).mother_name;
    const nome_pai = (provider as any).nome_pai || (provider as any).father_name;
    const uf_nascimento = (provider as any).uf_nascimento || (provider as any).birth_state || "BA";

    // Autorização concedida mas dados incompletos (automação): análise manual,
    // nunca falha em silêncio.
    if (isInternal && (provider as any).autorizou_verificacao === true && (!cpf || !birthdate)) {
      await base44.asServiceRole.entities.ServiceProvider.update(service_provider_id, {
        status_verificacao: "em_analise_manual",
        relatorio_verificacao: !cpf
          ? "CPF ausente no cadastro — encaminhado para análise manual."
          : "Data de nascimento ausente no cadastro — encaminhado para análise manual.",
        data_verificacao: new Date().toISOString(),
      });
      const pendentes = await base44.asServiceRole.entities.Verificacao.filter({
        provider_id: service_provider_id,
        verification_type: 'background_check',
      });
      const jaPendente = (pendentes || []).find((item) =>
        ['pending', 'in_progress', 'pending_review'].includes(item.status)
      );
      if (!jaPendente?.id) {
        await base44.asServiceRole.entities.Verificacao.create({
          provider_id: service_provider_id,
          verification_type: 'background_check',
          status: 'pending',
          result: 'Dados obrigatórios ausentes (CPF/data de nascimento) — aguardando análise manual do admin.',
        });
      }
      return Response.json({
        success: true,
        provider_id: service_provider_id,
        status_verificacao: "em_analise_manual",
        mensagem: "Cadastro incompleto para consulta automática — encaminhado para análise manual.",
      });
    }

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

    // code 608 = dados (nome, nome da mãe ou data de nascimento) não conferem
    // com o CPF informado na Receita Federal (validado em teste real 06/09/2026).
    if (apiData.code === 608) {
      await base44.asServiceRole.entities.ServiceProvider.update(service_provider_id, {
        status_verificacao: "em_analise_manual",
        relatorio_verificacao: "Dados (nome, nome da mãe ou data de nascimento) não conferem com o CPF informado — revisar cadastro.",
        data_verificacao: new Date().toISOString(),
      });
      const pendentes608 = await base44.asServiceRole.entities.Verificacao.filter({
        provider_id: service_provider_id,
        verification_type: 'background_check',
      });
      const jaPendente608 = (pendentes608 || []).find((item) =>
        ['pending', 'in_progress', 'pending_review'].includes(item.status)
      );
      if (!jaPendente608?.id) {
        await base44.asServiceRole.entities.Verificacao.create({
          provider_id: service_provider_id,
          verification_type: 'background_check',
          status: 'pending',
          result: 'Dados não conferem com o CPF na Receita Federal (Infosimples code 608) — aguardando revisão manual do admin.',
        });
      }
      return Response.json({
        success: false,
        error: "Dados (nome, nome da mãe ou data de nascimento) não conferem com o CPF informado na Receita Federal. Revise o cadastro.",
        api_code: 608,
        api_errors: apiData.errors,
        provider_id: service_provider_id,
      }, { status: 422 });
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
    let statusVerificacao = "aprovado";
    let relatorioVerificacao = "";

    if (conseguiuEmitirNegativa) {
      statusVerificacao = "aprovado";
      relatorioVerificacao = "Antecedentes verificados — etapa aprovada (nada consta).";
    } else {
      statusVerificacao = "reprovado";
      relatorioVerificacao = "Cadastro não autorizado após a consulta de antecedentes.";
    }

    await base44.asServiceRole.entities.ServiceProvider.update(service_provider_id, {
      status_verificacao: statusVerificacao,
      relatorio_verificacao: relatorioVerificacao,
      data_verificacao: new Date().toISOString(),
    });

    const verificationStatus = conseguiuEmitirNegativa ? 'approved' : 'rejected';
    const verificationRows = await base44.asServiceRole.entities.Verificacao.filter({
      provider_id: service_provider_id,
      verification_type: 'background_check',
    });
    const pendingVerification = (verificationRows || []).find((item) =>
      ['pending', 'in_progress', 'pending_review'].includes(item.status)
    );
    const verificationData = {
      status: verificationStatus,
      result: conseguiuEmitirNegativa ? 'Etapa concluída.' : 'Cadastro não autorizado.',
      verified_at: new Date().toISOString(),
    };
    if (pendingVerification?.id) {
      await base44.asServiceRole.entities.Verificacao.update(pendingVerification.id, verificationData);
    } else {
      await base44.asServiceRole.entities.Verificacao.create({
        provider_id: service_provider_id,
        verification_type: 'background_check',
        ...verificationData,
      });
    }

    return Response.json({
      success: true,
      provider_id: service_provider_id,
      status_verificacao: statusVerificacao,
      relatorio: relatorioVerificacao,
      mensagem: conseguiuEmitirNegativa
        ? "Antecedentes criminais verificados — Nada Consta"
        : "Seu cadastro não foi autorizado.",
    });

  } catch (error) {
    console.error("[verificarAntecedentes] Error:", (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});