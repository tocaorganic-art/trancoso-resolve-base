import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * CookieConsent — LGPD Compliant
 *
 * O index.html configura GTM Consent Mode v2 com tudo negado por padrão.
 * Este componente:
 *   - No ACEITE: libera analytics/ads e dispara os eventos de PageView
 *     que foram bloqueados até o consentimento.
 *   - Na REJEIÇÃO: mantém tudo negado (apenas cookies necessários).
 *   - Na MONTAGEM: lê consentimento prévio — se já existe, não exibe o banner.
 */
export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Pequeno delay para não competir com o LCP
      const t = setTimeout(() => setShowConsent(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      analytics: true,
      marketing: true,
      necessary: true,
      timestamp: new Date().toISOString()
    }));
    setShowConsent(false);

    // Libera o Consent Mode v2 do GTM
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });

      // Dispara page_view do GA4 que foi suprimido no carregamento inicial
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title
      });
    }

    // Dispara PageView do Meta Pixel que foi suprimido no carregamento inicial
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      analytics: false,
      marketing: false,
      necessary: true,
      timestamp: new Date().toISOString()
    }));
    setShowConsent(false);

    // Garante que o consentimento permanece negado
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  };

  if (!showConsent) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 p-4 md:p-6"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-white mb-2">Consentimento de Cookies</h3>
            <p className="text-sm text-slate-300">
              Usamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo.
              Ao continuar, você concorda com nossa{' '}
              <a href="/PoliticaPrivacidade" className="underline text-blue-400">
                Política de Privacidade
              </a>.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-sm border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Rejeitar
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-blue-600 hover:bg-blue-700 text-sm"
            >
              Aceitar
            </Button>
          </div>
          <button
            onClick={handleReject}
            className="absolute top-2 right-2 md:hidden"
            aria-label="Fechar banner de cookies"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
