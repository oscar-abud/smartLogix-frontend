import React, { useEffect, useState } from "react";
import { inventoryService } from "@/services/inventory";
import { ordersService } from "@/services/orders";
import { toast } from "sonner";

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  price: string;
  stockAvailable: number;
}

interface CreateOrderModalProps {
  onClose: () => void;
  onOrderCreated: () => void; // Para refrescar la tabla de órdenes al guardar
}

interface CartItem {
  productId: number;
  quantity: number;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ onClose, onOrderCreated }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // El carrito inicia con una fila vacía para obligar a seleccionar al menos un producto
  const [cart, setCart] = useState<CartItem[]>([{ productId: 0, quantity: 1 }]);

  // Cargar los productos del catálogo de inventario al abrir el modal
  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoadingInventory(true);
        const data = await inventoryService.getItems();
        setInventory(data || []);
      } catch (error) {
        console.error("Error al cargar catálogo de inventario:", error);
        toast.error("No se pudo cargar el catálogo de productos");
      } finally {
        setLoadingInventory(false);
      }
    }
    loadCatalog();
  }, []);

  // Agregar una nueva línea de producto al carrito flotante
  const addRow = () => {
    setCart([...cart, { productId: 0, quantity: 1 }]);
  };

  // Eliminar una línea específica del carrito
  const removeRow = (index: number) => {
    if (cart.length === 1) {
      toast.info("Una orden debe contener al menos un producto.");
      return;
    }
    setCart(cart.filter((_, i) => i !== index));
  };

  // Actualizar los campos dinámicos (producto o cantidad) de una fila específica
  const updateRow = (index: number, field: keyof CartItem, value: number) => {
    const updatedCart = cart.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setCart(updatedCart);
  };

  // Calcular el total financiero acumulado en tiempo real en la interfaz
  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const prod = inventory.find((p) => p.id === item.productId);
      return sum + (prod ? parseFloat(prod.price) * item.quantity : 0);
    }, 0);
  };

  // Enviar el payload estructurado al BFF
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar que no existan filas sin producto seleccionado
    if (cart.some((item) => item.productId === 0)) {
      toast.error("Por favor, selecciona un producto válido en todas las líneas.");
      return;
    }

    // 2. Validar que no haya IDs de productos duplicados en el mismo formulario
    const productIds = cart.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      toast.error("No repitas el mismo producto en líneas diferentes. Incrementa su cantidad.");
      return;
    }

    // 3. Validar stock físico en el lado del cliente de forma preventiva
    for (const item of cart) {
      const prod = inventory.find((p) => p.id === item.productId);
      if (prod && item.quantity > prod.stockAvailable) {
        toast.error(`Stock insuficiente para ${prod.name}. Disponible: ${prod.stockAvailable}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await ordersService.create({ items: cart });

      toast.success("¡Orden de compra generada exitosamente!");
      onOrderCreated();
      onClose();
    } catch (error) {
      console.error("Error al crear la orden:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow border-0">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold text-dark">🛒 Generar Nueva Orden</h5>
            <button type="button" className="btn-close" disabled={isSubmitting} onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {loadingInventory ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                  <span className="text-muted">Cargando catálogo de inventario...</span>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="fw-bold text-secondary text-uppercase small m-0">Artículos en el Carrito</label>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary btn-sm fw-medium" 
                      disabled={isSubmitting}
                      onClick={addRow}
                    >
                      ➕ Añadir Producto
                    </button>
                  </div>

                  {cart.map((item, index) => {
                    const selectedProduct = inventory.find((p) => p.id === item.productId);
                    const subtotal = selectedProduct ? parseFloat(selectedProduct.price) * item.quantity : 0;

                    return (
                      <div className="row g-2 align-items-center mb-3 p-3 bg-light rounded border position-relative" key={index}>
                        {/* Selector de Productos */}
                        <div className="col-12 col-md-5">
                          <label className="form-label small text-muted mb-1">Producto</label>
                          <select
                            className="form-select"
                            value={item.productId}
                            disabled={isSubmitting}
                            onChange={(e) => updateRow(index, "productId", Number(e.target.value))}
                          >
                            <option value={0}>-- Selecciona un Producto --</option>
                            {inventory.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} ({prod.sku}) - ${Number(prod.price).toLocaleString("es-CL")}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cantidad con validador de stock visible */}
                        <div className="col-6 col-md-3">
                          <label className="form-label small text-muted mb-1">
                            Cantidad {selectedProduct && `(Max: ${selectedProduct.stockAvailable})`}
                          </label>
                          <input
                            type="number"
                            className="form-select"
                            min={1}
                            value={item.quantity}
                            disabled={isSubmitting || item.productId === 0}
                            onChange={(e) => updateRow(index, "quantity", Math.max(1, Number(e.target.value)))}
                          />
                        </div>

                        {/* Subtotal de la Fila */}
                        <div className="col-4 col-md-3 text-end">
                          <label className="form-label d-block small text-muted mb-1">Subtotal</label>
                          <span className="fw-bold text-dark d-block pt-1">
                            ${subtotal.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Botón Eliminar Fila */}
                        <div className="col-2 col-md-1 text-center mt-4 mt-md-0">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm border-0 mt-2"
                            disabled={isSubmitting}
                            onClick={() => removeRow(index)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <hr className="my-4 text-muted" />

                  {/* Totalizador General de la Orden */}
                  <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded border border-primary border-opacity-20">
                    <span className="fw-bold text-primary text-uppercase">Total Estimado de la Compra:</span>
                    <h3 className="fw-black text-primary m-0">
                      ${calculateTotal().toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer bg-light border-top-0">
              <button type="button" className="btn btn-outline-secondary px-4" disabled={isSubmitting} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-success px-4 fw-medium" disabled={isSubmitting || loadingInventory || cart.length === 0}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Procesando en Backend...
                  </>
                ) : (
                  "📦 Confirmar y Crear Orden"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};