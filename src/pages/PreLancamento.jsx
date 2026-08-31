import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { LogoMark } from "@/components/brand/Logo";
import { buildPublicLeadPayload, isValidBrazilianPhone } from "@/utils/leadValidation.js";
import { trackLead } from "@/utils/analytics.js";
import { motion, AnimatePresence, useInView, useMotionValue, animate } from "framer-motion";
import { ChevronDown } from "lucide-react";

function Counter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(count, target, { duration: 1.6, ease: 'easeOut', onUpdate: v => setDisplay(Math.round(v)) });
    return c.stop;
  }, [inView, target]);
  return <span ref={ref}>{display}{suffix}</span>;
}

const TOTAL_VAGAS = 50;
const CTA_URL = "https://trancosoresolve.com.br/SejaPrestador";
const DEADLINE = new Date("2025-05-19T00:00:00-03:00").getTime();

const BENEFICIOS = [
  { emoji: "🤖", title: "Novos clientes todo dia com TryA", desc: "Nossa inteligência artificial conecta você automaticamente com quem precisa do seu serviço em Trancoso." },
  { emoji: "⭐", title: "Perfil em destaque na vitrine oficial", desc: "Seu nome aparece nos primeiros resultados da plataforma durante toda a fase de lançamento." },
  { emoji: "📊", title: "Estatísticas detalhadas", desc: "Visualizações, cliques e desempenho do seu serviço num painel claro e fácil de entender." },
  { emoji: "💰", title: "Dashboard financeiro completo", desc: "Organize orçamentos, cobranças e recebimentos num só lugar." },
  { emoji: "🛡️", title: "Verificação de antecedentes", desc: "Ganhe credibilidade com moradores e empresários com o selo de prestador verificado." },
  { emoji: "📅", title: "Agenda integrada", desc: "Gerencie seus pedidos e horários diretamente na plataforma." },
];

const CHECKLIST = [
  "60 dias grátis após o primeiro pagamento",
  'Selo exclusivo "Prestador Pioneiro"',
  "Prioridade nos resultados de busca em Trancoso",
  "Acesso antecipado a novos recursos e melhorias",
];

const PASSOS = [
  {
    num: "1",
    title: "Faça seu pré-cadastro",
    desc: "Clique no botão, informe seus dados e escolha sua área de atuação. Tudo rápido e simples.",
  },
  {
    num: "2",
    title: "Validação do seu perfil",
    desc: "Nossa equipe faz uma verificação básica para garantir segurança e qualidade na plataforma.",
  },
  {
    num: "3",
    title: "Comece a receber pedidos",
    desc: "Seu serviço aparece para moradores e empresários de Trancoso, e você começa a receber novas oportunidades.",
  },
];

const FAQS = [
  {
    q: "Preciso pagar agora?",
    a: "Não. O pré-cadastro é gratuito. Você garante as condições da oferta e só paga quando a plataforma estiver ativa e você confirmar o plano.",
  },
  {
    q: "Os 60 dias grátis valem mesmo?",
    a: "Sim. Ao pagar a primeira mensalidade, você ganha 60 dias extras de uso, conforme a oferta de pré-lançamento para os 50 primeiros prestadores.",
  },
  {
    q: "Sou autônomo ou MEI, posso participar?",
    a: "Sim. A Trancoso Resolve aceita prestadores com CPF, MEI e CNPJ da região de Trancoso.",
  },
  {
    q: "Posso cancelar depois?",
    a: "Sim. Você pode cancelar conforme os termos do plano, sem multa abusiva.",
  },
];

const CATEGORIAS = [
  "Elétrica",
  "Obras / Reforma",
  "Faxina / Diarista",
  "Piscineiro",
  "Beleza",
  "Outro",
];

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, target - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.floor(timeLeft / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return { days, hours, mins, secs, expired: timeLeft <= 0 };
}

