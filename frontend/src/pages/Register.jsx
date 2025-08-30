// src/pages/Register.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Star,
  Users,
} from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
    email: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
      {/* Fondo con imagen y overlay mejorado */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/FondoHome.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-purple-900/30 backdrop-blur-sm"></div>
        {/* Elementos decorativos flotantes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center md:items-center animate-fadeIn">
        {/* Hero / Mensaje de bienvenida mejorado */}
        <div className="flex flex-col justify-center items-center md:items-start text-gray-100 text-center md:text-left p-4 animate-fadeInUp">
          {/* Badge de confianza */}
          <div className="mb-6 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">
              Plataforma Segura y Confiable
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-lg mb-6">
            “Únete a nuestra
            <br />
            comunidad y cuida tu vehículo
            <br />
            con confianza y rapidez.”
          </h1>
        </div>

        {/* Formulario de registro mejorado */}
        <div className="bg-gray-800/70 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeInUp delay-150 relative overflow-hidden border border-gray-700/50">
          {/* Elemento decorativo superior */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-700"></div>

          <div className="pt-8">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-2 text-center">
              ¡Crea una cuenta!
            </h2>
            <p className="text-gray-300 text-base md:text-lg mb-6 text-center">
              Regístrate y comienza hoy
            </p>

            <form className="space-y-4 md:space-y-5">
              {/* Usuario */}
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-purple-400 z-10" />
                <input
                  type="text"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleInputChange}
                  placeholder="Usuario"
                  className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 md:py-4 md:pl-12 md:pr-5 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          hover:bg-gray-700/60 hover:border-gray-500 relative"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-focus-within:from-purple-500/5 group-focus-within:to-purple-700/5 transition-all pointer-events-none"></div>
              </div>

              {/* Contraseña */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-purple-400 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-10 md:py-4 md:pl-12 md:pr-12 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          hover:bg-gray-700/60 hover:border-gray-500 relative"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-focus-within:from-purple-500/5 group-focus-within:to-purple-700/5 transition-all pointer-events-none"></div>
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-purple-400 z-10" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 pl-10 pr-4 md:py-4 md:pl-12 md:pr-5 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
                          hover:bg-gray-700/60 hover:border-gray-500 relative"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-focus-within:from-purple-500/5 group-focus-within:to-purple-700/5 transition-all pointer-events-none"></div>
              </div>

              {/* Botón de registrar */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold py-3 md:py-4 rounded-lg 
                        shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200
                        hover:from-purple-600 hover:to-purple-800 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  REGISTRAR
                  <div className="w-0 group-hover:w-5 transition-all duration-200 overflow-hidden">
                    <User className="w-5 h-5" />
                  </div>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </form>

            {/* Enlaces */}
            <div className="flex justify-center text-xs mt-4 md:mt-5">
              <span className="text-gray-300">¿Ya tienes una cuenta?</span>
              <Link
                to="/"
                className="text-purple-400 ml-1 hover:underline hover:text-purple-300 transition-colors font-semibold"
              >
                Inicia sesión ahora
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos decorativos adicionales */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-30">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  );
};

export default Register;
