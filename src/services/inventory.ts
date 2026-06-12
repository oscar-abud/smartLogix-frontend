import { fetchData } from "./api";
import type { IInventory, ICreateInventoryDto } from "@/interfaces/IInventory";
import { CONST_ENDPOINT_INVENTORY } from "./api/constants";

export const inventoryService = {
  getAll: async (): Promise<IInventory[]> => {
    return await fetchData(CONST_ENDPOINT_INVENTORY, "GET", undefined, undefined, true);
  },

  getById: async (id: number): Promise<IInventory> => {
    return await fetchData(CONST_ENDPOINT_INVENTORY, "GET", id.toString(), undefined, true);
  },

  getItems: async (): Promise<any[]> => {
    // Consumimos el endpoint que retorna todos los ítems de inventario
    return await fetchData(`${CONST_ENDPOINT_INVENTORY}/items`, "GET", undefined, undefined, true);
  },

  getTypes: async (): Promise<any[]> => {
    return await fetchData(`${CONST_ENDPOINT_INVENTORY}/types`, "GET", undefined, undefined, true);
  },

  create: async (body: ICreateInventoryDto): Promise<IInventory> => {
    return await fetchData(CONST_ENDPOINT_INVENTORY, "POST", undefined, body, true);
  },

  createType: async (body: { name: string; description?: string }): Promise<any> => {
    return await fetchData(`${CONST_ENDPOINT_INVENTORY}/types`, "POST", undefined, body, true);
  },

  createItem: async (inventoryId: number, body: { sku: string; name: string; price: number; stockAvailable: number; inventoryTypeId: number }): Promise<any> => {
    return await fetchData(`${CONST_ENDPOINT_INVENTORY}/${inventoryId}/items`, "POST", undefined, body, true);
  },

  delete: async (id: number): Promise<{ message: string; id: number }> => {
    return await fetchData(CONST_ENDPOINT_INVENTORY, "DELETE", id.toString(), undefined, true);
  },

  updateStock: async (itemId: number, quantity: number): Promise<any> => {
    return await fetchData(`${CONST_ENDPOINT_INVENTORY}/items/${itemId}/stock`, "PATCH", undefined, { quantity }, true);
  }
};