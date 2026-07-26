import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

const COLORS = ['#E8571A', '#6B7C3A', '#2D7D8A'];

export default function UseOfFundsSection() {
  const { t } = useInvestorLang();
  const u = t.useOfFunds;

  const data = u.items.map((item) => ({ name: `${item.label} (${item.pct}%)`, value: item.pct }));

  return (
    <Section eyebrow={u.eyebrow} title={u.title} subtitle={u.subtitle} tone="sand">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {u.items.map((item, i) => (
            <div key={item.label} className="rounded-brand-lg bg-card border border-border p-5">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <h4 className="font-bold text-foreground">{item.label}</h4>
                <span className="ml-auto font-display font-extrabold text-orange-700">{item.pct}%</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
