import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', color: '#2c3e50', margin: '0 0 10px 0' }}>
          ParkApp
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '40px' }}>
          Chega de rodar quarteirões perdendo tempo. Encontre vagas disponíveis em tempo real perto de você.
        </p>
        
        <button 
          onClick={() => navigate('/mapa')}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s'
          }}
        >
          Encontrar Estacionamentos 
        </button>
      </div>
    </div>
  );
}