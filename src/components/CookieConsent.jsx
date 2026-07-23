import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
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
    
    // Enable Google Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
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
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-white mb-2">Consentimento de Cookies</h3>
            <p className="text-sm text-slate-300">
              Usamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo. 
              Ao continuar, você concorda com nossa <a href="/PoliticaPrivacidade" className="underline text-orange-300">Política de Privacidade</a>.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-sm"
            >
              Rejeitar
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-orange-600 hover:bg-orange-700 text-sm"
            >
              Aceitar
            </Button>
          </div>
          <button
            onClick={handleReject}
            className="absolute top-2 right-2 md:hidden"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}