import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Pagamento de serviço via Mercado Pago.
//
// REGRA P0: backend controla todos os valores financeiros.
// Frontend envia apenas request_id — nunca amount, price ou qualquer valor.
// O preço é lido de ServiceListing.price no banco de dados.
//
// Política comercial aprovada: SEM comissão de plataforma.
// O prestador negocia diretamente com o cliente e recebe 100% do valor.
//
// Variáveis de ambiente necessárias:
//   MP_ACCESS_TOKEN      — token de acesso Mercado Pago (nunca expor ao frontend)
//   MP_NOTIFICATION_URL  — URL do webhook para receber notificações
//   BASE_URL             — URL base do app

const MAX_DESCRICAO_CHARS = 256;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized: autenticação obrigatória' }, { status: 401 });
    }

    const body = await req.json();
    const { request_id, service_date } = body;

    if (!request_id) {
      return Response.json({ error: 'Campo obrigatório: request_id' }, { status: 400 });
    }

    const mpToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpToken) {
      return Response.json({ error: 'Gateway de pagamento não configurado' }, { status: 503 });
    }

    // --- Carrega a ServiceRequest do banco ---
    const requests = await base44.asServiceRole.entities.ServiceRequest.filter({ id: request_id });
    const serviceRequest = requests?.[0];

    if (!serviceRequest) {
      return Response.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    // --- Verifica que o usuário autenticado é o cliente da solicitação ---
    if (serviceRequest.client_email !== user.email) {
      return Response.json({ error: 'Forbidden: somente o cliente da solicitação pode pagar' }, { status: 403 });
    }

    // --- Verifica que a solicitação ainda está em estado pagável ---
    const STATUS_PAGAVEIS = ['Confirmado', 'Em Andamento'];
    if (!STATUS_PAGAVEIS.includes(serviceRequest.status)) {
      return Response.json({
        error: `Solicitação não pode ser paga neste estado: ${serviceRequest.status}`,
      }, { status: 422 });
    }

    // --- Carrega o preço a partir do ServiceListing (nunca do body) ---
    const listings = await base44.asServiceRole.entities.ServiceListing.filter({
      id: serviceRequest.service_id,
    });
    const listing = listings?.[0];

    if (!listing || typeof listing.price !== 'number' || listing.price <= 0) {
      return Response.json({
        error: 'Preço do serviço não disponível. Verifique o cadastro do serviço.',
      }, { status: 422 });
    }

    // Sem comissão: prestador recebe 100% do valor negociado.
    const amountBrl = listing.price;

    const BASE_URL = Deno.env.get('BASE_URL') || 'https://www.trancosoresolve.com.br';
    const notificationUrl = Deno.env.get('MP_NOTIFICATION_URL');

    // --- Cria preference de pagamento no Mercado Pago ---
    const descricao = `Trancoso Resolve — ${listing.title || 'Serviço'} #${request_id}`.slice(0, MAX_DESCRICAO_CHARS);

    const preferencePayload: Record<string, unknown> = {
      items: [
        {
          id: serviceRequest.service_id,
          title: descricao,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amountBrl,
        },
      ],
      payer: {
        email: user.email,
      },
      external_reference: `${request_id}|${user.id}|${Date.now()}`,
      back_urls: {
        success: `${BASE_URL}/PagamentoConfirmado?request_id=${request_id}`,
        failure: `${BASE_URL}/PagamentoCancelado?request_id=${request_id}`,
        pending: `${BASE_URL}/PagamentoPendente?request_id=${request_id}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'TRANCOSO RESOLVE',
      metadata: {
        request_id,
        provider_id: serviceRequest.provider_id,
      },
    };

    if (notificationUrl) {
      preferencePayload.notification_url = notificationUrl;
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pagamento-${request_id}-${user.id}-${Date.now()}`,
      },
      body: JSON.stringify(preferencePayload),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('[criarPagamentoServicoMercadoPago] MP error:', JSON.stringify(mpData));
      return Response.json({
        error: 'Erro ao criar preferência de pagamento no gateway',
        detalhe: mpData?.message || `HTTP ${mpRes.status}`,
      }, { status: 502 });
    }

    const preferenceId = mpData.id;

    // --- Persiste registro de pagamento pendente ---
    const serviceDateFinal = service_date || serviceRequest.date || null;
    const autoCaptureAfter = serviceDateFinal
      ? new Date(new Date(serviceDateFinal).getTime() + 48 * 60 * 60 * 1000).toISOString()
      : null;

    const payment = await base44.asServiceRole.entities.Payment.create({
      request_id,
      provider_id: serviceRequest.provider_id,
      client_id: user.id,
      amount_total: Math.round(amountBrl * 100),
      currency: 'brl',
      gateway: 'mercadopago',
      mp_preference_id: preferenceId,
      status: 'pendente',
      service_date: serviceDateFinal,
      auto_capture_after: autoCaptureAfter,
      external_reference: preferencePayload.external_reference as string,
    });

    console.log(`[criarPagamentoServicoMercadoPago] preference=${preferenceId} request=${request_id} user=${user.id} amount=${amountBrl}`);

    return Response.json({
      ok: true,
      preference_id: preferenceId,
      payment_id: payment?.id,
    });

  } catch (err) {
    console.error('[criarPagamentoServicoMercadoPago] erro:', (err as Error).message);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
});
