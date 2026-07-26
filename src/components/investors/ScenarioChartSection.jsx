import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

// Cenário de sensibilidade por densidade de prestadores pagantes (100/250/500/1000)
// — replica a aba "Receita_18M" do modelo financeiro oficial (fórmula: prestadores × preço).
const DENSITY_SCENARIOS = [100, 250, 500, 1000];
const FUNDADOR_PRICE = 19.9;
const PROFISSIONAL_PRICE = 59;

function formatBRL(value) {
  return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

export default function ScenarioChartSection() {
  const { t } = useInvestorLang();
  const s = t.scenarioChart;

  const chartData = DENSITY_SCENARIOS.map((providers) => ({
    providers: `${providers}`,
    fundador: Math.round(providers * FUNDADOR_PRICE),
    profissional: Math.round(providers * PROFISSIONAL_PRICE),
  }));

  return (
    <Section eyebrow={s.eyebrow} title={s.title} tone="sand">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {s.stats.map((stat) => (
          <div key={stat.label} className="rounded-brand-lg bg-card border border-border p-5 text-center">
            <p className="text-2xl md:text-3xl font-display font-extrabold text-orange-700">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-brand-lg bg-card border border-border p-4 md:p-6">
        <h3 className="font-bold text-foreground mb-4">{s.chartTitle}</h3>
        <div className="h-72 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="providers" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatBRL(value)} labelFormatter={(l) => `${l} prestadores`} />
              <Legend />
              <Bar dataKey="fundador" name={s.chartLegendFundador} fill="#6B7C3A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="profissional" name={s.chartLegendProfissional} fill="#E8571A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{s.formulaNote}</p>
      </div>

      <div className="mt-6">
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
