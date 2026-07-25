import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Retorna o status de Fundador de um prestador específico pelo provider_id.
//
// SEGURANÇA:
// - Não expõe email, nome nem nenhum PII
// - Apenas retorna { is_founder: boolean, position: number | null }
// - Lê FounderGrant via asServiceRole (admin) e filtra por provider_id
// - Fail-closed: em erro, retorna is_founder: false (nunca inventa status positivo)
//
// Chamada pública — pode ser invocada sem autenticação.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body: { provider_id?: string } = {};
    try { body = await req.json(); } catch { /* payload vazio OK */ }

    const providerId = body?.provider_id;
    if (!providerId) {
      return Response.json({ is_founder: false, position: null });
    }

    // Busca grants ATIVOS para este provider_id
    const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
    const activeGrant = (grants || []).find(
      (g: { provider_id?: string; status?: string; position?: number }) =>
        g.provider_id === providerId && g.status === 'active'
    );

    if (activeGrant) {
      return Response.json({
        is_founder: true,
        position: activeGrant.position ?? null,
      });
    }

    return Response.json({ is_founder: false, position: null });
  } catch (error) {
    console.error('[getProviderFounderStatus] erro:', (error as Error).message);
    // Fail-closed: em erro não afirma status positivo
    return Response.json({ is_founder: false, position: null });
  }
});
