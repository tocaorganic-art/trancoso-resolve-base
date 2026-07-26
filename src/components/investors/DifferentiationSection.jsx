import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function DifferentiationSection() {
  const { t } = useInvestorLang();
  const d = t.differentiation;
  const m = d.moat;

  return (
    <Section eyebrow={d.eyebrow} title={d.title} tone="sand">
      <div className="overflow-x-auto rounded-brand-lg border border-border bg-card">
        <table className="w-full text-sm">
          <tbody>
            {d.positioning.map((row, i) => (
              <tr key={row.alt} className={i !== d.positioning.length - 1 ? 'border-b border-border' : ''}>
                <td className="p-4 font-semibold text-foreground/70 whitespace-nowrap">{row.alt}</td>
                <td className="p-4 text-muted-foreground">{row.strength}</td>
                <td className="p-4 font-bold text-orange-700">{row.ours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-14">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-700 mb-3">{m.eyebrow}</p>
        <h3 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mb-8 max-w-2xl">{m.title}</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {m.points.map((p) => (
            <div key={p.n} className="rounded-brand-lg bg-card border border-border p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-500/15 text-olive-700 dark:text-olive-400 font-bold text-sm mb-3">
                {p.n}
              </span>
              <h4 className="font-bold text-foreground mb-1.5">{p.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground italic">{m.note}</p>
      </div>
    </Section>
  );
}
