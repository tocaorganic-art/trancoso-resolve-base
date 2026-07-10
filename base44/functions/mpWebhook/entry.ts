import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ─── Webhook do Mercado Pago ──────────────────────────────────────────────────
// Configure a URL deste webhook no painel do MP:
// https://www.mercadopago.com.br/developers/panel/app → Webhooks
// URL: https://[seu-app].base44.app/functions/mpWebhook
// Eventos a assinar: subscription_preapproval, payment

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();
    console.log('[mpWebhook] Evento recebido:', JSON.stringify(body));

    const { type, action, data } = body;

    // ─── Assinaturas (Preapproval) ────────────────────────────────────────────
    if (type === 'subscription_preapproval') {
      const preapprovalId = data?.id;
      if (!preapprovalId) return Response.json({ received: true });

      // Busca detalhes do preapproval no MP
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const preapproval = await mpRes.json();

      if (!mpRes.ok) {
        console.error('[mpWebhook] Erro ao buscar preapproval:', preapproval);
        return Response.json({ error: 'preapproval not found' }, { status: 400 });
      }

      const userEmail = preapproval.payer_email || preapproval.external_reference;
      if (!userEmail) {
        console.warn('[mpWebhook] preapproval sem email:', preapprovalId);
        return Response.json({ received: true });
      }

      const today = new Date().toISOString().split('T')[0];
      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });

      const mpStatus = preapproval.status; // authorized, cancelled, paused, pending

      const statusMap: Record<string, string> = {
        authorized: 'active',
        cancelled: 'cancelled',
        paused: 'expired',
        pending: 'pending',
      };
      const newStatus = statusMap[mpStatus] || mpStatus;

      // Calcula próxima cobrança (MP retorna next_payment_date em alguns casos)
      const nextBilling = preapproval.auto_recurring?.start_date || null;

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: newStatus,
          payment_method: 'mercadopago',
          mp_preapproval_id: preapprovalId,
          next_billing_date: nextBilling || existing[0].next_billing_date,
          subscription_start: existing[0].subscription_start || today,
        });
      } else {
        // Determina o plano pelo valor
        const amount = preapproval.auto_recurring?.transaction_amount || 0;
        let plan = 'gratuito';
        if (amount >= 190) plan = 'elite';
        else if (amount >= 19) plan = 'profissional';

        await base44.asServiceRole.entities.Subscription.create({
          user_email: userEmail,
          plan,
          status: newStatus,
          amount,
          payment_method: 'mercadopago',
          mp_preapproval_id: preapprovalId,
          subscription_start: today,
          next_billing_date: nextBilling,
        });
      }

      console.log(`[mpWebhook] Preapproval ${preapprovalId} → status: ${newStatus} | email: ${userEmail}`);
    }

    // ─── Pagamentos individuais ───────────────────────────────────────────────
    if (type === 'payment') {
      const paymentId = data?.id;
      if (!paymentId || !MP_ACCESS_TOKEN) return Response.json({ received: true });

      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const payment = await mpRes.json();

      if (!mpRes.ok) {
        console.error('[mpWebhook] Erro ao buscar payment:', payment);
        return Response.json({ received: true });
      }

      const externalRef = payment.external_reference;
      if (externalRef) {
        const payments = await base44.asServiceRole.entities.Payment.filter({ request_id: externalRef });
        if (payments.length > 0) {
          const statusMap: Record<string, string> = {
            approved: 'captured',
            rejected: 'canceled',
            cancelled: 'canceled',
            refunded: 'refunded',
            in_process: 'pending',
            pending: 'pending',
          };
          const newStatus = statusMap[payment.status] || payment.status;
          await base44.asServiceRole.entities.Payment.update(payments[0].id, {
            status: newStatus,
            mp_payment_id: String(paymentId),
            ...(newStatus === 'captured' ? { captured_at: new Date().toISOString() } : {}),
          });
          console.log(`[mpWebhook] Payment ${paymentId} → status: ${newStatus}`);
        }
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('[mpWebhook] Erro:', error.message);
    // Retorna 200 mesmo com erro para o MP não reenviar
    return Response.json({ received: true });
  }
});
