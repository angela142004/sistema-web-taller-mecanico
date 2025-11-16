import { useEffect, useState } from "react";
import {
  Ellipsis,
  Car,
  Wrench,
  Info,
  CircleHelp,
  MessageSquareText,
} from "lucide-react";

export default function EstadoReserva() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  const [showEstados, setShowEstados] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // ░░░ FETCH ░░░
  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      const res = await fetch(`${API}/mecanica/reservas/cliente`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("No se pudieron cargar las reservas");

      const data = await res.json();
      setReservas(data);
    } catch (err) {
      setError(err.message || "Error al cargar reservas");
    }
  };

  // ░░░ Colores según estado
  const estadoColor = (estado) => {
    switch (estado.toUpperCase()) {
      case "PENDIENTE":
        return "text-yellow-300";
      case "CONFIRMADA":
        return "text-blue-300";
      case "CANCELADA":
        return "text-red-400";
      default:
        return "text-white/60";
    }
  };

  // ░░░ ABRIR MODAL CANCELACIÓN ░░░
  const abrirCancelacion = (reserva) => {
    setReservaSeleccionada(reserva);
    setShowCancelModal(true);
  };

  // ░░░ ELIMINAR RESERVA ░░░
  const confirmarCancelacion = async () => {
    if (!reservaSeleccionada) return;

    try {
      const res = await fetch(
        `${API}/mecanica/reservas/${reservaSeleccionada.id_reserva}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        alert("Hubo un error al eliminar la reserva.");
        return;
      }

      alert("Reserva eliminada correctamente.");
      fetchReservas();
      setShowCancelModal(false);
    } catch {
      alert("No se pudo eliminar la reserva.");
    }
  };

  // ░░░ FORMATEAR FECHA SIN DESFASE ░░░
  const formatFecha = (fecha) => fecha.split("T")[0]; // solo YYYY-MM-DD

  return (
    <div className="space-y-6">
      {/* BOTÓN VER ESTADOS */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowEstados(true)}
          className="flex items-center gap-2 px-4 h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition"
        >
          <CircleHelp size={18} />
          Ver estados
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 flex gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      {/* LISTA DE RESERVAS */}
      {reservas.length === 0 && !error && (
        <p className="text-white/60 text-center">No tienes reservas aún.</p>
      )}

      {reservas.map((r) => (
        <section
          key={r.id_reserva}
          className="relative rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
        >
          <Ellipsis className="absolute right-4 top-4 text-white/60" />

          {/* VEHÍCULO */}
          <div className="flex items-center gap-2 text-white font-semibold">
            <Car size={18} />
            {r.vehiculo.modelo.marca.nombre} {r.vehiculo.modelo.nombre} —{" "}
            {r.vehiculo.placa}
          </div>

          {/* SERVICIO */}
          <p className="text-white/80 flex gap-2 items-center">
            <Wrench size={18} />
            Servicio solicitado:
            <span className="text-white">{r.servicio.nombre}</span>
          </p>

          {/* FECHA + HORA */}
          <p className="text-white/60">
            Fecha programada: {formatFecha(r.fecha)}
            {" — " + r.hora_inicio + " a " + r.hora_fin}
          </p>

          {/* ESTADO */}
          <p className={`font-bold ${estadoColor(r.estado)}`}>
            Estado de la reserva: {r.estado}
          </p>

          {/* BOTÓN CANCELAR */}
          {(r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && (
            <button
              onClick={() => abrirCancelacion(r)}
              className="w-full md:w-[260px] h-12 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 font-semibold hover:bg-red-600/30"
            >
              Cancelar reserva
            </button>
          )}
        </section>
      ))}

      {/* MODAL ESTADOS */}
      {showEstados && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <CircleHelp size={20} />
              Estados del sistema
            </h2>

            <div className="text-white/70 space-y-2 text-sm">
              <p>
                <span className="text-yellow-300 font-bold">Pendiente:</span>{" "}
                Solicitud recibida.
              </p>
              <p>
                <span className="text-blue-300 font-bold">Confirmada:</span>{" "}
                Reserva aceptada.
              </p>
              <p>
                <span className="text-red-400 font-bold">Cancelada:</span>{" "}
                Reserva anulada.
              </p>
            </div>

            <button
              onClick={() => setShowEstados(false)}
              className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <MessageSquareText size={20} />
              Cancelar reserva
            </h2>

            <p className="text-white/70 text-sm">
              ¿Estás seguro de eliminar esta reserva?
            </p>

            <button
              onClick={confirmarCancelacion}
              className="w-full h-12 rounded-xl bg-red-600/30 border border-red-600/50 text-red-300 font-semibold hover:bg-red-600/40"
            >
              Confirmar eliminación
            </button>

            <button
              onClick={() => setShowCancelModal(false)}
              className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
