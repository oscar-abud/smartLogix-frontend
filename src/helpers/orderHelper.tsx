import type { OrderStatus } from "@/interfaces/IOrders";

/**
 * Retorna un componente Badge de Bootstrap estilizado según el estado de la orden.
 */
export const renderStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return <span className="badge bg-warning text-dark px-3 py-2">PENDING</span>;
    case "PROCESSED":
      return <span className="badge bg-success px-3 py-2">PROCESSED</span>;
    case "CANCELLED":
      return <span className="badge bg-danger px-3 py-2">CANCELLED</span>;
    default:
      return <span className="badge bg-secondary px-3 py-2">{status}</span>;
  }
};