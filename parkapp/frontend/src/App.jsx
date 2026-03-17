import { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState('Conectando...')

  useEffect(() => {
    fetch('/api/')
      .then(res => res.json())
      .then(data => setApiStatus(`Backend OK: ${data.message}`))
      .catch(() => setApiStatus('Backend offline'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#0f172a',
      color: '#e2e8f0',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        ParkApp
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
        Sistema de Gerenciamento de Estacionamento
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        borderRadius: '8px',
        background: apiStatus.includes('OK') ? '#064e3b' : '#7f1d1d',
        fontSize: '0.9rem',
      }}>
        {apiStatus}
      </div>
      <p style={{ marginTop: '3rem', color: '#64748b', fontSize: '0.85rem' }}>
        Frontend React + Backend Django + PostgreSQL + Redis
      </p>
    </div>
  )
}

export default App
