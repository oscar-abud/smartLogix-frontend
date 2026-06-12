import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersService } from "@/services/orders";
import { renderStatusBadge } from "@/helpers/orderHelper";
import type { Order } from "@/interfaces/IOrders";

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function getOrderDetails() {
    if (!id) return;
    try {
      setLoading(true);
      // Consumimos el método getById de tu servicio pasándole el ID como número
      const data = await ordersService.getById(Number(id));
      setOrder(data);
    } catch (error) {
      console.error("Error al cargar el detalle de la orden:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container p-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando detalles...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container p-5 text-center">
        <div className="alert alert-danger" role="alert">
          No se pudo encontrar la orden solicitada o no tienes permisos para verla.
        </div>
        <button className="btn btn-dark btn-sm mt-3" onClick={() => navigate("/orders")}>
          ⬅️ Volver a Órdenes
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Botón de Regreso y Título */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/orders")}>
          ⬅️ Volver
        </button>
        <h2 className="fw-bold text-dark m-0">Detalle de Orden #{order.id}</h2>
      </div>

      <div className="row g-4">
        {/* COLUMNA 1: Información General de la Orden */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border rounded bg-white p-4 h-100">
            <h5 className="fw-bold text-secondary border-b pb-2 mb-3">Resumen del Pedido</h5>
            
            <div className="mb-3">
              <label className="text-muted small d-block uppercase font-semibold">Estado Actual</label>
              <div className="mt-1">{renderStatusBadge(order.status)}</div>
            </div>

            <div className="mb-3">
              <label className="text-muted small d-block uppercase font-semibold">Fecha de Registro</label>
              <span className="fw-medium text-dark">
                {new Date(order.createdAt).toLocaleString("es-ES", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </span>
            </div>

            <hr className="text-muted my-3" />

            <div className="p-3 bg-light rounded border">
              <label className="text-muted small d-block uppercase font-semibold mb-1">Monto Total de la Orden</label>
              <h3 className="fw-black text-primary m-0">
                ${Number(order.totalAmount).toLocaleString("es-CL", { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: Listado Enfático de los Productos */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border rounded bg-white p-4">
            <h5 className="fw-bold text-secondary pb-2 mb-3">📦 Productos en este Pedido ({order.items?.length || 0})</h5>
            
            <div className="table-responsive">
              <table className="table align-middle m-0">
                <thead className="table-light text-uppercase small fw-bold text-secondary">
                  <tr>
                    <th scope="col" className="ps-3">Descripción del Producto</th>
                    <th scope="col">SKU</th>
                    <th scope="col" className="text-center">Cantidad</th>
                    <th scope="col" className="text-end">Precio Unitario</th>
                    <th scope="col" className="text-end pe-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => {
                    const subtotal = Number(item.quantity) * Number(item.price);
                    return (
                      <tr key={item.id} className="hover:bg-light/50">
                        <td className="ps-3 fw-medium text-dark">
                          {item.product?.name || `Producto ID #${item.productId}`}
                        </td>
                        <td>
                          <span className="badge bg-dark font-monospace">{item.product?.sku || "N/A"}</span>
                        </td>
                        <td className="text-center fw-bold text-secondary">{item.quantity}</td>
                        <td className="text-end">
                          ${Number(item.price).toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-end fw-bold text-dark pe-3">
                          ${subtotal.toLocaleString("es-CL", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mensaje de contingencia si no hay items cargados */}
            {(!order.items || order.items.length === 0) && (
              <div className="text-center py-4 text-muted">
                No hay productos asociados a esta orden.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};