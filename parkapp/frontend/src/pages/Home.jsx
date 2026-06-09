import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CircleParking, Clock } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [activeBooking, setActiveBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/parking/bookings/')
      .then(response => response.json())
      .then(data => {
        console.log("Dados da Home:", data); // Nosso detetive no console (F12)
        
        // A mágica anti-paginação: garante que sempre teremos uma array
        const arrayDeReservas = Array.isArray(data) ? data : data.results;

        if (!arrayDeReservas) {
          console.error("Formato inesperado recebido:", data);
          return;
        }

        const actives = arrayDeReservas.filter(b => b.status === 'ACTIVE');
        const past = arrayDeReservas.filter(b => b.status !== 'ACTIVE');
        
        if (actives.length > 0) {
          setActiveBooking(actives[0]);
        }
        setHistory(past.slice(0, 3));
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar Home:", error);
        setIsLoading(false);
      });
  }, []);

  // Formatador de data simples
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', marginTop: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>Olá, Henrique</h1>
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: '1.5rem' }}>🔔</span>
          <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #f9fafb' }}></span>
        </div>
      </div>

      {/* Botão Gigante de Busca */}
      <button 
        onClick={() => navigate('/search')}
        style={{
          width: '100%', padding: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', cursor: 'pointer', marginBottom: '30px'
        }}
      >
        <Search size={20} /> BUSCAR VAGAS
      </button>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Sincronizando dados...</p>
      ) : (
        <>
          {/* Sessão: Reserva Ativa */}
          <h2 style={{ fontSize: '1.1rem', color: '#1f2937', marginBottom: '15px' }}>Active Booking</h2>
          
          {activeBooking ? (
            <div style={{
              backgroundColor: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1f2937' }}>{activeBooking.parking_name}</h3>
                  <p style={{ margin: 0, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: '600' }}>
                    <Clock size={16} /> Entrada: {formatTime(activeBooking.start_time)}
                  </p>
                </div>
                <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#6b7280', textAlign: 'center' }}>Placa</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>{activeBooking.vehicle}</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                Tarifa base: <span style={{ fontWeight: 'bold', color: '#1f2937' }}>R$ 12,00/h</span>
              </p>
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '30px' }}>Nenhuma reserva em andamento.</p>
          )}

          {/* Sessão: Histórico Recente */}
          <h2 style={{ fontSize: '1.1rem', color: '#1f2937', marginBottom: '15px' }}>Histórico Recente</h2>
          
          {history.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <CircleParking size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1f2937' }}>{item.parking_name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(item.start_time).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#1f2937' }}>R$ {item.price_paid || '0,00'}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Nenhum histórico encontrado.</p>
          )}
        </>
      )}
    </div>
  );
}