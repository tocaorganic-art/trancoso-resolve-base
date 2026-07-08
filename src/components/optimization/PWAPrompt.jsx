import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export default function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 15 seconds of user engagement
      setTimeout(() => {
        if (!localStorage.getItem('pwa_prompt_dismissed')) {
          setShowPrompt(true);
        }
      }, 15000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      localStorage.setItem('pwa_installed', 'true');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Instalar App</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Instale o Trancoso Resolve na sua tela inicial para acesso mais rápido e funcionamento offline.
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
          >
            Agora não
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
}