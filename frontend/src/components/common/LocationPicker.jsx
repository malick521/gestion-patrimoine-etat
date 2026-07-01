import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  ZoomControl
} from "react-leaflet";
import L from "leaflet";

// 1. Création d'un marqueur moderne 100% SVG/CSS au lieu des images par défaut
const modernMarkerIcon = L.divIcon({
  className: "bg-transparent", // Empêche le fond blanc par défaut de Leaflet
  // Utilisation d'un SVG stylisé avec les couleurs de votre thème (slate-900)
  html: `
    <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-10">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0f172a" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 drop-shadow-md">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
      <div class="absolute -bottom-1 w-4 h-1 bg-black/20 blur-[2px] rounded-full"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40], // Point d'ancrage pointu en bas au centre
});

function LocationMarker({ dto, setDto }) {
  const [position, setPosition] = useState(
    dto.latitude && dto.longitude ? [dto.latitude, dto.longitude] : null
  );
  const map = useMap();

  // Centre la carte si l'utilisateur a déjà des coordonnées sauvegardées
 useEffect(() => {
    if (dto.latitude && dto.longitude) {
      map.flyTo([dto.latitude, dto.longitude], map.getZoom(), { animate: true });
    }
}, [map, dto.latitude, dto.longitude]); // ✅ Les dépendances sont ajoutées

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
    setDto((prev) => ({
    ...prev,
    latitude: lat,
    longitude: lng,
    localisation: `${lat}, ${lng}`,
    }));
        
      // 2. Animation fluide vers le point cliqué
      map.flyTo([lat, lng], map.getZoom(), {
        animate: true,
        duration: 0.5
      });
    },
  });

  return position ? (
    <Marker position={position} icon={modernMarkerIcon} />
  ) : null;
}

export default function LocationPicker({ dto, setDto }) {
  // Coordonnées par défaut (Nouakchott)
  const [center, setCenter] = useState([18.0735, -15.9582]); 

  useEffect(() => {
    // Ne demander la géolocalisation que s'il n'y a pas de coordonnées existantes
    if (!dto.latitude && !dto.longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn("Géolocalisation refusée ou indisponible")
      );
    }
  }, [dto.latitude, dto.longitude]);

  return (
    <div className="relative group w-full h-[300px] rounded-2xl overflow-hidden bg-slate-50">
      {/* 3. Interface superposée (Overlay) moderne */}
      <div className="absolute top-4 left-4 z-[400] bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-sm border border-white/50 pointer-events-none transition-all">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dto.latitude ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
          <p className="text-xs font-bold text-slate-800">
            {dto.latitude 
              ? "Position enregistrée" 
              : "Cliquez sur la carte pour localiser le bien"}
          </p>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false} // Désactive le zoom en haut à gauche
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        {/* Tuiles CartoDB Voyager : Couleurs douces, routes claires, design moderne */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* On remet les boutons de zoom, mais discrets en bas à droite */}
        <ZoomControl position="bottomright" />
        
        <LocationMarker dto={dto} setDto={setDto} />
      </MapContainer>
    </div>
  );
}