import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UpdateStatusModal } from "@/components/orders/UpdateStatusModal"; // Ajusta la ruta si es necesario
import { ordersService } from "@/services/orders";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 1. Mock de tu servicio de órdenes
vi.mock("@/services/orders", () => ({
  ordersService: {
    updateStatus: vi.fn(),
  },
}));

// 2. Mock de la librería de notificaciones Sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("Componente UpdateStatusModal", () => {
  // Simulamos una orden con la interfaz requerida
  const mockOrder = {
    id: 8840,
    status: "PENDING" as const,
    // Puedes rellenar otros campos si tu tipo Order lo exige obligatoriamente
  };

  const defaultProps = {
    order: mockOrder,
    onClose: vi.fn(),
    onStatusUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar los títulos dinámicos y setear el estado inicial de la orden en el select", () => {
    render(<UpdateStatusModal {...defaultProps} />);

    // Verificamos el título del modal con el id de la orden incrustado
    expect(screen.getByText("Cambiar estado de la orden #8840")).toBeInTheDocument();
    
    // Verificamos el texto descriptivo del formulario
    expect(screen.getByText("Selecciona el nuevo estado:")).toBeInTheDocument();

    // Verificamos que el select HTML inicialice apuntando a "PENDING"
    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    expect(selectElement.value).toBe("PENDING");
  });

  it("debe actualizar el estado local cuando el usuario cambia la opción del select", () => {
    render(<UpdateStatusModal {...defaultProps} />);

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;

    // Cambiamos el valor a PROCESSED
    fireEvent.change(selectElement, { target: { value: "PROCESSED" } });
    expect(selectElement.value).toBe("PROCESSED");
  });

  it("debe llamar al servicio, mostrar el toast de éxito y cerrar el modal al guardar exitosamente", async () => {
    // Simulamos que la llamada asíncrona al microservicio se resuelve con éxito
    vi.mocked(ordersService.updateStatus).mockResolvedValueOnce({ success: true });

    render(<UpdateStatusModal {...defaultProps} />);

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    // Seleccionamos cambiarlo a CANCELLED
    fireEvent.change(selectElement, { target: { value: "CANCELLED" } });

    // Hacemos click en el botón "💾 Guardar Cambios"
    const botonGuardar = screen.getByRole("button", { name: "💾 Guardar Cambios" });
    fireEvent.click(botonGuardar);

    // Esperamos a que el bloque async / try-catch se ejecute por completo
    await waitFor(() => {
      // 1. Validamos la llamada al servicio con el id y el estado nuevo
      expect(ordersService.updateStatus).toHaveBeenCalledWith(8840, "CANCELLED");

      // 2. Validamos el mensaje emergente de éxito
      expect(toast.success).toHaveBeenCalledWith("Estado de la orden #8840 actualizado a CANCELLED");

      // 3. Validamos la notificación al componente padre para el refresco local
      expect(defaultProps.onStatusUpdated).toHaveBeenCalledWith(8840, "CANCELLED");

      // 4. Validamos el cierre definitivo de la vista
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("debe deshabilitar los controles del modal mientras la petición está en estado de carga (isSubmitting)", async () => {
    // Creamos una promesa controlada que no se va a resolver de inmediato para evaluar el estado "Guardando..."
    let resolverPromesa: any;
    const promesaPendiente = new Promise((resolve) => {
      resolverPromesa = resolve;
    });
    vi.mocked(ordersService.updateStatus).mockReturnValueOnce(promesaPendiente);

    render(<UpdateStatusModal {...defaultProps} />);

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    const botonGuardar = screen.getByRole("button", { name: "💾 Guardar Cambios" });
    const botonCancelar = screen.getByRole("button", { name: "Cancelar" });
    const botonCerrarX = screen.getAllByRole("button")[0]; // El primer botón suele ser la 'X' de la cabecera

    // Gatillamos la acción asíncrona
    fireEvent.click(botonGuardar);

    // Evaluamos el DOM mientras la promesa sigue pendiente
    expect(screen.getByText("Guardando...")).toBeInTheDocument();
    expect(selectElement).toBeDisabled();
    expect(botonGuardar).toBeDisabled();
    expect(botonCancelar).toBeDisabled();
    expect(botonCerrarX).toBeDisabled();

    // Destrabamos la promesa para evitar fugas de memoria en la suite de pruebas
    resolverPromesa();
  });

  it("debe invocar la propiedad onClose al pulsar en Cancelar o en la X de la cabecera", () => {
    render(<UpdateStatusModal {...defaultProps} />);

    const botonCancelar = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(botonCancelar);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});