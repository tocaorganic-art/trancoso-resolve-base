import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, Users, Star, Percent, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LazyImage from '@/components/ui/LazyImage';

const banners = [
  {
    id: 1,
    badge: "✨ A Plataforma Oficial de Serviços em Trancoso",
    title: "Conecte-se aos Melhores",
    highlight: "Profissionais Verificados",
    subtitle: "Faxina, eletricista, jardinagem, cozinheiro e muito mais — tudo num só lugar, com avaliações reais e confiança garantida.",
    cta: "Começar Agora",
    ctaLink: "/ServicosCategoria",
    bgColor: "linear-gradient(135deg, #0A81D1 0%, #0061FF 50%, #0D8A6F 100%)",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    Icon: Shield,
    accent: "from-blue-400 to-cyan-300",
  },
  {
    id: 2,
    badge: "🔥 OFERTA ESPECIAL — Primeira Vaga do Ano!",
    title: "R$ 29,90",
    highlight: "Mês Inaugural + 0% Comissão",
    subtitle: "Seja um dos primeiros 100 prestadores em Trancoso. Pague uma vez só e fique com 100% de tudo que você ganhar. Sem taxas escondidas.",
    cta: "Garantir Vaga Agora",
    ctaLink: "/Planos",
    bgColor: "linear-gradient(135deg, #F95738 0%, #FF6B35 50%, #FFB627 100%)",
    image: "https://images.unsplash.com/photo-1516321318423-f06f70d504f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    Icon: Zap,
    spots: true,
    accent: "from-orange-300 to-yellow-300",
  },
  {
    id: 3,
    badge: "💰 Plano Estável & Previsível",
    title: "R$ 49,90/mês",
    highlight: "Mensal Fixo. 100% Seu.",
    subtitle: "+ categorias de serviços profissionais. Se existe serviço em Trancoso, está aqui. Todos verificados, todos avaliados.",
    cta: "Explorar Categorias",
    ctaLink: "/ServicosCategoria",
    bgColor: "linear-gradient(135deg, #0D8A6F 0%, #1DB584 50%, #2D3047 100%)",
    image: "https://images.unsplash.com/photo-1460925895917-adf4e565016c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    Icon: TrendingUp,
    accent: "from-emerald-300 to-green-300",
  },
  {
    id: 4,
    badge: "🎯 Todos os Serviços em Um Lugar",
    title: "Faxina, Eletricista,",
    highlight: "Jardinagem, Cozinheiro...",
    subtitle: "8 categorias e crescendo. Prestadores verificados. Clientes satisfeitos. Avaliações reais. Tudo que você precisa para gerenciar sua carreira profissional.",
    cta: "Explorar Categorias",
    ctaLink: "/ServicosCategoria",
    bgColor: "linear-gradient(135deg, #1A2B3C 0%, #0A81D1 50%, #0061FF 100%)",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    Icon: Users,
    accent: "from-blue-300 to-indigo-300",
  }
];

export default function PromotionalBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextSlide = () => setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[240px] md:h-[460px] rounded-2xl overflow-hidden shadow-2xl my-4 md:my-8">
      {banners.map((banner, index) => {
        const Icon = banner.Icon;
        return (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
            style={{ background: banner.bgColor }}
          >
            {/* Background image */}
             <div className="absolute right-0 top-0 h-full w-full md:w-3/5">
               <LazyImage
                 src={banner.image}
                 alt={banner.title}
                 className="w-full h-full object-cover opacity-40"
               />
             </div>

             {/* Animated gradient overlay */}
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-transparent" />

             {/* Dynamic accent gradient */}
             <div className={`absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-r ${banner.accent}`} />

            {/* Content */}
            <div className="relative h-full flex items-center z-20 px-5 md:px-12">
              <div className="text-white max-w-xs md:max-w-lg space-y-2 md:space-y-3">

                {/* Badge — Agressivo e Destacado */}
                {banner.badge && (
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/40 rounded-full px-4 py-2 md:px-5 md:py-2.5 mb-1 md:mb-2 transform transition-all hover:bg-white/25 hover:border-white/60">
                    <span className="text-xs md:text-sm font-bold text-white drop-shadow-lg tracking-wide">{banner.badge}</span>
                  </div>
                )}

                {/* Título Principal — Bold e Impactante */}
                <div>
                  <h2 className="text-2xl md:text-5xl font-black leading-[1.15] drop-shadow-lg tracking-tight">
                    {banner.title}
                  </h2>
                  <div className={`text-2xl md:text-5xl font-black leading-[1.15] drop-shadow-lg bg-gradient-to-r ${banner.accent} bg-clip-text text-transparent tracking-tight`}>
                    {banner.highlight}
                  </div>
                </div>

                {/* Subtítulo — Descritivo */}
                <p className="text-sm md:text-lg opacity-95 mt-2 md:mt-4 leading-relaxed drop-shadow-md font-medium">
                  {banner.subtitle}
                </p>

                {/* Contador de vagas — Urgência Visual */}
                {banner.spots && (
                  <div className="flex items-center gap-3 mt-3 md:mt-4 pt-2">
                    <div className="flex gap-1.5">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                            i < 5 ? "bg-red-400 animate-pulse" : "bg-white/30"
                          )} 
                        />
                      ))}
                    </div>
                    <span className="text-xs md:text-sm font-bold text-orange-200 animate-pulse">⚡ 47 vagas restantes!</span>
                  </div>
                )}

                {/* CTA Button — Agressivo */}
                <div className="pt-2 md:pt-4">
                  <Link to={banner.ctaLink}>
                    <Button
                      size="lg"
                      className="bg-white text-slate-900 hover:bg-orange-100 font-black shadow-2xl text-sm md:text-base md:px-8 md:h-14 transition-all hover:scale-110 hover:shadow-orange-500/50 active:scale-95 relative group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6" />}
                        {banner.cta}
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 left-3 -translate-y-1/2 z-20 text-white bg-black/25 hover:bg-black/50 rounded-full w-8 h-8 md:w-10 md:h-10"
        onClick={prevSlide}
        aria-label="Banner anterior"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-3 -translate-y-1/2 z-20 text-white bg-black/25 hover:bg-black/50 rounded-full w-8 h-8 md:w-10 md:h-10"
        onClick={nextSlide}
        aria-label="Próximo banner"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {/* Navigation Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para o banner ${index + 1}`}
            className={cn(
              "rounded-full transition-all duration-300",
              currentIndex === index
                ? "bg-white w-5 h-2 md:w-6 md:h-2.5"
                : "bg-white/50 w-2 h-2 md:w-2.5 md:h-2.5 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}