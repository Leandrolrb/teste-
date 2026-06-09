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

  // --- LÓGICA DE FAVORITAR ---
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

  // --- NOVA FUNÇÃO DE GPS (DEEP LINK) ---
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
      // URL oficial do Google Maps para traçar rotas!
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
    <div style={{ height: 'calc(100vh - 70px)', width: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>

      {/* BARRA DE PESQUISA FLUTUANTE */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Para onde você vai?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '16px 20px 16px 48px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.4)', 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
                color: '#1e293b', fontWeight: '500'
              }}
            />
          </div>
          <button 
            type="button" 
            onClick={handleGetLocation}
            style={{ 
              width: '54px', height: '54px', backgroundColor: 'white', color: '#2563eb', border: 'none', borderRadius: '100px', 
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* BOTTOM SHEET */}
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
          backgroundColor: '#ffffff', zIndex: 1000, borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px', boxShadow: '0 -15px 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div 
          onPointerDown={(e) => dragControls.start(e, { snapToCursor: false })}
          style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', cursor: 'grab', touchAction: 'none' }}
        >
          <div style={{ width: '48px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '10px' }} />
        </div>

        {selectedParking ? (
          /* ================= TELA DE DETALHES DA VAGA ================= */
          <div style={{ padding: '0 24px 60vh 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <button 
              onClick={() => setSelectedParking(null)} 
              style={{ 
                background: 'none', border: 'none', color: '#64748b', fontWeight: '600', marginBottom: '20px', 
                padding: 0, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.95rem'
              }}
            >
              <ChevronLeft size={20} /> Voltar
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', lineHeight: '1.2', flex: 1 }}>
                {selectedParking.name || selectedParking.properties?.name}
              </h2>
              <button 
                onClick={toggleFavorite}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 12px', display: 'flex', alignItems: 'center' }}
              >
                <Heart 
                  size={28} 
                  color={isFavorite ? "#ef4444" : "#cbd5e1"} 
                  fill={isFavorite ? "#ef4444" : "transparent"} 
                  style={{ transition: 'all 0.2s' }}
                />
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '24px', fontSize: '0.95rem' }}>
              <Navigation size={16} />
              <span>{userLocation ? `${selectedDistance}km de distância` : "GPS Inativo"}</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                ★ {selectedParking.average_rating || selectedParking.properties?.average_rating || '0.0'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '8px' }}>
                  <Car size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Vagas Livres</span>
                </div>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: (selectedParking.available_spots || selectedParking.properties?.available_spots) > 0 ? '#10b981' : '#ef4444' }}>
                  {selectedParking.available_spots || selectedParking.properties?.available_spots}
                </p>
              </div>

              <div style={{ flex: 1, backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '8px' }}>
                  <Banknote size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Preço/Hora</span>
                </div>
                <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1d4ed8' }}>
                  <span style={{ fontSize: '1rem', verticalAlign: 'top', marginRight: '2px' }}>R$</span>
                  {parseFloat(selectedParking.price || selectedParking.properties?.price || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                Qual veículo você vai estacionar?
              </label>
              
              {userVehicles.length > 0 ? (
                <select
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  style={{ 
                    width: '100%', padding: '14px 16px', borderRadius: '10px', 
                    backgroundColor: 'white', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box',
                    fontSize: '1rem', color: '#1e293b'
                  }}
                >
                  <option value="">-- Selecione um veículo cadastrado --</option>
                  {userVehicles.map(v => (
                    <option key={v.id} value={`${v.name} (${v.plate})`}>
                      {v.name} - {v.plate}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '700', padding: '4px' }}>
                  ⚠️ Nenhum veículo cadastrado. Vá até o seu Perfil para gerenciar sua frota antes de fazer uma reserva.
                </div>
              )}
            </div>

            {/* --- BOTÃO DE NAVEGAÇÃO GPS EXTERNA --- */}
            <button
              type="button"
              onClick={() => handleTraceRoute(selectedParking)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'white',
                color: '#2563eb',
                border: '2px solid #2563eb',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f5ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <Navigation size={18} />
              Traçar Rota no GPS
            </button>

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
                backgroundColor: (selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 || !vehicleName ? '#cbd5e1' : '#2563eb',
                color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem',
                fontWeight: '700', cursor: (selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 || !vehicleName ? 'not-allowed' : 'pointer',
                boxShadow: (selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 || !vehicleName ? 'none' : '0 10px 25px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {(selectedParking.available_spots ?? selectedParking.properties?.available_spots) <= 0 ? 'Estacionamento Lotado' : 'Confirmar Reserva'}
            </button>
          </div>

        ) : (
          /* ================= LISTA DE ESTACIONAMENTOS ================= */
          <>
            <div style={{ display: 'flex', gap: '12px', padding: '0 24px 16px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <button 
                onClick={() => setSortBy('distance')}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                  backgroundColor: sortBy === 'distance' ? '#1e293b' : '#f1f5f9', 
                  color: sortBy === 'distance' ? 'white' : '#64748b', transition: 'all 0.2s'
                }}
              >
                Distância {sortBy === 'distance' ? '↓' : ''}
              </button>
              <button 
                onClick={() => setSortBy('price')}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                  backgroundColor: sortBy === 'price' ? '#1e293b' : '#f1f5f9', 
                  color: sortBy === 'price' ? 'white' : '#64748b', transition: 'all 0.2s'
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
                      display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9', 
                      cursor: 'pointer', backgroundColor: 'transparent'
                    }}
                  >
                    <div style={{ position: 'relative', marginRight: '16px' }}>
                      <img src={placeholderImage} alt="Parking" style={{ width: '75px', height: '75px', borderRadius: '16px', objectFit: 'cover', filter: isFull ? 'grayscale(100%)' : 'none' }} />
                      {isFull && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', backgroundColor: '#ef4444', borderRadius: '8px' }}>LOTADO</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>{props.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700',
                          backgroundColor: isFull ? '#fee2e2' : '#d1fae5', color: isFull ? '#ef4444' : '#10b981' 
                        }}>
                          {isFull ? '0 vagas' : `${props.available_spots} livres`}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                          {userLocation ? `${feature.distance.toFixed(1)} km` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ color: '#0f172a' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', marginRight: '2px' }}>R$</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>{parseFloat(feature.price).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>por hora</span>
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