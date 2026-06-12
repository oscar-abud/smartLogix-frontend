// Interfaz para el objeto anidado del Producto
export interface ProductDetail {
  id: number;
  name: string;
  sku: string;
}

// Interfaz para cada item dentro de la Orden
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;          // Viene como string del backend ("1490.00")
  product: ProductDetail; // Relación anidada con los datos del producto
}

// Tipado estricto para los estados posibles de la Orden
export type OrderStatus = 'PENDING' | 'PROCESSED' | 'CANCELLED';

// Interfaz principal de la Orden (Estructura Raíz)
export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: string;    // Viene como string del backend ("14900.00")
  createdAt: string;      // Formato ISO string ("2026-06-11T02:14:45.562Z")
  items: OrderItem[];     // Arreglo de sub-ítems
}