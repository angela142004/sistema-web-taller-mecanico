import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Search,
  Loader2,
} from "lucide-react";

// URL de la API (Backend)
const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const navigate = useNavigate();

  // === ESTADOS ===
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Carga general (Registro/Login)
  const [loadingDni, setLoadingDni] = useState(false); // Carga específica para DNI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  // Datos del formulario de Registro
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    correo: "",
    password: "",
  });

  // Datos del formulario de Login
  const [loginData, setLoginData] = useState({ correo: "", contraseña: "" });
  const [loginError, setLoginError] = useState("");

  // === HANDLERS REGISTRO ===

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validación DNI: Solo números y máximo 8 caracteres
    if (name === "dni") {
      const val = value.replace(/\D/g, "").slice(0, 8);
      setFormData({ ...formData, dni: val });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 🔍 BUSCAR DNI (Conexión al Backend -> API Externa)
  const handleSearchDNI = async () => {
    if (formData.dni.length !== 8) {
      setError("El DNI debe tener 8 dígitos");
      return;
    }

    setLoadingDni(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API}/mecanica/consulta-dni/${formData.dni}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al buscar DNI");

      // Si encuentra datos, rellenamos el nombre
      if (data.nombreCompleto) {
        setFormData((prev) => ({ ...prev, nombre: data.nombreCompleto }));
        setSuccess("✅ Datos encontrados");
        // Ocultamos el mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setFormData((prev) => ({ ...prev, nombre: "" }));

      if (err.message.includes("503")) {
        setError("⚠️ El servicio de DNI no está disponible, intenta más tarde");
      } else {
        setError("❌ No se pudo validar el DNI");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validación: No dejar registrar si no hay nombre (obliga a usar la lupa)
    if (!formData.nombre)
      return setError("Primero valida tu DNI con la lupa 🔍");

    setLoading(true);

    try {
      const response = await fetch(`${API}/mecanica/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: formData.dni,
          nombre: formData.nombre,
          correo: formData.correo,
          contraseña: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error al registrar");

      setSuccess("✅ " + data.message);
      // Opcional: Redirigir al login después de unos segundos
      // setTimeout(() => setShowLogin(true), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === HANDLERS LOGIN ===

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/mecanica/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || "Error al iniciar sesión");
        return;
      }

      // Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.user.rol);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("id_usuario", data.user.id_usuario);

      if (data.user.rol === "cliente" && data.user.id_cliente) {
        localStorage.setItem("id_cliente", data.user.id_cliente);
      }

      // Redirección
      if (data.user.rol === "cliente") navigate("/dashboard/cliente");
      else if (data.user.rol === "admin") navigate("/dashboard/admin");
      else if (data.user.rol === "mecanico") navigate("/dashboard/mecanico");
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

      {/* Contenido Principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center md:items-center">
        {/* Texto Bienvenida */}
        <div className="flex flex-col justify-center items-center md:items-start text-gray-100 text-center md:text-left p-4">
          <div className="mb-6 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">
              Plataforma Segura y Confiable
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            “Únete a nuestra comunidad <br /> y cuida tu vehículo <br /> con
            confianza.”
          </h1>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-gray-800/70 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm relative border border-gray-700/50">
          {/* === MODO REGISTRO === */}
          {!showLogin ? (
            <>
              <h2 className="text-white text-3xl font-bold mb-2 text-center">
                ¡Crea una cuenta!
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                Ingresa tu DNI para comenzar
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* CAMPO DNI + BOTÓN LUPA */}
                <div className="flex gap-2">
                  <div className="relative group flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <input
                      type="text"
                      name="dni"
                      maxLength={8}
                      value={formData.dni}
                      onChange={handleInputChange}
                      placeholder="DNI"
                      className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchDNI}
                    disabled={loadingDni || formData.dni.length !== 8}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                    title="Buscar datos"
                  >
                    {loadingDni ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* CAMPO NOMBRE (Solo Lectura) */}
                <div
                  className={`relative group ${
                    formData.nombre ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="text"
                    name="usuario" // Este nombre es solo visual, usamos formData.nombre
                    value={formData.nombre}
                    readOnly
                    placeholder="Nombre Completo (Automático)"
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-not-allowed"
                  />
                </div>

                {/* CAMPO EMAIL */}
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type="email"
                    name="email"
                    value={formData.correo}
                    onChange={(e) =>
                      setFormData({ ...formData, correo: e.target.value })
                    }
                    placeholder="Email Gmail"
                    required
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                  />
                </div>

                {/* CAMPO CONTRASEÑA */}
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Contraseña"
                    required
                    className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-700/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold py-3 rounded-lg shadow-md hover:scale-105 transition disabled:opacity-70"
                >
                  {loading ? "Registrando..." : "REGISTRAR"}
                </button>
              </form>

              {/* Mensajes de error/éxito */}
              {error && (
                <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
              )}
              {success && (
                <p className="text-green-400 text-sm mt-4 text-center">
                  {success}
                </p>
              )}

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
            // === MODO LOGIN (Sin cambios funcionales) ===
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
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold py-3 rounded-lg shadow-md hover:scale-105 transition disabled:opacity-70"
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
