import React, { useState } from "react";
import { ordersService } from "@/services/orders";
import type { Order, OrderStatus } from "@/interfaces/IOrders";
import { toast } from "sonner";

interface UpdateStatusModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdated: (orderId: number, newStatus: OrderStatus) => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  order,
  onClose,
  onStatusUpdated,
}) => {
  // Seteamos el estado local del select con el valor actual de la orden
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSaveStatus() {
    try {
      setIsSubmitting(true);
      
      // Invocamos a tu servicio pasándole los parámetros requeridos
      await ordersService.updateStatus(order.id, selectedStatus);
      
      toast.success(`Estado de la orden #${order.id} actualizado a ${selectedStatus}`);
      
      // Notificamos al componente padre para que refresque la tabla localmente
      onStatusUpdated(order.id, selectedStatus);
      
      // Cerramos el modal
      onClose();
    } catch (error) {
      console.error("Error al actualizar el estado desde el modal componente:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0">
          
          {/* Cabecera */}
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold text-dark">
              Cambiar estado de la orden #{order.id}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              disabled={isSubmitting}
              onClick={onClose}
            ></button>
          </div>

          {/* Cuerpo / Formulario */}
          <div className="modal-body p-4">
            <label className="form-label fw-semibold text-secondary small text-uppercase mb-2">
              Selecciona el nuevo estado:
            </label>
            <select 
              className="form-select form-select-lg text-dark fw-medium"
              value={selectedStatus}
              disabled={isSubmitting}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            >
              <option value="PENDING">🟡 PENDING (Pendiente)</option>
              <option value="PROCESSED">🟢 PROCESSED (Procesada)</option>
              <option value="CANCELLED">🔴 CANCELLED (Cancelada)</option>
            </select>
            <div className="form-text mt-2 text-muted">
              Este cambio se transmitirá al microservicio y actualizará el flujo operativo.
            </div>
          </div>

          {/* Botones de acción */}
          <div className="modal-footer bg-light border-top-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary px-4" 
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-primary px-4 fw-medium"
              disabled={isSubmitting}
              onClick={handleSaveStatus}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                "💾 Guardar Cambios"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};