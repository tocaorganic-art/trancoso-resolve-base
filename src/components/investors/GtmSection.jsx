import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function GtmSection() {
  const { t } = useInvestorLang();
  const l = t.launchSteps;
  const g = t.gtm;

  return (
    <Section eyebrow={l.eyebrow} title={l.title} tone="sand">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {l.steps.map((s) => (
          <div key={s.n} className="rounded-brand-lg bg-card border border-border p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-sm mb-3">
              {s.n}
            </span>
            <h4 className="font-bold text-foreground mb-1">{s.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-700 mb-3">{g.eyebrow}</p>
      <h3 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mb-8 max-w-2xl">{g.title}</h3>
      <div className="overflow-x-auto rounded-brand-lg border border-border">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-card border-b border-border">
              {g.columns.map((col) => (
                <th key={col} className="text-left p-3 font-bold text-foreground whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card">
            {g.channels.map((ch, i) => (
              <tr key={ch.name} className={i !== g.channels.length - 1 ? 'border-b border-border' : ''}>
                <td className="p-3 font-bold text-foreground align-top">{ch.name}</td>
                <td className="p-3 text-muted-foreground align-top">{ch.role}</td>
                <td className="p-3 text-muted-foreground align-top">{ch.test}</td>
                <td className="p-3 text-muted-foreground align-top">{ch.metric}</td>
                <td className="p-3 text-xs text-muted-foreground/70 italic align-top">{ch.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
