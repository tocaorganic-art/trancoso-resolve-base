/**
 * Pixel / CAPI helpers — Trancoso Resolve
 *
 * Regras:
 * - Nenhum dado PII é enviado (sem e-mail, CPF, telefone).
 * - Cada evento usa um event_id único (UUID) para deduplicação client/server.
 * - Todas as funções são no-ops silenciosos se fbq não estiver disponível.
 * - O event_id é salvo em sessionStorage para que o servidor possa reenviar
 *   o mesmo evento via CAPI sem duplicar no relatório do Facebook.
 */

const PIXEL_ID = '1469130194903035';

/**
 * Gera um UUID v4 simples para event_id.
 */
function generateEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Dispara um evento no Meta Pixel client-side.
 * @param {string} eventName - Nome padrão (ViewContent, Lead) ou customizado.
 * @param {object} [params={}] - Parâmetros adicionais (sem PII).
 * @param {boolean} [isCustom=false] - true para trackCustom, false para track.
 * @returns {string} event_id gerado (para correlação CAPI server-side).
 */
export function pixelTrack(eventName, params = {}, isCustom = false) {
  const eventId = generateEventId();
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      const fn = isCustom ? 'trackCustom' : 'track';
      window.fbq(fn, eventName, params, { eventID: eventId });
    }
  } catch (err) {
    // Nunca deixar analytics quebrar a UX
    console.warn('[pixel] erro ao disparar evento:', eventName, err?.message);
  }
  return eventId;
}

// ─── Eventos padrão do funil Prestador Fundador ───────────────────────────

/**
 * /PrestadorFundador — visitante entrou na landing page.
 */
export function pixelLandingPageView() {
  return pixelTrack('ViewContent', {
    content_name: 'Prestador Fundador',
    content_category: 'landing',
    content_ids: ['prestador_fundador'],
    content_type: 'product',
    value: 19.90,
    currency: 'BRL',
  });
}

/**
 * Clique em qualquer CTA da landing (Quero ser Prestador Fundador).
 */
export function pixelClickFounderCTA(source = 'hero') {
  return pixelTrack('ClickFounderCTA', { source }, true);
}

/**
 * Visitante clicou em "Cadastrar" ou iniciou registro de prestador.
 */
export function pixelStartProviderRegistration() {
  return pixelTrack('StartRegistration', {
    content_name: 'Cadastro Prestador',
    currency: 'BRL',
    value: 19.90,
  });
}

/**
 * Cadastro de prestador concluído (formulário submetido).
 */
export function pixelCompleteProviderRegistration() {
  return pixelTrack('CompleteRegistration', {
    content_name: 'Prestador Cadastrado',
    currency: 'BRL',
  });
}

/**
 * Prestador enviou documentos para verificação.
 */
export function pixelSubmitVerification() {
  return pixelTrack('SubmitApplication', {
    content_name: 'Verificação Enviada',
  }, true);
}

/**
 * Prestador foi aprovado na verificação (disparado via CAPI idealmente).
 */
export function pixelVerificationApproved() {
  return pixelTrack('VerificationApproved', {}, true);
}

/**
 * Iniciou o período de trial (7 dias grátis Profissional).
 */
export function pixelStartTrial(planId = 'prestador_profissional') {
  return pixelTrack('StartTrial', {
    content_name: planId,
    currency: 'BRL',
    value: 0,
  }, true);
}

/**
 * Assinatura ativada após trial ou diretamente.
 * Disparado também via CAPI no webhook (mais confiável).
 */
export function pixelSubscribe(planId = 'prestador_profissional', value = 19.90) {
  return pixelTrack('Subscribe', {
    predicted_ltv: value * 12,
    currency: 'BRL',
    value,
    content_name: planId,
  });
}

/**
 * Assinatura cancelada.
 */
export function pixelCancelSubscription() {
  return pixelTrack('CancelSubscription', {}, true);
}

/**
 * Selo Fundador concedido (idealmente via CAPI).
 */
export function pixelFounderBadgeGranted(position) {
  return pixelTrack('FounderBadgeGranted', {
    // Posição não é PII
    position,
    value: 19.90,
    currency: 'BRL',
  }, true);
}

/**
 * Selo Fundador revogado.
 */
export function pixelFounderBadgeRevoked() {
  return pixelTrack('FounderBadgeRevoked', {}, true);
}
