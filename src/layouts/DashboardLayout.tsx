// src/layouts/DashboardLayout.tsx
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export const DashboardLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    sessionStorage.removeItem('token');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

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
        <nav className="navbar navbar-expand navbar-white bg-white border-bottom px-4 shadow-sm" style={{ height: '65px' }}>
          <div className="container-fluid p-0">
            
            {/* Nombre de la empresa a la izquierda */}
            <span className="navbar-brand fw-bold text-dark fs-4 tracking-tight m-0">
              smart-<span className="text-primary">logix</span>
            </span>

            {/* Zona derecha: Correo + Dropdown */}
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item d-none d-sm-block">
                <span className="text-secondary small fw-medium me-2">
                  {user?.email || 'usuario@smartlogix.com'}
                </span>
              </li>
              
              <li className="nav-item dropdown">
                <button 
                  className="btn btn-light border-0 dropdown-toggle fw-semibold d-flex align-items-center gap-1"
                  type="button" 
                  id="userMenuButton" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  Mi Cuenta
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userMenuButton">
                  <li>
                    <div className="dropdown-header px-3 py-2 border-bottom d-sm-none">
                      <strong className="text-dark">{user?.email}</strong>
                    </div>
                  </li>
                  <li>
                    <span className="dropdown-item-text text-muted small px-3 py-2">
                      Rol: <span className="badge bg-secondary-subtle text-secondary">{user?.role || 'USER'}</span>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item text-danger fw-semibold px-3 py-2"
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>

          </div>
        </nav>

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