import React, { useState, useEffect, useCallback, useRef } from "react";
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
import ServiceCarousel from "@/components/home/ServiceCarousel";
import SocialProofBar from "@/components/home/SocialProofBar";
import CTAPrestador from "@/components/home/CTAPrestador";
import {
  Sparkles, UtensilsCrossed, Hammer, Leaf,
  Baby, Zap, Star, AlertCircle, Shirt, Car, Compass, PartyPopper, BookOpen, Home, Wrench, BrainCircuit, ArrowRight, ChevronLeft, ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import LeadCaptureForm from "@/components/servicos/LeadCaptureForm";
import WhatsAppStickyBar from "@/components/servicos/WhatsAppStickyBar";

// Mapeamento completo de imagens por categoria (alinhado com enum da entidade ServiceListing)
const categoryImageMap = {
  // Categorias do enum: Limpeza, Garçom, Pedreiro, Jardinagem, Babá, Eletricista, Encanador, Pintor, Cozinheiro, Outro
  'Limpeza': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/inigQzgVMUPeKrkL.png',
  'Garçom': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Pedreiro': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Jardinagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/MmnYpPgxNHhyniba.png',
  'Babá': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Eletricista': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/loNdoqfPbYrpiZUY.png',
  'Encanador': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/SzIYzgzmeNbfcRvv.png',
  'Pintor': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Cozinheiro': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663209925483/XKIqXQfxYpLpcnsh.png',
  'Outro': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  // Categorias extras para compatibilidade
  'Construção': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Beleza': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Turismo': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Gastronomia': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Festas': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Aulas': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Transporte': 'https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'Automóveis': 'https://images.unsplash.com/photo-1553440569-b506745199de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
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

const ProviderSkeletonCard = () => (
    <Card className="border-none shadow-lg">
        <CardContent className="p-4 text-center">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
            <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-3 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/4 mx-auto" />
        </CardContent>
    </Card>
);

// Função para validar se uma URL de imagem parece válida e relevante
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  // Verifica se é uma URL válida de imagem
  const validDomains = ['unsplash.com', 'images.unsplash.com', 'storage.googleapis.com', 'base44.com', 'ui-avatars.com', 'manuscdn.com'];
  try {
    const urlObj = new URL(url);
    return validDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};

const ServiceCard = ({ service, provider }) => {
    const serviceImage = service.images?.[0];
    const hasValidImage = isValidImageUrl(serviceImage);
    const fallbackImage = categoryImageMap[service.category] || categoryImageMap.default;
    const imageSrc = hasValidImage ? serviceImage : fallbackImage;
    const Icon = categoryIconMap[service.category] || categoryIconMap.default;
    const description = service.description || categoryDescriptionMap[service.category] || 'Serviço profissional de qualidade na Costa do Descobrimento.';

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
                        alt={`${service.title} — serviço de ${service.category} na Costa do Descobrimento`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full" aria-hidden="true">
                        <Icon className="w-10 h-10 text-slate-400" />
                    </div>
                )}
                {/* Badge de categoria sobre a imagem */}
                <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-600 text-white text-xs font-semibold px-2 py-0.5 shadow-md">
                        {service.category}
                    </Badge>
                </div>
                {/* Selo "Novo" se não tiver avaliações */}
                {isNew && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 shadow-md">
                            ⭐ Novo
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
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-foreground">
                                {provider?.rating ? provider.rating.toFixed(1) : 'Novo'}
                            </span>
                            {provider?.total_reviews > 0 && (
                                <span className="text-xs text-muted-foreground ml-0.5">({provider.total_reviews})</span>
                            )}
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-extrabold text-primary leading-tight">
                            R$ {formatPrice(service.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">por {service.price_unit || 'serviço'}</p>
                    </div>
                </div>

                {/* Botão Ver Detalhes */}
                <Link to={createPageUrl("ServicoDetalhes", `?id=${service.id}`)} data-testid={`service-card-link-${service.id}`} aria-label={`Ver detalhes do serviço ${service.title}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        Solicitar
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Trancoso Resolve | Profissionais Verificados da Costa do Descobrimento";

    // Meta description otimizada
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = "Contrate profissionais da sua comunidade na Costa do Descobrimento — Trancoso, Porto Seguro, Caraíva e Arraial d'Ajuda. Verificados, avaliados, com histórico real. Oportunidade que o governo não dá.";

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
          "logo": "https://media.base44.com/images/public/68eb21726a9614db4a82ba99/866729f3e_trancoso_resolve_logo_principal.png",
          "image": "https://media.base44.com/images/public/68eb21726a9614db4a82ba99/866729f3e_trancoso_resolve_logo_principal.png",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Trancoso",
            "addressRegion": "BA",
            "addressCountry": "BR"
          },
          "geo": { "@type": "GeoCoordinates", "latitude": -16.5897, "longitude": -39.0828 },
          "areaServed": [
            { "@type": "Place", "name": "Trancoso, Bahia, Brasil" },
            { "@type": "Place", "name": "Porto Seguro, Bahia, Brasil" },
            { "@type": "Place", "name": "Caraíva, Bahia, Brasil" },
            { "@type": "Place", "name": "Arraial d'Ajuda, Bahia, Brasil" }
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
  const catScrollRef = useRef(null);

  const { data: user, isLoading: isLoadingUser, isFetched: isUserFetched } = useQuery({
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

  const { data: providers, isLoading: isLoadingProviders, isError: isErrorProviders } = useQuery({
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
  const totalCategorias = 9;
  const totalAvaliacoes = allReviews?.length || 0;
  
  const { data: services, isLoading: isLoadingServices, isError: isErrorServices } = useQuery({
    queryKey: ['serviceListings'],
    queryFn: () => base44.entities.ServiceListing.filter({ active: true, featured: true }, '-created_date', 6),
  });

  const { data: recommendedServices, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['recommendedServices', user?.id],
    queryFn: () => base44.functions.invoke('getRecommendations', { userId: user.id }),
    enabled: !!user,
  });

  const topProviders = providers
    ?.filter(p => p.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6) || [];
    
  const popularServices = ["Faxina", "Eletricista", "Passeio Turístico", "Transporte", "Massagem"];

  return (
    <div className="bg-background overflow-x-hidden">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 10 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-amber-50 border-b border-amber-200 transition-all"
          style={{ height: `${Math.min(pullDistance, threshold)}px` }}
        >
          <div className={`flex items-center gap-2 text-amber-700 text-sm font-medium ${isPulling ? 'animate-spin' : ''}`}>
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

        {/* Carrossel de serviços */}
        <ServiceCarousel />

        {/* Recomendações com IA */}
        {user && (isLoadingRecommendations || (recommendedServices?.data && recommendedServices.data.length > 0)) && (
            <section className="mb-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-primary" /> Para Você</h2>
                    <Link to={createPageUrl("ServicosCategoria")}>
                        <Button variant="ghost" className="text-primary hover:text-primary/80">Ver todos</Button>
                    </Link>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-3 snap-x -mx-4 px-4 md:mx-0 md:px-0 md:grid md:overflow-visible md:pb-0 md:grid-cols-2 md:snap-none lg:grid-cols-3 md:gap-6" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
                    {isLoadingRecommendations ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[280px] md:w-auto snap-start">
                                <ServiceSkeletonCard />
                            </div>
                        ))
                    ) : (
                        recommendedServices.data.map((service) => {
                            const provider = providers?.find(p => p.id === service.provider_id);
                            return (
                                <div key={service.id} className="flex-shrink-0 w-[280px] md:w-auto snap-start">
                                    <ServiceCard service={service} provider={provider} />
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        )}


        {/* Landing Pages por Serviço - SEO Local */}
         <section className="mb-10 md:mb-20 pt-8 md:pt-16">
           <div className="text-center mb-8">
             <h2 className="text-2xl md:text-4xl font-bold text-foreground drop-shadow-sm mb-2">Serviços Mais Buscados na Costa do Descobrimento</h2>
             <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Profissionais verificados da sua comunidade em cada categoria</p>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
             {[
               { slug: 'limpeza-trancoso', label: 'Diarista', emoji: '🧹' },
               { slug: 'eletricista-trancoso', label: 'Eletricista', emoji: '⚡' },
               { slug: 'encanador-trancoso', label: 'Encanador', emoji: '🔧' },
               { slug: 'jardinagem-trancoso', label: 'Jardineiro', emoji: '🌿' },
               { slug: 'cozinheiro-trancoso', label: 'Cozinheiro', emoji: '👨‍🍳' },
               { slug: 'pedreiro-trancoso', label: 'Pedreiro', emoji: '🏗️' },
               { slug: 'pintor-trancoso', label: 'Pintor', emoji: '🖌️' },
               { slug: 'baba-trancoso', label: 'Babá', emoji: '👶' },
               { slug: 'garcom-trancoso', label: 'Garçom', emoji: '🍽️' },
             ].map(item => (
               <Link key={item.slug} to={`/ServicoLanding?slug=${item.slug}`}>
                 <div className="bg-card rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary cursor-pointer group h-full flex flex-col items-center justify-center">
                  <span className="text-3xl block mb-2" aria-hidden="true">{item.emoji}</span>
                  <span className="text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                  <span className="block text-xs font-medium text-muted-foreground mt-1">na região</span>
                 </div>
               </Link>
             ))}
           </div>
         </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Como Funciona */}
        <section className="mb-10 md:mb-20 mt-10 md:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-sm">Simples assim — do pedido ao serviço</h2>
            <p className="text-base md:text-lg text-muted-foreground font-medium mt-2 leading-relaxed">Profissional da sua comunidade ganha renda. Você contrata com confiança.</p>
          </div>
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { step: '1', title: 'Você conta o que precisa', desc: 'Explique o tipo de serviço, bairro e melhor horário para contato.' },
              { step: '2', title: 'Nós conectamos aos prestadores certos', desc: 'Nosso sistema distribui seu pedido para prestadores qualificados da Costa do Descobrimento.' },
              { step: '3', title: 'Você recebe contatos e escolhe', desc: 'Compare respostas, avalie e decida com quem quer fechar. Sempre com segurança.' },
            ].map(item => (
              <div key={item.step} className="bg-card rounded-2xl p-5 md:p-6 shadow-md border border-border flex items-start gap-4 md:block md:text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg md:text-xl flex items-center justify-center shrink-0 md:mx-auto md:mb-4">{item.step}</div>
                <div>
                  <h3 className="font-bold text-base md:text-lg text-foreground mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Por que usar */}
        <section className="mb-10 md:mb-20 bg-secondary/30 rounded-3xl p-8 md:p-12 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 drop-shadow-sm">Por que usar a Trancoso Resolve</h2>
          <ul className="space-y-4">
            {[
              'Prestadores locais e confiáveis, focados em atender toda a Costa do Descobrimento.',
              'Resposta rápida: seu pedido chega direto nos prestadores certos.',
              'Mais segurança: perfis dos prestadores, histórico e verificação de antecedentes.',
              'Inclusão social: profissional mal avaliado recebe treinamento e segunda chance, não é removido.',
              'Sem custo para quem pede serviço: você pede, recebe retorno e escolhe.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link to={createPageUrl("ServicosCategoria")} className="block sm:inline-block">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 min-h-[44px] transition-all duration-200 hover:scale-105 active:scale-95">
                Encontrar profissional agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Costa do Descobrimento */}
        <section className="mb-10 md:mb-20 bg-secondary/30 rounded-3xl p-8 md:p-12 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">Atendemos toda a Costa do Descobrimento</h2>
          <p className="text-muted-foreground text-center mb-8 text-base max-w-xl mx-auto">Profissionais verificados para Trancoso, Porto Seguro, Caraíva e Arraial d'Ajuda — a mesma qualidade e segurança em toda a região.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                cidade: 'Trancoso',
                emoji: '🏄',
                desc: 'O destino mais icônico — villas de luxo, pousadas e o famoso Quadrado.',
                destinoHref: '/destinos/trancoso',
                links: [
                  { label: 'Diarista Trancoso', href: '/servicos/diarista-trancoso' },
                  { label: 'Eletricista Trancoso', href: '/servicos/eletricista-trancoso' },
                  { label: 'Piscineiro Trancoso', href: '/servicos/piscineiro-trancoso' },
                ],
              },
              {
                cidade: 'Porto Seguro',
                emoji: '⚓',
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
                emoji: '🌊',
                desc: 'O paraíso preservado — sem asfalto, sem carros, só natureza e charme.',
                destinoHref: '/destinos/caraiva',
                links: [
                  { label: 'Diarista Caraíva', href: '/servicos/diarista-caraiva' },
                  { label: 'Eletricista Caraíva', href: '/servicos/eletricista-caraiva' },
                  { label: 'Piscineiro Caraíva', href: '/servicos/piscineiro-caraiva' },
                ],
              },
              {
                cidade: 'Arraial d\'Ajuda',
                emoji: '🌅',
                desc: 'O charme da Costa do Descobrimento — praias deslumbrantes e o melhor da gastronomia.',
                destinoHref: '/destinos/arraial-dajuda',
                links: [
                  { label: 'Diarista Arraial d\'Ajuda', href: '/servicos/diarista-arraial-dajuda' },
                  { label: 'Eletricista Arraial d\'Ajuda', href: '/servicos/eletricista-arraial-dajuda' },
                  { label: 'Piscineiro Arraial d\'Ajuda', href: '/servicos/piscineiro-arraial-dajuda' },
                ],
              },
            ].map((dest) => (
              <div key={dest.cidade} className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col">
                <div className="text-3xl mb-3">{dest.emoji}</div>
                <h3 className="font-bold text-lg text-foreground mb-2">{dest.cidade}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-grow">{dest.desc}</p>
                <ul className="space-y-2 mb-4">
                  {dest.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 group">
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to={dest.destinoHref} className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 border-t border-border pt-3 transition-colors group">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  Ver página de {dest.cidade}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Lead Capture Form */}
        <LeadCaptureForm
          serviceInterest="Geral"
          serviceLabel="um profissional"
          source="home"
        />

        {/* CTA Prestadores */}
        <CTAPrestador vagasRestantes={vagasRestantes} />
      </div>

      <WhatsAppStickyBar serviceLabel="um profissional" />
    </div>
  );
}