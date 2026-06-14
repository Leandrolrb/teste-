import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Cores mais "neon" para brilhar no mapa escuro
const getColor = (available, total) => {
  if (total === 0) return "#ef4444"; // Vermelho vibrante (Lotado)
  const percentage = (available / total) * 100;
  if (percentage === 0) return "#ef4444";
  if (percentage <= 20) return "#fbbf24"; // Amarelo/Âmbar alerta
  return "#10b981"; // Verde esmeralda (Livre)
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function ParkingMap({ parkingData, onMarkerClick, center, userLocation }) {
  const onEachFeature = (feature, layer) => {
    layer.on('click', () => {
      if (onMarkerClick) {
        onMarkerClick({ 
          id: feature.id || feature.properties.id, 
          ...feature.properties 
        });
      }
    });
  };

  const pointToLayer = (feature, latlng) => {
    const { available_spots, total_capacity } = feature.properties;
    const color = getColor(available_spots, total_capacity);
    return L.circleMarker(latlng, {
      radius: 10, 
      fillColor: color, 
      color: "#18181b", // Borda escura para dar a sensação de "recorte" no mapa
      weight: 3, 
      opacity: 1, 
      fillOpacity: 1
    });
  };

  return (
    <MapContainer center={[-15.6014, -56.0966]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <MapController center={center} />
      
      {/* MAGIA ACONTECE AQUI: Mudamos de 'light_all' para 'dark_all' */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        maxNativeZoom={19}
        maxZoom={22}
      />
      
      {parkingData && (
        <GeoJSON 
          key={JSON.stringify(parkingData)} 
          data={parkingData} 
          pointToLayer={pointToLayer} 
          onEachFeature={onEachFeature} 
        />
      )}

      {/* PONTO DO USUÁRIO (GPS) */}
      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={8}
          pathOptions={{
            fillColor: '#3b82f6', // Azul Uber
            fillOpacity: 1,
            color: '#ffffff', // Borda branca para destacar o usuário
            weight: 3
          }}
        />
      )}
    </MapContainer>
  );
}