// src/components/Navbar.jsx
import React, { useState } from "react";
import { Menu, X, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation(); // 👈 obtiene la ruta actual

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const links = [
    { to: "/", label: "Inicio" },
    { to: "/nosotros", label: "Nosotros" },
    { to: "/servicios", label: "Servicios" },
    { to: "/procesos", label: "Procesos" },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-2xl shadow-lg transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 group-hover:shadow-purple-500/40">
              <Settings className="h-6 w-6 text-white animate-spin-slow" />
            </div>
            <div className="text-white select-none">
              <h1 className="font-extrabold text-xl tracking-wide leading-tight transition-transform duration-500 group-hover:translate-x-1 group-hover:scale-110">
                MULTISERVICIOS
              </h1>
              <p className="text-sm text-slate-400 -mt-1 transition-colors duration-500 group-hover:text-purple-400">
                AUTOMOTRIZ KLEBERTH
              </p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-10">
              {links.map((link) => {
                const isActive = pathname === link.to; // 👈 compara la ruta actual
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`transition-all duration-300 font-semibold relative group text-lg ${
                      isActive
                        ? "text-white font-extrabold"
                        : "text-slate-300 hover:text-purple-400"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-purple-500 transition-all duration-500 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    ></span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Botón menú - Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-slate-300 hover:text-white p-2 rounded-md transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-3 bg-slate-800/90 rounded-lg mt-3 backdrop-blur-sm shadow-lg">
            {links.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 rounded-md text-lg font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-white font-bold bg-slate-700"
                      : "text-slate-300 hover:text-purple-400 hover:bg-slate-700/70"
                  }`}
                  onClick={() => setIsMenuOpen(false)} // cerrar menú al hacer click
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
