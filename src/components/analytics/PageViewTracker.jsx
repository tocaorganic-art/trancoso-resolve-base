/**
 * DESTINO NO REPO: src/components/analytics/PageViewTracker.jsx (ARQUIVO EXISTENTE — substituir por completo)
 *
 * Mudança em relação ao original: chama captureAdsAttribution() a cada
 * mudança de rota, ANTES dos disparos de pixel/analytics existentes.
 * Nenhum comportamento de GA4/Meta Pixel foi alterado.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pixelTrack, pixelLandingPageView } from '@/lib/pixel';
import { trackPageView } from '@/lib/facebook-pixel';
import { captureAdsAttribution } from '@/lib/adsAttribution.js';

const PAGE_VIEW_CONTENT = {
  '/PrestadorFundador': () => pixelLandingPageView(),
  '/Planos': () => pixelTrack('ViewContent', {
    content_name: 'Planos e Preços', content_category: 'pricing',
    content_ids: ['prestador_profissional'], content_type: 'product',
    value: 19.90, currency: 'BRL',
  }),
  '/SejaPrestador': () => pixelTrack('ViewContent', {
    content_name: 'Seja um Prestador', content_category: 'acquisition',
  }),
};

export default function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;

    // [OpenAI Ads] Captura UTM/oppref antes de qualquer disparo de analytics.
    // Puramente local (URL + storage) — não faz chamada de rede nem depende
    // de consentimento (a decisão de consentimento é sobre TRACKING, não
    // sobre capturar/persistir o parâmetro de atribuição em si).
    captureAdsAttribution();

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-3KF75243B4', { page_path: path + location.search });
    }
    trackPageView({ page_path: path + location.search });
    const pageEvent = PAGE_VIEW_CONTENT[path];
    if (pageEvent) pageEvent();
  }, [location.pathname]);
  return null;
}
