// src/components/DataTableUsers.tsx
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { fetchData } from "@/services/api/index";
import { useAuthStore } from "@/store/useAuthStore";
import type { IUser } from "@/interfaces/IUser";
import { toast } from "sonner";

export const DataTableUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const currentUser = useAuthStore((state) => state.user);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchData("auth/user", "GET");
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Definición de columnas adaptadas a tu IUser definitivo
  const columns: TableColumn<IUser>[] = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
      width: "80px",
    },
    {
      name: "Correo Electrónico",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Rol en el Sistema",
      selector: (row) => row.role.name,
      sortable: true,
      cell: (row) => (
        <span
          className={`badge ${
            row.role.name === "ADMIN"
              ? "bg-danger-subtle text-danger"
              : "bg-primary-subtle text-primary"
          } fw-semibold`}
        >
          {row.role.name} {/* Extracción directa y segura */}
        </span>
      ),
    },
    {
      name: "Acciones",
      button: true,
      width: "180px",
      cell: (row) => {
        const currentRoleName =
          typeof currentUser?.role === "object"
            ? currentUser.role.name
            : currentUser?.role;

        if (currentRoleName === "CLIENT") {
          return <span className="text-muted small">Sin permisos</span>;
        }

        return (
          <div className="d-flex gap-2">
            <button
              onClick={() => toast.info(`Editar ${row.email}`)}
              className="btn btn-sm btn-outline-primary"
            >
              ✏️
            </button>
            {currentRoleName === "ADMIN" && (
              <button
                onClick={() => toast.error(`Eliminar ID: ${row.id}`)}
                className="btn btn-sm btn-outline-danger"
              >
                🗑️
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DataTable
      columns={columns}
      data={filteredUsers}
      progressPending={isLoading}
      pagination
    />
  );
};
