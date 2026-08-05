import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, Smile, UserCheck, Briefcase, BarChart2,
  Star, MapPin, MessageCircle, ChevronDown,
  ArrowRight, CheckCircle2, Zap, Users, BadgeCheck, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

/* ─── Helpers de animação ──────────────────────────────────────────── */
function useScrollReveal(margin = '-80px') {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  return { ref, inView };
}

/* ─── Step Card ────────────────────────────────────────────────────── */
function StepCard({ number, icon, title, description, delay = 0, dark = false }) {
  const { ref, inView } = useScrollReveal('-60px');
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col items-center text-center p-6 rounded-2xl border transition-shadow hover:shadow-xl ${
        dark
          ? 'bg-slate-800/60 border-slate-700 hover:border-orange-500/40'
          : 'bg-card border-border hover:border-orange-300'
      }`}
    >
      {/* Number badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.35, delay: delay + 0.25, type: 'spring', stiffness: 220, damping: 12 }}
        className="absolute -top-3.5 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-black flex items-center justify-center shadow-md"
      >
        {number}
      </motion.div>

      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mt-2 shadow-inner ${
        dark
          ? 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600'
          : 'bg-gradient-to-br from-orange-400 to-orange-600'
      }`}>
        {icon}
      </div>

      <h3 className={`font-bold text-base mb-2 ${dark ? 'text-white' : 'text-foreground'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-muted-foreground'}`}>{description}</p>
    </motion.div>
  );
}

/* ─── Connector Arrow ──────────────────────────────────────────────── */
function Connector({ dark = false }) {
  return (
    <div className="hidden md:flex items-center justify-center flex-shrink-0 w-10">
      <ArrowRight className={`w-6 h-6 ${dark ? 'text-orange-400/60' : 'text-orange-400/70'}`} />
    </div>
  );
}

/* ─── Trust Badge ──────────────────────────────────────────────────── */
function TrustBadge({ icon, label, sub, delay = 0 }) {
  const { ref, inView } = useScrollReveal('-50px');
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 160, damping: 14 }}
      className="flex flex-col items-center text-center p-5 bg-card rounded-2xl border border-border hover:border-orange-300 hover:shadow-md transition-all duration-300 group cursor-default"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-orange-200/30">
        {icon}
      </div>
      <p className="font-bold text-foreground text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-snug">{sub}</p>
    </motion.div>
  );
}

/* ─── FAQ Accordion Item ───────────────────────────────────────────── */
function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useScrollReveal('-40px');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left bg-card hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-foreground text-sm leading-snug">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-orange-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-2 text-sm text-muted-foreground leading-relaxed bg-card border-t border-border">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Service Chip ─────────────────────────────────────────────────── */
function ServiceChip({ slug, label, delay = 0 }) {
  const { ref, inView } = useScrollReveal('-30px');
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.35, delay }}
    >
      <Link to={`/ServicoLanding?slug=${slug}`}>
        <span className="inline-flex items-center gap-1.5 bg-muted hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 border border-border hover:border-orange-300 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 cursor-pointer">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}

