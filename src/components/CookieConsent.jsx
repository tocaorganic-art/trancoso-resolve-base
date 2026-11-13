import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_REOPEN_EVENT,
  clearConsent,
  readConsent,
  saveConsent,
} from '@/utils/consent.js';

export default function CookieConsent() {
  const { t } = useApp();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  // LGPD: link do rodapé (gerenciar cookies) reabre o banner,
  // limpando a escolha anterior para o usuário decidir de novo.
  useEffect(() => {
    const handleReopen = () => {
      clearConsent();
      setShowConsent(true);
    };
    window.addEventListener(CONSENT_REOPEN_EVENT, handleReopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, handleReopen);
  }, []);

  const handleAccept = () => {
    const consent = saveConsent({ analytics: true, marketing: true });
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: consent }));
    setShowConsent(false);
  };

  const handleReject = () => {
    const consent = saveConsent({ analytics: false, marketing: false });
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: consent }));
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-white mb-2">{t('cookie.title')}</h3>
            <p className="text-sm text-slate-300">
              {t('cookie.text')}{' '}
              <a href="/PoliticaPrivacidade" className="underline text-orange-300">{t('cookie.privacy')}</a>.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-sm"
            >
              {t('cookie.reject')}
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-brand-primary hover:bg-brand-primary-hover text-sm"
            >
              {t('cookie.accept')}
            </Button>
          </div>
          <button
            onClick={handleReject}
            className="absolute top-2 right-2 md:hidden"
            aria-label={t('cookie.close')}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
