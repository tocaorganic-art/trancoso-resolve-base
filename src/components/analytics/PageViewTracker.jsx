import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pixelTrack, pixelLandingPageView } from '@/lib/pixel';
import { trackPageView } from '@/lib/facebook-pixel';
import { CONSENT_CHANGED_EVENT } from '@/utils/consent.js';

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

  useEffect(() => {
    const trackCurrentPage = () => {
      const path = location.pathname;

      // Google Analytics 4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'G-3KF75243B4', {
          page_path: path + location.search,
        });
      }

      // Meta Pixel — PageView em todas as rotas (fonte única de PageView)
      trackPageView({ page_path: path + location.search });

      // Eventos específicos por rota
      const pageEvent = PAGE_VIEW_CONTENT[path];
      if (pageEvent) {
        pageEvent();
      }
    };

    trackCurrentPage();

    // Se o consentimento de marketing chegar depois do mount inicial (usuário
    // aceita cookies no meio da sessão), reenvia o PageView da rota atual —
    // até então `trackPageView` era um no-op silencioso por falta de consentimento.
    window.addEventListener(CONSENT_CHANGED_EVENT, trackCurrentPage);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, trackCurrentPage);
  }, [location.pathname, location.search]);

  return null;
}
