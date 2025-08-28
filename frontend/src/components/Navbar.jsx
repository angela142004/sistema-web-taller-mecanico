// src/components/Navbar.jsx
import React, { useState } from "react";
import { Menu, X, Settings } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-lg shadow-md">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h1 className="font-bold text-lg tracking-wide">MULTISERVICIOS</h1>
              <p className="text-xs text-slate-300 -mt-1">
                AUTOMOTRIZ KLEBERTH
              </p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a
                href="#inicio"
                className="text-white hover:text-purple-400 transition-colors duration-200 font-medium relative group"
              >
                Inicio
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#nosotros"
                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
              >
                Nosotros
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#servicios"
                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
              >
                Servicios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#procesos"
                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium relative group"
              >
                Procesos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>

          {/* Botón menú - Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-slate-300 hover:text-white p-2 rounded-md transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/70 rounded-lg mt-2 backdrop-blur-sm shadow-md">
            <a
              href="#inicio"
              className="text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Inicio
            </a>
            <a
              href="#nosotros"
              className="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Nosotros
            </a>
            <a
              href="#servicios"
              className="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Servicios
            </a>
            <a
              href="#procesos"
              className="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Procesos
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
