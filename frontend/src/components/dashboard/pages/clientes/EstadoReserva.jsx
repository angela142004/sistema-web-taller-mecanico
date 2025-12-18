import { useEffect, useState, useMemo } from "react";
import {
  Ellipsis,
  Car,
  Wrench,
  Info,
  CircleHelp,
  MessageSquareText,
  Search,
} from "lucide-react";

export default function EstadoReserva() {
  const API = import.meta.env.VITE_API_URL;
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

  // =========================
  // 🔎 BUSCADOR + PAGINACIÓN
  // =========================
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  // reset página si cambian filtros/datos
  useEffect(() => {
    setPage(1);
  }, [searchQuery, perPage, reservas.length]);

  // Filtrar por búsqueda y priorizar PENDIENTE al inicio
  const filteredSorted = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    const matched = reservas.filter((r) => {
      const servicio = (r.servicio?.nombre || "").toLowerCase();
      const vehiculoNombre = (r.vehiculo?.modelo?.nombre || "").toLowerCase();
      const placa = (
        r.vehiculo?.placa ||
        r.vehiculo?.plate ||
        ""
      ).toLowerCase();
      return (
        q === "" ||
        servicio.includes(q) ||
        vehiculoNombre.includes(q) ||
        placa.includes(q)
      );
    });

    const estadoPrioridad = (e) => {
      const v = String(e || "").toLowerCase();
      if (v.includes("pend")) return 0;
      if (v.includes("confirm")) return 1;
      return 2;
    };

    return matched.sort((a, b) => {
      const pa = estadoPrioridad(a.estado);
      const pb = estadoPrioridad(b.estado);
      if (pa !== pb) return pa - pb;
      // si misma prioridad ordenar por fecha descendente
      return new Date(b.fecha) - new Date(a.fecha);
    });
  }, [reservas, searchQuery]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayed = filteredSorted.slice(startIndex, endIndex);
  // =========================

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
      {/* BARRA: BUSCADOR + BOTÓN VER ESTADOS */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-2">
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white px-4"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-white/70">Por página:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="h-12 rounded-xl bg-white/5 border border-white/10 text-white px-3"
            >
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowEstados(true)}
            className="flex items-center gap-2 px-4 h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition"
          >
            <CircleHelp size={18} />
            Ver estados
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 flex gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      {/* LISTA DE RESERVAS */}
      {displayed.length === 0 && !error && (
        <p className="text-white/60 text-center">No tienes reservas aún.</p>
      )}

      {displayed.map((r) => (
        <section
          key={r.id_reserva}
          className="relative rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
        >
          <Ellipsis className="absolute right-4 top-4 text-white/60" />

          {/* VEHÍCULO */}
          <div className="flex items-center gap-2 text-white font-semibold">
            <Car size={18} />
            {r.vehiculo?.modelo?.marca?.nombre} {r.vehiculo?.modelo?.nombre} —{" "}
            {r.vehiculo?.placa || r.vehiculo?.plate}
          </div>

          {/* SERVICIO */}
          <p className="text-white/80 flex gap-2 items-center">
            <Wrench size={18} />
            Servicio solicitado:
            <span className="text-white">{r.servicio?.nombre}</span>
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
          {r.estado === "PENDIENTE" && (
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

      {/* PAGINADOR (responsive) */}
      <div className="mt-4">
        <div className="hidden md:flex items-center justify-between">
          <div className="text-sm text-white/70">
            Mostrando {Math.min(startIndex + 1, total)}-
            {Math.min(endIndex, total)} de {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1 max-w-[480px] overflow-auto px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] px-3 py-1 rounded text-sm ${
                    n === page
                      ? "bg-violet-600 text-white"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Mobile compacto */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              {startIndex + 1} - {Math.min(endIndex, total)} de {total}
            </div>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white/10 text-white p-2 rounded"
            >
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex-1 mr-2 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <div className="text-sm text-white/70 text-center w-24">
              {page}/{totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex-1 ml-2 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
