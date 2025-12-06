import { useEffect, useState } from "react";
import {
  Car,
  Wrench,
  Info,
  CheckCircle,
  Loader2,
  Clock,
  InfoIcon,
  ChevronDown,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function formatDateLocal(isoDate) {
  if (!isoDate) return "Fecha no disponible";

  const [y, m, rest] = isoDate.split("-");
  const d = rest.split("T")[0];

  return `${d}/${m}/${y}`;
}

export default function EstadoVehiculo() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [asignaciones, setAsignaciones] = useState([]);
  const [error, setError] = useState("");
  const [showEstados, setShowEstados] = useState(false);

  // 🔍 Buscador
  const [search, setSearch] = useState("");

  // 📄 Paginador
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 4;

  const estadosVehiculoInfo = [
    {
      title: "Pendiente",
      color: "text-yellow-300",
      desc: "El mecánico aún no ha iniciado el trabajo en tu vehículo.",
    },
    {
      title: "En proceso",
      color: "text-blue-300",
      desc: "El mecánico está trabajando en tu vehículo.",
    },
    {
      title: "Finalizado",
      color: "text-green-300",
      desc: "El servicio del vehículo ya fue completado.",
    },
  ];

  useEffect(() => {
    cargarEstado();
  }, []);

  const cargarEstado = async () => {
    try {
      const res = await fetch(`${API}/mecanica/asignaciones-cliente`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setError("No se pudo cargar la información del vehículo.");
        return;
      }

      const data = await res.json();
      setAsignaciones([...data].reverse());
    } catch (e) {
      setError("Error al conectar con el servidor.");
    }
  };

  const colorEstado = {
    pendiente: "text-yellow-300",
    en_proceso: "text-blue-300",
    finalizado: "text-green-300",
  };

  const iconoEstado = {
    pendiente: <Clock size={18} />,
    en_proceso: <Loader2 size={18} className="animate-spin" />,
    finalizado: <CheckCircle size={18} />,
  };

  // ============================
  // 🔍 FILTRADO
  // ============================
  const asignacionesFiltradas = asignaciones.filter((a) => {
    const texto = search.toLowerCase();

    const r = a.cotizacion?.reserva;
    const vehiculo = r?.vehiculo;
    const servicio = r?.servicio;

    return (
      vehiculo?.placa?.toLowerCase().includes(texto) ||
      vehiculo?.modelo?.nombre?.toLowerCase().includes(texto) ||
      vehiculo?.modelo?.marca?.nombre?.toLowerCase().includes(texto) ||
      servicio?.nombre?.toLowerCase().includes(texto) ||
      a.estado?.toLowerCase().includes(texto) ||
      a.mecanico?.usuario?.nombre?.toLowerCase().includes(texto)
    );
  });

  // ============================
  // 📄 PAGINACIÓN
  // ============================
  const totalPaginas = Math.ceil(asignacionesFiltradas.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const visibles = asignacionesFiltradas.slice(inicio, inicio + porPagina);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPaginaActual(nueva);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8">
      {/* 🔍 BUSCADOR */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Buscar por placa, servicio, estado, mecánico..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginaActual(1);
          }}
          className="w-full p-3 pl-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
          size={18}
        />
      </div>

      {/* BOTÓN MODAL */}
      <button
        onClick={() => setShowEstados(true)}
        className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition"
      >
        <InfoIcon size={18} />
        Ver estados del vehículo
        <ChevronDown size={16} />
      </button>

      {/* MODAL */}
      {showEstados && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-[#18122b] rounded-2xl border border-white/10 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">
                Estados del vehículo
              </h3>
              <button
                onClick={() => setShowEstados(false)}
                className="text-white/60 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              {estadosVehiculoInfo.map((e, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/80"
                >
                  <p className={`font-bold ${e.color}`}>{e.title}</p>
                  <p>{e.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowEstados(false)}
              className="mt-3 w-full h-12 bg-[#3b138d] hover:bg-[#4619a1] rounded-xl text-white font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 flex gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      {/* LISTA */}
      {visibles.length === 0 ? (
        <p className="text-center text-white/50">
          No se encontraron resultados.
        </p>
      ) : (
        visibles.map((a) => {
          const r = a.cotizacion?.reserva;
          const vehiculo = r?.vehiculo;
          const servicio = r?.servicio;

          return (
            <section
              key={a.id_asignacion}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
            >
              {/* VEHÍCULO */}
              <div className="flex items-center gap-2 text-white font-semibold">
                <Car size={18} />
                {(vehiculo?.modelo?.marca?.nombre || "Marca desconocida") +
                  " " +
                  (vehiculo?.modelo?.nombre || "Modelo desconocido") +
                  " — " +
                  (vehiculo?.placa || "")}
              </div>

              {/* SERVICIO */}
              <p className="text-white/80 flex gap-2 items-center">
                <Wrench size={18} />
                Servicio:{" "}
                <span className="text-white">
                  {servicio?.nombre || "Servicio no especificado"}
                </span>
              </p>

              {/* FECHA */}
              <p className="text-white/60">
                Fecha programada:{" "}
                {r?.fecha ? formatDateLocal(r.fecha) : "Fecha no disponible"}
              </p>

              {/* ESTADO */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white">
                <span className={colorEstado[a.estado]}>
                  {iconoEstado[a.estado]}
                </span>

                <span className="capitalize text-white/90">
                  {a.estado?.replace("_", " ") || "Estado no disponible"}
                </span>

                <span className="text-white/50">•</span>

                <span className="text-white/80">
                  Mecánico: {a.mecanico?.usuario?.nombre || "Sin asignar"}
                </span>
              </div>
            </section>
          );
        })
      )}

      {/* PAGINADOR */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-2 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-white">
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="p-2 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
