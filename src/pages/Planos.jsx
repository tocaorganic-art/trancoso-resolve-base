import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Check, Zap, Loader2, Crown, Gift,
  ChevronDown, ChevronUp, Sparkles, Users, Store, Waves, Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";
import PlanCard from "@/components/plans/PlanCard";

// ─── Benefícios: Prestador ─────────────────────────────────────────────────────

const BENEFICIOS_GRATUITO = [
  "Perfil na plataforma por 30 dias",
  "Recebimento de pedidos de clientes",
  "Chat direto com clientes",
  "1 serviço ativo",
];

const BENEFICIOS_PROFISSIONAL = [
  "Tudo do Gratuito, sem limite de tempo",
  "Até 10 serviços ativos simultâneos",
  "Destaque nas buscas da região",
  "Agenda integrada de atendimentos",
  "Selo de prestador verificado",
  "Suporte por WhatsApp",
];

const BENEFICIOS_ELITE = [
  "Tudo do Profissional, ilimitado",
  "Serviços ilimitados ativos",
  "Prioridade máxima nas buscas",
  "Destaque na página inicial",
  "Acesso ao assistente IA premium (TrIA)",
  "Gerador de imagens IA",
  "Painel financeiro avançado",
  "Suporte prioritário dedicado",
];

// ─── Benefícios: Lojista ───────────────────────────────────────────────────────

const BENEFICIOS_LOJISTA_ESSENCIAL = [
  "Perfil completo do estabelecimento (fotos, horários, localização)",
  "Catálogo / cardápio de até 30 itens",
  "Aparece nas buscas da região",
  "Botão WhatsApp integrado",
  "Selo de negócio verificado",
  "1 usuário gestor",
];

const BENEFICIOS_LOJISTA_PRO = [
  "Tudo do Essencial",
  "Catálogo / cardápio ilimitado",
  "Destaque nas buscas locais",
  "Sistema de reservas / agendamento integrado",
  "Painel de analytics (acessos, cliques, contatos)",
  "Suporte por WhatsApp",
  "Até 3 usuários gestores",
];

const BENEFICIOS_LOJISTA_ELITE = [
  "Tudo do Pro",
  "Prioridade máxima e posição fixa no topo das buscas",
  "Destaque na página inicial da plataforma",
  "Assistente IA TrIA + gerador de imagens",
  "Relatórios avançados com exportação",
  "Integração com Instagram / WhatsApp Business",
  "Suporte prioritário dedicado",
  "Usuários ilimitados",
];

// ─── Benefícios: Boost Sazonal ─────────────────────────────────────────────────

const BENEFICIOS_BOOST_PRESTADOR = [
  "Visibilidade máxima nas buscas durante o pico",
  'Selo "Disponível na Temporada"',
  "Prioridade acima dos planos padrão do mesmo nível",
  "Notificação de destaque para clientes da região",
];

