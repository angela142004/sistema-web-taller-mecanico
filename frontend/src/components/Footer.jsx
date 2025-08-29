// src/components/Footer.jsx
import React from 'react';
import { Phone, Lock, Globe } from 'lucide-react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Título */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left 
        text-white tracking-tight leading-snug transition-transform duration-500 
        hover:scale-105 hover:text-purple-300">
        Contáctame
        </h2>

        {/* Contenedor principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Teléfono */}
          <div className="flex items-start space-x-2 hover:scale-105 transition-transform">
            <div className="p-1.5 rounded-full bg-slate-800 flex-shrink-0">
              <Phone className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-white text-sm md:text-base font-medium">
              +51 942 465 422
            </span>
          </div>

          {/* Políticas */}
          <div className="flex items-start space-x-2 hover:scale-105 transition-transform">
            <div className="p-1.5 rounded-full bg-slate-800 flex-shrink-0">
              <Lock className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-white/80 text-xs md:text-sm">
              Políticas de privacidad y términos del sistema.
            </span>
          </div>

          {/* Derechos */}
          <div className="flex items-start space-x-2 hover:scale-105 transition-transform">
            <div className="p-1.5 rounded-full bg-slate-800 flex-shrink-0">
              <Globe className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-white/80 text-xs md:text-sm">
              Derechos reservados © MULTISERVICIOS AUTOMOTRIZ KLEBERTH – 2025.
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
