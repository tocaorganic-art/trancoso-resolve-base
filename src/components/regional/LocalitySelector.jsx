import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";

const FALLBACK = [
  { name: "Trancoso", slug: "trancoso", operation_status: "pending_validation", description: "" },
  { name: "Arraial d'Ajuda", slug: "arraial-dajuda", operation_status: "pending_validation", description: "" },
  { name: "Porto Seguro", slug: "porto-seguro", operation_status: "pending_validation", description: "" },
  { name: "Caraíva", slug: "caraiva", operation_status: "pending_validation", description: "" },
];

const STATUS_LABELS = {
  confirmed: "Operação ativa",
  partially_confirmed: "Parcialmente disponível",
  pending_validation: "Em validação",
  inactive: "Em validação",
};

export default function LocalitySelector() {
  const [selected, setSelected] = useState(null);

  const { data: localities = [], isLoading } = useQuery({
    queryKey: ["localities"],
    queryFn: () => base44.entities.Locality.list("display_order", 50),
  });

  const list = localities.length > 0 ? localities : FALLBACK;
  const selectedLoc = list.find((l) => l.slug === selected);

  return (
    <section className="py-12 md:py-16 px-4 bg-[#F5F5F5]">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#333333] font-heading">
          Escolha um destino
        </h2>
        <p className="text-center text-[#666] mb-8">Quatro localidades com o mesmo peso.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {list.map((loc) => {
            const isPending = loc.operation_status === "pending_validation" || loc.operation_status === "inactive";
            const isSelected = selected === loc.slug;
            return (
              <button
                key={loc.slug}
                onClick={() => setSelected(isSelected ? null : loc.slug)}
                aria-pressed={isSelected}
                className={`relative rounded-xl p-4 md:p-6 text-center min-h-[120px] flex flex-col items-center justify-center transition-all border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A21] ${
                  isSelected
                    ? "border-[#F26A21] bg-white shadow-lg"
                    : "border-transparent bg-white hover:border-[#F26A21]/30"
                }`}
              >
                <MapPin className="w-6 h-6 text-[#F26A21] mb-2" />
                <span className="font-bold text-[#333333] text-sm md:text-base">{loc.name}</span>
                {isPending && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#888] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" /> {STATUS_LABELS[loc.operation_status] || "Em validação"}
                  </span>
                )}
                {loc.operation_status === "confirmed" && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> {STATUS_LABELS.confirmed}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selected && selectedLoc && (
          <div className="mt-8 bg-white rounded-xl p-6 border border-[#E3DED5]">
            <h3 className="text-xl font-bold text-[#333333] mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F26A21]" />
              {selectedLoc.name}
            </h3>
            {selectedLoc.operation_status === "confirmed" && selectedLoc.description ? (
              <p className="text-[#555] leading-relaxed">{selectedLoc.description}</p>
            ) : (
              <p className="text-[#888] italic">
                Conteúdo desta localidade será disponibilizado conforme validação.
              </p>
            )}
          </div>
        )}

        {isLoading && (
          <p className="text-center text-[#888] text-sm mt-6">Carregando localidades…</p>
        )}
      </div>
    </section>
  );
}