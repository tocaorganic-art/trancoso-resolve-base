// ⚠️ STRIPE DESATIVADO — migrado para Mercado Pago
// A auto-captura de pagamentos em custódia (escrow) será reimplementada
// com Mercado Pago Marketplace/Split quando o fluxo de pagamento de serviços for ativado.
// Por enquanto, esta function é um no-op seguro.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Busca pagamentos pendentes (status: pending no novo schema MP)
    const pendingPayments = await base44.asServiceRole.entities.Payment.filter({
      status: 'pending',
    }).catch(() => []);

    console.log(`[autoCapturaEscrow] ${pendingPayments.length} pagamentos pendentes (no-op — MP migration pendente)`);

    return Response.json({
      ok: true,
      captured: 0,
      errors: 0,
      checked: pendingPayments.length,
      note: 'Stripe escrow desativado. Migração para Mercado Pago pendente.',
    });
  } catch (error) {
    console.error('[autoCapturaEscrow] Erro:', error.message);
    return Response.json({ ok: true, note: 'no-op' });
  }
});