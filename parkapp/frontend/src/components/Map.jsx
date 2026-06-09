import React, { useEffect } from 'react';
// IMPORTAMOS O CircleMarker AQUI
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getColor = (available, total) => {
  if (total === 0) return "#ff4d4d";
  const percentage = (available / total) * 100;
  if (percentage === 0) return "#ff4d4d";
  if (percentage <= 20) return "#ffcc00";
  return "#2ecc71";
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

// RECEBEMOS O userLocation NAS PROPS AQUI
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
      radius: 10, fillColor: color, color: "#ffffff", weight: 2, opacity: 1, fillOpacity: 0.9
    });
  };

  return (
    <MapContainer center={[-15.6014, -56.0966]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <MapController center={center} />
      
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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

      {/* A MÁGICA DO PONTO AZUL: Só aparece se o GPS estiver ligado */}
      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={8}
          pathOptions={{
            fillColor: '#3b82f6', // Azul padrão de GPS
            fillOpacity: 1,
            color: '#ffffff', // Borda grossa branca
            weight: 3
          }}
        />
      )}
    </MapContainer>
  );
}