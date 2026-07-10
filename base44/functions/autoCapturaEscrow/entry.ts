// ⚠️ DESATIVADO — dependia da captura manual do Stripe (status "requires_capture").
// Com Mercado Pago, o pagamento é capturado automaticamente pelo mpWebhook assim que
// aprovado pelo MP, então não existe mais captura pendente para liberar aqui.

Deno.serve(async (_req) => {
  return Response.json({
    ok: true,
    disabled: true,
    message: 'autoCapturaEscrow desativado — Mercado Pago captura pagamentos automaticamente via mpWebhook.',
  });
});
