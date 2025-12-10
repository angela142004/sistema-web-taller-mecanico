// src/pages/Home.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react"; // ← asegúrate de tener esto arriba

const Home = () => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (token && rol) {
      if (rol === "admin") navigate("/dashboard/admin", { replace: true });
      else if (rol === "mecanico")
        navigate("/dashboard/mecanico", { replace: true });
      else navigate("/dashboard/cliente", { replace: true });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    if (token && rol) {
      if (rol === "admin") navigate("/dashboard/admin", { replace: true });
      else if (rol === "mecanico")
        navigate("/dashboard/mecanico", { replace: true });
      else navigate("/dashboard/cliente", { replace: true });
    }
  }, []);

  // 🔹 Función para manejar el login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
      const response = await fetch(`${API}/mecanica/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al iniciar sesión");
        return;
      }

      // Guardar token y rol en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.user.rol);
      localStorage.setItem("id_usuario", data.user.id_usuario); // guardar id_usuario también

      console.log("[HOME] Login exitoso, token guardado, rol:", data.user.rol);

      // Redirigir según rol
      if (data.user.rol === "admin") {
        navigate("/dashboard/admin");
      } else if (data.user.rol === "mecanico") {
        navigate("/dashboard/mecanico");
      } else {
        navigate("/dashboard/cliente");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo conectar al servidor");
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4 md:p-8 relative overflow-hidden">
      {/* Fondo con imagen y overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/FondoHome.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center justify-items-center animate-fadeIn">
        {/* Hero / Mensaje de bienvenida */}
        <div className="flex flex-col justify-center items-center md:items-start text-gray-100 text-center md:text-left p-4 animate-fadeInUp">
          <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
            “Confianza,
            <br />
            rapidez y calidad
            <br />
            en el cuidado de
            <br />
            tu vehículo.”
          </p>
        </div>

        {/* Formulario de login */}
        <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-sm mx-auto animate-fadeInUp delay-150 border border-slate-600/30 group">
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #8b5cf6 1px, transparent 1px),
                       radial-gradient(circle at 75% 75%, #a855f7 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          {/* Header del formulario */}
          <div className="relative z-10 text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">
              ¡Bienvenido!
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-20"></div>
            </div>
            <p className="text-slate-300 text-sm">Inicia sesión en tu cuenta</p>
          </div>

          <form className="relative z-10 space-y-5" onSubmit={handleSubmit}>
            {/* Campo correo */}
            <div className="relative group/field">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400 group-focus-within/field:text-purple-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="email"
                placeholder="Correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full bg-slate-700/50 text-white border border-slate-600/50 rounded-xl py-3 pl-12 pr-4 
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 
                  hover:border-slate-500/70 transition-all duration-300 placeholder-slate-400
                  focus:bg-slate-700/70 group-focus-within/field:shadow-lg"
              />
              <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-300 rounded-full"></div>
            </div>

            {/* Campo Contraseña */}
            <div className="relative group/field">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400 group-focus-within/field:text-purple-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="w-full bg-slate-700/50 text-white border border-slate-600/50 rounded-xl py-3 pl-12 pr-12 
      focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 
      hover:border-slate-500/70 transition-all duration-300 placeholder-slate-400
      focus:bg-slate-700/70 group-focus-within/field:shadow-lg"
              />

              {/* Botón para mostrar / ocultar */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 
               hover:text-purple-300 transition-colors"
              >
                {!showPassword ? (
                  // 👁️ Ojo normal = contraseña oculta (estado inicial)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 
             4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  // 👁️ Tachado = contraseña visible (cuando presiona)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 
             0-8.268-2.943-9.542-7a9.97 9.97 0 012.563-4.261M6.18 
             6.18A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 
             9.542 7a9.964 9.964 0 01-4.043 5.137M6.18 
             6.18L3 3m3.18 3.18l12 12"
                    />
                  </svg>
                )}
              </button>

              <div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500 
              scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-300 rounded-full"
              ></div>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              className="relative w-full overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 
                text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl 
                transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 
                group/button border border-purple-400/20"
            >
              <span className="relative z-10 tracking-wider">
                INICIAR SESIÓN
              </span>
            </button>
          </form>

          {/* Mostrar error si hay */}
          {error && (
            <p className="text-red-400 text-sm text-center mt-4">{error}</p>
          )}

          {/* Enlace a registro */}
          <div className="relative z-10 text-center space-y-3 mt-6">
            <div className="text-sm">
              <span className="text-slate-300">¿No tienes una cuenta? </span>
              <Link
                to="/register"
                className="text-purple-400 font-medium hover:text-purple-300 transition-colors duration-200 hover:underline decoration-purple-400/50 underline-offset-4"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
