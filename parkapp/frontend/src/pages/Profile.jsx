import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, LogOut, Shield, ChevronRight, Wallet, Car, Trophy, Edit3 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import VehicleManager from '../components/VehicleManager';
import FavoriteManager from '../components/FavoriteManager';

export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '', password: '' });
    const [isSaving, setIsSaving] = useState(false);

    const [stats, setStats] = useState({ total_gasto: 0, total_usos: 0, estacionamento_favorito: '-' });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        api.get('users/me/')
            .then(response => {
                setUserData(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao carregar perfil:", error);
                setIsLoading(false);
                if (error.response && error.response.status === 401) {
                    handleLogout();
                }
            });

        api.get('parking/stats/')
            .then(response => {
                setStats(response.data);
                setIsLoadingStats(false);
            })
            .catch(error => {
                console.error("Erro ao buscar stats", error);
                setIsLoadingStats(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const openEditModal = () => {
        setEditForm({
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            phone: userData?.phone || '',
            password: '' 
        });
        setShowEditModal(true);
    };

    const handleSaveProfile = () => {
        setIsSaving(true);
        api.put('users/me/', editForm)
            .then(res => {
                alert("✅ " + res.data.mensagem);
                setUserData({ ...userData, ...res.data });
                setShowEditModal(false);
                setIsSaving(false);
                
                if (editForm.password) {
                    alert("Senha alterada. Por favor, faça login novamente.");
                    handleLogout();
                }
            })
            .catch(err => {
                console.error(err);
                alert("❌ Erro ao atualizar o perfil.");
                setIsSaving(false);
            });
    };

    const chartData = [
        { name: 'Jan', gasto: 0 },
        { name: 'Fev', gasto: 0 },
        { name: 'Mar', gasto: 0 },
        { name: 'Abr', gasto: 0 },
        { name: 'Mai', gasto: 0 },
        { name: 'Jun', gasto: Number(stats.total_gasto) } 
    ];

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#a1a1aa', fontWeight: '500' }}>Carregando perfil...</p>
            </div>
        );
    }

    const inicial = userData?.first_name ? userData.first_name.charAt(0).toUpperCase() : 'P';

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#18181b', minHeight: '100vh', paddingBottom: '100px', color: '#f4f4f5' }}>

            {/* --- CABEÇALHO CENTRALIZADO --- */}
            <div style={{ backgroundColor: '#27272a', padding: '40px 20px 30px', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px', borderBottom: '1px solid #3f3f46', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                
                <button onClick={openEditModal} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }}>
                    <Edit3 size={16} /> Editar
                </button>

                <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#18181b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', border: '3px solid #3f3f46', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', marginBottom: '16px' }}>
                    {inicial}
                </div>
                
                <h2 style={{ margin: '0 0 12px 0', fontSize: '1.8rem', color: '#ffffff', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    {userData?.first_name} {userData?.last_name}
                </h2>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ backgroundColor: '#18181b', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', fontSize: '0.85rem', border: '1px solid #3f3f46' }}>
                        <Mail size={14} /> {userData?.email}
                    </div>
                    {userData?.phone && (
                        <div style={{ backgroundColor: '#18181b', padding: '6px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', fontSize: '0.85rem', border: '1px solid #3f3f46' }}>
                            <Phone size={14} /> {userData?.phone}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* --- PAINEL DE ESTATÍSTICAS UNIFICADO --- */}
                {isLoadingStats ? (
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', textAlign: 'center' }}>Calculando métricas...</p>
                ) : (
                    <div style={{ backgroundColor: '#27272a', borderRadius: '24px', border: '1px solid #3f3f46', display: 'flex', padding: '20px 0', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #3f3f46' }}>
                            <Car size={20} color="#a1a1aa" style={{ marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>{stats.total_usos}</p>
                            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '600' }}>Viagens</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #3f3f46' }}>
                            <Wallet size={20} color="#a1a1aa" style={{ marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>
                                <span style={{ fontSize: '0.9rem', color: '#a1a1aa', marginRight: '2px' }}>R$</span>
                                {Number(stats.total_gasto).toFixed(0)}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '600' }}>Gasto</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px', textAlign: 'center' }}>
                            <Trophy size={20} color="#fbbf24" style={{ marginBottom: '8px' }} />
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                                {stats.estacionamento_favorito !== '-' ? stats.estacionamento_favorito : 'Nenhum'}
                            </p>
                            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: '600', mt: '4px' }}>Favorito</span>
                        </div>
                    </div>
                )}

                {/* --- GRÁFICO --- */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: '700', marginBottom: '16px', marginLeft: '8px' }}>
                        Histórico de Gastos
                    </h3>
                    <div style={{ backgroundColor: '#27272a', padding: '20px 16px 16px 0', borderRadius: '24px', border: '1px solid #3f3f46', height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} dy={10} />
                                <Tooltip 
                                    cursor={{ fill: '#3f3f46' }} 
                                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #3f3f46', color: '#ffffff', fontSize: '0.9rem' }}
                                    itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="gasto" fill="#ffffff" radius={[6, 6, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- MENUS E CONFIGURAÇÕES --- */}
                <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: '700', marginBottom: '16px', marginLeft: '8px' }}>
                    Minha Conta
                </h3>
                <div style={{ backgroundColor: '#27272a', borderRadius: '24px', border: '1px solid #3f3f46', marginBottom: '32px', overflow: 'hidden' }}>
                    <VehicleManager />
                    <div style={{ height: '1px', backgroundColor: '#3f3f46', margin: '0 20px' }} />
                    <FavoriteManager />
                    <div style={{ height: '1px', backgroundColor: '#3f3f46', margin: '0 20px' }} />
                    <MenuItem 
                        icone={<Shield size={20} color="#ffffff" />} 
                        titulo="Segurança e Dados" 
                        subtitulo="Alterar senha e acesso" 
                        onClick={openEditModal} 
                    />
                </div>

                {/* --- BOTÃO DE SAIR --- */}
                <button 
                    onClick={handleLogout}
                    style={{ width: '100%', padding: '18px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '20px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={20} />
                    Sair do aplicativo
                </button>
            </div>

            {/* --- MODAL DE EDIÇÃO DE PERFIL --- */}
            <AnimatePresence>
                {showEditModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: '#27272a', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid #3f3f46' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>Editar Perfil</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                <input 
                                    placeholder="Nome" value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#ffffff', outline: 'none' }}
                                />
                                <input 
                                    placeholder="Sobrenome" value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#ffffff', outline: 'none' }}
                                />
                                <input 
                                    placeholder="Telefone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#ffffff', outline: 'none' }}
                                />
                                <hr style={{ border: 'none', borderTop: '1px solid #3f3f46', margin: '8px 0' }} />
                                <input 
                                    type="password" placeholder="Nova Senha (deixe em branco)" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#ffffff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '14px', border: '1px solid #3f3f46', backgroundColor: '#18181b', borderRadius: '14px', fontWeight: '700', color: '#a1a1aa', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button onClick={handleSaveProfile} disabled={isSaving} style={{ flex: 1, padding: '14px', border: 'none', backgroundColor: '#ffffff', color: '#000000', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

function MenuItem({ icone, titulo, subtitulo, onClick }) {
    return (
        <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '20px', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', border: '1px solid #3f3f46' }}>
                {icone}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', color: '#ffffff', fontWeight: '700' }}>{titulo}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#a1a1aa' }}>{subtitulo}</p>
            </div>
            <ChevronRight size={20} color="#52525b" />
        </div>
    );
}