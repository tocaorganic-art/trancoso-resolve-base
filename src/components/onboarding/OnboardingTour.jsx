import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Bell, Zap, Download } from 'lucide-react';

const STORAGE_KEY = 'tr_onboarding_done';

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-amber-100">

              {/* Header — gradiente terra */}
              <div className="bg-gradient-to-br from-amber-600 to-amber-800 px-6 pt-8 pb-6 text-center relative">
                {/* Ícone central */}
                <div className="mx-auto w-20 h-20 bg-white/15 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/20">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2 leading-snug">
                  Baixe o App<br />Trancoso Resolve
                </h2>
                <p className="text-amber-100 text-sm leading-relaxed">
                  Acesso direto a profissionais verificados, atualizações em tempo real e notificações do seu pedido — tudo na palma da mão.
                </p>
              </div>

              {/* Benefícios rápidos */}
              <div className="px-6 py-4 space-y-2 bg-amber-50/60">
                {[
                  { icon: <Zap className="w-4 h-4 text-amber-600" />, text: 'Solicite serviços em segundos' },
                  { icon: <Bell className="w-4 h-4 text-amber-600" />, text: 'Notificações em tempo real' },
                  { icon: <Download className="w-4 h-4 text-amber-600" />, text: 'Acesso offline ao seu histórico' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-stone-700">
                    {icon}
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Botões de download */}
              <div className="px-6 pb-6 pt-4 space-y-3">
                {/* App Store */}
                <a
                  href="https://apps.apple.com/app/trancoso-resolve"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="flex items-center justify-center gap-3 w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-3 px-4 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-stone-300 leading-none">Baixar na</p>
                    <p className="text-sm font-semibold leading-tight">App Store</p>
                  </div>
                </a>

                {/* Google Play */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.trancosoresolve"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="flex items-center justify-center gap-3 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3 px-4 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.3.17.64.24.99.2l12.7-7.34-2.75-2.75-10.94 9.89zm17.12-10.62L17.44 11.5l-2.98 2.98 2.86 2.86 3-1.73c.86-.5.86-1.87-.02-2.37zM2.01 1.16C1.7 1.48 1.5 2 1.5 2.67v18.67c0 .67.2 1.17.51 1.5l.08.07L13.12 12 2.09 1.09l-.08.07zm11.55 10.34L3.18 1.24c.06-.06.13-.1.19-.14L15.96 9.05l-2.4 2.45z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-amber-100 leading-none">Disponível no</p>
                    <p className="text-sm font-semibold leading-tight">Google Play</p>
                  </div>
                </a>

                {/* Continuar no site */}
                <button
                  onClick={dismiss}
                  className="w-full text-sm text-stone-500 hover:text-stone-700 py-2 transition-colors"
                >
                  Continuar no site →
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
