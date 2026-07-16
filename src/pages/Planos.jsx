import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check, Zap, Loader2, Crown, Gift,
  ChevronDown, ChevronUp, Lock, Users, Star, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CancelSubscriptionButton from "@/components/dashboard/CancelSubscriptionButton";

// ─── Benefícios por plano ─────────────────────────────────────────────────────

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

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "O Plano Gratuito cobra alguma coisa?",
    a: "Não. O Plano Gratuito é totalmente gratuito por 30 dias. Não pedimos cartão de crédito. Ao final do período, você escolhe migrar para o Profissional ou Elite, ou continuar usando recursos básicos.",
  },
  {
    q: "Como funciona o pagamento mensal?",
    a: "O pagamento é processado pelo Mercado Pago, com segurança total. Você pode pagar com cartão, PIX ou boleto. A renovação é automática todo mês e você cancela quando quiser.",
  },
  {
    q: "Posso mudar de plano depois?",
    a: "Sim, a qualquer momento. Você pode fazer upgrade ou downgrade do plano diretamente pelo painel do prestador.",
  },
  {
    q: "Tem fidelidade ou multa de cancelamento?",
    a: "Não. Não há fidelidade. Você cancela quando quiser e o acesso continua até o fim do mês já pago.",
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

// ─── Card de Plano ─────────────────────────────────────────────────────────────

function PlanCard({
  badge, badgeColor, headerGradient, icon, name, price, priceSuffix,
  trialLabel, benefits, ctaLabel, ctaNote,
  onCta, loading, disabled, popular
}) {
  return (
    <Card className={`shadow-lg overflow-hidden relative flex flex-col ${popular ? 'border-2 border-primary ring-2 ring-primary/20' : 'border border-border'} ${disabled ? 'opacity-60' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1 shadow-md">
            <Star className="w-3 h-3 mr-1" /> Mais popular
          </Badge>
        </div>
      )}
      {badge && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`font-bold text-xs ${badgeColor}`}>{badge}</Badge>
        </div>
      )}
      <div className={`p-6 text-center text-primary-foreground ${headerGradient}`}>
        {icon}
        <h2 className="text-xl font-bold mb-1 mt-2">{name}</h2>
        <p className="text-4xl font-extrabold mt-2">
          {price === 0 ? 'R$ 0' : `R$ ${price.toFixed(2).replace('.', ',')}`}
          {priceSuffix && <span className="text-sm font-normal opacity-90">{priceSuffix}</span>}
        </p>
        {trialLabel && (
          <p className="text-xs mt-2 flex items-center justify-center gap-1 opacity-95">
            <Check className="w-3 h-3" /> {trialLabel}
          </p>
        )}
      </div>

      <CardContent className="p-5 flex flex-col flex-1 bg-card">
        <ul className="space-y-2.5 mb-5">
          {benefits.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2">
          {!disabled ? (
            <>
              <Button
                className={`w-full text-sm font-bold ${popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                onClick={onCta}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {ctaLabel}
              </Button>

              {price > 0 && (
                <div className="flex items-center gap-2 mt-3 p-2.5 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 shrink-0 text-primary" />
                  Pagamento seguro via Mercado Pago — cancele quando quiser.
                </div>
              )}

              {ctaNote && <p className="text-xs text-center text-muted-foreground">{ctaNote}</p>}
            </>
          ) : (
            <p className="text-sm text-center py-2 text-muted-foreground">Indisponível.</p>
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
      const res = await base44.functions.invoke('createSubscriptionCheckout', { plan });
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

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto max-w-5xl px-4">

        {/* ─── PROVA SOCIAL ──────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground text-base flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {totalVerificados > 0
              ? <span>Junte-se a <strong className="text-foreground">{totalVerificados}</strong> prestadores já verificados</span>
              : <span>Seja um dos primeiros prestadores verificados de Trancoso</span>
            }
          </p>
        </div>

        {/* ─── Assinatura ativa ──────────────────────────────────────────── */}
        {hasActiveSub && (
          <div className="bg-card border border-border rounded-xl p-5 text-center mb-8 shadow-sm">
            <Badge className="bg-primary/10 text-primary border border-primary/20 mb-2">
              {mySubscription.status === 'trial' ? 'Período Gratuito' : 'Assinatura Ativa'}
            </Badge>
            <p className="text-sm text-muted-foreground mb-1">
              Plano atual: <strong className="text-foreground capitalize">{mySubscription.plan}</strong>
              {mySubscription.next_billing_date && ` — próxima cobrança em ${new Date(mySubscription.next_billing_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}
            </p>
            <div className="flex justify-center mt-3">
              <CancelSubscriptionButton accessUntil={mySubscription.next_billing_date} />
            </div>
          </div>
        )}

        {/* ─── GRID DE PLANOS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* Plano Gratuito */}
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

          {/* Plano Profissional */}
          <PlanCard
            badge="⭐ Popular"
            badgeColor="bg-primary text-primary-foreground"
            headerGradient="bg-gradient-to-br from-primary to-orange-600"
            icon={<Zap className="w-9 h-9 mx-auto opacity-90" />}
            name="Profissional"
            price={19.90}
            priceSuffix="/mês"
            benefits={BENEFICIOS_PROFISSIONAL}
            ctaLabel="Assinar — R$ 19,90/mês"
            ctaNote="Cancele quando quiser, sem multa"
            onCta={() => handleCheckout('profissional')}
            loading={loadingPlan === 'profissional'}
            popular={true}
          />

          {/* Plano Elite */}
          <PlanCard
            badge="👑 Premium"
            badgeColor="bg-amber-500 text-white"
            headerGradient="bg-gradient-to-br from-amber-600 to-orange-700"
            icon={<Crown className="w-9 h-9 mx-auto opacity-90" />}
            name="Elite"
            price={197}
            priceSuffix="/mês"
            benefits={BENEFICIOS_ELITE}
            ctaLabel="Assinar — R$ 197/mês"
            ctaNote="Para prestadores que querem maximizar resultados"
            onCta={() => handleCheckout('elite')}
            loading={loadingPlan === 'elite'}
            popular={false}
          />
        </div>

        {/* Transparência */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm text-center mb-10">
          <Sparkles className="w-5 h-5 text-primary inline mr-2" />
          <strong className="text-foreground">Sem comissão sobre serviços:</strong> você negocia diretamente com o cliente e fica com 100% do valor.
        </div>

        {/* Contato */}
        <p className="text-center text-muted-foreground text-sm mb-10">
          Dúvidas? Fale com a gente: <a href="mailto:contato@trancosoresolve.com.br" className="text-primary font-semibold hover:text-primary/80">contato@trancosoresolve.com.br</a>
        </p>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
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