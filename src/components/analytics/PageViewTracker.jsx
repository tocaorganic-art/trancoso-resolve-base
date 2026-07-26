import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pixelTrack, pixelLandingPageView } from '@/lib/pixel';

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
    const path = location.pathname;

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-3KF75243B4', {
        page_path: path + location.search,
      });
    }

    // Meta Pixel — PageView em todas as rotas
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    // Eventos específicos por rota
    const pageEvent = PAGE_VIEW_CONTENT[path];
    if (pageEvent) {
      pageEvent();
    }
  }, [location.pathname]);

  return null;
}