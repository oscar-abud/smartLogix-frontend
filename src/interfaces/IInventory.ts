export interface IInventory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  totalItems?: number;
  totalUsers?: number;
  userIds?: string[];
}

export interface ICreateInventoryDto {
  name: string;
  description?: string;
}