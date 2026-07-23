import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Flame, Smartphone, Store, Download } from "lucide-react";

const SLIDES = [
  {
    id: "prestador",
    badge: "🔥 ÚLTIMAS VAGAS — Selo de Fundador gratuito",
    headline: ["Pare de perder clientes", "para quem tem app.", "Baixe agora e dominate Trancoso."],
    highlightIndex: 1,
    subtitle: "Sua agenda cheia começa hoje. 2 meses GRÁTIS + verificação de antecedentes inclusa + selo de fundador LIMITADO. Depois R$29,90/mês — ou cancele quando quiser.",
    cta: { label: "Baixar app e garantir vaga", to: "/Planos", icon: true, iconType: "download" },
    cta2: { label: "Ver planos de prestador", to: "/Planos" },
    bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format%3Dwebp&fit=crop&w=1600&q=80",
    overlay: "bg-gradient-to-r from-slate-900/92 via-slate-800/78 to-slate-900/50",
    accentColor: "text-amber-400",
    urgencyPrice: "R$29,90/mês",
    urgencyOldPrice: "R$49,90",
  },
  {
    id: "lojista",
    badge: "🛍️ Lojista? Suje clientes na região todo dia",
    headline: ["Seu comércio na tela", "de milhares de turistas", "e moradores."],
    highlightIndex: 1,
    subtitle: "Anúncios com segmentação por cidade, métricas em tempo real e CTA direto pro seu WhatsApp. Comece com 7 dias grátis — sem cartão. A partir de R$49,90/mês.",
    cta: { label: "Baixar app e anunciar agora", to: "/Planos", icon: true, iconType: "store" },
    cta2: { label: "Ver planos de lojista", to: "/Planos" },
    bg: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format%3Dwebp&fit=crop&w=1600&q=80",
    overlay: "bg-gradient-to-r from-orange-950/90 via-slate-800/75 to-slate-900/50",
    accentColor: "text-orange-400",
    urgencyPrice: "R$49,90/mês",
    urgencyOldPrice: "R$79,90",
  },
  {
    id: "combo",
    badge: "⏰ Oferta de lançamento acaba em breve",
    headline: ["App + Plano.", "Tudo que você precisa", "para crescer em Trancoso."],
    highlightIndex: 1,
    subtitle: "Prestador ou lojista: baixe o app, ative seu plano e comece a receber clientes hoje mesmo. Trial grátis, sem fidelidade, cancele quando quiser.",
    cta: { label: "Baixar app agora", to: "/Planos", icon: true, iconType: "smartphone" },
    cta2: { label: "Comparar planos", to: "/Planos" },
    bg: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format%3Dwebp&fit=crop&w=1600&q=80",
    overlay: "bg-gradient-to-r from-teal-950/90 via-slate-800/75 to-slate-900/50",
    accentColor: "text-cyan-400",
    urgencyPrice: "Trial grátis",
    urgencyOldPrice: null,
  },
];

export default function HeroBanner({ vagasRestantes = 0, total = 0 }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () => { setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length); setPaused(true); };
  const next = () => { setCurrent(c => (c + 1) % SLIDES.length); setPaused(true); };

  const slide = SLIDES[current];
  const isPrestadorSlide = slide.id === "prestador";

  const CtaIcon = ({ type }) => {
    if (type === "store") return <Store className="w-4 h-4 ml-1.5" />;
    if (type === "smartphone") return <Smartphone className="w-4 h-4 ml-1.5" />;
    return <Download className="w-4 h-4 ml-1.5" />;
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: 480 }}>
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700">
        <img
          src={slide.bg}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className={`absolute inset-0 ${slide.overlay}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-5xl px-4 py-14 md:py-24 flex flex-col items-start">
        {/* Badge */}
        <div className="mb-3">
          <Badge className="bg-red-600/90 text-white border border-red-400/40 backdrop-blur-sm text-xs md:text-sm px-3 py-1 font-bold uppercase tracking-wide">
            {slide.badge}
          </Badge>
        </div>

        {/* Vagas counter — prestador slide only */}
        {isPrestadorSlide && vagasRestantes > 0 && (
          <div className={`mb-4 flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm text-slate-900 text-sm font-extrabold px-4 py-1.5 rounded-full ${vagasRestantes <= 10 ? 'animate-pulse' : ''}`}>
            <Flame className="w-4 h-4" />
            {vagasRestantes} de 50 vagas restantes — não perca a sua
          </div>
        )}

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4 max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {slide.headline.map((line, i) => (
            <span key={i}>
              {i === slide.highlightIndex ? (
                <span className={slide.accentColor}>{line}</span>
              ) : line}
              {i < slide.headline.length - 1 && " "}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-lg mb-5 max-w-xl leading-relaxed font-medium" style={{ color: '#E2E8F0' }}>
          {slide.subtitle}
        </p>

        {/* Urgency price tag */}
        {slide.urgencyPrice && (
          <div className="mb-6 flex items-center gap-3">
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5">
              <span className="text-white text-xs font-semibold uppercase block leading-none mb-0.5">A partir de</span>
              <span className={`text-xl md:text-2xl font-extrabold ${slide.accentColor}`}>{slide.urgencyPrice}</span>
            </span>
            {slide.urgencyOldPrice && (
              <span className="text-white/50 line-through text-base md:text-lg font-semibold">{slide.urgencyOldPrice}</span>
            )}
            <span className="bg-green-600/90 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">Sem fidelidade</span>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to={slide.cta.to}>
            <Button className="bg-brand-primary text-white hover:bg-orange-600 font-extrabold px-6 py-3 text-sm md:text-base w-full sm:w-auto shadow-lg shadow-orange-900/30 uppercase tracking-wide">
              {slide.cta.label}
              {slide.cta.icon && <CtaIcon type={slide.cta.iconType} />}
            </Button>
          </Link>
          {slide.cta2 && (
            <Link to={slide.cta2.to}>
              <Button variant="outline" className="font-bold px-6 py-3 text-sm md:text-base w-full sm:w-auto hover:bg-white/15 backdrop-blur-sm" style={{ border: '2px solid rgba(255,255,255,0.7)', color: '#FFFFFF', background: 'rgba(255,255,255,0.05)' }}>
                {slide.cta2.label}
              </Button>
            </Link>
          )}
        </div>

        {/* Trust signals */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs md:text-sm text-white/70 font-medium">
          <span className="flex items-center gap-1.5">✓ Trial grátis</span>
          <span className="flex items-center gap-1.5">✓ Cancele quando quiser</span>
          <span className="flex items-center gap-1.5">✓ Sem cartão de crédito</span>
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors" aria-label="Slide anterior">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors" aria-label="Próximo slide">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPaused(true); }}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}