function CountdownBox({ value, label }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div style={{
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(251,191,36,0.5)",
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 6,
      }}>
        <span style={{ fontSize: "clamp(1.6rem, 7vw, 2.4rem)", fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>
        {label}
      </span>
    </div>
  );
}

function FAQItem({ q, a, index = 0 }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 10,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          padding: "18px 20px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#fff", lineHeight: 1.4 }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0, display: "inline-flex" }}>
          <ChevronDown style={{ width: 20, height: 20, color: "#10b981" }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "14px 20px 18px" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PreLancamento() {
   const [vagasRestantes, setVagasRestantes] = useState(null);
   const [form, setForm] = useState({ name: "", whatsapp: "", categoria: "", pagamento: "", consent: false, website: "" });
   const [submitted, setSubmitted] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const countdown = useCountdown(DEADLINE);

   // Meta tags para SEO e social media
   useEffect(() => {
     document.title = "Oferta de Lançamento | Trancoso Resolve";

     const updateMeta = (name, prop, content) => {
       let tag = document.querySelector(`meta[${prop}="${name}"]`);
       if (!tag) {
         tag = document.createElement("meta");
         tag.setAttribute(prop, name);
         document.head.appendChild(tag);
       }
       tag.content = content;
     };

     updateMeta("description", "name", "Pré-lançamento Trancoso Resolve: Oferta exclusiva para os 50 primeiros prestadores. R$ 29,90/mês + 60 dias grátis. Vagas limitadas!");
     updateMeta("og:title", "property", "Oferta de Lançamento | Trancoso Resolve");
     updateMeta("og:description", "property", "Seja um dos 50 primeiros prestadores de Trancoso Resolve. R$ 29,90/mês + 60 dias grátis. Vagas limitadas — garantir a sua agora!");
     updateMeta("og:image", "property", "https://media.base44.com/images/public/68eb21726a9614db4a82ba99/dfe6ee67e_generated_image.png");
     updateMeta("og:type", "property", "website");
     updateMeta("og:url", "property", window.location.href);
     updateMeta("twitter:card", "name", "summary_large_image");
     updateMeta("twitter:title", "name", "Oferta de Lançamento | Trancoso Resolve");
     updateMeta("twitter:description", "name", "Pré-lançamento: R$ 29,90/mês + 60 dias grátis. Vagas limitadas!");
   }, []);

  const atualizarVagas = () => {
    base44.functions.invoke("getFounderStats")
      .then((stats) => setVagasRestantes(typeof stats?.remaining === "number" ? stats.remaining : null))
      .catch(() => setVagasRestantes(46));
  };

  useEffect(() => {
    atualizarVagas();

    return undefined;
  }, []);

  const scrollToForm = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePhone = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    setForm(f => ({ ...f, whatsapp: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !isValidBrazilianPhone(form.whatsapp) || !form.consent) {
      setError("Preencha nome e WhatsApp para continuar.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await base44.functions.invoke("createPublicLead", buildPublicLeadPayload({
        name: form.name,
        phone: form.whatsapp,
        serviceInterest: form.categoria,
        type: "prestador",
        source: "site",
        message: `pré-lançamento | categoria: ${form.categoria || "não informada"} | pagamento: ${form.pagamento || "não informado"}`,
        consent: form.consent,
        website: form.website,
      }));

      trackLead({
        service_interest: form.categoria,
        source: "pre_lancamento",
        value: 29.90,
      });

      setSubmitted(true);
    } catch (err) {
      setError("Erro ao cadastrar. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const vagas = vagasRestantes ?? "...";
  const vagasNum = typeof vagasRestantes === "number" ? vagasRestantes : 46;
  const preenchidas = TOTAL_VAGAS - vagasNum;
  const progressoPct = Math.min(100, (preenchidas / TOTAL_VAGAS) * 100);

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#fff",
      background: `linear-gradient(170deg, rgba(7,28,55,0.85) 0%, rgba(4,18,40,0.90) 60%, rgba(10,30,50,0.95) 100%), url('https://media.base44.com/images/public/68eb21726a9614db4a82ba99/dfe6ee67e_generated_image.png') center/cover no-repeat fixed`,
      overflowX: "hidden",
    }}>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(232,87,26,0.7); }
          50% { opacity: 0.8; transform: scale(1.4); box-shadow: 0 0 0 8px rgba(232,87,26,0); }
        }
        .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
        .btn-cta {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.5px;
          min-height: 56px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 0 32px rgba(16,185,129,0.4);
          text-decoration: none;
        }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(16,185,129,0.6); }
        .btn-cta:active { transform: translateY(0); }
        .faq-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }
        .faq-body.open {
          max-height: 300px;
        }
        .pl-radio { display: none; }
        .pl-radio-label {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          background: rgba(255,255,255,0.06);
        }
        .pl-radio:checked + .pl-radio-label {
          background: rgba(16,185,129,0.2);
          border-color: #10b981;
          color: #fff;
        }
        .pl-input, .pl-select {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          color: #fff;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .pl-input::placeholder { color: rgba(255,255,255,0.38); }
        .pl-input:focus, .pl-select:focus { border-color: #E8571A; background: rgba(255,255,255,0.13); }
        .pl-select option { background: #0f2040; color: #fff; }
        .pl-select { cursor: pointer; appearance: none; }
        .sec-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(232,87,26,0.35) 30%, rgba(232,87,26,0.55) 50%, rgba(232,87,26,0.35) 70%, transparent);
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 1.85rem !important; }
          .sec-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── MINI HEADER ── */}
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 200,
        background: "rgba(6,78,59,0.97)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(16,185,129,0.25)",
        paddingTop: "max(10px, env(safe-area-inset-top))",
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark className="h-7 w-7" />
            <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#fff", whiteSpace: "nowrap" }}>Trancoso Resolve</span>
          </div>
          <motion.button className="btn-cta" onClick={scrollToForm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "8px 18px", fontSize: "0.78rem", minHeight: 38 }}>
            Garantir vaga →
          </motion.button>
        </div>
      </header>

      <div style={{ paddingTop: 56, paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}>

        {/* ══════════════ HERO ══════════════ */}
        <section className="sec-pad" style={{ padding: "64px 24px 56px", textAlign: "center", maxWidth: 640, margin: "0 auto", position: "relative", overflow: "hidden" }}>
          <motion.div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full pointer-events-none"
            style={{ background: "rgba(232,87,26,0.18)", filter: "blur(100px)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full pointer-events-none"
            style={{ background: "rgba(245,158,11,0.12)", filter: "blur(90px)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 18 }}
            style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(232,87,26,0.12)",
            border: "1px solid rgba(232,87,26,0.4)",
            borderRadius: 999, padding: "6px 16px 6px 10px",
            fontSize: "0.78rem", fontWeight: 700, color: "#E8571A",
            marginBottom: 24, letterSpacing: "0.3px",
          }}>
            <span className="pulse-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#E8571A", display: "inline-block", flexShrink: 0 }} />
            Pré-lançamento · Vagas de Fundador
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="hero-title" style={{
            fontSize: "clamp(1.95rem, 7vw, 3rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 18,
            color: "#fff",
            letterSpacing: "-0.5px",
            textShadow: "0 2px 24px rgba(0,0,0,0.5)",
          }}>
            Seja um dos{" "}
            <span style={{ background: "linear-gradient(to right, #fb923c, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>50 primeiros prestadores</span>{" "}
            da Trancoso Resolve
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ fontSize: "clamp(1rem, 3vw, 1.1rem)", color: "rgba(255,255,255,0.78)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 12px" }}>
            Garanta sua vitrine digital oficial em Trancoso e ganhe{" "}
            <strong style={{ color: "#fbbf24" }}>60 dias grátis</strong>{" "}
            ao pagar a primeira mensalidade.
          </motion.p>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>
            Para eletricistas, diaristas, pedreiros, pintores, piscineiros, manutenção, beleza e outros serviços locais.
          </p>

          {/* Contador regressivo */}
          {!countdown.expired ? (
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginBottom: 12, letterSpacing: "0.8px", fontWeight: 700, textTransform: "uppercase" }}>
                ⏳ Oferta encerra em
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <CountdownBox value={countdown.days} label="dias" />
                <CountdownBox value={countdown.hours} label="horas" />
                <CountdownBox value={countdown.mins} label="min" />
                <CountdownBox value={countdown.secs} label="seg" />
              </div>
            </div>
          ) : (
            <div style={{
              marginBottom: 32, display: "inline-block",
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 10, padding: "10px 20px",
              fontSize: "0.88rem", color: "#fca5a5", fontWeight: 700,
            }}>
              🎁 Oferta exclusiva de pré-lançamento para os 50 primeiros
            </div>
          )}

          {/* Barra de vagas */}
          <div style={{ maxWidth: 420, margin: "0 auto 36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                {preenchidas} vagas preenchidas
              </span>
              <span style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: 800 }}>
                Restam {vagas} de {TOTAL_VAGAS}
              </span>
            </div>
            <div style={{ height: 12, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progressoPct}%`,
                background: "linear-gradient(90deg, #C1440E, #E8571A)",
                borderRadius: 999,
                transition: "width 0.8s ease",
              }} />
            </div>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Atualizado em tempo real</p>
          </div>

          <motion.a href={CTA_URL} className="btn-cta" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ padding: "16px 40px", fontSize: "1.05rem", width: "100%", maxWidth: 400, display: "flex", margin: "0 auto" }}>
            QUERO GARANTIR MINHA VAGA
          </motion.a>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", marginTop: 12 }}>
            Leva menos de 2 minutos • Sem cartão de crédito agora
          </p>
        </section>

        <div className="sec-divider" />

        {/* ══════════════ BENEFÍCIOS ══════════════ */}
        <section className="sec-pad" style={{ padding: "56px 24px", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 660, margin: "0 auto" }}>
            <p style={secLabel}>Vantagens</p>
            <h2 style={secTitle}>Por que entrar agora na Trancoso Resolve?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
              {BENEFICIOS.map((b, i) => (
                <motion.div key={b.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(232,87,26,0.25)",
                  backdropFilter: "blur(6px)",
                  borderRadius: 14, padding: "16px 18px",
                }}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: "rgba(232,87,26,0.15)",
                    border: "1px solid rgba(232,87,26,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.3rem",
                  }}>{b.emoji}</motion.div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.93rem", color: "#fff", marginBottom: 4 }}>{b.title}</p>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="sec-divider" />

        {/* ══════════════ OFERTA ══════════════ */}
        <section className="sec-pad" style={{ padding: "56px 24px" }}>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <p style={secLabel}>Oferta exclusiva</p>
            <h2 style={secTitle}>Para os 50 primeiros fundadores</h2>

            <div style={{
              marginTop: 32,
              background: "linear-gradient(135deg, rgba(12,40,80,0.9), rgba(7,28,60,0.95))",
              border: "1.5px solid rgba(251,191,36,0.45)",
              backdropFilter: "blur(16px)",
              borderRadius: 24, padding: "36px 28px",
              textAlign: "center",
              boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
            }}>
              <span style={{ fontSize: "2.4rem" }}>🎁</span>
              <h3 style={{
                fontSize: "clamp(1.2rem, 4vw, 1.7rem)",
                fontWeight: 900, color: "#fff",
                marginTop: 12, marginBottom: 24, lineHeight: 1.25,
              }}>
                Pague a 1ª mensalidade e ganhe{" "}
                <em style={{ color: "#fbbf24" }}>60 dias grátis</em>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, textAlign: "left" }}>
                {CHECKLIST.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(232,87,26,0.15)",
                      border: "1px solid rgba(232,87,26,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.72rem", color: "#E8571A", fontWeight: 900,
                    }}>✓</span>
                    <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.45)",
                borderRadius: 10, padding: "12px 16px", marginBottom: 24,
              }}>
                <p style={{ fontSize: "0.85rem", color: "#fca5a5", fontWeight: 700, margin: 0 }}>
                  ⚠️ Depois das 50 vagas, a oferta volta ao formato normal, sem o bônus de 60 dias.
                </p>
              </div>

              <motion.a href={CTA_URL} className="btn-cta" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ padding: "15px 36px", fontSize: "1rem", width: "100%", maxWidth: 360, display: "flex", margin: "0 auto" }}>
                GARANTIR MINHA VAGA AGORA
              </motion.a>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
                ✔ CPF, MEI ou CNPJ · ✔ Pix, boleto ou cartão · ✔ Cancele quando quiser
              </p>
            </div>
          </div>
        </section>

        <div className="sec-divider" />

        {/* ══════════════ COMO FUNCIONA ══════════════ */}
        <section className="sec-pad" style={{ padding: "56px 24px", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <p style={secLabel}>Simples assim</p>
            <h2 style={secTitle}>Como funciona na prática</h2>
            <div style={{ marginTop: 36 }}>
              {PASSOS.map((p, i) => (
                <motion.div key={p.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                  display: "flex", gap: 18, alignItems: "flex-start",
                  padding: "22px 0",
                  borderBottom: i < PASSOS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg, #C1440E, #E8571A)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: "1.1rem", color: "#fff",
                    boxShadow: "0 4px 16px rgba(232,87,26,0.45)",
                  }}>{p.num}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", marginBottom: 6 }}>{p.title}</p>
                    <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="sec-divider" />

        {/* ══════════════ FORMULÁRIO ══════════════ */}
        <section id="contato" className="sec-pad" style={{ padding: "56px 24px" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <p style={secLabel}>Entre em contato</p>
            <h2 style={{ ...secTitle, marginBottom: 8 }}>Prefere que a gente entre em contato com você?</h2>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.58)", fontSize: "0.87rem", marginBottom: 32, lineHeight: 1.65 }}>
              Deixe seus dados e nossa equipe fala com você sobre a plataforma.
            </p>

            {submitted ? (
              <div style={{
                textAlign: "center", padding: "44px 24px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.4)",
                borderRadius: 20,
              }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontWeight: 800, fontSize: "1.3rem", color: "#10b981", marginBottom: 10 }}>Vaga garantida!</h3>
                <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  Obrigado! Em breve entraremos em contato com você pelo WhatsApp para finalizar seu cadastro.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  className="pl-input"
                  type="text"
                  placeholder="Nome completo *"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  className="pl-input"
                  type="tel"
                  inputMode="tel"
                  placeholder="WhatsApp (73) 99999-9999 *"
                  value={form.whatsapp}
                  onChange={handlePhone}
                />
                <div style={{ position: "relative" }}>
                  <select
                    className="pl-select"
                    value={form.categoria}
                    onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
                  >
                    <option value="">Categoria de serviço (opcional)</option>
                    {CATEGORIAS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", pointerEvents: "none", fontSize: "0.75rem" }}>▼</span>
                </div>

                {/* Forma de pagamento */}
                <div>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.5px" }}>FORMA DE PAGAMENTO PREFERIDA</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Pix", "Boleto", "Cartão"].map((opt) => (
                      <div key={opt} className="contents">
                        <input
                          type="radio"
                          id={`pag-${opt}`}
                          name="pagamento"
                          value={opt}
                          className="pl-radio"
                          checked={form.pagamento === opt}
                          onChange={() => setForm(f => ({ ...f, pagamento: opt }))}
                        />
                        <label htmlFor={`pag-${opt}`} className="pl-radio-label">{opt}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                  <label htmlFor="prelancamento_website">Não preencha este campo</label>
                  <input id="prelancamento_website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} />
                </div>
                <label htmlFor="prelancamento_consent" style={{ display: "flex", alignItems: "flex-start", gap: 8, color: "rgba(255,255,255,0.65)", fontSize: "0.75rem", lineHeight: 1.4 }}>
                  <input id="prelancamento_consent" type="checkbox" required checked={form.consent} onChange={(e) => setForm(f => ({ ...f, consent: e.target.checked }))} style={{ marginTop: 2, accentColor: "#10b981" }} />
                  <span>Autorizo o contato e o armazenamento dos meus dados conforme a <a href="/politica-privacidade" style={{ color: "#6ee7b7", textDecoration: "underline" }}>Política de Privacidade</a>.</span>
                </label>

                {error && <p style={{ color: "#f87171", fontSize: "0.82rem", textAlign: "center" }}>{error}</p>}
                <motion.button type="submit" className="btn-cta" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ padding: "16px", fontSize: "1rem", width: "100%", marginTop: 4 }}>
                  {loading ? "Enviando..." : "Garantir minha vaga agora 🚀"}
                </motion.button>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", textAlign: "center" }}>
                  🔒 Seus dados são seguros e não serão compartilhados.
                </p>
              </form>
            )}
          </div>
        </section>

        <div className="sec-divider" />

        {/* ══════════════ FAQ ══════════════ */}
        <section className="sec-pad" style={{ padding: "56px 24px", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <p style={secLabel}>Dúvidas</p>
            <h2 style={{ ...secTitle, marginBottom: 32 }}>Perguntas frequentes</h2>
            {FAQS.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} index={i} />)}
          </div>
        </section>

        <div className="sec-divider" />

        {/* ══════════════ CTA FINAL ══════════════ */}
        <section className="sec-pad" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <h2 style={{
              fontSize: "clamp(1.5rem, 5vw, 2.1rem)",
              fontWeight: 900, color: "#fff",
              lineHeight: 1.2, marginBottom: 16,
              textShadow: "0 2px 20px rgba(0,0,0,0.4)",
            }}>
              Não perca sua vaga de pioneiro na vitrine digital oficial de serviços em Trancoso.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", marginBottom: 4, lineHeight: 1.6 }}>
              Restam <strong style={{ color: "#fbbf24" }}>{vagas}</strong> vagas com 60 dias grátis.
            </p>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.82rem", marginBottom: 36 }}>
              Quando esgotarem, a oferta encerra.
            </p>
            <motion.a href={CTA_URL} className="btn-cta" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ padding: "18px 44px", fontSize: "1.1rem", width: "100%", maxWidth: 380, display: "flex", margin: "0 auto 20px" }}>
              CADASTRAR AGORA
            </motion.a>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto", fontStyle: "italic" }}>
              *Depoimentos e exemplos de resultados são ilustrativos e representam o potencial da plataforma.
            </p>
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "32px 20px",
          background: "rgba(4,14,35,0.9)",
          backdropFilter: "blur(8px)",
          textAlign: "center",
        }}>
          <LogoMark className="h-7 w-7 mx-auto" title="Trancoso Resolve" style={{ marginBottom: 14 }} />
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
            {[
              { href: "https://www.instagram.com/trancosoresolve/", label: "Instagram", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
              { href: "https://www.facebook.com/share/1B7w8mmbMN/", label: "Facebook", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
            ].map(({ href, label, d }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.color = "#fff"}
                onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d={d} />
                </svg>
              </a>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>Trancoso Resolve · trancosoresolve.com.br</p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", marginTop: 4 }}>© 2026 · Todos os direitos reservados</p>
        </footer>

      </div>
    </div>
  );
}

const secLabel = {
  fontSize: "0.71rem",
  fontWeight: 700,
  letterSpacing: "1.8px",
  textTransform: "uppercase",
  color: "#E8571A",
  textAlign: "center",
  marginBottom: 8,
};

const secTitle = {
  fontSize: "clamp(1.3rem, 4vw, 1.85rem)",
  fontWeight: 800,
  color: "#fff",
  textAlign: "center",
  lineHeight: 1.2,
  marginBottom: 0,
};
