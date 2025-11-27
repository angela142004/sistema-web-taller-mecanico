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
} from "lucide-react";
function formatDateLocal(isoDate) {
  if (!isoDate) return "Fecha no disponible";

  const [y, m, rest] = isoDate.split("-");
  const d = rest.split("T")[0]; // ← aquí limpiamos todo lo que venga después del día

  return `${d}/${m}/${y}`;
}

export default function EstadoVehiculo() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [asignaciones, setAsignaciones] = useState([]);
  const [error, setError] = useState("");
  const [showEstados, setShowEstados] = useState(false);

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
      setAsignaciones(data);
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

  return (
    <div className="space-y-8">
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
      {asignaciones.map((a) => {
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
      })}
    </div>
  );
}
