import React, { useState } from "react";
import type { Order } from "@/interfaces/IOrders";
import { shippingService } from "@/services/shipping";
import { toast } from "sonner";

interface CreateShippingModalProps {
  order: Order;
  onClose: () => void;
  onShippingCreated?: () => void;
}

export const CreateShippingModal: React.FC<CreateShippingModalProps> = ({
  order,
  onClose,
  onShippingCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: "",
    shippingAddress: "",
    shippingDistrict: "",
    shippingCity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, name: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientName || !formData.shippingAddress || !formData.shippingDistrict || !formData.shippingCity) {
      toast.error("Por favor, rellene todos los campos del destino.");
      return;
    }

    try {
      setLoading(true);
      
      // Enviamos el objeto order completo y limpio (Express ignorará la propiedad interna 'product')
      await shippingService.create({
        order,
        formManualData: formData,
      });

      toast.success(`¡Despacho para la orden #${order.id} agendado y en preparación! 🚚`);
      if (onShippingCreated) onShippingCreated();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Ocurrió un error al procesar el despacho logístico.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fw-bold">✈ Agendar Envío Logístico - Orden #{order.id}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <p className="text-muted small">
                Al confirmar, se consolidarán los {order.items.reduce((sum, i) => sum + i.quantity, 0)} productos en un nuevo registro de MongoDB.
              </p>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Nombre del Receptor</label>
                <input
                  type="text"
                  className="form-control"
                  name="recipientName"
                  placeholder="Ej: Oscar Palma"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Dirección de Entrega</label>
                <input
                  type="text"
                  className="form-control"
                  name="shippingAddress"
                  placeholder="Ej: Av. Ricardo Cumming 123"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-secondary">Comuna</label>
                  <input
                    type="text"
                    className="form-control"
                    name="shippingDistrict"
                    placeholder="Ej: Santiago Centro"
                    value={formData.shippingDistrict}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-secondary">Ciudad</label>
                  <input
                    type="text"
                    className="form-control"
                    name="shippingCity"
                    placeholder="Ej: Santiago"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer bg-light border-top">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-warning btn-sm fw-medium" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Agendando...
                  </>
                ) : (
                  "🚚 Confirmar y Despachar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};