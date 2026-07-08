import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import MultilingualAutocomplete from "@/components/search/MultilingualAutocomplete";
import { Filter, List, Map, Navigation, X } from "lucide-react";

export default function FilterBar({
    searchQuery,
    setSearchQuery,
    priceFilter,
    setPriceFilter,
    ratingFilter,
    setRatingFilter,
    availabilityFilter,
    setAvailabilityFilter,
    neighborhoodFilter,
    setNeighborhoodFilter,
    filterCounts,
    viewMode,
    setViewMode,
    onSelectCategory
}) {
    return (
    <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        padding: '24px',
        marginBottom: 32
    }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Filtros</h3>
            </div>
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)} className="flex">
                <ToggleGroupItem value="list" aria-label="Ver em lista"><List className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="map" aria-label="Ver no mapa"><Map className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MultilingualAutocomplete 
                onSelect={(suggestion) => {
                    setSearchQuery(suggestion.name);
                    onSelectCategory(suggestion.category);
                }}
                language="pt"
                placeholder="Buscar serviços..."
            />
            
            <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger aria-label="Filtrar por faixa de preço" style={{
                    border: '1.5px solid #d1d5db',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#111827',
                    background: '#fff',
                    fontWeight: 500
                }}>
                    <SelectValue placeholder="Faixa de Preço" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Preços ({filterCounts.price?.all || 0})</SelectItem>
                    <SelectItem value="$">$ - Econômico ({filterCounts.price?.['$'] || 0})</SelectItem>
                    <SelectItem value="$$">$$ - Moderado ({filterCounts.price?.['$$'] || 0})</SelectItem>
                    <SelectItem value="$$$">$$$ - Premium ({filterCounts.price?.['$$$'] || 0})</SelectItem>
                </SelectContent>
            </Select>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger aria-label="Filtrar por avaliação" style={{
                    border: '1.5px solid #d1d5db',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#111827',
                    background: '#fff',
                    fontWeight: 500
                }}>
                    <SelectValue placeholder="Avaliação" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Avaliações ({filterCounts.rating?.all || 0})</SelectItem>
                    <SelectItem value="4.5">⭐ 4.5+ Excelente ({filterCounts.rating?.['4.5'] || 0})</SelectItem>
                    <SelectItem value="4.0">⭐ 4.0+ Muito Bom ({filterCounts.rating?.['4.0'] || 0})</SelectItem>
                    <SelectItem value="3.5">⭐ 3.5+ Bom ({filterCounts.rating?.['3.5'] || 0})</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger aria-label="Filtrar por disponibilidade" style={{
                    border: '1.5px solid #d1d5db',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#111827',
                    background: '#fff',
                    fontWeight: 500
                }}>
                    <SelectValue placeholder="Disponibilidade" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Qualquer Disponibilidade ({filterCounts.availability?.all || 0})</SelectItem>
                    <SelectItem value="Disponível">🟢 Disponível agora ({filterCounts.availability?.['Disponível'] || 0})</SelectItem>
                    <SelectItem value="Ocupado">🟡 Ocupado ({filterCounts.availability?.['Ocupado'] || 0})</SelectItem>
                </SelectContent>
            </Select>

            <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                <SelectTrigger aria-label="Filtrar por bairro" style={{
                    border: '1.5px solid #d1d5db',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 14,
                    color: '#111827',
                    background: '#fff',
                    fontWeight: 500
                }}>
                    <SelectValue placeholder="Bairro / Região" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <span className="flex items-center gap-2"><Navigation className="w-3 h-3" /> Toda Trancoso</span>
                    </SelectItem>
                    {filterCounts.neighborhoods?.map(n => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(priceFilter !== 'all' || ratingFilter !== 'all' || availabilityFilter !== 'all' || neighborhoodFilter !== 'all' || searchQuery.trim() !== '') && (
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchQuery(''); setPriceFilter('all'); setRatingFilter('all');
                        setAvailabilityFilter('all'); setNeighborhoodFilter('all');
                    }}
                    style={{
                        border: '1.5px solid #d1d5db',
                        borderRadius: 8,
                        padding: '10px 14px',
                        fontSize: 14,
                        color: '#111827',
                        background: '#fff',
                        fontWeight: 500
                    }}
                    aria-label="Limpar todos os filtros"
                >
                    <X className="w-4 h-4" /> Limpar Filtros
                </Button>
            )}
        </div>
    </div>
    );
}