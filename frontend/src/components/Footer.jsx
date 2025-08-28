// src/components/Footer.jsx
import React from 'react';
import { Phone, Lock, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Título */}
        <h2 className="text-2xl font-bold mb-8 text-center md:text-left text-purple-400">
          Contáctame
        </h2>
        
        {/* Contenedor principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Teléfono */}
          <div className="flex items-start space-x-3 hover:scale-105 transition-transform">
            <div className="p-2 rounded-full bg-slate-800 flex-shrink-0">
              <Phone className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-white text-base md:text-lg font-medium">
              +51 942 465 422
            </span>
          </div>

          {/* Políticas */}
          <div className="flex items-start space-x-3 hover:scale-105 transition-transform">
            <div className="p-2 rounded-full bg-slate-800 flex-shrink-0">
              <Lock className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-white/80 text-sm md:text-base">
              Políticas de privacidad y términos del sistema.
            </span>
          </div>

          {/* Derechos */}
          <div className="flex items-start space-x-3 hover:scale-105 transition-transform">
            <div className="p-2 rounded-full bg-slate-800 flex-shrink-0">
              <Globe className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-white/80 text-sm md:text-base">
              Derechos reservados © MULTISERVICIOS AUTOMOTRIZ KLEBERTH – 2025.
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
