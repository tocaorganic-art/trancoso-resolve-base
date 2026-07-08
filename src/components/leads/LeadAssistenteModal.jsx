import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, X, Bell } from 'lucide-react';

export default function LeadAssistenteModal({ onClose }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await base44.entities.LeadPreLancamento.create({
        name: form.name,
        phone: form.phone,
        whatsapp: form.phone,
        source: 'assistente-virtual',
        type: 'cliente',
      });
      setStatus('success');
      setTimeout(() => onClose(), 2500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10 border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Perfeito!</h3>
            <p className="text-slate-500 text-sm">Vamos te avisar pelo WhatsApp quando encontrarmos o profissional certo.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Quer que eu te avise?</h3>
                <p className="text-xs text-slate-500">Quando encontrar o profissional certo</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Deixe seu contato e te aviso pelo WhatsApp quando encontrar o profissional ideal para você.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Seu nome"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(73) 9 0000-0000"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {status === 'error' && (
                <p className="text-red-500 text-xs">Erro ao salvar. Tente novamente.</p>
              )}
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Salvando...</>
                ) : 'Sim, me avisa! 🔔'}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
              >
                Agora não, obrigado
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}