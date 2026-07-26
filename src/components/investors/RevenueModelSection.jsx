import Section from './Section';
import ClassificationBadge from './ClassificationBadge';
import { useInvestorLang } from './InvestorLangContext';

export default function RevenueModelSection() {
  const { t } = useInvestorLang();
  const r = t.revenueModel;

  return (
    <Section id="receita" eyebrow={r.eyebrow} title={r.title}>
      <div className="grid sm:grid-cols-3 gap-5">
        {r.plans.map((p) => (
          <div key={p.name} className="rounded-brand-lg border border-border bg-card p-6 flex flex-col">
            <ClassificationBadge type={p.classification} label={t.classification[p.classification]} className="w-fit mb-4" />
            <h3 className="font-bold text-foreground text-lg">{p.name}</h3>
            <p className="mt-1 mb-3">
              <span className="text-3xl font-display font-extrabold text-orange-700">{p.price}</span>
              <span className="text-sm text-muted-foreground ml-1">{p.unit}</span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-auto">{p.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm font-semibold text-muted-foreground">{r.disclaimer}</p>
    </Section>
  );
}
