import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LazyImage from "@/components/ui/LazyImage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import BadgeEmVerificacao from "@/components/verificacao/BadgeEmVerificacao";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { DEMO_PROFILE_WARNING } from "@/lib/mockProviderImages";

// Cores quentes da marca para o fundo das iniciais quando não há foto
const AVATAR_COLORS = ["#E8571A", "#C1440E", "#6B7C3A", "#2D7D8A", "#9a3412"];

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
}

function getAvatarColor(name) {
    if (!name) return AVATAR_COLORS[0];
    const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function ProviderCard({ provider }) {
    return (
    <div className="rounded-2xl overflow-hidden bg-[#1a1a2e] shadow-lg flex flex-col h-full border border-white/5">
        {/* 1) IMAGEM DE CAPA no topo - altura fixa, sem sobreposição */}
        <div className="h-28 w-full bg-gradient-to-br from-[#c2410c] to-[#9a3412] relative flex-shrink-0">
            {provider.cover_photo_url && provider.cover_photo_url.trim() ? (
                <LazyImage
                    src={provider.cover_photo_url}
                    alt={`Foto de capa de ${provider.full_name}`}
                    className="w-full h-full object-cover"
                />
            ) : null}
        </div>

        {/* 2-7) CORPO DO CARD - todo conteúdo ABAIXO da capa, com padding adequado */}
        <div className="p-4 flex flex-col gap-3 flex-grow">
            
            {/* Header com avatar + nome + ocupação + favorito */}
            <div className="flex items-start gap-3">
                {/* Avatar circular sobreposto na borda da capa (-mt-8) */}
                <Avatar className="w-16 h-16 border-3 border-white flex-shrink-0 -mt-8 relative z-10 shadow-md">
                    {provider.photo_url && provider.photo_url.trim() && (
                        <AvatarImage
                            src={provider.photo_url}
                            alt={`Foto de perfil de ${provider.full_name}`}
                            className="object-cover"
                        />
                    )}
                    <AvatarFallback
                        style={{ backgroundColor: getAvatarColor(provider.full_name) }}
                        className="text-white font-bold text-base"
                    >
                        {getInitials(provider.full_name)}
                    </AvatarFallback>
                </Avatar>

                {/* Nome e ocupação - à direita do avatar, NUNCA coberto */}
                <div className="flex-1 min-w-0 pt-1">
                    {/* Nome completo em branco bold */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-white truncate">
                            {provider.full_name}
                        </span>
                        {provider.verified && (
                            <span className="text-orange-500 text-sm" title="Verificado" aria-label="Profissional verificado">✔</span>
                        )}
                    </div>
                    {/* Ocupação em cinza abaixo do nome */}
                    <div className="text-sm text-[#9ca3af] mt-0.5">
                        {provider.occupation}
                    </div>
                </div>

                {/* Botão de favorito no canto superior direito */}
                <div className="flex-shrink-0">
                    <FavoriteButton 
                        id={provider.id} 
                        type="provider" 
                        name={provider.full_name}
                        category={provider.occupation}
                    />
                </div>
            </div>

            {/* 5) Badges de avaliação */}
            <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-sm">★</span>
                <span className="text-white font-semibold text-sm">
                    {provider.rating ? provider.rating.toFixed(1) : 'Novo'}
                </span>
                {provider.total_reviews > 0 && (
                    <span className="text-[#6b7280] text-xs">
                        ({provider.total_reviews} avaliações)
                    </span>
                )}
            </div>

            {/* 6) Bio curta (line-clamp-2) */}
            {provider.bio && (
                <p className="text-sm text-[#d1d5db] leading-relaxed line-clamp-2">
                    {provider.bio}
                </p>
            )}

            {/* Localização e preço em pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                {provider.location?.city && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#9ca3af]">
                        📍 {provider.location.city}
                    </span>
                )}
                {provider.price_range && (
                    <span className="inline-flex items-center text-sm text-[#d1d5db] font-semibold bg-white/5 px-2 py-0.5 rounded-full">
                        {provider.price_range}
                    </span>
                )}
            </div>

            {/* Badge de disponibilidade */}
            {provider.availability && (
                <div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        provider.availability === 'Disponível' 
                            ? 'bg-[#15803d] text-white' 
                            : 'bg-[#dc2626] text-white'
                    }`}>
                        {provider.availability === 'Disponível' ? '✓' : '○'} {provider.availability}
                    </span>
                </div>
            )}

            {/* Badge Em Verificação */}
            {provider.status_verificacao && provider.status_verificacao !== 'aprovado' && provider.status_verificacao !== 'reprovado' && (
                <div>
                    <BadgeEmVerificacao />
                </div>
            )}

            {/* 7) BOTÃO "Ver Perfil Completo" - gradiente âmbar padrão do site */}
            <Link to={createPageUrl("PrestadorPerfil", `?id=${provider.id}`)} className="mt-auto">
                <button className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5">
                    Ver Perfil Completo →
                </button>
            </Link>

            {/* 8) Aviso de perfil ilustrativo — apenas se sem foto real */}
            {!provider.photo_url && (
                <p className="text-center text-[10px] text-[#6b7280] mt-1">
                    {DEMO_PROFILE_WARNING}
                </p>
            )}
        </div>
    </div>
    );
};