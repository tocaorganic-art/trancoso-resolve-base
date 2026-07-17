import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocateFixed, MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = "AIzaSyAOc54TuiYbL5mWlIsdGx7kAsABOvRZ79g";

const trancosoDefault = { lat: -16.5925, lng: -39.0931 };

const landmarks = [
  { id: 1, name: "Quadrado",            position: { lat: -16.5925, lng: -39.0931 } },
  { id: 2, name: "Praia dos Nativos",   position: { lat: -16.5931, lng: -39.0881 } },
  { id: 3, name: "Praia dos Coqueiros", position: { lat: -16.5966, lng: -39.0911 } },
];

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return; }
    if (document.getElementById('gmaps-script')) {
      const poll = setInterval(() => { if (window.google?.maps) { clearInterval(poll); resolve(); } }, 100);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gmaps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Falha ao carregar Google Maps'));
    document.head.appendChild(script);
  });
}

export default function ServiceLocationMap({ initialPosition, onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const initialLatLng = initialPosition
    ? { lat: initialPosition[0], lng: initialPosition[1] }
    : trancosoDefault;

  useEffect(() => {
    loadGoogleMaps().then(() => setLoaded(true)).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: initialLatLng,
      zoom: 17,
      mapTypeId: 'hybrid',   // Satélite + rótulos
      tilt: 45,              // Visão 3D
      heading: 0,
      mapTypeControl: true,
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_LEFT,
      },
      fullscreenControl: true,
      streetViewControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
    });

    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: initialLatLng,
      map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: 'Localização selecionada',
    });
    markerRef.current = marker;

    map.addListener('click', (e) => {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      marker.setPosition(pos);
      if (onLocationSelect) onLocationSelect([pos.lat, pos.lng]);
    });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (onLocationSelect) onLocationSelect([pos.lat(), pos.lng()]);
    });
  }, [loaded]);

  const flyTo = (pos) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.panTo(pos);
      mapInstanceRef.current.setZoom(18);
      markerRef.current.setPosition(pos);
      if (onLocationSelect) onLocationSelect([pos.lat, pos.lng]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { alert("Geolocalização não suportada."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => flyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Não foi possível obter sua localização. Verifique as permissões.")
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="h-[380px] w-full relative bg-slate-800">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm p-4 text-center z-10">
              {error}
            </div>
          )}
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm z-10">
              Carregando Google Maps 3D…
            </div>
          )}
          <div ref={mapRef} className="h-full w-full" />
        </div>
        <div className="p-4 bg-slate-50 border-t space-y-3">
          <p className="text-sm text-slate-600">Clique no mapa para definir sua localização ou use os atalhos abaixo.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleUseCurrentLocation}>
              <LocateFixed className="w-4 h-4 mr-2" />
              Usar minha localização
            </Button>
            {landmarks.map(lm => (
              <Button key={lm.id} variant="outline" size="sm" onClick={() => flyTo(lm.position)}>
                <MapPin className="w-4 h-4 mr-2" />
                {lm.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}