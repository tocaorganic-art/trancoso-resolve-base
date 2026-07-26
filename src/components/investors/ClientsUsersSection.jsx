import { Briefcase, Users } from 'lucide-react';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

export default function ClientsUsersSection() {
  const { t } = useInvestorLang();
  const c = t.clientsUsers;

  return (
    <Section id="mercado" eyebrow={c.eyebrow} title={c.title} tone="sand">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-brand-lg bg-card border-2 border-brand-primary/30 p-6 md:p-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-orange-700 mb-3">
            <Briefcase className="w-4 h-4" /> {c.payer.label}
          </span>
          <h3 className="text-xl font-bold text-foreground mb-2">{c.payer.title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-3">{c.payer.desc}</p>
          <p className="text-sm font-semibold text-foreground/80">{c.payer.want}</p>
        </div>
        <div className="rounded-brand-lg bg-card border border-border p-6 md:p-8">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-olive-700 dark:text-olive-400 mb-3">
            <Users className="w-4 h-4" /> {c.user.label}
          </span>
          <h3 className="text-xl font-bold text-foreground mb-2">{c.user.title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-3">{c.user.desc}</p>
          <p className="text-sm font-semibold text-foreground/80">{c.user.want}</p>
        </div>
      </div>
    </Section>
  );
}
