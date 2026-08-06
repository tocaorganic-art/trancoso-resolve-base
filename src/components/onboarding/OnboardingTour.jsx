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

              {/* Botão de download */}
              <div className="px-6 pb-6 pt-4 space-y-3">
                {/* Baixar Agora */}
                <a
                  href="https://trancosoresolve.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="flex items-center justify-center gap-3 w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3 px-4 transition-colors font-semibold text-base"
                >
                  <Download className="w-5 h-5" />
                  Baixar Agora
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
