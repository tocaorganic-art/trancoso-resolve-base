import { Home, Hammer, Sparkles, Car, Compass, UtensilsCrossed, PartyPopper, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BannerCategorias() {
  const categorias = [
    { icon: <Home size={24} />, name: "Limpeza", color: "from-[#2D7D8A] to-[#6B7C3A]", bgColor: "bg-teal-50 dark:bg-teal-900/30" },
    { icon: <Hammer size={24} />, name: "Construção", color: "from-orange-400 to-amber-300", bgColor: "bg-orange-50 dark:bg-orange-900/30" },
    { icon: <Sparkles size={24} />, name: "Beleza", color: "from-[#E8571A] to-[#C1440E]", bgColor: "bg-orange-50 dark:bg-orange-900/30" },
    { icon: <Car size={24} />, name: "Transporte", color: "from-[#6B7C3A] to-[#9aad5d]", bgColor: "bg-[#6B7C3A]/10 dark:bg-[#6B7C3A]/20" },
    { icon: <Compass size={24} />, name: "Turismo", color: "from-[#3E8E5A] to-[#6B7C3A]", bgColor: "bg-green-50 dark:bg-green-900/30" },
    { icon: <UtensilsCrossed size={24} />, name: "Gastronomia", color: "from-red-400 to-orange-300", bgColor: "bg-red-50 dark:bg-red-900/30" },
    { icon: <PartyPopper size={24} />, name: "Festas", color: "from-amber-400 to-amber-300", bgColor: "bg-amber-50 dark:bg-amber-900/30" },
    { icon: <Wrench size={24} />, name: "Automóveis", color: "from-slate-400 to-zinc-300", bgColor: "bg-slate-50 dark:bg-slate-800" },
  ];

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-full overflow-hidden">
            <div className="mb-6 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Categorias Principais</h3>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">Explore todos os serviços disponíveis em Trancoso</p>
            </div>
            <div className="grid grid-cols-4 md:flex md:justify-center gap-3 md:gap-4 py-2">
                {categorias.map((cat, i) => (
                    <Link 
                      key={i} 
                      to={createPageUrl("ServicosCategoria", `?cat=${cat.name}`)}
                      className="group flex flex-col items-center gap-2 text-center min-w-0 transition-all duration-300"
                      aria-label={`Ver serviços de ${cat.name} em Trancoso`}
                    >
                         <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl border-2 border-slate-300/40 dark:border-slate-600/40 flex items-center justify-center transition-all duration-300 ease-out group-hover:-translate-y-2 shrink-0 relative overflow-hidden`}
                       style={{
                         background: 'rgba(255, 255, 255, 0.15)',
                         backdropFilter: 'blur(8px)',
                         boxShadow: '0 8px 20px rgba(0, 102, 255, 0.18), 0 2px 8px rgba(0, 0, 0, 0.1)',
                       }}
                     >
                       {/* Hover state: intensify background and shadow */}
                       <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />

                       {/* Icon - always visible */}
                       <div className="text-slate-700 dark:text-slate-300 transition-all duration-300 group-hover:text-slate-900 dark:group-hover:text-white relative z-10 group-hover:scale-125" role="img" aria-hidden="true">
                         {cat.icon}
                       </div>
                     </div>
                       <span className="text-[11px] md:text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight truncate w-full transition-colors">{cat.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    </section>
  );
  }