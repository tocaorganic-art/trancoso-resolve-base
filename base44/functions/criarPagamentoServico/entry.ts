import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Logging helper
function logStructured(action, data, level = 'info') {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    level,
    data,
    environment: Deno.env.get('ENVIRONMENT') || 'production'
  };
  console.log(JSON.stringify(log));
  return log;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // SEGURANÇA: Verifica autenticação do usuário
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { request_id, amount_brl, service_date, provider_id } = body;

    if (!request_id || !amount_brl || !provider_id) {
      return Response.json({ error: 'Campos obrigatórios: request_id, amount_brl, provider_id' }, { status: 400 });
    }

    // SEGURANÇA: Usa email do usuário autenticado, não do body
    const clientEmail = user.email;

    const amountCents = Math.round(amount_brl * 100);
    const platformFee = Math.round(amountCents * 0.20);
    const providerAmount = amountCents - platformFee;

    // Busca conta Stripe do prestador (se já tiver feito onboarding)
    const stripeAccounts = await base44.asServiceRole.entities.ProviderStripeAccount.filter({ provider_id });
    const providerAccount = stripeAccounts?.[0];

    // Cria Payment Intent com captura manual (escrow)
    const paymentIntentParams = {
      amount: amountCents,
      currency: 'brl',
      capture_method: 'manual',
      payment_method_types: ['card'],
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        request_id,
        provider_id,
        client_email,
        platform_fee_cents: platformFee.toString(),
        provider_amount_cents: providerAmount.toString(),
      },
      description: `Trancoso Resolve - Serviço #${request_id}`,
    };

    // Se o prestador já tem conta Connect, configura o split
    if (providerAccount?.stripe_account_id && providerAccount?.charges_enabled) {
      paymentIntentParams.application_fee_amount = platformFee;
      paymentIntentParams.transfer_data = {
        destination: providerAccount.stripe_account_id,
      };
      console.log(`[criarPagamento] Usando Connect account: ${providerAccount.stripe_account_id}`);
    } else {
      console.log(`[criarPagamento] Prestador sem conta Connect. Split manual será feito na captura.`);
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    console.log(`[criarPagamento] PaymentIntent criado: ${paymentIntent.id}, amount: ${amountCents}`);

    // Calcula prazo de auto-captura: 48h após a data do serviço
    const serviceDateTime = service_date ? new Date(service_date) : new Date();
    serviceDateTime.setDate(serviceDateTime.getDate() + 1); // dia seguinte ao serviço
    const autoCaptureAfter = new Date(serviceDateTime.getTime() + 48 * 60 * 60 * 1000).toISOString();

    // Salva no banco
    const payment = await base44.asServiceRole.entities.Payment.create({
      request_id,
      provider_id,
      client_email: clientEmail,
      provider_stripe_account_id: providerAccount?.stripe_account_id || null,
      amount_total: amountCents,
      amount_provider: providerAmount,
      amount_platform: platformFee,
      currency: 'brl',
      stripe_payment_intent_id: paymentIntent.id,
      status: 'requires_payment_method',
      service_date: service_date || null,
      auto_capture_after: autoCaptureAfter,
    });

    console.log(`[criarPagamento] Payment salvo: ${payment.id}`);

    return Response.json({
      ok: true,
      payment_id: payment.id,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount_total: amountCents,
      amount_provider: providerAmount,
      amount_platform: platformFee,
    });

  } catch (error) {
    logStructured('criarPagamento_error', {
      errorMessage: error.message,
      errorCode: error.code,
      requestId: body.request_id,
      userEmail: user?.email
    }, 'error');
    
    return Response.json({ error: error.message }, { status: 500 });
  }
});