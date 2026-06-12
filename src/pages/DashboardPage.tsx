import { DataTableUsers } from "@/components/users/DataTableUsers";
import type { Order } from "@/interfaces/IOrders";
import { fetchData } from "@/services/api";
import { CONST_ENDPOINT_ORDERS } from "@/services/api/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);

  async function getOrders() {
    try {
      const response = await fetchData(CONST_ENDPOINT_ORDERS, "GET")
      setOrders(response)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getOrders()
  }, [])

  return (
    <div className="container-fluid p-0">
      {/* Bienvenida superior */}
      <div className="mb-4 bg-light p-4 rounded-3 border-start border-primary border-4">
        <h2 className="fw-bold text-dark m-0">📊 Panel de Control General</h2>
        <p className="text-secondary m-0 mt-1">
          Hola, <strong className="text-primary">{user?.email}</strong>. Estás
          operando con el perfil de:
          <span className="badge bg-dark ms-2">{user?.role.name || "USER"}</span>
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border shadow-sm p-3 bg-white h-100">
            <h6 className="text-uppercase text-muted small fw-bold">
              Almacén General
            </h6>
            <h3 className="m-0 fw-bold text-success">Activo</h3>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border shadow-sm p-3 bg-white h-100">
            <h6 className="text-uppercase text-muted small fw-bold">
              Órdenes Pendientes
            </h6>
            <h3 className="m-0 fw-bold text-warning">{orders.filter(order => order.status === 'PENDING').length} Pedidos</h3>
          </div>
        </div>
      </div>

      {/* INYECCIÓN DE DATA TABLE */}
      <div className="border rounded p-3 bg-white shadow-sm">
        <DataTableUsers />
      </div>
    </div>
  );
};
