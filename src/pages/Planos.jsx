import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, Zap, Star, Calendar, Lock, Users, Crown,
  Building2, ChevronDown, ChevronUp, Loader2, Shield, Flame
} from "lucide-react";
import { toast } from "sonner";
import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";
import PositionamentoEstrategico from "@/components/plans/PositionamentoEstrategico";

// ─── Dados dos planos ────────────────────────────────────────────────────────

const PLANOS_PRESTADOR = [
  {
    id: "gratuito",
    nome: "Gratuito",
    preco: 0,
    precoAnual: null,
    trial: null,
    trialLabel: "30 dias grátis · sem cartão",
    destaque: false,
    cor: "from-neutral-700 to-neutral-600",
    borda: "border-border",
    icone: Shield,
    badge: null,
    features: [
      "Perfil na plataforma por 30 dias",
      "Recebimento de pedidos de clientes",
      "Chat direto com clientes",
      "1 serviço ativo",
    ],
    ctaLabel: "Começar grátis",
    ctaKey: null,
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco: 19.90,
    precoAnual: 199,
    trial: 30,
    trialLabel: "30 dias grátis · LANÇAMENTO",
    destaque: true,
    cor: "from-orange-600 to-orange-500",
    borda: "border-orange-400",
    icone: Zap,
    badge: "Mais Popular",
    features: [
      "Tudo do Gratuito, sem limite de tempo",
      "Até 10 serviços ativos simultâneos",
      "Destaque nas buscas da região",
      "Agenda integrada de atendimentos",
      "Selo de prestador verificado",
      "Suporte por WhatsApp",
    ],
    ctaLabel: "Assinar — R$19,90/mês",
    ctaKey: "profissional",
  },
  {
    id: "elite",
    nome: "Premium Elite",
    preco: 197,
    precoAnual: 1970,
    trial: 7,
    trialLabel: "7 dias grátis",
    destaque: false,
    cor: "from-amber-700 to-amber-600",
    borda: "border-amber-600",
    icone: Crown,
    badge: "Elite",
    features: [
      "Tudo do Profissional, ilimitado",
      "Serviços ilimitados ativos",
      "Prioridade máxima nas buscas",
      "Destaque na página inicial",
      "Assistente IA premium (TrIA)",
      "Gerador de imagens IA",
      "Painel financeiro avançado",
      "Suporte prioritário dedicado",
    ],
    ctaLabel: "Assinar — R$197/mês",
    ctaKey: "prestador_elite",
  },
];

const PLANOS_LOJISTA = [
  {
    id: "lojista_essencial",
    nome: "Lojista Essencial",
    preco: 89,
    precoAnual: 890,
    trial: 7,
    trialLabel: "7 dias grátis",
    destaque: false,
    cor: "from-olive-600 to-olive-500",
    borda: "border-border",
    icone: Building2,
    badge: null,
    features: [
      "Perfil completo do estabelecimento",
      "Catálogo / cardápio de até 30 itens",
      "Aparece nas buscas da região",
      "Botão WhatsApp integrado",
      "Selo de negócio verificado",
      "1 usuário gestor",
    ],
    ctaLabel: "Assinar — R$89/mês",
    ctaKey: "lojista_essencial",
  },
  {
    id: "lojista_pro",
    nome: "Lojista Pro",
    preco: 197,
    precoAnual: 1970,
    trial: 7,
    trialLabel: "7 dias grátis",
    destaque: true,
    cor: "from-orange-600 to-orange-500",
    borda: "border-orange-400",
    icone: Zap,
    badge: "Mais Popular",
    features: [
      "Tudo do Essencial",
      "Catálogo / cardápio ilimitado",
      "Destaque nas buscas locais",
      "Sistema de reservas / agendamento integrado",
      "Painel de analytics (acessos, cliques, contatos)",
      "Suporte por WhatsApp",
      "Até 3 usuários gestores",
    ],
    ctaLabel: "Assinar — R$197/mês",
    ctaKey: "lojista_pro",
  },
  {
    id: "lojista_elite",
    nome: "Lojista Elite",
    preco: 497,
    precoAnual: 4970,
    trial: 7,
    trialLabel: "7 dias grátis",
    destaque: false,
    cor: "from-amber-700 to-amber-600",
    borda: "border-amber-600",
    icone: Crown,
    badge: "Elite",
    features: [
      "Tudo do Pro",
      "Posição fixa no topo das buscas",
      "Destaque na página inicial da plataforma",
      "Assistente IA TrIA + gerador de imagens",
      "Relatórios avançados com exportação",
      "Integração com Instagram / WhatsApp Business",
      "Suporte prioritário dedicado",
      "Usuários ilimitados",
    ],
    ctaLabel: "Assinar — R$497/mês",
    ctaKey: "lojista_elite",
  },
];

