import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { fetchData } from "@/services/api";
import { inventoryService } from "@/services/inventory";
import { toast } from "sonner";
import type { IItem, IInventoryDetail } from "@/interfaces/IInventory";
import { CONST_ENDPOINT_INVENTORY } from "@/services/api/constants";

export const InventoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [inventory, setInventory] = useState<IInventoryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchItem, setSearchItem] = useState<string>("");

  // Estados para controlar el modal de ajuste de stock
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IItem | null>(null);
  const [stockQuantity, setStockQuantity] = useState<string>(""); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getInventoryDetail = async () => {
    try {
      if (!id) return;
      const response = await fetchData(`${CONST_ENDPOINT_INVENTORY}/${id}`, "GET");
      setInventory(response);
    } catch (error) {
      console.error("Error cargando el detalle del almacén:", error);
      toast.error("No se pudo obtener la información de este almacén.");
      navigate("/inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getInventoryDetail();
  }, [id, navigate]);

  // Abrir el modal guardando la referencia del ítem de la fila
  const openStockModal = (item: IItem) => {
    setSelectedItem(item);
    setStockQuantity(""); // Iniciamos vacío para obligar a escribir
    setIsModalOpen(true);
  };

  // Cerrar modal y limpiar
  const closeStockModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setStockQuantity("");
  };

  // Enviar formulario del modal al BFF
  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const quantityNumber = parseInt(stockQuantity, 10);

    // 1. Validaciones preventivas de entrada en el Front
    if (isNaN(quantityNumber) || quantityNumber === 0) {
      return toast.error("Por favor, ingresa una cantidad numérica entera distinta de cero.");
    }

    // 2. Si es una resta, validar que no resulte en stock negativo
    if (quantityNumber < 0 && (selectedItem.stockAvailable + quantityNumber) < 0) {
      return toast.error(`Operación inválida. No puedes quitar más unidades de las disponibles (${selectedItem.stockAvailable}).`);
    }

    try {
      setIsSubmitting(true);
      const response = await inventoryService.updateStock(selectedItem.id, quantityNumber);
      toast.success(response.message || "Stock actualizado exitosamente.");
      
      closeStockModal();
      getInventoryDetail();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al actualizar el stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      width: "210px",
      center: true,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${row.stockAvailable > 10 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} fw-bold fs-6 px-2 py-1`}>
            {row.stockAvailable} uds
          </span>
          <button
            onClick={() => openStockModal(row)}
            className="btn btn-xs btn-outline-primary py-0 px-2 small fw-semibold border border-light-subtle shadow-sm"
            style={{ fontSize: "12px", height: "24px" }}
            title="Ajustar stock de este artículo"
          >
            ⚙️ Ajustar
          </button>
        </div>
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
        {/* Tabla de Artículos */}
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

        {/* Personal con Acceso */}
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

      {/* ========================================================================= */}
      {/* MODAL COMPACTO: AJUSTE DE STOCK ATÓMICO                      */}
      {/* ========================================================================= */}
      {isModalOpen && selectedItem && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: "380px" }}>
            <div className="modal-content border-0 shadow rounded-3">
              <div className="modal-header bg-light border-bottom-0 py-2 px-3">
                <h6 className="modal-title fw-bold text-dark m-0">⚙️ Ajustar Stock Física</h6>
                <button type="button" className="btn-close" style={{ fontSize: "12px" }} onClick={closeStockModal} disabled={isSubmitting}></button>
              </div>
              <form onSubmit={handleStockSubmit}>
                <div className="modal-body px-3 py-3">
                  <div className="mb-2 bg-light-subtle p-2 rounded border border-light-subtle">
                    <small className="text-muted d-block font-monospace uppercase fw-bold" style={{ fontSize: "10px" }}>SKU: {selectedItem.sku}</small>
                    <span className="d-block text-dark fw-semibold text-truncate small">{selectedItem.name}</span>
                    <small className="text-muted d-block mt-1">Stock Actual: <strong>{selectedItem.stockAvailable} uds</strong></small>
                  </div>

                  <div className="mb-3 mt-3">
                    <label className="form-label small fw-bold text-dark mb-1">Cantidad a sumar/restar:</label>
                    <input
                      type="number"
                      step="1" // Fuerza a que el navegador maneje saltos de números enteros
                      className="form-control form-control-sm text-center fw-bold fs-5"
                      placeholder="Ej: 15 o -5"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <div className="form-text text-muted" style={{ fontSize: "11px" }}>
                      Coloca valores <strong>positivos</strong> para ingresar mercadería y valores <strong>negativos (-)</strong> para mermas o despachos.
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 py-2 px-3 bg-light gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={closeStockModal} disabled={isSubmitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary px-3 fw-semibold" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Aplicar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};