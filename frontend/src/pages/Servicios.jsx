// src/pages/Servicio.jsx
import React from "react";
import { Wrench, Zap, ShieldCheck } from "lucide-react";

const destacados = [
  {
    id: "d1",
    icon: <Wrench className="h-6 w-6" />,
    titulo: "Mantenimiento Integral",
    descripcion:
      "Revisión completa del vehículo: motor, transmisión, frenos y sistema eléctrico para garantizar seguridad y rendimiento.",
  },
  {
    id: "d2",
    icon: <Zap className="h-6 w-6" />,
    titulo: "Diagnóstico Avanzado",
    descripcion:
      "Escaneo con equipos de última generación para localizar fallas con precisión y reducir tiempos de reparación.",
  },
  {
    id: "d3",
    icon: <ShieldCheck className="h-6 w-6" />,
    titulo: "Garantía y Calidad",
    descripcion:
      "Repuestos de calidad y mano de obra certificada con garantía en piezas y servicios para tu tranquilidad.",
  },
];

const servicios = [
  {
    id: 1,
    titulo: "Cambio de aceite y filtros",
    descripcion:
      "Mantenimiento rápido y confiable para prolongar la vida útil de tu motor.",
    imagen: "/images/servicios/aceite.jpg",
  },
  {
    id: 2,
    titulo: "Diagnóstico y reparación",
    descripcion:
      "Equipos modernos para detectar fallas y repararlas de forma precisa.",
    imagen: "/images/servicios/diagnostico.jpg",
  },
  {
    id: 3,
    titulo: "Revisión de frenos y llantas",
    descripcion:
      "Seguridad garantizada con revisiones completas de frenos y neumáticos.",
    imagen: "/images/servicios/frenos.jpg",
  },
  {
    id: 4,
    titulo: "Venta de repuestos",
    descripcion:
      "Repuestos originales y de calidad para asegurar el buen funcionamiento.",
    imagen: "/images/servicios/repuestos.jpg",
  },
];

const Servicio = () => {
  return (
    <div className="w-full min-h-screen relative overflow-hidden overflow-x-hidden bg-slate-950 text-white">
      {/* FONDO - IMAGE + OVERLAY */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/FondoServicios.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* CONTENIDO */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16">
        {/* HERO - título + descripción */}
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
            Nuestros Servicios
          </h1>
          <p className="max-w-3xl mx-auto text-gray-300 text-base md:text-lg leading-relaxed">
            Brindamos soluciones integrales para el cuidado y la reparación de
            vehículos: mantenimiento preventivo, diagnóstico avanzado,
            reparaciones especializadas y venta de repuestos. Atención
            profesional y garantía en cada servicio.
          </p>
        </header>

        {/* SERVICIOS DESTACADOS (como en la maqueta) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white/90">
            Servicios destacados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destacados.map((d) => (
              <article
                key={d.id}
                className="group bg-gradient-to-br from-slate-800/75 to-slate-900/75 p-6 rounded-2xl shadow-xl border border-slate-700/40 hover:shadow-2xl transition-transform transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-md bg-purple-600/20 text-purple-300 mb-4">
                  {d.icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  {d.titulo}
                </h3>
                <p className="text-gray-300 text-sm md:text-base">
                  {d.descripcion}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* GRID PRINCIPAL DE SERVICIOS (con imagen referencial) */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-white/90">
            Todos nuestros servicios
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="group bg-gray-800/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-slate-700/40"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={s.imagen}
                    alt={s.titulo}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2">{s.titulo}</h3>
                  <p className="text-gray-300 text-sm mb-4">{s.descripcion}</p>
                  <button
                    type="button"
                    className="inline-block px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-md text-white text-sm transition"
                    aria-label={`Ver más sobre ${s.titulo}`}
                  >
                    Solicitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Servicio;
