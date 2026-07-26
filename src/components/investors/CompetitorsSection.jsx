import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function CompetitorsSection() {
  const { t } = useInvestorLang();
  const c = t.competitors;

  return (
    <Section eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="grid sm:grid-cols-2 gap-5">
        {c.items.map((i) => (
          <div key={i.name} className="rounded-brand-lg border border-border bg-card p-6">
            <h3 className="font-bold text-foreground mb-2">{i.name}</h3>
            <p className="text-sm text-muted-foreground mb-2"><span className="font-semibold text-foreground/80">+</span> {i.strength}</p>
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-orange-700">→</span> {i.gap}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
