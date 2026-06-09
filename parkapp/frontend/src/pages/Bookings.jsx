import { useState, useEffect } from 'react';
import { CircleParking, Ticket, Clock, Car, MapPin, Calendar, ChevronLeft, ChevronRight, QrCode, Star } from 'lucide-react'; // <-- Importado o Star aqui
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api'; 

export default function Bookings() {
  const [tab, setTab] = useState('ativas'); 
  const [bookingsHistory, setBookingsHistory] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false); 

  // ESTADOS PARA O MODAL DE AVALIAÇÃO
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSendingReview, setIsSendingReview] = useState(false);

  // ESTADOS DA PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const carregarReservas = () => {
    api.get('parking/bookings/')
      .then(response => {
        const data = response.data;
        const arrayDeReservas = Array.isArray(data) ? data : data.results;

        if (!arrayDeReservas) return;

        const actives = arrayDeReservas.filter(b => b.status === 'ACTIVE' || b.status === 'RESERVED');
        const past = arrayDeReservas.filter(b => b.status !== 'ACTIVE' && b.status !== 'RESERVED');
        
        if (actives.length > 0) setActiveBooking(actives[0]);
        else setActiveBooking(null);

        setBookingsHistory(past);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar reservas:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const handleCheckIn = async (token) => {
    setIsCheckingIn(true);
    try {
      const response = await api.post('parking/bookings/checkin/', { checkin_token: token });
      alert(response.data.mensagem || "Check-in realizado com sucesso!");
      carregarReservas(); 
    } catch (error) {
      alert(error.response?.data?.erro || "Erro ao realizar o check-in na cancela.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckout = async (bookingId) => {
    try {
      const response = await api.post(`parking/bookings/${bookingId}/checkout/`);
      alert(`✅ Reserva encerrada! Valor total: R$ ${parseFloat(response.data.total_price).toFixed(2).replace('.', ',')}`);
      
      carregarReservas(); // Recarrega os dados para atualizar o histórico
      
      // --- CAPTURA O ID DA RESERVA E ABRE O MODAL DE AVALIAÇÃO ---
      setReviewBookingId(bookingId);
      setShowReviewModal(true);
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert("❌ Erro ao encerrar reserva.");
    }
  };

  const handleSendReview = async () => {
    setIsSendingReview(true);
    try {
      await api.post('parking/reviews/', {
        booking: reviewBookingId,
        rating: rating,
        comment: comment
      });
      alert("✅ Avaliação enviada com sucesso!");
      setShowReviewModal(false);
      setComment('');
      setRating(5);
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao enviar a avaliação.");
    } finally {
      setIsSendingReview(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryItems = bookingsHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookingsHistory.length / itemsPerPage);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '24px 20px', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '90px', position: 'relative' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '24px', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
        Minhas Reservas
      </h2>

      {/* INTERRUPTOR */}
      <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '16px', marginBottom: '28px' }}>
        <button 
          onClick={() => handleTabChange('ativas')}
          style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', backgroundColor: tab === 'ativas' ? 'white' : 'transparent', color: tab === 'ativas' ? '#0f172a' : '#64748b', fontWeight: '700', fontSize: '0.95rem', boxShadow: tab === 'ativas' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          Ativas
        </button>
        <button 
          onClick={() => handleTabChange('historico')}
          style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '12px', backgroundColor: tab === 'historico' ? 'white' : 'transparent', color: tab === 'historico' ? '#0f172a' : '#64748b', fontWeight: '700', fontSize: '0.95rem', boxShadow: tab === 'historico' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          Histórico
        </button>
      </div>

      {isLoading ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', fontWeight: '500' }}>
          Carregando dados...
        </motion.p>
      ) : (
        <AnimatePresence mode="wait">
          {tab === 'ativas' ? (
            <motion.section key="ativas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeBooking ? (
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      {activeBooking.status === 'RESERVED' ? (
                         <span style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#2563eb', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '12px' }}>
                         ● A CAMINHO
                       </span>
                      ) : (
                        <span style={{ display: 'inline-block', backgroundColor: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '12px' }}>
                          ● ESTACIONADO
                        </span>
                      )}
                      
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: '800', lineHeight: '1.2' }}>
                        {activeBooking.parking_name || activeBooking.parking?.name}
                      </h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                        <Car size={16} /> Veículo: {activeBooking.vehicle || 'Não informado'}
                      </div>
                    </div>
                  </div>

                  {activeBooking.status === 'RESERVED' ? (
                    <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px dashed #bfdbfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                          <QrCode size={40} style={{ color: '#3b82f6' }} />
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Apresente na cancela:</p>
                        
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '2.5rem', fontWeight: '900', color: '#1e3a8a', letterSpacing: '2px' }}>
                            {activeBooking.checkin_token}
                        </h2>

                        <button 
                            onClick={() => handleCheckIn(activeBooking.checkin_token)}
                            disabled={isCheckingIn}
                            style={{ width: '100%', padding: '16px', backgroundColor: isCheckingIn ? '#93c5fd' : '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.05rem', fontWeight: '800', cursor: isCheckingIn ? 'not-allowed' : 'pointer', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)', transition: 'background-color 0.2s' }}
                        >
                            {isCheckingIn ? 'Validando...' : 'Confirmar Chegada'}
                        </button>
                    </div>
                  ) : (
                    <>
                        <div style={{ display: 'flex', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
                            <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Status GPS</p>
                            <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={16} style={{ color: '#10b981' }} /> Localizado
                            </p>
                            </div>
                            <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
                            <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Entrada</p>
                            <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} style={{ color: '#3b82f6' }} /> {formatTime(activeBooking.start_time)}
                            </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleCheckout(activeBooking.id)} 
                            style={{ width: '100%', padding: '16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.05rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)', transition: 'background-color 0.2s' }}
                        >
                            Encerrar Reserva
                        </button>
                    </>
                  )}

                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <Ticket size={40} style={{ color: '#94a3b8' }} />
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>Nenhuma reserva em andamento</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Suas reservas e vagas ativas aparecerão aqui.</p>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section key="historico" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentHistoryItems.length > 0 ? currentHistoryItems.map((item) => (
                <motion.div key={item.id} whileTap={{ scale: 0.98 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '12px', borderRadius: '16px' }}>
                      <CircleParking size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>{item.parking_name || (item.parking && item.parking.name)}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                        <Calendar size={14} /> {new Date(item.start_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#0f172a' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', marginRight: '2px' }}>R$</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{item.price_paid ? parseFloat(item.price_paid).toFixed(2).replace('.', ',') : '0,00'}</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>Nenhum histórico encontrado.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 0' }}>
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: 'none', backgroundColor: currentPage === 1 ? '#e2e8f0' : 'white', color: currentPage === 1 ? '#94a3b8' : '#0f172a', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.9rem', boxShadow: currentPage === 1 ? 'none' : '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <ChevronLeft size={18} /> Anterior
                  </button>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', backgroundColor: '#e2e8f0', padding: '6px 12px', borderRadius: '100px' }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: 'none', backgroundColor: currentPage === totalPages ? '#e2e8f0' : 'white', color: currentPage === totalPages ? '#94a3b8' : '#0f172a', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.9rem', boxShadow: currentPage === totalPages ? 'none' : '0 2px 10px rgba(0,0,0,0.05)' }}>
                    Próxima <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      )}

      {/* --- MODAL DA INTERFACE DE AVALIAÇÃO --- */}
      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>Como foi a sua estadia?</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Sua avaliação ajuda a comunidade do ParkApp</p>
            
            {/* ESTRELAS INTERATIVAS */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Star size={32} color="#f59e0b" fill={star <= rating ? "#f59e0b" : "transparent"} style={{ transition: 'transform 0.1s' }} />
                </button>
              ))}
            </div>

            {/* CAMPO DE TEXTO DO COMENTÁRIO
            <textarea 
              placeholder="Deixe um comentário sobre o local (opcional)..." 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box', height: '90px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', fontFamily: 'sans-serif', resize: 'none', marginBottom: '20px' }}
            /> */}

            {/* BOTÕES DE AÇÃO */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '14px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '14px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>
                Pular
              </button>
              <button onClick={handleSendReview} disabled={isSendingReview} style={{ flex: 1, padding: '14px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                {isSendingReview ? 'Enviando...' : 'Avaliar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}