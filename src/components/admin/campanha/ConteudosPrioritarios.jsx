import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, CheckCircle2, Loader2 } from "lucide-react";

export default function ConteudosPrioritarios() {
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["brandAssets"],
    queryFn: () => base44.entities.BrandAsset.list("-created_date", 50),
  });

  const extractEditLink = (notes) => {
    if (!notes) return null;
    const match = notes.match(/Link de edição:\s*(https?:\/\/[^\s]+)/i);
    return match ? match[1] : null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#F26A21] animate-spin" />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="bg-white border-[#E3DED5]">
        <CardContent className="p-8 text-center text-[#999]">
          Sem dados registrados. Adicione BrandAssets para ver os conteúdos prioritários.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {assets.map((a) => {
        const editLink = extractEditLink(a.usage_notes) || a.file;
        return (
          <Card key={a.id} className="bg-white border-[#E3DED5] hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-[#F26A21] bg-[#F26A21]/10 px-2 py-0.5 rounded">
                  {a.asset_type || "Conteúdo fixado"}
                </span>
                {a.approved ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
                  </span>
                ) : (
                  <span className="text-xs text-[#999]">Pendente</span>
                )}
              </div>
              <h3 className="font-bold text-[#333333] leading-snug mb-3">{a.variation || "—"}</h3>
              {editLink && (
                <a
                  href={editLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F26A21] hover:underline min-h-[44px]"
                >
                  Abrir no Canva <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}