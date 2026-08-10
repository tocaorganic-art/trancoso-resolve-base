import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocateFixed, MapPin, Search, Loader2 } from 'lucide-react';

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places,geocoding`;
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
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

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
      mapTypeId: 'hybrid',
      tilt: 45,
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
      setSelectedAddress('');
      if (onLocationSelect) onLocationSelect([pos.lat, pos.lng], '');
    });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      setSelectedAddress('');
      if (onLocationSelect) onLocationSelect([pos.lat(), pos.lng()], '');
    });

    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'BR' },
        fields: ['formatted_address', 'geometry', 'name'],
      });
      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place?.geometry?.location) {
          handleManualSearch();
          return;
        }
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        flyTo(pos);
        setSelectedAddress(place.formatted_address || place.name || '');
        if (onLocationSelect) onLocationSelect([pos.lat, pos.lng], place.formatted_address || place.name || '');
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const flyTo = (pos) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.panTo(pos);
      mapInstanceRef.current.setZoom(18);
      markerRef.current.setPosition(pos);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim() || !loaded) return;
    setSearching(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: `${searchQuery}, Trancoso, Bahia, Brasil` },
        (results, status) => {
          setSearching(false);
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            const pos = { lat: loc.lat(), lng: loc.lng() };
            flyTo(pos);
            setSelectedAddress(results[0].formatted_address || searchQuery);
            if (onLocationSelect) onLocationSelect([pos.lat, pos.lng], results[0].formatted_address || searchQuery);
          } else {
            geocoder.geocode({ address: searchQuery }, (results2, status2) => {
              setSearching(false);
              if (status2 === 'OK' && results2[0]) {
                const loc = results2[0].geometry.location;
                const pos = { lat: loc.lat(), lng: loc.lng() };
                flyTo(pos);
                setSelectedAddress(results2[0].formatted_address || searchQuery);
                if (onLocationSelect) onLocationSelect([pos.lat, pos.lng], results2[0].formatted_address || searchQuery);
              } else {
                setSelectedAddress('');
                alert('Endereço não encontrado. Tente digitar "Rua, número, bairro, Trancoso".');
              }
            });
          }
        }
      );
    } catch (err) {
      setSearching(false);
      alert('Erro ao buscar endereço. Tente novamente.');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { alert("Geolocalização não suportada."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        flyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSelectedAddress('');
        if (onLocationSelect) onLocationSelect([pos.coords.latitude, pos.coords.longitude], '');
      },
      () => alert("Não foi possível obter sua localização. Verifique as permissões.")
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Barra de busca de endereço */}
        <div className="p-3 bg-white border-b space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleManualSearch(); } }}
                placeholder="Digite seu endereço: Rua, número, bairro…"
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleManualSearch}
              disabled={searching || !searchQuery.trim()}
              className="shrink-0"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </Button>
          </div>
          {selectedAddress && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {selectedAddress}
            </p>
          )}
        </div>

        {/* Mapa */}
        <div className="h-[380px] w-full relative bg-slate-800">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm p-4 text-center z-10">
              {error}
            </div>
          )}
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm z-10">
              Carregando Google Maps…
            </div>
          )}
          <div ref={mapRef} className="h-full w-full" />
        </div>

        {/* Atalhos */}
        <div className="p-4 bg-slate-50 border-t space-y-3">
          <p className="text-sm text-slate-600">
            Digite seu endereço acima, clique no mapa para ajustar a posição exata, ou use os atalhos abaixo.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleUseCurrentLocation}>
              <LocateFixed className="w-4 h-4 mr-2" />
              Usar minha localização
            </Button>
            {landmarks.map(lm => (
              <Button key={lm.id} variant="outline" size="sm" onClick={() => {
                flyTo(lm.position);
                setSelectedAddress(lm.name);
                if (onLocationSelect) onLocationSelect([lm.position.lat, lm.position.lng], lm.name);
              }}>
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