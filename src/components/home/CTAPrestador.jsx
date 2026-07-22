import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Flame } from "lucide-react";

const BENEFICIOS = [
  "Perfil verificado com checagem de antecedentes",
  "Visibilidade na busca de clientes locais",
  "Agenda de atendimentos integrada",
  "Chat direto com clientes",
  "Suporte da plataforma Trancoso Resolve",
  "2 meses grátis no plano de lançamento",
];

export default function CTAPrestador({ vagasRestantes = 0 }) {
  return (
    <section className="bg-gradient-to-br from-orange-600 to-terracotta rounded-3xl py-10 md:py-14 px-6 md:px-12 my-12 mx-0 border border-orange-700/30 shadow-brand">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
        {/* Bloco esquerdo */}
        <div>
          {vagasRestantes > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Badge className={`text-white font-bold px-3 py-1 flex items-center gap-1 rounded-pill ${vagasRestantes <= 10 ? 'bg-red-600 animate-pulse' : 'bg-white/20 border border-white/30'}`}>
                <Flame className="w-3 h-3" /> {vagasRestantes} vagas disponíveis
              </Badge>
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
            Faça parte da nossa rede em Trancoso, Porto Seguro e Caraíva.
          </h2>
          <p className="text-white/80 text-sm md:text-base mb-6 leading-relaxed">
            Cadastre-se como prestador de serviços de qualidade na Costa do Descobrimento. Perfil verificado, agenda integrada e clientes reais. Comece com 2 meses grátis.
          </p>
          <Link to="/SejaPrestador">
            <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-3 rounded-pill shadow-warm-md transition-all hover:scale-105">
              Quero ser prestador <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Bloco direito — benefícios */}
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">O que está incluso</p>
          <ul className="space-y-3">
            {BENEFICIOS.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
