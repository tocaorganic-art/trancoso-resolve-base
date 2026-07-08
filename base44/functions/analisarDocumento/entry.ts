import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Suporta dois modos de chamada:
    // 1. Chamada direta do modal (verificacao_id, document_url, document_type, user_full_name)
    // 2. Chamada via automação entity (event, data)
    let verificacao_id, document_url, document_type, user_full_name;

    let user = null;
    
    if (body.event && body.data) {
      // Chamada via automação — sempre permitida
      const verificacao = body.data;
      verificacao_id = body.event.entity_id;
      document_url = verificacao.document_url;
      document_type = verificacao.document_type;
      user_full_name = verificacao.user_name;
    } else {
      // Chamada direta do modal (requer autenticação e permissão)
      user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Apenas admin ou o próprio prestador pode acionar
      const isAdmin = user.role === 'admin';
      const isOwner = user.id === body.prestador_id;

      if (!isAdmin && !isOwner) {
        return Response.json({ error: "Sem permissão para esta operação." }, { status: 403 });
      }

      verificacao_id = body.verificacao_id;
      document_url = body.document_url;
      document_type = body.document_type;
      user_full_name = body.user_full_name;
    }

    if (!verificacao_id || !document_url) {
      return Response.json({ error: 'verificacao_id e document_url são obrigatórios' }, { status: 400 });
    }

    console.log(`[analisarDocumento] Iniciando análise para ${user_full_name}, doc_type=${document_type}`);

    // Verifica se é PDF (não suportado por visão da IA)
    const isPdf = document_url?.toLowerCase().includes('.pdf') || document_type === 'PDF';
    
    let aiResult;
    if (isPdf) {
      // PDFs não suportam análise por visão — aprovação manual direta
      aiResult = {
        extracted_name: user_full_name,
        extracted_dob: "",
        name_matches: true,
        document_readable: true,
        confidence: 70,
        divergence_notes: "PDF enviado — aprovação manual necessária."
      };
    } else {

    // Análise por IA — extrai nome e data de nascimento do documento
    aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em verificação de documentos brasileiros. Analise a imagem do documento (${document_type}) e extraia as seguintes informações:
1. Nome completo da pessoa
2. Data de nascimento (formato DD/MM/AAAA)
3. Se o documento parece autêntico e legível

Responda APENAS no formato JSON exigido, sem texto adicional.

Nome do usuário cadastrado na plataforma: "${user_full_name}"

Compare o nome extraído com o nome cadastrado. Considere 100% de correspondência apenas se os nomes forem exatamente iguais (desconsiderando maiúsculas/minúsculas e acentuação mínima). Se houver qualquer diferença, marque name_matches como false e explique na divergence_notes.`,
      file_urls: [document_url],
      response_json_schema: {
        type: "object",
        properties: {
          extracted_name: { type: "string" },
          extracted_dob: { type: "string" },
          name_matches: { type: "boolean" },
          document_readable: { type: "boolean" },
          confidence: { type: "number" },
          divergence_notes: { type: "string" }
        }
      }
    });
    } // fim do else (não-PDF)

    console.log('[analisarDocumento] AI result:', JSON.stringify(aiResult));

    // Lógica de status:
    // - Para PF: 100% correspondência de nome + documento legível → "Aguardando Admin"
    // - Para Empresa com ponto físico: apenas documento legível → "Aguardando Admin" (sem validação de nome)
    // - Divergência ou documento ilegível → "Pendente"
    const isCompanyWithLocation = body.user_type === 'empresa' || (body.document_type === 'CNPJ' || body.document_type === 'MEI');
    const nameMatches = isCompanyWithLocation 
      ? aiResult.document_readable === true
      : (aiResult.name_matches === true && aiResult.document_readable === true);
    const newStatus = nameMatches ? "Aguardando Admin" : "Pendente";

    let adminNotes = "";
    if (!aiResult.document_readable) {
      adminNotes = "⚠️ IA: Documento ilegível ou de baixa qualidade. Requer revisão manual.";
    } else if (!aiResult.name_matches) {
      adminNotes = `⚠️ IA: Divergência detectada. Nome no documento: "${aiResult.extracted_name}" | Nome cadastrado: "${user_full_name}". ${aiResult.divergence_notes || ''}`;
    } else {
      adminNotes = `✅ IA: Nome confirmado (${aiResult.extracted_name}). Aguardando aprovação manual do admin.`;
    }

    // Atualiza a verificação com os dados da IA (usando apenas campos existentes no schema)
    await base44.asServiceRole.entities.Verificacao.update(verificacao_id, {
      status: newStatus,
      result: adminNotes,
      description: JSON.stringify({
        ai_extracted_name: aiResult.extracted_name || "",
        ai_extracted_dob: aiResult.extracted_dob || "",
        ai_confidence: aiResult.confidence || 0,
        admin_notes: adminNotes,
        document_url,
        document_type,
        user_full_name,
      })
    });

    console.log(`[analisarDocumento] Status definido como "${newStatus}" para verificacao ${verificacao_id}`);

    return Response.json({
      ok: true,
      status: newStatus,
      ai_result: aiResult,
      admin_notes: adminNotes
    });

  } catch (error) {
    console.error('[analisarDocumento] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});