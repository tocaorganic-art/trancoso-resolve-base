import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prestadorId, documentUrl, selfieUrl } = await req.json();

    const provider = await base44.entities.ServiceProvider.get(prestadorId);
    const canVerify = user.role === 'admin'
      || provider?.created_by === user.email
      || provider?.email === user.email;
    if (!provider || !canVerify) {
      return Response.json({ error: 'Forbidden - Can only verify own profile' }, { status: 403 });
    }

    // Chamar IA para análise de documentos
    const analysisPrompt = `Você é um especialista em verificação de identidade. Analise:
1. Primeira imagem: documento de identidade (RG/CNH/Passaporte)
2. Segunda imagem: selfie da pessoa

Verifique:
- O documento é legível e autentico?
- A foto do documento está clara e bem iluminada?
- O rosto na selfie corresponde ao rosto do documento?
- A selfie foi tirada recentemente (sem máscaras, acessórios que cobrem rosto)?

Retorne um JSON com:
{
  "document_valid": boolean,
  "document_legible": boolean,
  "face_match": boolean,
  "document_type": string (RG, CNH, Passaporte),
  "confidence_score": number (0-100),
  "issues": [string array de problemas encontrados],
  "recommendation": "approve" | "reject" | "manual_review"
}`;

    const analysis: any = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: [documentUrl, selfieUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          document_valid: { type: 'boolean' },
          document_legible: { type: 'boolean' },
          face_match: { type: 'boolean' },
          document_type: { type: 'string' },
          confidence_score: { type: 'number' },
          issues: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string', enum: ['approve', 'reject', 'manual_review'] },
        },
      },
    });

    console.log('Document analysis result:', analysis);

    // Determinar status baseado na análise
    let verificationStatus = 'rejected';
    let message = 'Documento não passou nas verificações de segurança.';

    if (
      analysis.recommendation === 'approve' &&
      analysis.document_valid &&
      analysis.document_legible &&
      analysis.face_match &&
      analysis.confidence_score >= 85
    ) {
      verificationStatus = 'approved';
      message = 'A etapa de identidade foi concluída e seguirá para a fila de verificação.';
    } else if (analysis.recommendation === 'manual_review') {
      verificationStatus = 'pending_review';
      message = 'Sua solicitação está em análise pela equipe.';
    } else {
      verificationStatus = 'rejected';
      message = 'Seu cadastro não foi autorizado.';
    }

    const existing = await base44.entities.Verificacao.filter({
      provider_id: provider.id,
      verification_type: 'identity',
    });
    const pending = existing.find((item) => ['pending', 'in_progress', 'pending_review'].includes(item.status));
    const verificationData = {
      status: verificationStatus,
      result: `Documento: ${analysis.document_type || 'não identificado'}, confiança: ${analysis.confidence_score ?? 'n/a'}%`,
      verified_at: new Date().toISOString(),
      description: JSON.stringify({ document_url: documentUrl, selfie_url: selfieUrl }),
    };
    if (pending?.id) {
      await base44.entities.Verificacao.update(pending.id, verificationData);
    } else {
      await base44.entities.Verificacao.create({
        provider_id: provider.id,
        verification_type: 'identity',
        ...verificationData,
      });
    }

    // A liberação final ocorre somente no fluxo administrativo, após as duas etapas.
    await base44.entities.ServiceProvider.update(provider.id, { verified: false });

    return Response.json({
      status: verificationStatus,
      message,
    });
  } catch (error) {
    console.error('Error in verificarDocumento:', error);
    return Response.json(
      {
        error: 'Verification failed',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
});
