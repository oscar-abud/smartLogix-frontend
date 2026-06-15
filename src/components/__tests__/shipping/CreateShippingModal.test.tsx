import { render, screen, fireEvent } from "@testing-library/react";
import { CreateShippingModal } from "../../shipping/CreateShippingModal"; 
import { describe, it, expect, vi } from "vitest";
import type { Order } from "@/interfaces/IOrders";

// Mock de una orden de prueba para pasársela como propiedad (Prop) al modal
const mockOrder = {
  id: "order-999",
  totalPrice: 45000,
  status: "PENDING",
  items: [],
} as unknown as Order;

vi.mock("@/services/shipping", () => ({
  shippingService: {
    create: vi.fn(() => Promise.resolve({ success: true })),
  },
}));

describe("Componente CreateShippingModal", () => {
  it("debe mostrar el formulario de despacho con las etiquetas de dirección", () => {
    render(<CreateShippingModal order={mockOrder} onClose={vi.fn()} />);

    expect(screen.getByText("Comuna")).toBeTruthy();
    expect(screen.getByText("Ciudad")).toBeTruthy();
    expect(screen.getByText("🚚 Confirmar y Despachar")).toBeTruthy();
  });

  it("debe actualizar los estados temporales al escribir en los inputs de destino", () => {
    const { container } = render(<CreateShippingModal order={mockOrder} onClose={vi.fn()} />);

    // Buscamos directamente usando el atributo nativo 'name' del HTML
    const inputCiudad = container.querySelector('input[name="shippingCity"]') as HTMLInputElement;
    
    // Simulamos que el operador escribe la ciudad de entrega en el formulario
    fireEvent.change(inputCiudad, { target: { value: "Concepción" } });

    expect(inputCiudad.value).toBe("Concepción");
  });
});