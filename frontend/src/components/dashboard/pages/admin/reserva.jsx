import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ChevronDown } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function AdminReservas() {
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [reservas, setReservas] = useState([]);

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6); // items por página
  // --- FIN PAGINACIÓN ---

  // helper: prioridad de estados para ordenar (PENDIENTE primero)
  const estadoPrioridad = (estado) => {
    if (!estado) return 3;
    const map = { PENDIENTE: 0, CONFIRMADA: 1, CANCELADA: 2 };
    return map[estado] ?? 3;
  };

  const sortReservas = (arr) => {
    return arr.slice().sort((a, b) => {
      const pa = estadoPrioridad(a.estado);
      const pb = estadoPrioridad(b.estado);
      if (pa !== pb) return pa - pb;
      // si mismo grupo, ordenar por fecha descendente
      const fa = new Date(Array.isArray(a.fecha) ? a.fecha[0] : a.fecha);
      const fb = new Date(Array.isArray(b.fecha) ? b.fecha[0] : b.fecha);
      return fb - fa;
    });
  };

  // ===============================
  // 🔥 Cargar todas las reservas (pendientes aparecerán primero)
  // ===============================
  useEffect(() => {
    const cargarReservas = async () => {
      try {
        const res = await fetch(`${API}/mecanica/reservas`);
        const data = await res.json();

        const adaptadas = data.map((r) => {
          // 🔥 CORRECCIÓN DE FECHA (evita UTC -5)
          const fechaISO =
            (r.fecha && r.fecha.split && r.fecha.split("T")[0]) || r.fecha;
          const fechaObj = new Date((fechaISO || "") + "T12:00"); // fija hora segura → evita desfase

          const fechaLocal = fechaObj.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });

          return {
            id_reserva: r.id_reserva,
            vehiculo:
              r.vehiculo?.modelo?.nombre ||
              r.vehiculo?.model?.nombre ||
              r.vehiculo?.modelo ||
              "Vehículo",
            cliente: {
              nombre:
                (
                  (r.cliente?.usuario?.nombre || "") +
                  " " +
                  (r.cliente?.usuario?.apellido || "")
                ).trim() || "Cliente",
              correo: r.cliente?.usuario?.correo || "",
              telefono:
                r.cliente?.usuario?.telefono || r.cliente?.telefono || "",
            },
            fecha: fechaLocal,
            fechaRaw: fechaISO,
            hora_inicio: r.hora_inicio,
            servicio:
              r.servicio?.nombre_servicio || r.servicio?.nombre || "Servicio",
            estado: r.estado,
          };
        });

        setReservas(sortReservas(adaptadas));
        // Si cargamos datos nuevos, volver a la página 1
        setPage(1);
      } catch (error) {
        console.error("Error cargando reservas:", error);
      }
    };

    cargarReservas();
  }, []);

  // ===============================
  // ✔️ Aceptar reserva
  // ===============================
  const aceptarReserva = async (idReserva) => {
    try {
      const res = await fetch(`${API}/mecanica/reservas/estado/${idReserva}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "CONFIRMADA" }),
      });

      if (!res.ok) {
        throw new Error("Error en el servidor");
      }

      // actualizar localmente y reordenar (mantener visible)
      setReservas((prev) =>
        sortReservas(
          prev.map((r) =>
            r.id_reserva === idReserva ? { ...r, estado: "CONFIRMADA" } : r
          )
        )
      );

      alert("Reserva aprobada correctamente.");
    } catch (error) {
      console.error("Error aprobando reserva:", error);
      alert("No se pudo aprobar la reserva.");
    }
  };

  // ===============================
  // ❌ Cancelar reserva
  // ===============================
  const cancelarReserva = async (idReserva) => {
    try {
      const res = await fetch(`${API}/mecanica/reservas/estado/${idReserva}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "CANCELADA" }),
      });

      if (!res.ok) {
        throw new Error("Error en el servidor");
      }

      // actualizar localmente y reordenar (mantener visible)
      setReservas((prev) =>
        sortReservas(
          prev.map((r) =>
            r.id_reserva === idReserva ? { ...r, estado: "CANCELADA" } : r
          )
        )
      );

      alert("Reserva cancelada correctamente.");
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      alert("No se pudo cancelar la reserva.");
    }
  };

  // ===============================
  // 🔥 Filtro
  // ===============================
  const filteredReservas = reservas.filter((reserva) => {
    if (estadoFiltro === "Todos") return true;
    return reserva.estado === estadoFiltro;
  });

  // Reset página cuando cambia filtro o datos
  useEffect(() => {
    setPage(1);
  }, [estadoFiltro, reservas]);

  // Paginación: cálculo de páginas y slice de elementos a mostrar
  const totalPages = Math.max(1, Math.ceil(filteredReservas.length / perPage));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayedReservas = filteredReservas.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Filtro */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="hidden md:inline text-white font-semibold mr-2">
            Filtrar por estado:
          </label>
          <div className="relative">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full md:w-56 p-2 rounded-xl bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
            >
              <option value="Todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Aprobada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
            />
          </div>

          {/* mobile: mostrar label inline */}
          <span className="md:hidden text-sm text-white/70 ml-2">Estado</span>
        </div>

        <div className="flex items-center gap-2 md:ml-auto w-full md:w-auto">
          <span className="text-sm text-white/70 hidden md:inline">
            Por página:
          </span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="p-2 rounded bg-[#2a2a2a] text-white w-full md:w-auto"
          >
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {displayedReservas.map((reserva) => (
          <div
            key={reserva.id_reserva}
            className="p-4 rounded-xl bg-white/10 border border-white/20 flex justify-between items-center"
          >
            <div>
              <p className="text-white font-semibold">
                Vehículo: {reserva.vehiculo}
              </p>
              <p className="text-white/70">
                Fecha: {reserva.fecha} | Hora: {reserva.hora_inicio}
              </p>
              <p className="text-white/70">Servicio: {reserva.servicio}</p>
              <p className="text-white/70">
                Cliente: {reserva.cliente.nombre} | {reserva.cliente.correo} |{" "}
                {reserva.cliente.telefono}
              </p>

              <p
                className={`text-sm font-medium mt-2 ${
                  reserva.estado === "PENDIENTE"
                    ? "text-yellow-400"
                    : reserva.estado === "CONFIRMADA"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                Estado: {reserva.estado}
              </p>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-4">
              {reserva.estado === "PENDIENTE" && (
                <>
                  <button
                    onClick={() => aceptarReserva(reserva.id_reserva)}
                    className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition duration-150"
                  >
                    <CheckCircle size={18} />
                  </button>

                  <button
                    onClick={() => cancelarReserva(reserva.id_reserva)}
                    className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition duration-150"
                  >
                    <XCircle size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredReservas.length === 0 && (
          <div className="text-center p-6 text-white/70 border border-white/10 rounded-xl">
            No hay reservas para "{estadoFiltro}".
          </div>
        )}
      </div>

      {/* PAGINADOR */}
      <div className="mt-4">
        {/* Desktop / Tablet: controles completos */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="text-sm text-white/70">
            Mostrando {Math.min(startIndex + 1, filteredReservas.length)}-
            {Math.min(endIndex, filteredReservas.length)} de{" "}
            {filteredReservas.length}
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
              {pageNumbers.map((n) => (
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

        {/* Mobile: versión compacta */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              {startIndex + 1} - {Math.min(endIndex, filteredReservas.length)}{" "}
              de {filteredReservas.length}
            </div>
            <div className="flex items-center gap-2">
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
