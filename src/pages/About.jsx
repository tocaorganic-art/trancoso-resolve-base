import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  Shield, Star, Bot, Camera, BarChart2, Users,
  ArrowRight, CheckCircle, MapPin, Sparkles, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Animated Counter ────────────────────────────────────────────── */
function Counter({ to, suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (inView) {
      motionValue.set(0);
      const controls = animate(motionValue, to, {
        duration,
        ease: 'easeOut',
        onUpdate: (v) => setDisplay(Math.round(v).toString()),
      });
      return controls.stop;
    }
  }, [inView, to, duration, motionValue]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Scroll Reveal wrapper ───────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '', from = 'bottom' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-70px' });
  const initial = from === 'left' ? { opacity: 0, x: -40 } : from === 'right' ? { opacity: 0, x: 40 } : { opacity: 0, y: 40 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Pillar Card with magnetic hover ────────────────────────────── */
function PillarCard({ icon, title, desc, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="bg-card border border-border rounded-2xl p-6 hover:border-orange-400/50 hover:shadow-xl transition-shadow duration-300 cursor-default group"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-orange-500/15 to-orange-600/25 rounded-xl flex items-center justify-center mb-4 border border-orange-400/20 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-base text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ─── Audience Card ───────────────────────────────────────────────── */
function AudienceCard({ icon, title, desc, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, type: 'spring', stiffness: 140, damping: 14 }}
      className="bg-card border border-border rounded-2xl p-6 text-center hover:border-orange-300 hover:shadow-md transition-all duration-300 group"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-base text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

const pillars = [
  { icon: <Shield className="w-6 h-6 text-orange-400" />, title: "Profissionais Verificados", desc: "Análise de antecedentes criminais, verificação de identidade e validação de dados — cada prestador aprovado passa por rigoroso processo antes de aparecer na plataforma." },
  { icon: <Star className="w-6 h-6 text-amber-400" />, title: "Avaliações Transparentes", desc: "Clientes reais, avaliações reais. Nada de notas infladas: todo feedback é auditado para que você confie em quem contrata." },
  { icon: <Bot className="w-6 h-6 text-blue-400" />, title: "TryA — IA 24 horas", desc: "Nosso agente de inteligência artificial está disponível a qualquer momento para sugerir o profissional certo, responder dúvidas e agilizar seu pedido — tudo em português (e espanhol)." },
  { icon: <Camera className="w-6 h-6 text-violet-400" />, title: "Toca Vision — Criação Visual com IA", desc: "Prestadores têm acesso a um gerador de imagens exclusivo: crie posts, cardápios e materiais visuais de alto padrão em segundos, sem custo adicional." },
  { icon: <BarChart2 className="w-6 h-6 text-green-400" />, title: "Dashboard Financeiro Integrado", desc: "Controle de receitas, despesas, previsão de ganhos e relatórios — tudo dentro da plataforma. Sem planilhas, sem complicação." },
  { icon: <Users className="w-6 h-6 text-orange-300" />, title: "Comunidade VIP Trancoso", desc: "Uma rede exclusiva de moradores, empresários e prestadores que compartilham o compromisso com a excelência que Trancoso exige." },
];

const audience = [
  { icon: <MapPin className="w-7 h-7 text-white" />, title: "Moradores & Proprietários", desc: "Mantenha sua casa, pousada ou villa com os melhores profissionais locais — verificados, avaliados e sempre disponíveis quando você precisa." },
  { icon: <Sparkles className="w-7 h-7 text-white" />, title: "Turistas & Visitantes", desc: "Chegou a Trancoso e precisa de um eletricista, diarista ou cozinheiro? Contrate com segurança em minutos, sem precisar de indicação." },
  { icon: <Heart className="w-7 h-7 text-white" />, title: "Prestadores de Serviço", desc: "Acesse uma audiência VIP, receba mais pedidos, organize seu negócio com IA e construa uma reputação digital sólida em Trancoso." },
];

const checklist = [
  'Verificação de antecedentes criminais em todos os prestadores',
  'Avaliações auditadas e transparentes',
  'Suporte em português, inglês e espanhol (argentino)',
  'Pagamentos seguros via Mercado Pago',
  'IA integrada: TryA e Toca Vision',
  'Dashboard financeiro completo para prestadores',
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "Sobre Nós | Trancoso Resolve — Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva";
    const desc = "Conheça a Trancoso Resolve, a plataforma que conecta quem precisa de serviço a profissionais verificados em Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva, na Bahia.";
    const setMeta = (sel, attr, key, val) => { let el = document.querySelector(sel); if (!el) { el = document.createElement('meta'); if (attr) el.setAttribute(attr, key); else el.name = key; document.head.appendChild(el); } el.content = val; };
    setMeta('meta[name="description"]', null, 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', "Sobre Nós | Trancoso Resolve");
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/About`;
    const sid = 'schema-about';
    const ex = document.getElementById(sid); if (ex) ex.remove();
    const s = document.createElement('script'); s.id = sid; s.type = 'application/ld+json';
    s.text = JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", "name": "Trancoso Resolve", "url": window.location.origin, "description": desc, "foundingDate": "2017", "areaServed": [{ "@type": "Place", "name": "Trancoso, Bahia, Brasil" }, { "@type": "Place", "name": "Arraial d'Ajuda, Bahia, Brasil" }, { "@type": "Place", "name": "Porto Seguro, Bahia, Brasil" }, { "@type": "Place", "name": "Caraíva, Bahia, Brasil" }], "sameAs": ["https://www.instagram.com/trancosoresolve/", "https://www.facebook.com/share/1B7w8mmbMN/"] });
    document.head.appendChild(s);
    return () => { const el = document.getElementById(sid); if (el) el.remove(); };
  }, []);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden min-h-[75vh] flex items-center py-24 px-4 bg-gradient-to-br from-[#1a0c00] via-[#2d1200] to-[#1a0c00]">
        {/* Aurora blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-10%] left-[-5%] w-[600px] h-[500px] rounded-full bg-orange-600/30 blur-[130px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] rounded-full bg-amber-500/20 blur-[120px]"
          />
        </div>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(232,87,26,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(232,87,26,0.4) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-3.5 h-3.5" /> Trancoso, Bahia — Brasil
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white"
          >
            Sua Expertise no<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 animate-gradient-x">
              Coração de Trancoso.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10"
          >
            O Trancoso Resolve nasceu da Toca Concierge — 8 anos conectando moradores, turistas e empresários ao melhor que Trancoso tem a oferecer. Hoje somos a plataforma digital que transforma essa curadoria em tecnologia acessível para todos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link to={createPageUrl('ServicosCategoria')}>
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-xl shadow-orange-900/30 w-full sm:w-auto">
                Explorar Profissionais <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('SejaPrestador')}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Sou Prestador
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="bg-card border-y border-border py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: 8, suffix: ' anos', label: 'de experiência em Trancoso' },
              { value: 120, suffix: '+', label: 'prestadores verificados' },
              { value: 4, suffix: ' cidades', label: 'na Costa do Descobrimento' },
              { value: 500, suffix: '+', label: 'avaliações reais' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="space-y-1">
                  <p className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ MISSÃO ══════════════ */}
      <section className="py-20 px-4 border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Reveal from="left">
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">Nossa Missão</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-5 text-foreground leading-tight">
                Curadoria de experiências.<br />Conexão de confiança.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Trancoso atrai um público exigente — e esse público merece serviços à altura. Por isso desenvolvemos um processo rigoroso de verificação que vai além do básico: análise de antecedentes criminais, validação de identidade e acompanhamento contínuo de desempenho.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Mais que uma plataforma de contratação, somos o elo entre quem vive e trabalha em Trancoso e os visitantes que desejam viver a experiência com tranquilidade absoluta.
              </p>
            </Reveal>
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <Reveal key={i} delay={i * 0.07} from="right">
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-orange-200 transition-colors">
                    <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ PILARES ══════════════ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">O que nos diferencia</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-foreground">Tecnologia a serviço da excelência</h2>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <PillarCard key={i} {...p} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PARA QUEM ══════════════ */}
      <section className="py-20 px-4 bg-muted/40 border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Reveal>
              <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">Para quem é</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-3 text-foreground">Feito para Trancoso. Para todos.</h2>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {audience.map((a, i) => (
              <AudienceCard key={i} {...a} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <Reveal>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-10 md:p-14 overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Pronto para começar?</h2>
                <p className="text-orange-100 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  Seja para contratar um profissional de confiança ou expandir seu negócio em Trancoso, estamos aqui para facilitar cada passo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to={createPageUrl('ServicosCategoria')}>
                    <Button size="lg" className="bg-white text-orange-700 hover:bg-orange-50 font-bold w-full sm:w-auto shadow-xl">
                      Contratar um Profissional <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl('SejaPrestador')}>
                    <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/15 w-full sm:w-auto">
                      Quero ser Prestador
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