const FAQ_ITEMS = [
  {
    q: "Posso cancelar a qualquer momento?",
    r: "Sim. Em todos os planos você cancela quando quiser, sem multa. Seu acesso continua até o fim do período já pago.",
  },
  {
    q: "Como funciona o período gratuito?",
    r: "Seu cartão é salvo no cadastro, mas nenhuma cobrança é feita durante o período grátis. Você pode cancelar antes do fim sem pagar nada.",
  },
  {
    q: "Por que o Profissional tem 30 dias grátis e os outros têm 7?",
    r: "O Plano Profissional é nosso preço de lançamento — os primeiros 100 prestadores verificados de Trancoso ganham 30 dias grátis e o Selo Fundador permanente. Os demais planos têm 7 dias de trial padrão.",
  },
  {
    q: "O que é o Boost Alta Temporada?",
    r: "Um add-on opcional que dá visibilidade máxima durante os picos (dez–fev e Carnaval). Você ativa e cancela pelo painel, sem fidelidade. Exige um plano base ativo.",
  },
  {
    q: "Quanto economizo no plano anual?",
    r: "Você paga 10 meses e ganha 12 — cerca de 17% de desconto. Disponível para os planos Profissional, Elite e todos os planos Lojista.",
  },
  {
    q: "Existe comissão sobre os serviços prestados?",
    r: "Não. Você negocia diretamente com o cliente e fica com 100% do valor. Cobramos apenas a assinatura da plataforma.",
  },
];

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function FaqItem({ q, r }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex justify-between items-center bg-card hover:bg-muted transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-muted text-sm text-muted-foreground border-t border-border leading-relaxed">
          {r}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plano, anual, onCta, loading }) {
  const preco = anual && plano.precoAnual
    ? (plano.precoAnual / 12).toFixed(2).replace(".", ",")
    : plano.preco === 0
      ? "0"
      : plano.preco.toFixed(2).replace(".", ",");

  const Icon = plano.icone;

  return (
    <div className={`relative flex flex-col ${plano.destaque ? "pt-5" : "pt-0"}`}>
      {plano.destaque && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <Badge className="bg-orange-500 text-white font-bold text-xs px-3 py-1 shadow-md">
            <Star className="w-3 h-3 mr-1" /> {plano.badge}
          </Badge>
        </div>
      )}
      {!plano.destaque && plano.badge && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-amber-600 text-white font-bold text-xs">
            <Crown className="w-3 h-3 mr-1" /> {plano.badge}
          </Badge>
        </div>
      )}

      <Card
        className={`flex flex-col flex-1 overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ${
          plano.destaque
            ? `border-2 ${plano.borda}`
            : `border ${plano.borda}`
        }`}
      >
        {/* Header */}
        <div className={`p-6 text-center text-white bg-gradient-to-br ${plano.cor}`}>
          <Icon className="w-9 h-9 mx-auto opacity-90" />
          <h2 className="text-xl font-extrabold mb-1 mt-2">{plano.nome}</h2>

          {plano.preco === 0 ? (
            <>
              <p className="text-3xl font-extrabold mt-1">Grátis</p>
              <p className="text-xs mt-1 text-white/90">por 30 dias · sem cartão de crédito</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-extrabold mt-1">
                R${preco}
                <span className="text-sm font-normal opacity-90">/mês</span>
              </p>
              {anual && plano.precoAnual && (
                <p className="text-xs mt-0.5 text-white/80">
                  R${plano.precoAnual}/ano · 2 meses grátis
                </p>
              )}
              <p className="text-xs mt-1 flex items-center justify-center gap-1 text-white/95">
                <Calendar className="w-3 h-3" /> {plano.trialLabel}
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <CardContent className="p-5 flex flex-col flex-1">
          <ul className="space-y-2 mb-5 flex-1">
            {plano.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                {f}
              </li>
            ))}
          </ul>

          <div className="space-y-2 mt-auto">
            {plano.preco === 0 ? (
              <Link to="/CadastroTipo">
                <Button variant="outline" className="w-full font-semibold">
                  {plano.ctaLabel}
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  className={`w-full font-bold ${
                    plano.destaque
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : ""
                  }`}
                  onClick={() => onCta(plano.ctaKey, anual)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {plano.ctaLabel}
                </Button>
                {plano.preco > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 px-1">
                    <Lock className="w-3 h-3 text-green-500 shrink-0" />
                    Cartão salvo · sem cobrança no período grátis
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BoostSection({ tipo, onCta, loading }) {
  const isPrestador = tipo === "prestador";

  return (
    <div className="rounded-2xl border-2 border-amber-500 overflow-hidden my-10">
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-200">Add-on temporário</p>
            <h3 className="text-lg font-extrabold">Boost Alta Temporada</h3>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-extrabold">
              +R${isPrestador ? "99" : "197"}<span className="text-sm font-normal opacity-90">/mês</span>
            </p>
            <p className="text-xs text-amber-200">somente dez–fev e Carnaval</p>
          </div>
        </div>
        <p className="text-sm text-amber-100/90 mt-2">
          A economia de Trancoso se concentra no Réveillon, Verão e Carnaval. O Boost dá visibilidade máxima
          exatamente quando a demanda dispara — empilha sobre qualquer plano ativo.
        </p>
      </div>

      <div className="bg-card p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
        <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(isPrestador
            ? [
                "Visibilidade máxima nas buscas durante o pico",
                'Selo "Disponível na Temporada"',
                "Prioridade acima dos planos padrão do mesmo nível",
                "Notificação de destaque para clientes da região",
              ]
            : [
                "Posição fixa no topo das buscas da categoria",
                "Destaque na página inicial durante o pico",
                'Banner "Aberto na Temporada"',
                "Prioridade no assistente TrIA para captação",
              ]
          ).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {f}
            </li>
          ))}
        </ul>

        <div className="shrink-0 text-center">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-full shadow"
            onClick={() => onCta(isPrestador ? "boost_prestador" : "boost_lojista", false)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Ativar Boost →
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Exige plano base ativo</p>
        </div>
      </div>
    </div>
  );
}

function AnnualStrip({ anual, onToggle }) {
  return (
    <div className="flex items-center justify-center gap-4 py-4 px-6 bg-muted rounded-2xl mb-8">
      <span className={`text-sm font-semibold ${!anual ? "text-foreground" : "text-muted-foreground"}`}>
        Mensal
      </span>

      <button
        role="switch"
        aria-checked={anual}
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${anual ? "bg-orange-500" : "bg-border"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${anual ? "translate-x-7" : "translate-x-1"}`}
        />
      </button>

      <span className={`text-sm font-semibold ${anual ? "text-foreground" : "text-muted-foreground"}`}>
        Anual
      </span>
      <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        2 meses grátis
      </span>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function PlanosPage() {
  const [aba, setAba] = useState("prestador");
  const [anual, setAnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: mySubscription } = useQuery({
    queryKey: ["mySubscription", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs?.[0] || null;
    },
    enabled: !!user,
  });

  // Contagem de vagas Fundador (prestadores ativos)
  const { data: founderStats } = useQuery({
    queryKey: ["founderProgress"],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.list("-created_date", 200);
      const taken =
        subs?.filter(
          s =>
            (s.status === "active" || s.status === "trial") &&
            (s.plan === "profissional" ||
              s.plan === "lancamento" ||
              s.plan === "prestador_profissional")
        ).length || 0;
      return { taken, remaining: Math.max(0, 100 - taken) };
    },
    staleTime: 60000,
  });

  const handleCheckout = async (planKey, isAnual = false) => {
    if (window.self !== window.top) {
      toast.error("O checkout só funciona no app publicado. Acesse trancosoresolve.com.br");
      return;
    }
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await base44.functions.invoke("createSubscriptionCheckout", {
        plan: planKey,
        billing: isAnual ? "annual" : "monthly",
        user_email: user.email,
      });
      if (res.data?.error === "vagas_esgotadas") {
        toast.error(res.data.message);
        return;
      }
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const planos = aba === "prestador" ? PLANOS_PRESTADOR : PLANOS_LOJISTA;
  const founderRestam = founderStats?.remaining ?? 100;

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto max-w-5xl px-4">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Sem comissão sobre serviços. Você negocia direto com o cliente e fica com 100% do valor.
          </p>
          {aba === "prestador" && founderRestam > 0 && founderRestam <= 100 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-orange-900/30 border border-orange-600 text-orange-200 text-sm font-semibold rounded-full px-4 py-1.5">
              <Shield className="w-4 h-4 text-orange-400" />
              {founderRestam === 100
                ? "Seja um dos 100 primeiros Prestadores Fundadores de Trancoso"
                : `Restam ${founderRestam} vagas de Prestador Fundador — preço de lançamento R$19,90/mês`}
            </div>
          )}
        </div>

        {/* Toggle Prestador / Lojista */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex bg-muted p-1 rounded-full gap-1">
            <button
              onClick={() => setAba("prestador")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                aba === "prestador"
                  ? "bg-orange-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Prestador
            </button>
            <button
              onClick={() => setAba("lojista")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                aba === "lojista"
                  ? "bg-orange-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sou Lojista
            </button>
          </div>
        </div>

        {/* Switch Mensal / Anual */}
        <AnnualStrip anual={anual} onToggle={() => setAnual(v => !v)} />

        {/* Cards de plano */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
          {planos.map(plano => (
            <PlanCard
              key={plano.id}
              plano={plano}
              anual={anual && plano.precoAnual !== null}
              onCta={handleCheckout}
              loading={loadingPlan === plano.ctaKey}
            />
          ))}
        </div>

        {/* Nota Mercado Pago */}
        <p className="text-center text-muted-foreground text-xs mb-4">
          Pagamento seguro via Mercado Pago — cancele quando quiser, sem multa.
        </p>

        {/* Transparência */}
        <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 text-sm text-orange-200 text-center mb-2">
          <strong>Transparência total:</strong> Sem comissão sobre seus serviços. Você negocia diretamente com o cliente e fica com 100% do valor.
        </div>

        {/* Boost Alta Temporada */}
        <BoostSection
          tipo={aba}
          onCta={handleCheckout}
          loading={loadingPlan === (aba === "prestador" ? "boost_prestador" : "boost_lojista")}
        />

        {/* Prova social */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Junte-se aos primeiros prestadores verificados de Trancoso, Caraíva e Arraial d'Ajuda
          </p>
        </div>

        {/* Recursos */}
        <section className="mb-10">
          <PositionamentoEstrategico />
        </section>

        {/* Assinatura ativa */}
        {mySubscription?.status === "active" && (
          <div className="bg-card border border-border rounded-xl p-4 text-center mb-8">
            <p className="text-sm text-muted-foreground mb-1">
              Sua assinatura está ativa
              {mySubscription.next_billing_date &&
                ` — próxima cobrança em ${new Date(
                  mySubscription.next_billing_date + "T00:00:00"
                ).toLocaleDateString("pt-BR")}`}.
            </p>
            <div className="flex justify-center mt-3">
              <CancelSubscriptionButton accessUntil={mySubscription.next_billing_date} />
            </div>
          </div>
        )}

        {/* FAQ */}
        <section className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-extrabold text-foreground text-center mb-6">
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map(item => (
              <FaqItem key={item.q} q={item.q} r={item.r} />
            ))}
          </div>
        </section>

        <p className="text-center text-muted-foreground text-sm pb-8">
          Dúvidas?{" "}
          <a href="mailto:suporte@trancosoresolve.com.br" className="underline text-foreground font-semibold">
            suporte@trancosoresolve.com.br
          </a>
        </p>
      </div>
    </div>
  );
}
