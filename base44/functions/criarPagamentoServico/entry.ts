import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ─── Criar Pagamento de Serviço via Mercado Pago ──────────────────────────────
// Fluxo: cria Preferência MP → retorna init_point para redirect do cliente
// O webhook mpWebhook confirma o pagamento quando aprovado pelo MP

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
const BASE_URL = 'https://trancosoresolve.com.br';

Deno.serve(async (req) => {
  let body: Record<string, unknown> = {};
  try {
    if (!MP_ACCESS_TOKEN) {
      return Response.json({ error: 'MP_ACCESS_TOKEN não configurado' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    body = await req.json();
    const { request_id, amount_brl, service_date, provider_id } = body as {
      request_id: string;
      amount_brl: number;
      service_date?: string;
      provider_id: string;
    };

    if (!request_id || !amount_brl || !provider_id) {
      return Response.json({ error: 'Campos obrigatórios: request_id, amount_brl, provider_id' }, { status: 400 });
    }

    const clientEmail = user.email;
    const amountBrl = Number(amount_brl);
    const platformFee = Math.round(amountBrl * 0.20 * 100) / 100;
    const providerAmount = Math.round((amountBrl - platformFee) * 100) / 100;

    // ─── Criar Preferência no Mercado Pago ───────────────────────────────────
    const preference = {
      items: [{
        id: request_id,
        title: `Serviço Trancoso Resolve #${request_id}`,
        quantity: 1,
        unit_price: amountBrl,
        currency_id: 'BRL',
      }],
      payer: {
        email: clientEmail,
      },
      external_reference: request_id,
      back_urls: {
        success: `${BASE_URL}/PagamentoConfirmado?request_id=${request_id}&status=success`,
        failure: `${BASE_URL}/PagamentoConfirmado?request_id=${request_id}&status=failure`,
        pending: `${BASE_URL}/PagamentoConfirmado?request_id=${request_id}&status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'TRANCOSO RESOLVE',
      metadata: {
        request_id,
        provider_id,
        client_email: clientEmail,
        platform_fee: platformFee,
        provider_amount: providerAmount,
      },
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok || !mpData.init_point) {
      console.error('[criarPagamentoServico] Erro MP:', JSON.stringify(mpData));
      return Response.json({
        error: mpData.message || 'Erro ao criar preferência no Mercado Pago',
        details: mpData,
      }, { status: 500 });
    }

    // ─── Salva no banco ───────────────────────────────────────────────────────
    const payment = await base44.asServiceRole.entities.Payment.create({
      request_id,
      provider_id,
      client_email: clientEmail,
      amount_total: Math.round(amountBrl * 100),
      amount_provider: Math.round(providerAmount * 100),
      amount_platform: Math.round(platformFee * 100),
      currency: 'brl',
      mp_payment_id: mpData.id,
      mp_preference_id: mpData.id,
      status: 'pending',
      service_date: service_date || null,
      payment_method: 'mercadopago',
    });

    console.log(`[criarPagamentoServico] Preferência MP criada: ${mpData.id} | request: ${request_id}`);

    return Response.json({
      ok: true,
      payment_id: payment.id,
      checkout_url: mpData.init_point,
      preference_id: mpData.id,
      amount_total: amountBrl,
      amount_provider: providerAmount,
      amount_platform: platformFee,
    });

  } catch (error) {
    console.error('[criarPagamentoServico] Erro:', error.message, { request_id: body.request_id });
    return Response.json({ error: error.message }, { status: 500 });
  }
});
