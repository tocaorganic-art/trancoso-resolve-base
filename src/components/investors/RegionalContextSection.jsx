import Section from './Section';
import ClassificationBadge from './ClassificationBadge';
import { useInvestorLang } from './InvestorLangContext';

export default function RegionalContextSection() {
  const { t } = useInvestorLang();
  const r = t.regionalContext;

  return (
    <Section eyebrow={r.eyebrow} title={r.title} tone="sand">
      <div className="flex justify-end mb-4">
        <ClassificationBadge type="fonteExterna" label={t.classification.fonteExterna} />
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {r.stats.map((s) => (
          <div key={s.label} className="rounded-brand-lg bg-card border border-border p-6 text-center">
            <p className="text-3xl md:text-4xl font-display font-extrabold text-orange-700">{s.value}</p>
            <p className="mt-2 text-sm text-muted-foreground leading-snug">{s.label}</p>
            <p className="mt-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">{s.source}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground italic max-w-2xl">{r.disclaimer}</p>
    </Section>
  );
}
