import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ReceiptText, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Bookings', path: '/bookings', icon: ReceiptText }, 
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      height: '75px', // Um pouquinho mais alto para ficar elegante no touch
      backgroundColor: '#18181b', // Mesmo fundo principal da Home
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #27272a', // Borda sutil escura
      zIndex: 2000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)', // Sombra escura para não misturar com o conteúdo
      paddingBottom: '5px' // Pequeno respiro inferior
    }}>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon; 
        
        return (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              color: isActive ? '#ffffff' : '#52525b', // Branco puro quando ativo, Cinza escuro inativo
              transition: 'all 0.2s ease-in-out',
              padding: '8px'
            }}
          >
            <IconComponent 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            <span style={{ 
              fontSize: '0.70rem', 
              fontWeight: isActive ? '700' : '500',
              marginTop: '4px' 
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}