import { useState } from 'react';
import { CheckCircle, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Section from './Section';
import { useInvestorLang } from './InvestorLangContext';

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  organization: '',
  investor_type: '',
  ticket_range: '',
  message: '',
  consent: false,
};

export default function LeadFormSection() {
  const { t, lang } = useInvestorLang();
  const f = t.leadForm;
  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState('idle');

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent) return;
    setStatus('loading');
    try {
      const lead = await base44.entities.InvestorLead.create({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        organization: form.organization || undefined,
        investor_type: form.investor_type || undefined,
        ticket_range: form.ticket_range || undefined,
        message: form.message || undefined,
        language: lang,
        source: 'pagina-investidores',
        consent: form.consent,
      });
      if (lead?.id) {
        base44.functions.invoke('notifyInvestorLead', { leadId: lead.id }).catch(() => {});
      }
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Section id="contato" eyebrow={f.eyebrow} title={f.title}>
        <div className="rounded-brand-lg border border-[#3E8E5A]/30 bg-[#3E8E5A]/10 p-8 text-center max-w-xl mx-auto">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-[#3E8E5A]" />
          <p className="font-bold text-foreground">{f.success}</p>
        </div>
      </Section>
    );
  }

  return (
    <Section id="contato" eyebrow={f.eyebrow} title={f.title} subtitle={f.subtitle}>
      <form onSubmit={handleSubmit} className="max-w-2xl rounded-brand-lg border border-border bg-card p-6 md:p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-name" className="block text-sm font-semibold text-foreground mb-1.5">{f.nameLabel} *</label>
            <input id="inv-name" required type="text" value={form.name} onChange={set('name')}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label htmlFor="inv-email" className="block text-sm font-semibold text-foreground mb-1.5">{f.emailLabel} *</label>
            <input id="inv-email" required type="email" value={form.email} onChange={set('email')}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-phone" className="block text-sm font-semibold text-foreground mb-1.5">{f.phoneLabel}</label>
            <input id="inv-phone" type="tel" value={form.phone} onChange={set('phone')}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label htmlFor="inv-org" className="block text-sm font-semibold text-foreground mb-1.5">{f.organizationLabel}</label>
            <input id="inv-org" type="text" value={form.organization} onChange={set('organization')}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-type" className="block text-sm font-semibold text-foreground mb-1.5">{f.typeLabel}</label>
            <select id="inv-type" value={form.investor_type} onChange={set('investor_type')}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="">—</option>
              {f.types.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="inv-ticket" className="block text-sm font-semibold text-foreground mb-1.5">{f.ticketLabel}</label>
            <input id="inv-ticket" type="text" value={form.ticket_range} onChange={set('ticket_range')}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        <div>
          <label htmlFor="inv-message" className="block text-sm font-semibold text-foreground mb-1.5">{f.messageLabel}</label>
          <textarea id="inv-message" rows={4} value={form.message} onChange={set('message')} placeholder={f.messagePlaceholder}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" required checked={form.consent} onChange={set('consent')} className="mt-0.5 accent-orange-600" />
          <span>{f.consentLabel}</span>
        </label>

        {status === 'error' && <p className="text-sm text-[#D7382B]">{f.error}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 rounded-pill bg-brand-primary text-white font-bold px-6 py-3 hover:bg-brand-primary-hover transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {status === 'loading' ? f.submitting : f.submit}
        </button>

        <p className="text-xs text-muted-foreground/70">{f.privacyNote}</p>
      </form>
    </Section>
  );
}
