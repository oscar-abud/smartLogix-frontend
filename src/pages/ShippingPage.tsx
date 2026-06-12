import { useEffect, useState } from "react";
import { toast } from "sonner";
import { shippingService } from "@/services/shipping";
import { renderShippingStatusBadge } from "@/helpers/shippingHelper";
import { UpdateShippingStatusModal } from "@/components/shipping/UpdateShippingStatusModal";

export const ShippingPage = () => {
  const [shippings, setShippings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeShippingForStatus, setActiveShippingForStatus] = useState<any | null>(null);

  // Obtener todo el historial desde MongoDB Atlas a través del BFF
  async function getShippings() {
    try {
      setLoading(true);
      const data = await shippingService.getAll();
      setShippings(data || []);
    } catch (error) {
      console.error("Error al cargar despachos:", error);
      toast.error("No se pudo conectar con el servicio de despachos.");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdatedInTable = (orderId: number, newStatus: string) => {
    setShippings((prev) =>
      prev.map((s) => (s.orderId === orderId ? { ...s, shippingStatus: newStatus } : s))
    );
  };

  // Eliminar un envío por su _id de MongoDB
  async function handleDeleteShipping(mongoId: string, orderId: number) {
    toast.warning(`¿Estás seguro de cancelar el envío de la orden #${orderId}?`, {
      description: "Esta acción removerá el registro logístico de MongoDB permanentemente.",
      duration: Infinity,
      action: {
        label: "Sí, remover",
        onClick: async () => {
          try {
            await shippingService.delete(mongoId);
            toast.success(`Envío de la orden #${orderId} removido exitosamente`);
            setShippings((prev) => prev.filter((s) => s._id !== mongoId));
          } catch (error) {
            console.error("Error al eliminar el despacho:", error);
            toast.error("Error al eliminar el despacho logístico.");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => toast.dismiss(),
      },
    });
  }

  useEffect(() => {
    getShippings();
  }, []);

  return (
    <div className="container-fluid p-4">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded border shadow-sm">
        <div>
          <h2 className="fw-bold text-dark m-0">🚚 Control Logístico de Envíos</h2>
          <p className="text-muted m-0 mt-1">Monitoreo de rutas, transportistas, despachos manuales y volúmenes métricos.</p>
        </div>
        <div>
          <button className="btn btn-outline-primary btn-sm" onClick={getShippings}>
            🔄 Sincronizar Rutas
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card shadow-sm border rounded bg-white p-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando despachos...</span>
            </div>
          </div>
        ) : shippings.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="m-0">No se registran despachos activos o camiones en tránsito en este momento.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light text-uppercase small fw-bold text-secondary">
                <tr>
                  <th scope="col" className="ps-3">N° Orden</th>
                  <th scope="col">Receptor</th>
                  <th scope="col">Dirección de Destino</th>
                  <th scope="col">Ciudad / Comuna</th>
                  <th scope="col" className="text-center">Total Productos</th>
                  <th scope="col" className="text-center">Estado Logístico</th>
                  <th scope="col" className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shippings.map((shipping) => (
                  <tr key={shipping._id}>
                    <td className="ps-3 fw-bold text-dark">#{shipping.orderId}</td>
                    <td className="fw-medium text-secondary">{shipping.recipientName}</td>
                    <td>{shipping.shippingAddress}</td>
                    <td>
                      <span className="small text-muted d-block">{shipping.shippingCity}</span>
                      <span className="small fw-semibold text-dark">{shipping.shippingDistrict}</span>
                    </td>
                    <td className="text-center fw-bold text-primary">{shipping.totalProductsQuantity} uds</td>
                    <td className="text-center">{renderShippingStatusBadge(shipping.shippingStatus)}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm fw-medium"
                          onClick={() => setActiveShippingForStatus(shipping)}
                        >
                          Actualizar Estado
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteShipping(shipping._id, shipping.orderId)}
                        >
                          🗑️
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

      {/* MODAL CAMBIAR ESTADO INTERNO */}
      {activeShippingForStatus && (
        <UpdateShippingStatusModal
          shipping={activeShippingForStatus}
          onClose={() => setActiveShippingForStatus(null)}
          onStatusUpdated={handleStatusUpdatedInTable}
        />
      )}
    </div>
  );
};