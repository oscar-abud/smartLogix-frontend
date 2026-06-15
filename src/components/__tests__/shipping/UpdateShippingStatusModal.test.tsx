import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UpdateShippingStatusModal } from "@/components/shipping/UpdateShippingStatusModal"; // Ajusta la ruta si es necesario
import { shippingService } from "@/services/shipping";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 1. Mockear el servicio logístico
vi.mock("@/services/shipping", () => ({
  shippingService: {
    updateStatus: vi.fn(),
  },
}));

// 2. Mockear la librería de notificaciones Sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Componente UpdateShippingStatusModal", () => {
  const mockShipping = {
    orderId: 4502,
    shippingStatus: "PREPARING",
  };

  const defaultProps = {
    shipping: mockShipping,
    onClose: vi.fn(),
    onStatusUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar los títulos correctos, el número de orden y el estado inicial en el select", () => {
    render(<UpdateShippingStatusModal {...defaultProps} />);

    // Verificamos títulos del modal
    expect(screen.getByText("🔄 Modificar Ruta Logística")).toBeInTheDocument();
    expect(screen.getByText("Estado del Envío (Orden #4502)")).toBeInTheDocument();

    // Verificamos que el select tenga el valor por defecto que le pasamos por props ("PREPARING")
    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    expect(selectElement.value).toBe("PREPARING");
  });

  it("debe cambiar el estado interno del select cuando el usuario elige otra opción", () => {
    render(<UpdateShippingStatusModal {...defaultProps} />);

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;

    // Cambiamos el select a "IN_TRANSIT"
    fireEvent.change(selectElement, { target: { value: "IN_TRANSIT" } });
    expect(selectElement.value).toBe("IN_TRANSIT");
  });

  it("debe procesar el envío del formulario con éxito, invocar al servicio, llamar a los callbacks y mostrar un toast", async () => {
    // Simulamos que la API resuelve la promesa de actualización correctamente
    vi.mocked(shippingService.updateStatus).mockResolvedValueOnce({ success: true });

    render(<UpdateShippingStatusModal {...defaultProps} />);

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    // Cambiamos el estado a DELIVERED
    fireEvent.change(selectElement, { target: { value: "DELIVERED" } });

    // Buscamos el botón de enviar que dice "Actualizar" y hacemos click
    const botonActualizar = screen.getByRole("button", { name: "Actualizar" });
    fireEvent.click(botonActualizar);

    // Verificamos secuencialmente los efectos asíncronos esperados
    await waitFor(() => {
      // 1. Se llamó al servicio con los parámetros correctos (orderId, nuevoStatus)
      expect(shippingService.updateStatus).toHaveBeenCalledWith(4502, "DELIVERED");
      
      // 2. Se disparó el mensaje de éxito de Sonner
      expect(toast.success).toHaveBeenCalledWith("Estado del envío #4502 actualizado");
      
      // 3. Se notificó al componente padre que el estado cambió
      expect(defaultProps.onStatusUpdated).toHaveBeenCalledWith(4502, "DELIVERED");
      
      // 4. Se cerró el modal
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("debe manejar un error de la API mostrando un toast de error y manteniendo el modal abierto", async () => {
    // Simulamos que la API falla arrojando un error personalizado
    const apiError = { message: "Error de conexión con el servidor logístico" };
    vi.mocked(shippingService.updateStatus).mockRejectedValueOnce(apiError);

    render(<UpdateShippingStatusModal {...defaultProps} />);

    const botonActualizar = screen.getByRole("button", { name: "Actualizar" });
    fireEvent.click(botonActualizar);

    await waitFor(() => {
      // Verifica que se capture el mensaje de error de la API y lo muestre en el toast.error
      expect(toast.error).toHaveBeenCalledWith("Error de conexión con el servidor logístico");
      
      // Al fallar, NO debe haber cerrado el modal ni notificado el cambio al padre
      expect(defaultProps.onStatusUpdated).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  it("debe invocar onClose al hacer click en el botón 'Cancelar' o en la 'X' de cierre", () => {
    render(<UpdateShippingStatusModal {...defaultProps} />);

    const botonCancelar = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(botonCancelar);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});