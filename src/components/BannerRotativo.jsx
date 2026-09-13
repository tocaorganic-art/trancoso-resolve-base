// Carrossel da Home — Trancoso Resolve (3 slides: prestadores / empresas / clientes)
// Identidade oficial: logo no canto superior esquerdo, Nunito em todos os textos,
// dots e setas dentro dos limites do container, sem corte ou sobreposição incorreta.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const BASE = "https://base44.app/api/apps/6a0754c82a7c1aae19211408/files/mp/public/6a0754c82a7c1aae19211408";

const SLIDES = [
  {
    id: "prestadores",
    img: `${BASE}/f9e569ea7_banner_v4_1_prestadores.png`,
    alt: "A vitrine oficial de profissionais e serviços — técnico eletricista, chef e arquiteto consultor",
    titulo: "A VITRINE OFICIAL DE PROFISSIONAIS E SERVIÇOS",
    sub: "De técnicos e especialistas em hospitalidade a consultores autônomos. Os 100 primeiros entram grátis por 30 dias.",
    cta: "CADASTRE-SE GRÁTIS",
    to: "/SejaPrestador",
    btn: "bg-[#25D366] hover:bg-[#1fb85a] text-[#072E1A]",
  },
  {
    id: "empresas",
    img: `${BASE}/698d1a077_banner_v4_2_empresas.png`,
    alt: "Parceiros oficiais para sua pousada — manutenção, governança e serviços especializados na Costa do Descobrimento",
    titulo: "SUA POUSADA MERECE PARCEIROS OFICIAIS",
    sub: "Encontre equipes de manutenção, governança e serviços especializados para o seu negócio na Costa do Descobrimento.",
    cta: "CADASTRAR MINHA EMPRESA",
    to: "/SejaPrestador",
    btn: "bg-[#FFA81C] hover:bg-[#e8940f] text-[#241400]",
  },
  {
    id: "clientes",
    img: `${BASE}/ef084e6d0_banner_v4_3_clientes.png`,
    alt: "Precisa de um especialista em Trancoso? Dentistas, chefs particulares, eletricistas e limpeza premium",
    titulo: "PRECISA DE UM ESPECIALISTA EM TRANCOSO?",
    sub: "Dentistas, chefs particulares, eletricistas, limpeza premium e muito mais. Profissionais verificados.",
    cta: "SOLICITAR SERVIÇO AGORA",
    to: "/ServicosCategoria",
    btn: "bg-white hover:bg-slate-100 text-[#0E1210]",
  },
];

const INTERVALO = 6000; // 5-6s: tempo para ler titulo + proposta de valor + achar o CTA

// A logo oficial da marca vem QUEIMADA nas artes v4 (canto superior esquerdo),
// conforme o kit oficial — por isso nao ha overlay de logo em React aqui.

function Seta({ dir, onClick }) {
  const esq = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={esq ? "Slide anterior" : "Próximo slide"}
      className={`absolute top-1/2 -translate-y-1/2 z-30 grid place-items-center
                  h-11 w-11 rounded-full bg-black/45 hover:bg-black/70 text-white
                  backdrop-blur-sm transition-colors focus:outline-none
                  focus:ring-2 focus:ring-white/70 ${esq ? "left-4" : "right-4"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points={esq ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  );
}

// Dots — centralizados no rodapé do container, em pílula elevada (z-30):
// sempre dentro dos limites, legíveis sobre qualquer arte, sem corte.
function Dots({ i, total, irPara, compact = false }) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-sm px-3 py-2">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => irPara(idx)}
          aria-label={`Ir para o slide ${idx + 1}`}
          aria-current={idx === i}
          className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/70 ${
            compact ? "h-2" : "h-2.5"
          } ${idx === i ? (compact ? "w-6" : "w-8") + " bg-white" : (compact ? "w-2" : "w-2.5") + " bg-white/50 hover:bg-white/80"}`}
        />
      ))}
    </div>
  );
}

// zona reservada do CTA nas artes (calculada na geração das imagens) — IGUAL nos 3 slides
const ZONA = { left: "57.81%", top: "68.12%", width: "29.17%", height: "16.25%" };

export default function BannerRotativo() {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const reduz = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduz || pausado) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % SLIDES.length), INTERVALO);
    return () => clearInterval(timer.current);
  }, [pausado]);

  const irPara = (idx) => setI((idx + SLIDES.length) % SLIDES.length);
  const prev = () => irPara(i - 1);
  const next = () => irPara(i + 1);

  const atual = SLIDES[i];

  return (
    <section
      className="w-full"
      style={{ fontFamily: "Nunito, sans-serif" }}
      aria-roledescription="carrossel"
      aria-label="Destaques Trancoso Resolve"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* DESKTOP / TABLET */}
      <div className="relative hidden sm:block w-full max-w-full overflow-hidden"
           style={{ aspectRatio: "3 / 1" }}>
        {SLIDES.map((s, idx) => (
          <div key={s.id}
               className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
               aria-hidden={idx !== i}>
            <Link to={s.to} aria-label={s.cta} className="block w-full h-full">
              <img src={s.img} alt={s.alt} width={1920} height={640}
                   loading={idx === 0 ? "eager" : "lazy"}
                   className="w-full h-full object-cover block" />
            </Link>
            <Link to={s.to}
                  className={`absolute flex items-center justify-center rounded-full font-extrabold
                              transition-all active:scale-[0.98] shadow-lg focus:outline-none
                              focus:ring-4 focus:ring-white/50 ${s.btn}`}
                  style={{ ...ZONA, fontFamily: "Nunito, sans-serif", fontSize: "clamp(12px, 1.05vw, 20px)", letterSpacing: "0.02em" }}>
              {s.cta}
            </Link>
          </div>
        ))}

        <Seta dir="prev" onClick={prev} />
        <Seta dir="next" onClick={next} />
        <Dots i={i} total={SLIDES.length} irPara={irPara} />
      </div>

      {/* MOBILE */}
      <div className="sm:hidden w-full max-w-full overflow-hidden">
        <div className="relative">
          <Link to={atual.to} aria-label={atual.cta} className="block">
            <img src={atual.img} alt={atual.alt}
                 className="w-full h-auto max-w-full object-cover block" loading="eager" />
          </Link>
          <Seta dir="prev" onClick={prev} />
          <Seta dir="next" onClick={next} />
        </div>
        <div className="bg-[#0E1210] px-4 pt-4 pb-5 text-center" style={{ fontFamily: "Nunito, sans-serif" }}>
          <p className="text-white font-extrabold text-lg leading-tight">{atual.titulo}</p>
          <p className="text-[#FFD600] font-semibold text-sm mt-1.5 leading-snug">{atual.sub}</p>
          <Link to={atual.to}
                className={`mt-4 flex w-full items-center justify-center rounded-full py-4
                            text-base font-extrabold active:scale-[0.98] transition-transform ${atual.btn}`}
                style={{ fontFamily: "Nunito, sans-serif" }}>
            {atual.cta}
          </Link>
          <div className="mt-4 flex justify-center gap-2">
            {SLIDES.map((s, idx) => (
              <button key={s.id} onClick={() => setI(idx)}
                      aria-label={`Ir para o slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
