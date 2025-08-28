// src/pages/Home.jsx

import React from 'react';

const Home = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Fondo con imagen y overlay de desenfoque */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/FondoHome.jpg')" }}
      >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
      </div>

      {/* Contenedor principal del contenido (frase y formulario) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center h-full">

        {/* Sección de la izquierda: "Hero" o Mensaje de bienvenida */}
        <div className="flex flex-col justify-center items-center md:items-start text-white text-center md:text-left p-4">
          <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            “Confianza,<br />rapidez y calidad<br />en el cuidado de<br />tu vehículo.”
          </p>
        </div>

        {/* Sección de la derecha: Formulario de inicio de sesión */}
        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-8 md:p-10 rounded-2xl shadow-lg w-full max-w-sm mx-auto">
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-2 text-center">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-6 text-center">
            Iniciemos sesión en tu cuenta
          </p>
          
          <form className="space-y-4 md:space-y-5">
            {/* Campo de Usuario */}
            <div>
              <input
                type="text"
                placeholder="Usuario"
                className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 px-4 md:py-4 md:px-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
              />
            </div>
            
            {/* Campo de Contraseña */}
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 px-4 md:py-4 md:px-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
              />
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-3 md:py-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              LOGIN
            </button>
          </form>

          {/* Enlaces de registro */}
          <div className="flex justify-center text-xs mt-4 md:mt-5">
            <span className="text-white/80">¿No tienes una cuenta?</span>
            <a href="#" className="text-blue-400 ml-1 hover:underline">
              Registrar ahora
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;