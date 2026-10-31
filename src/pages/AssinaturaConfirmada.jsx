import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, CreditCard, ArrowRight, Clock, Sparkles } from "lucide-react";
import { trackPurchase } from '@/lib/facebook-pixel';
import { base44 } from '@/api/base44Client';
import { CONSENT_CHANGED_EVENT, trackAnalyticsEvent } from '@/utils/consent.js';
import { buildConversionParams, conversionKey, pickSubscription } from '@/utils/assinaturaConversao.js';

// O webhook do Asaas pode chegar alguns segundos depois do redirect.
const POLL_INTERVAL_MS = 4000;
const POLL_MAX_TENTATIVAS = 8;

const storageGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const storageSet = (key, value) => { try { localStorage.setItem(key, value); } catch { /* storage indisponível */ } };

const PLAN_INFO = {
  profissional:      { nome: "Plano Profissional",       valor: "R$ 59,90/mês", trial: 7 },
  prestador_elite:   { nome: "Plano Premium Elite",      valor: "R$ 197/mês",   trial: 7 },
  lojista_essencial: { nome: "Plano Lojista Essencial",  valor: "R$ 89/mês",    trial: 7 },
  lojista_pro:       { nome: "Plano Lojista Pro",        valor: "R$ 197/mês",   trial: 7 },
  lojista_elite:     { nome: "Plano Lojista Elite",      valor: "R$ 497/mês",   trial: 7 },
  boost_prestador:   { nome: "Boost Prestador (7 dias no topo)", valor: "R$ 9,90", trial: 0 },
};

