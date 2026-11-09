import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { trackLead } from '@/utils/analytics.js';
import { buildPublicLeadPayload, isValidBrazilianPhone } from '@/utils/leadValidation.js';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return value;
}

// Os valores enviados ao CRM/backend continuam em português (contrato de dados);
// apenas o rótulo exibido é traduzido.
const SERVICE_OPTIONS = [
  { value: 'Limpeza', labelKey: 'leadForm.serviceLimpeza' },
  { value: 'Elétrica', labelKey: 'leadForm.serviceEletrica' },
  { value: 'Hidráulica', labelKey: 'leadForm.serviceHidraulica' },
  { value: 'Jardinagem', labelKey: 'leadForm.serviceJardinagem' },
  { value: 'Cozinheiro', labelKey: 'leadForm.serviceCozinheiro' },
  { value: 'Segurança', labelKey: 'leadForm.serviceSeguranca' },
  { value: 'Outros', labelKey: 'leadForm.serviceOutros' },
];

const LOCATION_OPTIONS = [
  { value: 'Trancoso', label: 'Trancoso' },
  { value: "Arraial d'Ajuda", label: "Arraial d'Ajuda" },
  { value: 'Porto Seguro', label: 'Porto Seguro' },
  { value: 'Caraíva', label: 'Caraíva' },
  { value: 'Outra', labelKey: 'leadForm.locationOther' },
];

export default function LeadCaptureForm({ serviceInterest, serviceLabel, source }) {
  const { t } = useApp();
  const initialService = SERVICE_OPTIONS.some(o => o.value === serviceInterest) ? serviceInterest : '';
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: initialService, location: '', message: '', consent: false, website: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const submittingRef = useRef(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    setForm(f => ({ ...f, phone: formatPhone(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidBrazilianPhone(form.phone)) {
      setStatus('error');
      setErrorMessage(t('leadForm.errorPhone'));
      return;
    }
    if (!form.consent) {
      setStatus('error');
      setErrorMessage(t('leadForm.errorConsent'));
      return;
    }
    if (!form.service || !form.location) {
      setStatus('error');
      setErrorMessage(t('leadForm.errorSelect'));
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
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
      setStatus('success');
      // Redireciona para a página de confirmação — URL rastreável como conversão (Google Ads/Meta)
      navigate('/SolicitacaoConfirmada', { replace: true });
    } catch {
      submittingRef.current = false;
      setStatus('error');
      setErrorMessage(t('leadForm.errorGeneric'));
    }
  };

  if (status === 'success') {
    return (
      <div
        className="rounded-2xl p-8 text-center border"
        style={{ background: '#F5E6CC', borderColor: '#E8D5B7' }}
      >
        <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#4A6741' }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: '#2C1A0E' }}>{t('leadForm.successTitle')} ✅</h3>
        <p style={{ color: '#6B4F3A' }} className="leading-relaxed">
          {t('leadForm.successText')}
        </p>
      </div>
    );
  }

  const displayLabel = serviceLabel || serviceInterest || t('leadForm.defaultLabel');

  return (
    <div
      className="rounded-2xl p-6 md:p-8 border"
      style={{ background: '#F5E6CC', borderColor: '#E8D5B7' }}
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2C1A0E' }}>
        {t('leadForm.title').replace('{label}', displayLabel)}
      </h2>
      <p className="text-sm mb-6" style={{ color: '#6B4F3A' }}>
        {t('leadForm.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-name" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              {t('leadForm.name')} <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('leadForm.namePlaceholder')}
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-hidden focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E', focusRingColor: '#8B6914' }}
            />
          </div>
          <div>
            <label htmlFor="lead-phone" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              {t('leadForm.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder={t('leadForm.phonePlaceholder')}
              inputMode="tel"
              aria-describedby="lead-phone-help"
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-hidden focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
            />
            <p id="lead-phone-help" className="text-xs mt-1" style={{ color: '#6B4F3A' }}>
              {t('leadForm.phoneHelp')}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="lead-message" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
            {t('leadForm.message')}
          </label>
          <textarea
            id="lead-message"
            name="message"
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder={t('leadForm.messagePlaceholder')}
            rows={3}
            className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-hidden focus:ring-2 resize-none"
            style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lead-email" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              {t('leadForm.email')}
            </label>
            <input
              id="lead-email"
              name="email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder={t('leadForm.emailPlaceholder')}
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-hidden focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
            />
          </div>
          <div>
            <label htmlFor="lead-service" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
              {t('leadForm.service')} <span className="text-red-500">*</span>
            </label>
            <select
              id="lead-service"
              name="service_interest"
              required
              value={form.service}
              onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
              className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-hidden focus:ring-2"
              style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
            >
              <option value="">{t('leadForm.selectPlaceholder')}</option>
              {SERVICE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="lead-location" className="block text-sm font-semibold mb-1" style={{ color: '#2C1A0E' }}>
            {t('leadForm.location')} <span className="text-red-500">*</span>
          </label>
          <select
            id="lead-location"
            name="location"
            required
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            className="w-full rounded-lg border px-4 py-3 text-sm bg-white focus:outline-hidden focus:ring-2"
            style={{ borderColor: '#E8D5B7', color: '#2C1A0E' }}
          >
            <option value="">{t('leadForm.locationPlaceholder')}</option>
            {LOCATION_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.labelKey ? t(option.labelKey) : option.label}</option>
            ))}
          </select>
        </div>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="lead-website">{t('leadForm.honeypot')}</label>
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
            {t('leadForm.consentBefore')}{' '}
            <a href="/PoliticaPrivacidade" className="underline font-semibold">{t('leadForm.privacy')}</a>{' '}
            {t('leadForm.consentAfter')}
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
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('leadForm.sending')}</>
          ) : (
            <>{t('leadForm.submit')} <ArrowRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>

        <p className="text-xs text-center" style={{ color: '#A0785A' }}>
          {t('leadForm.disclaimer')}
        </p>
      </form>
    </div>
  );
}
