import { useState, useEffect } from 'react';
import ParkingMap from '../components/Map';
import { Search, LocateFixed } from 'lucide-react'; 
import { motion, useDragControls } from 'framer-motion';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return (R * c).toFixed(1); 
};

export default function SearchPage() {
  const [parkingData, setParkingData] = useState(null);
  const [selectedParking, setSelectedParking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [searchLocation, setSearchLocation] = useState([-15.6014, -56.0966]); 
  const [userLocation, setUserLocation] = useState(null); 

  const [vehicleName, setVehicleName] = useState("");

  const [sheetPosition, setSheetPosition] = useState('mid');
  const dragControls = useDragControls();

  const loadParkingData = () => {
    fetch('/api/parking/')
      .then(response => response.json())
      .then(data => setParkingData(data))
      .catch(error => console.error("Erro ao buscar vagas:", error));
  };

  useEffect(() => {
    loadParkingData();
  }, []);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocation([lat, lon]); 
          setSearchLocation([lat, lon]); 
        },
        (error) => {
          alert("Não foi possível acessar seu GPS. Verifique as permissões do seu navegador.");
          console.error(error);
        }
      );
    } else {
      alert("Seu navegador não suporta geolocalização.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    const viewbox = "-56.20,-15.50,-55.90,-15.70";
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewbox}&bounded=1`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setSearchLocation([lat, lon]); 
        } else {
          alert("Local não encontrado na região de Cuiabá. Tente digitar de outra forma.");
        }
      })
      .catch(err => console.error("Erro no geocoding:", err));
  };

  const handleDragEnd = (event, info) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    setSheetPosition((prev) => {
      if (offset < -100 || velocity < -1000) return prev === 'min' ? 'mid' : 'full';
      if (offset > 100 || velocity > 1000) return prev === 'full' ? 'mid' : 'min';
      return prev; 
    });
  };

  const sheetVariants = { full: { y: '25%' }, mid: { y: '55%' }, min: { y: '85%' } };
  const placeholderImage = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&q=80";

  let displayList = [];
  if (parkingData?.features) {
    if (userLocation) {
      displayList = parkingData.features.map(feature => {
        const dist = calculateDistance(
          userLocation[0], userLocation[1], 
          feature.geometry.coordinates[1], feature.geometry.coordinates[0]
        );
        return { ...feature, distance: parseFloat(dist).toFixed(1) };
      }).sort((a, b) => a.distance - b.distance).slice(0, 5);
    } else {
      displayList = parkingData.features.slice(0, 5);
    }
  }

  // A LÓGICA DE DISTÂNCIA BLINDADA
  let selectedDistance = "--";
  if (selectedParking && userLocation) {
    // 1. Se o usuário clicou na lista, o objeto já vem com a distância calculada!
    if (selectedParking.distance) {
      selectedDistance = selectedParking.distance;
    } 
    // 2. Se o usuário clicou no pino do Mapa, calculamos agora com segurança extra
    else if (parkingData?.features) {
      const targetId = selectedParking.id || selectedParking.properties?.id;
      if (targetId !== undefined) {
        const fullFeature = parkingData.features.find(f => 
          f.id === targetId || f.properties?.id === targetId
        );
        if (fullFeature?.geometry) {
          selectedDistance = calculateDistance(
            userLocation[0], userLocation[1], 
            fullFeature.geometry.coordinates[1], fullFeature.geometry.coordinates[0] 
          );
        }
      }
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 70px)', width: '100%', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '15px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Para onde você vai?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '14px 20px 14px 45px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            type="button" 
            onClick={handleGetLocation}
            style={{ padding: '0 15px', backgroundColor: 'white', color: '#2563eb', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Usar minha localização"
          >
            <LocateFixed size={22} />
          </button>
          <button type="submit" style={{ padding: '0 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.2)' }}>
            Buscar
          </button>
        </form>
      </div>

      <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, zIndex: 1 }}>
        <ParkingMap 
          parkingData={parkingData} 
          center={searchLocation} 
          userLocation={userLocation} // <-- ADICIONE ESTA LINHA!
          onMarkerClick={(parking) => {
            setSelectedParking(parking);
            setSheetPosition('mid');
          }} 
        />
      </div>

      <motion.div
        variants={sheetVariants}
        initial="mid"
        animate={sheetPosition}
        drag="y"
        dragElastic={0.6}
        dragMomentum={false} 
        onDragEnd={handleDragEnd}
        dragListener={false} 
        dragControls={dragControls} 
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'white', zIndex: 1000, borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px', boxShadow: '0 -10px 25px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div 
          onPointerDown={(e) => dragControls.start(e, { snapToCursor: false })}
          style={{ display: 'flex', justifyContent: 'center', padding: '15px 0', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: '40px', height: '6px', backgroundColor: '#d1d5db', borderRadius: '10px' }} />
        </div>

        {selectedParking ? (
          <div style={{ padding: '0 20px 60vh 20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <button 
              onClick={() => setSelectedParking(null)} 
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', marginBottom: '15px', padding: 0, cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              ← Voltar para lista
            </button>
            
            <h2 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '1.5rem' }}>{selectedParking.name || selectedParking.properties?.name}</h2>
            
            <p style={{ margin: '0 0 20px 0', color: '#6b7280' }}>
              {userLocation ? `${selectedDistance}km de distância` : "Ligue o GPS para ver a distância"} • ⭐ 4.8
            </p>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Vagas Livres</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: (selectedParking.available_spots || selectedParking.properties?.available_spots) > 0 ? '#10b981' : '#ef4444' }}>
                  {selectedParking.available_spots || selectedParking.properties?.available_spots}
                </p>
              </div>
              <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6' }}>Preço/Hora</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#1d4ed8' }}>R$ 12</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '5px' }}>
                Qual veículo você vai estacionar?
              </label>
              <input
                type="text"
                placeholder="placa ou modelo"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 15px', borderRadius: '10px', 
                  border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button 
              disabled={(selectedParking.available_spots || selectedParking.properties?.available_spots || !vehicleName) === 0}
              onClick={() => {
                fetch('/api/parking/bookings/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    parking: selectedParking.id || selectedParking.properties?.id, 
                    user: 1, 
                    vehicle: vehicleName, // A variável nova!
                  })
                })
                .then(async response => {
                    if (response.ok) {
                      alert("✅ Vaga reservada com sucesso!");
                      setSelectedParking(null);
                      loadParkingData(); 
                    } else {
                      const errorData = await response.json();
                      console.error("Erro do Servidor:", errorData);
                      alert("❌ Erro: " + JSON.stringify(errorData));
                    }
                })
                .catch(error => console.error("Erro na requisição:", error));
              }}
              style={{
                width: '100%', padding: '16px', marginTop: '20px',
                backgroundColor: (selectedParking.available_spots || selectedParking.properties?.available_spots) === 0 ? '#d1d5db' : '#2563eb',
                color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem',
                fontWeight: 'bold', cursor: (selectedParking.available_spots || selectedParking.properties?.available_spots) === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
              }}
            >
              {(selectedParking.available_spots || selectedParking.properties?.available_spots) === 0 ? 'Estacionamento Lotado' : 'Reservar Agora →'}
            </button>
          </div>

        ) : (

          <>
            <div style={{ display: 'flex', gap: '10px', padding: '0 20px 10px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Distance ▾</span>
              <span style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Price ▾</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 60vh 20px' }}>
              {displayList.map((feature, index) => {
                const props = feature.properties || feature;
                const isFull = props.available_spots === 0;

                return (
                  // A CORREÇÃO DE OURO AQUI: Passamos a feature inteira, já com a distância embutida!
                  <div key={index} onClick={() => setSelectedParking(feature)} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
                    <img src={placeholderImage} alt="Parking" style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', marginRight: '16px' }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1f2937' }}>{props.name}</h3>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 'bold', color: isFull ? '#ef4444' : '#10b981' }}>
                        {isFull ? 'Lotado' : `${props.available_spots} vagas livres`}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>
                        {feature.distance ? `${feature.distance} km` : 'GPS Inativo'}
                      </span>
                      <div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937' }}>R$8</span><span style={{ fontSize: '0.8rem', color: '#6b7280' }}>/h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>

        )}
      </motion.div>
    </div>
  );
}