/**
 * DESTINO NO REPO: src/utils/leadValidation.js  (ARQUIVO EXISTENTE — substituir por completo)
 *
 * Mudança em relação ao original: buildPublicLeadPayload agora aceita um
 * parâmetro opcional `attribution` (default: getAdsAttribution()) e anexa
 * utm_source/utm_medium/utm_campaign/utm_content/utm_term/oppref ao payload,
 * apenas quando presentes. Nenhum outro comportamento foi alterado.
 */

import { getAdsAttribution } from '@/lib/adsAttribution.js';

export function normalizeLeadName(value = '') {
  return value.trim().replace(/\s+/g, ' ').slice(0, 120);
}

export function normalizePhone(value = '') {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function isValidBrazilianPhone(value = '') {
  const digits = normalizePhone(value);
  return digits.length === 10 || digits.length === 11;
}

export function buildPublicLeadPayload({
  name,
  phone,
  email,
  message,
  serviceInterest,
  location,
  source,
  type = 'cliente',
  consent,
  website = '',
  // [OpenAI Ads] Atribuição de campanha capturada da URL/sessão. Pode ser
  // sobrescrita explicitamente pelo chamador (ex.: em testes); por padrão
  // lê o que já foi capturado por captureAdsAttribution().
  attribution = getAdsAttribution(),
}) {
  return {
    name: normalizeLeadName(name),
    phone: normalizePhone(phone),
    email: email?.trim().toLowerCase() || undefined,
    message: message?.trim().slice(0, 1000) || undefined,
    service_interest: serviceInterest?.trim().slice(0, 120) || undefined,
    ...(location?.trim() ? { location: location.trim().slice(0, 120) } : {}),
    source: source?.trim().slice(0, 120) || 'site',
    type: type === 'prestador' ? 'prestador' : 'cliente',
    consent: consent === true,
    website,
    // [OpenAI Ads] Campos opcionais de atribuição — nunca sobrescrevem nada
    // se estiverem ausentes (spread condicional).
    ...(attribution?.utm_source ? { utm_source: attribution.utm_source } : {}),
    ...(attribution?.utm_medium ? { utm_medium: attribution.utm_medium } : {}),
    ...(attribution?.utm_campaign ? { utm_campaign: attribution.utm_campaign } : {}),
    ...(attribution?.utm_content ? { utm_content: attribution.utm_content } : {}),
    ...(attribution?.utm_term ? { utm_term: attribution.utm_term } : {}),
    ...(attribution?.oppref ? { oppref: attribution.oppref } : {}),
  };
}
