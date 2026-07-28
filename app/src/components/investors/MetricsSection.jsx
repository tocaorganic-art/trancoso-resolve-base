/**
 * MetricsSection — KPIs animados com AnimatedCounter + tabela existente preservada.
 * Os dados numéricos (MRR ilustrativo, ARR, prestadores) vêm do content.js
 * e são classificados como 'cenario' — nunca como resultado real.
 */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Section from './Section';
import AnimatedCounter from './AnimatedCounter';
import { useInvestorLang } from './InvestorLangContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerContainer, staggerItem, staticVariant } from '@/lib/animationVariants';

// Métricas financeiras ilustrativas extraídas do content.js
// Classificação: cenario (não são tração real)
const HIGHLIGHT_COUNTERS = [
  {
    value: 500,
    prefix: '',
    suffix: ' prestadores',
    decimals: 0,
    label: 'Meta de prestadores pagantes',
    period: 'Cenário de referência do modelo',
    classification: 'hipotese',
    classLabel: 'Hipótese',
    description: 'Número de referência para o cenário base de MRR. Não é tração atual.',
    source: 'Modelo financeiro Trancoso Resolve 2026',
  },
  {
    value: 29.5,
    prefix: 'R$ ',
    suffix: ' mil',
    decimals: 1,
    label: 'MRR ilustrativo',
    period: 'Cenário base · 500 prestadores pagantes',
    classification: 'cenario',
    classLabel: 'Cenário ilustrativo',
    description: 'Receita Recorrente Mensal hipotética. Fórmula: prestadores × mix de planos. Não é receita atual.',
    source: 'Modelo financeiro Trancoso Resolve 2026',
  },
  {
    value: 354,
    prefix: 'R$ ',
    suffix: ' mil',
    decimals: 0,
    label: 'ARR run-rate ilustrativo',
    period: 'Cenário base anualizado',
    classification: 'cenario',
    classLabel: 'Cenário ilustrativo',
    description: 'Receita Anual Recorrente hipotética (MRR × 12). Não é forecast aprovado.',
    source: 'Modelo financeiro Trancoso Resolve 2026',
  },
];

export default function MetricsSection() {
  const { t } = useInvestorLang();
  const m = t.metrics;
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  const containerVariant = reduced ? staticVariant : staggerContainer(0.12, 0.05);
  const itemVariant      = reduced ? staticVariant : staggerItem;

  return (
    <Section eyebrow={m.eyebrow} title={m.title} subtitle={m.subtitle}>
      {/* Contadores animados */}
      <motion.div
        ref={ref}
        variants={containerVariant}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid sm:grid-cols-3 gap-4 mb-12"
      >
        {HIGHLIGHT_COUNTERS.map((c) => (
          <motion.div key={c.label} variants={itemVariant}>
            <AnimatedCounter {...c} />
          </motion.div>
        ))}
      </motion.div>

      {/* Tabela de KPIs — preservada do original */}
      <div className="space-y-8">
        {m.groups.map((group) => (
          <div key={group.phase}>
            <span className="inline-block rounded-pill bg-brand-primary/10 text-orange-700 text-xs font-bold px-3 py-1 mb-3">
              {group.phase}
            </span>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-sand/60 dark:bg-neutral-900 border-b border-border">
                    {m.columns.map((col) => (
                      <th key={col} scope="col" className="text-left p-3 font-bold text-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {group.items.map((item, i) => (
                    <tr key={item.kpi} className={i !== group.items.length - 1 ? 'border-b border-border' : ''}>
                      <td className="p-3 font-semibold text-foreground align-top">{item.kpi}</td>
                      <td className="p-3 text-muted-foreground align-top">{item.def}</td>
                      <td className="p-3 text-muted-foreground align-top whitespace-nowrap">{item.freq}</td>
                      <td className="p-3 align-top whitespace-nowrap">
                        <span className="rounded-pill bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
