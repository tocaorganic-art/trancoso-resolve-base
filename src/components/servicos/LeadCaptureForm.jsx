import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { trackLead } from '@/utils/analytics.js';
import { buildPublicLeadPayload, isValidBrazilianPhone } from '@/utils/leadValidation.js';
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
  const SERVICE_OPTIONS = ['Limpeza', 'Elétrica', 'Hidráulica', 'Jardinagem', 'Cozinheiro', 'Segurança', 'Outros'];
  const LOCATION_OPTIONS = ['Trancoso', "Arraial d'Ajuda", 'Porto Seguro', 'Caraíva', 'Outra'];
  const initialService = SERVICE_OPTIONS.includes(serviceInterest) ? serviceInterest : '';
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: initialService, location: '', message: '', consent: false, website: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePhoneChange = (e) => {
    setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidBrazilianPhone(form.phone)) {
      setStatus('error');
      setErrorMessage('Informe um WhatsApp válido com DDD.');
      return;
    }
    if (!form.consent) {
      setStatus('error');
      setErrorMessage('Confirme o consentimento para receber o contato.');
      return;
    }
    if (!form.service || !form.location) {
      setStatus('error');
      setErrorMessage('Selecione o serviço e a localização para continuarmos.');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      const payload = buildPublicLeadPayload({
        name: form.name,
        phone: form.phone,
        message: form.message || undefined,
        email: form.email,
        serviceInterest: form.service || serviceInterest,
        location: form.location,
        source: source || `pagina-servico-${(serviceInterest || '').toLowerCase().replace(/\s+/g, '-')}`,
        type: 'cliente',
        consent: form.consent,
        website: form.website,
      });
      await base44.functions.invoke('createPublicLead', payload);
      trackLead({ service_interest: form.service || serviceInterest, source: source, city: form.location });
      const fallbackMessage = `Olá! Meu nome é ${form.name}. Preciso de ${form.service} em ${form.location}.`;
      window.open(`https://wa.me/5573998283579?text=${encodeURIComponent(fallbackMessage)}`, '_blank', 'noopener,noreferrer');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Não foi possível enviar agora. Tente novamente em instantes.');
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
          Obrigado! Entraremos em contato pelo WhatsApp em até 5 minutos.
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
        Deixe seu WhatsApp para que a equipe avalie sua solicitação e entre em contato.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-name" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-name"
              name="name"
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
            <label htmlFor="lead-phone" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="(73) 9 0000-0000"
              inputMode="tel"
              aria-describedby="lead-phone-help"
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
            />
            <p id="lead-phone-help" className="text-xs mt-1" style={{ color: '#6B4F3A' }}>
              Inclua o DDD.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="lead-message" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
            Mensagem (opcional)
          </label>
          <textarea
            id="lead-message"
            name="message"
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Descreva brevemente o que precisa..."
            rows={3}
            className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 resize-none"
            style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-email" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              Email (opcional)
            </label>
            <input
              id="lead-email"
              name="email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="voce@email.com"
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
            />
          </div>
          <div>
            <label htmlFor="lead-service" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              Serviço de interesse <span className="text-red-500">*</span>
            </label>
            <select
              id="lead-service"
              name="service_interest"
              required
              value={form.service}
              onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
            >
              <option value="">Selecione...</option>
              {SERVICE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="lead-location" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
            Localização <span className="text-red-500">*</span>
          </label>
          <select
            id="lead-location"
            name="location"
            required
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
          >
            <option value="">Onde você precisa?</option>
            {LOCATION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="lead-website">Não preencha este campo</label>
          <input
            id="lead-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
          />
        </div>
        <input type="hidden" name="source" value={source || 'site'} />

        <label className="flex items-start gap-2 text-xs cursor-pointer" style={{ color: '#6B4F3A' }}>
          <input
            type="checkbox"
            name="consent"
            required
            checked={form.consent}
            onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            Concordo com a Política de Privacidade e autorizo contato via WhatsApp.{' '}
            <a href="/PoliticaPrivacidade" className="underline font-semibold">Política de Privacidade</a>.
          </span>
        </label>

        {status === 'error' && (
          <p className="text-red-600 text-sm" role="alert">{errorMessage}</p>
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
          Sem compromisso. Seus dados serão usados apenas para atender esta solicitação.
        </p>
      </form>
    </div>
  );
}
