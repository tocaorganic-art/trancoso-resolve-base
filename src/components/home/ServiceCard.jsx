import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LazyImage from "@/components/ui/LazyImage";

const categoryIconMap = {
    'Limpeza': () => <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    'default': () => <svg className="w-10 h-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
};

const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const validDomains = ['unsplash.com', 'images.unsplash.com', 'storage.googleapis.com', 'base44.com', 'ui-avatars.com', 'manuscdn.com'];
  try {
    const urlObj = new URL(url);
    return validDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};

export default function ServiceCard({ service, provider, categoryImageMap, categoryDescriptionMap }) {
    const serviceImage = service.images?.[0];
    const hasValidImage = isValidImageUrl(serviceImage);
    const fallbackImage = categoryImageMap[service.category] || categoryImageMap.default;
    const imageSrc = hasValidImage ? serviceImage : fallbackImage;
    const Icon = categoryIconMap[service.category] || categoryIconMap.default;
    const description = service.description || categoryDescriptionMap[service.category] || 'Serviço profissional de qualidade em Trancoso.';

    const formatPrice = (price) => {
        return price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00';
    };

    const isNew = !provider?.rating || provider?.rating === 0;

    return (
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col rounded-2xl">
            <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                {imageSrc ? (
                    <LazyImage
                        src={imageSrc}
                        alt={`${service.title} — serviço de ${service.category} em Trancoso`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full" aria-hidden="true">
                        <Icon />
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-600 text-white text-xs font-semibold px-2 py-0.5 shadow-md">
                        {service.category}
                    </Badge>
                </div>
                {isNew && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 shadow-md">
                            ⭐ Novo
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug mb-1 line-clamp-2">
                    {service.title}
                </h3>

                {provider && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">{provider.full_name}</p>
                )}

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 flex-grow leading-relaxed">
                    {description}
                </p>

                <div className="flex items-end justify-between mt-auto mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {provider?.rating ? provider.rating.toFixed(1) : 'Novo'}
                        </span>
                        {provider?.total_reviews > 0 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-0.5">({provider.total_reviews})</span>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-extrabold text-amber-700 dark:text-amber-400 leading-tight">
                            R$ {formatPrice(service.price)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">por {service.price_unit || 'serviço'}</p>
                    </div>
                </div>

                <Link to={createPageUrl("ServicoDetalhes", `?id=${service.id}`)} data-testid={`service-card-link-${service.id}`} aria-label={`Ver detalhes do serviço ${service.title}`}>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                        Solicitar
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}