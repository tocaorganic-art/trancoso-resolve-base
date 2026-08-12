import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, MapPin, CheckCircle, Loader2, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { buildPublicLeadPayload, isValidBrazilianPhone } from '@/utils/leadValidation.js';

const ASSUNTOS = ['Sou cliente', 'Sou prestador', 'Parceria', 'Imprensa', 'Outro'];

/* ─── Floating Label Input ──────────────────────────────────────── */
function FloatingInput({ id, label, type = 'text', value, onChange, required, placeholder }) {
  const [focused, setFocused] = useState(false);
  const filled = value && value.length > 0;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=" "
        className="w-full rounded-xl border border-border bg-muted px-4 pt-5 pb-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all peer"
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none text-muted-foreground ${
          focused || filled ? 'top-1.5 text-[10px] font-semibold text-orange-500' : 'top-3.5 text-sm'
        }`}
      >
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
    </div>
  );
}

/* ─── Floating Label Textarea ───────────────────────────────────── */
function FloatingTextarea({ id, label, value, onChange, required, rows = 4 }) {
  const [focused, setFocused] = useState(false);
  const filled = value && value.length > 0;
  return (
    <div className="relative">
      <textarea
        id={id}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        placeholder=" "
        className="w-full rounded-xl border border-border bg-muted px-4 pt-5 pb-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition-all"
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none text-muted-foreground ${
          focused || filled ? 'top-1.5 text-[10px] font-semibold text-orange-500' : 'top-3.5 text-sm'
        }`}
      >
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
    </div>
  );
}

/* ─── Contact Channel Card ──────────────────────────────────────── */
function ChannelCard({ href, icon, label, sub, delay = 0, iconColor = 'text-orange-500' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const Tag = href ? 'a' : 'div';
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <Tag
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={`flex items-start gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:border-orange-300 hover:shadow-md transition-all duration-300 group ${href ? 'cursor-pointer' : ''}`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 flex items-center justify-center border border-orange-400/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
          <span className={iconColor}>{icon}</span>
        </div>
        <div>
          <p className={`font-semibold text-sm text-foreground ${href ? 'group-hover:text-orange-600 transition-colors' : ''}`}>{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
        {href && <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-1 transition-all ml-auto mt-0.5 shrink-0" />}
      </Tag>
    </motion.div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', consent: false, website: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: '-40px' });

  useEffect(() => {
    document.title = 'Contato | Trancoso Resolve';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = 'Entre em contato com a Trancoso Resolve. Estamos aqui para ajudar clientes e prestadores de serviço em Trancoso, Bahia.';
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/Contact`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidBrazilianPhone(form.phone)) { setStatus('error'); setErrorMessage('Informe um telefone válido com DDD.'); return; }
    if (!form.consent) { setStatus('error'); setErrorMessage('Confirme o consentimento para receber uma resposta.'); return; }
    setStatus('loading');
    setErrorMessage('');
    try {
      const payload = buildPublicLeadPayload({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `[${form.subject}] ${form.message}`,
        serviceInterest: form.subject,
        source: 'pagina-contato',
        type: form.subject === 'Sou prestador' ? 'prestador' : 'cliente',
        consent: form.consent,
        website: form.website,
      });
      await base44.functions.invoke('createPublicLead', payload);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Não foi possível enviar agora. Tente novamente em instantes.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0c00] via-[#2d1200] to-[#1a0c00] py-16 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-600/30 blur-[100px]"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(232,87,26,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(232,87,26,0.4) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <MapPin className="w-3.5 h-3.5" /> Trancoso, Bahia — respondemos rápido
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-3"
          >
            Entre em Contato
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-slate-300 text-lg"
          >
            Nossa equipe está em Trancoso, Bahia — e responde rápido.
          </motion.p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10">

          {/* ── Channels ── */}
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl font-bold text-foreground mb-5"
            >
              Formas de Contato
            </motion.h2>

            <ChannelCard
              href="mailto:suporte@trancosoresolve.com.br"
              icon={<Mail className="w-5 h-5" />}
              iconColor="text-orange-500"
              label="suporte@trancosoresolve.com.br"
              sub="Resposta em até 24 horas"
              delay={0.1}
            />
            <ChannelCard
              href="https://wa.me/5573998283579"
              icon={<MessageSquare className="w-5 h-5" />}
              iconColor="text-green-500"
              label="WhatsApp"
              sub="Atendimento em horário comercial"
              delay={0.18}
            />
            <ChannelCard
              icon={<MapPin className="w-5 h-5" />}
              iconColor="text-orange-400"
              label="Trancoso, Bahia, Brasil"
              sub="Segunda a sexta, 8h às 18h"
              delay={0.26}
            />
            <ChannelCard
              icon={<Clock className="w-5 h-5" />}
              iconColor="text-muted-foreground"
              label="FAQ e Manual"
              sub="Encontre respostas rápidas na nossa documentação"
              href="/Manual"
              delay={0.34}
            />
          </div>

          {/* ── Form ── */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: 32 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Envie uma Mensagem</h2>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, type: 'spring', stiffness: 160 }}
                  className="text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Mensagem enviada!</h3>
                  <p className="text-muted-foreground text-sm">Obrigado por entrar em contato. Retornaremos em breve.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      id="contact_name" label="Nome" value={form.name} required
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <FloatingInput
                      id="contact_phone" label="Telefone" type="tel" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <FloatingInput
                    id="contact_email" label="Email" type="email" value={form.email} required
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />

                  {/* Subject select with custom styling */}
                  <div className="relative">
                    <select
                      required value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                    >
                      <option value="">Assunto *</option>
                      {ASSUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">▾</div>
                  </div>

                  <FloatingTextarea
                    id="contact_message" label="Mensagem" value={form.message} required
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  />

                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="contact_website">Não preencha este campo</label>
                    <input
                      id="contact_website"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    />
                  </div>

                  <label htmlFor="contact_consent" className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input
                      id="contact_consent"
                      name="consent"
                      type="checkbox"
                      required
                      checked={form.consent}
                      onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-orange-500"
                    />
                    <span>
                      Autorizo o contato e o armazenamento seguro dos meus dados, conforme a{' '}
                      <a href="/politica-privacidade" className="text-orange-600 hover:underline">Política de Privacidade</a>.
                    </span>
                  </label>

                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {errorMessage || 'Erro ao enviar. Tente novamente ou use o WhatsApp.'}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-md"
                  >
                    {status === 'loading'
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                      : <>Enviar Mensagem <ArrowRight className="w-4 h-4 ml-2" /></>
                    }
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
