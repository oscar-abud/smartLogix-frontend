import React, { useState } from "react";
import { inventoryService } from "@/services/inventory";
import { toast } from "sonner";

interface ModalInventoryTypeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModalInventoryType: React.FC<ModalInventoryTypeProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones preventivas en el Front
    if (!name.trim()) return toast.error("El nombre de la categoría es obligatorio");
    if (name.trim().length < 3) return toast.error("El nombre debe tener al menos 3 caracteres.");

    try {
      setIsSubmitting(true);
      
      // Enviamos exactamente el JSON estructurado al BFF
      const response = await inventoryService.createType({
        name: name.trim(),
        description: description.trim() ? description.trim() : undefined
      });

      toast.success(response.message || "Nueva categoría de inventario registrada con éxito");
      
      // Limpiar formulario y cerrar
      setName("");
      setDescription("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al registrar la categoría global.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: "420px" }}>
        <div className="modal-content border-0 shadow rounded-3">
          <div className="modal-header bg-light border-bottom-0 py-2 px-3">
            <h6 className="modal-title fw-bold text-dark m-0">🏷️ Nuevo Tipo de Inventario</h6>
            <button 
              type="button" 
              className="btn-close" 
              style={{ fontSize: "12px" }} 
              onClick={onClose} 
              disabled={isSubmitting}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body px-3 py-3">
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">Nombre de la Categoría</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Ej: Inventario C (Tecnología)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold text-dark mb-1">Descripción / Alcance</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  placeholder="Ej: Dispositivos electrónicos, componentes de hardware..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="modal-footer border-top-0 py-2 px-3 bg-light gap-2">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary px-3" 
                onClick={onClose} 
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-sm btn-primary px-3 fw-semibold" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Crear Categoría"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};