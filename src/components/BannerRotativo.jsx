// Carrossel da Home — Trancoso Resolve (3 slides: prestadores / empresas / clientes)
// Artes v8 (fotos novas, sem marca d'água, sem edição de arte antiga). Nunito em todos os textos,
// dots e setas dentro dos limites do container, sem corte ou sobreposição incorreta.
//
// i18n: as artes têm o texto queimado em português. Em PT exibimos a arte oficial;
// nos demais idiomas exibimos o mesmo conteúdo (traduzido) em painel de marca,
// para o visitante não ver texto em português depois de trocar o idioma.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

const SLIDES = [
  {
    id: "prestadores",
    key: "slide1",
    img: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/501480410_banner_v8_1_desk.png",
    webpDesk: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/143638e7a_banner_v8_1_desk.webp",
    webpMob: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/754f59466_banner_v8_1_mob.webp",
    to: "/SejaPrestador",
    btn: "bg-[#25D366] hover:bg-[#1fb85a] text-[#072E1A]",
  },
  {
    id: "empresas",
    key: "slide2",
    img: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/18b1c0145_banner_v8_2_desk.png",
    webpDesk: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/84751126b_banner_v8_2_desk.webp",
    webpMob: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/e652c8db6_banner_v8_2_mob.webp",
    to: "/SejaPrestador",
    btn: "bg-[#FFA81C] hover:bg-[#e8940f] text-[#241400]",
  },
  {
    id: "clientes",
    key: "slide3",
    img: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/11af5df4d_banner_v8_3_desk.png",
    webpDesk: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/edca8f68d_banner_v8_3_desk.webp",
    webpMob: "https://media.base44.com/images/public/6a0754c82a7c1aae19211408/78cd35e70_banner_v8_3_mob.webp",
    to: "/ServicosCategoria",
    btn: "bg-white hover:bg-slate-100 text-[#0E1210]",
  },
];

const INTERVALO = 6000; // 5-6s: tempo para ler titulo + proposta de valor + achar o CTA

// zona reservada do CTA nas artes (calculada na geração das imagens) — IGUAL nos 3 slides
const ZONA = { left: "57.81%", top: "68.12%", width: "29.17%", height: "16.25%" };

function Seta({ dir, onClick, label }) {
  const esq = dir === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 z-30 grid place-items-center
                  h-11 w-11 rounded-full bg-black/45 hover:bg-black/70 text-white
                  backdrop-blur-xs transition-colors focus:outline-hidden
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
function Dots({ i, total, irPara, label, compact = false }) {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-xs px-3 py-2">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => irPara(idx)}
          aria-label={`${label} ${idx + 1}`}
          aria-current={idx === i}
          className={`no-touch-target rounded-full transition-all focus:outline-hidden focus:ring-2 focus:ring-white/70 ${
            compact ? "h-2" : "h-2.5"
          } ${idx === i ? (compact ? "w-6" : "w-8") + " bg-white" : (compact ? "w-2" : "w-2.5") + " bg-white/50 hover:bg-white/80"}`}
        />
      ))}
    </div>
  );
}

// Painel de marca usado quando não há arte localizada (o texto queimado na
// imagem está sempre em português). Mesmo enquadramento e paleta do Brand Kit.
function PainelTraduzido({ titulo, sub, mobile = false }) {
  return (
    <div
      className={`w-full h-full flex items-center bg-linear-to-br from-orange-600 via-orange-500 to-terracotta ${
        mobile ? "px-5 py-8 min-h-[260px]" : "px-8 md:px-14"
      }`}
    >
      <div className={mobile ? "max-w-full" : "max-w-[54%]"}>
        <p className="text-white font-black leading-tight tracking-tight text-xl md:text-2xl lg:text-3xl drop-shadow-sm" style={{ fontFamily: "Nunito, sans-serif" }}>
          {titulo}
        </p>
        <p className="mt-3 text-white/90 leading-relaxed text-sm md:text-base" style={{ fontFamily: "Nunito, sans-serif" }}>
          {sub}
        </p>
      </div>
    </div>
  );
}

