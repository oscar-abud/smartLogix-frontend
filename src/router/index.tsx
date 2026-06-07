// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Dashboard } from '@/pages/Dashboard';

// Componentes temporales de prueba
const InventoryPlaceholder = () => <div><h2>📦 Módulo de Inventario</h2><p>Aquí gestionarás los stocks de los almacenes A y B.</p></div>;
const OrdersPlaceholder = () => <div><h2>🛒 Gestión de Órdenes</h2><p>Panel de administración de pedidos y despachos.</p></div>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/inventory',
            element: <InventoryPlaceholder />,
          },
          {
            path: '/orders',
            element: <OrdersPlaceholder />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);