/**
 * Utilitário centralizado de rastreamento — GA4 + Meta Pixel + Meta CAPI (server-side)
 *
 * IMPORTANTE — Para ativar o CAPI server-side:
 * 1. Acesse Meta Business Suite → Events Manager → seu Pixel → Configurações → API de Conversões
 * 2. Gere um "Access Token" do sistema
 * 3. Adicione no painel Base44 → Settings → Environment Variables:
 *    Nome: META_CAPI_TOKEN   Valor: <token gerado>
 */

import { base44 } from '@/api/base44Client';

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

/** Lê cookie pelo nome */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
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

/** Envia evento para a Meta Conversions API (server-side) via backend function */
async function sendCAPI(eventName, customData = {}, userData = {}, eventId = null) {
  try {
    await base44.functions.invoke('metaCAPI', {
      event_name: eventName,
      event_id: eventId || uuid(),
      event_source_url: window.location.href,
      custom_data: { ...customData, city: detectCity() },
      user_data: {
        fbc: getCookie('_fbc'),
        fbp: getCookie('_fbp'),
        ...userData,
      },
    });
  } catch {
    // CAPI falha silenciosamente — pixel client-side continua funcionando
  }
}

// ──────────────────────────────────────────
// Funções públicas de rastreamento
// ──────────────────────────────────────────

/**
 * trackLead — submissão do mini-formulário de lead
 */
export function trackLead(data = {}) {
  const eventId = uuid();
  const city = detectCity();

  ga4('generate_lead', {
    currency: 'BRL',
    value: 0,
    service_interest: data.service_interest || '',
    source: data.source || '',
    city,
  });

  fbPixel('Lead', {
    content_name: data.service_interest || '',
    content_category: 'servico_local',
    city,
  }, eventId);

  sendCAPI('Lead', {
    content_name: data.service_interest || '',
    content_category: 'servico_local',
  }, {}, eventId);
}

/**
 * trackPrestadorCadastro — prestador completou pré-cadastro
 */
export function trackPrestadorCadastro(data = {}) {
  const eventId = uuid();

  ga4('sign_up', {
    method: 'email',
    user_type: 'prestador',
    occupation: data.occupation || '',
  });

  fbPixel('CompleteRegistration', {
    content_name: 'Cadastro Prestador',
    status: true,
    occupation: data.occupation || '',
  }, eventId);

  sendCAPI('CompleteRegistration', {
    content_name: 'Cadastro Prestador',
    status: true,
  }, {}, eventId);
}

/**
 * trackClienteCadastro — cliente completou cadastro
 */
export function trackClienteCadastro() {
  const eventId = uuid();

  ga4('sign_up', {
    method: 'email',
    user_type: 'cliente',
  });

  fbPixel('CompleteRegistration', {
    content_name: 'Cadastro Cliente',
  }, eventId);

  sendCAPI('CompleteRegistration', {
    content_name: 'Cadastro Cliente',
  }, {}, eventId);
}

/**
 * trackSolicitacaoServico — ServiceRequest criada com sucesso
 */
export function trackSolicitacaoServico(data = {}) {
  const eventId = uuid();
  const value = data.price || 0;

  ga4('purchase', {
    currency: 'BRL',
    value,
    items: [{
      item_name: data.service_title || '',
      item_category: data.category || '',
    }],
  });

  fbPixel('Purchase', {
    currency: 'BRL',
    value,
    content_name: data.service_title || '',
    content_category: data.category || '',
  }, eventId);

  sendCAPI('Purchase', {
    currency: 'BRL',
    value,
    content_name: data.service_title || '',
    content_category: data.category || '',
  }, {}, eventId);
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

  sendCAPI('Contact', {
    content_name: service,
    city,
  }, {}, eventId);
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

  sendCAPI('ViewContent', {
    content_name: data.title || '',
    content_category: data.category || '',
    city,
  }, {}, eventId);
}