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

  create: async (body: ICreateInventoryDto): Promise<IInventory> => {
    return await fetchData(CONST_ENDPOINT_INVENTORY, "POST", undefined, body, true);
  },

  delete: async (id: number): Promise<{ message: string; id: number }> => {
    return await fetchData(CONST_ENDPOINT_INVENTORY, "DELETE", id.toString(), undefined, true);
  }
};