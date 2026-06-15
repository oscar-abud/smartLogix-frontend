import React, { useEffect, useState } from "react";
import { inventoryService } from "@/services/inventory";
import { toast } from "sonner";

interface ModalInventoryItemProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModalInventoryItem: React.FC<ModalInventoryItemProps> = ({ isOpen, onClose, onSuccess }) => {
  // Datos para los Selects
  const [inventories, setInventories] = useState<any[]>([]);
  const [inventoryTypes, setInventoryTypes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Campos del Formulario
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockAvailable, setStockAvailable] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar los catálogos en paralelo al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const loadModalData = async () => {
        try {
          setLoadingData(true);
          const [resInventories, resTypes] = await Promise.all([
            inventoryService.getAll(),
            inventoryService.getTypes()
          ]);
          setInventories(resInventories);
          setInventoryTypes(resTypes);
        } catch (error) {
          console.error("Error al cargar catálogos en modal:", error);
          toast.error("No se pudieron cargar los almacenes o categorías.");
        } finally {
          setLoadingData(false);
        }
      };
      loadModalData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones preventivas en el Front
    if (!sku.trim()) return toast.error("El código SKU es obligatorio.");
    if (!name.trim()) return toast.error("El nombre del producto es obligatorio.");
    if (!selectedInventoryId) return toast.error("Debe seleccionar un almacén destino.");
    if (!selectedTypeId) return toast.error("Debe asignar una categoría de inventario.");

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stockAvailable, 10);

    if (isNaN(parsedPrice) || parsedPrice <= 0) return toast.error("El precio debe ser mayor a cero.");
    if (isNaN(parsedStock) || parsedStock < 0) return toast.error("El stock inicial no puede ser negativo.");

    try {
      setIsSubmitting(true);

      const body = {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        price: parsedPrice,
        stockAvailable: parsedStock,
        inventoryTypeId: parseInt(selectedTypeId, 10)
      };

      await inventoryService.createItem(parseInt(selectedInventoryId, 10), body);
      toast.success("Producto registrado y guardado en stock exitosamente.");

      // Limpieza de campos
      setSku("");
      setName("");
      setPrice("");
      setStockAvailable("");
      setSelectedInventoryId("");
      setSelectedTypeId("");

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al dar de alta el artículo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "460px" }}>
        <div className="modal-content border-0 shadow rounded-3">
          <div className="modal-header bg-light border-bottom-0 py-2 px-3">
            <h6 className="modal-title fw-bold text-dark m-0">📦 Registrar Nuevo Producto</h6>
            <button type="button" className="btn-close" style={{ fontSize: "12px" }} onClick={onClose} disabled={isSubmitting}></button>
          </div>
          
          {loadingData ? (
            <div className="text-center p-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
              <small className="d-block text-muted mt-2">Sincronizando catálogos globales...</small>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="modal-body px-3 py-2">
                <div className="row g-2">
                  
                  {/* Select: Almacén Destino */}
                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark mb-1">Almacén de Destino</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedInventoryId}
                      onChange={(e) => setSelectedInventoryId(e.target.value)}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">-- Selecciona el Almacén Físico --</option>
                      {inventories.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} (ID: #{inv.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select: Tipo de Inventario */}
                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark mb-1">Categoría / Tipo de Inventario</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedTypeId}
                      onChange={(e) => setSelectedTypeId(e.target.value)}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">-- Selecciona la Categoría Paramétrica --</option>
                      {inventoryTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input: SKU */}
                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark mb-1">Código SKU único</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase font-monospace text-primary fw-semibold"
                      placeholder="Ej: HW-SERVER-DELL-99"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Input: Nombre del Producto */}
                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark mb-1">Nombre del Artículo</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Ej: Memoria RAM ECC 32GB DDR5"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Input: Precio Unitario */}
                  <div className="col-6">
                    <label className="form-label small fw-bold text-dark mb-1">Precio Unitario ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-sm"
                      placeholder="Ej: 1490.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Input: Stock Inicial */}
                  <div className="col-6">
                    <label className="form-label small fw-bold text-dark mb-1">Stock de Carga Inicial</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control form-control-sm"
                      placeholder="Ej: 100"
                      value={stockAvailable}
                      onChange={(e) => setStockAvailable(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                </div>
              </div>

              <div className="modal-footer border-top-0 py-2 px-3 bg-light gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-sm btn-success px-3 fw-semibold" disabled={isSubmitting}>
                  {isSubmitting ? "Registrando..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};