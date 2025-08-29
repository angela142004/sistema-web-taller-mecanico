// src/pages/Nosotros.jsx
import React from "react";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Nosotros = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center py-12">
      {/* Fondo con imagen y overlay de desenfoque */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/FondoNosotros.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md mix-blend-multiply"></div>
      </div>

      {/* Contenedor principal del contenido, ahora full width */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 px-6">
        {/* Sección izquierda: Misión y Visión */}
        <div className="space-y-6 md:space-y-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <img
              src="/images/nosotros/taller.jpg"
              alt="Taller Automotriz"
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>

          {/* Tarjeta de descripción de la empresa */}
          <div className="bg-slate-800/70 p-6 rounded-2xl shadow-xl space-y-4 border border-slate-700/50 hover:border-violet-500 transition-colors duration-300">
            <p className="leading-relaxed text-slate-200">
              En Multiservicios Automotriz Kleberth nos dedicamos a brindar
              soluciones integrales para el cuidado, mantenimiento y reparación
              de vehículos, con el compromiso de ofrecer un servicio de calidad,
              confianza y responsabilidad.
            </p>
            <p className="leading-relaxed text-slate-200">
              Con un equipo especializado y en constante capacitación,
              trabajamos para garantizar la seguridad y satisfacción de nuestros
              clientes, adaptándonos a sus necesidades y utilizando herramientas
              y técnicas modernas.
            </p>
            <p className="leading-relaxed text-slate-200 font-medium">
              Nuestro objetivo es ser el taller automotriz de confianza en la
              región, ofreciendo atención personalizada, precios justos y un
              servicio eficiente que respalde la confianza que nuestros clientes
              depositan en nosotros.
            </p>
          </div>

          {/* Misión y Visión */}
          <div className="space-y-6">
            <div className="bg-slate-800/70 p-6 rounded-2xl shadow-xl border border-slate-700/50 hover:border-violet-500 transition-colors duration-300">
              <h3 className="text-xl font-semibold mb-2 text-fuchsia-400">
                Misión
              </h3>
              <p className="text-slate-300 italic leading-relaxed">
                "Proveer servicios automotrices de alta calidad con un enfoque
                en la satisfacción total del cliente, utilizando tecnología de
                punta y personal altamente capacitado para garantizar la
                confiabilidad y seguridad de todos los vehículos que atendemos."
              </p>
            </div>
            <div className="bg-slate-800/70 p-6 rounded-2xl shadow-xl border border-slate-700/50 hover:border-violet-500 transition-colors duration-300">
              <h3 className="text-xl font-semibold mb-2 text-fuchsia-400">
                Visión
              </h3>
              <p className="text-slate-300 italic leading-relaxed">
                "Ser el taller automotriz de confianza en la región, ofreciendo
                atención personalizada, precios justos y un servicio eficiente
                que respalde la confianza que nuestros clientes depositan en
                nosotros."
              </p>
            </div>
          </div>
        </div>

        {/* Sección derecha con información del fundador */}
        <div className="space-y-6 md:space-y-10 flex flex-col">
          {/* Título principal con gradiente */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 rounded-xl flex items-center justify-between shadow-lg">
            <h2 className="text-2xl font-bold tracking-tight">
              MULTISERVICIOS AUTOMOTRIZ KLEBERTH.
            </h2>
            <BarChart3 className="h-8 w-8 text-white" />
          </div>

          {/* Sección de la Tarjeta del Fundador (con animación unificada) */}
          <div className="bg-slate-800/70 rounded-xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300 border border-slate-700/50 hover:border-violet-500 transition-colors duration-300">
            {/* Imagen del fundador, centrada y sin recorte */}
            <img
              src="/images/nosotros/fundador.jpg"
              alt="Fundador"
              className="w-full h-96 object-contain"
            />

            {/* Contenedor del texto con un separador visual */}
            <div className="p-6">
              {/* Título y cargo */}
              <div className="text-center border-b-2 border-violet-500 pb-4 mb-4">
                <h4 className="font-extrabold text-2xl text-white tracking-widest uppercase">
                  Romani Molina Kleberth Paz
                </h4>
                <p className="text-sm font-light text-slate-400 mt-2">Fundador y Dueño</p>
              </div>

              {/* Descripción del fundador (Integrada) */}
              <div className="space-y-4 text-center">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Un profesional apasionado por el mundo automotriz, con años de
                  experiencia en el rubro y un firme compromiso con la excelencia en
                  el servicio.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Su visión ha sido siempre brindar a los clientes una atención
                  cercana, transparente y de calidad, convirtiendo al taller en un
                  referente de confianza en la comunidad.
                </p>
              </div>
            </div>
          </div>

          {/* Info adicional con flex-grow para rellenar el espacio */}
          <div className="space-y-3 text-sm flex-grow">
            <p className="bg-slate-800/70 rounded-xl p-3 shadow-xl border border-slate-700/50 text-center text-slate-300 hover:border-violet-500 transition-colors duration-300">
              RUC:{" "}
              <span className="font-semibold text-white">
                10222902539 – Romani Molina Kleberth Paz.
              </span>
            </p>
            <p className="bg-slate-800/70 rounded-xl p-3 shadow-xl border border-slate-700/50 text-center text-slate-300 hover:border-violet-500 transition-colors duration-300">
              Dirección:{" "}
              <span className="text-white">
                Calle Manco Capac MZ. F-LT. 27 - Túpac Amaru Zona “A”.
              </span>
            </p>
            <div className="bg-slate-800/70 rounded-xl p-4 shadow-xl border border-slate-700/50 hover:border-violet-500 transition-colors duration-300">
              <h4 className="font-semibold mb-2 text-white">
                Valores de la empresa:
              </h4>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                <li>Confianza</li>
                <li>Responsabilidad</li>
                <li>Trato cercano con el cliente</li>
                <li>Compromiso con la seguridad vial</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;