/**
 * Utilitário centralizado de rastreamento — GA4 + Meta Pixel.
 *
 * Meta CAPI deve ser disparada somente por funções server-side confiáveis.
 * O navegador nunca recebe o segredo de ingestão.
 */

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

/** Gera UUID v4 simples para deduplicação */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Detecta cidade a partir do pathname atual */
function detectCity() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('caraiva')) return 'Caraíva';
  if (path.includes('porto-seguro') || path.includes('portoseguro')) return 'Porto Seguro';
  return 'Trancoso';
}

/** Dispara evento no GA4 (window.gtag) */
function ga4(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/** Dispara evento no Meta Pixel com eventID para deduplicação */
function fbPixel(eventName, data = {}, eventId = null) {
  if (typeof window.fbq === 'function') {
    if (eventId) {
      window.fbq('track', eventName, data, { eventID: eventId });
    } else {
      window.fbq('track', eventName, data);
    }
  }
}

// ──────────────────────────────────────────
// Funções públicas de rastreamento
// ──────────────────────────────────────────

/**
 * trackLead — submissão do mini-formulário de lead
 */
export function trackLead(data = {}) {
  const city = detectCity();

  ga4('generate_lead', {
    currency: 'BRL',
    value: 0,
    service_interest: data.service_interest || '',
    source: data.source || '',
    city,
  });

  trackFacebookLead({
    content_name: data.service_interest || '',
    city,
    source: data.source || '',
  });

}

/**
 * trackPrestadorCadastro — prestador completou pré-cadastro
 */
export function trackPrestadorCadastro(data = {}) {
  ga4('sign_up', {
    method: 'email',
    user_type: 'prestador',
    occupation: data.occupation || '',
  });

  trackFacebookRegistration({
    content_name: 'Cadastro Prestador',
    occupation: data.occupation || '',
  });

}

/**
 * trackClienteCadastro — cliente completou cadastro
 */
export function trackClienteCadastro() {
  ga4('sign_up', {
    method: 'email',
    user_type: 'cliente',
  });

  trackFacebookRegistration({
    content_name: 'Cadastro Cliente',
  });

}

/**
 * Dispara CompleteRegistration uma única vez no primeiro tipo de conta.
 * O ref do chamador cobre rerenders/retries; user_type cobre retornos e logins.
 */
export function trackFirstRegistration(user, userType, alreadyTracked = false) {
  const isFirstRegistration = !user?.user_type || user.user_type === 'indefinido';
  if (alreadyTracked || !isFirstRegistration) return alreadyTracked;

  if (userType === 'prestador') trackPrestadorCadastro();
  else if (userType === 'cliente') trackClienteCadastro();
  else return alreadyTracked;

  return true;
}

import {
  trackLead as trackFacebookLead,
  trackRegistration as trackFacebookRegistration,
} from '@/lib/facebook-pixel';

/**
 * trackSolicitacaoServico — ServiceRequest criada com sucesso
 */
export function trackSolicitacaoServico(data = {}) {
  const eventId = uuid();

  ga4('service_request_submitted', {
    service_name: data.service_title || '',
    service_category: data.category || '',
  });

  fbPixel('SubmitApplication', {
    content_name: data.service_title || '',
    content_category: data.category || '',
  }, eventId);
}

/**
 * trackContatoWhatsApp — botão WhatsApp clicado
 */
export function trackContatoWhatsApp(service = '') {
  const eventId = uuid();
  const city = detectCity();

  ga4('contact', {
    method: 'whatsapp',
    service_name: service,
    city,
  });

  fbPixel('Contact', {
    content_name: service,
    city,
  }, eventId);

}

/**
 * trackViewServico — entrada em página de serviço
 */
export function trackViewServico(data = {}) {
  const eventId = uuid();
  const city = data.city || detectCity();

  ga4('view_item', {
    items: [{
      item_name: data.title || '',
      item_category: data.category || '',
      item_list_name: city,
    }],
  });

  fbPixel('ViewContent', {
    content_name: data.title || '',
    content_category: data.category || '',
    city,
  }, eventId);

}
