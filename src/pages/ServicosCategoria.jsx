import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProviderGrid from "@/components/providers/ProviderGrid";
import FilterBar from "@/components/providers/FilterBar";

const slugMap = {
  'Limpeza': 'limpeza-trancoso',
  'Eletricista': 'eletricista-trancoso',
  'Encanador': 'encanador-trancoso',
  'Jardinagem': 'jardinagem-trancoso',
  'Cozinheiro': 'cozinheiro-trancoso',
  'Pedreiro': 'pedreiro-trancoso',
  'Pintor': 'pintor-trancoso',
  'Babá': 'baba-trancoso',
  'Garçom': 'garcom-trancoso',
};

export default function ServicosCategoriaPage() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get('cat') || 'Todos');
  const [searchQuery, setSearchQuery] = useState(urlParams.get('q') || '');
  
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [aiFilteredProviderIds, setAiFilteredProviderIds] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const queryClient = useQueryClient();

  // ⭐ STEP 1: Fetch providers FIRST
  const { data: providers = [], isLoading: isLoadingProviders, isError: isErrorProviders } = useQuery({
    queryKey: ['serviceProviders'],
    queryFn: async () => {
      try {
        const result = await base44.entities.ServiceProvider.filter({ availability: { '$ne': 'Indisponível' } }, '-rating');
        return Array.isArray(result) ? result : [];
      } catch (err) {
        console.error('ServiceProvider query error:', err);
        return [];
      }
    },
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['serviceProviders'] });
  }, [queryClient]);

  const { isPulling, pullDistance, threshold } = usePullToRefresh(handleRefresh);

  // Helper: Detectar prestador de teste
  const isTestProvider = useCallback((provider) => {
    if (!provider) return false;
    // Excluir por nome (contém "teste")
    if (provider.full_name?.toLowerCase().includes('teste')) return true;
    // Excluir por email (domains de teste)
    if (provider.email?.match(/@(teste|email|test|demo|example|sample)\.com/i)) return true;
    // Excluir por bio com caracteres aleatórios (padrão: sequências repetidas ou muito caóticas)
    if (provider.bio && /[ytdgfutyfyuftyuftuyfytufytukfjtyufjyt]{20,}/.test(provider.bio.replace(/\s/g, ''))) return true;
    return false;
  }, []);

  // ⭐ STEP 2: Compute filtered providers AFTER providers is available
  const filteredProviders = useMemo(() => {
    if (!providers || providers.length === 0) return [];

    return providers.filter(provider => {
      // Ocultar reprovados e dados de teste
      if (provider.status_verificacao === 'reprovado') return false;
      if (isTestProvider(provider)) return false;

      const matchesCategory = selectedCategory === 'Todos' || provider.occupation === selectedCategory;
      
      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
          matchesSearch = aiFilteredProviderIds ? aiFilteredProviderIds.includes(provider.id) : false;
      }

      const matchesPrice = priceFilter === "all" || provider.price_range === priceFilter;
      const matchesRating = ratingFilter === "all" || (provider.rating && provider.rating >= parseFloat(ratingFilter));
      const matchesAvailability = availabilityFilter === "all" || provider.availability === availabilityFilter;
      const matchesNeighborhood = neighborhoodFilter === "all" || provider.location?.neighborhood === neighborhoodFilter;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesAvailability && matchesNeighborhood;
    });
  }, [providers, selectedCategory, searchQuery, aiFilteredProviderIds, priceFilter, ratingFilter, availabilityFilter, neighborhoodFilter]);

  // ⭐ STEP 3: Compute filter counts AFTER providers is available
  const filterCounts = useMemo(() => {
    if (!providers || providers.length === 0) return { price: {}, rating: {}, availability: {}, neighborhoods: [] };

    const baseFiltered = providers.filter(p => {
      // Ocultar reprovados e dados de teste
      if (p.status_verificacao === 'reprovado') return false;
      if (isTestProvider(p)) return false;

      const matchesCategory = selectedCategory === 'Todos' || p.occupation === selectedCategory;
      let matchesSearch = true;
      if (searchQuery.trim() !== '' && aiFilteredProviderIds) {
        matchesSearch = aiFilteredProviderIds.includes(p.id);
      }
      return matchesCategory && matchesSearch;
    });

    const neighborhoods = [...new Set(baseFiltered.map(p => p.location?.neighborhood).filter(Boolean))].sort();

    return {
      price: {
        all: baseFiltered.length,
        '$': baseFiltered.filter(p => p.price_range === '$').length,
        '$$': baseFiltered.filter(p => p.price_range === '$$').length,
        '$$$': baseFiltered.filter(p => p.price_range === '$$$').length,
      },
      rating: {
        all: baseFiltered.length,
        '4.5': baseFiltered.filter(p => p.rating && p.rating >= 4.5).length,
        '4.0': baseFiltered.filter(p => p.rating && p.rating >= 4.0).length,
        '3.5': baseFiltered.filter(p => p.rating && p.rating >= 3.5).length,
      },
      availability: {
        all: baseFiltered.length,
        'Disponível': baseFiltered.filter(p => p.availability === 'Disponível').length,
        'Ocupado': baseFiltered.filter(p => p.availability === 'Ocupado').length,
      },
      neighborhoods,
    };
  }, [providers, selectedCategory, searchQuery, aiFilteredProviderIds]);

  // ⭐ STEP 4: SEO and metadata (depends on filteredProviders)
  useEffect(() => {
    const cat = selectedCategory !== 'Todos' ? selectedCategory : null;
    const title = cat
      ? `${cat} em Trancoso, BA — Profissionais Verificados | Trancoso Resolve`
      : 'Todos os Serviços em Trancoso, BA | Trancoso Resolve';
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = cat
      ? `Encontre profissionais de ${cat} em Trancoso, Bahia. Verificados, avaliados pela comunidade. Solicite orçamento grátis.`
      : 'Navegue por todos os serviços disponíveis em Trancoso, BA. Profissionais verificados para limpeza, elétrica, encanamento, jardinagem e muito mais.';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}/ServicosCategoria${cat ? `?cat=${encodeURIComponent(cat)}` : ''}`;

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = `${window.location.origin}/ServicosCategoria${cat ? `?cat=${encodeURIComponent(cat)}` : ''}`;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = cat
      ? `${cat} em Trancoso, BA — Profissionais Verificados | Trancoso Resolve`
      : 'Todos os Serviços em Trancoso, BA | Trancoso Resolve';

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = cat
      ? `Encontre profissionais de ${cat} em Trancoso, Bahia. Verificados, avaliados pela comunidade. Solicite orçamento grátis.`
      : 'Navegue por todos os serviços disponíveis em Trancoso, BA. Profissionais verificados para limpeza, elétrica, encanamento, jardinagem e muito mais.';

    const pageUrl = `${window.location.origin}/ServicosCategoria${cat ? `?cat=${encodeURIComponent(cat)}` : ''}`;
    const schemaId = 'schema-categoria';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    
    const schema = document.createElement('script');
    schema.id = schemaId;
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ItemList",
          "name": cat ? `${cat} em Trancoso` : "Profissionais de Serviços em Trancoso",
          "description": cat
            ? `Lista de profissionais de ${cat} verificados em Trancoso, Bahia`
            : "Todos os profissionais de serviços disponíveis em Trancoso, Bahia",
          "url": pageUrl,
          "numberOfItems": filteredProviders?.length || 0,
          "itemListElement": (filteredProviders || []).slice(0, 10).map((p, i) => {
            const item = {
              "@type": "Person",
              "name": p.full_name,
              "jobTitle": p.occupation,
              "description": p.bio || `${p.occupation} verificado em Trancoso, Bahia`,
              "url": `${window.location.origin}/PrestadorPerfil?id=${p.id}`
            };
            if (p.photo_url) item.image = p.photo_url;
            if (p.rating && p.total_reviews > 0) {
              item.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": p.rating,
                "reviewCount": p.total_reviews,
                "bestRating": 5,
                "worstRating": 1
              };
            }
            return { "@type": "ListItem", "position": i + 1, "item": item };
          })
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": `${window.location.origin}` },
            { "@type": "ListItem", "position": 2, "name": cat ? `${cat} em Trancoso` : "Serviços em Trancoso", "item": pageUrl }
          ]
        }
      ]
    });
    document.head.appendChild(schema);
    return () => { const s = document.getElementById(schemaId); if (s) s.remove(); };
  }, [selectedCategory, filteredProviders]);

  // Sinônimos para melhorar buscas
  const categoryAliases = {
    'faxina': 'Limpeza', 'faxineira': 'Limpeza', 'diarista': 'Limpeza', 'limpeza-domestica': 'Limpeza', 'limpar': 'Limpeza',
    'eletricista': 'Eletricista', 'eletrico': 'Eletricista', 'luz': 'Eletricista',
    'encanador': 'Encanador', 'encanamento': 'Encanador', 'vazamento': 'Encanador', 'tubulacao': 'Encanador',
    'jardim': 'Jardinagem', 'jardinagem': 'Jardinagem', 'grama': 'Jardinagem', 'poda': 'Jardinagem',
    'cozinha': 'Cozinheiro', 'cozinheiro': 'Cozinheiro', 'chef': 'Cozinheiro', 'comida': 'Cozinheiro',
  };

  const resolveSearchCategory = (query) => categoryAliases[query.toLowerCase().trim()] || null;

  useEffect(() => {
    const handler = setTimeout(() => {
      const normalizedQuery = searchQuery.trim();
      
      if (normalizedQuery === '') {
        setAiFilteredProviderIds(null);
        return;
      }
      
      if (!providers || providers.length === 0) {
        setAiFilteredProviderIds([]);
        return;
      }

      const performSearch = async () => {
        setIsSearching(true);
        try {
          const resolvedCategory = resolveSearchCategory(normalizedQuery);
          
          if (resolvedCategory) {
            const matchingIds = providers.filter(p => p.occupation === resolvedCategory).map(p => p.id);
            setAiFilteredProviderIds(matchingIds);
            setIsSearching(false);
            return;
          }

          const providerContext = providers.map(p => ({
            id: p.id, name: p.full_name, occupation: p.occupation,
            bio: p.bio || '', specialties: p.specialties || [],
          }));

          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Baseado na busca do usuário "${normalizedQuery}", analise a lista de prestadores e retorne APENAS os IDs dos mais relevantes. Procure por correspondência semântica. Se não encontrar correspondência, retorne array vazio. Contexto: ${JSON.stringify(providerContext.slice(0, 50))}`,
            response_json_schema: {
              type: "object",
              properties: { relevant_provider_ids: { type: "array", items: { type: "string" }, description: "IDs dos prestadores relevantes" } },
              required: ["relevant_provider_ids"]
            }
          });
          
          const ids = result?.relevant_provider_ids;
          setAiFilteredProviderIds(Array.isArray(ids) ? ids : []);
        } catch (error) {
          console.error("Search error:", error);
          setAiFilteredProviderIds([]);
        } finally {
          setIsSearching(false);
        }
      };
      performSearch();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, providers]);

  return (
    <div className="min-h-screen bg-background">
      {pullDistance > 10 && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-orange-50 border-b border-orange-200 transition-all" style={{ height: `${Math.min(pullDistance, threshold)}px` }}>
          <div className={`flex items-center gap-2 text-orange-700 text-sm font-medium ${isPulling ? 'animate-spin' : ''}`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {isPulling ? 'Atualizando...' : pullDistance >= threshold ? 'Solte para atualizar' : 'Puxe para atualizar'}
          </div>
        </div>
      )}
      
      {/* HERO HEADER - Corrigido: padding adequado, cor navy, contagem correta */}
      <div className="bg-card px-5 pt-6 pb-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" className="text-foreground hover:bg-muted mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2 text-orange-400" /> Voltar
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-foreground">
            {selectedCategory === 'Todos' ? 'Serviços em Trancoso, BA' : `${selectedCategory} em Trancoso, BA`}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {isLoadingProviders ? "Carregando..." : (isSearching ? "Buscando com IA..." : `${filteredProviders.length} profissional${filteredProviders.length !== 1 ? 'is' : 'l'} encontrado${filteredProviders.length !== 1 ? 's' : ''}`)}
          </p>
          {selectedCategory !== 'Todos' && slugMap[selectedCategory] && (
            <Link to={`/ServicoLanding?slug=${slugMap[selectedCategory]}`} className="inline-block mt-3">
              <span className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-full px-3 py-1 transition-colors border border-orange-500/30">
                📄 Guia completo de {selectedCategory} em Trancoso →
              </span>
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          neighborhoodFilter={neighborhoodFilter}
          setNeighborhoodFilter={setNeighborhoodFilter}
          filterCounts={filterCounts}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSelectCategory={setSelectedCategory}
        />

        <style>{`
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 24px;
          }
          @media (max-width: 640px) {
            .cards-grid { grid-template-columns: 1fr; }
          }
        `}</style>
        
        <ProviderGrid
          filteredProviders={filteredProviders}
          isLoadingProviders={isLoadingProviders}
          isErrorProviders={isErrorProviders}
          isSearching={isSearching}
          searchQuery={searchQuery}
          viewMode={viewMode}
          priceFilter={priceFilter}
          ratingFilter={ratingFilter}
          availabilityFilter={availabilityFilter}
          neighborhoodFilter={neighborhoodFilter}
          selectedCategory={selectedCategory}
          setSearchQuery={setSearchQuery}
          setPriceFilter={setPriceFilter}
          setRatingFilter={setRatingFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          setNeighborhoodFilter={setNeighborhoodFilter}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
    </div>
  );
};