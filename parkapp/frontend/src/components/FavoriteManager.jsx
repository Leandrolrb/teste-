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
        <div style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>Locais Salvos</h4>
            
            {favoritos.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
                    Você ainda não favoritou nenhum local.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {favoritos.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapPin size={18} color="#ef4444" />
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#991b1b' }}>
                                    {f.parking_name}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}