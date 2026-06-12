// src/components/UI/ModalInventory.tsx
import React, { useState } from "react";
import { inventoryService } from "@/services/inventory";
import { toast } from "sonner";

interface ModalInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalInventory: React.FC<ModalInventoryProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("El nombre del almacén es obligatorio");

    try {
      setIsSubmitting(true);
      await inventoryService.create({ name, description });
      toast.success("Almacén registrado y asignado con éxito");
      setName("");
      setDescription("");
      onSuccess(); // Recarga la lista de inventarios
      onClose();   // Cierra el modal
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">📦 Registrar Nuevo Almacén</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre del Almacén</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Bodega Central Norte"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Descripción / Notas</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ej: Destinado a tecnología de alta gama..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary fw-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Almacén"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};