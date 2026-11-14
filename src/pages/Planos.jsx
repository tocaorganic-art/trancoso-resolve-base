import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { withTimeout } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import MetaTags from "@/components/seo/MetaTags";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, Zap, Star, Calendar, Lock, Users,
  ChevronDown, Loader2, Shield
} from "lucide-react";
import { toast } from "sonner";
import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";
import PositionamentoEstrategico from "@/components/plans/PositionamentoEstrategico";

// ─── Dados dos planos ────────────────────────────────────────────────────────

const PLANO = {
  nome: "Profissional",
  preco: 59.99,
  destaque: true,
  cor: "from-orange-600 to-orange-500",
  borda: "border-orange-400",
  icone: Zap,
  badge: "Plano único",
  features: [
    "Perfil profissional ativo",
    "Serviços ativos simultâneos",
    "Destaque nas buscas da região",
    "Agenda integrada de atendimentos",
    "Selo de prestador verificado",
    "Selo Prestador Fundador para os primeiros 100 aprovados",
    "Sem comissão sobre os serviços",
    "Negociação direta com o cliente",
    "Suporte por WhatsApp",
  ],
  ctaLabel: "Quero ser Prestador Fundador",
};

const FAQ_ITEMS = [
  {
    q: "Posso cancelar a qualquer momento?",
    r: "Sim. Você cancela quando quiser, sem multa. Seu acesso continua até o fim do período já pago.",
  },
  {
    q: "Como funciona o período gratuito?",
    r: "Todos os prestadores usam a plataforma de graça até 12/01/2027. Nenhuma cobrança acontece nesse período. Só depois dessa data a assinatura de R$ 59,99 por mês começa, e você pode cancelar antes.",
  },
  {
    q: "Existe mais de um plano?",
    r: "Não. Existe um único plano, o Profissional, por R$ 59,99 por mês.",
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="border border-border rounded-xl overflow-hidden"
    >
      <button
        className="w-full text-left px-5 py-4 flex justify-between items-center bg-card hover:bg-muted transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-sm pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-muted text-sm text-muted-foreground border-t border-border leading-relaxed">
              {r}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlanCard({ plano, onCta, loading }) {
  const preco = plano.preco.toFixed(2).replace(".", ",");
  const Icon = plano.icone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col pt-5 max-w-md mx-auto w-full"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
        <Badge className="bg-brand-primary text-white font-bold text-xs px-3 py-1 shadow-md">
          <Star className="w-3 h-3 mr-1" /> {plano.badge}
        </Badge>
      </div>

      <Card className={`flex flex-col flex-1 overflow-hidden shadow-lg border-2 ${plano.borda}`}>
        <div className={`p-6 text-center text-white bg-gradient-to-br ${plano.cor}`}>
          <Icon className="w-9 h-9 mx-auto opacity-90" />
          <h2 className="text-xl font-extrabold mb-1 mt-2">{plano.nome}</h2>
          <p className="text-3xl font-extrabold mt-1">
            R${preco}
            <span className="text-sm font-normal opacity-90">/mês</span>
          </p>
          <p className="text-xs mt-1 flex items-center justify-center gap-1 text-white/95">
            <Calendar className="w-3 h-3" /> Grátis até 12/01/2027 · sem cartão
          </p>
        </div>

        <CardContent className="p-5 flex flex-col flex-1">
          <ul className="space-y-2 mb-5 flex-1">
            {plano.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                {f}
              </li>
            ))}
          </ul>

          <div className="space-y-2 mt-auto">
            <Button
              className="w-full font-bold bg-brand-primary hover:bg-brand-primary-hover text-white"
              onClick={onCta}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {plano.ctaLabel}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 px-1">
              <Lock className="w-3 h-3 text-green-500 shrink-0" />
              Sem cobrança até 12/01/2027
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function PlanosPage() {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [paymentMethod] = useState("PIX");

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

  // Contagem de vagas Fundador (prestadores ativos).
  // Em erro (invoke lança exceção — SDK usa axios, que rejeita em não-2xx) ou
  // em resposta unavailable:true, NÃO caímos em taken:0/remaining:100/open:true.
  // Isso reproduziria o fail-open que getFounderStats foi corrigido para evitar.
  const FOUNDER_STATS_UNAVAILABLE = { taken: null, remaining: null, limit: 100, open: false, unavailable: true };
  const { data: founderStats } = useQuery({
    queryKey: ["founderProgress"],
    queryFn: async () => {
      try {
        const res = await base44.functions.invoke("getFounderStats", {});
        return res?.data && typeof res.data.taken !== "undefined" ? res.data : FOUNDER_STATS_UNAVAILABLE;
      } catch {
        return FOUNDER_STATS_UNAVAILABLE;
      }
    },
    staleTime: 60000,
  });

  const handleCheckout = async (planKey) => {
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
      const res = await withTimeout(base44.functions.invoke("createSubscriptionCheckout", {
        plan: planKey,
        billing: "monthly",
        user_email: user.email,
        method: paymentMethod,
      }));
      if (res.data?.error) {
        toast.error(res.data.message || "Não foi possível iniciar o pagamento agora.");
        return;
      }
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const founderStatsUnavailable = founderStats?.unavailable || typeof founderStats?.remaining !== "number";
  const founderRestam = founderStats?.remaining;

  return (
    <div className="bg-background min-h-screen py-12">
      <MetaTags
        title="Planos para Profissionais"
        description="Planos da Trancoso Resolve para prestadores: plano único Profissional por R$59,99/mês, grátis até 12/01/2027. Sem comissão sobre serviços — você negocia direto com o cliente e fica com 100% do valor."
      />
      <div className="container mx-auto max-w-5xl px-4">

        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-orange-400 via-orange-300 to-amber-300 bg-clip-text text-transparent">
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Sem comissão sobre serviços. Você negocia direto com o cliente e fica com 100% do valor.
          </p>
          {founderStats && founderStatsUnavailable && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 18 }}
              className="mt-3 inline-flex items-center gap-2 bg-muted border border-border text-muted-foreground text-sm font-semibold rounded-full px-4 py-1.5"
            >
              <Shield className="w-4 h-4" />
              Disponibilidade de vagas Fundador temporariamente indisponível
            </motion.div>
          )}
          {!founderStatsUnavailable && founderRestam > 0 && founderRestam <= 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 18 }}
              className="mt-3 inline-flex items-center gap-2 bg-orange-900/30 border border-orange-600 text-orange-200 text-sm font-semibold rounded-full px-4 py-1.5"
            >
              <Shield className="w-4 h-4 text-orange-400" />
              {founderRestam === 100
                ? "Seja um dos 100 Prestadores Fundadores da Costa do Descobrimento"
                : `Restam ${founderRestam} vagas de Prestador Fundador`}
            </motion.div>
          )}
        </motion.div>

        {/* Forma de pagamento: exclusivamente Pix */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <span className="text-sm font-semibold text-muted-foreground">Forma de pagamento:</span>
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <span className="text-xs font-bold text-foreground">Pix</span>
            <span className="text-[11px] text-muted-foreground">única forma disponível</span>
          </div>
        </div>

        {/* Plano único */}
        <div className="mb-6">
          <PlanCard
            plano={PLANO}
            onCta={() => handleCheckout("profissional")}
            loading={loadingPlan === "profissional"}
          />
        </div>

        <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 text-sm text-orange-200 text-center mb-8">
          <strong>Transparência total:</strong> Todos usam grátis até 12/01/2027, sem cartão. A cobrança de R$ 59,99 por mês só começa depois dessa data. Sem comissão sobre seus serviços: você negocia diretamente com o cliente e fica com 100% do valor.
        </div>

        {/* Prova social */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Junte-se aos primeiros prestadores verificados de Trancoso, Arraial d'Ajuda, Caraíva e Porto Seguro
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