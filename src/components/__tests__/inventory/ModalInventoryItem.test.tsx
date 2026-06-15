import { render, screen, waitFor } from "@testing-library/react";
import { ModalInventoryItem } from "@/components/inventory/ModalInventoryItem";
import { inventoryService } from "@/services/inventory";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Simulamos los métodos del servicio de inventarios
vi.mock("@/services/inventory", () => ({
  inventoryService: {
    getAll: vi.fn(),
    getTypes: vi.fn(),
  },
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

    // Verificamos que se ejecuten las consultas iniciales del catálogo
    expect(inventoryService.getAll).toHaveBeenCalled();
    expect(inventoryService.getTypes).toHaveBeenCalled();

    // Esperamos a que finalice el estado 'loadingData' interno y compruebe las etiquetas del DOM real
    await waitFor(() => {
      // Usamos expresiones regulares /.../i para ignorar problemas de mayúsculas/minúsculas de forma segura
      expect(screen.getByText(/Código SKU único/i)).toBeInTheDocument();
      expect(screen.getByText(/Nombre del Artículo/i)).toBeInTheDocument();
      expect(screen.getByText(/Precio Unitario \(\$\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Guardar Producto/i)).toBeInTheDocument();
    });
  });
});