/**
 * InvestorHero — hero imersivo com entrada progressiva por blocos semânticos.
 *
 * Sequência de animação:
 *   1. Badge + eyebrow (fade)
 *   2. Título principal (revelar por palavra — maskReveal)
 *   3. Subtítulo (fadeUp)
 *   4. Context (fadeUp, delay)
 *   5. CTAs (fadeUp, delay maior)
 *   6. Stripe de credenciais (fade suave)
 *   7. Scroll indicator pulsante
 *
 * prefers-reduced-motion: tudo aparece imediatamente, sem transições.
 */
import { motion } from 'framer-motion';
import { Download, MessageCircle, MapPin, ChevronDown } from 'lucide-react';
import { useInvestorLang } from './InvestorLangContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ─── variantes locais do hero ─────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const immediate = { hidden: { opacity: 1 }, visible: { opacity: 1 } };

const fadeWord = (delay = 0) => ({
  hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE, delay },
  },
});

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay },
  },
});

const fadePure = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut', delay } },
});

/* ─── Componente ────────────────────────────────────────────────────────────── */
export default function InvestorHero() {
  const { t } = useInvestorLang();
  const h = t.hero;
  const reduced = useReducedMotion();

  const v = (animated) => (reduced ? immediate : animated);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* Divide o título em palavras para animação de reveal por palavra */
  const titleWords = (h.title || '').split(' ');

  return (
    <section
      className="relative overflow-hidden bg-[#1A1208] text-white"
      aria-label="Apresentação — Trancoso Resolve para Investidores"
    >
      {/* Gradiente de fundo — profundidade sutil */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: [
            'radial-gradient(65% 55% at 15% 8%, rgba(232,87,26,0.32), transparent)',
            'radial-gradient(55% 45% at 88% 18%, rgba(107,124,58,0.22), transparent)',
            'radial-gradient(40% 35% at 50% 85%, rgba(232,87,26,0.10), transparent)',
          ].join(', '),
        }}
      />

      {/* Grade decorativa sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative container mx-auto px-4 max-w-6xl py-20 md:py-32 lg:py-36">

        {/* 1 — Badge + location */}
        <motion.div
          variants={v(fadePure(0))}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-7"
        >
          <span className="inline-flex items-center gap-2 rounded-pill border border-orange-400/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-300">
            {h.badge}
          </span>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-white/50">
            <MapPin className="w-4 h-4 text-orange-400" aria-hidden="true" />
            {h.eyebrow}
          </p>
        </motion.div>

        {/* 2 — Título: reveal por palavra */}
        <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.025em] max-w-3xl mb-6">
          {reduced ? (
            h.title
          ) : (
            titleWords.map((word, i) => (
              <motion.span
                key={i}
                variants={fadeWord(0.08 + i * 0.07)}
                initial="hidden"
                animate="visible"
                className="inline-block mr-[0.25em]"
                aria-hidden="true"
              >
                {word}
              </motion.span>
            ))
          )}
          {/* Texto para screen readers — título completo de uma vez */}
          {!reduced && <span className="sr-only">{h.title}</span>}
        </h1>

        {/* 3 — Subtítulo */}
        <motion.p
          variants={v(fadeUp(0.55))}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed mb-4"
        >
          {h.subtitle}
        </motion.p>

        {/* 4 — Contexto */}
        <motion.p
          variants={v(fadeUp(0.70))}
          initial="hidden"
          animate="visible"
          className="text-base text-white/55 max-w-2xl mb-10"
        >
          {h.context}
        </motion.p>

        {/* 5 — CTAs */}
        <motion.div
          variants={v(fadeUp(0.85))}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => scrollTo('downloads')}
            className="
              group inline-flex items-center justify-center gap-2
              rounded-pill bg-brand-primary text-white font-bold px-7 py-3.5
              shadow-brand hover:bg-brand-primary-hover
              transition-all duration-200
              hover:scale-[1.03] active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
            "
          >
            <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
            {h.ctaPrimary}
          </button>

          <button
            onClick={() => scrollTo('contato')}
            className="
              inline-flex items-center justify-center gap-2
              rounded-pill border border-white/25 text-white font-bold px-7 py-3.5
              hover:bg-white/10 hover:border-white/40
              transition-all duration-200 active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
            "
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            {h.ctaSecondary}
          </button>
        </motion.div>

        {/* 6 — Stripe de credenciais */}
        <motion.div
          variants={v(fadePure(1.1))}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Aspectos da tese"
        >
          {(h.stripe || []).map((s) => (
            <span key={s} className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              · {s}
            </span>
          ))}
        </motion.div>
      </div>

      {/* 7 — Scroll indicator */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30"
          aria-hidden="true"
        >
          <span className="text-[10px] uppercase tracking-widest font-semibold">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
