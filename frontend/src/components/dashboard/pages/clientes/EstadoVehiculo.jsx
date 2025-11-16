import { useEffect, useState } from "react";
import {
  Car,
  Wrench,
  UserCog,
  Info,
  CheckCircle,
  Loader2,
  XCircle,
  Clock,
  InfoIcon,
  ChevronDown,
  X,
} from "lucide-react";

export default function EstadoVehiculo() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  // Control del modal con los estados del vehículo
  const [showEstados, setShowEstados] = useState(false);

  // Estados del mecánico (lo que se mostrará dentro del modal)
  const estadosVehiculoInfo = [
    {
      title: "Pendiente",
      color: "text-yellow-300",
      desc: "El mecánico aún no ha iniciado el trabajo en tu vehículo.",
    },
    {
      title: "En proceso",
      color: "text-blue-300",
      desc: "El mecánico está trabajando activamente en tu vehículo.",
    },
    {
      title: "Finalizado",
      color: "text-green-300",
      desc: "El servicio del vehículo ya fue completado.",
    },
    {
      title: "Cancelado",
      color: "text-red-400",
      desc: "El servicio fue suspendido por el mecánico o el taller.",
    },
  ];

  // EJEMPLOS (respetando 100% tu base de datos)
  const ejemplos = [
    {
      id_reserva: 3001,
      fecha: "2025-11-20T10:00:00.000Z",
      estado: "CONFIRMADA",
      vehiculo: {
        placa: "GFT-221",
        modelo: { nombre: "Corolla", marca: { nombre: "Toyota" } },
      },
      servicio: { nombre: "Cambio de aceite" },
      cotizacion: { total: 150, estado: "aprobado" },
      asignacion: [
        { estado: "pendiente", mecanico: { usuario: { nombre: "Carlos Huamán" } } },
      ],
    },
    {
      id_reserva: 3002,
      fecha: "2025-11-22T09:00:00.000Z",
      estado: "CONFIRMADA",
      vehiculo: {
        placa: "XYZ-909",
        modelo: { nombre: "Civic", marca: { nombre: "Honda" } },
      },
      servicio: { nombre: "Mantenimiento general" },
      cotizacion: { total: 380, estado: "aprobado" },
      asignacion: [
        { estado: "en_proceso", mecanico: { usuario: { nombre: "Luis Ríos" } } },
      ],
    },
    {
      id_reserva: 3003,
      fecha: "2025-11-25T08:00:00.000Z",
      estado: "CONFIRMADA",
      vehiculo: {
        placa: "OPQ-556",
        modelo: { nombre: "Hilux", marca: { nombre: "Toyota" } },
      },
      servicio: { nombre: "Revisión de frenos" },
      cotizacion: { total: 350, estado: "aprobado" },
      asignacion: [
        { estado: "finalizado", mecanico: { usuario: { nombre: "Pedro Álvarez" } } },
      ],
    },
  ];

  useEffect(() => {
    cargarEstado();
  }, []);

  // Cargar estado real del backend
  const cargarEstado = async () => {
    try {
      const res = await fetch(`${API}/mecanica/vehiculo/estado`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setError("No se pudo cargar el estado del vehículo (mostrando ejemplos)");
        setReservas(ejemplos);
        return;
      }

      const data = await res.json();

      // Solo mostrar CONFIRMADAS + cotización aprobada
      const filtrados = data.filter(
        (r) => r.estado === "CONFIRMADA" && r.cotizacion?.estado === "aprobado"
      );

      setReservas(filtrados.length ? filtrados : ejemplos);
    } catch {
      setError("No se pudo cargar el estado del vehículo (mostrando ejemplos)");
      setReservas(ejemplos);
    }
  };

  // Colores e iconos según estado del mecánico
  const colorEstado = {
    pendiente: "text-yellow-300",
    en_proceso: "text-blue-300",
    finalizado: "text-green-300",
    cancelado: "text-red-400",
  };

  const iconoEstado = {
    pendiente: <Clock size={18} />,
    en_proceso: <Loader2 size={18} className="animate-spin" />,
    finalizado: <CheckCircle size={18} />,
    cancelado: <XCircle size={18} />,
  };

  return (
    <div className="space-y-8">

      {/* BOTÓN DESPLEGABLE DE INFORMACIÓN */}
      <button
        onClick={() => setShowEstados(true)}
        className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition"
      >
        <InfoIcon size={18} />
        Ver estados del vehículo
        <ChevronDown size={16} />
      </button>

      {/* MODAL CON LOS ESTADOS */}
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

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 flex gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      {/* LISTA DE ESTADOS DEL VEHÍCULO */}
      {reservas.map((r) => {
        const asignacion = r.asignacion?.[0];

        return (
          <section
            key={r.id_reserva}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-white font-semibold">
              <Car size={18} />
              {r.vehiculo.modelo.marca.nombre} {r.vehiculo.modelo.nombre} —{" "}
              {r.vehiculo.placa}
            </div>

            <p className="text-white/80 flex gap-2 items-center">
              <Wrench size={18} />
              Servicio: <span className="text-white">{r.servicio.nombre}</span>
            </p>

            <p className="text-white/60">
              Fecha programada:{" "}
              {new Date(r.fecha).toLocaleDateString("es-PE")}
            </p>

            {/* ESTADO DEL MECÁNICO */}
            {asignacion ? (
              <div className="flex items-center gap-3 text-white/80">
                <UserCog size={18} />

                <span className="text-white font-semibold">
                  {asignacion.mecanico.usuario.nombre}
                </span>

                <span className={`ml-2 font-bold flex items-center gap-1 ${colorEstado[asignacion.estado]}`}>
                  {iconoEstado[asignacion.estado]}
                  {asignacion.estado.toUpperCase()}
                </span>
              </div>
            ) : (
              <p className="text-white/50">Mecánico aún no asignado.</p>
            )}

            <p className="text-purple-300 font-bold text-lg">
              Total aprobado: S/ {r.cotizacion.total}
            </p>
          </section>
        );
      })}

    </div>
  );
}
