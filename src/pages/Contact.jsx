import { useEffect, useState } from 'react';
import { Mail, MessageSquare, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const ASSUNTOS = ['Sou cliente', 'Sou prestador', 'Parceria', 'Imprensa', 'Outro'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

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
    setStatus('loading');
    try {
      await base44.entities.LeadPreLancamento.create({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: `[${form.subject}] ${form.message}`,
        service_interest: form.subject,
        source: 'pagina-contato',
        type: form.subject === 'Sou prestador' ? 'prestador' : 'cliente',
      });
      // Notificação interna em background
      base44.functions.invoke('notifyNewLead', {
        message: `Novo contato via /Contact\nNome: ${form.name}\nEmail: ${form.email}\nAssunto: ${form.subject}\nMensagem: ${form.message}`
      }).catch(() => {});
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">Entre em Contato</h1>
        <p className="text-muted-foreground mb-10">Nossa equipe está em Trancoso, Bahia — e responde rápido.</p>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {/* Canais */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-foreground mb-4">Formas de Contato</h2>

            <a href="mailto:suporte@trancosoresolve.com.br" className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:border-orange-300 transition-colors group">
              <Mail className="w-5 h-5 text-orange-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground group-hover:text-orange-700 transition-colors">suporte@trancosoresolve.com.br</p>
                <p className="text-xs text-muted-foreground mt-0.5">Resposta em até 24 horas</p>
              </div>
            </a>

            <a href="https://wa.me/5573998283579" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:border-[#3E8E5A]/50 transition-colors group">
              <MessageSquare className="w-5 h-5 text-[#3E8E5A] mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground group-hover:text-green-700 transition-colors">WhatsApp</p>
                <p className="text-xs text-muted-foreground mt-0.5">Atendimento em horário comercial</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Trancoso, Bahia, Brasil</p>
                <p className="text-xs text-muted-foreground mt-0.5">Segunda a sexta, 8h às 18h</p>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-sm text-orange-800">
                Precisa de ajuda rápida? Veja nosso{' '}
                <a href="/Manual" className="font-semibold underline hover:text-orange-900">FAQ e Manual</a>.
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-5">Envie uma Mensagem</h2>

            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">Mensagem enviada!</h3>
                <p className="text-muted-foreground text-sm">Obrigado por entrar em contato. Retornaremos em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nome *</label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Seu nome"
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                    <input
                      type="tel" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(73) 9 0000-0000"
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Assunto *</label>
                  <select
                    required value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Selecione...</option>
                    {ASSUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Mensagem *</label>
                  <textarea
                    required value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Deixe sua mensagem, dúvida ou sugestão..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-red-600 text-sm">Erro ao enviar. Tente novamente.</p>
                )}
                <Button type="submit" disabled={status === 'loading'} className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold">
                  {status === 'loading' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : 'Enviar Mensagem'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}