export default function BannerRotativo() {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  const timer = useRef(null);
  const { t, lang } = useApp();

  // A arte oficial tem o texto em português; nos outros idiomas usamos o painel traduzido.
  const usarArte = lang === "pt";

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
  const cta = (s) => t(`banner.${s.key}Cta`);
  const titulo = (s) => t(`banner.${s.key}Title`);
  const sub = (s) => t(`banner.${s.key}Sub`);
  const alt = (s) => t(`banner.${s.key}Alt`);

  return (
    <section
      className="w-full"
      style={{ fontFamily: "Nunito, sans-serif" }}
      aria-roledescription="carrossel"
      aria-label={t("banner.region")}
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
            <Link to={s.to} tabIndex={idx === i ? 0 : -1} aria-label={cta(s)} className="block w-full h-full">
              {usarArte ? (
                <picture>
                  <source srcSet={s.webpDesk} type="image/webp" />
                  <img src={s.img} alt={alt(s)} width={1920} height={640}
                     loading="lazy"
                     fetchPriority={idx === 0 ? "high" : "low"}
                     decoding="async"
                     className="w-full h-full object-cover block" />
                </picture>
              ) : (
                <PainelTraduzido titulo={titulo(s)} sub={sub(s)} />
              )}
            </Link>
            <Link to={s.to} tabIndex={idx === i ? 0 : -1}
                  className={`absolute flex items-center justify-center rounded-full font-extrabold
                              transition-all active:scale-[0.98] shadow-lg focus:outline-hidden
                              focus:ring-4 focus:ring-white/50 ${s.btn}`}
                  style={{ ...ZONA, fontFamily: "Nunito, sans-serif", fontSize: "clamp(12px, 1.05vw, 20px)", letterSpacing: "0.02em" }}>
              {cta(s)}
            </Link>
          </div>
        ))}

        <Seta dir="prev" onClick={prev} label={t("banner.prevSlide")} />
        <Seta dir="next" onClick={next} label={t("banner.nextSlide")} />
        <Dots i={i} total={SLIDES.length} irPara={irPara} label={t("banner.goToSlide")} />
      </div>

      {/* MOBILE */}
      <div className="sm:hidden w-full max-w-full overflow-hidden">
        <div className="relative">
          <Link to={atual.to} aria-label={cta(atual)} className="block">
            {usarArte ? (
              <picture>
                <source srcSet={atual.webpMob} media="(max-width: 640px)" type="image/webp" />
                <source srcSet={atual.webpDesk} type="image/webp" />
                <img src={atual.img} alt={alt(atual)} width={1080} height={810}
                   className="w-full h-auto max-w-full object-cover block" loading="eager"
                   fetchPriority={i === 0 ? "high" : "low"} decoding="async" />
              </picture>
            ) : (
              <PainelTraduzido titulo={titulo(atual)} sub={sub(atual)} mobile />
            )}
          </Link>
          <Seta dir="prev" onClick={prev} label={t("banner.prevSlide")} />
          <Seta dir="next" onClick={next} label={t("banner.nextSlide")} />
        </div>
        {/* Mobile: a arte v5 ja traz titulo/sub/CTA queimados na propria imagem —
            este card exibia o MESMO texto de novo embaixo (duplicacao reportada).
            Mantem apenas o botao de acao (alvo de toque grande) + dots. */}
        <div className="bg-[#0E1210] px-4 pt-3 pb-5 text-center" style={{ fontFamily: "Nunito, sans-serif" }}>
          <Link to={atual.to}
                className={`mt-4 flex w-full items-center justify-center rounded-full py-4
                            text-base font-extrabold active:scale-[0.98] transition-transform ${atual.btn}`}
                style={{ fontFamily: "Nunito, sans-serif" }}>
            {cta(atual)}
          </Link>
          <div className="mt-4 flex justify-center gap-2">
            {SLIDES.map((s, idx) => (
              <button key={s.id} onClick={() => setI(idx)}
                      aria-label={`${t("banner.goToSlide")} ${idx + 1}`}
                      className={`no-touch-target h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
