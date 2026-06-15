import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModalInventoryType } from "@/components/inventory/ModalInventoryType";
import { inventoryService } from "@/services/inventory";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/inventory", () => ({
  inventoryService: {
    createType: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("Componente ModalInventoryType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no debe mostrar nada si isOpen se encuentra configurado en false", () => {
    const { container } = render(
      <ModalInventoryType isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe permitir escribir en el input de nombre de categoría", () => {
    render(<ModalInventoryType isOpen={true} onClose={vi.fn()} />);

    const inputNombre = screen.getByPlaceholderText("Ej: Inventario C (Tecnología)") as HTMLInputElement;
    fireEvent.change(inputNombre, { target: { value: "Línea Blanca" } });

    expect(inputNombre.value).toBe("Línea Blanca");
  });

  it("debe mostrar error si se envía con nombre vacío", () => {
    const { container } = render(<ModalInventoryType isOpen={true} onClose={vi.fn()} />);
    fireEvent.submit(container.querySelector("form")!);
    expect(toast.error).toHaveBeenCalledWith("El nombre de la categoría es obligatorio");
  });

  it("debe mostrar error si el nombre tiene menos de 3 caracteres", () => {
    render(<ModalInventoryType isOpen={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Ej: Inventario C (Tecnología)"), { target: { value: "AB" } });
    fireEvent.click(screen.getByText("Crear Categoría"));

    expect(toast.error).toHaveBeenCalledWith("El nombre debe tener al menos 3 caracteres.");
  });

  it("debe crear la categoría exitosamente y cerrar el modal", async () => {
    vi.mocked(inventoryService.createType).mockResolvedValue({ message: "Categoría creada" });
    const mockOnClose = vi.fn();

    render(<ModalInventoryType isOpen={true} onClose={mockOnClose} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Ej: Inventario C (Tecnología)"), { target: { value: "Electrónica" } });
    fireEvent.click(screen.getByText("Crear Categoría"));

    await waitFor(() => {
      expect(inventoryService.createType).toHaveBeenCalledWith({ name: "Electrónica", description: undefined });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("debe llamar a onClose al presionar Cancelar", () => {
    const mockOnClose = vi.fn();
    render(<ModalInventoryType isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });
});