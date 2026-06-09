// src/pages/InventoryDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { fetchData } from "@/services/api";
import { toast } from "sonner";
import type { IItem, IInventoryDetail } from "@/interfaces/IInventory";
import { CONST_ENDPOINT_INVENTORY } from "@/services/api/constants";

export const InventoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [inventory, setInventory] = useState<IInventoryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchItem, setSearchItem] = useState<string>("");

  useEffect(() => {
    const getInventoryDetail = async () => {
      try {
        setLoading(true);
        // Consumimos tu endpoint GET http://localhost:3000/api/inventory/:id
        const response = await fetchData(`${CONST_ENDPOINT_INVENTORY}/${id}`, "GET");
        setInventory(response);
      } catch (error) {
        console.error("Error cargando el detalle del almacén:", error);
        toast.error("No se pudo obtener la información de este almacén.");
        navigate("/inventory"); // Redirección de seguridad si falla o no existe
      } finally {
        setLoading(false);
      }
    };

    if (id) getInventoryDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="w-100 d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando almacén...</span>
        </div>
      </div>
    );
  }

  if (!inventory) return null;

  // Formateador de dinero (Ej: CLP)
  const formatPrice = (priceStr: string) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" })
      .format(parseFloat(priceStr));
  };

  // Columnas para la tabla de Productos
  const itemColumns: TableColumn<IItem>[] = [
    {
      name: "SKU",
      selector: (row) => row.sku,
      sortable: true,
      width: "140px",
      cell: (row) => <span className="font-monospace text-primary fw-medium">{row.sku}</span>
    },
    {
      name: "Producto",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
      cell: (row) => <span className="fw-semibold text-dark">{row.name}</span>
    },
    {
      name: "Precio Unitario",
      selector: (row) => row.price,
      sortable: true,
      width: "130px",
      right: true,
      cell: (row) => <span>{formatPrice(row.price)}</span>
    },
    {
      name: "Stock Disponible",
      selector: (row) => row.stockAvailable,
      sortable: true,
      width: "150px",
      center: true,
      cell: (row) => (
        <span className={`badge ${row.stockAvailable > 10 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} fw-bold fs-6`}>
          {row.stockAvailable} uds
        </span>
      )
    }
  ];

  // Filtrado local de artículos
  const filteredItems = inventory.items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchItem.toLowerCase())
  );

  return (
    <div className="w-100 p-3">
      {/* Botón de regreso y título */}
      <button 
        onClick={() => navigate("/inventory")} 
        className="btn btn-sm btn-outline-secondary mb-3 fw-semibold d-inline-flex align-items-center gap-1"
      >
        ⬅️ Volver a Almacenes
      </button>

      {/* Tarjeta de información general */}
      <div className="card shadow-sm border-light-subtle rounded-3 mb-4 bg-white p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-3">
          <div>
            <span className="badge bg-primary mb-2">ID Almacén: #{inventory.id}</span>
            <h3 className="m-0 text-dark fw-bold">{inventory.name}</h3>
            <p className="text-muted m-0 mt-1">{inventory.description}</p>
          </div>
          <div className="text-md-end mt-2 mt-md-0">
            <small className="text-muted d-block">Fecha de Registro:</small>
            <strong className="text-dark">{new Date(inventory.createdAt).toLocaleDateString()}</strong>
          </div>
        </div>

        {/* Métrica rápidas superiores */}
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="p-3 bg-light rounded-3 border border-light-subtle">
              <small className="text-muted d-block uppercase fw-semibold small">Variedad de Productos</small>
              <h4 className="m-0 fw-bold text-primary mt-1">{inventory.totalItems} ítems</h4>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 bg-light rounded-3 border border-light-subtle">
              <small className="text-muted d-block uppercase fw-semibold small">Operadores Asignados</small>
              <h4 className="m-0 fw-bold text-success mt-1">{inventory.totalUsers} pers.</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sección Izquierda: Catálogo de Productos */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-light-subtle bg-white rounded-3 p-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
              <h5 className="fw-bold m-0 text-dark">📦 Artículos en Existencia</h5>
              <input
                type="text"
                className="form-control form-control-sm"
                style={{ maxWidth: "250px" }}
                placeholder="🔍 Filtrar por nombre o SKU..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />
            </div>

            <DataTable
              columns={itemColumns}
              data={filteredItems}
              pagination
              paginationPerPage={5}
              highlightOnHover
              noDataComponent={
                <div className="p-4 text-muted text-center small">
                  No hay productos en este almacén.
                </div>
              }
            />
          </div>
        </div>

        {/* Sección Derecha: Personal Autorizado */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-light-subtle bg-white rounded-3 p-4">
            <h5 className="fw-bold mb-3 text-dark">👥 Personal con Acceso</h5>
            
            {inventory.users && inventory.users.length > 0 ? (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                {inventory.users.map((user) => (
                  <div key={user.id} className="d-flex align-items-center justify-content-between p-2 rounded-2 border border-light-subtle bg-light-subtle">
                    <div className="overflow-hidden me-2">
                      <span className="d-block text-dark fw-medium text-truncate small">{user.email}</span>
                      <small className="text-muted font-monospace" style={{ fontSize: "11px" }}>{user.id.substring(0,8)}...</small>
                    </div>
                    <span className={`badge ${user.role.name === "ADMIN" ? "bg-danger-subtle text-danger" : "bg-primary-subtle text-primary"} fw-semibold small`}>
                      {user.role.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center small my-4">Sin personal asignado directamente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};