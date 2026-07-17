import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Search, Star, MessageCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const STORAGE_KEY = 'tr_onboarding_done';

const steps = [
  {
    icon: <Search className="w-10 h-10 text-cyan-500" />,
    title: "Encontre o profissional certo",
    description: "Use a busca inteligente para descrever o que você precisa — ex: 'preciso de uma faxineira para amanhã' — e a IA encontra os melhores profissionais.",
    color: "from-cyan-50 to-blue-50",
    border: "border-cyan-200",
  },
  {
    icon: <Star className="w-10 h-10 text-yellow-500" />,
    title: "Profissionais verificados",
    description: "Todos os prestadores passam por verificação de identidade. Veja avaliações reais de outros clientes antes de contratar.",
    color: "from-yellow-50 to-amber-50",
    border: "border-yellow-200",
  },
  {
    icon: <MessageCircle className="w-10 h-10 text-green-500" />,
    title: "Chat direto e seguro",
    description: "Converse diretamente com o profissional pelo chat da plataforma. Combine detalhes, datas e valores com segurança.",
    color: "from-green-50 to-emerald-50",
    border: "border-green-200",
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Delay pequeno para não aparecer imediatamente na carga
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  const current = steps[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={`pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-sm border-2 ${current.border} overflow-hidden`}>
              {/* Header */}
              <div className={`bg-gradient-to-br ${current.color} p-8 text-center relative`}>
                <button
                  onClick={dismiss}
                  className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <motion.div
                  key={step}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md">
                    {current.icon}
                  </div>
                </motion.div>

                <motion.h2
                  key={`title-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-slate-900 mb-2"
                >
                  {current.title}
                </motion.h2>
                <motion.p
                  key={`desc-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-sm text-slate-600"
                >
                  {current.description}
                </motion.p>
              </div>

              {/* Footer */}
              <div className="p-5">
                {/* Dots */}
                <div className="flex justify-center gap-2 mb-5">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === step ? 'w-6 h-2 bg-cyan-500' : 'w-2 h-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={dismiss} className="flex-1 text-slate-500">
                    Pular
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button onClick={next} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 gap-1">
                      Próximo <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Link to={createPageUrl("ServicosCategoria")} className="flex-1" onClick={dismiss}>
                      <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 gap-1">
                        Explorar <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}