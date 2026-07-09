// ⚠️ STRIPE DESATIVADO — migrado para Mercado Pago
// Este webhook foi desativado. Use mpWebhook para eventos do Mercado Pago.
// Configure a nova URL de webhook no painel do MP:
// https://www.mercadopago.com.br/developers/panel/app → Webhooks

Deno.serve(async (_req) => {
  return Response.json({
    status: 'disabled',
    message: 'Stripe desativado. Plataforma migrada para Mercado Pago. Use /functions/mpWebhook.',
  }, { status: 410 });
});
