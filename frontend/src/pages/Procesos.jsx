// src/pages/Procesos.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Search,
  Wrench,
  CheckCircle,
} from "lucide-react";

const procesos = [
  {
    id: 1,
    titulo: "Recepción del vehículo",
    subtitulo: "Registro y primera evaluación",
    descripcion:
      "Recibimos el vehículo, registramos datos, verificamos historial y describimos los síntomas reportados por el cliente.",
    icon: <ClipboardList className="w-12 h-12 text-purple-300" />,
    imagen: "/images/procesos/recepcion.jpg",
  },
  {
    id: 2,
    titulo: "Diagnóstico inicial",
    subtitulo: "Inspección y escaneo",
    descripcion:
      "Inspección visual, pruebas básicas y escaneo con equipos OBD para detectar códigos y fallos iniciales.",
    icon: <Search className="w-12 h-12 text-purple-300" />,
    imagen: "/images/procesos/diagnostico.jpg",
  },
  {
    id: 3,
    titulo: "Reparación y mantenimiento",
    subtitulo: "Mano de obra especializada",
    descripcion:
      "Reemplazo de piezas, ajustes y trabajos de mecánica, electricidad o suspensión según el diagnóstico.",
    icon: <Wrench className="w-12 h-12 text-purple-300" />,
    imagen: "/images/procesos/reparacion.jpg",
  },
  {
    id: 4,
    titulo: "Prueba de calidad",
    subtitulo: "Verificación y control",
    descripcion:
      "Realizamos pruebas en carretera/rueda y verificamos puntos críticos para asegurar el correcto funcionamiento.",
    icon: <CheckCircle className="w-12 h-12 text-purple-300" />,
    imagen: "/images/procesos/prueba.jpg",
  },
  {
    id: 5,
    titulo: "Entrega al cliente",
    subtitulo: "Informe y recomendaciones",
    descripcion:
      "Entregamos el vehículo con un informe detallado, recomendaciones y la garantía del servicio realizado.",
    icon: <ClipboardList className="w-12 h-12 text-purple-300" />,
    imagen: "/images/procesos/entrega.jpg",
  },
];

const Procesos = () => {
  const [index, setIndex] = useState(0);

  // navegación con teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % procesos.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + procesos.length) % procesos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const next = () => setIndex((i) => (i + 1) % procesos.length);
  const prev = () =>
    setIndex((i) => (i - 1 + procesos.length) % procesos.length);

  const paso = procesos[index];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden text-white bg-black">
      {/* 🔹 Fondo global */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/FondoProcesos.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      </div>

      {/* 🔹 Contenedor principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8 overflow-x-hidden">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Nuestro proceso de trabajo
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mt-3">
            Transparencia, calidad y garantía en cada servicio.
          </p>
        </header>

        {/* Tarjeta de proceso */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-purple-700/40 flex flex-col md:flex-row bg-black/70 backdrop-blur-md transition-all duration-500 hover:shadow-3xl">
          {/* Imagen del proceso */}
          <div className="md:flex-1 h-64 md:h-auto relative">
            <img
              src={paso.imagen}
              alt={paso.titulo}
              className="w-full h-full object-cover"
              draggable="false"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
          </div>

          {/* Texto del proceso */}
          <div className="md:flex-1 p-6 md:p-12 flex flex-col justify-center gap-6 bg-black/60 backdrop-blur-sm rounded-b-3xl md:rounded-r-3xl">
            <div className="flex items-center gap-4">
              <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-700/30 to-purple-500/20 border border-purple-600/30 shadow-lg">
                {paso.icon}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-300 drop-shadow-md">
                  {paso.titulo}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{paso.subtitulo}</p>
              </div>
            </div>
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed max-w-full md:max-w-3xl">
              {paso.descripcion}
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-xs text-gray-400 px-2 py-1 bg-white/10 rounded shadow-sm">
                  Duración aprox. 30-60 min
                </span>
                <span className="text-xs text-gray-400 px-2 py-1 bg-white/10 rounded shadow-sm">
                  Garantía 30 días
                </span>
              </div>
              <div className="flex items-center gap-3 justify-center sm:justify-end">
                <button
                  onClick={prev}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-transparent border border-white/20 text-white hover:bg-purple-700/40 transition shadow-md"
                >
                  <ArrowLeft className="w-5 h-5 text-purple-300" /> Anterior
                </button>
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 transition"
                >
                  Siguiente <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnails + puntos */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <div className="flex gap-3 overflow-x-auto py-1 scroll-pl-4 md:scroll-pl-0 snap-x snap-mandatory w-full">
            {procesos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setIndex(i)}
                className={`w-24 sm:w-28 h-14 sm:h-16 rounded-lg overflow-hidden border snap-start ${
                  i === index
                    ? "ring-2 ring-purple-400/60 border-purple-300/50 shadow-lg"
                    : "border-transparent"
                } transition-all hover:scale-105 flex-shrink-0`}
                title={p.titulo}
              >
                <img
                  src={p.imagen}
                  alt={p.titulo}
                  className="w-full h-full object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 md:mt-0 justify-center md:justify-end">
            {procesos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full ${
                  i === index ? "bg-purple-400" : "bg-white/30"
                } transition`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Procesos;
