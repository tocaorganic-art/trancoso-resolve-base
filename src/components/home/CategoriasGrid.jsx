import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Sparkles, Zap, Wrench, Leaf, Waves, Hammer, ChefHat } from "lucide-react";

const ICON_COLOR = "#E8571A";

const CATEGORIAS = [
  { Icon: Sparkles, label: "Diarista", cat: "Limpeza" },
  { Icon: Zap, label: "Eletricista", cat: "Eletricista" },
  { Icon: Wrench, label: "Encanador", cat: "Encanador" },
  { Icon: Leaf, label: "Jardineiro", cat: "Jardinagem" },
  { Icon: Waves, label: "Piscineiro", cat: "Piscineiro" },
  { Icon: Hammer, label: "Pedreiro", cat: "Pedreiro" },
  { Icon: ChefHat, label: "Cozinheiro", cat: "Cozinheiro" },
];

export default function CategoriasGrid() {
  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-foreground mb-8">
          O que você precisa hoje?
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIAS.map((item) => (
            <Link key={item.cat} to={createPageUrl("ServicosCategoria", `?cat=${item.cat}`)}>
              <div className="bg-card rounded-2xl p-3 md:p-4 text-center shadow-sm hover:shadow-md border-2 border-border hover:border-cyan-400 transition-all cursor-pointer group flex flex-col items-center justify-center aspect-square">
                <item.Icon className="w-7 h-7 md:w-8 md:h-8 mb-1" style={{ color: ICON_COLOR }} aria-hidden="true" />
                <span className="text-xs font-bold text-foreground/80 group-hover:text-cyan-500 transition-colors leading-tight">{item.label}</span>
              </div>
            </Link>
          ))}
          <Link to={createPageUrl("ServicosCategoria")}>
            <div className="bg-cyan-500 rounded-2xl p-3 md:p-4 text-center shadow-sm hover:shadow-md border-2 border-cyan-400 hover:border-cyan-600 transition-all cursor-pointer group flex flex-col items-center justify-center aspect-square">
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
              <span className="text-xs font-bold text-white leading-tight">Ver todos</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}