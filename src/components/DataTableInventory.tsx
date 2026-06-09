// src/components/UI/DataTableInventory.tsx
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { fetchData } from "@/services/api/index";
import { useAuthStore } from "@/store/useAuthStore";
import { CONST_ENDPOINT_INVENTORY } from "@/services/api/constants";
import { ModalAssignedUsers } from "./ModalAssignedUsers";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const DataTableInventory: React.FC = () => {
  const [inventories, setInventories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Controladores para el sub-modal de usuarios asignados
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);

  const currentUser = useAuthStore((state) => state.user);
  const currentRoleName = currentUser?.role?.name;

  const navigate = useNavigate();

  const loadInventories = async () => {
    try {
      setIsLoading(true);
      // Consumimos el endpoint unificado a través del BFF
      const data = await fetchData(CONST_ENDPOINT_INVENTORY, "GET");
      setInventories(data);
    } catch (error) {
      console.error("Error cargando inventarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventories();
  }, []);

  const handleOpenUsersModal = (inventory: any) => {
    setSelectedInventory(inventory);
    setIsUsersModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    toast.warning(`¿Estás seguro de eliminar el almacén "${name}"?`, {
      description: "Esta acción removerá el stock de forma irreversible.",
      duration: Infinity,
      action: {
        label: "Sí, eliminar",
        onClick: async () => {
          try {
            await fetchData(CONST_ENDPOINT_INVENTORY, "DELETE", id.toString());
            toast.success("Almacén eliminado de manera exitosa");
            loadInventories();
          } catch (error) {
            console.error(error);
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const columns: TableColumn<any>[] = [
    { 
      name: "ID", 
      selector: (row) => row.id, 
      sortable: true, 
      width: "70px" 
    },
    {
      name: "Nombre del Almacén",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="py-2">
          <span className="fw-bold text-dark d-block">{row.name}</span>
          <span className="text-muted small text-truncate d-block" style={{ maxWidth: "260px" }}>
            {row.description || "Sin descripción asignada."}
          </span>
        </div>
      )
    },
    {
      name: "Ítems en Stock",
      selector: (row) => row.totalItems ?? 0,
      sortable: true,
      width: "140px",
      center: true,
      cell: (row) => (
        <span className={`badge ${(row.totalItems ?? 0) > 0 ? "bg-success-subtle text-success border border-success-subtle" : "bg-light text-muted border"} fw-semibold px-2 py-1`}>
          📦 {row.totalItems ?? 0} ítems
        </span>
      )
    },
    {
      name: "Usuarios Vinculados",
      selector: (row) => row.totalUsers ?? 0,
      sortable: true,
      width: "160px",
      center: true,
      cell: (row) => (
        <button
          onClick={() => handleOpenUsersModal(row)}
          className="btn btn-sm btn-link p-0 text-decoration-none"
          title="Ver detalle del personal"
        >
          <span className="badge bg-info-subtle text-info border border-info-subtle fw-semibold px-2 py-1 style-pointer" style={{ cursor: "pointer" }}>
            👥 {row.totalUsers ?? 0} asignados
          </span>
        </button>
      )
    },
    {
      name: "Fecha Creación",
      selector: (row) => row.createdAt,
      sortable: true,
      width: "130px",
      cell: (row) => (
        <span className="text-secondary small">{new Date(row.createdAt).toLocaleDateString()}</span>
      )
    },
    {
      name: "Acciones",
      button: true,
      width: "160px",
      cell: (row) => {
        if (currentRoleName === "CLIENT") {
          return <span className="text-muted small">Solo lectura</span>;
        }
        return (
          <div className="d-flex gap-2">
            <button
              onClick={() => navigate(`/inventory/${row.id}`)}
              className="btn btn-sm btn-primary fw-semibold shadow-sm d-flex align-items-center gap-1"
            >
              Ver Inventario
            </button>
            {currentRoleName === "ADMIN" && (
              <button
                onClick={() => handleDelete(row.id, row.name)}
                className="btn btn-sm btn-outline-danger"
              >
                🗑️
              </button>
            )}
          </div>
        );
      }
    }
  ];

  const filteredInventories = inventories.filter(
    (inv) =>
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      (inv.description && inv.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: "250px" }}
          placeholder="🔍 Filtrar almacén..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredInventories}
        progressPending={isLoading}
        pagination
        highlightOnHover
      />

      {/* MODAL DE USUARIOS ASIGNADOS INTEGRADO CON DATATABLE INTERNO */}
      {selectedInventory && (
        <ModalAssignedUsers
          isOpen={isUsersModalOpen}
          onClose={() => {
            setIsUsersModalOpen(false);
            setSelectedInventory(null);
          }}
          inventoryId={selectedInventory.id}
          inventoryName={selectedInventory.name}
          assignedUsers={selectedInventory.users || []}
          onRefresh={loadInventories}
        />
      )}
    </div>
  );
};