/* ─── Floating animated card for hero ─────────────────────────────── */
function FloatingCard({ children, className }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute hidden lg:flex bg-card border border-border rounded-2xl shadow-xl px-4 py-3 items-center gap-3 pointer-events-none ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function ComoFuncionaPage() {
  useEffect(() => {
    document.title = 'Como Funciona o Trancoso Resolve — Contrate Profissionais em Trancoso, BA';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = 'Entenda como contratar profissionais em Trancoso em 3 passos simples. Busque, agende e resolve — com profissionais verificados e avaliados pela comunidade.';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/ComoFunciona`;

    const schemaId = 'schema-como-funciona';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: 'Como Funciona o Trancoso Resolve', url: `${window.location.origin}/ComoFunciona` },
        { '@type': 'FAQPage', mainEntity: [
          { '@type': 'Question', name: 'Como contratar um serviço em Trancoso?', acceptedAnswer: { '@type': 'Answer', text: 'Acesse o Trancoso Resolve, navegue pelas categorias ou use a busca inteligente, escolha o profissional, envie sua solicitação e aguarde a confirmação.' } },
          { '@type': 'Question', name: 'Quanto custa usar o Trancoso Resolve?', acceptedAnswer: { '@type': 'Answer', text: 'Para clientes, a plataforma é totalmente gratuita.' } },
        ]}
      ]
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, []);

  const clientSteps = [
    { icon: <Search className="w-8 h-8 text-white" />, title: 'Encontre o Serviço', description: 'Navegue por categorias ou use a busca inteligente para achar exatamente o que você precisa — de faxina a passeio exclusivo.' },
    { icon: <Calendar className="w-8 h-8 text-white" />, title: 'Agende com Facilidade', description: 'Escolha o profissional pelas avaliações, veja os detalhes, marque a data e envie sua solicitação em poucos cliques.' },
    { icon: <Smile className="w-8 h-8 text-white" />, title: 'Problema Resolvido', description: 'O prestador confirma, realiza o serviço, e no final você avalia e ajuda nossa comunidade a crescer.' },
  ];

  const providerSteps = [
    { icon: <UserCheck className="w-8 h-8 text-orange-400" />, title: 'Crie seu Perfil', description: 'Cadastre-se de graça, adicione seus serviços, fotos e preços. Um perfil completo atrai mais clientes.' },
    { icon: <Briefcase className="w-8 h-8 text-orange-400" />, title: 'Receba Propostas', description: 'Seja notificado sobre novas solicitações. Gerencie sua agenda, confirme trabalhos e converse com os clientes.' },
    { icon: <BarChart2 className="w-8 h-8 text-orange-400" />, title: 'Cresça seu Negócio', description: 'Construa reputação com boas avaliações e use nosso painel para acompanhar seu desempenho e receita.' },
  ];

  const trustBadges = [
    { icon: <BadgeCheck className="w-6 h-6 text-orange-500" />, label: 'Verificados', sub: 'Identidade + Antecedentes' },
    { icon: <Star className="w-6 h-6 text-orange-500" />, label: 'Avaliados', sub: 'Feedbacks reais de clientes' },
    { icon: <MapPin className="w-6 h-6 text-orange-500" />, label: 'Locais', sub: 'Profissionais de Trancoso' },
    { icon: <MessageCircle className="w-6 h-6 text-orange-500" />, label: 'Ágeis', sub: 'Contato direto via WhatsApp' },
  ];

  const services = [
    { slug: 'limpeza-trancoso', label: '🧹 Limpeza' },
    { slug: 'eletricista-trancoso', label: '⚡ Eletricista' },
    { slug: 'encanador-trancoso', label: '🔧 Encanador' },
    { slug: 'jardinagem-trancoso', label: '🌿 Jardineiro' },
    { slug: 'cozinheiro-trancoso', label: '👨‍🍳 Cozinheiro' },
    { slug: 'pedreiro-trancoso', label: '🏗️ Pedreiro' },
    { slug: 'pintor-trancoso', label: '🖌️ Pintor' },
    { slug: 'baba-trancoso', label: '👶 Babá' },
    { slug: 'garcom-trancoso', label: '🍽️ Garçom' },
  ];

  const faqs = [
    { q: 'Como contratar um serviço em Trancoso?', a: 'Acesse o Trancoso Resolve, navegue pelas categorias ou use a busca inteligente, escolha o profissional, envie sua solicitação e aguarde a confirmação. É simples e rápido.' },
    { q: 'Como o pagamento é feito?', a: 'O pagamento é combinado e realizado diretamente entre o cliente e o prestador. A plataforma facilita o contato e agendamento, e em breve teremos opções de pagamento integradas.' },
    { q: 'O que acontece se eu tiver um problema com o serviço?', a: 'Recomendamos que você entre em contato com o prestador para resolver. Se não for possível, nossa equipe de suporte pode mediar a situação. A avaliação após o serviço também é uma ferramenta importante.' },
    { q: 'Como sei que um prestador é de confiança?', a: "Procure por prestadores com o selo 'Verificado'. Leia também as avaliações e comentários de outros clientes, que são um ótimo termômetro da qualidade do serviço." },
    { q: 'Quanto custa usar o Trancoso Resolve para contratar?', a: 'Para clientes, a plataforma é totalmente gratuita. Você navega, compara e contrata sem pagar nada à plataforma. O valor é negociado diretamente com o prestador.' },
    { q: 'Posso contratar serviços para uma villa ou pousada em Trancoso?', a: 'Sim! Muitos prestadores têm experiência em pousadas, villas e imóveis de temporada. Ao solicitar o serviço, informe o endereço e detalhes do local para facilitar o atendimento.' },
    { q: 'Como me cadastrar como prestador de serviços em Trancoso?', a: "Acesse a página 'Seja um Prestador', crie sua conta, preencha seu perfil com serviços, fotos e preços. Após a verificação de antecedentes, seu perfil fica visível para os clientes." },
  ];

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a0c00] via-[#2d1200] to-[#1a0c00] py-24 px-4">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-orange-600/20 blur-[120px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(232,87,26,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,87,26,0.3) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* Floating cards */}
        <FloatingCard className="top-20 left-[5%] gap-2">
          <BadgeCheck className="w-5 h-5 text-green-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">João Eletricista</p>
            <p className="text-xs text-muted-foreground">✅ Verificado · ⭐ 4.9</p>
          </div>
        </FloatingCard>

        <FloatingCard className="top-32 right-[5%] gap-2" style={{ animationDelay: '1.2s' }}>
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">Serviço confirmado!</p>
            <p className="text-xs text-muted-foreground">Diarista · Amanhã 08h</p>
          </div>
        </FloatingCard>

        <FloatingCard className="bottom-24 left-[8%] gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">Ana M. avaliou</p>
            <p className="text-xs text-muted-foreground">"Excelente profissional!" ⭐⭐⭐⭐⭐</p>
          </div>
        </FloatingCard>

        <FloatingCard className="bottom-24 right-[6%] gap-2">
          <Users className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">+120 prestadores</p>
            <p className="text-xs text-muted-foreground">ativos em Trancoso</p>
          </div>
        </FloatingCard>

        {/* Hero text */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" /> Como funciona o Trancoso Resolve
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight"
          >
            Simples,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              Rápido
            </span>{' '}
            e Confiável
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Conectamos você aos melhores profissionais de Trancoso. Entenda como transformamos suas necessidades em soluções em 3 passos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to={createPageUrl('ServicosCategoria')}>
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-xl shadow-orange-900/30 w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" /> Buscar Profissional
              </Button>
            </Link>
            <Link to={createPageUrl('SejaPrestador')}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Sou Prestador <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl">

        {/* ══════════════ PARA CLIENTES ══════════════ */}
        <section className="py-20">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                Para Clientes
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Sua solução em 3 passos</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">De uma faxina a um passeio exclusivo — encontre, agende e resolva sem sair do sofá.</p>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0">
            {clientSteps.map((step, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center flex-1">
                <StepCard
                  {...step}
                  number={i + 1}
                  delay={i * 0.12}
                  className="flex-1"
                />
                {i < clientSteps.length - 1 && <Connector />}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link to={createPageUrl('ServicosCategoria')}>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow">
                Encontrar um profissional <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* ══════════════ TRUST BADGES ══════════════ */}
        <section className="pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((b, i) => (
              <TrustBadge key={i} {...b} delay={i * 0.08} />
            ))}
          </div>
        </section>

        {/* ══════════════ PARA PRESTADORES ══════════════ */}
        <section className="mb-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 border border-slate-700 relative overflow-hidden">
          {/* BG glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                  Para Prestadores
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Transforme seu talento em negócio</h2>
                <p className="text-slate-400 max-w-lg mx-auto">Cadastre-se de graça, receba propostas qualificadas e faça seu negócio crescer aqui na vila.</p>
              </motion.div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch gap-0">
              {providerSteps.map((step, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center flex-1">
                  <StepCard
                    {...step}
                    number={i + 1}
                    delay={i * 0.12}
                    dark
                    className="flex-1"
                  />
                  {i < providerSteps.length - 1 && <Connector dark />}
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-10"
            >
              <Link to={createPageUrl('SejaPrestador')}>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-xl shadow-orange-900/40">
                  <Zap className="w-4 h-4 mr-2" /> Quero ser Prestador
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ══════════════ SERVIÇOS POPULARES ══════════════ */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl p-8 border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-2">Serviços Mais Procurados em Trancoso</h2>
            <p className="text-muted-foreground text-sm mb-6">Navegue pelas categorias e encontre o profissional ideal para cada necessidade:</p>
            <div className="flex flex-wrap gap-3">
              {services.map((s, i) => (
                <ServiceChip key={s.slug} {...s} delay={i * 0.04} />
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <Link to={createPageUrl('ServicosCategoria')} className="text-sm text-orange-600 hover:text-orange-500 font-semibold hover:underline inline-flex items-center gap-1">
                Ver todos os profissionais verificados em Trancoso <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ══════════════ FAQ ══════════════ */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold text-foreground mb-3">Dúvidas Frequentes</h2>
              <p className="text-muted-foreground">Sobre contratar profissionais em Trancoso</p>
            </motion.div>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} {...faq} index={i} />
            ))}
          </div>
        </section>

        {/* ══════════════ CTA FINAL ══════════════ */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-10 md:p-14 text-center text-white overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% gratuito para clientes
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Pronto para Resolver?</h2>
              <p className="text-orange-100 mb-8 max-w-md mx-auto text-base">
                Encontre profissionais verificados em Trancoso agora mesmo — em menos de 2 minutos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={createPageUrl('ServicosCategoria')}>
                  <Button size="lg" className="bg-white text-orange-700 hover:bg-orange-50 font-bold w-full sm:w-auto shadow-xl">
                    <Search className="w-5 h-5 mr-2" /> Buscar Profissional
                  </Button>
                </Link>
                <Link to={createPageUrl('SejaPrestador')}>
                  <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/15 w-full sm:w-auto">
                    Seja um Prestador
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}