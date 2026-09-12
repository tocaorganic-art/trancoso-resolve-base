import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ─── MIGRAÇÃO ASAAS (12/09/2026) ──────────────────────────────────────────────
// Pagamento avulso de serviço (Pix) — substitui a integração Mercado Pago.
// Asaas não possui capture:false (escrow do MP); o dinheiro cai na conta da
// plataforma e a liberação ao prestador continua sendo processo interno.
// Os IDs do Asaas são gravados nos mesmos campos mp_payment_id / mp_init_point
// para evitar migração de schema (verificado em 12/09/2026).
//
// Secrets: ASAAS_API_KEY (obrigatória), ASAAS_ENV ('sandbox' para testes).

function logStructured(action: string, data: Record<string, unknown>, level = 'info') {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action, level, data, environment: Deno.env.get('ENVIRONMENT') || 'production' }));
}

function asaasBaseUrl(): string {
  return Deno.env.get('ASAAS_ENV') === 'sandbox'
    ? 'https://api-sandbox.asaas.com'
    : 'https://api.asaas.com';
}

async function asaasFetch(apiKey: string, path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${asaasBaseUrl()}${path}`, {
    ...init,
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function getOrCreateCustomer(apiKey: string, email: string, name: string): Promise<string> {
  const search = await asaasFetch(apiKey, `/v3/customers?email=${encodeURIComponent(email)}`);
  const existing = search.data?.data?.[0];
  if (existing) return existing.id;
  const created = await asaasFetch(apiKey, '/v3/customers', {
    method: 'POST',
    body: JSON.stringify({ name: name || email, email }),
  });
  if (!created.ok) {
    throw new Error(created.data?.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
  }
  return created.data.id;
}

Deno.serve(async (req) => {
  let user: { email?: string; id?: string; role?: string } | null = null;

  try {
    const apiKey = Deno.env.get('ASAAS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Asaas não configurado: ASAAS_API_KEY ausente.' }, { status: 503 });
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

    // ─── Customer + cobrança PIX no Asaas ─────────────────────────────────────
    const customerId = await getOrCreateCustomer(apiKey, user.email, (user as any).full_name || (user as any).name);

    const today = new Date().toISOString().split('T')[0];
    const payRes = await asaasFetch(apiKey, '/v3/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: amountBrl,
        dueDate: today,
        description: `Trancoso Resolve - Serviço #${request_id}`,
        externalReference: request_id,
      }),
    });

    if (!payRes.ok) {
      console.error('[criarPagamento] Erro Asaas:', JSON.stringify(payRes.data));
      const desc = payRes.data?.errors?.[0]?.description || 'Erro ao criar pagamento no Asaas.';
      return Response.json({ error: desc }, { status: 502 });
    }

    const asaasPayment = payRes.data;

    // QR Code Pix (copia e cola) — opcional, a fatura também exibe
    let pixCopiaECola: string | null = null;
    try {
      const qr = await asaasFetch(apiKey, `/v3/payments/${asaasPayment.id}/pixQrCode`);
      pixCopiaECola = qr.data?.payload || null;
    } catch { /* não crítico */ }

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
      mp_payment_id: String(asaasPayment.id),
      mp_init_point: asaasPayment.invoiceUrl || null,
      status: 'pending',
      service_date: serviceDate,
      auto_capture_after: autoCaptureAfter,
    });

    logStructured('criarPagamento_success', { request_id, payment_id: payment.id, asaas_payment_id: asaasPayment.id });

    return Response.json({
      ok: true,
      payment_id: payment.id,
      mp_payment_id: asaasPayment.id,
      init_point: asaasPayment.invoiceUrl,
      pix_copia_e_cola: pixCopiaECola,
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
