// src/router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { InventoryDetailPage } from '@/pages/InventoryDetailPage';

// Componentes temporales de prueba
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
            element: <DashboardPage />,
          },
          {
            path: '/inventory',
            element: <InventoryPage />,
          },
          {
            path: '/inventory/:id',
            element: <InventoryDetailPage />,
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