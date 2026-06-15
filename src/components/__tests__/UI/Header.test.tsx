import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/UI/Header";
import { useAuthStore } from "@/store/useAuthStore";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

// Mocks necesarios para aislar elementos externos del Header
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Componente Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar el nombre de la empresa y los datos del usuario", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { email: "oscar@smartlogix.com", role: { name: "ADMIN" } },
      clearAuth: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Comprobamos marcas de agua y datos iniciales en la navbar
    const brandText = screen.getByText(/smart-/i);
    const subBrandText = screen.getAllByText(/logix/i)[0];
    const userEmail = screen.getAllByText("oscar@smartlogix.com")[0];

    expect(brandText).toBeTruthy();
    expect(subBrandText).toBeTruthy();
    expect(userEmail).toBeTruthy();
  });

  it("debe llamar a clearAuth y navegar a /login al cerrar sesión", () => {
    const mockClearAuth = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { email: "oscar@smartlogix.com", role: { name: "ADMIN" } },
      clearAuth: mockClearAuth,
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Cerrar Sesión/i));

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});