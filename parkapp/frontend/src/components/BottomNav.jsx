import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ReceiptText, User } from 'lucide-react'; // Importando os ícones profissionais

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Trocamos a string do emoji pela referência do componente do ícone
  const menuItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Bookings', path: '/bookings', icon: ReceiptText }, // Ícone de recibo/ticket para reservas
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      height: '70px',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #eee',
      zIndex: 2000,
      boxShadow: '0 -4px 12px rgba(0,0,0,0.03)' // Sombra um pouco mais suave
    }}>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon; // Instanciando o ícone dinamicamente
        
        return (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              color: isActive ? '#2563eb' : '#9ca3af', // Azul profissional ou cinza
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {/* O ícone fica ligeiramente mais grosso se estiver na aba ativa */}
            <IconComponent 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            <span style={{ 
              fontSize: '0.70rem', 
              fontWeight: isActive ? '600' : '400',
              marginTop: '4px' // Espaçinho entre o ícone e o texto
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}