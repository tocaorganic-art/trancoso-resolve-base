import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LazyImage from "@/components/ui/LazyImage";
import { ExternalLink, Megaphone } from "lucide-react";

const isSafeUrl = (url) => /^https?:\/\//i.test(url);
const viewedAnuncioIds = new Set();

export default function AnuncioCard({ anuncio }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!anuncio || trackedRef.current || viewedAnuncioIds.has(anuncio.id)) return;
    trackedRef.current = true;
    viewedAnuncioIds.add(anuncio.id);
    base44.entities.Anuncio.update(anuncio.id, { impressoes: (anuncio.impressoes || 0) + 1 });
  }, [anuncio]);

  if (!anuncio) return null;

  const handleCtaClick = () => {
    base44.entities.Anuncio.update(anuncio.id, { cliques: (anuncio.cliques || 0) + 1 });
    if (anuncio.cta_url && isSafeUrl(anuncio.cta_url)) {
      window.open(anuncio.cta_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-warm-sm overflow-hidden transition hover:shadow-warm-md">
      {anuncio.imagem_url && (
        <LazyImage src={anuncio.imagem_url} alt={anuncio.titulo} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <Badge variant="secondary" className="gap-1 mb-2 bg-olive-500/15 text-olive-700 border-olive-500/30">
          <Megaphone className="w-3 h-3" />
          Parceiro Local
        </Badge>
        <h3 className="text-base font-bold text-foreground">{anuncio.titulo}</h3>
        {anuncio.descricao && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{anuncio.descricao}</p>
        )}
        {anuncio.cta_label && (
          <Button
            onClick={handleCtaClick}
            className="w-full mt-4 bg-brand-primary hover:bg-orange-700 rounded-pill"
          >
            {anuncio.cta_label}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
