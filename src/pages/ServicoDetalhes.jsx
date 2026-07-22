import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LazyImage from "@/components/ui/LazyImage";
import { ArrowLeft, Star, Clock, AlertCircle, Loader2, CalendarIcon } from "lucide-react";
import BookingForm from "@/components/booking/BookingForm";
import StartChatButton from "@/components/chat/StartChatButton";
import { useEffect, useState } from "react";

export default function ServicoDetalhesPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');
  const [showBooking, setShowBooking] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['serviceListing', serviceId],
    queryFn: async () => {
      const services = await base44.entities.ServiceListing.filter({ id: serviceId });
      return services?.[0];
    },
    enabled: !!serviceId,
  });

  const { data: provider } = useQuery({
    queryKey: ['serviceProvider', service?.provider_id],
    queryFn: async () => {
      const providers = await base44.entities.ServiceProvider.filter({ id: service.provider_id });
      return providers?.[0];
    },
    enabled: !!service?.provider_id,
  });

  const { data: providerServices } = useQuery({
    queryKey: ['providerServices', service?.provider_id],
    queryFn: () => base44.entities.ServiceListing.filter({ provider_id: service.provider_id, active: true }),
    enabled: !!service?.provider_id,
    initialData: [],
  });

  // SEO Setup
  useEffect(() => {
    if (!service) return;

    const pageTitle = `${service.title} em Trancoso | ${provider?.full_name || 'Serviço'} — Trancoso Resolve`;
    document.title = pageTitle;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = `${service.title} com ${provider?.full_name || 'profissional verificado'}. R$ ${service.price.toFixed(2)} por ${service.price_unit}. Avaliações reais, agendamento seguro em Trancoso.`;

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/ServicoDetalhes?id=${serviceId}`;

    // OG tags
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = `${window.location.origin}/ServicoDetalhes?id=${serviceId}`;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = pageTitle;

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = `${service.title} com ${provider?.full_name || 'profissional verificado'} em Trancoso.`;

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) { ogImage = document.createElement('meta'); ogImage.setAttribute('property', 'og:image'); document.head.appendChild(ogImage); }
    ogImage.content = service.images?.[0] || 'https://trancosoresolve.com.br/brand/logo-mark-512.png';

    // Schema markup
    const schemaId = `schema-servico-${serviceId}`;
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "name": service.title,
          "description": service.description,
          "serviceType": service.category,
          "provider": {
            "@type": "Person",
            "name": provider?.full_name || "Profissional",
            "image": provider?.photo_url,
            "rating": {
              "@type": "AggregateRating",
              "ratingValue": provider?.rating || 0,
              "reviewCount": provider?.total_reviews || 0,
              "bestRating": 5
            }
          },
          "areaServed": {
            "@type": "Place",
            "name": "Trancoso, BA"
          },
          "priceRange": "$",
          "offers": {
            "@type": "Offer",
            "price": service.price,
            "priceCurrency": "BRL",
            "availability": "InStock"
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": `${window.location.origin}` },
            { "@type": "ListItem", "position": 2, "name": "Serviços", "item": `${window.location.origin}/ServicosCategoria` },
            { "@type": "ListItem", "position": 3, "name": service.category, "item": `${window.location.origin}/ServicosCategoria?cat=${encodeURIComponent(service.category)}` },
            { "@type": "ListItem", "position": 4, "name": service.title, "item": `${window.location.origin}/ServicoDetalhes?id=${serviceId}` }
          ]
        }
      ]
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, [service, provider, serviceId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando detalhes do serviço...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Serviço não encontrado</h2>
            <p className="text-muted-foreground mb-6">O serviço que você procura pode ter sido removido ou o link está incorreto.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={createPageUrl("ServicosCategoria")}>
                <Button className="w-full bg-brand-primary hover:bg-orange-600">
                  Explorar todos os serviços →
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">Voltar ao início</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageSrc = service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-48 md:h-72 bg-gradient-to-r from-orange-500 to-orange-700 overflow-hidden">
        <img
          src={imageSrc}
          alt={`Imagem de capa do serviço: ${service.title}`}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-32 pb-12">
        <Link to={createPageUrl("ServicosCategoria", `?cat=${service.category}`)}>
          <Button variant="ghost" className="text-white hover:bg-white/20 mb-4 bg-black/30 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card className="border-none shadow-2xl mb-8">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 break-words">{service.title}</h1>
                <Badge className="bg-orange-100 text-orange-800">{service.category}</Badge>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  R$ {service.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">por {service.price_unit || 'serviço'}</p>
              </div>
            </div>

            {service.duration_estimate && (
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Clock className="w-5 h-5 shrink-0" />
                <span>Duração estimada: {service.duration_estimate}</span>
              </div>
            )}

            <div className="prose prose-slate max-w-none mb-6">
              <h3 className="text-xl font-semibold mb-3">O que está incluso:</h3>
              <p className="text-foreground whitespace-pre-line">{service.description}</p>

              {service.not_included && (
                <>
                  <h3 className="text-xl font-semibold mb-3 mt-6">O que NÃO está incluso:</h3>
                  <p className="text-foreground whitespace-pre-line">{service.not_included}</p>
                </>
              )}
            </div>

            {service.images && service.images.length > 1 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Galeria</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {service.images.map((img, idx) => (
                    <LazyImage key={idx} src={img} alt={`${service.title} - imagem ${idx + 1}`} className="w-full h-32 sm:h-40 object-cover rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {provider && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-xl font-semibold mb-4">Prestador</h3>
                <div className="flex items-center gap-3 sm:gap-4 mb-4 flex-wrap sm:flex-nowrap">
                  <LazyImage
                    src={provider.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.full_name)}&size=200`}
                    alt={`Foto de ${provider.full_name}`}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base sm:text-lg truncate">{provider.full_name}</p>
                    <p className="text-sm text-muted-foreground">{provider.occupation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm font-medium">{provider?.rating && provider.rating > 0 ? provider.rating.toFixed(1) : 'Novo'}</span>
                      {provider?.total_reviews && provider.total_reviews > 0 && <span className="text-xs text-muted-foreground">({provider.total_reviews} avaliações)</span>}
                    </div>
                  </div>
                  <Link to={createPageUrl("PrestadorPerfil", `?id=${provider.id}`)} className="shrink-0">
                    <Button variant="outline" size="sm">Ver Perfil</Button>
                  </Link>
                </div>
              </div>
            )}

            {!showBooking && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {user && provider ? (
                  <>
                    <Button
                      size="lg"
                      className="flex-1 bg-brand-primary hover:bg-orange-600"
                      onClick={() => setShowBooking(true)}
                    >
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      Agendar Agora
                    </Button>
                    <StartChatButton provider={provider} size="lg" className="flex-1" />
                  </>
                ) : (
                  <Button size="lg" className="w-full" onClick={() => base44.auth.redirectToLogin()}>
                    Faça login para agendar
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {showBooking && provider && (
          <BookingForm
            provider={provider}
            services={providerServices}
            user={user}
            onCancel={() => setShowBooking(false)}
          />
        )}
      </div>
    </div>
  );
}