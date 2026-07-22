import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LazyImage from "@/components/ui/LazyImage";
import Testimonials from "@/components/home/Testimonials";
import HeroSearch from "@/components/home/HeroSearch";
import SocialProofBar from "@/components/home/SocialProofBar";
import CTAPrestador from "@/components/home/CTAPrestador";
import {
  Sparkles, UtensilsCrossed, Hammer, Leaf,
  Baby, Zap, Star, Shirt, Car, Compass, PartyPopper, BookOpen, Home, Wrench, BrainCircuit, ArrowRight, MapPin, Paintbrush
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";
import FounderBanner from "@/components/banners/FounderBanner";

const LeadCaptureForm = lazy(() => import("@/components/servicos/LeadCaptureForm"));

const categoryImageMap = {
  limpeza: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ],
  diarista: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80',
  ],
  faxina: [
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80',
  ],
  eletricista: [
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca1e28?w=800&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  ],
  eletrica: [
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca1e28?w=800&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  ],
  encanador: [
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  ],
  hidraulica: [
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
  ],
  jardineiro: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca1e28?w=800&q=80',
  ],
  jardinagem: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    'https://images.unsplash.com/photo-1599598425947-5202edd56fde?w=800&q=80',
  ],
  cozinheiro: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  ],
  chef: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80',
  ],
  gastronomia: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  ],
  garcom: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561549?w=800&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
  ],
  piscineiro: [
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    'https://images.unsplash.com/photo-1572331165267-854da2b021dc?w=800&q=80',
  ],
  piscina: [
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
    'https://images.unsplash.com/photo-1572331165267-854da2b021dc?w=800&q=80',
  ],
  pintor: [
    'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca1e28?w=800&q=80',
  ],
  pintura: [
    'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
  ],
  marceneiro: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
    'https://images.unsplash.com/photo-1611170540292-bc1e6f6a8462?w=800&q=80',
  ],
  marcenaria: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80',
    'https://images.unsplash.com/photo-1611170540292-bc1e6f6a8462?w=800&q=80',
  ],
  pedreiro: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80',
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80',
  ],
  construcao: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=80',
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80',
  ],
  baba: [
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
    'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80',
  ],
  seguranca: [
    'https://images.unsplash.com/photo-1557597774-9d475d0c0e43?w=800&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca1e28?w=800&q=80',
    'https://images.unsplash.com/photo-1609188076864-c35269136b09?w=800&q=80',
  ],
  som: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  ],
  dj: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  ],
  iluminacao: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  ],
  musica: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  ],
  outro: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  ],
};

// Descrições melhoradas por categoria para serviços sem descrição cadastrada
const categoryDescriptionMap = {
  'Limpeza': 'Serviço completo de limpeza e higienização residencial com produtos ecológicos e técnicas avançadas para um ambiente impecável.',
  'Eletricista': 'Instalação e manutenção de sistemas elétricos residenciais e comerciais. Profissionais certificados com garantia de segurança.',
  'Jardinagem': 'Criação e manutenção de jardins tropicais com plantas nativas da Bahia. Poda especializada, adubação orgânica e design paisagístico.',
  'Cozinheiro': 'Chef particular para jantares e eventos com menu personalizado focado na culinária baiana e frutos do mar frescos.',
  'Encanador': 'Soluções completas para vazamentos, entupimentos e instalações hidráulicas. Atendimento emergencial 24h com equipe qualificada.',
  'Pedreiro': 'Construção, reforma e manutenção com materiais de qualidade. Acabamento perfeito e prazo garantido.',
  'Garçom': 'Serviço profissional para eventos e jantares. Equipe treinada e uniformizada para elevar o padrão do seu evento.',
  'Babá': 'Cuidados especializados para crianças de todas as idades. Profissionais com experiência e referências verificadas.',
  'Pintor': 'Pintura residencial e comercial com técnicas modernas. Acabamento de alta qualidade em ambientes internos e externos.',
};

const categoryIconMap = {
    'Limpeza': Home,
    'Garçom': UtensilsCrossed,
    'Pedreiro': Hammer,
    'Jardinagem': Leaf,
    'Babá': Baby,
    'Eletricista': Zap,
    'Encanador': Wrench,
    'Pintor': Hammer,
    'Cozinheiro': UtensilsCrossed,
    'Outro': Wrench,
    'Construção': Hammer,
    'Beleza': Shirt,
    'Transporte': Car,
    'Turismo': Compass,
    'Gastronomia': UtensilsCrossed,
    'Festas': PartyPopper,
    'Aulas': BookOpen,
    'Automóveis': Wrench,
    'default': Wrench
};

