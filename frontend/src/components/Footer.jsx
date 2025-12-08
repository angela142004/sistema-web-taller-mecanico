// src/components/Footer.jsx
import React from "react";
import { Phone, Lock, Globe, MapPin, Clock, Mail, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white border-t border-slate-700/50">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Sección Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo y Descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">MULTISERVICIOS</h3>
                <p className="text-sm text-purple-400 font-medium">
                  AUTOMOTRIZ KLEBERTH
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Tu taller de confianza con más de 10 años de experiencia en
              servicios automotrices de calidad.
            </p>
          </div>

          {/* Contacto Rápido */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full mr-3"></div>
              Contacto
            </h4>

            <div className="space-y-3">
              <a
                href="tel:+51952110563"
                className="flex items-center space-x-3 group hover:translate-x-1 transition-transform duration-200"
              >
                <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-purple-600/20 transition-colors duration-200">
                  <Phone className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  +51 952 110 563
                </span>
              </a>

              <div className="flex items-center space-x-3 group">
                <div className="p-2 rounded-lg bg-slate-800/50">
                  <MapPin className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-slate-300 text-sm">
                  Tupac Amaru, Zona A, Chincha
                </span>
              </div>

              <div className="flex items-center space-x-3 group">
                <div className="p-2 rounded-lg bg-slate-800/50">
                  <Clock className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-slate-300 text-sm">
                  Lun - Sáb: 8:00 AM - 8:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* Información Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full mr-3"></div>
              Información
            </h4>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 group">
                <div className="p-2 rounded-lg bg-slate-800/50 flex-shrink-0">
                  <Lock className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Políticas de privacidad y términos del sistema
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="p-2 rounded-lg bg-slate-800/50 flex-shrink-0">
                  <Globe className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Servicio profesional garantizado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Línea Separadora con Gradiente */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <p className="text-slate-400 text-sm">
              © 2025{" "}
              <span className="text-purple-400 font-medium">
                MULTISERVICIOS AUTOMOTRIZ KLEBERTH
              </span>
              . Todos los derechos reservados.
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300">Servicio Activo</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
              <Wrench className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-slate-300">Profesional</span>
            </div>
          </div>
        </div>

        {/* Decoración Final */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full opacity-60 animate-pulse"></div>
            <div
              className="w-1 h-1 bg-violet-500 rounded-full opacity-60 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="w-1 h-1 bg-purple-500 rounded-full opacity-60 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
