import React, { useEffect, useState } from "react";
import { fetchData } from "@/services/api/index";
import type { IUser } from "@/interfaces/IUser";
import { toast } from "sonner";
import {
  CONST_ENDPOINT_INVENTORY,
  CONST_ENDPOINT_REGISTER,
  CONST_ENDPOINT_USER,
} from "@/services/api/constants";
import { useAuthStore } from "@/store/useAuthStore";

interface ModalUserProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit: IUser | null;
}

export const ModalUser = ({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
}: ModalUserProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("2");
  const [inventories, setInventories] = useState<any[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const authStore = useAuthStore();
  const isEditMode = !!userToEdit;

  const loadInventories = async () => {
    try {
      const data = await fetchData(CONST_ENDPOINT_INVENTORY, "GET");
      setInventories(data || []);
    } catch (error) {
      console.error("Error al precargar almacenes en el modal de usuarios:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInventories();
    }
  }, [isOpen]);

  // Actualizar estados del formulario según el modo de operación
  useEffect(() => {
    if (userToEdit) {
      setEmail(userToEdit.email);
      setRoleId(userToEdit.role.id.toString());
      setPassword(""); // Por seguridad la contraseña no se descarga
      
      // Si el JSON del BFF ya incluye datos de inventario del usuario, lo pre-seleccionamos aquí
      // Ejemplo: setSelectedInventoryId(userToEdit.inventoryId || "");
      setSelectedInventoryId(""); 
    } else {
      setEmail("");
      setPassword("");
      setRoleId("2");
      setSelectedInventoryId("");
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Configuración dinámica dependiendo del modo
      const endpoint = isEditMode
        ? CONST_ENDPOINT_USER
        : CONST_ENDPOINT_REGISTER;
      const method = isEditMode ? "PATCH" : "POST";
      const idParam = isEditMode ? userToEdit.id : undefined;

      // Cuerpo base de la petición
      const body: any = {
        email,
        role: {
          id: Number(roleId),
        },
      };

      if (selectedInventoryId) {
        body.inventoryId = Number(selectedInventoryId);
      }

      if (password) {
        body.password = password;
      } else if (!isEditMode) {
        toast.warning("La contraseña es obligatoria para nuevos usuarios");
        setIsLoading(false);
        return;
      }

      await fetchData(endpoint, method, idParam, body);

      toast.success(
        isEditMode
          ? "Usuario actualizado exitosamente"
          : "Usuario creado y asignado al almacén con éxito"
      );
      
      onSuccess(); 
      onClose(); 
    } catch (error) {
      console.error("Error en la operación de usuario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>

      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow-lg rounded-3">
            
            <div className={`modal-header border-0 bg-light ${isEditMode ? "border-start border-warning border-4" : "border-start border-primary border-4"}`}>
              <h5 className="modal-title fw-bold text-dark">
                {isEditMode ? "✏️ Actualizar Usuario" : "➕ Crear Nuevo Usuario"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={isLoading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                
                {/* Campo Email */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="nombre@smartlogix.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Campo Contraseña */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Contraseña {isEditMode && <span className="text-muted fw-normal">(Opcional)</span>}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isEditMode}
                    disabled={isLoading}
                  />
                </div>

                {/* Campo Rol */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Rol asignado</label>
                  <select
                    className="form-select"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    disabled={isLoading}
                  >
                    {authStore.user?.role.id === 1 && <option value="1">ADMIN</option>}
                    <option value="2">OPERATOR</option>
                    <option value="3">CLIENT</option>
                  </select>
                </div>

                {/* Asignación Inmediata de Almacén */}
                <div className="mb-2">
                  <label className="form-label small fw-semibold text-primary">
                    📦 Vincular a un Almacén (Opcional)
                  </label>
                  <select
                    className="form-select border-primary-subtle"
                    value={selectedInventoryId}
                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">-- No asignar a ningún almacén por ahora --</option>
                    {inventories.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.totalItems} ítems)
                      </option>
                    ))}
                  </select>
                  <div className="form-text text-muted small">
                    Al seleccionar un almacén, este usuario se insertará automáticamente en la tabla de relaciones físicas de inventario.
                  </div>
                </div>

              </div>

              <div className="modal-footer border-0 bg-light p-3">
                <button
                  type="button"
                  className="btn btn-light fw-semibold"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`btn ${isEditMode ? "btn-warning text-dark" : "btn-primary"} fw-semibold px-4`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : isEditMode ? (
                    "Guardar Cambios"
                  ) : (
                    "Registrar Usuario"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};