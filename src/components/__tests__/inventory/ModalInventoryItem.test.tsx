import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ModalInventoryItem } from "@/components/inventory/ModalInventoryItem";
import { inventoryService } from "@/services/inventory";
import { toast } from "sonner";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/inventory", () => ({
  inventoryService: {
    getAll: vi.fn(),
    getTypes: vi.fn(),
    createItem: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("Componente ModalInventoryItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulamos respuestas vacías válidas para los catálogos del backend
    vi.mocked(inventoryService.getAll).mockResolvedValue([]);
    vi.mocked(inventoryService.getTypes).mockResolvedValue([]);
  });

  it("no debe mostrar nada si isOpen se encuentra configurado en false", () => {
    const { container } = render(
      <ModalInventoryItem isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe invocar la carga de datos y desplegar los formularios al abrir el modal", async () => {
    render(<ModalInventoryItem isOpen={true} onClose={vi.fn()} />);

    expect(inventoryService.getAll).toHaveBeenCalled();
    expect(inventoryService.getTypes).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/Código SKU único/i)).toBeInTheDocument();
      expect(screen.getByText(/Nombre del Artículo/i)).toBeInTheDocument();
      expect(screen.getByText(/Precio Unitario \(\$\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Guardar Producto/i)).toBeInTheDocument();
    });
  });

  it("debe mostrar error toast si se envía sin SKU", async () => {
    const { container } = render(<ModalInventoryItem isOpen={true} onClose={vi.fn()} />);
    await screen.findByText("Guardar Producto");

    fireEvent.submit(container.querySelector("form")!);

    expect(toast.error).toHaveBeenCalledWith("El código SKU es obligatorio.");
  });

  it("debe mostrar error toast si el precio es inválido", async () => {
    vi.mocked(inventoryService.getAll).mockResolvedValue([{ id: 1, name: "Bodega 1" }]);
    vi.mocked(inventoryService.getTypes).mockResolvedValue([{ id: 1, name: "Tipo A" }]);

    const { container } = render(<ModalInventoryItem isOpen={true} onClose={vi.fn()} />);
    await screen.findByText("Guardar Producto");

    fireEvent.change(screen.getByPlaceholderText("Ej: HW-SERVER-DELL-99"), { target: { value: "SKU-001" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: Memoria RAM ECC 32GB DDR5"), { target: { value: "Producto Test" } });
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "1" } });
    fireEvent.submit(container.querySelector("form")!);

    expect(toast.error).toHaveBeenCalledWith("El precio debe ser mayor a cero.");
  });

  it("debe registrar el producto exitosamente y cerrar el modal", async () => {
    vi.mocked(inventoryService.getAll).mockResolvedValue([{ id: 1, name: "Bodega 1" }]);
    vi.mocked(inventoryService.getTypes).mockResolvedValue([{ id: 1, name: "Tipo A" }]);
    vi.mocked(inventoryService.createItem).mockResolvedValue({ id: 1 });

    const mockOnClose = vi.fn();
    render(<ModalInventoryItem isOpen={true} onClose={mockOnClose} onSuccess={vi.fn()} />);

    await screen.findByText("Guardar Producto");

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: HW-SERVER-DELL-99"), { target: { value: "SKU-001" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: Memoria RAM ECC 32GB DDR5"), { target: { value: "Producto Test" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: 1490.00"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: 100"), { target: { value: "10" } });
    fireEvent.click(screen.getByText("Guardar Producto"));

    await waitFor(() => {
      expect(inventoryService.createItem).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("debe mostrar error si el servicio createItem falla", async () => {
    vi.mocked(inventoryService.getAll).mockResolvedValue([{ id: 1, name: "Bodega 1" }]);
    vi.mocked(inventoryService.getTypes).mockResolvedValue([{ id: 1, name: "Tipo A" }]);
    vi.mocked(inventoryService.createItem).mockRejectedValue({ response: { data: { message: "SKU duplicado" } } });

    render(<ModalInventoryItem isOpen={true} onClose={vi.fn()} />);
    await screen.findByText("Guardar Producto");

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: HW-SERVER-DELL-99"), { target: { value: "SKU-001" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: Memoria RAM ECC 32GB DDR5"), { target: { value: "Producto Test" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: 1490.00"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("Ej: 100"), { target: { value: "10" } });
    fireEvent.click(screen.getByText("Guardar Producto"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("SKU duplicado");
    });
  });
});