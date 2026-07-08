import { useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import LazyImage from "@/components/ui/LazyImage";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const SERVICES = [
  {
    key: "Limpeza",
    title: "Faxineira",
    desc: "Limpeza residencial, pós-obra e manutenção. Profissionais da sua comunidade.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/inigQzgVMUPeKrkL.png",
    cat: "Limpeza",
  },
  {
    key: "Eletricista",
    title: "Eletricista",
    desc: "Instalação e reparo elétrico com segurança. Profissionais verificados.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/loNdoqfPbYrpiZUY.png",
    cat: "Eletricista",
  },
  {
    key: "Encanador",
    title: "Encanador",
    desc: "Vazamentos, entupimentos e hidráulica completa. Atendimento emergencial.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/SzIYzgzmeNbfcRvv.png",
    cat: "Encanador",
  },
  {
    key: "Jardineiro",
    title: "Jardineiro",
    desc: "Jardins tropicais, poda e paisagismo com plantas nativas da Bahia.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/MmnYpPgxNHhyniba.png",
    cat: "Jardinagem",
  },
  {
    key: "Cozinheiro",
    title: "Cozinheiro",
    desc: "Chef particular para jantares e eventos. Culminária baiana e frutos do mar.",
    image: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/XKIqXQfxYpLpcnsh.png",
    cat: "Cozinheiro",
  },
  {
    key: "Pintor",
    title: "Pintor",
    desc: "Pintura residencial e comercial com acabamento de alta qualidade.",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cat: "Pintor",
  },
];

export default function ServiceCarousel() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = 280 + 16;
    container.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  const handleScrollEnd = () => {
    const container = scrollRef.current;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (container.scrollLeft >= maxScroll - 10) {
      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: "smooth" });
      }, 800);
    }
  };

  return (
    <section className="mb-10 md:mb-20">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-2xl font-bold text-foreground leading-tight">
          Profissionais da sua comunidade. Verificados, avaliados, com histórico real.
        </h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScrollEnd}
        className="flex overflow-x-auto gap-4 pb-3 snap-x -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {SERVICES.map((service) => (
          <div key={service.key} className="flex-shrink-0 w-[280px] snap-start">
            <div className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group border border-border">
              <div className="relative h-44 w-full overflow-hidden bg-muted shrink-0">
                <LazyImage
                  src={service.image}
                  alt={`${service.title} — serviço na Costa do Descobrimento`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-bold">Verificado</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-base text-foreground mb-1">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-grow">
                  {service.desc}
                </p>
                <Link to={createPageUrl("ServicosCategoria", `?cat=${encodeURIComponent(service.cat)}`)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm">
                    Solicitar serviço
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}