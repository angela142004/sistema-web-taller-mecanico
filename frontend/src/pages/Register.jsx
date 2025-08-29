// src/pages/Register.jsx
import React from 'react';
import { Link } from "react-router-dom";

const Register = () => {
return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
    
      {/* Fondo con imagen y overlay */}
    <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/FondoHome.jpg')" }}
    >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    </div>

      {/* Contenido principal */}
    <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center md:items-center animate-fadeIn">
        
        {/* Hero / Mensaje de bienvenida */}
        <div className="flex flex-col justify-center items-center md:items-start text-gray-100 text-center md:text-left p-4 animate-fadeInUp">
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
            “Únete a nuestra comunidad<br />y cuida tu vehículo<br />con confianza y rapidez.”
        </p>
        </div>

        {/* Formulario de registro */}
        <div className="bg-gray-800/70 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm animate-fadeInUp delay-150">
        <h2 className="text-white text-3xl md:text-4xl font-bold mb-2 text-center">
            ¡Crea una cuenta!
        </h2>
        <p className="text-gray-300 text-base md:text-lg mb-6 text-center">
            Regístrate
        </p>  
        <form className="space-y-4 md:space-y-5">
            
            {/* Usuario */}
            <div>
            <input
                type="text"
                placeholder="Usuario"
                className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 px-4 md:py-4 md:px-5 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            </div>
            
            {/* Contraseña */}
            <div>
            <input
                type="password"
                placeholder="Contraseña"
                className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 px-4 md:py-4 md:px-5 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            </div>

            {/* Email */}
            <div>
            <input
                type="email"
                placeholder="Email"
                className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 px-4 md:py-4 md:px-5 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            </div>

            {/* Botón de registrar */}
            <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold py-3 md:py-4 rounded-lg 
            shadow-md hover:scale-105 hover:shadow-xl transition-transform duration-200"
            >
            REGISTRAR
            </button>
        </form>

          {/* Enlaces */}
        <div className="flex justify-center text-xs mt-4 md:mt-5">
            <span className="text-gray-300">¿Ya tienes una cuenta?</span>
            <Link to="/" className="text-purple-400 ml-1 hover:underline">
            Inicia sesión ahora
            </Link>
        </div>
        </div>
    </div>
    </div>
);
};

export default Register;
