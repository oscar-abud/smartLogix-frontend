import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { DataTableInventory } from "@/components/DataTableInventory";
import { ModalInventory } from "@/components/ModalInventory";
import { ModalInventoryType } from "@/components/ModalInventoryType";
import { ModalInventoryItem } from "@/components/ModalInventoryItem";

export const InventoryPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Extraemos de forma segura el rol del usuario conectado
  const currentRoleName = currentUser?.role?.name;

  // Función para refrescar la tabla automáticamente cuando se crea un almacén
  const handleSuccessCreate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-100 p-2">
      {/* 1. Encabezado principal estilizado igual al de Usuarios */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
        <div>
          <h4 className="m-0 text-dark fw-bold">📦 Gestión de Almacenes</h4>
          <p className="text-muted small m-0">
            Supervisa los almacenes disponibles, volúmenes de stock y personal asignado.
          </p>
        </div>

        {/* REGLA DE NEGOCIO: El Cliente no puede ver los botones de administración */}
        {currentRoleName !== "CLIENT" && (
          <div className="d-flex gap-2">

            {/* Crear Producto Global */}
            <button
              onClick={() => setIsItemModalOpen(true)}
              className="btn btn-outline-success fw-semibold d-flex align-items-center gap-1 shadow-sm"
            >
              📦 Agregar Producto
            </button>
            
            {/* Crear Tipo de Inventario Global */}
            <button
              onClick={() => setIsTypeModalOpen(true)}
              className="btn btn-outline-primary fw-semibold d-flex align-items-center gap-1 shadow-sm"
            >
              🏷️ Crear Categoría
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary fw-semibold d-flex align-items-center gap-1 shadow-sm"
            >
              ➕ {currentRoleName === "OPERATOR" ? "Crear y Autoasignarme Almacén" : "Agregar Almacén"}
            </button>
          </div>
        )}
      </div>

      {/* 2. Banner informativo estilizado para el Administrador */}
      {currentRoleName === "ADMIN" && (
        <div className="alert alert-info py-2 px-3 border-info-subtle bg-info-subtle text-info-emphasis rounded-3 mb-4" role="alert">
          <span className="small d-flex align-items-center gap-1">
            <strong>ℹ️ Modo Administrador activado:</strong> Tienes visibilidad global absoluta sobre todas las bodegas registradas en la corporación.
          </span>
        </div>
      )}

      {/* Contenedor Card blanco que aloja la tabla de datos */}
      <div className="card shadow-sm p-4 border-light-subtle bg-white rounded-3">
        <DataTableInventory key={refreshKey} />
      </div>

      {/* Modal para la creación de nuevos espacios físicos */}
      <ModalInventory
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccessCreate}
      />

      {/* Registro de Tipos de Almacén Global */}
      <ModalInventoryType
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
      />

      {/* Registro de Productos con mapeo de selects */}
      <ModalInventoryItem
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={handleSuccessCreate}
      />
    </div>
  );
};