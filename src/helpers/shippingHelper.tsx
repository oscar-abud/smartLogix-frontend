export const renderShippingStatusBadge = (status: string) => {
  switch (status) {
    case "PREPARING":
      return <span className="badge bg-secondary text-uppercase fw-semibold px-2.5 py-1.5">📦 En Preparación</span>;
    case "IN_TRANSIT":
      return <span className="badge bg-info text-dark text-uppercase fw-semibold px-2.5 py-1.5">🚚 En Tránsito</span>;
    case "DELIVERED":
      return <span className="badge bg-success text-uppercase fw-semibold px-2.5 py-1.5">✅ Entregado</span>;
    case "FAILED":
      return <span className="badge bg-danger text-uppercase fw-semibold px-2.5 py-1.5">❌ Fallido</span>;
    default:
      return <span className="badge bg-dark text-uppercase fw-semibold px-2.5 py-1.5">{status}</span>;
  }
};