const BENEFICIOS_BOOST_LOJISTA = [
  "Posição fixa no topo das buscas da categoria",
  "Destaque na página inicial durante o pico",
  'Banner de destaque "Aberto na Temporada"',
  "Prioridade no assistente TrIA para captação",
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "O Plano Gratuito cobra alguma coisa?",
    a: "Não. O Plano Gratuito é totalmente gratuito por 30 dias. Não pedimos cartão de crédito. Ao final do período, você escolhe migrar para o Profissional ou Elite, ou continuar usando recursos básicos.",
  },
  {
    q: "Como funciona o pagamento mensal?",
    a: "O pagamento é processado pelo Mercado Pago, com segurança total. Você pode pagar com cartão, PIX ou boleto. A renovação é automática e você cancela quando quiser.",
  },
  {
    q: "Quem pode assinar os planos Lojista?",
    a: "Os planos Lojista são para estabelecimentos com física ou digital em Trancoso, Caraíva, Arraial d'Ajuda e Porto Seguro: pousadas, restaurantes, lojas, beach clubs e similares. Você terá uma vitrine completa com fotos, catálogo/cardápio, horários e reservas.",
  },
  {
    q: "O que é o Boost de Alta Temporada?",
    a: "O Boost é um add-on opcional, cobrado por mês apenas durante os períodos de pico (dezembro, janeiro, fevereiro e Carnaval). Ele empilha sobre qualquer plano — você mantém sua assinatura normal e adiciona o Boost só quando quer máxima visibilidade. Ativação e cancelamento pelo painel, sem fidelidade.",
  },
  {
    q: "Como funciona o pagamento anual?",
    a: "No pagamento anual você paga 10 meses e leva 12 — 2 meses grátis, cerca de 17% de desconto. Aplicável aos planos Profissional, Elite e todos os Lojista. Não aplicável ao Gratuito nem ao Boost (que é sazonal).",
  },
  {
    q: "Tem fidelidade ou multa de cancelamento?",
    a: "Não. Não há fidelidade. Você cancela quando quiser e o acesso continua até o fim do período já pago.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-accent transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-foreground text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-muted/30 text-sm text-muted-foreground border-t border-border leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Toggle Mensal/Anual ───────────────────────────────────────────────────────

function BillingToggle({ isAnnual, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      <span className={`text-sm font-semibold ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensal</span>
      <button
        onClick={() => onChange(!isAnnual)}
        className="relative w-14 h-7 rounded-full bg-muted border border-border transition-colors"
        aria-label="Alternar cobrança anual"
      >
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-primary shadow-md transition-transform ${isAnnual ? 'translate-x-7' : ''}`} />
      </button>
      <span className={`text-sm font-semibold ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
        Anual <Badge className="ml-1 bg-green-100 text-green-700 text-xs">-17%</Badge>
      </span>
    </div>
  );
}

// ─── Página Principal ──────────────────────────────────────────────────────────

export default function PlanosPage() {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    document.title = "Planos e Preços — Trancoso Resolve";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = "Planos para prestadores e lojistas em Trancoso, Caraíva, Arraial d'Ajuda e Porto Seguro. Sem comissão sobre serviços. Boost de alta temporada. Cancele quando quiser.";

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/Planos`;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = `${window.location.origin}/Planos`;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = 'Planos e Preços — Trancoso Resolve';

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = 'Planos para prestadores e lojistas. Sem comissão. Boost de alta temporada. Cancele quando quiser.';

    const schemaId = 'schema-planos';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "name": "Planos e Preços — Trancoso Resolve",
          "url": `${window.location.origin}/Planos`,
          "description": "Planos para prestadores, lojistas e boost sazonal em Trancoso."
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": `${window.location.origin}` },
            { "@type": "ListItem", "position": 2, "name": "Planos", "item": `${window.location.origin}/Planos` }
          ]
        }
      ]
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
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

  const { data: allProviders } = useQuery({
    queryKey: ['allProviders'],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 500),
    initialData: [],
  });

  const totalVerificados = allProviders?.filter(p => p.verificado === true || p.status === 'ativo').length || 0;

  // ─── Checkout ─────────────────────────────────────────────────────────────
  const handleCheckout = async (plan, annual = false) => {
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
      const res = await base44.functions.invoke('createSubscriptionCheckout', { plan, is_annual: annual });
      if (res.data?.error === 'vagas_esgotadas') {
        toast.error(res.data.message);
        setTimeout(() => handleCheckout('elite'), 1500);
        return;
      }
      if (res.data?.redirect) {
        window.location.href = res.data.redirect;
        return;
      }
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const hasActiveSub = mySubscription && (mySubscription.status === 'active' || mySubscription.status === 'trial');

  // ─── Preços anuais (paga 10, leva 12) ────────────────────────────────────────
  const annualPrice = (monthly) => monthly * 10;

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4">

        {/* ─── HERO ──────────────────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Planos para toda a Costa do Descobrimento
          </h1>
          <p className="text-muted-foreground text-base flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {totalVerificados > 0
              ? <span>Junte-se a <strong className="text-foreground">{totalVerificados}</strong> prestadores já verificados</span>
              : <span>Seja um dos primeiros prestadores verificados de Trancoso</span>
            }
          </p>
        </div>

        {/* ─── Toggle Mensal/Anual ───────────────────────────────────────────── */}
        <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />

        {/* ─── Assinatura ativa ──────────────────────────────────────────────── */}
        {hasActiveSub && (
          <div className="bg-card border border-border rounded-xl p-5 text-center mb-8 shadow-sm">
            <Badge className="bg-primary/10 text-primary border border-primary/20 mb-2">
              {mySubscription.status === 'trial' ? 'Período Gratuito' : 'Assinatura Ativa'}
            </Badge>
            <p className="text-sm text-muted-foreground mb-1">
              Plano atual: <strong className="text-foreground capitalize">{mySubscription.plan?.replace(/_/g, ' ')}</strong>
              {mySubscription.is_annual && ' (Anual)'}
              {mySubscription.next_billing_date && ` — próxima cobrança em ${new Date(mySubscription.next_billing_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}
            </p>
            <div className="flex justify-center mt-3">
              <CancelSubscriptionButton accessUntil={mySubscription.next_billing_date} />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ─── SEÇÃO 1: PRESTADOR ─────────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Plano Prestador</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Para diaristas, chefs, seguranças, técnicos, DJs e transfer. Renda variável, entrada barata.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gratuito */}
            <PlanCard
              badge="🎁 Grátis"
              badgeColor="bg-muted text-foreground"
              headerGradient="bg-gradient-to-br from-muted to-accent"
              icon={<Gift className="w-9 h-9 mx-auto opacity-90 text-primary-foreground" />}
              name="Gratuito"
              price={0}
              priceSuffix="/30 dias"
              trialLabel="Sem cartão de crédito"
              benefits={BENEFICIOS_GRATUITO}
              ctaLabel="Começar grátis"
              onCta={() => handleCheckout('gratuito')}
              loading={loadingPlan === 'gratuito'}
              popular={false}
            />

            {/* Profissional */}
            <PlanCard
              badge="⭐ Popular"
              badgeColor="bg-primary text-primary-foreground"
              headerGradient="bg-gradient-to-br from-primary to-orange-600"
              icon={<Zap className="w-9 h-9 mx-auto opacity-90" />}
              name="Profissional"
              price={isAnnual ? annualPrice(19.90) : 19.90}
              priceSuffix={isAnnual ? "/ano" : "/mês"}
              trialLabel="30 dias grátis — preço de lançamento"
              benefits={BENEFICIOS_PROFISSIONAL}
              ctaLabel={isAnnual ? "Assinar anual — R$ 199/ano" : "Assinar — R$ 19,90/mês"}
              ctaNote="Cancele quando quiser, sem multa"
              onCta={() => handleCheckout('profissional', isAnnual)}
              loading={loadingPlan === 'profissional'}
              popular={true}
            />

            {/* Elite */}
            <PlanCard
              badge="👑 Premium"
              badgeColor="bg-amber-500 text-white"
              headerGradient="bg-gradient-to-br from-amber-600 to-orange-700"
              icon={<Crown className="w-9 h-9 mx-auto opacity-90" />}
              name="Elite"
              price={isAnnual ? annualPrice(197) : 197}
              priceSuffix={isAnnual ? "/ano" : "/mês"}
              trialLabel="7 dias grátis antes da cobrança"
              benefits={BENEFICIOS_ELITE}
              ctaLabel={isAnnual ? "Assinar anual — R$ 1.970/ano" : "Assinar — R$ 197/mês"}
              ctaNote="Para prestadores que querem maximizar resultados"
              onCta={() => handleCheckout('elite', isAnnual)}
              loading={loadingPlan === 'elite'}
              popular={false}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ─── SEÇÃO 2: LOJISTA ───────────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Store className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Plano Lojista</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Para pousadas, restaurantes, lojas e beach clubs. Vitrine completa com fotos, catálogo, horários e reservas. Todos com 7 dias grátis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Essencial */}
            <PlanCard
              badge="🏪 Inicial"
              badgeColor="bg-muted text-foreground"
              headerGradient="bg-gradient-to-br from-slate-600 to-slate-700"
              icon={<Store className="w-9 h-9 mx-auto opacity-90" />}
              name="Lojista Essencial"
              price={isAnnual ? annualPrice(89) : 89}
              priceSuffix={isAnnual ? "/ano" : "/mês"}
              trialLabel="7 dias grátis"
              benefits={BENEFICIOS_LOJISTA_ESSENCIAL}
              ctaLabel={isAnnual ? "Assinar anual — R$ 890/ano" : "Assinar — R$ 89/mês"}
              onCta={() => handleCheckout('lojista_essencial', isAnnual)}
              loading={loadingPlan === 'lojista_essencial'}
              popular={false}
            />

            {/* Pro */}
            <PlanCard
              badge="⭐ Popular"
              badgeColor="bg-primary text-primary-foreground"
              headerGradient="bg-gradient-to-br from-primary to-orange-600"
              icon={<Store className="w-9 h-9 mx-auto opacity-90" />}
              name="Lojista Pro"
              price={isAnnual ? annualPrice(197) : 197}
              priceSuffix={isAnnual ? "/ano" : "/mês"}
              trialLabel="7 dias grátis"
              benefits={BENEFICIOS_LOJISTA_PRO}
              ctaLabel={isAnnual ? "Assinar anual — R$ 1.970/ano" : "Assinar — R$ 197/mês"}
              onCta={() => handleCheckout('lojista_pro', isAnnual)}
              loading={loadingPlan === 'lojista_pro'}
              popular={true}
            />

            {/* Elite */}
            <PlanCard
              badge="👑 Premium"
              badgeColor="bg-amber-500 text-white"
              headerGradient="bg-gradient-to-br from-amber-600 to-orange-700"
              icon={<Crown className="w-9 h-9 mx-auto opacity-90" />}
              name="Lojista Elite"
              price={isAnnual ? annualPrice(497) : 497}
              priceSuffix={isAnnual ? "/ano" : "/mês"}
              trialLabel="7 dias grátis"
              benefits={BENEFICIOS_LOJISTA_ELITE}
              ctaLabel={isAnnual ? "Assinar anual — R$ 4.970/ano" : "Assinar — R$ 497/mês"}
              onCta={() => handleCheckout('lojista_elite', isAnnual)}
              loading={loadingPlan === 'lojista_elite'}
              popular={false}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ─── SEÇÃO 3: BOOST SAZONAL ──────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Waves className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Boost Alta Temporada</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Add-on opcional, cobrado por mês apenas nos períodos de pico (dez, jan, fev e Carnaval). Empilha sobre qualquer plano — ativação e cancelamento pelo painel, sem fidelidade.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Boost Prestador */}
            <PlanCard
              badge="🌊 Sazonal"
              badgeColor="bg-blue-500 text-white"
              headerGradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              icon={<Waves className="w-9 h-9 mx-auto opacity-90" />}
              name="Boost Prestador"
              price={99}
              priceSuffix="/mês"
              trialLabel="Apenas dez–fev e Carnaval"
              benefits={BENEFICIOS_BOOST_PRESTADOR}
              ctaLabel="Ativar Boost — R$ 99/mês"
              ctaNote="Add-on sobre qualquer plano prestador"
              onCta={() => handleCheckout('boost_prestador')}
              loading={loadingPlan === 'boost_prestador'}
              popular={false}
            />

            {/* Boost Lojista */}
            <PlanCard
              badge="🌊 Sazonal"
              badgeColor="bg-blue-500 text-white"
              headerGradient="bg-gradient-to-br from-blue-600 to-indigo-700"
              icon={<Waves className="w-9 h-9 mx-auto opacity-90" />}
              name="Boost Lojista"
              price={197}
              priceSuffix="/mês"
              trialLabel="Apenas dez–fev e Carnaval"
              benefits={BENEFICIOS_BOOST_LOJISTA}
              ctaLabel="Ativar Boost — R$ 197/mês"
              ctaNote="Add-on sobre qualquer plano lojista"
              onCta={() => handleCheckout('boost_lojista')}
              loading={loadingPlan === 'boost_lojista'}
              popular={false}
            />
          </div>
        </div>

        {/* ─── Transparência: sem comissão ──────────────────────────────────── */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm text-center mb-8">
          <Sparkles className="w-5 h-5 text-primary inline mr-2" />
          <strong className="text-foreground">Sem comissão sobre serviços:</strong> você negocia diretamente com o cliente e fica com 100% do valor.
        </div>

        {/* ─── Plano Anual ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-900 rounded-xl p-6 text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-foreground">Plano Anual: pague 10, leve 12</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            <strong className="text-green-700 dark:text-green-400">2 meses grátis</strong> no pagamento anual — cerca de 17% de desconto. Reduz churn e antecipa o caixa antes da temporada.
          </p>
          <p className="text-xs text-muted-foreground">
            Aplicável aos planos Profissional, Elite e todos os Lojista. Use o toggle "Anual" acima para ver os preços.
          </p>
        </div>

        {/* ─── Contato ──────────────────────────────────────────────────────── */}
        <p className="text-center text-muted-foreground text-sm mb-10">
          Dúvidas? Fale com a gente: <a href="mailto:contato@trancosoresolve.com.br" className="text-primary font-semibold hover:text-primary/80">contato@trancosoresolve.com.br</a>
        </p>

        {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}