import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchData } from "@/services/api/index";
import { useAuthStore } from "@/store/useAuthStore";
import { CONST_ENDPOINT_LOGIN } from "@/services/api/constants";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Por favor, rellena todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchData(CONST_ENDPOINT_LOGIN, "POST", undefined, {
        email,
        password,
      });

      setAuth(data.user, data.access_token);
      sessionStorage.setItem(
        "token",
        JSON.stringify({ token: data.access_token }),
      );

      toast.success(`¡Bienvenido de vuelta, ${data.user.email}!`);
      navigate("/dashboard");
    } catch (error: string | any) {
      console.error("El inicio de sesión falló:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-10 col-sm-8 col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 p-4">
            <div className="card-body">
              <h3 className="card-title text-center mb-4 fw-bold text-primary">
                <span style={{ color: "black" }}>Smart-</span>logix Login
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ejemplo@smartlogix.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary small fw-semibold">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    "Ingresar al Sistema"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
