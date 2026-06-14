import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setErro('');

        try {
            const response = await api.post('token/', { email, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            navigate('/'); 
        } catch (error) {
            console.error("Erro no login:", error);
            setErro('E-mail ou senha incorretos. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#000000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ 
                backgroundColor: '#18181b', 
                width: '100%', 
                maxWidth: '400px', 
                borderRadius: '24px', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                border: '1px solid #3f3f46'
            }}>
                
                {/* Header / Logo Area */}
                <div style={{ 
                    padding: '40px 20px 20px', 
                    textAlign: 'center' 
                }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '16px', 
                        margin: '0 auto 16px auto', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ fontSize: '32px', fontWeight: '900', color: '#000000' }}>P</span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#ffffff', letterSpacing: '1px' }}>
                        ParkApp
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: '#a1a1aa', fontSize: '0.9rem', fontWeight: '500' }}>
                        Acesso rápido à sua vaga
                    </p>
                </div>

                {/* Formulário */}
                <div style={{ padding: '24px' }}>
                    {erro && (
                        <div style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                            borderLeft: '4px solid #ef4444', 
                            color: '#fca5a5', 
                            padding: '12px 16px', 
                            borderRadius: '0 8px 8px 0', 
                            marginBottom: '24px', 
                            fontSize: '0.9rem', 
                            fontWeight: '500' 
                        }}>
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#a1a1aa', marginBottom: '8px', paddingLeft: '4px' }}>
                                E-mail
                            </label>
                            <input 
                                type="email" 
                                required
                                placeholder="digite@seuemail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    boxSizing: 'border-box',
                                    padding: '14px 16px', 
                                    backgroundColor: '#27272a', 
                                    border: '1px solid #3f3f46', 
                                    borderRadius: '12px', 
                                    fontSize: '1rem',
                                    color: '#ffffff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                                onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#a1a1aa', marginBottom: '8px', paddingLeft: '4px' }}>
                                Senha
                            </label>
                            <input 
                                type="password" 
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    boxSizing: 'border-box',
                                    padding: '14px 16px', 
                                    backgroundColor: '#27272a', 
                                    border: '1px solid #3f3f46', 
                                    borderRadius: '12px', 
                                    fontSize: '1rem',
                                    color: '#ffffff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                                onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={carregando}
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                backgroundColor: carregando ? '#52525b' : '#ffffff', 
                                color: '#000000', 
                                border: 'none', 
                                borderRadius: '16px', 
                                fontSize: '1.05rem', 
                                fontWeight: '800', 
                                cursor: carregando ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)', 
                                transition: 'all 0.2s',
                                marginTop: '8px'
                            }}
                            onMouseOver={(e) => !carregando && (e.target.style.opacity = '0.8')}
                            onMouseOut={(e) => !carregando && (e.target.style.opacity = '1')}
                        >
                            {carregando ? 'Autenticando...' : 'Entrar'}
                        </button>
                    </form>

                    {/* Footer / Cadastro */}
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem', fontWeight: '500' }}>
                            Ainda não tem uma conta?{' '}
                            <span 
                                onClick={() => navigate('/register')} 
                                style={{ color: '#ffffff', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Criar agora
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}