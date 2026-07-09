import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Cancela pagamento de serviço (escrow)
// Nota: o cancelamento financeiro real depende do gateway usado para criarPagamentoServico.
// Se migrado para MP, o reembolso deve ser feito via MP Payments API.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { payment_id, request_id, reason } = body;

    if (!payment_id && !request_id) {
      return Response.json({ error: 'payment_id ou request_id obrigatório' }, { status: 400 });
    }

    let payments;
    if (payment_id) {
      payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
    } else {
      payments = await base44.asServiceRole.entities.Payment.filter({ request_id });
    }

    if (!payments || payments.length === 0) {
      return Response.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    const payment = payments[0];

    if (payment.client_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const cancelableStatuses = ['pending', 'requires_capture', 'authorized'];
    if (!cancelableStatuses.includes(payment.status)) {
      return Response.json({
        error: `Pagamento com status "${payment.status}" não pode ser cancelado`,
      }, { status: 400 });
    }

    // ─── Atualiza status no Base44 ────────────────────────────────────────────
    await base44.asServiceRole.entities.Payment.update(payment.id, {
      status: 'canceled',
      notes: reason ? `Cancelado: ${reason}` : 'Cancelado pelo usuário',
    });

    // ─── Atualiza ServiceRequest se existir ──────────────────────────────────
    if (payment.request_id) {
      try {
        await base44.asServiceRole.entities.ServiceRequest.update(payment.request_id, {
          status: 'Cancelado',
        });
      } catch (e) {
        console.warn(`[cancelarPagamento] Não foi possível atualizar ServiceRequest ${payment.request_id}: ${e.message}`);
      }
    }

    console.log(`[cancelarPagamento] Pagamento ${payment.id} cancelado`);

    // ⚠️ NOTA: Se o pagamento foi processado via MP, o reembolso financeiro precisa
    // ser feito manualmente no painel do Mercado Pago ou via API de reembolso:
    // POST https://api.mercadopago.com/v1/payments/{id}/refunds
    // Isso será implementado quando criarPagamentoServico for migrado para MP.

    return Response.json({ ok: true, status: 'canceled' });

  } catch (error) {
    console.error('[cancelarPagamento] Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
