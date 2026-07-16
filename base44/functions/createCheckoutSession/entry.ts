// ⚠️ STRIPE DESATIVADO — migrado para Mercado Pago
// Use createSubscriptionCheckout para assinaturas via Mercado Pago.

Deno.serve(async (_req) => {
  return Response.json({
    status: 'disabled',
    message: 'Stripe checkout desativado. Use /functions/createSubscriptionCheckout para Mercado Pago.',
  }, { status: 410 });
});