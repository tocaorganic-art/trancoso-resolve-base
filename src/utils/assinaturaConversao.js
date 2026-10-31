/**
 * Regras da conversão "Assinatura" do Google Ads (AW-18431007500).
 *
 * A conversão só é enviada quando o backend confirmou o pagamento: a
 * Subscription só fica com status "active" quando o asaasWebhook recebe
 * PAYMENT_RECEIVED ou PAYMENT_CONFIRMED (a entidade não aceita update pelo
 * usuário, só por admin ou service role). Acesso direto à URL de
 * /AssinaturaConfirmada, ou assinatura ainda em trial, não gera conversão.
 *
 * Funções puras, sem SDK, para poderem ser testadas com node:test.
 */

export const GADS_ASSINATURA_SEND_TO = 'AW-18431007500/bYDPCPzcwPEcEIy2y9RE';

// Mesmos valores de base44/functions/createSubscriptionCheckout (PLANS).
export const PLAN_VALUES = {
  profissional: { monthly: 59.9, annual: 599 },
  prestador_elite: { monthly: 197, annual: 1970 },
  lojista_essencial: { monthly: 89, annual: 890 },
  lojista_pro: { monthly: 197, annual: 1970 },
  lojista_elite: { monthly: 497, annual: 4970 },
  boost_prestador: { monthly: 9.9, annual: null },
  boost_lojista: { monthly: 197, annual: null },
};

// Pagamento precisa ser recente para contar como a conversão desta visita.
export const MAX_DIAS_DESDE_PAGAMENTO = 3;

/** Escolhe a assinatura do checkout atual (pelo id do Asaas) ou a mais recente. */
export function pickSubscription(subscriptions = [], asaasSubscriptionId = null) {
  const list = Array.isArray(subscriptions) ? subscriptions.filter(Boolean) : [];
  if (list.length === 0) return null;
  if (asaasSubscriptionId) {
    const match = list.find((s) =>
      s.asaas_subscription_id === asaasSubscriptionId || s.mp_preapproval_id === asaasSubscriptionId,
    );
    if (match) return match;
  }
  const time = (s) => new Date(s.updated_date || s.created_date || 0).getTime() || 0;
  return [...list].sort((a, b) => time(b) - time(a))[0];
}

/** true só para assinatura paga e confirmada pelo webhook há poucos dias. */
export function isPagamentoConfirmado(subscription, now = new Date()) {
  if (!subscription || subscription.status !== 'active') return false;
  if (!PLAN_VALUES[subscription.plan]) return false;
  const start = subscription.subscription_start;
  if (!start) return false;
  const startTime = new Date(`${String(start).slice(0, 10)}T12:00:00Z`).getTime();
  if (!Number.isFinite(startTime)) return false;
  const dias = (now.getTime() - startTime) / 86400000;
  return dias >= -1 && dias <= MAX_DIAS_DESDE_PAGAMENTO;
}

/** Valor real do plano contratado (R$ 59,90 Profissional, R$ 9,90 Boost etc.). */
export function getConversionValue(subscription) {
  const plan = PLAN_VALUES[subscription?.plan];
  if (!plan) return null;
  const value = subscription.billing === 'annual' && plan.annual ? plan.annual : plan.monthly;
  return typeof value === 'number' && value > 0 ? value : null;
}

/** Chave de deduplicação: uma conversão por assinatura e por ciclo pago. */
export function conversionKey(subscription) {
  return `gads-assinatura-sent:${subscription.id}:${String(subscription.subscription_start || '').slice(0, 10)}`;
}

/** Parâmetros do gtag('event', 'conversion', ...) ou null se não deve disparar. */
export function buildConversionParams(subscription, now = new Date()) {
  if (!isPagamentoConfirmado(subscription, now)) return null;
  const value = getConversionValue(subscription);
  if (value === null) return null;
  return {
    send_to: GADS_ASSINATURA_SEND_TO,
    value,
    currency: 'BRL',
    transaction_id: conversionKey(subscription).replace('gads-assinatura-sent:', ''),
  };
}
