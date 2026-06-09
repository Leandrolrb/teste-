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
            backgroundColor: '#f3f4f6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                width: '100%', 
                maxWidth: '400px', 
                borderRadius: '24px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                border: '1px solid #f1f5f9'
            }}>
                
                {/* Header / Logo Area */}
                <div style={{ 
                    backgroundColor: '#3b82f6', 
                    padding: '40px 20px', 
                    textAlign: 'center' 
                }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: 'white', 
                        borderRadius: '16px', 
                        margin: '0 auto 16px auto', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <span style={{ fontSize: '32px', fontWeight: '900', color: '#3b82f6' }}>P</span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'white', letterSpacing: '1px' }}>
                        ParkApp
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: '#eff6ff', fontSize: '0.9rem', fontWeight: '500' }}>
                        Acesso rápido à sua vaga
                    </p>
                </div>

                {/* Formulário */}
                <div style={{ padding: '32px 24px' }}>
                    {erro && (
                        <div style={{ 
                            backgroundColor: '#fef2f2', 
                            borderLeft: '4px solid #ef4444', 
                            color: '#b91c1c', 
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
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', paddingLeft: '4px' }}>
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
                                    backgroundColor: '#f8fafc', 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '12px', 
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', paddingLeft: '4px' }}>
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
                                    backgroundColor: '#f8fafc', 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '12px', 
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>

                        {/* <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}>
                                Esqueceu a senha?
                            </span>
                        </div> */}

                        <button 
                            type="submit" 
                            disabled={carregando}
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                backgroundColor: carregando ? '#93c5fd' : '#3b82f6', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '16px', 
                                fontSize: '1.05rem', 
                                fontWeight: '800', 
                                cursor: carregando ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)', 
                                transition: 'background-color 0.2s',
                                marginTop: '8px'
                            }}
                            onMouseOver={(e) => !carregando && (e.target.style.backgroundColor = '#2563eb')}
                            onMouseOut={(e) => !carregando && (e.target.style.backgroundColor = '#3b82f6')}
                        >
                            {carregando ? 'Autenticando...' : 'Entrar'}
                        </button>
                    </form>

                    {/* Footer / Cadastro */}
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                            Ainda não tem uma conta?{' '}
                            <span 
                                onClick={() => navigate('/register')} // <-- Adicionei o onClick aqui
                                style={{ color: '#3b82f6', fontWeight: '800', cursor: 'pointer' }}
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