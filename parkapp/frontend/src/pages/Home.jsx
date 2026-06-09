import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Ticket, CircleParking, ChevronRight, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Home() {
    const [userData, setUserData] = useState(null);
    const [activeBooking, setActiveBooking] = useState(null);
    const [recentHistory, setRecentHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Busca os dados do utilizador logado e as reservas ao mesmo tempo
        Promise.all([
            api.get('users/me/'),
            api.get('parking/bookings/')
        ])
        .then(([userRes, bookingsRes]) => {
            // 1. Seta o utilizador
            setUserData(userRes.data);

            // 2. Separa as reservas ativas e o histórico recente
            const data = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.results;
            if (data) {
                const actives = data.filter(b => b.status === 'ACTIVE' || b.status === 'RESERVED');
                const past = data.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
                
                if (actives.length > 0) setActiveBooking(actives[0]);
                // Pega apenas as 3 últimas para não poluir a Home
                setRecentHistory(past.slice(0, 3)); 
            }
            setIsLoading(false);
        })
        .catch(error => {
            console.error("Erro ao carregar a Home:", error);
            setIsLoading(false);
        });
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#94a3b8', fontWeight: '500' }}>Carregando ParkApp...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 20px', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '90px' }}>
            
            {/* CABEÇALHO COM O NOME REAL */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px', marginTop: '10px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#64748b', fontWeight: '600' }}>
                    Bem-vindo de volta 👋
                </p>
                <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    {userData?.first_name ? `Olá, ${userData.first_name}` : 'Olá, Motorista'}
                </h1>
            </motion.div>

            {/* SUPER BOTÃO DE BUSCA */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <button 
                    onClick={() => navigate('/search')} // Ajuste a rota se necessário
                    style={{
                        width: '100%', padding: '20px', borderRadius: '24px', backgroundColor: '#2563eb',
                        color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)', marginBottom: '32px', transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px', display: 'flex' }}>
                            <Search size={24} color="white" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800' }}>Buscar Vagas</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#bfdbfe', fontWeight: '500' }}>Encontre o melhor lugar agora</p>
                        </div>
                    </div>
                    <ChevronRight size={24} color="#bfdbfe" />
                </button>
            </motion.div>

            {/* SEÇÃO DE RESERVA ATIVA */}
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>Em Andamento</h3>
            
            {activeBooking ? (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    style={{ backgroundColor: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ backgroundColor: activeBooking.status === 'RESERVED' ? '#dbeafe' : '#dcfce7', color: activeBooking.status === 'RESERVED' ? '#2563eb' : '#16a34a', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                            ● {activeBooking.status === 'RESERVED' ? 'A CAMINHO' : 'ESTACIONADO'}
                        </span>
                        {activeBooking.status !== 'RESERVED' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
                                <Clock size={14} /> {formatTime(activeBooking.start_time)}
                            </div>
                        )}
                    </div>
                    
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>
                        {activeBooking.parking_name || activeBooking.parking?.name}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '500' }}>
                        <Car size={16} /> {activeBooking.vehicle || 'Veículo não informado'}
                    </div>

                    <button 
                        onClick={() => navigate('/bookings')} // Vai para a aba de reservas
                        style={{ width: '100%', padding: '14px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                        Ver Detalhes do Ticket
                    </button>
                </motion.div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '30px 20px', textAlign: 'center', border: '1px dashed #cbd5e1', marginBottom: '32px' }}>
                    <Ticket size={32} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Nenhuma reserva ativa no momento.</p>
                </div>
            )}

            {/* SEÇÃO DE HISTÓRICO RECENTE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>Histórico Recente</h3>
                <button onClick={() => navigate('/bookings')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
                    Ver tudo
                </button>
            </div>

            {recentHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentHistory.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (index * 0.1) }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '10px', borderRadius: '12px' }}>
                                    <CircleParking size={20} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>{item.parking_name || (item.parking && item.parking.name)}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                                        {new Date(item.start_time).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>
                                R$ {item.price_paid ? parseFloat(item.price_paid).toFixed(2).replace('.', ',') : '0,00'}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
                    Você ainda não fez nenhum estacionamento.
                </p>
            )}

        </div>
    );
}