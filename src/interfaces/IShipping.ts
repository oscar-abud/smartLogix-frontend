import type { Order } from "./IOrders";

export interface IFormManualDataPayload {
  recipientName: string;
  shippingAddress: string;
  shippingDistrict: string;
  shippingCity: string;
}

export interface ICreateShippingPayload {
  order: Order;
  formManualData: IFormManualDataPayload;
}