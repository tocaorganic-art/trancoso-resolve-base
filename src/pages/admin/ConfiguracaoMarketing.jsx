import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function ConfiguracaoMarketing() {
  useEffect(() => {
    document.title = 'Configuração de Marketing | Trancoso Resolve Admin';
  }, []);

  const steps = [
    {
      num: '1',
      title: 'Acesse o Meta Business Suite',
      desc: 'Vá em Events Manager → selecione o Pixel 1469130194903035',
    },
    {
      num: '2',
      title: 'Abra as Configurações do Pixel',
      desc: 'Clique em "Configurações" → role até "API de Conversões"',
    },
    {
      num: '3',
      title: 'Gere o Access Token',
      desc: 'Clique em "Gerar token de acesso" e copie o token gerado',
    },
    {
      num: '4',
      title: 'Adicione no Base44',
      desc: 'Base44 Dashboard → Settings → Environment Variables → adicione META_CAPI_TOKEN = <seu token>',
    },
  ];

  const events = [
    { name: 'Lead', trigger: 'Submissão do mini-formulário de lead', dedup: true },
    { name: 'CompleteRegistration', trigger: 'Cadastro de prestador ou cliente', dedup: true },
    { name: 'Purchase', trigger: 'Criação de ServiceRequest (agendamento)', dedup: true },
    { name: 'Contact', trigger: 'Clique no botão WhatsApp (sticky bar)', dedup: true },
    { name: 'ViewContent', trigger: 'Entrada em página de serviço /servicos/*', dedup: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-2xl font-bold mb-2">Configuração de Marketing</h1>
        <p className="text-slate-400 mb-8">GA4 + Meta Pixel + Meta Conversions API (CAPI)</p>

        {/* Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-sm font-semibold text-green-300">GA4</p>
            <p className="text-xs text-green-400 mt-1">G-3KF75243B4 — Ativo</p>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-sm font-semibold text-green-300">Meta Pixel</p>
            <p className="text-xs text-green-400 mt-1">1469130194903035 — Ativo</p>
          </div>
          <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
            <p className="text-sm font-semibold text-amber-300">Meta CAPI</p>
            <p className="text-xs text-amber-400 mt-1">Requer META_CAPI_TOKEN</p>
          </div>
        </div>

        {/* Instrução CAPI */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Ativar Meta Conversions API (CAPI)</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            O CAPI envia eventos server-side para a Meta, deduplicando com o Pixel client-side e melhorando
            a atribuição de anúncios mesmo com bloqueadores de anúncios ou iOS 14+.
          </p>
          <ol className="space-y-4">
            {steps.map(step => (
              <li key={step.num} className="flex gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {step.num}
                </span>
                <div>
                  <p className="font-semibold text-sm text-slate-200">{step.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Abrir Meta Events Manager <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Eventos rastreados */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Eventos Rastreados</h2>
          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.name} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{ev.name}</p>
                  <p className="text-xs text-slate-400">{ev.trigger}</p>
                </div>
                {ev.dedup && (
                  <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-1 rounded-full">
                    Deduplicado
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Segmentação por cidade */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2">Segmentação por Cidade</h2>
          <p className="text-slate-400 text-sm mb-4">
            Todos os eventos de lead e conversão incluem o parâmetro <code className="bg-slate-700 px-1 rounded text-amber-300">city</code> detectado
            automaticamente pelo pathname da URL (Trancoso, Porto Seguro ou Caraíva).
            Use isso no Meta Ads para criar audiências segmentadas por cidade.
          </p>
          <div className="flex gap-2 flex-wrap">
            {['Trancoso', 'Porto Seguro', 'Caraíva'].map(city => (
              <span key={city} className="bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full">
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}