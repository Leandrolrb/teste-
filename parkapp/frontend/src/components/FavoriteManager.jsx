import React, { useState, useEffect } from 'react';
import { Trash2, MapPin } from 'lucide-react';
import api from '../services/api';

export default function FavoriteManager() {
    const [favoritos, setFavoritos] = useState([]);

    useEffect(() => {
        carregarFavoritos();
    }, []);

    const carregarFavoritos = () => {
        api.get('parking/favorites/')
            .then(res => setFavoritos(res.data))
            .catch(err => console.error("Erro ao carregar favoritos", err));
    };

    const handleDelete = (id) => {
        api.delete(`parking/favorites/${id}/`)
            .then(() => carregarFavoritos())
            .catch(err => alert("Erro ao remover favorito."));
    };

    return (
        <div style={{ padding: '24px 20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#ffffff', fontWeight: '700' }}>Locais Salvos</h4>
            
            {favoritos.length === 0 ? (
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                    Você ainda não favoritou nenhum local.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {favoritos.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #3f3f46' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ backgroundColor: '#27272a', padding: '8px', borderRadius: '10px' }}>
                                    <MapPin size={20} color="#ef4444" />
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#ffffff' }}>
                                    {f.parking_name}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', display: 'flex', padding: '8px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'} onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}