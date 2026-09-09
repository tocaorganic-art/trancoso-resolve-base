// Carrossel da Home — Trancoso Resolve (3 slides: prestadores / empresas / clientes)
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const BASE = "https://base44.app/api/apps/6a0754c82a7c1aae19211408/files/mp/public/6a0754c82a7c1aae19211408";

const SLIDES = [
  {
    id: "prestadores",
    img: `${BASE}/c486b7431_banner_rot1_prestadores_1920x640.png`,
    alt: "Os 100 primeiros entram grátis — divulgue seus serviços em Trancoso",
    titulo: "OS 100 PRIMEIROS ENTRAM GRÁTIS",
    sub: "Divulgue seus serviços em Trancoso e receba pedidos no WhatsApp. 30 dias sem pagar nada.",
    cta: "QUERO MINHA VAGA GRÁTIS",
    to: "/SejaPrestador",
    btn: "bg-[#25D366] hover:bg-[#1fb85a] text-[#072E1A]",
  },
  {
    id: "empresas",
    img: `${BASE}/7e26b6a0d_banner_rot2_empresas_1920x640.png`,
    alt: "Parceiros oficiais para sua pousada — vitrine digital oficial de Trancoso",
    titulo: "PARCEIROS OFICIAIS PARA SUA POUSADA",
    sub: "Pousada, loja ou restaurante na vitrine digital oficial de Trancoso. Os 100 primeiros não pagam nada por 30 dias.",
    cta: "CADASTRAR MINHA EMPRESA",
    to: "/SejaPrestador",
    btn: "bg-[#FFA81C] hover:bg-[#e8940f] text-[#241400]",
  },
  {
    id: "clientes",
    img: `${BASE}/8b7d4d9fc_banner_rot3_clientes_1920x640.png`,
    alt: "Precisa de um profissional em Trancoso? Dentista, eletricista, diarista, encanador e muito mais",
    titulo: "PRECISA DE UM PROFISSIONAL EM TRANCOSO?",
    sub: "Dentista, eletricista, diarista, encanador e muito mais. Profissionais verificados na Costa do Descobrimento.",
    cta: "SOLICITAR SERVIÇO AGORA",
    to: "/ServicosCategoria",
    btn: "bg-white hover:bg-slate-100 text-[#0E1210]",
  },
];

const INTERVALO = 6000; // 5-6s: tempo para ler titulo + proposta de valor + achar o CTA

function Seta({ dir, onClick }) {
  const esq = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={esq ? "Slide anterior" : "Próximo slide"}
      className={`absolute top-1/2 -translate-y-1/2 z-20 grid place-items-center
                  h-11 w-11 rounded-full bg-black/45 hover:bg-black/70 text-white
                  backdrop-blur-sm transition-colors focus:outline-none
                  focus:ring-2 focus:ring-white/70 ${esq ? "left-3" : "right-3"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points={esq ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  );
}

// zona reservada do CTA nas artes (calculada na geração das imagens) — IGUAL nos 3 slides
const ZONA = { left: "50.26%", top: "70%", width: "31.25%", height: "16.25%" };

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
      aria-roledescription="carrossel"
      aria-label="Destaques Trancoso Resolve"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* DESKTOP / TABLET */}
      <div className="relative hidden sm:block w-full max-w-full overflow-hidden rounded-2xl shadow-lg"
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
                  style={{ ...ZONA, fontSize: "clamp(12px, 1.15vw, 21px)", letterSpacing: "0.02em" }}>
              {s.cta}
            </Link>
          </div>
        ))}

        <Seta dir="prev" onClick={prev} />
        <Seta dir="next" onClick={next} />

        <div className="absolute bottom-4 left-6 flex gap-2 z-10">
          {SLIDES.map((s, idx) => (
            <button key={s.id} onClick={() => setI(idx)}
                    aria-label={`Ir para o slide ${idx + 1}`}
                    aria-current={idx === i}
                    className={`h-2.5 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`} />
          ))}
        </div>
      </div>

      {/* MOBILE */}
      <div className="sm:hidden w-full max-w-full overflow-hidden rounded-xl shadow-md">
        <div className="relative">
          <Link to={atual.to} aria-label={atual.cta} className="block">
            <img src={atual.img} alt={atual.alt}
                 className="w-full h-auto max-w-full object-cover block" loading="eager" />
          </Link>
          <Seta dir="prev" onClick={prev} />
          <Seta dir="next" onClick={next} />
        </div>
        <div className="bg-[#0E1210] px-4 pt-4 pb-5 text-center">
          <p className="text-white font-extrabold text-lg leading-tight">{atual.titulo}</p>
          <p className="text-[#FFD600] font-semibold text-sm mt-1.5 leading-snug">{atual.sub}</p>
          <Link to={atual.to}
                className={`mt-4 flex w-full items-center justify-center rounded-full py-4
                            text-base font-extrabold active:scale-[0.98] transition-transform ${atual.btn}`}>
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