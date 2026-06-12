import { fetchData } from "./api";
import { CONST_ENDPOINT_ORDERS } from "./api/constants";
import type { CreateOrderPayload, Order } from "@/interfaces/IOrders";

export const ordersService = {
  /**
   * Obtiene el listado completo de órdenes registradas en el sistema
   */
  getAll: async (): Promise<Order[]> => {
    return await fetchData(CONST_ENDPOINT_ORDERS, "GET", undefined, undefined, true);
  },

  /**
   * Obtiene el detalle completo y artículos de una orden específica mediante su ID
   */
  getById: async (id: number): Promise<Order> => {
    return await fetchData(CONST_ENDPOINT_ORDERS, "GET", id.toString(), undefined, true);
  },

  /**
   * Genera una nueva orden de compra multi-producto en el sistema
   */
  create: async (orderData: CreateOrderPayload): Promise<Order> => {
    // 1. Usamos "POST" como método HTTP
    // 2. El tercer parámetro (ID en URL) va como 'undefined' porque la ruta es limpia: /api/orders
    // 3. Pasamos 'orderData' en el cuarto parámetro para que viaje como el JSON Body requerido
    return await fetchData(CONST_ENDPOINT_ORDERS, "POST", undefined, orderData, true);
  },

  /**
   * Actualizar el estado de una orden
   */
  updateStatus: async (id: number, status: 'PENDING' | 'PROCESSED' | 'CANCELLED'): Promise<any> => {
    return await fetchData(
        `${CONST_ENDPOINT_ORDERS}/${id}/status`, 
        "PATCH", 
        undefined, 
        { status },
        true
      );
    },

  /**
   * Elimina de forma física o lógica una orden del sistema mediante su ID
   */
  delete: async (id: number): Promise<any> => {
    return await fetchData(CONST_ENDPOINT_ORDERS, "DELETE", id.toString(), undefined, true);
  }
};