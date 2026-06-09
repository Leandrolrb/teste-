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

    return (
        <div style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>Meus Veículos</h4>
            
            {/* Lista de Veículos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {veiculos.map(v => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Car size={18} color="#64748b" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{v.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.plate}</div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Formulário de Adição */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <input placeholder="Ex: Yamaha MT-03" value={novoNome} onChange={e => setNovoNome(e.target.value)} style={inputStyle} />
                <input placeholder="ABC-1234" value={novaPlaca} onChange={e => setNovaPlaca(e.target.value)} style={{ ...inputStyle, width: '90px' }} />
                <button onClick={handleAdd} style={{ backgroundColor: '#3b82f6', border: 'none', borderRadius: '10px', color: 'white', padding: '0 12px', cursor: 'pointer' }}>
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}

const inputStyle = { padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', flex: 1 };