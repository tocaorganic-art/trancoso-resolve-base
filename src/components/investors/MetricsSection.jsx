import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function MetricsSection() {
  const { t } = useInvestorLang();
  const m = t.metrics;

  return (
    <Section eyebrow={m.eyebrow} title={m.title} subtitle={m.subtitle}>
      <div className="space-y-8">
        {m.groups.map((group) => (
          <div key={group.phase}>
            <span className="inline-block rounded-pill bg-brand-primary/10 text-orange-700 text-xs font-bold px-3 py-1 mb-3">
              {group.phase}
            </span>
            <div className="overflow-x-auto rounded-brand-lg border border-border">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-sand/60 dark:bg-neutral-900 border-b border-border">
                    {m.columns.map((col) => (
                      <th key={col} className="text-left p-3 font-bold text-foreground whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {group.items.map((item, i) => (
                    <tr key={item.kpi} className={i !== group.items.length - 1 ? 'border-b border-border' : ''}>
                      <td className="p-3 font-semibold text-foreground align-top">{item.kpi}</td>
                      <td className="p-3 text-muted-foreground align-top">{item.def}</td>
                      <td className="p-3 text-muted-foreground align-top whitespace-nowrap">{item.freq}</td>
                      <td className="p-3 align-top whitespace-nowrap">
                        <span className="rounded-pill bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
