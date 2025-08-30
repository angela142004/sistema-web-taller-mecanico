// src/pages/Nosotros.jsx
import React from "react";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Nosotros = () => {
  return (
    <section className="relative w-full min-h-screen py-16">
      {/* Fondo con imagen y overlay de desenfoque */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/FondoNosotros.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md mix-blend-multiply"></div>
      </div>

      {/* Contenedor principal con márgenes como en Servicios */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Título principal centrado */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-xl flex items-center justify-center shadow-2xl max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mr-4">
              MULTISERVICIOS AUTOMOTRIZ KLEBERTH
            </h1>
            <BarChart3 className="h-8 w-8 text-white flex-shrink-0" />
          </div>
        </div>

        {/* Grid principal de 2 columnas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16">
          {/* Columna Izquierda: Información de la Empresa */}
          <div className="space-y-8">
            {/* Imagen del taller */}
            <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src="/images/nosotros/taller.jpg"
                alt="Taller Automotriz"
                className="w-full h-72 object-cover"
              />
            </div>

            {/* Descripción de la empresa */}
            <div className="bg-slate-800/80 p-8 rounded-2xl shadow-xl space-y-6 border border-slate-600/30 hover:border-violet-400/50 transition-all duration-300 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Quiénes Somos
              </h2>
              <div className="space-y-4 text-slate-200 leading-relaxed">
                <p>
                  En Multiservicios Automotriz Kleberth nos dedicamos a brindar
                  soluciones integrales para el cuidado, mantenimiento y
                  reparación de vehículos, con el compromiso de ofrecer un
                  servicio de calidad, confianza y responsabilidad.
                </p>
                <p>
                  Con un equipo especializado y en constante capacitación,
                  trabajamos para garantizar la seguridad y satisfacción de
                  nuestros clientes, adaptándonos a sus necesidades y utilizando
                  herramientas y técnicas modernas.
                </p>
                <p className="font-medium text-violet-300">
                  Nuestro objetivo es ser el taller automotriz de confianza en
                  la región, ofreciendo atención personalizada, precios justos y
                  un servicio eficiente que respalde la confianza que nuestros
                  clientes depositan en nosotros.
                </p>
              </div>
            </div>

            {/* Misión y Visión en Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/80 p-6 rounded-2xl shadow-xl border border-slate-600/30 hover:border-violet-400/50 transition-all duration-300 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 text-fuchsia-400 text-center">
                  Misión
                </h3>
                <p className="text-slate-300 italic leading-relaxed text-sm">
                  "Proveer servicios automotrices de alta calidad con un enfoque
                  en la satisfacción total del cliente, utilizando tecnología de
                  punta y personal altamente capacitado para garantizar la
                  confiabilidad y seguridad de todos los vehículos que
                  atendemos."
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl shadow-xl border border-slate-600/30 hover:border-violet-400/50 transition-all duration-300 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 text-fuchsia-400 text-center">
                  Visión
                </h3>
                <p className="text-slate-300 italic leading-relaxed text-sm">
                  "Ser el taller automotriz de confianza en la región,
                  ofreciendo atención personalizada, precios justos y un
                  servicio eficiente que respalde la confianza que nuestros
                  clientes depositan en nosotros."
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Fundador e Información Legal */}
          <div className="space-y-8">
            {/* Tarjeta del Fundador Modernizada */}
            <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500 border border-slate-600/30 hover:border-violet-400/50 group backdrop-blur-sm">
              {/* Efecto de brillo sutil en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full"></div>

              {/* Contenedor de la imagen con marco moderno */}
              <div className="relative p-6 pb-4">
                <div className="relative mx-auto w-56 h-56 lg:w-64 lg:h-64">
                  {/* Marco exterior con gradiente */}
                  <div className="absolute -inset-3 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Marco interior */}
                  <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 shadow-inner">
                    {/* Imagen del fundador */}
                    <img
                      src="/images/nosotros/fundador.png"
                      alt="Fundador"
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                    />

                    {/* Overlay sutil */}
                    <div className="absolute inset-3 rounded-lg bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Decoración geométrica */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-violet-500 rounded-full opacity-70 animate-pulse"></div>
                  <div
                    className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-500 rounded-full opacity-70 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
              </div>

              {/* Contenedor del texto modernizado */}
              <div className="px-6 pb-6">
                {/* Título y cargo con diseño más moderno */}
                <div className="text-center relative mb-6">
                  {/* Línea decorativa superior */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent flex-1 max-w-20"></div>
                    <div className="px-4">
                      <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent flex-1 max-w-20"></div>
                  </div>

                  <h3 className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent tracking-wide">
                    Romani Molina Kleberth Paz
                  </h3>

                  <div className="relative mt-3">
                    <p className="text-violet-400 font-medium text-base tracking-wider uppercase">
                      Fundador & CEO
                    </p>
                    {/* Subrayado animado */}
                    <div className="mx-auto mt-2 h-0.5 w-14 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
                  </div>
                </div>

                {/* Descripción del fundador */}
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed text-center">
                    Un profesional apasionado por el mundo automotriz, con años
                    de experiencia en el rubro y un firme compromiso con la
                    <span className="text-violet-400 font-semibold">
                      {" "}
                      excelencia en el servicio
                    </span>
                    .
                  </p>

                  <p className="text-slate-300 text-sm leading-relaxed text-center">
                    Su visión ha sido siempre brindar a los clientes una
                    atención
                    <span className="text-violet-400 font-semibold">
                      {" "}
                      cercana, transparente y de calidad
                    </span>
                    , convirtiendo al taller en un referente de confianza en la
                    comunidad.
                  </p>
                </div>

                {/* Elementos decorativos inferiores */}
                <div className="flex justify-center mt-6 space-x-2">
                  <div className="w-1 h-1 bg-violet-500 rounded-full opacity-60"></div>
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-60"></div>
                  <div className="w-1 h-1 bg-indigo-500 rounded-full opacity-60"></div>
                </div>
              </div>

              {/* Patrón de fondo sutil */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #8b5cf6 1px, transparent 1px),
                         radial-gradient(circle at 75% 75%, #a855f7 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                  }}
                ></div>
              </div>
            </div>

            {/* Información Legal y Valores */}
            <div className="space-y-6">
              {/* RUC y Dirección */}
              <div className="space-y-4">
                <div className="bg-slate-800/80 rounded-xl p-4 shadow-xl border border-slate-600/30 text-center text-slate-300 hover:border-violet-400/50 transition-all duration-300 backdrop-blur-sm">
                  <span className="text-sm">RUC: </span>
                  <span className="font-semibold text-white text-sm">
                    10222902539 – Romani Molina Kleberth Paz
                  </span>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-4 shadow-xl border border-slate-600/30 text-center text-slate-300 hover:border-violet-400/50 transition-all duration-300 backdrop-blur-sm">
                  <span className="text-sm">Dirección: </span>
                  <span className="text-white text-sm">
                    Calle Manco Capac MZ. F-LT. 27 - Túpac Amaru Zona "A"
                  </span>
                </div>
              </div>

              {/* Valores de la Empresa */}
              <div className="bg-slate-800/80 rounded-xl p-6 shadow-xl border border-slate-600/30 hover:border-violet-400/50 transition-all duration-300 backdrop-blur-sm">
                <h4 className="text-xl font-semibold mb-4 text-fuchsia-400 text-center">
                  Nuestros Valores
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                    <span className="text-sm">Confianza</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Responsabilidad</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm">Trato cercano</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                    <span className="text-sm">Seguridad vial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;
