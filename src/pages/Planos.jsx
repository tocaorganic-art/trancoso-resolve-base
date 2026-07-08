import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check, Zap, Loader2, Building2, Calendar, Wrench,
  ChevronDown, ChevronUp, Lock, Users, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";
import PositionamentoEstrategico from "@/components/plans/PositionamentoEstrategico";

// ─── Benefícios ────────────────────────────────────────────────────────────────

const BENEFICIOS_PRESTADOR = [
  "Perfil verificado com checagem de antecedentes",
  "Visibilidade na busca de clientes",
  "Agenda de atendimentos integrada",
  "Chat direto com clientes",
  "Suporte da plataforma Trancoso Resolve",
];

const BENEFICIOS_EMPRESA = [
  "Acesso a múltiplos prestadores verificados",
  "Gestão de serviços e pedidos",
  "Chat e agenda centralizados",
  "Suporte prioritário",
  "Visibilidade como empresa parceira",
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Qual a diferença entre o Plano Lançamento e o Plano Mensal?",
    a: "O Plano Lançamento tem preço reduzido e período trial maior (2 meses grátis para prestadores), mas é limitado a 50 vagas. O Plano Mensal está sempre disponível com 7 dias grátis e sem limite de vagas.",
  },
  {
    q: "Por que preciso cadastrar meu cartão durante o período grátis?",
    a: "O cartão é salvo para que a renovação seja automática ao fim do trial. Nenhuma cobrança é feita antes do período gratuito terminar. Você pode cancelar a qualquer momento antes disso sem custo.",
  },
  {
    q: "O uso avulso renova automaticamente?",
    a: "Não. O uso avulso é uma cobrança única de 1 mês, sem renovação automática. Para continuar usando a plataforma, você precisa ativar novamente.",
  },
  {
    q: "Posso cancelar meu plano mensal após a alta temporada?",
    a: "Sim. Você pode cancelar a qualquer momento pelo painel. Seu acesso continua até o fim do período já pago.",
  },
  {
    q: "Posso migrar do uso avulso para um plano mensal?",
    a: "Sim, a qualquer momento. Ao assinar um plano mensal, você começa um novo ciclo com o trial disponível.",
  },
  {
    q: "Os planos de empresa incluem acesso para mais de um usuário?",
    a: "Sim. Os planos empresariais permitem múltiplos prestadores vinculados à mesma conta de empresa. Mais detalhes no onboarding após o cadastro.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-slate-800 text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-slate-50 text-sm text-slate-600 border-t border-slate-200 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Card de Plano ─────────────────────────────────────────────────────────────

function PlanCard({
  badge, badgeColor, headerColor, icon, name, price,
  trialLabel, vagasLabel, vagasCor,
  benefits, ctaLabel, ctaNote,
  onCta, onCtaAvulso, ctaAvulsoLabel,
  loading, loadingAvulso, disabled, popular, isAvulso
}) {
  return (
    <Card className={`shadow-2xl overflow-hidden relative flex flex-col ${popular ? 'border-2 border-amber-400' : 'border border-slate-700'} ${disabled ? 'opacity-60' : ''}`}>
      {popular && (
        <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, whiteSpace: 'nowrap' }}>
          <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 shadow">
            <Star className="w-3 h-3 mr-1" /> Mais popular
          </Badge>
        </div>
      )}
      {badge && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`font-bold text-xs ${badgeColor}`}>{badge}</Badge>
        </div>
      )}
      <div className={`p-6 text-center text-white ${headerColor}`}>
        {icon}
        <h2 className="text-xl font-bold mb-1 mt-2">{name}</h2>
        <p className="text-3xl font-extrabold mt-1">R$ {price}<span className="text-sm font-normal opacity-90">/mês</span></p>
        {trialLabel && (
          <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: 'rgba(255,255,255,0.95)' }}>
            <Calendar className="w-3 h-3" /> {trialLabel}
          </p>
        )}
        {vagasLabel && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)', borderRadius: 20,
            padding: '4px 12px', fontSize: 13, fontWeight: 600, color: '#fff',
            marginTop: 8
          }}>
            {vagasLabel}
          </span>
        )}
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        {/* Benefícios */}
        <ul className="space-y-2 mb-5">
          {benefits.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#CBD5E1' }}>
              <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#5DCAA5' }} />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2">
          {!disabled ? (
            <>
              {/* Botão primário */}
              <Button
                className={`w-full text-sm ${popular ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                onClick={onCta}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {ctaLabel}
              </Button>

              {/* Botão avulso (secundário) */}
              {onCtaAvulso && (
                <Button
                  variant="outline"
                  className="w-full text-xs hover:opacity-90"
                  style={{ 
                    border: 'none', 
                    color: '#fff', 
                    background: '#0d9488',
                    marginTop: 8
                  }}
                  onClick={onCtaAvulso}
                  disabled={loadingAvulso}
                >
                  {loadingAvulso ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  {ctaAvulsoLabel}
                </Button>
              )}

              {/* Etiqueta sazonalidade */}
              {onCtaAvulso && (
                <p className="text-center text-xs font-medium flex items-center justify-center gap-1" style={{ color: '#9FE1CB' }}>
                  🏖 Ideal para alta temporada
                </p>
              )}

              {/* Aviso cartão */}
              {trialLabel && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 12, padding: '8px 12px',
                  background: 'rgba(255,255,255,0.07)', borderRadius: 8,
                  fontSize: 12, color: '#CBD5E1'
                }}>
                  <Lock className="w-3 h-3" style={{ color: '#5DCAA5' }} />
                  Cartão salvo no cadastro — sem cobrança no período grátis.
                </div>
              )}

              {ctaNote && <p className="text-xs text-center" style={{ color: '#94A3B8' }}>{ctaNote}</p>}
            </>
          ) : (
            <p className="text-sm text-center py-2" style={{ color: '#94A3B8' }}>Vagas esgotadas.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Card Avulso ──────────────────────────────────────────────────────────────

function AvulsoCard({ icon, title, price, onCta, loading }) {
  return (
    <Card className="border-2 border-teal-500 overflow-hidden">
      <div className="p-6 text-center bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        {icon}
        <h3 className="text-lg font-bold mt-2">{title}</h3>
        <Badge className="mt-1 bg-teal-400/30 text-teal-100 text-xs">Avulso</Badge>
        <p className="text-3xl font-extrabold mt-2">R$ {price}<span className="text-sm font-normal"> / mês</span></p>
      </div>
      <CardContent className="p-5 space-y-3">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2" style={{ color: '#CBD5E1' }}><Check className="w-4 h-4 shrink-0" style={{ color: '#5DCAA5' }} /> 1 mês de acesso completo</li>
          <li className="flex items-center gap-2" style={{ color: '#CBD5E1' }}><Check className="w-4 h-4 shrink-0" style={{ color: '#5DCAA5' }} /> Sem renovação automática</li>
          <li className="flex items-center gap-2" style={{ color: '#CBD5E1' }}><Check className="w-4 h-4 shrink-0" style={{ color: '#5DCAA5' }} /> Todos os recursos da plataforma</li>
        </ul>
        <Button
          className="w-full hover:opacity-90 text-white font-bold"
          style={{ background: '#0d9488' }}
          onClick={onCta}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Ativar por 1 mês
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────────

export default function PlanosPage() {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allProviders } = useQuery({
    queryKey: ['allProviders'],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 500),
    initialData: [],
  });

  const { data: mySubscription } = useQuery({
    queryKey: ['mySubscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs?.[0] || null;
    },
    enabled: !!user,
  });

  // ─── Contadores de vagas ───────────────────────────────────────────────────
  const PROMO_LIMIT = 50;

  const totalPrestadores = allProviders?.filter(p =>
    p.tipo_pessoa === 'pf' ||
    (p.tipo_pessoa === 'mei' && !p.tem_ponto_fisico_em_trancoso) ||
    (p.tipo_pessoa === 'pj' && !p.tem_ponto_fisico_em_trancoso)
  ).length || 0;

  const totalEmpresas = allProviders?.filter(p =>
    ((p.tipo_pessoa === 'mei' || p.tipo_pessoa === 'pj') && p.tem_ponto_fisico_em_trancoso)
  ).length || 0;

  const totalVerificados = allProviders?.filter(p => p.verificado === true || p.status === 'ativo').length || 0;

  const vagasPrestador = Math.max(0, PROMO_LIMIT - totalPrestadores);
  const vagasEmpresa = Math.max(0, PROMO_LIMIT - totalEmpresas);
  const isPromoAtivaPrestador = vagasPrestador > 0;
  const isPromoAtivaEmpresa = vagasEmpresa > 0;

  const vagasBadgePrestador = vagasPrestador <= 10
    ? `⚠️ ${vagasPrestador} vagas restantes de 50`
    : `🔒 ${vagasPrestador} vagas restantes de 50`;
  const vagasBadgeCorPrestador = vagasPrestador <= 10
    ? "bg-red-500 text-white" : "bg-orange-400 text-white";

  const vagasBadgeEmpresa = vagasEmpresa <= 10
    ? `⚠️ ${vagasEmpresa} vagas restantes de 50`
    : `🔒 ${vagasEmpresa} vagas restantes de 50`;
  const vagasBadgeCorEmpresa = vagasEmpresa <= 10
    ? "bg-red-500 text-white" : "bg-orange-400 text-white";

  // ─── Checkout ─────────────────────────────────────────────────────────────
  const handleCheckout = async (plan) => {
    if (window.self !== window.top) {
      toast.error('O checkout só funciona no app publicado. Acesse trancosoresolve.com.br');
      return;
    }
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await base44.functions.invoke('createSubscriptionCheckout', { plan, user_email: user.email });
      if (res.data?.error === 'vagas_esgotadas') {
        toast.error(res.data.message);
        setTimeout(() => handleCheckout(plan.includes('empresa') ? 'empresa_regular' : 'regular'), 1500);
        return;
      }
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <style>{`
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="container mx-auto max-w-4xl px-4">

        {/* ─── PROVA SOCIAL ──────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <p className="text-slate-400 text-base flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            {totalVerificados > 0
              ? <span>Junte-se a <strong className="text-slate-200">{totalVerificados}</strong> prestadores já verificados em Trancoso</span>
              : <span className="text-slate-300">Junte-se aos primeiros prestadores verificados de Trancoso</span>
            }
          </p>
        </div>

        {/* ─── MENU DE ÂNCORAS ──────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 24,
          padding: '12px 0', borderBottom: '1px solid #334155',
          fontSize: 14, fontWeight: 500, marginBottom: 24
        }}>
          <a href="#prestadores" style={{color: '#f97316', textDecoration: 'none'}}>Prestadores</a>
          <a href="#empresas" style={{color: '#f97316', textDecoration: 'none'}}>Empresas</a>
          <a href="#avulso" style={{color: '#0d9488', textDecoration: 'none'}}>Uso Avulso</a>
          <a href="#recursos" style={{color: '#6366f1', textDecoration: 'none'}}>Recursos</a>
        </div>

        {/* ─── BANNER SAZONALIDADE ──────────────────────────────────────── */}
        <div className="mb-10 border-2 border-amber-500 bg-amber-900/20 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-amber-200 mb-1">
              Trancoso tem temporada. Seu plano também pode ter.
            </h2>
            <p className="text-amber-100/80 text-sm leading-relaxed">
              <strong>Alta temporada: dezembro a março e julho</strong> — quando a demanda por serviços dispara na região.<br />
              Se você trabalha por temporada, o <strong>Uso Avulso</strong> é a escolha certa: pague só quando precisar, sem mensalidade.
            </p>
          </div>
        </div>

        {/* ─── BLOCO 1: PRESTADORES ─────────────────────────────────────── */}
        <section id="prestadores">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Para Prestadores Individuais</p>

        {isPromoAtivaPrestador && (
          <div className="mb-4 text-center">
            <span className="inline-block bg-amber-900/30 border border-amber-600 text-amber-200 text-sm font-semibold rounded-full px-4 py-1.5">
              🎉 Restam <strong>{vagasPrestador}</strong> {vagasPrestador === 1 ? 'vaga' : 'vagas'} com preço de lançamento!
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 mt-6">
          {/* Prestador Lançamento */}
          {isPromoAtivaPrestador && (
            <PlanCard
              badge="🚀 Lançamento"
              badgeColor="bg-amber-400 text-amber-900"
              headerColor="bg-gradient-to-br from-amber-500 to-orange-500"
              icon={<Zap className="w-9 h-9 mx-auto opacity-90" />}
              name="Plano Prestador"
              price="29,90"
              trialLabel="2 meses grátis inclusos"
              vagasLabel={vagasBadgePrestador}
              vagasCor={vagasBadgeCorPrestador}
              benefits={BENEFICIOS_PRESTADOR}
              ctaLabel="Garantir — R$ 29,90/mês"
              ctaNote="✅ 2 meses grátis · Oferta dos 50 primeiros"
              onCta={() => handleCheckout('lancamento')}
              onCtaAvulso={() => handleCheckout('avulso_prestador')}
              ctaAvulsoLabel="Usar por 1 mês — R$ 69,90"
              loading={loadingPlan === 'lancamento'}
              loadingAvulso={loadingPlan === 'avulso_prestador'}
              highlighted={false}
              popular={false}
            />
          )}

          {/* Prestador Mensal */}
          <PlanCard
            badge={!isPromoAtivaPrestador ? "✅ Disponível" : null}
            badgeColor="bg-blue-400 text-white"
            headerColor="bg-gradient-to-br from-blue-600 to-cyan-500"
            icon={<Check className="w-9 h-9 mx-auto opacity-90" />}
            name="Plano Prestador Mensal"
            price="49,90"
            trialLabel="7 dias grátis"
            benefits={BENEFICIOS_PRESTADOR}
            ctaLabel="Assinar — R$ 49,90/mês"
            onCta={() => handleCheckout('regular')}
            onCtaAvulso={() => handleCheckout('avulso_prestador')}
            ctaAvulsoLabel="Usar por 1 mês — R$ 69,90"
            loading={loadingPlan === 'regular'}
            loadingAvulso={loadingPlan === 'avulso_prestador'}
            popular={true}
          />
        </div>
        </section>

        {/* ─── BLOCO 2: EMPRESAS ────────────────────────────────────────── */}
        <section id="empresas">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Para Empresas</p>

        {isPromoAtivaEmpresa && (
          <div className="mb-4 text-center">
            <span className="inline-block bg-amber-900/30 border border-amber-600 text-amber-200 text-sm font-semibold rounded-full px-4 py-1.5">
              🎉 Restam <strong>{vagasEmpresa}</strong> {vagasEmpresa === 1 ? 'vaga' : 'vagas'} no preço de lançamento para empresas!
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 mt-6">
          {/* Empresa Lançamento */}
          {isPromoAtivaEmpresa && (
            <PlanCard
              badge="🚀 Lançamento"
              badgeColor="bg-amber-400 text-amber-900"
              headerColor="bg-gradient-to-br from-amber-500 to-orange-500"
              icon={<Building2 className="w-9 h-9 mx-auto opacity-90" />}
              name="Plano Empresas"
              price="59,90"
              trialLabel="7 dias grátis"
              vagasLabel={vagasBadgeEmpresa}
              vagasCor={vagasBadgeCorEmpresa}
              benefits={BENEFICIOS_EMPRESA}
              ctaLabel="Garantir — R$ 59,90/mês"
              ctaNote="✅ 7 dias grátis · Oferta das 50 primeiras"
              onCta={() => handleCheckout('empresa_lancamento')}
              onCtaAvulso={() => handleCheckout('avulso_empresa')}
              ctaAvulsoLabel="Usar por 1 mês — R$ 99,99"
              loading={loadingPlan === 'empresa_lancamento'}
              loadingAvulso={loadingPlan === 'avulso_empresa'}
              popular={false}
            />
          )}

          {/* Empresa Mensal */}
          <PlanCard
            badge={!isPromoAtivaEmpresa ? "✅ Disponível" : null}
            badgeColor="bg-blue-400 text-white"
            headerColor="bg-gradient-to-br from-blue-600 to-cyan-500"
            icon={<Building2 className="w-9 h-9 mx-auto opacity-90" />}
            name="Plano Empresas Mensal"
            price="89,90"
            trialLabel="7 dias grátis"
            benefits={BENEFICIOS_EMPRESA}
            ctaLabel="Assinar — R$ 89,90/mês"
            onCta={() => handleCheckout('empresa_regular')}
            onCtaAvulso={() => handleCheckout('avulso_empresa')}
            ctaAvulsoLabel="Usar por 1 mês — R$ 99,99"
            loading={loadingPlan === 'empresa_regular'}
            loadingAvulso={loadingPlan === 'avulso_empresa'}
            popular={true}
          />
        </div>
        </section>

        {/* ─── SEÇÃO USO AVULSO ─────────────────────────────────────────── */}
        <section id="avulso">
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-2">Trabalha só na temporada?</h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto">
              A alta temporada em Trancoso concentra boa parte do movimento do ano — especialmente de dezembro a março e em julho. Se você ativa seu perfil só nesse período, o uso avulso permite pagar apenas os meses que importam, sem mensalidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AvulsoCard
              icon={<Wrench className="w-9 h-9 mx-auto opacity-90" />}
              title="Avulso Prestador"
              price="69,90"
              onCta={() => handleCheckout('avulso_prestador')}
              loading={loadingPlan === 'avulso_prestador'}
            />
            <AvulsoCard
              icon={<Building2 className="w-9 h-9 mx-auto opacity-90" />}
              title="Avulso Empresa"
              price="99,99"
              onCta={() => handleCheckout('avulso_empresa')}
              loading={loadingPlan === 'avulso_empresa'}
            />
          </div>

          <p className="text-center text-slate-500 text-xs mt-4">
            💡 Você pode reativar manualmente em qualquer mês. Nenhuma cobrança automática.
          </p>
        </div>
        </section>

        {/* Transparência */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm text-blue-200 text-center mb-6">
          <strong>Transparência total:</strong> Sem comissão sobre seus serviços. Você negocia diretamente com o cliente e fica com 100% do valor.
        </div>

        {/* ─── SEÇÃO RECURSOS ─────────────────────────────────────────── */}
        <section id="recursos" className="mb-10">
          <PositionamentoEstrategico />
        </section>

        <p className="text-center text-slate-400 text-sm mb-8">
          Dúvidas? Entre em contato: <a href="mailto:suporte@trancosoresolve.com.br" className="underline text-slate-300"><strong>suporte@trancosoresolve.com.br</strong></a>
        </p>

        {/* Assinatura ativa */}
        {mySubscription && mySubscription.status === 'active' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center mb-8">
            <p className="text-sm text-slate-300 mb-1">
              Sua assinatura está ativa
              {mySubscription.next_billing_date && ` — próxima cobrança em ${new Date(mySubscription.next_billing_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}.
            </p>
            <div className="flex justify-center mt-3">
              <CancelSubscriptionButton accessUntil={mySubscription.next_billing_date} />
            </div>
          </div>
        )}

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section style={{maxWidth: 680, margin: '48px auto', padding: '0 24px'}}>
          <h2 style={{textAlign:'center', fontWeight:700, marginBottom:24, color: '#f1f5f9'}}>
            Perguntas Frequentes
          </h2>
          {[
            {q: 'Posso cancelar a qualquer momento?', 
             r: 'Sim. Nos planos mensais você cancela quando quiser, sem multa. No uso avulso não há renovação automática.'},
            {q: 'Como funciona o período gratuito?', 
             r: 'Seu cartão é salvo no cadastro mas nenhuma cobrança é feita durante o período grátis. Você pode cancelar antes do fim sem pagar nada.'},
            {q: 'Qual a diferença entre Prestador e Prestador Mensal?', 
             r: 'O Plano Prestador tem preço de lançamento com 2 meses grátis inclusos. O Mensal tem ciclo padrão com 7 dias grátis e todos os recursos.'},
            {q: 'O que é o Uso Avulso?', 
             r: 'Ideal para quem trabalha só na alta temporada. Você paga apenas o mês que precisar, sem mensalidade fixa e sem renovação automática.'},
          ].map(({q, r}) => (
            <details key={q} style={{
              borderBottom: '1px solid #334155', padding: '16px 0', cursor: 'pointer'
            }}>
              <summary style={{fontWeight:600, fontSize:15, listStyle:'none', color: '#f1f5f9'}}>
                ▸ {q}
              </summary>
              <p style={{marginTop:8, color:'#94a3b8', fontSize:14, lineHeight:1.6}}>{r}</p>
            </details>
          ))}
        </section>
      </div>
    </div>
  );
}