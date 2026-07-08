import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Função agendada: captura automaticamente pagamentos que passaram 48h sem confirmação do cliente
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verifica autenticação: apenas admin ou chamada interna (automação)
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const now = new Date().toISOString();

    console.log(`[autoCapturaEscrow] Executando às ${now}`);

    // Busca pagamentos que precisam de captura e passaram do prazo
    const pendingPayments = await base44.asServiceRole.entities.Payment.filter({
      status: 'requires_capture',
    });

    console.log(`[autoCapturaEscrow] Encontrados ${pendingPayments.length} pagamentos pendentes`);

    let captured = 0;
    let errors = 0;

    for (const payment of pendingPayments) {
      if (!payment.auto_capture_after) continue;

      const autoCaptureTime = new Date(payment.auto_capture_after);
      if (new Date() < autoCaptureTime) continue;

      console.log(`[autoCapturaEscrow] Auto-capturando payment ${payment.id} (prazo passou: ${payment.auto_capture_after})`);

      try {
        const capturedIntent = await stripe.paymentIntents.capture(payment.stripe_payment_intent_id);
        const chargeId = capturedIntent.latest_charge;

        await base44.asServiceRole.entities.Payment.update(payment.id, {
          status: 'captured',
          stripe_charge_id: chargeId || null,
          captured_at: new Date().toISOString(),
          notes: 'Auto-capturado após 48h sem confirmação do cliente',
        });

        if (payment.request_id) {
          await base44.asServiceRole.entities.ServiceRequest.update(payment.request_id, {
            status: 'Concluído',
          });
        }

        captured++;
        console.log(`[autoCapturaEscrow] Payment ${payment.id} capturado automaticamente`);

      } catch (err) {
        console.error(`[autoCapturaEscrow] Erro ao capturar ${payment.id}:`, err.message);
        errors++;

        // Marca como expirado se falhar
        if (err.message?.includes('canceled') || err.message?.includes('expired')) {
          await base44.asServiceRole.entities.Payment.update(payment.id, {
            status: 'canceled',
            notes: `Erro na auto-captura: ${err.message}`,
          });
        }
      }
    }

    console.log(`[autoCapturaEscrow] Concluído. Capturados: ${captured}, Erros: ${errors}`);

    return Response.json({ ok: true, captured, errors, checked: pendingPayments.length });

  } catch (error) {
    console.error('[autoCapturaEscrow] Erro geral:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});