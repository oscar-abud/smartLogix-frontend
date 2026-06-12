import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Order, OrderStatus } from "@/interfaces/IOrders";
import { toast } from "sonner";
import { ordersService } from "@/services/orders";
import { renderStatusBadge } from "@/helpers/orderHelper";
import { UpdateStatusModal } from "@/components/orders/UpdateStatusModal";
import { CreateOrderModal } from "@/components/orders/CreateOrderModal";
import { CreateShippingModal } from "@/components/shipping/CreateShippingModal";
import { useAuthStore } from "@/store/useAuthStore";

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeOrderForStatus, setActiveOrderForStatus] = useState<Order | null>(null);
  const [activeOrderForShipping, setActiveOrderForShipping] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const authStore = useAuthStore();

  function isNotProcessed(order: Order) {
    return order.status !== 'PROCESSED'
  }

  // Obtener todas las órdenes
  async function getOrders() {
    try {
      setLoading(true);
      const data = await ordersService.getAll();
      setOrders(data || []);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdatedInTable = (orderId: number, newStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Eliminar una orden por ID
  async function handleDeleteOrder(id: number) {
    // Disparamos un toast persistente e interactivo con sonner
    toast.warning(`¿Estás seguro de eliminar la orden #${id}?`, {
        description: "Esta acción eliminará el registro de forma permanente.",
        duration: Infinity,
        action: {
        label: "Sí, eliminar",
        onClick: async () => {
            try {
            await ordersService.delete(id);
            
            toast.success(`Orden #${id} eliminada exitosamente`);
            
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
            } catch (error) {
            console.error("Error al eliminar la orden:", error);
            }
        },
        },
        cancel: {
        label: "Cancelar",
        onClick: () => toast.dismiss(), // Cierra el aviso sin realizar ninguna acción
      },
    });
  }

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="container-fluid p-4">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded border shadow-sm">
        <div>
          <h2 className="fw-bold text-dark m-0">🛒 Gestión de Órdenes</h2>
          <p className="text-muted m-0 mt-1">Panel de administración de pedidos y despachos comerciales.</p>
        </div>
        <div className="d-flex gap-2">
          {
            authStore.user?.role.name !== "CLIENT" && (
              <button className="btn btn-success btn-sm fw-medium" onClick={() => setShowCreateModal(true)}>
                ➕ Crear Orden
              </button>
            )
          }
          <button className="btn btn-outline-primary btn-sm" onClick={getOrders}>
            🔄 Sincronizar
          </button>
        </div>
      </div>

      {/* Tabla con Estilos Bootstrap */}
      <div className="card shadow-sm border rounded bg-white p-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="m-0">No se encontraron órdenes registradas en el sistema.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light text-uppercase small fw-bold text-secondary">
                <tr>
                  <th scope="col" className="ps-3">N° Orden</th>
                  <th scope="col">Fecha de Registro</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="text-end">Monto Total</th>
                  <th scope="col" className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="ps-3 fw-bold text-dark">#{order.id}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>{renderStatusBadge(order.status)}</td>
                    <td className="text-end fw-bold text-dark">
                      ${Number(order.totalAmount).toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-outline-dark btn-sm fw-medium"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Ver Órden
                        </button>
                        <button className="btn btn-outline-primary btn-sm fw-medium" onClick={() => setActiveOrderForStatus(order)}>
                          Actualizar Estado
                        </button>
                        
                        {/* Modal de Envío */}
                        <button
                          className="btn btn-warning btn-sm fw-medium"
                          onClick={() => setActiveOrderForShipping(order)}
                          disabled={isNotProcessed(order)}
                        >
                          ✈ Hacer Envío
                        </button>

                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ACTUALIZAR ESTADO */}
      {activeOrderForStatus && (
        <UpdateStatusModal
          order={activeOrderForStatus}
          onClose={() => setActiveOrderForStatus(null)}
          onStatusUpdated={handleStatusUpdatedInTable}
        />
      )}

      {/* MODAL DE CREAR ORDEN */}
      {showCreateModal && (
      <CreateOrderModal
        onClose={() => setShowCreateModal(false)}
        onOrderCreated={getOrders}
      />
      )}

      {/* MODAL DE ENVÍO */}
      {activeOrderForShipping && (
        <CreateShippingModal
          order={activeOrderForShipping}
          onClose={() => setActiveOrderForShipping(null)}
          onShippingCreated={getOrders}
        />
      )}
    </div>
  );
};