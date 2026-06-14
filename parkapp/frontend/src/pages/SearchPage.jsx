import { useState, useEffect } from 'react';
import ParkingMap from '../components/Map';
import { Search, LocateFixed, Car, Banknote, Navigation, ChevronLeft, Heart } from 'lucide-react'; 
import { motion, useDragControls } from 'framer-motion';
import api from '../services/api'; 

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
  const [userVehicles, setUserVehicles] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]); 
  const [sortBy, setSortBy] = useState('distance'); 

  const [sheetPosition, setSheetPosition] = useState('mid');
  const dragControls = useDragControls();

  const loadParkingData = () => {
    api.get('parking/')
      .then(response => setParkingData(response.data))
      .catch(error => console.error("Erro ao buscar vagas:", error));
  };

  const loadUserVehicles = () => {
    api.get('users/vehicles/')
      .then(response => setUserVehicles(response.data))
      .catch(error => console.error("Erro ao buscar veículos:", error));
  };

  const loadUserFavorites = () => {
    api.get('parking/favorites/')
      .then(response => setUserFavorites(response.data))
      .catch(error => console.error("Erro ao buscar favoritos:", error));
  };

  useEffect(() => {
    loadParkingData();
    loadUserVehicles();
    loadUserFavorites(); 
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
          alert("Não foi possível acessar seu GPS. Verifique as permissões.");
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

  const currentParkingId = selectedParking?.id || selectedParking?.properties?.id;
  const favoriteObj = userFavorites.find(f => f.parking === currentParkingId);
  const isFavorite = !!favoriteObj;

  const toggleFavorite = () => {
    if (isFavorite) {
      api.delete(`parking/favorites/${favoriteObj.id}/`).then(loadUserFavorites);
    } else {
      api.post('parking/favorites/', { parking: currentParkingId }).then(loadUserFavorites);
    }
  };

  const handleTraceRoute = (parking) => {
    let lat = null;
    let lon = null;

    if (parking?.geometry?.coordinates) {
      lat = parking.geometry.coordinates[1];
      lon = parking.geometry.coordinates[0];
    } 
    else if (parkingData?.features) {
      const targetId = parking.id || parking.properties?.id;
      const fullFeature = parkingData.features.find(f => f.id === targetId || f.properties?.id === targetId);
      if (fullFeature?.geometry?.coordinates) {
        lat = fullFeature.geometry.coordinates[1];
        lon = fullFeature.geometry.coordinates[0];
      }
    }

    if (lat && lon) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
      window.open(url, '_blank');
    } else {
      alert("Não foi possível determinar as coordenadas deste estacionamento.");
    }
  };

  const sheetVariants = { full: { y: '20%' }, mid: { y: '55%' }, min: { y: '85%' } };
  const placeholderImage = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200&q=80";

  let displayList = [];
  if (parkingData?.features) {
    let list = parkingData.features.map(feature => {
      let dist = 9999; 
      if (userLocation) {
        dist = calculateDistance(
          userLocation[0], userLocation[1], 
          feature.geometry.coordinates[1], feature.geometry.coordinates[0]
        );
      }
      const price = parseFloat(feature.properties?.price) || 0;
      return { ...feature, distance: parseFloat(dist), price: price };
    });

    if (sortBy === 'distance') {
      list = list.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price') {
      list = list.sort((a, b) => a.price - b.price);
    }

    displayList = list.slice(0, 5);
  }

  let selectedDistance = "--";
  if (selectedParking && userLocation) {
    if (selectedParking.distance) {
      selectedDistance = selectedParking.distance.toFixed(1);
    } 
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
    <div style={{ height: 'calc(100vh - 75px)', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#000000' }}>

      {/* BARRA DE PESQUISA FLUTUANTE (DARK) */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#a1a1aa' }} />
            <input
              type="text"
              placeholder="Para onde você vai?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '16px 20px 16px 48px', borderRadius: '100px', border: '1px solid #3f3f46', 
                backgroundColor: 'rgba(39, 39, 42, 0.9)', backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
                color: '#ffffff', fontWeight: '500'
              }}
            />
          </div>
          <button 
            type="button" 
            onClick={handleGetLocation}
            style={{ 
              width: '54px', height: '54px', backgroundColor: '#27272a', color: '#ffffff', border: '1px solid #3f3f46', borderRadius: '100px', 
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <LocateFixed size={22} />
          </button>
        </form>
      </div>

      <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, zIndex: 1 }}>
        <ParkingMap 
          parkingData={parkingData} 
          center={searchLocation} 
          userLocation={userLocation}
          onMarkerClick={(parking) => {
            setSelectedParking(parking);
            setSheetPosition('mid');
            loadUserVehicles(); 
            loadUserFavorites(); 
          }} 
        />
      </div>

      {/* BOTTOM SHEET (DARK UBER STYLE) */}
      <motion.div
        variants={sheetVariants}
        initial="mid"
        animate={sheetPosition}
        drag="y"
        dragElastic={0.4}
        dragMomentum={false} 
        onDragEnd={handleDragEnd}
        dragListener={false} 
        dragControls={dragControls} 
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: '#18181b', zIndex: 1000, borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px', borderTop: '1px solid #3f3f46', boxShadow: '0 -15px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', color: '#f4f4f5'
        }}
      >
        <div 
          onPointerDown={(e) => dragControls.start(e, { snapToCursor: false })}
          style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: '48px', height: '5px', backgroundColor: '#3f3f46', borderRadius: '10px' }} />
        </div>

        {selectedParking ? (
          /* ================= TELA DE DETALHES DA VAGA ================= */
          <div style={{ padding: '0 24px 60vh 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <button 
              onClick={() => setSelectedParking(null)} 
              style={{ 
                background: 'none', border: 'none', color: '#a1a1aa', fontWeight: '600', marginBottom: '20px', 
                padding: 0, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.95rem'
              }}
            >
              <ChevronLeft size={20} /> Voltar
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.6rem', fontWeight: '800', lineHeight: '1.2', flex: 1 }}>
                {selectedParking.name || selectedParking.properties?.name}
              </h2>
              <button 
                onClick={toggleFavorite}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 12px', display: 'flex', alignItems: 'center' }}
              >
                <Heart 
                  size={28} 
                  color={isFavorite ? "#ef4444" : "#52525b"} 
                  fill={isFavorite ? "#ef4444" : "transparent"} 
                  style={{ transition: 'all 0.2s' }}
                />
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', marginBottom: '24px', fontSize: '0.95rem' }}>
              <Navigation size={16} />
              <span>{userLocation ? `${selectedDistance}km de distância` : "GPS Inativo"}</span>
              <span style={{ color: '#3f3f46' }}>•</span>
              <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                ★ {selectedParking.average_rating || selectedParking.properties?.average_rating || '0.0'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              <div style={{ flex: 1, backgroundColor: '#27272a', padding: '16px', borderRadius: '16px', border: '1px solid #3f3f46' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', marginBottom: '8px' }}>
                  <Car size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Vagas Livres</span>
                </div>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: (selectedParking.available_spots || selectedParking.properties?.available_spots) > 0 ? '#34d399' : '#ef4444' }}>
                  {selectedParking.available_spots || selectedParking.properties?.available_spots}
                </p>
              </div>

              <div style={{ flex: 1, backgroundColor: '#27272a', padding: '16px', borderRadius: '16px', border: '1px solid #3f3f46' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', marginBottom: '8px' }}>
                  <Banknote size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Preço/Hora</span>
                </div>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>
                  <span style={{ fontSize: '1rem', verticalAlign: 'top', marginRight: '2px', color: '#a1a1aa' }}>R$</span>
                  {parseFloat(selectedParking.price || selectedParking.properties?.price || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '24px', backgroundColor: '#27272a', padding: '16px', borderRadius: '16px', border: '1px solid #3f3f46' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#a1a1aa', marginBottom: '8px' }}>
                Qual veículo você vai estacionar?
              </label>
              
              {userVehicles.length > 0 ? (
                <select
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  style={{ 
                    width: '100%', padding: '14px 16px', borderRadius: '10px', 
                    backgroundColor: '#18181b', border: '1px solid #3f3f46', outline: 'none', boxSizing: 'border-box',
                    fontSize: '1rem', color: '#ffffff'
                  }}
                >
                  <option value="">-- Selecione um veículo --</option>
                  {userVehicles.map(v => (
                    <option key={v.id} value={`${v.name} (${v.plate})`}>
                      {v.name} - {v.plate}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '700', padding: '4px' }}>
                  ⚠️ Nenhum veículo cadastrado. Vá até o seu Perfil para gerenciar.
                </div>
              )}
            </div>

            {/* BOTÃO DE ROTA GPS */}
            <button
              type="button"
              onClick={() => handleTraceRoute(selectedParking)}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#27272a', color: '#ffffff', border: '1px solid #3f3f46',
                borderRadius: '16px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginBottom: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
              }}
            >
              <Navigation size={18} />
              Traçar Rota no GPS
            </button>

            {/* SUPER BOTÃO DE RESERVA */}
            <button 
              disabled={(selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 || !vehicleName}
              onClick={() => {
                api.post('parking/bookings/', {
                    parking: selectedParking.id || selectedParking.properties?.id, 
                    vehicle: vehicleName, 
                })
                .then(response => {
                    alert("✅ Vaga reservada com sucesso!");
                    setSelectedParking(null);
                    setVehicleName(""); 
                    loadParkingData(); 
                })
                .catch(error => {
                    console.error("Erro na requisição:", error);
                    const msgErro = error.response?.data?.error || error.response?.data?.detail || "Erro ao reservar. Faça login novamente.";
                    alert("❌ Erro: " + msgErro);
                });
              }}
              style={{
                width: '100%', padding: '18px',
                backgroundColor: (selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 || !vehicleName ? '#27272a' : '#ffffff',
                color: (selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 || !vehicleName ? '#52525b' : '#000000', 
                border: 'none', borderRadius: '16px', fontSize: '1.1rem',
                fontWeight: '800', cursor: (selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 || !vehicleName ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {(selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 ? 'Estacionamento Lotado' : 'Confirmar Reserva'}
            </button>
          </div>

        ) : (
          /* ================= LISTA DE ESTACIONAMENTOS ================= */
          <>
            <div style={{ display: 'flex', gap: '12px', padding: '0 24px 16px 24px', borderBottom: '1px solid #27272a' }}>
              <button 
                onClick={() => setSortBy('distance')}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                  backgroundColor: sortBy === 'distance' ? '#ffffff' : '#27272a', 
                  color: sortBy === 'distance' ? '#000000' : '#a1a1aa', transition: 'all 0.2s'
                }}
              >
                Distância {sortBy === 'distance' ? '↓' : ''}
              </button>
              <button 
                onClick={() => setSortBy('price')}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                  backgroundColor: sortBy === 'price' ? '#ffffff' : '#27272a', 
                  color: sortBy === 'price' ? '#000000' : '#a1a1aa', transition: 'all 0.2s'
                }}
              >
                Preço {sortBy === 'price' ? '↓' : ''}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px 60vh 24px' }}>
              {displayList.map((feature, index) => {
                const props = feature.properties || feature;
                const isFull = props.available_spots === 0;

                return (
                  <motion.div 
                    key={index} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedParking(feature)} 
                    style={{ 
                      display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #27272a', 
                      cursor: 'pointer', backgroundColor: 'transparent'
                    }}
                  >
                    <div style={{ position: 'relative', marginRight: '16px' }}>
                      <img src={placeholderImage} alt="Parking" style={{ width: '75px', height: '75px', borderRadius: '16px', objectFit: 'cover', filter: isFull ? 'grayscale(100%) opacity(0.5)' : 'none' }} />
                      {isFull && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 8px', backgroundColor: '#ef4444', borderRadius: '8px' }}>LOTADO</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#ffffff', fontWeight: '700' }}>{props.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700',
                          backgroundColor: isFull ? '#7f1d1d' : '#064e3b', color: isFull ? '#fca5a5' : '#34d399' 
                        }}>
                          {isFull ? '0 vagas' : `${props.available_spots} livres`}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '500' }}>
                          {userLocation ? `${feature.distance.toFixed(1)} km` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ color: '#ffffff' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', marginRight: '2px', color: '#a1a1aa' }}>R$</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>{parseFloat(feature.price).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: '600' }}>por hora</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}