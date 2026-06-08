import { useEffect, useState } from "react";
import type { TableColumn } from "react-data-table-component";
import { fetchData } from "@/services/api/index";
import { useAuthStore } from "@/store/useAuthStore";
import type { IUser } from "@/interfaces/IUser";
import { ModalUser } from "./ModalUser";
import { toast } from "sonner";
import DataTable from "react-data-table-component";
import { CONST_ENDPOINT_USER } from "@/services/api/constants";

export const DataTableUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const currentUser = useAuthStore((state) => state.user);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchData(CONST_ENDPOINT_USER, "GET");
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

  const handleOpenCreate = () => {
    setSelectedUser(null); // Al ser null, el modal sabe que va a CREAR
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: IUser) => {
    setSelectedUser(user); // Al tener datos, el modal sabe que va a EDITAR
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await fetchData(`auth/users`, "DELETE", id);
        toast.success("Usuario eliminado exitosamente");
        loadUsers();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const columns: TableColumn<IUser>[] = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "100px" },
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
          {row.role.name}
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
            {/* Botón Editar Vinculado al Modal 🔥 */}
            <button
              onClick={() => handleOpenEdit(row)}
              className="btn btn-sm btn-outline-primary"
            >
              ✏️
            </button>
            {currentRoleName === "ADMIN" && (
              <button
                onClick={() => handleDelete(row.id)}
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
    <div className="w-100">
      {/* Barra superior modificada con el botón de Crear 🔥 */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
        <div>
          <h4 className="m-0 text-dark fw-bold">Gestión de Usuarios</h4>
          <p className="text-muted small m-0">
            Administra los accesos y roles del personal corporativo.
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: "250px" }}
            placeholder="🔍 Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Botón para disparar la creación de usuario 🔒 (Oculto para CLIENT) */}
          {currentUser?.role?.name !== "CLIENT" && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary fw-semibold d-flex align-items-center gap-1"
            >
              ➕ Agregar Usuario
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        progressPending={isLoading}
        pagination
        highlightOnHover
      />

      {/* 🔥 INYECTAMOS EL COMPONENTE MODAL AQUÍ */}
      <ModalUser
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadUsers} // Si sale bien, ejecuta el GET para refrescar las filas
        userToEdit={selectedUser}
      />
    </div>
  );
};
