import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Ticket, Car, Star, Navigation, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Home() {
    const [userData, setUserData] = useState(null);
    const [activeBooking, setActiveBooking] = useState(null);
    const [recentHistory, setRecentHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            api.get('users/me/'),
            api.get('parking/bookings/')
        ])
        .then(([userRes, bookingsRes]) => {
            setUserData(userRes.data);

            const data = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.results;
            if (data) {
                const actives = data.filter(b => b.status === 'ACTIVE' || b.status === 'RESERVED');
                const past = data.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
                
                if (actives.length > 0) setActiveBooking(actives[0]);
                setRecentHistory(past.slice(0, 3)); 
            }
            setIsLoading(false);
        })
        .catch(error => {
            console.error("Erro ao carregar a Home:", error);
            setIsLoading(false);
        });
    }, []);

    // Proteção contra datas inválidas (1969)
    const formatSafeDate = (isoString) => {
        if (!isoString) return 'Data indisponível';
        const date = new Date(isoString);
        if (date.getFullYear() < 2020) return 'Data indisponível';
        return date.toLocaleDateString('pt-BR');
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (date.getFullYear() < 2020) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#a1a1aa', fontWeight: '500' }}>Carregando ParkApp...</p>
            </div>
        );
    }

    // Capitaliza a primeira letra do nome (ex: "henrique" -> "Henrique")
    const firstName = userData?.first_name 
        ? userData.first_name.charAt(0).toUpperCase() + userData.first_name.slice(1) 
        : 'Motorista';
    const inicial = firstName.charAt(0);

    return (
        <div style={{ padding: '24px 20px', fontFamily: 'sans-serif', backgroundColor: '#18181b', minHeight: '100vh', paddingBottom: '100px', color: '#f4f4f5' }}>
            
            {/* CABEÇALHO DINÂMICO */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', marginTop: '10px' }}>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#a1a1aa', fontWeight: '600' }}>
                        Pronto para sair?
                    </p>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>
                        Olá, {firstName}
                    </h1>
                </div>
                {/* Avatar do Usuário */}
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800', color: '#3b82f6', border: '2px solid #3f3f46' }}>
                    {inicial}
                </div>
            </motion.div>

            {/* BARRA DE BUSCA (Estilo Pílula Flutuante) */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <button 
                    onClick={() => navigate('/search')} 
                    style={{
                        width: '100%', padding: '18px 24px', borderRadius: '100px', backgroundColor: '#27272a',
                        border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', gap: '16px',
                        cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                    }}
                >
                    <Search size={22} color="#a1a1aa" />
                    <span style={{ fontSize: '1.1rem', fontWeight: '500', color: '#a1a1aa' }}>Para onde vamos hoje?</span>
                </button>
            </motion.div>

            {/* AÇÕES RÁPIDAS (Novo elemento de layout para quebrar a tela) */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                <button onClick={() => navigate('/search')} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 16px', borderRadius: '16px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                    <Navigation size={18} /> Perto de mim
                </button>
                <button onClick={() => navigate('/profile')} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#27272a', color: '#f4f4f5', padding: '12px 16px', borderRadius: '16px', border: '1px solid #3f3f46', fontWeight: '600', cursor: 'pointer' }}>
                    <Star size={18} color="#fbbf24" /> Favoritos
                </button>
                <button onClick={() => navigate('/bookings')} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#27272a', color: '#f4f4f5', padding: '12px 16px', borderRadius: '16px', border: '1px solid #3f3f46', fontWeight: '600', cursor: 'pointer' }}>
                    <Clock size={18} /> Reservas
                </button>
            </div>

            {/* SEÇÃO DE RESERVA ATIVA */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>Status Atual</h3>
                
                {activeBooking ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        style={{ backgroundColor: '#27272a', borderRadius: '24px', padding: '24px', border: '1px solid #3f3f46', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
                        
                        {/* Brilho de fundo condicional */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: activeBooking.status === 'RESERVED' ? '#3b82f6' : '#10b981' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: '800' }}>
                                    {activeBooking.parking_name || activeBooking.parking?.name}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '0.9rem' }}>
                                    <Car size={16} /> {activeBooking.vehicle || 'Veículo não informado'}
                                </div>
                            </div>
                            <span style={{ backgroundColor: activeBooking.status === 'RESERVED' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: activeBooking.status === 'RESERVED' ? '#60a5fa' : '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                                {activeBooking.status === 'RESERVED' ? 'A CAMINHO' : 'ESTACIONADO'}
                            </span>
                        </div>

                        <button 
                            onClick={() => navigate('/bookings')} 
                            style={{ width: '100%', padding: '16px', backgroundColor: '#3f3f46', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                            Acessar Ticket <ArrowRight size={18} />
                        </button>
                    </motion.div>
                ) : (
                    <div style={{ borderRadius: '24px', padding: '32px 20px', border: '2px dashed #3f3f46', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <Ticket size={32} color="#52525b" style={{ marginBottom: '12px' }} />
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600', color: '#d4d4d8' }}>Nenhuma vaga em uso</h4>
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>Suas reservas ativas aparecerão aqui.</p>
                    </div>
                )}
            </div>

            {/* HISTÓRICO - FORMATO DE CARDS SEPARADOS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>Últimos Locais</h3>
                <button onClick={() => navigate('/bookings')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                    Ver tudo
                </button>
            </div>

            {recentHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentHistory.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (index * 0.1) }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#27272a', padding: '16px', borderRadius: '20px', border: '1px solid #3f3f46' }}>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ backgroundColor: '#18181b', padding: '12px', borderRadius: '14px', border: '1px solid #3f3f46' }}>
                                    <MapPin size={20} color="#a1a1aa" />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '700', color: '#f4f4f5' }}>
                                        {item.parking_name || (item.parking && item.parking.name)}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '500' }}>
                                        {formatSafeDate(item.start_time)}
                                    </p>
                                </div>
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>
                                R$ {item.price_paid ? parseFloat(item.price_paid).toFixed(2).replace('.', ',') : '0,00'}
                            </div>
                            
                        </motion.div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
                    Você ainda não tem histórico de estacionamento.
                </p>
            )}

        </div>
    );
}