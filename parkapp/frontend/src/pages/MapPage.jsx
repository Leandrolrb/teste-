import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParkingMap from '../components/Map';

export default function MapPage() {
  const navigate = useNavigate();
  // Estado que controla qual vaga foi clicada (null = nenhuma)
  const [selectedParking, setSelectedParking] = useState(null);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      
      {/* Botão flutuante arredondado (Estilo Mobile) */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          width: '45px',
          height: '45px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '50%', // Deixa redondo
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.2rem'
        }}
      >
        ←
      </button>

      {/* O Mapa (passando a função que atualiza o estado quando clica no pino) */}
      <ParkingMap onMarkerClick={setSelectedParking} />

      {/* A MÁGICA: A Gaveta Inferior (Bottom Sheet) */}
      {selectedParking && (
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
          backgroundColor: 'white',
          zIndex: 1000, // Fica por cima do mapa
          borderTopLeftRadius: '20px', // Bordas arredondadas no topo
          borderTopRightRadius: '20px',
          padding: '20px',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
          boxSizing: 'border-box',
          // Animação suave para deslizar de baixo para cima
          animation: 'slideUp 0.3s ease-out' 
        }}>
          
          {/* Botãozinho de fechar a gaveta no canto direito */}
          <button 
            onClick={() => setSelectedParking(null)}
            style={{ float: 'right', border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>

          <h2 style={{ marginTop: '0', color: '#2c3e50' }}>{selectedParking.name}</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>Status: <strong>{selectedParking.status}</strong></span>
            <span style={{ fontSize: '1.1rem', color: '#2c3e50', fontWeight: 'bold' }}>
              {selectedParking.available_spots} / {selectedParking.total_capacity} Vagas
            </span>
          </div>

          <button style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Traçar Rota 
          </button>
        </div>
      )}

      {/* CSS para a animação da gaveta */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}