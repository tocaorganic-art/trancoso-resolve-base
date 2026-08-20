/**
 * Plan18MonthsSection — timeline interativa de 18 meses.
 *
 * Melhorias vs. original:
 *  - Fases com estados visuais: planejado / atual / dependente
 *  - Cards de fase com entrada por scroll (stagger)
 *  - Tabela do roadmap com highlight de linha ao hover / teclado
 *  - Navegação por teclado nas fases (tabs)
 *  - prefers-reduced-motion: sem transições, conteúdo completo imediato
 *
 * Lógica e dados: inteiramente do content.js (t.plan18). Nada inventado.
 */
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerContainer, staggerItem, staticVariant } from '@/lib/animationVariants';

// Status visual por fase — ajuste conforme evolução real do projeto
const PHASE_STATUS = ['planejado', 'planejado', 'planejado'];
const STATUS_STYLES = {
  planejado:  { dot: 'bg-muted-foreground/40', badge: 'bg-muted text-muted-foreground',         label: 'Planejado' },
  atual:      { dot: 'bg-brand-primary animate-pulse', badge: 'bg-brand-primary/10 text-orange-700', label: 'Em andamento' },
  concluido:  { dot: 'bg-[#6B7C3A]',           badge: 'bg-[#6B7C3A]/10 text-[#6B7C3A]',        label: 'Concluído' },
  dependente: { dot: 'bg-amber-500',            badge: 'bg-amber-500/10 text-amber-700',          label: 'Depende de gate' },
};

export default function Plan18MonthsSection() {
  const { t } = useInvestorLang();
  const p = t.plan18;
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  const [activePhase, setActivePhase] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const containerV = reduced ? staticVariant : staggerContainer(0.1, 0.05);
  const itemV      = reduced ? staticVariant : staggerItem;

  return (
    <Section id="plano" eyebrow={p.eyebrow} title={p.title}>
      {/* Fases — cards com stagger e estado */}
      <motion.div
        ref={ref}
        variants={containerV}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid md:grid-cols-3 gap-5 mb-6"
        role="tablist"
        aria-label="Fases do plano de 18 meses"
      >
        {p.phases.map((phase, i) => {
          const status = PHASE_STATUS[i] || 'planejado';
          const st = STATUS_STYLES[status];
          const isActive = activePhase === i;

          return (
            <motion.div
              key={phase.range}
              variants={itemV}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => setActivePhase(isActive ? null : i)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActivePhase(isActive ? null : i)}
              className={`rounded-2xl border bg-card p-6 cursor-pointer transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                ${isActive ? 'border-brand-primary shadow-warm-md' : 'border-border hover:border-brand-primary/40'}`}
            >
              {/* Cabeçalho */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-primary/10 text-orange-700 text-xs font-bold px-3 py-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden="true" />
                  {phase.range}
                </span>
                <span className={`rounded-pill text-xs font-bold px-2.5 py-0.5 ${st.badge}`}>
                  {st.label}
                </span>
              </div>

              <h3 className="font-bold text-foreground mb-1.5">{phase.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <p className="text-sm font-semibold text-foreground/80 mb-10">{p.gate}</p>

      {/* Roadmap — tabela com highlight interativo */}
      <h3 className="text-xl font-bold text-foreground mb-5">{p.roadmapTitle}</h3>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-sand/60 dark:bg-neutral-900 border-b border-border">
              {p.roadmapColumns.map((col) => (
                <th key={col} scope="col" className="text-left p-3 font-bold text-foreground whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card">
            {p.roadmap.map((row, i) => (
              <motion.tr
                key={row.window}
                className={`transition-colors cursor-default ${
                  i !== p.roadmap.length - 1 ? 'border-b border-border' : ''
                } ${hoveredRow === i ? 'bg-brand-primary/5' : ''}`}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                onFocus={() => setHoveredRow(i)}
                onBlur={() => setHoveredRow(null)}
                tabIndex={0}
                aria-label={`Janela ${row.window}`}
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: -8 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <td className="p-3 font-bold text-orange-700 whitespace-nowrap align-top">{row.window}</td>
                <td className="p-3 text-muted-foreground align-top">{row.product}</td>
                <td className="p-3 text-muted-foreground align-top">{row.offer}</td>
                <td className="p-3 text-muted-foreground align-top">{row.demand}</td>
                <td className="p-3 text-muted-foreground align-top">{row.financial}</td>
                <td className="p-3 font-semibold text-foreground/80 align-top">{row.gate}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
