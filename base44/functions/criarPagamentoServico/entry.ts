import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function logStructured(action: string, data: Record<string, unknown>, level = 'info') {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action, level, data, environment: Deno.env.get('ENVIRONMENT') || 'production' }));
}

Deno.serve(async (req) => {
  let user: { email?: string; id?: string; role?: string } | null = null;

  try {
    const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpToken) {
      return Response.json({ error: 'Mercado Pago não configurado: MP_ACCESS_TOKEN ausente.' }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { request_id } = body as { request_id?: string };
    if (!request_id) {
      return Response.json({ error: 'request_id é obrigatório.' }, { status: 400 });
    }

    // IDEMPOTÊNCIA
    const existingPayments = await base44.asServiceRole.entities.Payment.filter({ request_id });
    if (existingPayments && existingPayments.length > 0) {
      const existing = existingPayments[0];
      if (existing.mp_payment_id) {
        logStructured('criarPagamento_idempotent_hit', { request_id, payment_id: existing.id });
        return Response.json({
          ok: true,
          payment_id: existing.id,
          mp_payment_id: existing.mp_payment_id,
          init_point: existing.mp_init_point,
          amount_total: existing.amount_total,
          amount_provider: existing.amount_provider,
          amount_platform: existing.amount_platform,
        });
      }
    }

    // BUSCAR SOLICITAÇÃO
    const requests = await base44.asServiceRole.entities.ServiceRequest.filter({ id: request_id });
    const serviceRequest = requests?.[0];
    if (!serviceRequest) {
      return Response.json({ error: 'Solicitação de serviço não encontrada.' }, { status: 404 });
    }

    const isAdmin = user.role === 'admin';
    const isOwner = serviceRequest.client_email === user.email || serviceRequest.created_by === user.email;
    if (!isAdmin && !isOwner) {
      return Response.json({ error: 'Sem permissão.' }, { status: 403 });
    }

    if (serviceRequest.status !== 'Confirmado') {
      return Response.json({ error: `Solicitação deve estar com status "Confirmado". Atual: "${serviceRequest.status}".` }, { status: 400 });
    }

    const providerId = serviceRequest.provider_id;
    const serviceId = serviceRequest.service_id;
    if (!providerId || !serviceId) {
      return Response.json({ error: 'Solicitação não possui prestador ou serviço associado.' }, { status: 400 });
    }

    // BUSCAR SERVIÇO
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
      return Response.json({ error: 'Preço do serviço inválido.' }, { status: 400 });
    }

    const amountCents = Math.round(amountBrl * 100);
    const platformFee = 0; // COMISSÃO ZERO
    const providerAmount = amountCents - platformFee;

    // CRIAR PAGAMENTO NO MERCADO PAGO
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpToken}`,
      },
      body: JSON.stringify({
        transaction_amount: amountBrl,
        description: `Trancoso Resolve - Serviço #${request_id}`,
        payment_method_id: 'pix',
        payer: { email: user.email },
        metadata: {
          request_id,
          provider_id: providerId,
          client_email: user.email,
          platform_fee_cents: platformFee.toString(),
          provider_amount_cents: providerAmount.toString(),
        },
        capture: false, // captura manual (escrow)
      }),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.json().catch(() => ({}));
      console.error('[criarPagamento] Erro MP:', JSON.stringify(mpError));
      return Response.json({ error: 'Erro ao criar pagamento no Mercado Pago.', details: mpError.message || 'Erro desconhecido' }, { status: 502 });
    }

    const mpPayment = await mpResponse.json();

    const serviceDate = serviceRequest.date || null;
    const autoCaptureAfter = serviceDate
      ? new Date(new Date(serviceDate).getTime() + 48 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const payment = await base44.asServiceRole.entities.Payment.create({
      request_id,
      provider_id: providerId,
      client_email: user.email,
      amount_total: amountCents,
      amount_provider: providerAmount,
      amount_platform: platformFee,
      currency: 'brl',
      mp_payment_id: String(mpPayment.id),
      status: 'pending',
      service_date: serviceDate,
      auto_capture_after: autoCaptureAfter,
    });

    logStructured('criarPagamento_success', { request_id, payment_id: payment.id, mp_payment_id: mpPayment.id });

    return Response.json({
      ok: true,
      payment_id: payment.id,
      mp_payment_id: mpPayment.id,
      amount_total: amountCents,
      amount_provider: providerAmount,
      amount_platform: platformFee,
    });

  } catch (error) {
    logStructured('criarPagamento_error', {
      errorMessage: (error as Error).message,
      userEmail: user?.email,
    }, 'error');
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
