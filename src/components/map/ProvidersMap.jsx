import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Coordenadas centrais das cidades atendidas
const CITY_CENTERS = {
  'Trancoso': { lat: -16.5925, lng: -39.0931, zoom: 14 },
  'Caraíva': { lat: -16.7744, lng: -39.1536, zoom: 15 },
  "Arraial d'Ajuda": { lat: -16.4889, lng: -39.0669, zoom: 14 },
  'Porto Seguro': { lat: -16.4400, lng: -39.0700, zoom: 13 },
};

// Centro aproximado da Costa do Descobrimento (quando sem filtro de cidade)
const REGION_CENTER = [-16.5900, -39.1000];

// Normaliza o nome da cidade do prestador para casar com CITY_CENTERS
const normalizeCity = (cityStr) => {
  if (!cityStr) return null;
  const lower = cityStr.toLowerCase();
  if (lower.includes('trancoso')) return 'Trancoso';
  if (lower.includes('cara')) return 'Caraíva';
  if (lower.includes('arraial')) return "Arraial d'Ajuda";
  if (lower.includes('porto seguro')) return 'Porto Seguro';
  return null;
};

// Componente auxiliar: ajusta o mapa para enquadrar todos os marcadores
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [positions, map]);
  return null;
}

export default function ProvidersMap({ providers, cityFilter = 'all' }) {
  // Prestadores com coordenadas exatas
  const withCoords = providers.filter(p => p.location?.lat && p.location?.lng);

  // Prestadores sem coordenadas mas com cidade conhecida — posiciona no centro da cidade
  const geocoded = providers
    .filter(p => (!p.location?.lat || !p.location?.lng) && normalizeCity(p.location?.city))
    .map(p => {
      const cityKey = normalizeCity(p.location?.city);
      const center = CITY_CENTERS[cityKey];
      // Pequeno deslocamento aleatório estável para não sobrepor marcadores na mesma cidade
      const seed = (p.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const offsetLat = ((seed % 100) / 100 - 0.5) * 0.01;
      const offsetLng = (((seed >> 3) % 100) / 100 - 0.5) * 0.01;
      return {
        ...p,
        _geocodedCity: cityKey,
        location: { ...p.location, lat: center.lat + offsetLat, lng: center.lng + offsetLng },
      };
    });

  const allMarkers = [...withCoords, ...geocoded];

  // Posições para fitBounds
  const positions = allMarkers.map(p => [p.location.lat, p.location.lng]);

  // Centro inicial baseado no filtro de cidade
  const selectedCity = cityFilter !== 'all' ? normalizeCity(cityFilter) : null;
  const initialCenter = selectedCity
    ? [CITY_CENTERS[selectedCity].lat, CITY_CENTERS[selectedCity].lng]
    : REGION_CENTER;
  const initialZoom = selectedCity ? CITY_CENTERS[selectedCity].zoom : 10;

  // Cidades de referência a exibir no mapa (quando sem filtro específico)
  const referenceCities = selectedCity
    ? [{ name: selectedCity, ...CITY_CENTERS[selectedCity] }]
    : Object.entries(CITY_CENTERS).map(([name, c]) => ({ name, ...c }));

  return (
    <div className="h-[500px] md:h-[650px] w-full rounded-2xl overflow-hidden shadow-lg border border-border">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        <FitBounds positions={positions} />

        {/* Marcadores de cidades de referência */}
        {referenceCities.map(city => (
          <CircleMarker
            key={city.name}
            center={[city.lat, city.lng]}
            radius={10}
            pathOptions={{
              color: '#ea580c',
              fillColor: '#fb923c',
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Popup>
              <div className="font-sans min-w-[120px]">
                <p className="font-bold text-sm">{city.name}</p>
                <p className="text-xs text-slate-600">Região atendida</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Marcadores dos prestadores */}
        {allMarkers.map(p => (
          <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
            <Popup>
              <div className="font-sans min-w-[160px]">
                <p className="font-bold text-sm mb-1">{p.full_name}</p>
                <p className="text-xs text-slate-600 mb-1">{p.occupation}</p>
                {p._geocodedCity && (
                  <p className="text-xs text-amber-600 mb-2">📍 {p._geocodedCity} (localização aproximada)</p>
                )}
                {p.rating > 0 && (
                  <p className="text-xs text-yellow-600 mb-1">⭐ {p.rating.toFixed(1)} ({p.total_reviews || 0} avaliações)</p>
                )}
                <Link
                  to={createPageUrl('PrestadorPerfil', `?id=${p.id}`)}
                  className="text-xs text-blue-600 underline font-semibold"
                >
                  Ver perfil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {allMarkers.length === 0 && (
          <Popup position={initialCenter}>
            Nenhum profissional com localização cadastrada nesta área.
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}