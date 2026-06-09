import axios from 'axios';

const api = axios.create({
    //baseURL: 'http://localhost:8000/api/', // Ajuste se a porta do seu backend for diferente
    //ssh -R 80:localhost:5173 nokey@localhost.run

    baseURL: 'https://646dc885de63d7.lhr.life/api/', // Ajuste se a porta do seu backend for diferente
});

// Interceptor: Antes de qualquer requisição sair do React, ele roda isso aqui
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    
    // Se achou o token no navegador, coloca no cabeçalho de Autorização
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;