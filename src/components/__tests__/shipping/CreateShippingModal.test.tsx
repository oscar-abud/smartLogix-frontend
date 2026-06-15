import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateShippingModal } from "../../shipping/CreateShippingModal";
import { shippingService } from "@/services/shipping";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("Componente CreateShippingModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe mostrar el formulario de despacho con las etiquetas de dirección", () => {
    render(<CreateShippingModal order={mockOrder} onClose={vi.fn()} />);

    expect(screen.getByText("Comuna")).toBeTruthy();
    expect(screen.getByText("Ciudad")).toBeTruthy();
    expect(screen.getByText("🚚 Confirmar y Despachar")).toBeTruthy();
  });

  it("debe actualizar los estados temporales al escribir en los inputs de destino", () => {
    const { container } = render(<CreateShippingModal order={mockOrder} onClose={vi.fn()} />);

    const inputCiudad = container.querySelector('input[name="shippingCity"]') as HTMLInputElement;
    fireEvent.change(inputCiudad, { target: { value: "Concepción" } });

    expect(inputCiudad.value).toBe("Concepción");
  });

  it("debe mostrar error toast si se envía con campos vacíos", () => {
    const { container } = render(<CreateShippingModal order={mockOrder} onClose={vi.fn()} />);

    fireEvent.submit(container.querySelector("form")!);

    expect(toast.error).toHaveBeenCalledWith("Por favor, rellene todos los campos del destino.");
  });

  it("debe llamar al servicio y cerrar el modal al despachar correctamente", async () => {
    const mockOnClose = vi.fn();
    const mockOnShippingCreated = vi.fn();
    const { container } = render(
      <CreateShippingModal order={mockOrder} onClose={mockOnClose} onShippingCreated={mockOnShippingCreated} />
    );

    fireEvent.change(container.querySelector('input[name="recipientName"]') as HTMLInputElement, { target: { value: "Juan Pérez" } });
    fireEvent.change(container.querySelector('input[name="shippingAddress"]') as HTMLInputElement, { target: { value: "Av. Providencia 123" } });
    fireEvent.change(container.querySelector('input[name="shippingDistrict"]') as HTMLInputElement, { target: { value: "Providencia" } });
    fireEvent.change(container.querySelector('input[name="shippingCity"]') as HTMLInputElement, { target: { value: "Santiago" } });

    fireEvent.click(screen.getByText("🚚 Confirmar y Despachar"));

    await waitFor(() => {
      expect(shippingService.create).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("debe llamar a onClose al presionar Cancelar", () => {
    const mockOnClose = vi.fn();
    render(<CreateShippingModal order={mockOrder} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });
});