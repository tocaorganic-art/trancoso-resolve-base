// ⚠️ STRIPE DESATIVADO — migrado para Mercado Pago
// Use mpWebhook para eventos de pagamento do Mercado Pago.
// O onboarding de prestadores MP será implementado via ProviderMercadoPagoAccount.

Deno.serve(async (_req) => {
  return Response.json({
    status: 'disabled',
    message: 'Stripe Connect desativado. Plataforma migrada para Mercado Pago.',
  }, { status: 410 });
});