import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Star, ArrowRight, Home } from 'lucide-react';

const Particle = ({ delay, x, size }) => (
  <motion.div
    className="absolute rounded-full bg-orange-400/20 pointer-events-none"
    style={{ width: size, height: size, left: `${x}%`, top: '10%' }}
    animate={{ y: [0, -80, 0], opacity: [0, 0.6, 0], scale: [1, 1.4, 1] }}
    transition={{ duration: 3 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const TIMELINE = [
  { label: 'Enviada', color: 'text-green-400', dot: 'bg-green-400' },
  { label: 'Aguardando', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' },
  { label: 'Realizado', color: 'text-slate-500', dot: 'bg-slate-600' },
];

export default function SolicitacaoConfirmadaPage() {
  useEffect(() => {
    document.title = "Solicitação Enviada! — Trancoso Resolve";
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#1a0c00] via-[#2d1200] to-[#1a0c00] overflow-hidden flex items-center justify-center pb-16">
      {/* Aurora blobs */}
      <motion.div
        className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full bg-orange-600/20 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-amber-500/15 blur-[90px] pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Partículas */}
      {[{ delay: 0, x: 10, size: 8 }, { delay: 0.8, x: 30, size: 5 }, { delay: 1.5, x: 60, size: 10 }, { delay: 0.3, x: 80, size: 6 }, { delay: 1.2, x: 50, size: 7 }].map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <div className="relative z-10 text-center px-6 pt-4 w-full max-w-md mx-auto">

        {/* Ícone de sucesso com anel pulsante */}
        <div className="relative mx-auto w-28 h-28 mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-500/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-green-500/25"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-green-500/15 border border-green-500/30"
          >
            <CheckCircle className="w-12 h-12 text-green-400" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Texto principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl font-extrabold text-white mb-3"
        >
          Solicitação enviada{' '}
          <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            com sucesso!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="text-slate-300 text-sm leading-relaxed mb-10"
        >
          Em breve o prestador entrará em contato pelo WhatsApp ou telefone informado.
        </motion.p>

        {/* Timeline animada */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex items-center justify-between px-2 mb-10"
        >
          {TIMELINE.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.6 + i * 0.15 }}
                  className={`w-3 h-3 rounded-full ${step.dot}`}
                />
                <span className={`text-[10px] font-semibold ${step.color}`}>{step.label}</span>
              </div>
              {i < TIMELINE.length - 1 && (
                <div className="flex-1 mx-2 h-px bg-white/10 mb-4" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Card de info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-semibold">Próximos passos</span>
          </div>
          <ul className="space-y-2 text-slate-300 text-xs leading-relaxed">
            {[
              'O prestador recebeu sua solicitação e irá entrar em contato em breve.',
              'Aguarde o contato e combine todos os detalhes diretamente com ele.',
              'Após o serviço, não esqueça de deixar sua avaliação!',
            ].map((text, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + i * 0.1, duration: 0.35 }}
                className="flex items-start gap-2"
              >
                <Star className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" /> {text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            whileHover={{ y: -2 }}
          >
            <Link to={createPageUrl("ServicosCategoria")}>
              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/30">
                Ver mais prestadores <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            whileHover={{ y: -2 }}
          >
            <Link to="/">
              <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-medium flex items-center justify-center gap-2 transition-all">
                <Home className="w-4 h-4" /> Voltar para o início
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}