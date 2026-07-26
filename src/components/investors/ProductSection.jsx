import { Search, ShieldCheck, ArrowRightCircle } from 'lucide-react';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

const ICONS = [Search, ShieldCheck, ArrowRightCircle];

export default function ProductSection() {
  const { t } = useInvestorLang();
  const p = t.product;

  return (
    <Section id="produto" eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle}>
      <div className="grid md:grid-cols-3 gap-5">
        {p.steps.map((s, i) => {
          const Icon = ICONS[i];
          return (
            <div key={s.n} className="rounded-brand-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-orange-700">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-muted-foreground/60">{s.n}</span>
              </div>
              <h3 className="font-bold text-foreground mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-muted-foreground italic">{p.note}</p>

      <div className="mt-14">
        <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6 max-w-2xl">{p.journeyTitle}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {p.journey.map((j) => (
            <div key={j.n} className="rounded-brand-md bg-sand/50 dark:bg-neutral-900 border border-border p-5">
              <span className="text-xs font-bold text-orange-700">{j.n}</span>
              <h4 className="font-bold text-foreground mt-1">{j.title}</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{j.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
