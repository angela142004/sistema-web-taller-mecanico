// src/components/Footer.jsx

import React from 'react';
import { Phone, Lock, Globe } from 'lucide-react';

const Footer = () => {
return (
    <footer className="bg-slate-900 text-white py-8">
    <div className="max-w-7xl mx-auto px-4">
        
        {/* Título de la sección */}
        <h2 className="text-2xl font-bold mb-6">Contáctame</h2>
        
        {/* Contenedor principal de la información */}
        <div className="flex flex-col space-y-4">
          {/* Teléfono */}
        <div className="flex items-start space-x-3">
            <div className="p-2 rounded-full bg-slate-800 flex-shrink-0">
            <Phone className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex flex-col">
            <span className="text-white text-base md:text-lg font-medium">+51 942 465 422</span>
            </div>
        </div>

          {/* Políticas de Privacidad */}
        <div className="flex items-start space-x-3">
            <div className="p-2 rounded-full bg-slate-800 flex-shrink-0">
            <Lock className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-white/80 text-xs md:text-base">
            Políticas de privacidad y términos del sistema.
            </span>
        </div>

          {/* Derechos de Autor */}
        <div className="flex items-start space-x-3">
            <div className="p-2 rounded-full bg-slate-800 flex-shrink-0">
            <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-white/80 text-xs md:text-base">
            Derechos reservados © MULTISERVICIOS AUTOMOTRIZ KLEBERTH – 2025.
            </span>
        </div>
        </div>
    </div>
    </footer>
);
};

export default Footer;