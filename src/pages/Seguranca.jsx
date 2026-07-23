import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, UserCheck, Star, Lock, CheckCircle, KeyRound, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// ─── 2FA Settings Panel ────────────────────────────────────────────────
function TwoFAPanel({ user }) {
  const [enabled, setEnabled] = useState(!!user?.two_fa_enabled);
  const [loading, setLoading] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggle = async () => {
    if (!enabled) {
      // Enabling: send code first
      setLoading(true);
      try {
        const res = await base44.functions.invoke('twoFactor', { action: 'send' });
        if (res?.data?.success) {
          setAwaitingCode(true);
          setErrorMsg('');
        }
      } catch {
        toast.error('Erro ao enviar código de confirmação.');
      } finally {
        setLoading(false);
      }
    } else {
      // Disabling: direct toggle
      setLoading(true);
      try {
        await base44.auth.updateMe({ two_fa_enabled: false });
        setEnabled(false);
        toast.success('Autenticação em dois fatores desativada.');
      } catch {
        toast.error('Erro ao desativar 2FA.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmEnable = async () => {
    if (confirmCode.length !== 6) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await base44.functions.invoke('twoFactor', { action: 'verify', code: confirmCode });
      if (res?.data?.success) {
        await base44.auth.updateMe({ two_fa_enabled: true });
        setEnabled(true);
        setAwaitingCode(false);
        setConfirmCode('');
        toast.success('2FA ativado com sucesso! Sua conta está mais protegida.');
      } else {
        setErrorMsg(res?.data?.error || 'Código inválido.');
      }
    } catch {
      setErrorMsg('Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          Autenticação em dois fatores (2FA)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Receba um código por email ao fazer login.</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${
              enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {enabled ? '● 2FA ativo' : '○ 2FA inativo'}
            </span>
          </div>
          <Button
            onClick={handleToggle}
            disabled={loading || awaitingCode}
            variant={enabled ? 'outline' : 'default'}
            className={enabled ? '' : 'bg-amber-600 hover:bg-amber-700 text-white'}
          >
            {loading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            {enabled ? 'Desativar' : 'Ativar 2FA'}
          </Button>
        </div>

        {awaitingCode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-amber-800 font-medium">
              Digite o código de 6 dígitos enviado para {user?.email}
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={confirmCode}
                onChange={e => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg font-bold tracking-widest w-36"
              />
              <Button onClick={handleConfirmEnable} disabled={confirmCode.length !== 6 || loading}
                className="bg-amber-600 hover:bg-amber-700 text-white">
                Confirmar
              </Button>
              <Button variant="ghost" onClick={() => { setAwaitingCode(false); setConfirmCode(''); }}>
                Cancelar
              </Button>
            </div>
            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Account Deletion Panel ────────────────────────────────────────────
function DangerZonePanel({ user }) {
  const [step, setStep] = useState(0); // 0=idle, 1=confirm1, 2=confirm2
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (typed !== user?.email) return;
    setLoading(true);
    try {
      // In a real scenario, call a backend function. For now just notify admin.
      await base44.integrations.Core.SendEmail({
        to: 'contato@tocaexperience.com.br',
        subject: `[SOLICITAÇÃO] Exclusão de conta: ${user.email}`,
        body: `Usuário ${user.full_name} (${user.email}) solicitou exclusão da conta em ${new Date().toLocaleString('pt-BR')}.`,
      });
      toast.success('Solicitação de exclusão enviada. Nossa equipe entrará em contato em até 48h.');
      setStep(0);
    } catch {
      toast.error('Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-red-700">
          <Trash2 className="w-5 h-5" />
          Zona de perigo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 0 && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Excluir minha conta</p>
              <p className="text-xs text-slate-400">Esta ação é irreversível. Todos os seus dados serão removidos.</p>
            </div>
            <Button variant="destructive" onClick={() => setStep(1)}>Excluir conta</Button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">Tem certeza? Você perderá todo o histórico de serviços, avaliações e dados do perfil.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => setStep(2)}>Sim, quero excluir</Button>
              <Button variant="outline" onClick={() => setStep(0)}>Cancelar</Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">Para confirmar, digite seu email: <strong>{user?.email}</strong></p>
            <Input
              placeholder={user?.email}
              value={typed}
              onChange={e => setTyped(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={typed !== user?.email || loading}
                onClick={handleDelete}
              >
                {loading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Confirmar exclusão
              </Button>
              <Button variant="outline" onClick={() => { setStep(0); setTyped(''); }}>Cancelar</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Security Feature card (public section) ────────────────────────────
const SecurityFeature = ({ icon, title, description }) => (
  <Card className="border-none shadow-lg text-center">
    <CardContent className="p-6">
      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </CardContent>
  </Card>
);

// ─── Main Page ────────────────────────────────────────────────────────
export default function SegurancaPage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const isPrestador = user?.user_type === 'prestador';

  useEffect(() => {
    document.title = "Segurança em Trancoso Resolve — Prestadores Verificados e Proteção de Dados";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = "Todos os prestadores do Trancoso Resolve passam por verificação de identidade e consulta de antecedentes criminais. Sua segurança é nossa prioridade.";

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/Seguranca`;

    const schemaId = 'schema-seguranca';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Segurança — Trancoso Resolve",
      "description": "Saiba como garantimos a segurança de clientes e prestadores em Trancoso.",
      "url": `${window.location.origin}/Seguranca`,
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, []);

  return (
    <div className="bg-slate-50 py-16">
      <div className="container mx-auto px-4">

        {/* ── Configurações de conta (apenas para prestadores logados) ── */}
        {isPrestador && (
          <div className="max-w-2xl mx-auto mb-16 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <KeyRound className="w-6 h-6 text-amber-700" />
              <h2 className="text-2xl font-bold text-slate-900">Configurações de segurança da conta</h2>
            </div>

            <TwoFAPanel user={user} />
            <DangerZonePanel user={user} />
          </div>
        )}

        {/* ── Conteúdo público ── */}
        <div className="text-center mb-12">
          <ShieldCheck className="w-16 h-16 mx-auto text-amber-600 mb-4" />
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Sua Segurança é Nossa Prioridade</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Construímos uma comunidade de confiança em Trancoso. Veja as medidas que tomamos para garantir uma experiência segura para todos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SecurityFeature icon={<UserCheck className="w-8 h-8" />} title="Identidade Verificada"
            description="Todos os prestadores passam por análise de documentos e verificação de identidade antes de aparecerem na plataforma." />
          <SecurityFeature icon={<ShieldCheck className="w-8 h-8" />} title="Antecedentes Criminais"
            description="Consultamos antecedentes criminais de cada prestador com autorização expressa (LGPD), garantindo uma comunidade mais segura." />
          <SecurityFeature icon={<Star className="w-8 h-8" />} title="Avaliações Reais"
            description="Após cada serviço, clientes avaliam os prestadores. Feedbacks reais para você escolher com confiança." />
          <SecurityFeature icon={<Lock className="w-8 h-8" />} title="Proteção de Dados"
            description="Seus dados são protegidos conforme a LGPD. Nunca vendemos ou compartilhamos seus dados com terceiros." />
        </div>

        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-center text-green-900 mb-6">O que significa o Selo Verificado?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Documento Confirmado", desc: "RG ou CPF conferido e autêntico." },
              { title: "Sem Antecedentes", desc: "Consulta de antecedentes limpa." },
              { title: "Aprovado pela Equipe", desc: "Análise manual pela equipe Trancoso Resolve." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 text-sm">{item.title}</p>
                  <p className="text-green-700 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="mt-10 bg-white border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nossas Diretrizes de Confiança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-slate-700">
            <div>
              <h4 className="font-semibold text-lg text-slate-800">Pagamentos Seguros</h4>
              <p>Atualmente, os pagamentos são diretos entre cliente e prestador. Recomendamos o uso de métodos rastreáveis como PIX ou transferência.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg text-slate-800">Resolução de Disputas</h4>
              <p>Incentivamos a comunicação aberta para resolver qualquer problema. Nossa equipe de suporte está disponível para mediar a situação.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg text-slate-800">Dicas para uma Boa Experiência</h4>
              <p><strong>Para Clientes:</strong> Seja claro sobre suas necessidades ao solicitar um serviço.<br />
                <strong>Para Prestadores:</strong> Mantenha seu perfil e agenda atualizados. Seja pontual e profissional para garantir boas avaliações.</p>
            </div>
          </CardContent>
        </Card>

        <div className="container mx-auto px-4 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Profissionais Verificados por Categoria</h2>
            <p className="text-sm text-slate-600 mb-4">Todos os prestadores abaixo passaram pela nossa verificação de antecedentes:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { slug: 'limpeza-trancoso', label: 'Diarista verificada' },
                { slug: 'eletricista-trancoso', label: 'Eletricista verificado' },
                { slug: 'encanador-trancoso', label: 'Encanador verificado' },
                { slug: 'jardinagem-trancoso', label: 'Jardineiro verificado' },
                { slug: 'cozinheiro-trancoso', label: 'Cozinheiro verificado' },
              ].map(item => (
                <Link key={item.slug} to={`/ServicoLanding?slug=${item.slug}`}>
                  <span className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors cursor-pointer">
                    ✅ {item.label}
                  </span>
                </Link>
              ))}
            </div>
            <Link to={createPageUrl("ServicosCategoria")} className="text-sm text-amber-700 hover:underline font-medium">
              Ver todos os profissionais verificados →
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-16 mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Contrate com Confiança em Trancoso</h2>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">Todos os profissionais listados passaram por verificação. Você tem a segurança que merece.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("ServicosCategoria")}>
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 font-bold w-full sm:w-auto">
                Ver Profissionais Verificados
              </Button>
            </Link>
            <Link to={createPageUrl("SejaPrestador")}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50">
                Seja um Prestador
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}