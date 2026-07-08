import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { trackPrestadorCadastro } from '@/utils/analytics.js';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, MessageCircle } from 'lucide-react';

const OCUPACOES = [
  'Limpeza', 'Garçom', 'Pedreiro', 'Jardinagem', 'Babá',
  'Eletricista', 'Encanador', 'Pintor', 'Cozinheiro', 'Outro'
];

export default function LeadPrestadorForm() {
  const [form, setForm] = useState({ name: '', phone: '', occupation: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await base44.entities.LeadPreLancamento.create({
        name: form.name,
        phone: form.phone,
        whatsapp: form.phone,
        service_interest: form.occupation,
        source: 'seja-prestador',
        type: 'prestador',
      });
      trackPrestadorCadastro({ occupation: form.occupation });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-800 mb-2">Ótimo! Recebemos seus dados 🎉</h3>
        <p className="text-green-700">
          Em breve entraremos em contato pelo seu WhatsApp com tudo que você precisa saber para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-5 h-5 text-amber-700" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Sem compromisso</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Quer saber mais antes de se cadastrar?</h2>
      <p className="text-slate-500 text-sm mb-6">Deixe seu contato e te explicamos tudo pelo WhatsApp.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Seu nome *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Seu nome"
              className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="(73) 9 0000-0000"
              className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sua ocupação *</label>
          <select
            required
            value={form.occupation}
            onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
            className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Selecione sua área...</option>
            {OCUPACOES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        {status === 'error' && (
          <p className="text-red-600 text-sm">Erro ao enviar. Tente novamente.</p>
        )}
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-base py-3"
        >
          {status === 'loading' ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
          ) : (
            <>Receber informações no WhatsApp</>
          )}
        </Button>
        <p className="text-xs text-slate-400 text-center">✓ Sem spam &nbsp;✓ Sem compromisso &nbsp;✓ Retorno em até 24h</p>
      </form>
    </div>
  );
}