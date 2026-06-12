import React, { useState } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { useAuthStore } from "@/store/useAuthStore";
import type { IUser } from "@/interfaces/IUser";
import { toast } from "sonner";
import { fetchData } from "@/services/api";
import { CONST_ENDPOINT_INVENTORY } from "@/services/api/constants";

interface ModalAssignedUsersProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryName: string;
  assignedUsers: IUser[];
  inventoryId: number;
  onRefresh: () => void;
}

export const ModalAssignedUsers: React.FC<ModalAssignedUsersProps> = ({
  isOpen,
  onClose,
  inventoryName,
  assignedUsers,
  inventoryId,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const currentUser = useAuthStore((state) => state.user);
  const currentRoleName = currentUser?.role?.name;

  if (!isOpen) return null;

  // Reemplaza o edita la función en tu componente de Frontend
const handleRemoveUserFromInventory = (userId: string, email: string) => {
  toast.warning(`¿Desvincular a ${email} de este almacén?`, {
    description: "Perderá los accesos de administración inmediatamente sobre esta bodega.",
    duration: Infinity,
    action: {
      label: "Sí, desvincular",
      onClick: async () => {
        try {
          await fetchData(
          `${CONST_ENDPOINT_INVENTORY}/${inventoryId}/users/${userId}`,
          "DELETE"
        );

          // 2. Notificación de éxito y refresco de la UI
          toast.success("Usuario desvinculado exitosamente del almacén");
          
          if (typeof onRefresh === "function") onRefresh(); // Refresca los almacenes para reconstruir la lista
          if (typeof onClose === "function") onClose();     // Cierra el modal si corresponde
        } catch (error) {
          console.error("Error al desvincular usuario:", error);
          toast.error("Ocurrió un error al intentar desvincular al usuario.");
        }
      },
    },
    cancel: {
      label: "Cancelar",
      onClick: () => toast.dismiss(),
    },
  });
};

  const columns: TableColumn<IUser>[] = [
    { 
      name: "ID Corto", 
      selector: (row) => row.id, 
      sortable: true, 
      width: "120px",
      cell: (row) => <span className="font-monospace text-secondary small">{row.id.substring(0, 8)}...</span>
    },
    {
      name: "Correo Electrónico",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => <span className="fw-semibold text-dark">{row.email}</span>
    },
    {
      name: "Rol Administrativo",
      selector: (row) => row.role.name,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <span className={`badge ${row.role.name === "ADMIN" ? "bg-danger-subtle text-danger" : "bg-primary-subtle text-primary"} fw-semibold`}>
          {row.role.name}
        </span>
      )
    },
    {
      name: "Acciones",
      button: true,
      width: "120px",
      cell: (row) => {
        if (currentRoleName === "CLIENT") {
          return <span className="text-muted small">Lectura</span>;
        }
        return (
          <button
            onClick={() => handleRemoveUserFromInventory(row.id, row.email)}
            className="btn btn-sm btn-outline-danger"
            title="Quitar acceso a este almacén"
          >
            🚫 Quitar
          </button>
        );
      }
    }
  ];

  const filteredUsers = assignedUsers.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-3">
          
          <div className="modal-header border-light bg-light-subtle py-3">
            <div>
              <h5 className="modal-title fw-bold text-dark">👥 Personal Asignado</h5>
              <span className="text-muted small">Almacén activo: <strong className="text-primary">{inventoryName}</strong></span>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Buscador dentro del modal */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: "240px" }}
                placeholder="🔍 Filtrar por correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="badge bg-secondary-subtle text-secondary-emphasis fw-medium">
                Total: {assignedUsers.length} asignados
              </span>
            </div>

            {/* DataTable de usuarios vinculados */}
            <DataTable
              columns={columns}
              data={filteredUsers}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10]}
              highlightOnHover
              noDataComponent={
                <div className="p-4 text-muted text-center small">
                  No hay usuarios vinculados directamente a este almacén.
                </div>
              }
            />
          </div>

          <div className="modal-footer border-light bg-light-subtle py-2">
            <button type="button" className="btn btn-secondary btn-sm fw-medium" onClick={onClose}>
              Cerrar Vista
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};