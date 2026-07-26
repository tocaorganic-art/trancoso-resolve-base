import { AlertTriangle } from 'lucide-react';
import Section from './Section';
import ClassificationBadge from './ClassificationBadge';
import { useInvestorLang } from './InvestorLangContext';

export default function ReturnsSection() {
  const { t } = useInvestorLang();
  const r = t.returns;

  return (
    <Section eyebrow={r.eyebrow} title={r.title}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {r.phases.map((p) => (
          <div key={p.range} className="rounded-brand-lg bg-card border border-border p-5 text-center">
            <p className="text-2xl font-display font-extrabold text-orange-700">{p.range}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-snug">{p.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-brand-lg border border-[#D7382B]/25 bg-[#D7382B]/5 p-6 mb-8">
        <p className="flex items-center gap-2 font-bold text-[#D7382B] mb-2">
          <AlertTriangle className="w-5 h-5" /> {r.body}
        </p>
      </div>

      <div className="rounded-brand-lg border border-border bg-card p-6">
        <h3 className="font-bold text-foreground mb-2">{r.pendingTitle}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{r.pendingBody}</p>
        <div className="flex flex-wrap gap-2">
          {r.pendingItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <ClassificationBadge type="faltante" label={t.classification.faltante} />
              <span className="text-sm text-muted-foreground">{item}</span>
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
