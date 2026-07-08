import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Search, Star, AlertCircle, Loader2, Filter } from "lucide-react";
import ProvidersMap from "@/components/map/ProvidersMap";
import ProviderCard from "./ProviderCard";

export default function ProviderGrid({
    filteredProviders,
    isLoadingProviders,
    isErrorProviders,
    isSearching,
    searchQuery,
    viewMode,
    priceFilter,
    ratingFilter,
    availabilityFilter,
    neighborhoodFilter,
    selectedCategory,
    setSearchQuery,
    setPriceFilter,
    setRatingFilter,
    setAvailabilityFilter,
    setNeighborhoodFilter,
    setSelectedCategory
}) {
    const renderContent = () => {
        if (isLoadingProviders) {
            return (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 mx-auto text-amber-500 animate-spin mb-4" />
                    <p className="text-slate-500 text-lg">Carregando profissionais...</p>
                </div>
            );
        }

        if (isErrorProviders) {
            return (
                <div className="text-center py-16 bg-red-50 rounded-lg">
                    <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-red-800">Erro ao Carregar</h3>
                    <p className="text-red-600 mt-2">Não foi possível buscar os profissionais. Por favor, tente novamente.</p>
                </div>
            );
        }
        
        if (searchQuery.trim() !== '' && isSearching) {
            return (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 mx-auto text-amber-500 animate-spin mb-4" />
                    <p className="text-slate-500 text-lg">Buscando profissionais com IA...</p>
                </div>
            );
        }
        
        if (filteredProviders.length === 0) {
            const hasActiveFilters = priceFilter !== 'all' || ratingFilter !== 'all' || availabilityFilter !== 'all' || neighborhoodFilter !== 'all' || searchQuery.trim() !== '';
            const hasSearchQuery = searchQuery.trim() !== '';

            return (
                <div className="col-span-full text-center py-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-2">Nenhum Prestador Encontrado</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-6">
                        {hasSearchQuery
                            ? `Não encontramos profissionais para "${searchQuery}". Tente uma busca diferente ou explore as categorias.`
                            : hasActiveFilters 
                            ? "Nenhum prestador corresponde aos filtros selecionados. Ajuste sua busca e tente novamente."
                            : "Nenhum prestador encontrado para essa categoria ainda. Em breve novos profissionais estarão disponíveis."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={() => {
                                setSearchQuery(''); setPriceFilter('all'); setRatingFilter('all');
                                setAvailabilityFilter('all'); setNeighborhoodFilter('all'); setSelectedCategory('Todos');
                            }} className="gap-2">
                                <Filter className="w-4 h-4" /> Limpar Filtros
                            </Button>
                        )}
                        <Link to={createPageUrl("SejaPrestador")}>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                                <Star className="w-4 h-4" /> Seja o Primeiro!
                            </Button>
                        </Link>
                    </div>
                </div>
            );
        }

        if (viewMode === 'map') {
            return <div className="col-span-full"><ProvidersMap providers={filteredProviders} /></div>;
        }
        
        return filteredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />);
    };

    return (
        <div className={`grid gap-4 md:gap-6 ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {renderContent()}
        </div>
    );
}