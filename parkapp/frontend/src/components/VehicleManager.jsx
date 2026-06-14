import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car } from 'lucide-react';
import api from '../services/api';

export default function VehicleManager() {
    const [veiculos, setVeiculos] = useState([]);
    const [novoNome, setNovoNome] = useState('');
    const [novaPlaca, setNovaPlaca] = useState('');

    useEffect(() => {
        carregarVeiculos();
    }, []);

    const carregarVeiculos = () => {
        api.get('users/vehicles/')
            .then(res => setVeiculos(res.data))
            .catch(err => console.error("Erro ao carregar veículos", err));
    };

    const handleAdd = () => {
        if (!novoNome || !novaPlaca) return;
        api.post('users/vehicles/', { name: novoNome, plate: novaPlaca })
            .then(() => {
                setNovoNome(''); setNovaPlaca('');
                carregarVeiculos();
            })
            .catch(err => alert("Erro ao salvar veículo."));
    };

    const handleDelete = (id) => {
        api.delete(`users/vehicles/${id}/`)
            .then(() => carregarVeiculos());
    };

    const inputStyle = { 
        padding: '12px', 
        borderRadius: '12px', 
        border: '1px solid #3f3f46', 
        backgroundColor: '#18181b', 
        color: '#ffffff',
        fontSize: '0.9rem', 
        outline: 'none', 
        flex: 1 
    };

    return (
        <div style={{ padding: '24px 20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#ffffff', fontWeight: '700' }}>Meus Veículos</h4>
            
            {/* Lista de Veículos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {veiculos.map(v => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #3f3f46' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ backgroundColor: '#27272a', padding: '8px', borderRadius: '10px' }}>
                                <Car size={20} color="#a1a1aa" />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>{v.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '2px' }}>{v.plate}</div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', padding: '8px' }}>
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Formulário de Adição */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input placeholder="Ex: Yamaha MT-03" value={novoNome} onChange={e => setNovoNome(e.target.value)} style={inputStyle} />
                <input placeholder="ABC-1234" value={novaPlaca} onChange={e => setNovaPlaca(e.target.value)} style={{ ...inputStyle, flex: '0 0 110px' }} />
                <button onClick={handleAdd} style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', color: '#000000', padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                    <Plus size={22} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}