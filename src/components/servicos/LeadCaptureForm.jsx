import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { trackLead } from '@/utils/analytics.js';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return value;
}

export default function LeadCaptureForm({ serviceInterest, serviceLabel, source }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handlePhoneChange = (e) => {
    setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const lead = await base44.entities.LeadPreLancamento.create({
        name: form.name,
        phone: form.phone,
        whatsapp: form.phone,
        message: form.message || undefined,
        service_interest: serviceInterest,
        source: source || `pagina-servico-${(serviceInterest || '').toLowerCase().replace(/\s+/g, '-')}`,
        type: 'cliente',
      });
      if (lead?.id) {
        base44.functions.invoke('notifyNewLead', { leadId: lead.id }).catch(() => {});
      }
      trackLead({ service_interest: serviceInterest, source: source });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="rounded-2xl p-8 text-center border"
        style={{ background: '#F5E6CC', borderColor: '#E8D5B7' }}
      >
        <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#4A6741' }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: '#2C1A0E' }}>Recebemos seu contato! ✅</h3>
        <p style={{ color: '#6B4F3A' }} className="leading-relaxed">
          Em breve um de nossos consultores entrará em contato pelo WhatsApp.
        </p>
      </div>
    );
  }

  const displayLabel = serviceLabel || serviceInterest || 'profissional';

  return (
    <div
      className="rounded-2xl p-6 md:p-8 border"
      style={{ background: '#F5E6CC', borderColor: '#E8D5B7' }}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2C1A0E' }}>
        Precisa de {displayLabel} agora?
      </h2>
      <p className="text-sm mb-6" style={{ color: '#6B4F3A' }}>
        Deixe seu contato e entraremos em 5 minutos pelo WhatsApp
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Seu nome"
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E', focusRingColor: '#8B6914' }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="(73) 9 0000-0000"
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
            Mensagem (opcional)
          </label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Descreva brevemente o que precisa..."
            rows={3}
            className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 resize-none"
            style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
          />
        </div>

        {status === 'error' && (
          <p className="text-red-600 text-sm">Erro ao enviar. Tente novamente.</p>
        )}

        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full font-bold text-base py-3 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: '#8B6914', borderColor: '#8B6914' }}
        >
          {status === 'loading' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
          ) : (
            <>Quero ser atendido agora <ArrowRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>

        <p className="text-xs text-center" style={{ color: '#A0785A' }}>
          ✓ Resposta em até 5 min &nbsp;·&nbsp; ✓ Profissionais verificados &nbsp;·&nbsp; ✓ Sem compromisso
        </p>
      </form>
    </div>
  );
}