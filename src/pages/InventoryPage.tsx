// src/pages/InventoryPage.tsx
import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { DataTableInventory } from "@/components/DataTableInventory";
import { ModalInventory } from "@/components/ModalInventory";

export const InventoryPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

        {/* REGLA DE NEGOCIO: El Cliente no puede ver el botón de agregar almacenes */}
        {currentRoleName !== "CLIENT" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary fw-semibold d-flex align-items-center gap-1 shadow-sm"
          >
            ➕ {currentRoleName === "OPERATOR" ? "Crear y Autoasignarme Almacén" : "Agregar Almacén"}
          </button>
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

      {/* 3. Contenedor Card blanco que aloja la nueva tabla de datos */}
      <div className="card shadow-sm p-4 border-light-subtle bg-white rounded-3">
        {/* Usamos el refreshKey para forzar el re-renderizado limpio de la tabla tras un POST exitoso */}
        <DataTableInventory key={refreshKey} />
      </div>

      {/* 4. Modal para la creación de nuevos espacios físicos */}
      <ModalInventory
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccessCreate}
      />
    </div>
  );
};