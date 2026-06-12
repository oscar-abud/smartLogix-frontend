import React, { useState } from "react";
import { shippingService } from "@/services/shipping";
import { toast } from "sonner";

interface UpdateShippingStatusModalProps {
  shipping: any;
  onClose: () => void;
  onStatusUpdated: (orderId: number, newStatus: string) => void;
}

export const UpdateShippingStatusModal: React.FC<UpdateShippingStatusModalProps> = ({
  shipping,
  onClose,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState<string>(shipping.shippingStatus);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await shippingService.updateStatus(shipping.orderId, status);
      toast.success(`Estado del envío #${shipping.orderId} actualizado`);
      onStatusUpdated(shipping.orderId, status);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al actualizar estado logístico");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white py-2">
            <h6 className="modal-title fw-bold m-0">🔄 Modificar Ruta Logística</h6>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-3">
              <label className="form-label small fw-bold text-secondary mb-1">Estado del Envío (Orden #{shipping.orderId})</label>
              <select
                className="form-select form-select-sm text-dark"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="PREPARING">📦 PREPARING (En Bodega)</option>
                <option value="IN_TRANSIT">🚚 IN_TRANSIT (En Camino)</option>
                <option value="DELIVERED">✅ DELIVERED (Entregado con Éxito)</option>
                <option value="FAILED">❌ FAILED (No se pudo Entregar)</option>
              </select>
            </div>
            <div className="modal-footer bg-light p-2 border-top">
              <button type="button" className="btn btn-outline-secondary btn-xs py-1" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-xs py-1" disabled={loading}>
                {loading ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};