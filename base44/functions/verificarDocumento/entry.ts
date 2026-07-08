import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prestadorId, documentUrl, selfieUrl } = await req.json();

    // Validar que o usuário está verificando a si mesmo
    if (user.id !== prestadorId) {
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

    const analysis = await base44.integrations.Core.InvokeLLM({
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
    let shouldApprove = false;

    if (
      analysis.recommendation === 'approve' &&
      analysis.document_valid &&
      analysis.document_legible &&
      analysis.face_match &&
      analysis.confidence_score >= 85
    ) {
      verificationStatus = 'approved';
      message = 'Identidade verificada com sucesso!';
      shouldApprove = true;
    } else if (analysis.recommendation === 'manual_review') {
      verificationStatus = 'pending_review';
      message = 'Documento requer análise manual. Você receberá um email em breve.';
    } else {
      verificationStatus = 'rejected';
      message = analysis.issues?.length > 0
        ? `Verificação falhou: ${analysis.issues.join(', ')}`
        : 'Documento não passou na verificação de identidade.';
    }

    // Se aprovado, atualizar perfil do prestador
    if (shouldApprove) {
      try {
        // Atualizar ServiceProvider com status de verificado
        const providers = await base44.entities.ServiceProvider.filter({
          email: user.email,
        });

        if (providers && providers.length > 0) {
          const provider = providers[0];
          await base44.entities.ServiceProvider.update(provider.id, {
            verified: true,
            verification_date: new Date().toISOString(),
          });

          // Criar registro de verificação bem-sucedida
          await base44.entities.Verificacao.create({
            provider_id: provider.id,
            verification_type: 'identity',
            status: 'approved',
            result: `Documento: ${analysis.document_type}, Confiança: ${analysis.confidence_score}%`,
            verified_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
          });

          console.log(`Provider ${provider.id} verified successfully`);
        }
      } catch (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        // Não falhar a verificação se houver erro na atualização
      }
    } else if (verificationStatus === 'rejected') {
      // Criar registro de verificação rejeitada
      try {
        const providers = await base44.entities.ServiceProvider.filter({
          email: user.email,
        });

        if (providers && providers.length > 0) {
          const provider = providers[0];
          await base44.entities.Verificacao.create({
            provider_id: provider.id,
            verification_type: 'identity',
            status: 'rejected',
            result: `Razão: ${message}. Problemas: ${analysis.issues?.join(', ') || 'Análise de rosto falhou'}`,
            verified_at: new Date().toISOString(),
          });
        }
      } catch (errorLogError) {
        console.error('Erro ao registrar rejeição:', errorLogError);
      }
    }

    return Response.json({
      status: shouldApprove ? 'approved' : verificationStatus,
      message,
      details: {
        document_type: analysis.document_type,
        confidence_score: analysis.confidence_score,
        face_match: analysis.face_match,
        document_valid: analysis.document_valid,
      },
      issues: analysis.issues || [],
      recommendation: analysis.recommendation,
    });
  } catch (error) {
    console.error('Error in verificarDocumento:', error);
    return Response.json(
      {
        error: 'Verification failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
});