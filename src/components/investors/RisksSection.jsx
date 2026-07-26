import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

const IMPACT_STYLES = {
  Crítico: 'bg-[#D7382B]/10 text-[#D7382B]',
  Alto: 'bg-[#E59A12]/10 text-[#E59A12]',
  Critical: 'bg-[#D7382B]/10 text-[#D7382B]',
  High: 'bg-[#E59A12]/10 text-[#E59A12]',
  Crítica: 'bg-[#D7382B]/10 text-[#D7382B]',
};

export default function RisksSection() {
  const { t } = useInvestorLang();
  const r = t.risks;

  return (
    <Section eyebrow={r.eyebrow} title={r.title} tone="sand">
      <div className="grid md:grid-cols-3 gap-5">
        {r.items.map((item) => (
          <div key={item.risk} className="rounded-brand-lg bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h3 className="font-bold text-foreground">{item.risk}</h3>
              <span className={`rounded-pill px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${IMPACT_STYLES[item.impact] || 'bg-muted text-muted-foreground'}`}>
                {item.impact}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground/70">{item.status}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm font-semibold text-foreground/80">{r.note}</p>
    </Section>
  );
}
