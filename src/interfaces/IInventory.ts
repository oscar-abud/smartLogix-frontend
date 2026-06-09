export interface IInventory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  totalItems?: number;
  totalUsers?: number;
  userIds?: string[];
}

export interface IItem {
  id: number;
  sku: string;
  name: string;
  price: string;
  stockAvailable: number;
  stockReserved: number;
  inventoryTypeId: number;
}

export interface IUserAssigned {
  id: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

export interface IInventoryDetail {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  items: IItem[];
  totalItems: number;
  totalUsers: number;
  userIds: string[];
  users: IUserAssigned[];
}

export interface ICreateInventoryDto {
  name: string;
  description?: string;
}