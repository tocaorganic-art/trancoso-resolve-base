/**
 * ScenarioChartSection — gráfico de cenário de sensibilidade com ChartFrame.
 * Lógica de fórmula preservada integralmente. Só a apresentação foi melhorada.
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Section from './Section';
import ChartFrame from './ChartFrame';
import AnimatedCounter from './AnimatedCounter';
import { useInvestorLang } from './InvestorLangContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ─── Fórmula idêntica à original ──────────────────────────────────────────────
const DENSITY_SCENARIOS = [100, 250, 500, 1000];
const FUNDADOR_PRICE = 19.9;
const PROFISSIONAL_PRICE = 59;

function formatBRL(value) {
  return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

const SERIES = [
  { key: 'fundador',     label: 'Plano Fundador',     color: '#6B7C3A' },
  { key: 'profissional', label: 'Plano Profissional',  color: '#E8571A' },
];

export default function ScenarioChartSection() {
  const { t } = useInvestorLang();
  const s = t.scenarioChart;
  const reduced = useReducedMotion();

  const chartData = DENSITY_SCENARIOS.map((providers) => ({
    providers: `${providers}`,
    fundador: Math.round(providers * FUNDADOR_PRICE),
    profissional: Math.round(providers * PROFISSIONAL_PRICE),
  }));

  // Dados tabulares para acessibilidade
  const tableData = chartData.map(row => ({
    'Prestadores': row.providers,
    'Fundador (MRR)': formatBRL(row.fundador),
    'Profissional (MRR)': formatBRL(row.profissional),
    'Total': formatBRL(row.fundador + row.profissional),
  }));

  return (
    <Section eyebrow={s.eyebrow} title={s.title} tone="sand">
      {/* Cards de métricas animados */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {s.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-card border border-border p-5 text-center">
            <p className="text-2xl md:text-3xl font-display font-extrabold text-orange-700">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico com ChartFrame */}
      <ChartFrame
        title={s.chartTitle}
        classification="cenario"
        classLabel="Cenário ilustrativo"
        period="Hipótese · fórmula: prestadores × preço do plano · não é forecast aprovado"
        source="Modelo financeiro interno · Trancoso Resolve 2026"
        series={SERIES}
        tableData={tableData}
      >
        {({ activeKeys, reduced: rm }) => (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={8} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="providers" tick={{ fontSize: 12 }} label={{ value: 'prestadores pagantes', position: 'insideBottom', offset: -2, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatBRL(value)} labelFormatter={(l) => `${l} prestadores`} />
              <Legend />
              {SERIES.map(serie => (
                activeKeys.has(serie.key) && (
                  <Bar
                    key={serie.key}
                    dataKey={serie.key}
                    name={serie.label}
                    fill={serie.color}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={!rm}
                    animationDuration={700}
                  />
                )
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartFrame>

      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-3">{s.formulaNote}</p>
        <p className="text-sm font-bold text-foreground mb-2">{s.exclusionsTitle}</p>
        <div className="flex flex-wrap gap-2">
          {s.exclusions.map((e) => (
            <span key={e} className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {e}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
