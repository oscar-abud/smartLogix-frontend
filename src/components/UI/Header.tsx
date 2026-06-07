import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Header() {
  useAuthStore()
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    sessionStorage.removeItem('token');
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  return (
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
  )
}

export default Header