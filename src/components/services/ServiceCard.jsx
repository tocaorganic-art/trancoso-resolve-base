import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, DollarSign } from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";

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

const FALLBACK_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80';

export default function ServiceCard({ service }) {
  const categoryColors = {
    "Eventos": "bg-orange-100 text-orange-800",
    "Restaurantes": "bg-orange-100 text-orange-800",
    "Passeios": "bg-[#6B7C3A]/10 text-[#6B7C3A]",
    "Praias": "bg-orange-50 text-orange-700",
    "Fornecedores": "bg-green-100 text-green-800",
    "Transporte": "bg-amber-100 text-amber-800",
    "Bem-estar": "bg-[#C1440E]/10 text-[#C1440E]",
    "Compras": "bg-[#6B7C3A]/10 text-[#6B7C3A]",
  };

  const rawImage = service.images?.[0];
  const imageSrc = isValidImageUrl(rawImage) ? rawImage : FALLBACK_SERVICE_IMAGE;

  return (
    <Card className="glass-card border-none shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
      <div className="h-48 overflow-hidden rounded-t-xl">
        <LazyImage
          src={imageSrc}
          alt={service.name}
          className="h-48"
        />
      </div>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <Badge className={categoryColors[service.category]}>
            {service.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {service.summary && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {service.summary}
          </p>
        )}

        {service.description && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
            {service.description}
          </p>
        )}

        {service.location && service.location.address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{service.location.address}</span>
          </div>
        )}

        {service.contact && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4" />
            <span>{service.contact}</span>
          </div>
        )}

        {service.price_range && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {service.price_range}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}