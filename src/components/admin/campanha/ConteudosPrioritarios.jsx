import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const PRIORIDADES = [
  {
    titulo: "Quatro destinos. Uma nova forma de descobrir.",
    url: "https://www.canva.com/d/yW4s0ffP07c-Oah",
  },
  {
    titulo: "Conectando pessoas, serviços e negócios locais.",
    url: "https://www.canva.com/d/qyZMYze0rYVTCYH",
  },
  {
    titulo: "Você é cliente, prestador ou lojista?",
    url: "https://www.canva.com/d/CVOJgAjOMm6r-9z",
  },
  {
    titulo: "Costa do Descobrimento (capa Facebook)",
    url: "https://www.canva.com/d/iiatqqfxHrJ534h",
  },
];

export default function ConteudosPrioritarios() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {PRIORIDADES.map((p) => (
        <Card key={p.url} className="bg-white border-[#E3DED5] hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-[#F26A21] bg-[#F26A21]/10 px-2 py-0.5 rounded mb-2">
                  Conteúdo fixado
                </span>
                <h3 className="font-bold text-[#333333] leading-snug">{p.titulo}</h3>
              </div>
            </div>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F26A21] hover:underline min-h-[44px]"
            >
              Abrir no Canva <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}