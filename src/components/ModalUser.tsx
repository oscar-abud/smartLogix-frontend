import React, { useEffect, useState } from "react";
import { fetchData } from "@/services/api/index";
import type { IUser } from "@/interfaces/IUser";
import { toast } from "sonner";
import {
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
  const [isLoading, setIsLoading] = useState(false);

  const authStore = useAuthStore();

  // Determinar dinámicamente si estamos editando o creando
  const isEditMode = !!userToEdit;

  // Cada vez que el modal se abre o cambia el usuario a editar, actualizamos los estados
  useEffect(() => {
    console.log(authStore.user);
    if (userToEdit) {
      setEmail(userToEdit.email);
      setRoleId(userToEdit.role.id.toString());
      setPassword(""); // Por seguridad, la contraseña no se precarga desde el back
    } else {
      // Limpiar formulario para modo creación
      setEmail("");
      setPassword("");
      setRoleId("2");
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

      // Estructuramos el cuerpo de la petición
      const body: any = {
        email,
        role: {
          id: Number(roleId),
        },
      };

      // En modo creación la contraseña es obligatoria. En edición, solo si la quieren cambiar.
      if (password) {
        body.password = password;
      } else if (!isEditMode) {
        toast.warning("La contraseña es obligatoria para nuevos usuarios");
        setIsLoading(false);
        return;
      }

      // Ejecutamos la petición con tu fetchData centralizado
      await fetchData(endpoint, method, idParam, body);

      toast.success(
        isEditMode
          ? "Usuario actualizado, vuelva a iniciar sesión para ver cambios"
          : "Usuario creado con éxito",
      );
      onSuccess(); // Recarga la tabla de usuarios
      onClose(); // Cierra el modal
    } catch (error) {
      console.error("Error en la operación de usuario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Fondo oscuro del modal (Backdrop) */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>

      {/* Estructura del Modal de Bootstrap */}
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow-lg">
            {/* Encabezado Dinámico */}
            <div
              className={`modal-header border-0 bg-light ${
                isEditMode
                  ? "border-start border-warning border-4"
                  : "border-start border-primary border-4"
              }`}
            >
              <h5 className="modal-title fw-bold text-dark">
                {isEditMode
                  ? "✏️ Actualizar Usuario"
                  : "➕ Crear Nuevo Usuario"}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
                disabled={isLoading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                {/* Campo Email */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Correo Electrónico
                  </label>
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
                    Contraseña{" "}
                    {isEditMode && (
                      <span className="text-muted fw-normal">
                        (Dejar en blanco para no cambiar)
                      </span>
                    )}
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
                  <label className="form-label small fw-semibold text-secondary">
                    Rol asignado
                  </label>
                  <select
                    className="form-select"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    disabled={isLoading}
                  >
                    {
                      authStore.user?.role.id === 1 && (
                        <option value="1">ADMIN</option>
                      )
                    }
                    {/* <option value="1">ADMIN</option> */}
                    <option value="2">OPERATOR</option>
                    <option value="3">CLIENT</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción inferiores */}
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
                  className={`btn ${
                    isEditMode ? "btn-warning text-dark" : "btn-primary"
                  } fw-semibold px-4`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
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
