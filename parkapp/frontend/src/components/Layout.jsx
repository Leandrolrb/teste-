import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div style={{ paddingBottom: '70px', minHeight: '100vh' }}>
      {/* O conteúdo das páginas aparece aqui */}
      <Outlet />
      
      {/* A barra de navegação fica fixa no fundo */}
      <BottomNav />
    </div>
  );
}