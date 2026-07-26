import { motion } from 'framer-motion';
import { Download, MessageCircle, MapPin } from 'lucide-react';
import { useInvestorLang } from './InvestorLangContext';

export default function InvestorHero() {
  const { t } = useInvestorLang();
  const h = t.hero;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section className="relative overflow-hidden bg-[#1A1208] text-white">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(60% 50% at 20% 10%, rgba(232,87,26,0.35), transparent), radial-gradient(50% 40% at 90% 20%, rgba(107,124,58,0.25), transparent)',
        }}
        aria-hidden="true"
      />
      <div className="relative container mx-auto px-4 max-w-6xl py-20 md:py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-pill border border-orange-400/40 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-300 mb-6">
            {h.badge}
          </span>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-white/60 mb-4">
            <MapPin className="w-4 h-4" /> {h.eyebrow}
          </p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] max-w-3xl">
            {h.title}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed">{h.subtitle}</p>
          <p className="mt-4 text-base text-white/60 max-w-2xl">{h.context}</p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => scrollTo('downloads')}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand-primary text-white font-bold px-6 py-3.5 shadow-brand hover:bg-brand-primary-hover transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" /> {h.ctaPrimary}
            </button>
            <button
              onClick={() => scrollTo('contato')}
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/25 text-white font-bold px-6 py-3.5 hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> {h.ctaSecondary}
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {h.stripe.map((s) => (
              <span key={s} className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                · {s}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
