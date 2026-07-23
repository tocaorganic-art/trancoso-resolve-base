import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

function logStructured(action: string, data: Record<string, unknown>, level = 'info') {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    level,
    data,
    environment: 'production',
  }));
}

Deno.serve(async (req) => {
  let user: { email?: string; id?: string; role?: string } | null = null;

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Stripe não configurado: STRIPE_SECRET_KEY ausente.' }, { status: 503 });
    }
    const stripe = new Stripe(stripeKey);

    const base44 = createClientFromRequest(req);
    user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { request_id } = body as { request_id?: string };

    if (!request_id) {
      return Response.json({ error: 'request_id é obrigatório. Nenhum outro campo é aceito do cliente.' }, { status: 400 });
    }

    // ── IDEMPOTÊNCIA: se já existe Payment para este request_id, retorna o existente
    const existingPayments = await base44.asServiceRole.entities.Payment.filter({ request_id });
    if (existingPayments && existingPayments.length > 0) {
      const existing = existingPayments[0];
      if (existing.stripe_payment_intent_id) {
        const pi = await stripe.paymentIntents.retrieve(existing.stripe_payment_intent_id);
        if (pi.status !== 'canceled') {
          logStructured('criarPagamento_idempotent_hit', { request_id, payment_id: existing.id });
          return Response.json({
            ok: true,
            payment_id: existing.id,
            client_secret: pi.client_secret,
            payment_intent_id: pi.id,
            amount_total: existing.amount_total,
            amount_provider: existing.amount_provider,
            amount_platform: existing.amount_platform,
          });
        }
      }
    }

    // ── BUSCAR A SOLICITAÇÃO NO BANCO (fonte de verdade)
    const requests = await base44.asServiceRole.entities.ServiceRequest.filter({ id: request_id });
    const serviceRequest = requests?.[0];

    if (!serviceRequest) {
      return Response.json({ error: 'Solicitação de serviço não encontrada.' }, { status: 404 });
    }

    // ── VALIDAR PROPRIETÁRIO OU ADMIN
    const isAdmin = user.role === 'admin';
    const isOwner = serviceRequest.client_email === user.email || serviceRequest.created_by === user.email;
    if (!isAdmin && !isOwner) {
      return Response.json({ error: 'Sem permissão: apenas o solicitante ou admin pode criar pagamento.' }, { status: 403 });
    }

    // ── VALIDAR STATUS CONFIRMADO
    if (serviceRequest.status !== 'Confirmado') {
      return Response.json({ error: `Solicitação deve estar com status "Confirmado". Atual: "${serviceRequest.status}".` }, { status: 400 });
    }

    const providerId = serviceRequest.provider_id;
    const serviceId = serviceRequest.service_id;

    if (!providerId || !serviceId) {
      return Response.json({ error: 'Solicitação não possui prestador ou serviço associado.' }, { status: 400 });
    }

    // ── BUSCAR O SERVIÇO (ServiceListing) NO BANCO — preço vem daqui, não do navegador
    const listings = await base44.asServiceRole.entities.ServiceListing.filter({ id: serviceId });
    const serviceListing = listings?.[0];

    if (!serviceListing) {
      return Response.json({ error: 'Serviço não encontrado.' }, { status: 404 });
    }

    if (!serviceListing.active) {
      return Response.json({ error: 'Serviço não está ativo.' }, { status: 400 });
    }

    const amountBrl = serviceListing.price;
    if (!amountBrl || amountBrl <= 0) {
      return Response.json({ error: 'Preço do serviço inválido ou não definido.' }, { status: 400 });
    }

    const amountCents = Math.round(amountBrl * 100);
    const platformFee = 0; // ── COMISSÃO ZERO ──
    const providerAmount = amountCents - platformFee;

    // ── BUSCAR CONTA STRIPE CONNECT DO PRESTADOR
    const stripeAccounts = await base44.asServiceRole.entities.ProviderStripeAccount.filter({ provider_id: providerId });
    const providerAccount = stripeAccounts?.[0];

    const paymentIntentParams: Record<string, unknown> = {
      amount: amountCents,
      currency: 'brl',
      capture_method: 'manual',
      payment_method_types: ['card'],
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        request_id,
        provider_id: providerId,
        client_email: user.email,
        platform_fee_cents: platformFee.toString(),
        provider_amount_cents: providerAmount.toString(),
      },
      description: `Trancoso Resolve - Serviço #${request_id}`,
    };

    if (providerAccount?.stripe_account_id && providerAccount?.charges_enabled) {
      paymentIntentParams.application_fee_amount = platformFee;
      paymentIntentParams.transfer_data = { destination: providerAccount.stripe_account_id };
      console.log(`[criarPagamento] Usando Connect account: ${providerAccount.stripe_account_id}`);
    } else {
      console.log(`[criarPagamento] Prestador sem conta Connect — pagamento sem transferência.`);
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams as any
    );
    console.log(`[criarPagamento] PaymentIntent criado: ${paymentIntent.id}, amount: ${amountCents}, fee: ${platformFee}`);

    const serviceDate = serviceRequest.date || null;
    const autoCaptureAfter = serviceDate
      ? new Date(new Date(serviceDate).getTime() + 48 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const payment = await base44.asServiceRole.entities.Payment.create({
      request_id,
      provider_id: providerId,
      client_email: user.email,
      provider_stripe_account_id: providerAccount?.stripe_account_id || null,
      amount_total: amountCents,
      amount_provider: providerAmount,
      amount_platform: platformFee,
      currency: 'brl',
      stripe_payment_intent_id: paymentIntent.id,
      status: 'requires_payment_method',
      service_date: serviceDate,
      auto_capture_after: autoCaptureAfter,
    });

    logStructured('criarPagamento_success', { request_id, payment_id: payment.id, amount_cents: amountCents });

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
      errorMessage: (error as Error).message,
      errorCode: (error as { code?: string }).code,
      userEmail: user?.email,
    }, 'error');
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});