const Particle = ({ delay, x, size }) => (
  <motion.div
    className="absolute rounded-full bg-orange-400/20 pointer-events-none"
    style={{ width: size, height: size, left: `${x}%`, top: '10%' }}
    animate={{ y: [0, -80, 0], opacity: [0, 0.6, 0], scale: [1, 1.4, 1] }}
    transition={{ duration: 3 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

export default function AssinaturaConfirmada() {
  const [params, setParams] = useState({ avulso: false, plan: null });
  const purchaseTracked = useRef(false);

  // Conversão "Assinatura" no Google Ads (AW-18431007500).
  // Só dispara com pagamento confirmado pelo backend (Subscription "active",
  // gravada pelo asaasWebhook) e com o valor real do plano. Carregar a página
  // sozinho, ou com assinatura ainda em trial, não gera conversão.
  // A marca de "enviado" só é gravada depois do envio de fato: quem aceitar
  // os cookies depois, na mesma visita, ainda gera a conversão.
  useEffect(() => {
    let cancelado = false;
    let timer = null;
    let tentativas = 0;
    let pendente = null;
    let email = null;
    const asaasSubscriptionId = new URLSearchParams(window.location.search).get('subscription');

    const enviar = () => {
      if (!pendente) return;
      if (storageGet(pendente.key) === '1') {
        pendente = null;
        return;
      }
      if (trackAnalyticsEvent('conversion', pendente.params)) {
        storageSet(pendente.key, '1');
        pendente = null;
      }
    };

    const verificar = async () => {
      tentativas += 1;
      try {
        if (!email) {
          const user = await base44.auth.me();
          email = user?.email || null;
        }
        if (cancelado || !email) return;
        const subscriptions = await base44.entities.Subscription.filter({ user_email: email });
        if (cancelado) return;
        const subscription = pickSubscription(subscriptions, asaasSubscriptionId);
        const conversionParams = buildConversionParams(subscription);
        if (conversionParams) {
          pendente = { key: conversionKey(subscription), params: conversionParams };
          enviar();
          return;
        }
      } catch {
        // Falha transitória: tenta de novo até o limite.
      }
      if (!cancelado && tentativas < POLL_MAX_TENTATIVAS) {
        timer = setTimeout(verificar, POLL_INTERVAL_MS);
      }
    };

    verificar();
    window.addEventListener(CONSENT_CHANGED_EVENT, enviar);
    return () => {
      cancelado = true;
      clearTimeout(timer);
      window.removeEventListener(CONSENT_CHANGED_EVENT, enviar);
    };
  }, []);

  useEffect(() => {
    document.title = "Assinatura Confirmada | Trancoso Resolve";
    const urlParams = new URLSearchParams(window.location.search);
    const avulso = urlParams.get('avulso') === 'true';
    const plan = urlParams.get('plan') || null;
    setParams({ avulso, plan });
    if (!purchaseTracked.current && (avulso || plan)) {
      trackPurchase({ content_name: plan || 'Uso avulso', plan: plan || 'avulso' });
      purchaseTracked.current = true;
    }
  }, []);

  const isAvulso = params.avulso;
  const planInfo = PLAN_INFO[params.plan] || null;

  const trialEndDate = planInfo?.trial > 0
    ? new Date(Date.now() + planInfo.trial * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
    : null;

  const NEXT_STEPS = [
    planInfo ? `Plano contratado: ${planInfo.nome}` : 'Sua assinatura foi ativada!',
    trialEndDate ? `Período gratuito até ${trialEndDate}, depois ${planInfo?.valor}` : (planInfo?.valor || 'Mensal automático'),
    isAvulso ? 'Acesso de 1 mês ativo, sem renovação automática.' : 'Acesse seu painel e comece a receber pedidos agora.',
  ];

  return (
    <div className="relative min-h-screen bg-linear-to-b from-[#1a0c00] via-[#2d1200] to-[#1a0c00] overflow-hidden flex items-center justify-center px-4 py-16">
      {/* Aurora blobs */}
      <motion.div
        className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full bg-orange-600/20 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-amber-500/15 blur-[90px] pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Partículas */}
      {[{ delay: 0, x: 10, size: 8 }, { delay: 0.8, x: 30, size: 5 }, { delay: 1.5, x: 60, size: 10 }, { delay: 0.3, x: 80, size: 6 }, { delay: 1.2, x: 50, size: 7 }].map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <div className="relative z-10 text-center px-6 pt-4 w-full max-w-md mx-auto">

        {/* Ícone de sucesso com anéis pulsantes duplos */}
        <div className="relative mx-auto w-28 h-28 mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-500/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-amber-500/25"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30"
          >
            <Crown className="w-12 h-12 text-amber-400" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Texto principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl font-extrabold mb-3"
        >
          <span className="bg-linear-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Assinatura ativada
          </span>{' '}
          <span className="text-white">com sucesso!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="text-slate-300 text-sm leading-relaxed mb-10"
        >
          {isAvulso
            ? "Seu acesso de 1 mês está ativo! Aproveite a temporada."
            : trialEndDate
              ? `Seu período gratuito começou. Nenhuma cobrança até ${trialEndDate}.`
              : "Sua assinatura foi ativada com sucesso!"}
        </motion.p>

        {/* Card de detalhes / próximos passos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.55 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-semibold">Próximos passos</span>
          </div>
          <ul className="space-y-2 text-slate-300 text-xs leading-relaxed">
            {NEXT_STEPS.map((text, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.35 }}
                className="flex items-start gap-2"
              >
                <ArrowRight className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" /> {text}
              </motion.li>
            ))}
          </ul>

          {trialEndDate && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <Clock className="w-4 h-4 text-orange-400 shrink-0" />
              <p className="text-orange-300 text-xs">
                <strong>Nenhuma cobrança</strong> durante o período gratuito.
              </p>
            </div>
          )}
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link to="/Dashboard">
              <button className="w-full py-3.5 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/30">
                Acessar meu painel <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            whileHover={{ y: -2 }}
          >
            <Link to="/Planos">
              <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-medium flex items-center justify-center gap-2 transition-all">
                <CreditCard className="w-4 h-4" /> Ver meu plano
              </button>
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-muted-foreground text-sm mt-6"
        >
          Dúvidas? <a href="mailto:suporte@trancosoresolve.com.br" className="underline text-orange-400">suporte@trancosoresolve.com.br</a>
        </motion.p>
      </div>
    </div>
  );
}