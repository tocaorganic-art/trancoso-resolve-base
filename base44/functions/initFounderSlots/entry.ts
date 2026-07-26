import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── initFounderSlots ────────────────────────────────────────────────────────
// Função administrativa ONE-TIME. Cria os 100 FounderSlots (posições 1-100)
// e reconcilia FounderGrants já existentes (criados pelo sistema legado).
//
// QUANDO CHAMAR:
//   POST /functions/initFounderSlots  (admin autenticado)
//   Chamar uma única vez após o primeiro deploy com a entidade FounderSlot.
//   Subsequentes chamadas são seguras — idempotente.
//
// O QUE FAZ:
//   1. Verifica se os 100 slots já existem → se sim, só retorna o status.
//   2. Para cada posição 1–100:
//      a. Se já existe slot com essa posição → mantém.
//      b. Verifica se há FounderGrant com essa posição (legado):
//         - active grant → slot.status = 'granted'
//         - revoked grant → slot.status = 'revoked'
//         - nenhum grant → slot.status = 'available'
//      c. Cria o slot com o status correto.
//   3. Retorna relatório completo (sem PII).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ─── Autenticação: somente admin ─────────────────────────────────────────
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Não autorizado. Apenas admins podem inicializar os FounderSlots.' }, { status: 403 });
    }

    // ─── 1. Lê estado atual ───────────────────────────────────────────────────
    const existingSlots = await base44.asServiceRole.entities.FounderSlot.list('position', 200);
    const slots: any[] = existingSlots || [];
    const existingPositions = new Set(slots.map((s: any) => s.position));

    // Lê todos os FounderGrants existentes (sistema legado)
    const existingGrants = await base44.asServiceRole.entities.FounderGrant.list('-granted_at', 200);
    const grants: any[] = existingGrants || [];

    // Mapa: position → grant
    const grantByPosition = new Map<number, any>();
    for (const g of grants) {
      if (g.position) grantByPosition.set(g.position, g);
    }

    // ─── 2. Cria slots ausentes ───────────────────────────────────────────────
    const created: number[] = [];
    const skipped: number[] = [];
    const errors: { position: number; error: string }[] = [];

    for (let pos = 1; pos <= 100; pos++) {
      if (existingPositions.has(pos)) {
        skipped.push(pos);
        continue;
      }

      // Determina status baseado em grant legado existente
      const legacyGrant = grantByPosition.get(pos);
      let status = 'available';
      let providerId: string | undefined;
      let grantedAt: string | undefined;
      let revokedAt: string | undefined;
      let idempotencyKey: string | undefined;

      if (legacyGrant) {
        providerId = legacyGrant.provider_id;
        if (legacyGrant.status === 'active') {
          status = 'granted';
          grantedAt = legacyGrant.granted_at;
          idempotencyKey = `legacy:${legacyGrant.provider_id}`;
        } else if (legacyGrant.status === 'revoked') {
          status = 'revoked';
          grantedAt = legacyGrant.granted_at;
          revokedAt = legacyGrant.revoked_at;
          idempotencyKey = `legacy:${legacyGrant.provider_id}`;
        }
      }

      try {
        await base44.asServiceRole.entities.FounderSlot.create({
          position: pos,
          status,
          ...(providerId ? { provider_id: providerId } : {}),
          ...(grantedAt ? { granted_at: grantedAt } : {}),
          ...(revokedAt ? { revoked_at: revokedAt } : {}),
          ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
          promotion_version: 'prestador_fundador_v1',
        });
        created.push(pos);
      } catch (err) {
        errors.push({ position: pos, error: (err as Error).message });
        console.error(`[initFounderSlots] Erro ao criar slot ${pos}:`, (err as Error).message);
      }
    }

    // ─── 3. Relatório final ───────────────────────────────────────────────────
    const finalSlots = await base44.asServiceRole.entities.FounderSlot.list('position', 200);
    const finalArr: any[] = finalSlots || [];

    const report = {
      ok: errors.length === 0,
      total_slots: finalArr.length,
      available: finalArr.filter((s: any) => s.status === 'available').length,
      granted: finalArr.filter((s: any) => s.status === 'granted').length,
      revoked: finalArr.filter((s: any) => s.status === 'revoked').length,
      pending_reconciliation: finalArr.filter((s: any) => s.status === 'pending_reconciliation').length,
      created_in_this_run: created.length,
      skipped_already_existed: skipped.length,
      errors: errors.length,
      error_details: errors.length > 0 ? errors : undefined,
      legacy_grants_reconciled: grantByPosition.size,
    };

    console.log('[initFounderSlots] Concluído:', JSON.stringify(report));
    return Response.json(report);

  } catch (error) {
    console.error('[initFounderSlots] Erro:', (error as Error).message);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
