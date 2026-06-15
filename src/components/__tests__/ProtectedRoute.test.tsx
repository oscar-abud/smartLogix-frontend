import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "../ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de Zustand para controlar si el usuario está logueado o no
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("Componente ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe redirigir a /login si no existe un token de autenticación", () => {
    // Simulamos que el store no tiene token
    vi.mocked(useAuthStore).mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Contenido Privado</div>} />
          </Route>
          <Route path="/login" element={<div>Pantalla Login Pública</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Debe mostrar la pantalla de login por descarte
    const loginView = screen.getByText(/Pantalla Login Pública/i);
    expect(loginView).toBeTruthy();
  });

  it("debe mostrar el contenido protegido (Outlet) si existe un token válido", () => {
    // Simulamos que el store sí retorna un token de sesión activo
    vi.mocked(useAuthStore).mockReturnValue("token-valido-123");

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Contenido Privado</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Debe permitir el acceso al texto secreto
    const privateContent = screen.getByText(/Contenido Privado/i);
    expect(privateContent).toBeTruthy();
  });
});