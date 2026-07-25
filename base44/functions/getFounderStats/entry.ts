import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Contador server-side e auditável de vagas de Prestador Fundador.
// Conta apenas FounderGrant com status='active' — ou seja, prestadores que
// concluíram cadastro, foram aprovados na verificação e receberam o selo.
// Não conta cadastros incompletos, rejeitados, duplicados ou revogados.

const FOUNDER_LIMIT = 100;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
    const taken = (grants || []).filter((g: { status?: string }) => g.status === 'active').length;

    return Response.json({
      taken,
      remaining: Math.max(0, FOUNDER_LIMIT - taken),
      limit: FOUNDER_LIMIT,
      open: taken < FOUNDER_LIMIT,
    });
  } catch (error) {
    console.error('[getFounderStats] erro:', (error as Error).message);
    // Em caso de erro, não quebra a UI — retorna limite cheio de forma conservadora
    return Response.json({
      taken: 0,
      remaining: FOUNDER_LIMIT,
      limit: FOUNDER_LIMIT,
      open: true,
    });
  }
});