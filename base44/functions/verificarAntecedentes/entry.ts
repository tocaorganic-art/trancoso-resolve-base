import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { service_provider_id } = await req.json();

    if (!service_provider_id) {
      return Response.json({ error: 'service_provider_id é obrigatório' }, { status: 400 });
    }

    // SEGURANÇA: Verifica se o usuário autenticado é admin ou o próprio prestador
    // NOTA: service_provider_id é o ID do registro ServiceProvider, não o user.id
    // Precisamos checar se o provider pertence ao usuário autenticado via created_by
    const userRole = user?.role;
    const isAdmin = userRole === 'admin';
    console.log(`[verificarAntecedentes] user.email=${user?.email} role=${userRole} provider_id=${service_provider_id}`);

    if (!isAdmin) {
      // Verifica ownership via created_by
      const ownProviders = await base44.entities.ServiceProvider.filter({ created_by: user.email });
      const isOwner = ownProviders.some(p => p.id === service_provider_id);
      if (!isOwner) {
        console.error(`[verificarAntecedentes] 403 - user ${user.email} não é dono do provider ${service_provider_id}`);
        return Response.json({ error: 'Sem permissão para verificar este prestador' }, { status: 403 });
      }
    }

    // Busca o prestador
    const providers = await base44.asServiceRole.entities.ServiceProvider.filter({});
    const prestador = providers.find(p => p.id === service_provider_id);

    if (!prestador) {
      return Response.json({ error: 'Prestador não encontrado' }, { status: 404 });
    }

    // Se não tiver CPF, marca para análise manual
    if (!prestador.cpf) {
      await base44.asServiceRole.entities.ServiceProvider.update(service_provider_id, {
        status_verificacao: 'em_analise_manual',
        relatorio_verificacao: 'CPF não informado. Verificação automática não pôde ser realizada. Necessária análise manual.',
        data_verificacao: new Date().toISOString(),
      });
      console.log(`[verificarAntecedentes] CPF ausente para ${prestador.full_name} (${service_provider_id})`);
      return Response.json({ status: 'em_analise_manual', message: 'CPF não encontrado, análise manual necessária' });
    }

    const INFOSIMPLES_API_KEY = Deno.env.get('INFOSIMPLES_API_KEY');

    if (!INFOSIMPLES_API_KEY) {
      console.error('[verificarAntecedentes] INFOSIMPLES_API_KEY não configurada');
      return Response.json({ error: 'INFOSIMPLES_API_KEY não configurada' }, { status: 500 });
    }

    const headers = {
      'Authorization': `Token token=${INFOSIMPLES_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const cpfLimpo = prestador.cpf.replace(/\D/g, '');
    const bodyBase = { cpf: cpfLimpo, nome: prestador.full_name };
    const uf = prestador.location?.state || '';
    const resultados = [];

    // 1. Sempre: Polícia Federal
    try {
      const pfRes = await fetch(
        'https://api.infosimples.com/api/v2/consultas/antecedentes-criminais/policia-federal/emitir',
        { method: 'POST', headers, body: JSON.stringify(bodyBase) }
      );
      const pfData = await pfRes.json();
      console.log(`[PF] code=${pfData?.code} status=${pfData?.data_status}`);
      resultados.push({ fonte: 'Polícia Federal', data: pfData });
    } catch (err) {
      console.error('[PF] Erro:', err.message);
      resultados.push({ fonte: 'Polícia Federal', erro: true, mensagem: err.message });
    }

    // 2. SP
    if (uf === 'SP') {
      try {
        const spRes = await fetch(
          'https://api.infosimples.com/api/v2/consultas/antecedentes-criminais/sp',
          { method: 'POST', headers, body: JSON.stringify(bodyBase) }
        );
        const spData = await spRes.json();
        console.log(`[SP] code=${spData?.code} status=${spData?.data_status}`);
        resultados.push({ fonte: 'SP', data: spData });
      } catch (err) {
        console.error('[SP] Erro:', err.message);
        resultados.push({ fonte: 'SP', erro: true, mensagem: err.message });
      }
    }

    // 3. MG
    if (uf === 'MG') {
      try {
        const mgRes = await fetch(
          'https://api.infosimples.com/api/v2/consultas/antecedentes-criminais/mg',
          { method: 'POST', headers, body: JSON.stringify(bodyBase) }
        );
        const mgData = await mgRes.json();
        console.log(`[MG] code=${mgData?.code} status=${mgData?.data_status}`);
        resultados.push({ fonte: 'MG', data: mgData });
      } catch (err) {
        console.error('[MG] Erro:', err.message);
        resultados.push({ fonte: 'MG', erro: true, mensagem: err.message });
      }
    }

    // 4. CEIS e CNEP no Portal da Transparência (apenas para PJ com ponto físico)
    // Nota: Portal da Transparência é público, não requer chave de API
    if (prestador.tipo_pessoa === 'pj' && prestador.tem_ponto_fisico_em_trancoso && prestador.cnpj) {
      const cnpjLimpo = prestador.cnpj.replace(/\D/g, '');
      try {
        const ceisRes = await fetch(
          `https://api.portaldatransparencia.gov.br/api-de-dados/ceis?cnpjSancionado=${cnpjLimpo}&pagina=1`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (ceisRes.ok) {
          const ceisData = await ceisRes.json();
          if (ceisData && ceisData.length > 0) {
            resultados.push({ fonte: 'CEIS (Portal Transparência)', data: ceisData, temRegistro: true });
            console.log(`[CEIS] Registros encontrados para CNPJ ${cnpjLimpo}: ${ceisData.length}`);
          } else {
            resultados.push({ fonte: 'CEIS (Portal Transparência)', data: [], temRegistro: false });
          }
        }
      } catch (err) {
        console.error('[CEIS] Erro:', err.message);
        resultados.push({ fonte: 'CEIS (Portal Transparência)', erro: true, mensagem: err.message });
      }
    }

    // 4b. CNPJ na Receita Federal (se houver)
    if (prestador.cnpj) {
      const cnpjLimpo = prestador.cnpj.replace(/\D/g, '');
      try {
        const receitaRes = await fetch(
          'https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj',
          { method: 'POST', headers, body: JSON.stringify({ cnpj: cnpjLimpo }) }
        );
        const receitaData = await receitaRes.json();
        console.log(`[CNPJ] code=${receitaData?.code} situacao=${receitaData?.data?.[0]?.situacao_cadastral}`);
        resultados.push({ fonte: 'Receita Federal CNPJ', data: receitaData });

        // Atualiza status da empresa separadamente
        const situacao = receitaData?.data?.[0]?.situacao_cadastral;
        const statusEmpresa = situacao === 'ATIVA' ? 'regular' : (situacao ? 'em_risco' : 'pendente');
        const relatorioEmpresa = situacao
          ? `Situação cadastral na Receita Federal: ${situacao}`
          : 'Situação cadastral não encontrada.';
        await base44.asServiceRole.entities.ServiceProvider.update(service_provider_id, {
          status_verificacao_empresa: statusEmpresa,
          relatorio_verificacao_empresa: relatorioEmpresa,
        });
      } catch (err) {
        console.error('[CNPJ] Erro:', err.message);
        resultados.push({ fonte: 'Receita Federal CNPJ', erro: true, mensagem: err.message });
      }
    }

    // 5. Classificar resultado
    const temErro = resultados.some(r => r.erro === true);

    const temAntecedente = resultados.some(r => {
      if (r.erro || !r.data) return false;
      if (r.fonte === 'Receita Federal CNPJ') return false;
      if (r.fonte === 'CEIS (Portal Transparência)') return r.temRegistro === true;
      const item = r.data?.data?.[0];
      if (!item) return false;
      const txt = JSON.stringify(item).toLowerCase();
      return (
        item.nada_consta === false ||
        item.possui_antecedentes === true ||
        item.resultado === 'positivo' ||
        item.condenacao === true ||
        (txt.includes('condenação') && !txt.includes('nada consta')) ||
        (txt.includes('antecedentes') && !txt.includes('nada consta') && !txt.includes('sem registro'))
      );
    });

    const cnpjIrregular = resultados.some(r =>
      r.fonte === 'Receita Federal CNPJ' &&
      r.data?.data?.[0]?.situacao_cadastral &&
      r.data.data[0].situacao_cadastral !== 'ATIVA'
    );

    let status_verificacao = 'aprovado';
    let relatorio_verificacao = '';

    if (temAntecedente) {
      status_verificacao = 'reprovado';
      relatorio_verificacao = 'Foram encontrados registros de antecedentes criminais em bases oficiais. Perfil bloqueado para proteção da comunidade.';
    } else if (temErro || cnpjIrregular) {
      status_verificacao = 'em_analise_manual';
      const motivos = [];
      if (temErro) motivos.push('erro em uma das bases consultadas');
      if (cnpjIrregular) motivos.push('CNPJ com situação irregular na Receita Federal');
      relatorio_verificacao = `Verificação com inconsistências (${motivos.join(', ')}). Necessária análise manual pela equipe.`;
    } else {
      status_verificacao = 'aprovado';
      const bases = ['Polícia Federal'];
      if (uf === 'SP') bases.push('IIRGD-SP');
      if (uf === 'MG') bases.push('PCMG');
      relatorio_verificacao = `Nenhum antecedente criminal encontrado. Bases consultadas: ${bases.join(', ')}.`;
    }

    // 6. Atualiza prestador
    await base44.asServiceRole.entities.ServiceProvider.update(service_provider_id, {
      status_verificacao,
      relatorio_verificacao,
      data_verificacao: new Date().toISOString(),
    });

    console.log(`[verificarAntecedentes] Concluído: ${prestador.full_name} → ${status_verificacao}`);

    return Response.json({
      status: status_verificacao,
      relatorio: relatorio_verificacao,
      provider_id: service_provider_id,
      bases_consultadas: resultados.map(r => r.fonte),
    });

  } catch (error) {
    console.error('[verificarAntecedentes] Erro geral:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});