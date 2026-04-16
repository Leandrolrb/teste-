import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 1. Nossa regra de negócio de cores
const getColor = (available, total) => {
  if (total === 0) return "#ff4d4d"; // Evita divisão por zero
  const percentage = (available / total) * 100;
  if (percentage === 0) return "#ff4d4d"; // Vermelho (Lotado)
  if (percentage <= 20) return "#ffcc00"; // Amarelo (Quase lotado)
  return "#2ecc71"; // Verde (Tranquilo)
};

// 2. O componente agora recebe a função 'onMarkerClick' do MapPage
export default function ParkingMap({ onMarkerClick }) {
  const [parkingData, setParkingData] = useState(null);

  // Busca os dados da nossa API Django
  useEffect(() => {
    fetch('/api/parking/')
      .then(response => response.json())
      .then(data => {
        setParkingData(data);
      })
      .catch(error => console.error("Erro ao buscar vagas do Django:", error));
  }, []);

  // 3. A nova interação: Sem Popup, apenas o gatilho da gaveta
  const onEachFeature = (feature, layer) => {
    layer.on('click', () => {
      // Quando o pino é clicado, enviamos os dados da vaga para a página principal
      if (onMarkerClick) {
        onMarkerClick(feature.properties);
      }
    });
  };

  // 4. Desenhando os pinos coloridos no lugar do marcador padrão
  const pointToLayer = (feature, latlng) => {
    const { available_spots, total_capacity } = feature.properties;
    const color = getColor(available_spots, total_capacity);
    
    return L.circleMarker(latlng, {
      radius: 10,
      fillColor: color,
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    });
  };

  return (
    <MapContainer 
      center={[-15.6014, -56.0966]} // Focado em Cuiabá
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false} // Esconde os botões de +/- para ficar "cara de app"
    >
      
      {/* O "Chão" do mapa cinza estilo Waze (Esri Gray Canvas) */}
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      />

      {/* Renderiza os dados do Django usando nossa nova lógica */}
      {parkingData && (
        <GeoJSON 
          data={parkingData} 
          pointToLayer={pointToLayer}
          onEachFeature={onEachFeature} 
        />
      )}
      
    </MapContainer>
  );
}