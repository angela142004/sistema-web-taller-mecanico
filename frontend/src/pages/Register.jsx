import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ correo: "", contraseña: "" });
  const [loginError, setLoginError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4001/mecanica/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.usuario,
          correo: formData.email,
          contraseña: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar");
      }

      setSuccess("Usuario registrado correctamente ✅");
      setTimeout(() => {
        navigate("/"); // redirigir al login
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4001/mecanica/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Guardar token y rol en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.user.rol);

      // Redirigir según rol
      if (data.user.rol === "cliente") {
        navigate("/dashboard/cliente");
      } else if (data.user.rol === "admin") {
        navigate("/dashboard/admin");
      } else if (data.user.rol === "mecanico") {
        navigate("/dashboard/mecanico");
      }
    } catch (err) {
      setLoginError("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
      {/* Fondo */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/FondoHome.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-purple-900/30 backdrop-blur-sm"></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center md:items-center">
        {/* Texto bienvenida */}
        <div className="flex flex-col justify-center items-center md:items-start text-gray-100 text-center md:text-left p-4">
          <div className="mb-6 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">
              Plataforma Segura y Confiable
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            “Únete a nuestra comunidad
            <br /> y cuida tu vehículo
            <br /> con confianza y rapidez.”
          </h1>
        </div>

        {/* Formulario */}
        <div className="bg-gray-800/70 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm relative border border-gray-700/50">
          {!showLogin ? (
            <>
              <h2 className="text-white text-3xl font-bold mb-2 text-center">
                ¡Crea una cuenta!
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                Regístrate y comienza hoy
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Usuario */}
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    placeholder="Usuario"
                    required
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                  />
                </div>

                {/* Contraseña */}
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Contraseña"
                    required
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-10 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                  />
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold py-3 rounded-lg shadow-md hover:scale-105 transition"
                >
                  {loading ? "Registrando..." : "REGISTRAR"}
                </button>
              </form>

              {/* Mensajes */}
              {error && (
                <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
              )}
              {success && (
                <p className="text-green-400 text-sm mt-4 text-center">
                  {success}
                </p>
              )}

              {/* Link login */}
              <div className="flex justify-center text-xs mt-4">
                <span className="text-gray-300">¿Ya tienes una cuenta?</span>
                <button
                  type="button"
                  className="text-purple-400 ml-1 hover:underline font-semibold"
                  onClick={() => setShowLogin(true)}
                >
                  Inicia sesión ahora
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-white text-3xl font-bold mb-2 text-center">
                Iniciar sesión
              </h2>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="email"
                    name="correo"
                    value={loginData.correo}
                    onChange={handleLoginChange}
                    placeholder="Correo"
                    required
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="password"
                    name="contraseña"
                    value={loginData.contraseña}
                    onChange={handleLoginChange}
                    placeholder="Contraseña"
                    required
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold py-3 rounded-lg shadow-md hover:scale-105 transition"
                >
                  {loading ? "Ingresando..." : "INGRESAR"}
                </button>
              </form>
              {loginError && (
                <p className="text-red-400 text-sm mt-4 text-center">
                  {loginError}
                </p>
              )}
              <div className="flex justify-center text-xs mt-4">
                <span className="text-gray-300">¿No tienes una cuenta?</span>
                <button
                  type="button"
                  className="text-purple-400 ml-1 hover:underline font-semibold"
                  onClick={() => setShowLogin(false)}
                >
                  Regístrate ahora
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
