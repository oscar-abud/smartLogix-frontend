import type { ICreateShippingPayload } from "@/interfaces/IShipping";
import { fetchData } from "./api";
import { CONST_ENDPOINT_SHIPPING } from "./api/constants";

export const shippingService = {
  /**
   * Obtiene el listado completo de despachos logísticos
   */
  getAll: async (): Promise<any[]> => {
    return await fetchData(CONST_ENDPOINT_SHIPPING, "GET", undefined, undefined, true);
  },

  /**
   * Busca los datos de despacho de una orden mediante su ID numérico
   */
  getByOrderId: async (orderId: number): Promise<any> => {
    return await fetchData(CONST_ENDPOINT_SHIPPING, "GET", orderId.toString(), undefined, true);
  },

  /**
   * Envía la orden y los datos manuales geográficos al BFF para consolidar el despacho
   */
  create: async (payload: ICreateShippingPayload): Promise<any> => {
    return await fetchData(CONST_ENDPOINT_SHIPPING, "POST", undefined, payload, true);
  },

  /**
   * Actualiza el estado de la entrega logístico (PREPARING, IN_TRANSIT, DELIVERED, FAILED)
   */
  updateStatus: async (orderId: number, status: string): Promise<any> => {
    return await fetchData(
      `${CONST_ENDPOINT_SHIPPING}/${orderId}/status`,
      "PATCH",
      undefined,
      { status },
      true
    );
  },

  /**
   * Elimina un despacho de la base de datos usando el ID nativo string de MongoDB
   */
  delete: async (mongoId: string): Promise<any> => {
    return await fetchData(CONST_ENDPOINT_SHIPPING, "DELETE", mongoId, undefined, true);
  }
};