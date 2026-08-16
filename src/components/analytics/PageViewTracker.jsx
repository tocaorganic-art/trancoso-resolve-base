import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { pixelTrack, pixelLandingPageView } from '@/lib/pixel';
import { trackPageView } from '@/lib/facebook-pixel';
import { captureAdsAttribution } from '@/lib/adsAttribution.js';
import {
  CONSENT_CHANGED_EVENT,
  hasAnalyticsConsent,
  hasMarketingConsent,
  trackAnalyticsPageView,
} from '@/utils/consent.js';

// Rotas que disparam ViewContent específico no Pixel
const PAGE_VIEW_CONTENT = {
  '/PrestadorFundador': () => pixelLandingPageView(),
  '/Planos': () => pixelTrack('ViewContent', {
    content_name: 'Planos e Preços',
    content_category: 'pricing',
    content_ids: ['prestador_profissional'],
    content_type: 'product',
    value: 19.90,
    currency: 'BRL',
  }),
  '/SejaPrestador': () => pixelTrack('ViewContent', {
    content_name: 'Seja um Prestador',
    content_category: 'acquisition',
  }),
};

export default function PageViewTracker() {
  const location = useLocation();
  const analyticsPageRef = useRef(null);
  const marketingPageRef = useRef(null);

  useEffect(() => {
    const pageKey = location.pathname + location.search;
    const trackCurrentPage = () => {
      const path = location.pathname;

      // [OpenAI Ads] Captura UTM/oppref antes de qualquer disparo de analytics.
      // Puramente local (URL + storage) — não faz chamada de rede nem depende
      // de consentimento (a decisão de consentimento é sobre TRACKING, não
      // sobre capturar/persistir o parâmetro de atribuição em si).
      captureAdsAttribution();

      if (hasAnalyticsConsent() && analyticsPageRef.current !== pageKey) {
        if (trackAnalyticsPageView({
          page_path: path + location.search,
        })) analyticsPageRef.current = pageKey;
      }

      // Meta Pixel — no máximo um PageView por rota e carregamento.
      if (!hasMarketingConsent() || marketingPageRef.current === pageKey) return;

      if (!trackPageView({ page_path: pageKey })) return;

      // Eventos específicos por rota
      const pageEvent = PAGE_VIEW_CONTENT[path];
      if (pageEvent) {
        pageEvent();
      }
      marketingPageRef.current = pageKey;
    };

    trackCurrentPage();

    // Se o consentimento chegar depois do mount, rastreia a rota atual uma vez.
    window.addEventListener(CONSENT_CHANGED_EVENT, trackCurrentPage);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, trackCurrentPage);
  }, [location.pathname, location.search]);

  return null;
}
