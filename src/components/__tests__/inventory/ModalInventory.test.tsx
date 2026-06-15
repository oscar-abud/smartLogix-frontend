import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModalInventory } from "@/components/inventory/ModalInventory";
import { inventoryService } from "@/services/inventory";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";

// Simulamos el servicio de inventario y la librería de alertas 'sonner'
vi.mock("@/services/inventory", () => ({
  inventoryService: {
    create: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Componente ModalInventory", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no debe renderizar el contenido en pantalla si isOpen es false", () => {
    const { container } = render(
      <ModalInventory isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe renderizar los campos del formulario cuando el modal está abierto", () => {
    render(<ModalInventory isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText("Nombre del Almacén")).toBeTruthy();
    expect(screen.getByPlaceholderText("Ej: Bodega Central Norte")).toBeTruthy();
    expect(screen.getByText("Guardar Almacén")).toBeTruthy();
  });

  it("debe lanzar un error de toast si el usuario intenta enviar el formulario vacío", async () => {
    render(<ModalInventory isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const botonGuardar = screen.getByText("Guardar Almacén");
    fireEvent.click(botonGuardar);

    expect(toast.error).toHaveBeenCalledWith("El nombre del almacén es obligatorio");
    expect(inventoryService.create).not.toHaveBeenCalled();
  });
});