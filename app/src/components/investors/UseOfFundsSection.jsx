/**
 * UseOfFundsSection — uso do capital com donut animado + cards com entrada progressiva.
 *
 * Melhorias vs. original:
 *  - Donut com animação de entrada (isAnimationActive controlado por reduced-motion)
 *  - Cards com stagger e badge de classificação
 *  - Tabela textual acessível via ChartFrame
 *  - Linha de "informação pendente" quando rodada/valor não definido
 *
 * Dados: inteiramente do content.js (t.useOfFunds). Nada inventado.
 */
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Section from './Section';
import ChartFrame from './ChartFrame';
import { useInvestorLang } from './InvestorLangContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerContainer, staggerItem, staticVariant } from '@/lib/animationVariants';

const COLORS = ['#E8571A', '#6B7C3A', '#2D7D8A', '#9B59B6', '#E67E22'];

export default function UseOfFundsSection() {
  const { t } = useInvestorLang();
  const u = t.useOfFunds;
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });

  const data = u.items.map((item) => ({
    name: `${item.label} (${item.pct}%)`,
    value: item.pct,
  }));

  const tableData = u.items.map((item, i) => ({
    'Categoria': item.label,
    'Percentual': `${item.pct}%`,
    'Finalidade': item.desc,
  }));

  const series = u.items.map((item, i) => ({
    key: item.label,
    label: item.label,
    color: COLORS[i % COLORS.length],
  }));

  const containerV = reduced ? staticVariant : staggerContainer(0.1, 0.08);
  const itemV      = reduced ? staticVariant : staggerItem;

  return (
    <Section eyebrow={u.eyebrow} title={u.title} subtitle={u.subtitle} tone="sand">
      {/* Aviso se valor da rodada não definido */}
      {(!u.roundValue || u.roundValue === 'pendente') && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 px-5 py-3 text-sm text-amber-800 dark:text-amber-300 font-semibold">
          ℹ️ O valor total da rodada ainda está em definição. Os percentuais abaixo representam a distribuição relativa planejada.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Donut com ChartFrame */}
        <ChartFrame
          title="Distribuição do capital por categoria"
          classification="hipotese"
          classLabel="Hipótese"
          period="Distribuição relativa planejada · valor total da rodada a definir"
          source="Plano interno Trancoso Resolve 2026"
          series={[]}
          tableData={tableData}
        >
          {({ reduced: rm }) => (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  isAnimationActive={!rm}
                  animationDuration={900}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartFrame>

        {/* Cards de categoria */}
        <motion.div
          ref={ref}
          variants={containerV}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-3"
        >
          {u.items.map((item, i) => (
            <motion.div
              key={item.label}
              variants={itemV}
              className="rounded-2xl bg-card border border-border p-5 hover:shadow-warm-sm transition-shadow"
            >
              <div className="flex items-center gap-3 mb-1.5">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                  aria-hidden="true"
                />
                <h4 className="font-bold text-foreground">{item.label}</h4>
                <span className="ml-auto font-display font-extrabold text-orange-700 text-lg">
                  {item.pct}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
