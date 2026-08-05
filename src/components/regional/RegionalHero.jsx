import { Link } from "react-router-dom";
import { MapPin, Sparkles } from "lucide-react";

export default function RegionalHero() {
  return (
    <section className="bg-[#20382C] text-white py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
          <MapPin className="w-4 h-4 text-[#F26A21]" />
          <span className="text-sm font-semibold tracking-wide">Costa do Descobrimento</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-5 font-heading leading-tight">
          Quatro destinos. Uma nova forma de descobrir.
        </h1>
        <p className="text-base md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva conectados por uma experiência regional de descoberta.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-[#F26A21] hover:bg-[#d95a1a] text-white font-bold px-6 py-3 rounded-lg min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A21] focus-visible:ring-offset-2 focus-visible:ring-offset-[#20382C]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Conheça a plataforma
          </Link>
          <Link
            to="/participar"
            className="inline-flex items-center justify-center bg-transparent hover:bg-[#F26A21]/10 text-[#F26A21] font-bold px-6 py-3 rounded-lg min-h-[44px] transition-colors border-2 border-[#F26A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A21] focus-visible:ring-offset-2 focus-visible:ring-offset-[#20382C]"
          >
            Escolha como participar
          </Link>
        </div>
      </div>
    </section>
  );
}