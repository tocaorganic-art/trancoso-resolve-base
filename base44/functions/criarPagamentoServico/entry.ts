import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getAsaasConfig, getOrCreateAsaasCustomer, asaasFetch } from '../_shared/asaasClient.ts';

function logStructured(action: string, data: Record<string, unknown>, level = 'info') {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), action, level, data, environment: Deno.env.get('ENVIRONMENT') || 'production' }));
}

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  let user: { email?: string; id?: string; role?: string; full_name?: string } | null = null;

  try {
    const config = getAsaasConfig();
    if (!config) {
      return Response.json({ error: 'Asaas não configurado: ASAAS_API_KEY ausente.' }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { request_id, cpf_cnpj } = body as { request_id?: string; cpf_cnpj?: string };
    if (!request_id) {
      return Response.json({ error: 'request_id é obrigatório.' }, { status: 400 });
    }

    // IDEMPOTÊNCIA
    const existingPayments = await base44.asServiceRole.entities.Payment.filter({ request_id });
    if (existingPayments && existingPayments.length > 0) {
      const existing = existingPayments[0];
      if (existing.asaas_payment_id) {
        logStructured('criarPagamento_idempotent_hit', { request_id, payment_id: existing.id });
        return Response.json({
          ok: true,
          payment_id: existing.id,
          asaas_payment_id: existing.asaas_payment_id,
          invoice_url: existing.asaas_invoice_url,
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

    // ─── CPF/CNPJ do cliente (obrigatório para o Asaas criar o customer) ─────
    let cpfCnpj = cpf_cnpj || '';
    if (!cpfCnpj) {
      return Response.json({
        error: 'CPF ou CNPJ é obrigatório para gerar a cobrança PIX. Informe cpf_cnpj.',
      }, { status: 400 });
    }

    const customerResult = await getOrCreateAsaasCustomer(config, {
      name: user.full_name || user.email,
      email: user.email,
      cpfCnpj,
      externalReference: user.email,
    });
    if ('error' in customerResult) {
      logStructured('criarPagamento_customer_error', { request_id, error: customerResult.error }, 'error');
      return Response.json({ error: customerResult.error }, { status: 502 });
    }

    // ─── ATENÇÃO — MUDANÇA DE MODELO FINANCEIRO (Mercado Pago → Asaas) ───────
    // O fluxo antigo usava `capture: false` no Mercado Pago: o valor ficava
    // AUTORIZADO mas não capturado (escrow), e um processo separado
    // (auto_capture_after, 48h após o serviço) fazia a captura efetiva.
    //
    // O Asaas NÃO tem um equivalente direto de autorização + captura manual
    // para PIX (PIX é liquidado à vista, não existe "hold"). Este código cria
    // a cobrança PIX que, ao ser paga, já libera o valor ao repassar (sujeito
    // às regras de saque do Asaas) — não há retenção automática de 48h.
    //
    // Isso é uma DECISÃO DE PRODUTO pendente, não uma escolha técnica minha:
    // opções possíveis são (a) usar Asaas Split para reter/repassar ao
    // prestador só depois da confirmação do serviço, (b) manter o valor na
    // carteira Asaas da plataforma e fazer transferência manual/programada
    // pós-serviço, ou (c) aceitar liquidação imediata e tratar disputas via
    // reembolso manual. auto_capture_after continua sendo calculado e salvo
    // abaixo só para preservar o dado — hoje não há job que o utilize neste
    // fluxo Asaas.
    const paymentRes = await asaasFetch<any>(config, '/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerResult.id,
        billingType: 'PIX',
        value: amountBrl,
        dueDate: toIsoDate(new Date()),
        description: `Trancoso Resolve - Serviço #${request_id}`,
        externalReference: `service_request:${request_id}`,
      }),
    });

    if (!paymentRes.ok || !paymentRes.data?.id) {
      console.error('[criarPagamento] Erro Asaas:', JSON.stringify(paymentRes.data));
      return Response.json({
        error: 'Erro ao criar pagamento no Asaas.',
        details: paymentRes.data?.errors?.[0]?.description || 'Erro desconhecido',
      }, { status: 502 });
    }

    const asaasPayment = paymentRes.data;

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
      asaas_payment_id: String(asaasPayment.id),
      asaas_customer_id: customerResult.id,
      asaas_invoice_url: asaasPayment.invoiceUrl || null,
      status: 'pending',
      service_date: serviceDate,
      auto_capture_after: autoCaptureAfter,
    });

    logStructured('criarPagamento_success', { request_id, payment_id: payment.id, asaas_payment_id: asaasPayment.id });

    return Response.json({
      ok: true,
      payment_id: payment.id,
      asaas_payment_id: asaasPayment.id,
      invoice_url: asaasPayment.invoiceUrl || null,
      pix_qr_code: asaasPayment.pixQrCodeId || null,
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