const ServiceSkeletonCard = () => (
  <Card className="border-none shadow-lg">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-1/3" />
      </div>
      <Skeleton className="h-10 w-full mt-2" />
    </CardContent>
  </Card>
);

// Função para validar se uma URL de imagem parece válida e relevante
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

function getServiceImage(service) {
  if (isValidImageUrl(service.images?.[0])) return service.images[0];

  const raw = (service.category || service.serviceType || service.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const categoryKey = Object.keys(categoryImageMap).find(key => raw.includes(key)) || 'default';
  const imgs = categoryImageMap[categoryKey];

  const id = service.id || service._id || '';
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return imgs[hash % imgs.length];
}

function getCategoryFallback(service) {
  const raw = (service.category || service.serviceType || service.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  const categoryKey = Object.keys(categoryImageMap).find(key => raw.includes(key)) || 'default';
  const imgs = categoryImageMap[categoryKey];
  const id = service.id || service._id || '';
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return imgs[hash % imgs.length];
}

const ServiceCard = ({ service, provider }) => {
    const imageSrc = getServiceImage(service);
    const Icon = categoryIconMap[service.category] || categoryIconMap.default;
    const description = service.description || categoryDescriptionMap[service.category] || 'Serviço profissional de qualidade em Trancoso.';

    // Formata preço no padrão brasileiro com vírgula
    const formatPrice = (price) => {
        return price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00';
    };

    const isNew = !provider?.rating || provider?.rating === 0;

    return (
        <Card className="border border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col rounded-2xl">
            {/* Imagem */}
            <div className="relative h-48 w-full overflow-hidden bg-muted shrink-0">
                {imageSrc ? (
                    <LazyImage
                        src={imageSrc}
                        fallbackSrc={getCategoryFallback(service)}
                        alt={`${service.title} — serviço de ${service.category} em Trancoso`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full" aria-hidden="true">
                        <Icon className="w-10 h-10 text-muted-foreground" />
                    </div>
                )}
                {/* Badge de categoria sobre a imagem */}
                <div className="absolute top-3 right-3">
                    <Badge className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 shadow-md rounded-pill">
                        {service.category}
                    </Badge>
                </div>
                {/* Selo "Novo" se não tiver avaliações */}
                {isNew && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-sand text-orange-700 text-xs font-bold px-2 py-0.5 shadow-md rounded-pill">
                            Novo
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-5 flex flex-col flex-grow">
                {/* Título */}
                <h3 className="font-bold text-base text-foreground leading-snug mb-1 line-clamp-2">
                    {service.title}
                </h3>

                {/* Nome do prestador */}
                {provider && (
                    <p className="text-xs text-muted-foreground mb-2 font-medium">{provider.full_name}</p>
                )}

                {/* Descrição */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow leading-relaxed">
                    {description}
                </p>

                {/* Avaliação + Preço */}
                <div className="flex items-end justify-between mt-auto mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-sm font-bold text-foreground">
                            {provider?.rating ? provider.rating.toFixed(1) : 'Novo'}
                        </span>
                        {provider?.total_reviews > 0 && (
                            <span className="text-xs text-muted-foreground ml-0.5">({provider.total_reviews})</span>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-extrabold text-brand-primary leading-tight">
                            R$ {formatPrice(service.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">por {service.price_unit || 'serviço'}</p>
                    </div>
                </div>

                {/* Botão Ver Detalhes */}
                <Link to={createPageUrl("ServicoDetalhes", `?id=${service.id}`)} data-testid={`service-card-link-${service.id}`} aria-label={`Ver detalhes do serviço ${service.title}`}>
                    <Button className="w-full bg-brand-primary hover:bg-orange-600 text-white font-semibold rounded-pill">
                        Solicitar
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default function HomePage() {
  const [_searchQuery, _setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Trancoso Resolve — Profissionais Verificados em Trancoso";

    // Meta description otimizada
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = "Encontre diaristas, eletricistas, piscineiros, cozinheiros e mais em Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva. Profissionais verificados, avaliados e prontos para atender sua villa ou pousada na Costa do Descobrimento.";

    // Canonical + OG URL da Home
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/`;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = `${window.location.origin}/`;

    // Schema Markup - LocalBusiness + WebSite + FAQPage
    const existingSchema = document.getElementById('schema-home');
    if (existingSchema) existingSchema.remove();
    const schema = document.createElement('script');
    schema.id = 'schema-home';
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "name": "Trancoso Resolve",
          "description": "Marketplace de serviços locais em Trancoso, Porto Seguro e Caraíva. Profissionais verificados para limpeza, elétrica, jardinagem, cozinha, encanamento e muito mais na Costa do Descobrimento.",
          "url": `${window.location.origin}`,
          "logo": "https://trancosoresolve.com.br/brand/logo-mark-512.png",
          "image": "https://trancosoresolve.com.br/brand/logo-mark-512.png",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Trancoso",
            "addressRegion": "BA",
            "addressCountry": "BR"
          },
          "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 },
          "areaServed": [
            { "@type": "Place", "name": "Trancoso, Bahia, Brasil" },
            { "@type": "Place", "name": "Arraial d'Ajuda, Bahia, Brasil" },
            { "@type": "Place", "name": "Porto Seguro, Bahia, Brasil" },
            { "@type": "Place", "name": "Caraíva, Bahia, Brasil" }
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços na Costa do Descobrimento",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Diarista em Trancoso" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Eletricista em Trancoso" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Encanador em Trancoso" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Jardinagem em Trancoso" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cozinheiro em Trancoso" } }
            ]
          },
          "sameAs": ["https://www.trancosoresolve.com.br"]
        },
        {
          "@type": "WebSite",
          "url": `${window.location.origin}`,
          "name": "Trancoso Resolve",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/ServicosCategoria?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Como encontrar prestadores de serviços em Trancoso?",
              "acceptedAnswer": { "@type": "Answer", "text": "Na Trancoso Resolve você encontra prestadores verificados de limpeza, elétrica, jardinagem, garçom, pedreiro, encanador, pintor, cozinheiro e babá. Todos passam por verificação de antecedentes criminais antes de serem listados." }
            },
            {
              "@type": "Question",
              "name": "Quanto custa contratar um prestador pelo Trancoso Resolve?",
              "acceptedAnswer": { "@type": "Answer", "text": "Para clientes, o acesso à plataforma é gratuito. Você encontra o prestador, entra em contato e negocia diretamente com ele, sem comissão ou taxa da plataforma." }
            },
            {
              "@type": "Question",
              "name": "Os prestadores são verificados e confiáveis?",
              "acceptedAnswer": { "@type": "Answer", "text": "Sim. Todos os prestadores passam por verificação de antecedentes criminais em bases oficiais (Polícia Federal e órgãos estaduais) antes de aparecerem nas buscas. Apenas prestadores aprovados recebem o Selo Verificado." }
            },
            {
              "@type": "Question",
              "name": "O Trancoso Resolve atende villas e pousadas?",
              "acceptedAnswer": { "@type": "Answer", "text": "Sim. A plataforma é ideal para gestores de villas, pousadas e empreendimentos em Trancoso que precisam de prestadores de serviços pontuais ou recorrentes com confiança e rapidez." }
            }
          ]
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": `${window.location.origin}` },
            { "@type": "ListItem", "position": 2, "name": "Serviços em Trancoso", "item": `${window.location.origin}/ServicosCategoria` }
          ]
        }
      ]
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById('schema-home'); if (s) s.remove(); };
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['serviceProviders'] }),
      queryClient.invalidateQueries({ queryKey: ['serviceListings'] }),
    ]);
  }, [queryClient]);

  const { isPulling, pullDistance, threshold } = usePullToRefresh(handleRefresh);

  const { data: user, isLoading: _isLoadingUser, isFetched: isUserFetched } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Redirecionar apenas após o login (não no acesso inicial ao site)
  // Só redireciona se: dados carregados, usuário existe E veio de um login recente
  useEffect(() => {
    if (!isUserFetched || !user) return;
    // Verifica se o login foi recente (último minuto) para evitar redirect no acesso direto
    const loginTime = sessionStorage.getItem('loginTimestamp');
    const isRecentLogin = loginTime && (Date.now() - parseInt(loginTime)) < 60000;
    if (!isRecentLogin) return;
    if (user.user_type === 'prestador') {
      sessionStorage.removeItem('loginTimestamp');
      navigate('/Dashboard', { replace: true });
    } else if (user.user_type === 'cliente') {
      sessionStorage.removeItem('loginTimestamp');
      navigate('/MeusPedidos', { replace: true });
    }
  }, [user, isUserFetched, navigate]);

  const { data: providers } = useQuery({
    queryKey: ['serviceProviders'],
    queryFn: () => base44.entities.ServiceProvider.list('-rating', 50),
  });

  const { data: allProviders } = useQuery({
    queryKey: ['allProviders'],
    queryFn: () => base44.entities.ServiceProvider.list('-created_date', 200),
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: allReviews } = useQuery({
    queryKey: ['allReviewsCount'],
    queryFn: () => base44.entities.ServiceReview.list('-created_date', 500),
    initialData: [],
    staleTime: 10 * 60 * 1000,
  });

  const totalPrestadoresVagas = allProviders?.filter(p =>
    p.tipo_pessoa === 'pf' ||
    (p.tipo_pessoa === 'mei' && !p.tem_ponto_fisico_em_trancoso) ||
    (p.tipo_pessoa === 'pj' && !p.tem_ponto_fisico_em_trancoso)
  ).length || 0;
  const vagasRestantes = Math.max(0, 50 - totalPrestadoresVagas);
  const totalVerificados = allProviders?.filter(p => p.verificado === true || p.status === 'ativo').length || 0;
  const _totalCategorias = 9;
  const _totalAvaliacoes = allReviews?.length || 0;
  
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['serviceListings'],
    queryFn: () => base44.entities.ServiceListing.filter({ active: true }, '-created_date', 6),
  });

  const { data: recommendedServices, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['recommendedServices', user?.id],
    queryFn: () => base44.functions.invoke('getRecommendations', { userId: user.id }),
    enabled: !!user,
  });

  const _popularServices = ["Faxina", "Eletricista", "Passeio Turístico", "Transporte", "Massagem"];

  return (
    <div className="bg-background overflow-x-hidden">
      {/* H1 semântico oculto para crawlers — SPA não renderiza H1 no HTML estático */}
      <h1 className="sr-only">Trancoso Resolve — Profissionais Verificados em Trancoso</h1>
      {/* Pull-to-refresh indicator */}
      {pullDistance > 10 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-orange-50 border-b border-orange-200 transition-all"
          style={{ height: `${Math.min(pullDistance, threshold)}px` }}
        >
          <div className={`flex items-center gap-2 text-orange-600 text-sm font-medium ${isPulling ? 'animate-spin' : ''}`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {isPulling ? 'Atualizando...' : pullDistance >= threshold ? 'Solte para atualizar' : 'Puxe para atualizar'}
          </div>
        </div>
      )}
      <OnboardingTour />

      {/* Hero com busca */}
      <HeroSearch />

      {/* Barra prova social */}
      <SocialProofBar totalVerificados={totalVerificados} />

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-16">
        {/* Banner Prestador Fundador — visível para não-assinantes */}
        <FounderBanner />

        {/* Recomendações com IA */}
        {user && (isLoadingRecommendations || (recommendedServices?.data && recommendedServices.data.length > 0)) && (
            <section className="mb-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-brand-primary" /> Para Você</h2>
                    <Link to={createPageUrl("ServicosCategoria")}>
                        <Button variant="ghost" className="text-orange-600 hover:text-orange-700">Ver todos</Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoadingRecommendations ? (
                        Array.from({ length: 3 }).map((_, i) => <ServiceSkeletonCard key={i} />)
                    ) : (
                        recommendedServices.data.map((service) => {
                            const provider = providers?.find(p => p.id === service.provider_id);
                            return <ServiceCard key={service.id} service={service} provider={provider} />;
                        })
                    )}
                </div>
            </section>
        )}

        {/* Featured Services */}
        <section className="mb-10 md:mb-20">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-foreground leading-tight">Profissionais verificados em Trancoso, na hora que você precisa.</h2>
            <Link to={createPageUrl("ServicosCategoria")} data-testid="home-ver-todos-servicos-link">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700" aria-label="Ver todos os serviços">
                Ver todos
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {isLoadingServices ? (
                  Array.from({ length: 3 }).map((_, i) => <ServiceSkeletonCard key={i} />)
                ) : services && services.length > 0 ? (
                  services.map((service) => {
                    const provider = providers?.find(p => p.id === service.provider_id);
                    return <ServiceCard key={service.id} service={service} provider={provider} />;
                  })
                ) : (
                  <div className="col-span-full text-center py-12 bg-gradient-to-br from-orange-50 to-sand rounded-xl border border-orange-100">
                    <Sparkles className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Serviços em Destaque em Breve!</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      Estamos selecionando os melhores serviços para você. Enquanto isso, explore nossos profissionais.
                    </p>
                    <Link to={createPageUrl("ServicosCategoria")}>
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        Explorar Profissionais
                      </Button>
                    </Link>
                  </div>
                )}
          </div>
        </section>

        {/* Landing Pages por Serviço - SEO Local */}
         <section className="mb-10 md:mb-20 pt-8 md:pt-16">
           <div className="text-center mb-8">
             <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Serviços Mais Buscados em Trancoso</h2>
             <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Acesse guias completos com profissionais verificados em cada categoria</p>
           </div>
           <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-4 md:overflow-visible">
             {[
               { slug: 'limpeza-trancoso', label: 'Diarista', icon: Home },
               { slug: 'eletricista-trancoso', label: 'Eletricista', icon: Zap },
               { slug: 'encanador-trancoso', label: 'Encanador', icon: Wrench },
               { slug: 'jardinagem-trancoso', label: 'Jardineiro', icon: Leaf },
               { slug: 'cozinheiro-trancoso', label: 'Cozinheiro', icon: UtensilsCrossed },
               { slug: 'pedreiro-trancoso', label: 'Pedreiro', icon: Hammer },
               { slug: 'pintor-trancoso', label: 'Pintor', icon: Paintbrush },
               { slug: 'baba-trancoso', label: 'Babá', icon: Baby },
               { slug: 'garcom-trancoso', label: 'Garçom', icon: UtensilsCrossed },
             ].map(item => {
               const Icon = item.icon;
               return (
               <Link key={item.slug} to={`/ServicoLanding?slug=${item.slug}`} className="min-w-[110px] snap-start shrink-0 md:min-w-0 md:w-auto">
                 <div className="bg-card rounded-brand-lg p-4 text-center shadow-warm-sm hover:shadow-warm-md transition-all duration-300 border border-border hover:border-orange-400 cursor-pointer group h-full flex flex-col items-center justify-center">
                   <div className="w-10 h-10 rounded-brand-md bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-2">
                     <Icon className="w-5 h-5 text-orange-500" aria-hidden="true" />
                   </div>
                   <span className="text-sm md:text-base font-bold text-foreground group-hover:text-orange-500 transition-colors">{item.label}</span>
                   <span className="block text-xs font-medium text-muted-foreground mt-1">em Trancoso</span>
                 </div>
               </Link>
               );
             })}
           </div>
         </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Como Funciona */}
        <section className="mb-10 md:mb-20 mt-10 md:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Como funciona a Trancoso Resolve</h2>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {[
              { step: '1', title: 'Você conta o que precisa', desc: 'Explique o tipo de serviço, bairro em Trancoso e melhor horário para contato.' },
              { step: '2', title: 'Nós conectamos aos prestadores certos', desc: 'Nosso sistema distribui seu pedido para prestadores qualificados na região.' },
              { step: '3', title: 'Você recebe contatos e escolhe', desc: 'Compare respostas, avalie e decida com quem quer fechar.' },
            ].map(item => (
              <div key={item.step} className="bg-card rounded-brand-lg p-5 md:p-6 shadow-warm-sm border border-border flex items-start gap-4 md:block md:text-center min-w-[85%] sm:min-w-[340px] snap-start shrink-0 md:min-w-0 md:w-auto">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-primary text-white font-bold text-lg md:text-xl flex items-center justify-center shrink-0 md:mx-auto md:mb-4 shadow-brand">{item.step}</div>
                <div>
                  <h3 className="font-bold text-base md:text-lg text-foreground mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Por que usar */}
        <section className="mb-10 md:mb-20 bg-gradient-to-br from-orange-50 to-sand dark:from-secondary dark:to-background rounded-3xl p-8 md:p-12 border border-orange-100 dark:border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Por que usar a Trancoso Resolve em Trancoso</h2>
          <ul className="space-y-4">
            {[
              'Prestadores locais e confiáveis, focados em atender Trancoso e região.',
              'Resposta rápida: seu pedido chega direto nos prestadores certos.',
              'Mais segurança: perfis dos prestadores, histórico e verificação quando disponível.',
              'Sem custo para quem pede serviço: você pede, recebe retorno e escolhe.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground">
                <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link to={createPageUrl("ServicosCategoria")} className="block sm:inline-block">
              <Button className="w-full sm:w-auto bg-brand-primary hover:bg-orange-600 text-white font-bold text-base px-8 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95 rounded-pill shadow-brand">
                Encontrar profissional agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Costa do Descobrimento */}
        <section className="mb-10 md:mb-20 bg-gradient-to-br from-orange-50 to-sand dark:from-secondary dark:to-background rounded-3xl p-8 md:p-12 border border-orange-100 dark:border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">Atendemos toda a Costa do Descobrimento</h2>
          <p className="text-muted-foreground text-center mb-8 text-base max-w-xl mx-auto">Profissionais verificados para Trancoso, Arraial d'Ajuda, Porto Seguro e Caraíva — a mesma qualidade e segurança em toda a Costa do Descobrimento.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                cidade: 'Trancoso',
                desc: 'O destino mais icônico — villas de luxo, pousadas e o famoso Quadrado.',
                destinoHref: '/destinos/trancoso',
                links: [
                  { label: 'Diarista Trancoso', href: '/servicos/diarista-trancoso' },
                  { label: 'Eletricista Trancoso', href: '/servicos/eletricista-trancoso' },
                  { label: 'Piscineiro Trancoso', href: '/servicos/piscineiro-trancoso' },
                ],
              },
              {
                cidade: "Arraial d'Ajuda",
                desc: "Vila turística charmosa — pousadas, casas de temporada e praias paradisíacas.",
                destinoHref: '/destinos/arraial-dajuda',
                links: [
                  { label: "Diarista Arraial d'Ajuda", href: '/servicos/diarista-arraial-dajuda' },
                  { label: "Eletricista Arraial d'Ajuda", href: '/servicos/eletricista-arraial-dajuda' },
                  { label: "Piscineiro Arraial d'Ajuda", href: '/servicos/piscineiro-arraial-dajuda' },
                ],
              },
              {
                cidade: 'Porto Seguro',
                desc: 'A maior cidade da região — hotéis, resorts e residências de alto padrão.',
                destinoHref: '/destinos/porto-seguro',
                links: [
                  { label: 'Diarista Porto Seguro', href: '/servicos/diarista-porto-seguro' },
                  { label: 'Eletricista Porto Seguro', href: '/servicos/eletricista-porto-seguro' },
                  { label: 'Piscineiro Porto Seguro', href: '/servicos/piscineiro-porto-seguro' },
                ],
              },
              {
                cidade: 'Caraíva',
                desc: 'O paraíso preservado — sem asfalto, sem carros, só natureza e charme.',
                destinoHref: '/destinos/caraiva',
                links: [
                  { label: 'Diarista Caraíva', href: '/servicos/diarista-caraiva' },
                  { label: 'Eletricista Caraíva', href: '/servicos/eletricista-caraiva' },
                  { label: 'Piscineiro Caraíva', href: '/servicos/piscineiro-caraiva' },
                ],
              },
            ].map((dest) => (
              <div key={dest.cidade} className="bg-card rounded-brand-lg p-6 shadow-warm-sm border border-orange-100 dark:border-border flex flex-col">
                <div className="w-10 h-10 rounded-brand-md bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{dest.cidade}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-grow">{dest.desc}</p>
                <ul className="space-y-2 mb-4">
                  {dest.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center gap-1 group">
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to={dest.destinoHref} className="text-xs font-semibold text-orange-500 hover:text-orange-700 flex items-center gap-1 border-t border-orange-100 dark:border-border pt-3 transition-colors group">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  Ver página de {dest.cidade}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Lead Capture Form */}
        <Suspense fallback={<div className="py-12"><Skeleton className="h-96 w-full rounded-lg" /></div>}>
          <LeadCaptureForm
            serviceInterest="Geral"
            serviceLabel="um profissional"
            source="home"
          />
        </Suspense>

        {/* CTA Prestadores */}
        <CTAPrestador vagasRestantes={vagasRestantes} />
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional" />
    </div>
  );
}