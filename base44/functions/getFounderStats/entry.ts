import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── getFounderStats ──────────────────────────────────────────────────────────
// Contador server-side e auditável de vagas Fundador. ÚNICO DTO público sobre o
// programa — não expõe email, nome, provider_id nem registro individual.
//
// FONTE DE VERDADE:
//   1. FounderSlot (preferencial): conta slots consumidos (não 'available').
//      Garantia de máximo 100 e rastreamento de posições revogadas.
//   2. FounderGrant (legado/fallback): usado enquanto initFounderSlots não foi chamado.
//
// REGRA COMERCIAL IMUTÁVEL:
//   taken = total permanentemente consumido (active + revoked).
//   Posições revogadas NÃO voltam ao pool.
//   Exemplo: 100 grants, 10 cancelados → taken=100, active=90, remaining=0, open=false.
//
// CONTRATO (sempre HTTP 200 — fail-closed para evitar estado otimista):
//   Sucesso:       { taken, active, remaining, limit, open, available: true,  unavailable: false }
//   Indisponível:  { taken: null, active: null, remaining: null, limit, open: false, unavailable: true }

const FOUNDER_LIMIT = 100;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ─── Tenta FounderSlot (fonte primária) ──────────────────────────────────
    let taken: number;
    let active: number;
    let source: string;

    try {
      const slots = await base44.asServiceRole.entities.FounderSlot.list('position', 200);
      const allSlots: any[] = slots || [];

      if (allSlots.length > 0) {
        // FounderSlots inicializados — fonte autoritativa
        taken = allSlots.filter((s) => s.status !== 'available').length;
        active = allSlots.filter((s) => s.status === 'granted').length;
        source = 'founder_slot';
      } else {
        // Slots ainda não inicializados — fallback para FounderGrant (sistema legado)
        const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
        const allGrants: any[] = grants || [];
        taken = allGrants.length;
        active = allGrants.filter((g) => g.status === 'active').length;
        source = 'founder_grant_legacy';
        console.warn('[getFounderStats] FounderSlots não inicializados — usando fallback FounderGrant. Execute initFounderSlots como admin.');
      }
    } catch (slotErr) {
      // Se FounderSlot falhar, tenta FounderGrant como fallback
      console.warn('[getFounderStats] Erro ao ler FounderSlot, tentando FounderGrant:', (slotErr as Error).message);
      const grants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
      const allGrants: any[] = grants || [];
      taken = allGrants.length;
      active = allGrants.filter((g: any) => g.status === 'active').length;
      source = 'founder_grant_fallback';
    }

    return Response.json({
      taken,
      active,
      remaining: Math.max(0, FOUNDER_LIMIT - taken),
      limit: FOUNDER_LIMIT,
      open: taken < FOUNDER_LIMIT,
      available: true,   // Resposta bem-sucedida
      unavailable: false,
      // source omitido do payload público — informativo apenas em logs
    });

  } catch (error) {
    console.error('[getFounderStats] erro ao consultar disponibilidade:', (error as Error).message);

    // Fail-closed: nunca inventar vagas quando a consulta falhou
    return Response.json({
      taken: null,
      active: null,
      remaining: null,
      limit: FOUNDER_LIMIT,
      open: false,
      available: false,
      unavailable: true,
      error: 'FOUNDER_STATS_UNAVAILABLE',
    });
  }
});
