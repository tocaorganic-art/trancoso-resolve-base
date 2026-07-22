import { track as trackEvent } from '@vercel/analytics';

/**
 * Analytics events para Trancoso Resolve
 * Rastreia ações críticas de usuários
 */

export function trackWhatsAppClick(destination, category, originPage) {
  trackEvent('click_whatsapp', {
    destination,
    category,
    origin_page: originPage,
    timestamp: new Date().toISOString(),
  });
}

export function trackChatOpen(currentPage) {
  trackEvent('chat_open', {
    page: currentPage,
    timestamp: new Date().toISOString(),
  });
}

export function trackChatMessage(qualifiedCategory) {
  trackEvent('chat_envio_mensagem', {
    category: qualifiedCategory || 'not_qualified',
    timestamp: new Date().toISOString(),
  });
}

export function trackFormSubmit(category, destination, urgency) {
  trackEvent('form_lead_submit', {
    category,
    destination,
    urgency,
    timestamp: new Date().toISOString(),
  });
}

export function trackFormOpen(originPage) {
  trackEvent('formulario_abertura', {
    origin_page: originPage,
    timestamp: new Date().toISOString(),
  });
}

export function trackPrestadorCardClick(prestadorId, category) {
  trackEvent('card_prestador_clique', {
    prestador_id: prestadorId,
    category,
    timestamp: new Date().toISOString(),
  });
}

export function trackTestimonialView(prestadorId) {
  trackEvent('depoimento_visualizado', {
    prestador_id: prestadorId,
    timestamp: new Date().toISOString(),
  });
}
