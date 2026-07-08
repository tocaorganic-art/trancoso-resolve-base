import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react"; // Import an icon for fallback

export default function LazyImage({ src, srcSet, sizes, alt, className, placeholderClassName, priority = false }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Reseta o estado se a imagem (src) for alterada
    setImgSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    // Se a imagem tem prioridade, carrega imediatamente
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "300px" } // Carrega a imagem 300px antes de entrar na tela (aumentado para melhor UX)
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority]);

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Trata o erro como "carregado" para parar de mostrar o placeholder de loading
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-slate-200", className)}>
      {/* Placeholder de carregamento */}
      {!isLoaded && !hasError && (
        <div className={cn(
          "absolute inset-0 bg-slate-200 transition-opacity duration-300 dark:bg-slate-700 flex items-center justify-center",
          isLoaded ? "opacity-0" : "opacity-100",
          placeholderClassName
        )} />
      )}
      
      {/* Fallback em caso de erro no carregamento da imagem */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
            <ImageOff className="w-1/4 h-1/4" />
        </div>
      )}

      {/* Imagem real, carregada de forma preguiçosa */}
      {isInView && !hasError && (
        <img
          src={imgSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={priority ? "high" : "auto"}
        />
      )}
    </div>
  );
}