import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/UI/Header';

export const DashboardLayout = () => {
  const location = useLocation();  

  const isActive = (path: string) => location.pathname === path ? 'active text-white' : 'text-dark';

  return (
    <div className="d-flex vh-100 overflow-hidden">
      
      {/* MENÚ LATERAL IZQUIERDO (SIDEBAR) */}
      <div className="bg-white border-end d-flex flex-column align-items-stretch" style={{ width: '260px', minWidth: '260px' }}>
        <div className="p-3 border-bottom bg-light">
          <span className="fs-5 fw-bold text-primary">📍 Menú Principal</span>
        </div>
        
        {/* Enlaces de Navegación Estilizados con Bootstrap Navs */}
        <div className="nav nav-pills flex-column mb-auto p-3 gap-2">
          <Link to="/dashboard" className={`nav-link border-0 ${isActive('/dashboard')}`}>
            📊 Dashboard
          </Link>
          <Link to="/inventory" className={`nav-link border-0 ${isActive('/inventory')}`}>
            📦 Inventario
          </Link>
          <Link to="/orders" className={`nav-link border-0 ${isActive('/orders')}`}>
            🛒 Órdenes de Compra
          </Link>
        </div>
        
        <div className="p-3 border-top bg-light text-center">
          <small className="text-muted fw-semibold">Versión 2026.1</small>
        </div>
      </div>

      {/* CONTENEDOR DERECHO (HEADER + CONTENIDO DINÁMICO) */}
      <div className="d-flex flex-column flex-grow-1 bg-light">
        
        {/* HEADER SUPERIOR (NAVBAR) */}
        <Header/>

        {/* CONTENIDO PRINCIPAL DE LAS PÁGINAS */}
        <main className="flex-grow-1 overflow-auto p-4">
          <div className="card border-0 shadow-sm p-4 h-100 bg-white">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};