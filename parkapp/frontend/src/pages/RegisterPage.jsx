import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setErro('');
        setSucesso('');

        try {
            // Dispara para o backend criar o usuário
            await api.post('users/register/', {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email,
                password: password
            });

            setSucesso('Conta criada com sucesso! Redirecionando...');
            
            // Aguarda 2 segundos para o usuário ler a mensagem e manda para o login
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error("Erro no cadastro:", error);
            // Captura erros específicos do Django (ex: E-mail já existe)
            if (error.response && error.response.data) {
                const mensagensErro = Object.values(error.response.data).flat();
                setErro(mensagensErro[0] || 'Erro ao criar conta. Verifique os dados.');
            } else {
                setErro('Erro de conexão com o servidor.');
            }
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
                maxWidth: '450px', 
                borderRadius: '24px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                border: '1px solid #f1f5f9'
            }}>
                
                {/* Header Area */}
                <div style={{ 
                    backgroundColor: '#3b82f6', 
                    padding: '30px 20px', 
                    textAlign: 'center' 
                }}>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>
                        Criar Nova Conta
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: '#eff6ff', fontSize: '0.9rem', fontWeight: '500' }}>
                        Junte-se ao ParkApp hoje mesmo
                    </p>
                </div>

                {/* Formulário */}
                <div style={{ padding: '32px 24px' }}>
                    
                    {/* Alertas de Erro ou Sucesso */}
                    {erro && (
                        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500' }}>
                            {erro}
                        </div>
                    )}
                    {sucesso && (
                        <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', color: '#15803d', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500' }}>
                            {sucesso}
                        </div>
                    )}

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* Linha com Nome e Sobrenome dividindo espaço */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', paddingLeft: '4px' }}>Nome</label>
                                <input type="text" required placeholder="Seu nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', paddingLeft: '4px' }}>Sobrenome</label>
                                <input type="text" required placeholder="Seu sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', paddingLeft: '4px' }}>Telefone (Opcional)</label>
                            <input type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', paddingLeft: '4px' }}>E-mail</label>
                            <input type="email" required placeholder="digite@seuemail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px', paddingLeft: '4px' }}>Senha</label>
                            <input type="password" required minLength="6" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                        </div>

                        <button 
                            type="submit" 
                            disabled={carregando}
                            style={{ 
                                width: '100%', padding: '16px', backgroundColor: carregando ? '#93c5fd' : '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.05rem', fontWeight: '800', cursor: carregando ? 'not-allowed' : 'pointer', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)', transition: 'background-color 0.2s', marginTop: '12px'
                            }}
                            onMouseOver={(e) => !carregando && (e.target.style.backgroundColor = '#2563eb')}
                            onMouseOut={(e) => !carregando && (e.target.style.backgroundColor = '#3b82f6')}
                        >
                            {carregando ? 'Criando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                            Já tem uma conta?{' '}
                            <span 
                                onClick={() => navigate('/login')}
                                style={{ color: '#3b82f6', fontWeight: '800', cursor: 'pointer' }}
                            >
                                Fazer login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Estilos extraídos para não poluir o HTML
const inputStyle = { 
    width: '100%', boxSizing: 'border-box', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
};
const handleFocus = (e) => e.target.style.borderColor = '#3b82f6';
const handleBlur = (e) => e.target.style.borderColor = '#e2e8f0';