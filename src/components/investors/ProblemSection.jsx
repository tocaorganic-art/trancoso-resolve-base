import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function ProblemSection() {
  const { t } = useInvestorLang();
  const p = t.problem;

  return (
    <Section id="problema" eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle}>
      <div className="grid md:grid-cols-2 gap-5">
        {p.cards.map((c) => (
          <div key={c.title} className="rounded-brand-lg border border-border bg-card p-6 md:p-8">
            <h3 className="text-lg font-bold text-foreground mb-2">{c.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm font-semibold text-orange-700 dark:text-orange-400">{p.closing}</p>
    </Section>
  );
}
