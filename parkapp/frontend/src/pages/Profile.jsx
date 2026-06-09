import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import VehicleManager from '../components/VehicleManager';
import FavoriteManager from '../components/FavoriteManager';

export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // ESTADOS DO MODAL DE EDIÇÃO
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone: '', password: '' });
    const [isSaving, setIsSaving] = useState(false);

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
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // ABRIR MODAL COM OS DADOS ATUAIS PREENCHIDOS
    const openEditModal = () => {
        setEditForm({
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            phone: userData?.phone || '',
            password: '' // A senha sempre vem vazia por segurança
        });
        setShowEditModal(true);
    };

    // SALVAR ALTERAÇÕES
    const handleSaveProfile = () => {
        setIsSaving(true);
        api.put('users/me/', editForm)
            .then(res => {
                alert("✅ " + res.data.mensagem);
                setUserData({ ...userData, ...res.data });
                setShowEditModal(false);
                setIsSaving(false);
                
                // Se ele alterou a senha, os tokens antigos morrem, então forçamos o login
                if (editForm.password) {
                    alert("Como você alterou a senha, por favor faça login novamente.");
                    handleLogout();
                }
            })
            .catch(err => {
                console.error(err);
                alert("❌ Erro ao atualizar o perfil.");
                setIsSaving(false);
            });
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#94a3b8', fontWeight: '500' }}>Carregando perfil...</p>
            </div>
        );
    }

    const inicial = userData?.first_name ? userData.first_name.charAt(0).toUpperCase() : 'P';

    return (
        <div style={{ padding: '24px 20px', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '90px' }}>
            {/* <h2 style={{ color: '#0f172a', marginBottom: '24px', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Meu Perfil
            </h2> */}

            {/* CARTÃO DE IDENTIFICAÇÃO */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '20px', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)' }}>
                    {inicial}
                </div>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: '800' }}>
                        {userData?.first_name} {userData?.last_name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <Mail size={14} /> {userData?.email}
                    </div>
                    {userData?.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem' }}>
                            <Phone size={14} /> {userData?.phone}
                        </div>
                    )}
                </div>
            </div>

            {/* MENU DE OPÇÕES (Veículos e Favoritos) */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginBottom: '24px', overflow: 'hidden' }}>
                <VehicleManager />
                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0 20px' }} />
                <FavoriteManager />
                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0 20px' }} />
                
                {/* BOTÃO DE SEGURANÇA ATIVADO */}
                <MenuItem 
                    icone={<Shield size={20} color="#10b981" />} 
                    titulo="Segurança e Dados" 
                    subtitulo="Alterar nome, telefone ou senha" 
                    onClick={openEditModal} // <-- Chama a função de abrir modal
                />
            </div>

            {/* BOTÃO DE SAIR */}
            <button 
                onClick={handleLogout}
                style={{ width: '100%', padding: '18px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '20px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
                <LogOut size={20} />
                Sair da Conta
            </button>
            <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>
                ParkApp v1.0.0
            </p>

            {/* --- MODAL DE EDIÇÃO DE PERFIL --- */}
            <AnimatePresence>
                {showEditModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>Editar Perfil</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                <input 
                                    placeholder="Nome" value={editForm.first_name} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                                <input 
                                    placeholder="Sobrenome" value={editForm.last_name} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                                <input 
                                    placeholder="Telefone" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />
                                <input 
                                    type="password" placeholder="Nova Senha (deixe em branco para manter)" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                    style={{ padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '14px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '14px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button onClick={handleSaveProfile} disabled={isSaving} style={{ flex: 1, padding: '14px', border: 'none', backgroundColor: '#10b981', color: 'white', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
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

// Atualizamos o MenuItem para aceitar a prop onClick
function MenuItem({ icone, titulo, subtitulo, onClick }) {
    return (
        <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '20px', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                {icone}
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>{titulo}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{subtitulo}</p>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
        </div>
    );
}