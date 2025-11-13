import { useEffect, useState } from "react";
import {
  Ellipsis,
  Car,
  Wrench,
  Info,
  CircleHelp,
  MessageSquareText,
  FileText,
} from "lucide-react";

export default function EstadoReserva() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  const [showEstados, setShowEstados] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [cancelMotivo, setCancelMotivo] = useState("");
  const [cancelMensaje, setCancelMensaje] = useState("");
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // ░░░ EJEMPLOS DEL CLIENTE ░░░
  const reservasEjemplo = [
    {
      id_reserva: 1001,
      fecha: "2025-11-20T15:00:00.000Z",
      estado: "pendiente",
      vehiculo: {
        placa: "ABC-123",
        modelo: { nombre: "Corolla", marca: { nombre: "Toyota" } },
      },
      servicio: { nombre: "Cambio de aceite" },
      asignacion: [],
      cotizacion: null,
    },
    {
      id_reserva: 1002,
      fecha: "2025-11-22T10:00:00.000Z",
      estado: "aprobado",
      vehiculo: {
        placa: "XYZ-456",
        modelo: { nombre: "Civic", marca: { nombre: "Honda" } },
      },
      servicio: { nombre: "Mantenimiento general" },
      asignacion: [
        {
          estado: "pendiente",
          mecanico: { usuario: { nombre: "Carlos Ramos" } },
        },
      ],
      cotizacion: null,
    },
    {
      id_reserva: 1003,
      fecha: "2025-11-25T09:00:00.000Z",
      estado: "cotizado",
      vehiculo: {
        placa: "JHK-909",
        modelo: { nombre: "Hilux", marca: { nombre: "Toyota" } },
      },
      servicio: { nombre: "Revisión de frenos" },
      asignacion: [
        {
          estado: "en_proceso",
          mecanico: { usuario: { nombre: "Luis Alberto" } },
        },
      ],
      cotizacion: { total: 350, estado: "cotizado" },
    },
  ];

  // ░░░ FETCH ░░░
  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      const res = await fetch(`${API}/mecanica/reservas/cliente`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setError("No se pudieron cargar las reservas (mostrando ejemplos)");
        setReservas(reservasEjemplo);
        return;
      }

      const data = await res.json();
      setReservas(data.length ? data : reservasEjemplo);
    } catch {
      setError("No se pudieron cargar las reservas (mostrando ejemplos)");
      setReservas(reservasEjemplo);
    }
  };

  const estadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "text-yellow-300";
      case "aprobado":
        return "text-blue-300";
      case "cotizado":
        return "text-purple-300";
      case "facturado":
        return "text-green-300";
      case "cancelado":
        return "text-red-400";
      default:
        return "text-white/60";
    }
  };

  // ░░░ ABRIR MODAL ░░░
  const abrirCancelacion = (reserva) => {
    setReservaSeleccionada(reserva);
    setCancelMotivo("");
    setCancelMensaje("");
    setShowCancelModal(true);
  };

  const confirmarCancelacion = () => {
    const { vehiculo, servicio, estado } = reservaSeleccionada;

    if (estado === "aprobado" && cancelMotivo.trim() === "") {
      alert("Debes escribir un motivo para cancelar esta reserva aprobada.");
      return;
    }

    alert(`
Reserva cancelada correctamente.

Vehículo: ${vehiculo.placa}
Servicio: ${servicio.nombre}

Motivo: ${cancelMotivo || "Sin motivo"}
Mensaje al mecánico: ${cancelMensaje || "Ninguno"}
    `);

    setShowCancelModal(false);
  };

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

      {/* LISTA */}
      {reservas.map((r) => {
        const asignacion = r.asignacion?.[0] || null;

        return (
          <section
            key={r.id_reserva}
            className="relative rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
          >
            <Ellipsis className="absolute right-4 top-4 text-white/60" />

            {/* VEHÍCULO */}
            <div className="flex items-center gap-2 text-white font-semibold">
              <Car size={18} />
              {r.vehiculo.modelo.marca.nombre} {r.vehiculo.modelo.nombre} — {r.vehiculo.placa}
            </div>

            {/* SERVICIO */}
            <p className="text-white/80 flex gap-2 items-center">
              <Wrench size={18} />
              Servicio solicitado:
              <span className="text-white">{r.servicio.nombre}</span>
            </p>

            {/* FECHA */}
            <p className="text-white/60">
              Fecha programada: {new Date(r.fecha).toLocaleDateString("es-PE")}
            </p>

            {/* ESTADO DE RESERVA */}
            <p className={`font-bold ${estadoColor(r.estado)}`}>
              Estado de la reserva: {r.estado.toUpperCase()}
            </p>

            {/* ESTADO DEL MECÁNICO */}
            {asignacion ? (
              <p className="text-white/80 flex gap-2">
                <FileText size={18} />
                Mecánico asignado:
                <span className="text-white font-semibold">
                  {asignacion.mecanico.usuario.nombre}
                </span>{" "}
                — ({asignacion.estado})
              </p>
            ) : (
              <p className="text-white/60">Mecánico aún no asignado.</p>
            )}

            {/* BOTÓN CANCELAR */}
            {(r.estado === "pendiente" || r.estado === "aprobado") && (
              <button
                onClick={() => abrirCancelacion(r)}
                className="w-full md:w-[260px] h-12 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 font-semibold hover:bg-red-600/30"
              >
                Cancelar reserva
              </button>
            )}
          </section>
        );
      })}

      {/* MODAL ESTADOS */}
      {showEstados && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-2xl p-6 space-y-6">

            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <CircleHelp size={20} />
              Estados del sistema
            </h2>

            <div className="text-white/70 space-y-2 text-sm">
              <p><span className="text-yellow-300 font-bold">Pendiente:</span> solicitud recibida.</p>
              <p><span className="text-blue-300 font-bold">Aprobado:</span> reserva aceptada.</p>
              <p><span className="text-purple-300 font-bold">Cotizado:</span> esperando en página de cotización.</p>
              <p><span className="text-green-300 font-bold">Facturado:</span> finalizado.</p>
              <p><span className="text-red-400 font-bold">Cancelado:</span> reserva anulada.</p>
            </div>

            <div className="text-white/70 space-y-2 text-sm">
              <p><span className="text-yellow-300 font-bold">Pendiente:</span> el mecánico aún no inicia.</p>
              <p><span className="text-blue-300 font-bold">En proceso:</span> trabajando.</p>
              <p><span className="text-green-300 font-bold">Finalizado:</span> trabajo terminado.</p>
              <p><span className="text-red-400 font-bold">Cancelado:</span> trabajo suspendido.</p>
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

            {/* Motivo obligatorio si está aprobada */}
            {reservaSeleccionada.estado === "aprobado" && (
              <div>
                <label className="text-white/80">Motivo de cancelación</label>
                <textarea
                  value={cancelMotivo}
                  onChange={(e) => setCancelMotivo(e.target.value)}
                  className="w-full mt-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  rows={3}
                  placeholder="Ejemplo: Cambio de horario, no podré asistir..."
                ></textarea>
              </div>
            )}

            {/* Mensaje opcional */}
            <div>
              <label className="text-white/80">Mensaje para el mecánico (opcional)</label>
              <textarea
                value={cancelMensaje}
                onChange={(e) => setCancelMensaje(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                rows={2}
                placeholder="Ejemplo: Gracias por tu tiempo, disculpa los inconvenientes."
              ></textarea>
            </div>

            <button
              onClick={confirmarCancelacion}
              className="w-full h-12 rounded-xl bg-red-600/30 border border-red-600/50 text-red-300 font-semibold hover:bg-red-600/40"
            >
              Confirmar cancelación
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
