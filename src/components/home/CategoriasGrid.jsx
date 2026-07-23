import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import CategoryIcon from "@/lib/categoryIcons";

const CATEGORIAS = [
  { label: "Diarista", cat: "Limpeza" },
  { label: "Eletricista", cat: "Eletricista" },
  { label: "Encanador", cat: "Encanador" },
  { label: "Jardineiro", cat: "Jardinagem" },
  { label: "Piscineiro", cat: "Piscineiro" },
  { label: "Pedreiro", cat: "Pedreiro" },
  { label: "Cozinheiro", cat: "Cozinheiro" },
];

export default function CategoriasGrid() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-slate-900 mb-8">
          O que você precisa hoje?
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIAS.map((item) => (
            <Link key={item.cat} to={createPageUrl("ServicosCategoria", `?cat=${item.cat}`)}>
              <div className="bg-white rounded-2xl p-3 md:p-4 text-center shadow-sm hover:shadow-md border-2 border-slate-100 hover:border-orange-400 transition-all cursor-pointer group flex flex-col items-center justify-center aspect-square">
                <CategoryIcon category={item.label} className="w-7 h-7 md:w-8 md:h-8 mb-1.5" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-orange-600 transition-colors leading-tight">{item.label}</span>
              </div>
            </Link>
          ))}
          <Link to={createPageUrl("ServicosCategoria")}>
            <div className="bg-orange-500 rounded-2xl p-3 md:p-4 text-center shadow-sm hover:shadow-md border-2 border-orange-400 hover:border-orange-600 transition-all cursor-pointer group flex flex-col items-center justify-center aspect-square">
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
              <span className="text-xs font-bold text-white leading-tight">Ver todos</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
