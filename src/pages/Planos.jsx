import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check, Loader2, ChevronDown, ChevronUp, Lock, Users, Star, Sparkles, Zap, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";
import PositionamentoEstrategico from "@/components/plans/PositionamentoEstrategico";

// ─── Ícone e destaque visual por plano ──────────────────────────────────────

const PLAN_VISUALS = {
  gratuito: { icon: Sparkles, headerColor: "bg-gradient-to-br from-slate-500 to-slate-600", popular: false },
  profissional: { icon: Zap, headerColor: "bg-gradient-to-br from-brand-primary to-orange-600", popular: true },
  elite: { icon: Crown, headerColor: "bg-gradient-to-br from-amber-500 to-orange-600", popular: false },
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Como funciona o período grátis do Plano Gratuito?",
    a: "O Plano Gratuito dá 30 dias de acesso completo, sem cobrança e sem precisar cadastrar cartão. Depois disso, você pode continuar no Gratuito (com 1 serviço ativo) ou migrar para o Profissional ou Elite quando quiser.",
  },
  {
    q: "Posso cancelar meu plano a qualquer momento?",
    a: "Sim. Você pode cancelar quando quiser pelo seu painel, sem multa. Seu acesso continua até o fim do período já pago.",
  },
  {
    q: "Qual a diferença entre Profissional e Elite?",
    a: "O Profissional é ideal para quem está começando a crescer na plataforma. O Elite dá topo das buscas, badge exclusivo, painel financeiro completo e gerente de conta dedicado.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Todo o pagamento é processado com segurança pelo Mercado Pago. A cobrança é mensal e recorrente enquanto sua assinatura estiver ativa.",
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex justify-between items-center bg-card hover:bg-accent transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-secondary/30 text-sm text-muted-foreground border-t border-border leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Card de Plano ─────────────────────────────────────────────────────────────

// Fallback: usa o nome do plano quando plan_key ainda não foi definido no registro
const getPlanKey = (plan) => plan.plan_key || plan.name?.toLowerCase();

function PlanCard({ plan, onCta, loading, disabled }) {
  const planKey = getPlanKey(plan);
  const visual = PLAN_VISUALS[planKey] || PLAN_VISUALS.gratuito;
  const Icon = visual.icon;
  const isFree = plan.monthly_price === 0;

  return (
    <Card className={`shadow-xl overflow-hidden relative flex flex-col rounded-2xl ${visual.popular ? 'border-2 border-brand-primary' : 'border border-border'}`}>
      {visual.popular && (
        <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, whiteSpace: 'nowrap' }}>
          <Badge className="bg-brand-primary text-white font-bold text-xs px-3 py-1 shadow-brand">
            <Star className="w-3 h-3 mr-1" /> Mais popular
          </Badge>
        </div>
      )}
      <div className={`p-6 text-center text-white ${visual.headerColor}`}>
        <Icon className="w-9 h-9 mx-auto opacity-90" />
        <h2 className="text-xl font-bold mb-1 mt-2">{plan.name}</h2>
        <p className="text-sm opacity-90">{plan.description}</p>
        <p className="text-3xl font-extrabold mt-3">
          {isFree ? 'Grátis' : `R$ ${plan.monthly_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          {!isFree && <span className="text-sm font-normal opacity-90">/mês</span>}
        </p>
        {isFree && (
          <p className="text-xs mt-1 opacity-95">30 dias de acesso completo</p>
        )}
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        <ul className="space-y-2 mb-5">
          {plan.features?.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-brand-secondary" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2">
          {!disabled ? (
            <>
              <Button
                className={`w-full text-sm font-bold ${visual.popular ? 'bg-brand-primary hover:bg-brand-primary-hover text-white' : ''}`}
                onClick={onCta}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isFree ? 'Começar grátis' : `Assinar — R$ ${plan.monthly_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`}
              </Button>

              {isFree && (
                <div className="flex items-center justify-center gap-2 mt-2 px-3 py-2 bg-secondary/40 rounded-lg text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 shrink-0" />
                  Sem cartão de crédito necessário
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-center py-2 text-muted-foreground">Indisponível no momento.</p>
          )}
        </div>
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

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list(),
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

  const totalVerificados = allProviders?.filter(p => p.verificado === true || p.status === 'ativo').length || 0;

  const planOrder = { gratuito: 0, profissional: 1, elite: 2 };
  const orderedPlans = [...plans].sort((a, b) => (planOrder[getPlanKey(a)] ?? 99) - (planOrder[getPlanKey(b)] ?? 99));

  // ─── Checkout ─────────────────────────────────────────────────────────────
  const handleCheckout = async (planKey) => {
    if (window.self !== window.top) {
      toast.error('O checkout só funciona no app publicado. Acesse trancosoresolve.com.br');
      return;
    }
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await base44.functions.invoke('createSubscriptionCheckout', { plan: planKey });
      if (res.data?.error === 'vagas_esgotadas') {
        toast.error(res.data.message);
        return;
      }
      if (res.data?.error) {
        toast.error(res.data.error);
        return;
      }
      if (res.data?.redirect) {
        window.location.href = res.data.redirect;
      } else if (res.data?.url) {
        window.location.href = res.data.url;
      }
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

      <div className="container mx-auto max-w-5xl px-4">

        {/* ─── PROVA SOCIAL ──────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">Escolha seu plano</h1>
          <p className="text-muted-foreground text-base flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" />
            {totalVerificados > 0
              ? <span>Junte-se a <strong className="text-foreground">{totalVerificados}</strong> prestadores já verificados em Trancoso</span>
              : <span>Junte-se aos primeiros prestadores verificados de Trancoso</span>
            }
          </p>
        </div>

        {/* ─── PLANOS ─────────────────────────────────────────────────────── */}
        {isLoadingPlans ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {orderedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onCta={() => handleCheckout(getPlanKey(plan))}
                loading={loadingPlan === getPlanKey(plan)}
              />
            ))}
          </div>
        )}

        <div className="bg-secondary/30 border border-border rounded-lg p-4 text-sm text-muted-foreground text-center mb-6">
          <strong className="text-foreground">Transparência total:</strong> pagamento processado com segurança pelo Mercado Pago. Sem taxas escondidas.
        </div>

        {/* ─── SEÇÃO RECURSOS ─────────────────────────────────────────── */}
        <section className="mb-10">
          <PositionamentoEstrategico />
        </section>

        <p className="text-center text-muted-foreground text-sm mb-8">
          Dúvidas? Entre em contato: <a href="mailto:suporte@trancosoresolve.com.br" className="underline text-foreground"><strong>suporte@trancosoresolve.com.br</strong></a>
        </p>

        {/* Assinatura ativa */}
        {mySubscription && mySubscription.status === 'active' && (
          <div className="bg-card border border-border rounded-lg p-4 text-center mb-8">
            <p className="text-sm text-muted-foreground mb-1">
              Sua assinatura está ativa
              {mySubscription.next_billing_date && ` — próxima cobrança em ${new Date(mySubscription.next_billing_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}.
            </p>
            <div className="flex justify-center mt-3">
              <CancelSubscriptionButton accessUntil={mySubscription.next_billing_date} />
            </div>
          </div>
        )}

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section className="max-w-2xl mx-auto mt-12 px-4">
          <h2 className="text-center font-bold text-2xl mb-6 text-foreground">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
