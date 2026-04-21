import { useState, useEffect } from 'react';
import { CircleParking, Ticket, Clock, MapPin } from 'lucide-react';

export default function Bookings() {
  const [tab, setTab] = useState('ativas'); 
  const [bookingsHistory, setBookingsHistory] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/parking/bookings/')
      .then(response => response.json())
      .then(data => {
        console.log("Dados do Bookings:", data); // Nosso detetive
        
        const arrayDeReservas = Array.isArray(data) ? data : data.results;

        if (!arrayDeReservas) return;

        const actives = arrayDeReservas.filter(b => b.status === 'ACTIVE');
        const past = arrayDeReservas.filter(b => b.status !== 'ACTIVE');
        
        if (actives.length > 0) setActiveBooking(actives[0]);
        setBookingsHistory(past);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro:", error);
        setIsLoading(false);
      });
  }, []);

  const handleCheckout = (bookingId) => {
  fetch(`/api/parking/bookings/${bookingId}/checkout/`, {
    method: 'POST',
  })
    .then(async (response) => {
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Reserva encerrada! Valor total: R$ ${result.total_price}`);
        // RECARREGA OS DADOS: Isso vai mover a reserva para a aba "Histórico" na hora
        window.location.reload(); 
      } else {
        alert("❌ Erro ao encerrar reserva.");
      }
    })
    .catch((error) => console.error("Erro no checkout:", error));
};

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '1.5rem', fontWeight: '700' }}>
        Minhas Reservas
      </h2>

      {/* INTERRUPTOR (Toggle) */}
      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setTab('ativas')}
          style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: tab === 'ativas' ? 'white' : 'transparent', color: tab === 'ativas' ? '#2563eb' : '#64748b', fontWeight: '600', boxShadow: tab === 'ativas' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Ativas
        </button>
        <button 
          onClick={() => setTab('historico')}
          style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: tab === 'historico' ? 'white' : 'transparent', color: tab === 'historico' ? '#2563eb' : '#64748b', fontWeight: '600', boxShadow: tab === 'historico' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Histórico
        </button>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>Carregando dados...</p>
      ) : (
        <>
          {tab === 'ativas' ? (
            <section>
              {activeBooking ? (
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '2px solid #dbeafe', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        EM ANDAMENTO
                      </span>
                      <h3 style={{ margin: '10px 0 5px 0', fontSize: '1.2rem', color: '#1f2937' }}>{activeBooking.parking_name}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Placa</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#1f2937' }}>{activeBooking.vehicle_plate}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Entrada</p>
                      <p style={{ margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {formatTime(activeBooking.start_time)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Botão para encerrar a reserva (Futuro Checkout) */}
                  <button onClick={() => handleCheckout(activeBooking.id)} style={{ width: '100%', marginTop: '20px', padding: '14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Encerrar Reserva
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <Ticket size={48} style={{ opacity: 0.3, marginBottom: '15px', margin: '0 auto' }} />
                  <p>Você não possui reservas ativas.</p>
                </div>
              )}
            </section>
          ) : (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookingsHistory.length > 0 ? bookingsHistory.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f1f5f9', color: '#3b82f6', padding: '10px', borderRadius: '12px' }}>
                      <CircleParking size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', color: '#1f2937' }}>{item.parking_name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(item.start_time).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: '#1f2937' }}>R$ {item.price_paid || '0,00'}</div>
                </div>
              )) : (
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>Nenhum histórico encontrado.</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}