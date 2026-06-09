import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, Shield, Heart, Car, ChevronRight } from 'lucide-react';
import api from '../services/api';
import VehicleManager from '../components/VehicleManager';
import FavoriteManager from '../components/FavoriteManager';
export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const navigate = useNavigate();
    

    useEffect(() => {
        // Busca os dados do usuário logado usando a nossa API autenticada
        api.get('users/me/')
            .then(response => {
                setUserData(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao carregar perfil:", error);
                setIsLoading(false);
                // Se der erro 401 (token expirado), força o logout
                if (error.response && error.response.status === 401) {
                    handleLogout();
                }
            });
    }, []);

    const handleLogout = () => {
        // A MÁGICA DO LOGOUT: Apaga as chaves do cofre!
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Redireciona para a porta de entrada
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#94a3b8', fontWeight: '500' }}>Carregando perfil...</p>
            </div>
        );
    }

    // Pega a primeira letra do nome para fazer um Avatar bonitinho
    const inicial = userData?.first_name ? userData.first_name.charAt(0).toUpperCase() : 'P';

    return (
        <div style={{ padding: '24px 20px', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', paddingBottom: '90px' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '24px', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Meu Perfil
            </h2>

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

            {/* MENU DE OPÇÕES */}
            
            <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden', marginBottom: '24px' }}>
                
                {/* 1. Meus Veículos */}
                <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
                    <VehicleManager />
                    
                    <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0 20px' }} />
                    
                    <FavoriteManager />
                </div>
                
                {/* 3. Segurança */}
                <MenuItem 
                    icone={<Shield size={20} color="#10b981" />} 
                    titulo="Segurança" 
                    subtitulo="Alterar senha e dados da conta" 
                />
            </div>

            {/* BOTÃO DE SAIR */}
            <button 
                onClick={handleLogout}
                style={{ width: '100%', padding: '18px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '20px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
            >
                <LogOut size={20} />
                Sair da Conta
            </button>

            <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>
                ParkApp v1.0.0
            </p>
        </div>
    );
}

// Componente auxiliar para os itens da lista
function MenuItem({ icone, titulo, subtitulo }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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