import { render, screen, fireEvent } from "@testing-library/react";
import { ModalInventoryType } from "@/components/inventory/ModalInventoryType"; 
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock del servicio de inventarios
vi.mock("@/services/inventory", () => ({
  inventoryService: {
    createType: vi.fn(),
  },
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

    // Buscamos por el texto exacto del placeholder que tiene el componente real
    const inputNombre = screen.getByPlaceholderText("Ej: Inventario C (Tecnología)") as HTMLInputElement;

    // Simulamos la escritura del usuario en la interfaz
    fireEvent.change(inputNombre, { target: { value: "Línea Blanca" } });

    expect(inputNombre.value).toBe("Línea Blanca");
  });
});