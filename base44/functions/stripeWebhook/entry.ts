import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const BASE_URL = Deno.env.get('BASE44_FUNCTION_URL') || 'https://trancosoresolve.com.br/api/functions';

async function notificarWhatsApp(base44: any, payload: {
  prestador_id?: string;
  tipo: string;
  telefone: string;
  mensagem: string;
  referencia_id?: string;
  referencia_tipo?: string;
}) {
  try {
    await base44.asServiceRole.functions.enviarMensagemWhatsApp(payload);
  } catch (err) {
    console.error('[stripeWebhook] falha ao enviar WhatsApp:', err.message);
  }
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Stripe webhook received:', event.type);

  const base44 = createClientFromRequest(req);

  try {
    // ─── Pagamento de Serviço (Payment Intent com captura manual) ───
    if (event.type === 'payment_intent.amount_capturable_updated') {
      const pi = event.data.object;
      const requestId = pi.metadata?.request_id;
      if (requestId) {
        const payments = await base44.asServiceRole.entities.Payment.filter({ stripe_payment_intent_id: pi.id });
        if (payments.length > 0) {
          await base44.asServiceRole.entities.Payment.update(payments[0].id, { status: 'requires_capture' });
          console.log(`PaymentIntent ${pi.id} pronto para captura`);
        }
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      if (pi.metadata?.request_id) {
        const payments = await base44.asServiceRole.entities.Payment.filter({ stripe_payment_intent_id: pi.id });
        if (payments.length > 0 && payments[0].status !== 'captured') {
          await base44.asServiceRole.entities.Payment.update(payments[0].id, {
            status: 'captured',
            stripe_charge_id: pi.latest_charge || null,
            captured_at: new Date().toISOString(),
          });
          console.log(`PaymentIntent ${pi.id} confirmado como capturado via webhook`);
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      if (pi.metadata?.request_id) {
        const payments = await base44.asServiceRole.entities.Payment.filter({ stripe_payment_intent_id: pi.id });
        if (payments.length > 0) {
          await base44.asServiceRole.entities.Payment.update(payments[0].id, {
            status: 'canceled',
            notes: `Falha no pagamento: ${pi.last_payment_error?.message || 'desconhecido'}`,
          });
        }
      }
    }

    if (event.type === 'payment_intent.canceled') {
      const pi = event.data.object;
      if (pi.metadata?.request_id) {
        const payments = await base44.asServiceRole.entities.Payment.filter({ stripe_payment_intent_id: pi.id });
        if (payments.length > 0) {
          await base44.asServiceRole.entities.Payment.update(payments[0].id, { status: 'canceled' });
        }
      }
    }

    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object;
      const chargeId = dispute.charge;
      const payments = await base44.asServiceRole.entities.Payment.filter({ stripe_charge_id: chargeId });
      if (payments.length > 0) {
        await base44.asServiceRole.entities.Payment.update(payments[0].id, {
          status: 'disputed',
          dispute_reason: dispute.reason,
        });
        console.log(`Disputa aberta para charge ${chargeId}: ${dispute.reason}`);
      }
    }

    if (event.type === 'account.updated') {
      const account = event.data.object;
      const stripeAccounts = await base44.asServiceRole.entities.ProviderStripeAccount.filter({ stripe_account_id: account.id });
      if (stripeAccounts.length > 0) {
        await base44.asServiceRole.entities.ProviderStripeAccount.update(stripeAccounts[0].id, {
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          onboarding_status: account.details_submitted ? 'complete' : 'in_progress',
        });
        console.log(`Conta Connect ${account.id} atualizada: charges=${account.charges_enabled}`);
      }
    }

    // ─── Assinaturas de Planos (lógica existente) ───
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (!customerEmail) {
        console.warn('No customer email in session:', session.id);
        return Response.json({ received: true });
      }

      // Busca a assinatura no Stripe para pegar detalhes
      const stripeSub = subscriptionId
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : null;

      const priceId = stripeSub?.items?.data?.[0]?.price?.id;
      const today = new Date().toISOString().split('T')[0];
      const nextBilling = stripeSub?.current_period_end
        ? new Date(stripeSub.current_period_end * 1000).toISOString().split('T')[0]
        : null;

      // Verifica se já existe uma assinatura para esse usuário
      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: customerEmail });

      // Plano e provider_id passados como metadata pelo createSubscriptionCheckout
      const planName = session.metadata?.plan || stripeSub?.metadata?.plan || 'monthly';
      const providerIdMeta = session.metadata?.provider_id || stripeSub?.metadata?.provider_id;

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: 'active',
          plan: planName,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_start: today,
          next_billing_date: nextBilling,
          payment_method: 'stripe',
        });
        console.log('Subscription updated for:', customerEmail);
      } else {
        await base44.asServiceRole.entities.Subscription.create({
          user_email: customerEmail,
          plan: planName,
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_start: today,
          next_billing_date: nextBilling,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          payment_method: 'stripe',
        });
        console.log('Subscription created for:', customerEmail);
      }

      // ─── Notificação WhatsApp de boas-vindas ao prestador ───────────────────
      try {
        const providers = await base44.asServiceRole.entities.ServiceProvider.filter(
          providerIdMeta ? { id: providerIdMeta } : { created_by: customerEmail }
        );
        const provider = providers?.[0];

        if (provider?.phone) {
          const planoLabel: Record<string, string> = {
            lancamento: 'Prestador Lançamento (R$29,90/mês)',
            regular: 'Prestador Mensal (R$49,90/mês)',
            empresa_lancamento: 'Empresa Lançamento (R$59,90/mês)',
            empresa_regular: 'Empresa Mensal (R$89,90/mês)',
            avulso_prestador: 'Avulso Prestador',
            avulso_empresa: 'Avulso Empresa',
          };
          const label = planoLabel[planName] || planName;
          const nome = provider.full_name?.split(' ')[0] || 'você';
          const mensagem =
            `Olá, ${nome}! 🎉 Seu plano *${label}* no Trancoso Resolve está ativo.\n\n` +
            `A partir de agora seu perfil aparece nas buscas e você começa a receber leads de clientes na região.\n\n` +
            `Acesse seu painel: https://trancosoresolve.com.br/dashboard\n\n` +
            `Qualquer dúvida, é só chamar. A gente resolve! ✅`;

          await notificarWhatsApp(base44, {
            prestador_id: provider.id,
            tipo: 'boas_vindas_plano',
            telefone: provider.phone,
            mensagem,
            referencia_id: subscriptionId || session.id,
            referencia_tipo: 'Subscription',
          });
        }
      } catch (waErr) {
        console.error('[stripeWebhook] erro ao buscar prestador para WhatsApp:', waErr.message);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: sub.id
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: 'cancelled',
        });
        console.log('Subscription cancelled:', sub.id);
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      const subId = invoice.subscription;
      if (subId) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subId
        });
        if (existing.length > 0) {
          // Atualiza próxima data de cobrança a cada renovação
          const stripeSub = await stripe.subscriptions.retrieve(subId);
          const nextBilling = stripeSub?.current_period_end
            ? new Date(stripeSub.current_period_end * 1000).toISOString().split('T')[0]
            : null;
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            status: 'active',
            next_billing_date: nextBilling,
          });
          console.log('Subscription renewed, next billing:', nextBilling);
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subId = invoice.subscription;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subId
      });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: 'expired',
        });
        console.log('Subscription expired due to failed payment:', subId);
      }
    }

  } catch (err) {
    console.error('Error processing webhook event:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }

  return Response.json({ received: true });
});