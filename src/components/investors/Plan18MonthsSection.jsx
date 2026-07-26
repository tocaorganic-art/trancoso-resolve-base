import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function Plan18MonthsSection() {
  const { t } = useInvestorLang();
  const p = t.plan18;

  return (
    <Section id="plano" eyebrow={p.eyebrow} title={p.title}>
      <div className="grid md:grid-cols-3 gap-5 mb-6">
        {p.phases.map((phase) => (
          <div key={phase.range} className="rounded-brand-lg border border-border bg-card p-6">
            <span className="inline-block rounded-pill bg-brand-primary/10 text-orange-700 text-xs font-bold px-3 py-1 mb-3">
              {phase.range}
            </span>
            <h3 className="font-bold text-foreground mb-1.5">{phase.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-foreground/80 mb-14">{p.gate}</p>

      <h3 className="text-xl font-bold text-foreground mb-5">{p.roadmapTitle}</h3>
      <div className="overflow-x-auto rounded-brand-lg border border-border">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-sand/60 dark:bg-neutral-900 border-b border-border">
              {p.roadmapColumns.map((col) => (
                <th key={col} className="text-left p-3 font-bold text-foreground whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card">
            {p.roadmap.map((row, i) => (
              <tr key={row.window} className={i !== p.roadmap.length - 1 ? 'border-b border-border' : ''}>
                <td className="p-3 font-bold text-orange-700 whitespace-nowrap align-top">{row.window}</td>
                <td className="p-3 text-muted-foreground align-top">{row.product}</td>
                <td className="p-3 text-muted-foreground align-top">{row.offer}</td>
                <td className="p-3 text-muted-foreground align-top">{row.demand}</td>
                <td className="p-3 text-muted-foreground align-top">{row.financial}</td>
                <td className="p-3 font-semibold text-foreground/80 align-top">{row.gate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
