import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Home, Zap, Wrench, Leaf, UtensilsCrossed, Hammer, Paintbrush, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";

const QUICK_CATEGORIES = [
  { key: "Limpeza", icon: Home, cat: "Limpeza" },
  { key: "Eletricista", icon: Zap, cat: "Eletricista" },
  { key: "Encanador", icon: Wrench, cat: "Encanador" },
  { key: "Jardineiro", icon: Leaf, cat: "Jardinagem" },
  { key: "Cozinheiro", icon: UtensilsCrossed, cat: "Cozinheiro" },
  { key: "Garcom", icon: UtensilsCrossed, cat: "Garçom" },
  { key: "Pedreiro", icon: Hammer, cat: "Pedreiro" },
  { key: "Pintor", icon: Paintbrush, cat: "Pintor" },
];

const DESTINOS = [
  { label: "Trancoso", path: "/destinos/trancoso" },
  { label: "Arraial d'Ajuda", path: "/destinos/arraial-dajuda" },
  { label: "Porto Seguro", path: "/destinos/porto-seguro" },
  { label: "Caraíva", path: "/destinos/caraiva" },
];

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useApp();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(createPageUrl("ServicosCategoria", `?q=${encodeURIComponent(query.trim())}`));
    }
  };

  const handleCategory = (cat) => {
    navigate(createPageUrl("ServicosCategoria", `?cat=${encodeURIComponent(cat)}`));
  };

  return (
    <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-terracotta py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-semibold px-4 py-1.5 rounded-pill mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t('hero.badge')}
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg tracking-tight">
          {t('hero.headline')}
        </h1>
        <p className="text-base md:text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* Destinos chips */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {DESTINOS.map((d) => (
            <Link
              key={d.path}
              to={d.path}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold px-3 py-2 rounded-pill transition-all"
            >
              <MapPin className="w-3 h-3" />
              {d.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('hero.searchPlaceholder')}
              className="pl-10 h-12 text-base bg-background text-foreground border-0 rounded-brand-lg shadow-warm-lg"
            />
          </div>
          <Button type="submit" className="h-12 px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-brand-lg text-sm whitespace-nowrap shadow-warm-md transition-colors duration-200">
            {t('hero.searchButton')}
          </Button>
        </form>

        {/* Quick categories */}
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_CATEGORIES.map(({ key, icon: Icon, cat }) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold px-3 py-2 rounded-pill transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {t(`hero.categories.${key}`)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
