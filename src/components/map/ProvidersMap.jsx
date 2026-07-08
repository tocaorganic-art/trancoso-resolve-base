import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

const TRANCOSO_CENTER = [-16.5925, -39.0931];

export default function ProvidersMap({ providers }) {
  const validProviders = providers.filter(p => p.location?.lat && p.location?.lng);

  return (
    <div className="h-[600px] md:h-[700px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={TRANCOSO_CENTER}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {validProviders.map(p => (
          <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
            <Popup>
              <div className="font-sans min-w-[140px]">
                <p className="font-bold text-sm mb-1">{p.full_name}</p>
                <p className="text-xs text-slate-600 mb-2">{p.occupation}</p>
                <Link
                  to={createPageUrl('PrestadorPerfil', `?id=${p.id}`)}
                  className="text-xs text-blue-600 underline"
                >
                  Ver perfil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        {validProviders.length === 0 && (
          <Marker position={TRANCOSO_CENTER}>
            <Popup>Nenhum profissional com localização cadastrada nesta área.</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}