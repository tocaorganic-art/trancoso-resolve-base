import { useEffect, useRef } from "react";
import { Anuncio } from "@/api/entities";

const LazyImage = ({ src, alt, className }) => {
  const imgRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && imgRef.current) {
        imgRef.current.src = src;
        observer.disconnect();
      }
    });
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);
  return <img ref={imgRef} alt={alt} className={className} />;
};

const viewedAnuncioIds = new Set();

export default function AnuncioCard({ anuncio }) {
  useEffect(() => {
    if (!viewedAnuncioIds.has(anuncio.id)) {
      viewedAnuncioIds.add(anuncio.id);
      Anuncio.update(anuncio.id, { impressoes: (anuncio.impressoes || 0) + 1 });
    }
  }, [anuncio.id]);

  const handleClick = () => {
    Anuncio.update(anuncio.id, { cliques: (anuncio.cliques || 0) + 1 });
    const url = anuncio.cta_url;
    if (url && /^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      {anuncio.imagem_url && (
        <LazyImage
          src={anuncio.imagem_url}
          alt={anuncio.titulo}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">
          {anuncio.categoria}
        </span>
        <h3 className="font-semibold text-gray-800 mt-1">{anuncio.titulo}</h3>
        {anuncio.descricao && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{anuncio.descricao}</p>
        )}
        {anuncio.cta_label && (
          <span className="inline-block mt-3 text-sm font-medium text-orange-600 hover:underline">
            {anuncio.cta_label} →
          </span>
        )}
      </div>
    </div>
  );
}
