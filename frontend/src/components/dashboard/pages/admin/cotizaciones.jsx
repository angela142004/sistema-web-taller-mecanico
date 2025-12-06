import { useState, useEffect } from "react";
import {
  Car,
  Wrench,
  Info,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  XCircle as X,
} from "lucide-react";

export default function CotizacionesAdmin() {
  const [reservas, setReservas] = useState([]);

  // --- PAGINACIÓN GLOBAL (compartida por sección) ---
  const [perPage, setPerPage] = useState(6);
  const [pagePend, setPagePend] = useState(1);
  const [pageEn, setPageEn] = useState(1);
  const [pageHist, setPageHist] = useState(1);
  // --- FIN PAGINACIÓN ---

  // ============================================================
  // 🔥 1. OBTENER RESERVAS REALES DEL BACKEND
  // ============================================================

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      const token = localStorage.getItem("token");

      const resp = await fetch(
        "http://localhost:4001/mecanica/reservas/confirmadas"
      );

      const data = await resp.json();

      const formateadas = data.map((r) => {
        // EXTRAER SOLO LA FECHA (evita desfase UTC)
        const fechaISO = r.fecha.split("T")[0]; // "2025-12-01"
        const fechaObj = new Date(fechaISO + "T12:00"); // fija hora neutra → evita restar días

        const fechaLocal = fechaObj.toLocaleDateString("es-PE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return {
          id_reserva: r.id_reserva,
          vehiculo: r.vehiculo?.modelo?.nombre_modelo || "Vehículo",
          cliente: {
            nombre: r.cliente?.usuario?.nombre || "Cliente",
            correo: r.cliente?.usuario?.correo || "",
            telefono: r.cliente?.telefono || "",
          },
          fecha: fechaLocal, // ←🔥 AHORA SIEMPRE ES LA CORRECTA SIN DESFASES
          hora_inicio: r.hora_inicio,
          servicio: r.servicio?.nombre || "Servicio",
          respuestaCliente: r.estado,
          cotizacion: r.cotizacion
            ? {
                total: r.cotizacion.total,
                detalles: r.cotizacion.detalles,
                estado: r.cotizacion.estado,
              }
            : null,
        };
      });

      setReservas(formateadas);
    } catch (error) {
      console.error("Error obteniendo reservas:", error);
    }
  };

  // ============================================================
  // 🔥 2. FILTROS ACTUALIZADOS SEGÚN TU LÓGICA REAL
  // ============================================================

  // 👉 Confirmada pero sin cotización → Reservas por cotizar
  const reservasPendientes = reservas.filter(
    (r) => r.respuestaCliente === "CONFIRMADA" && !r.cotizacion
  );

  // 👉 Confirmada y con cotización → En Espera
  const cotizacionesEnEspera = reservas.filter(
    (r) => r.cotizacion && r.cotizacion.estado === "PENDIENTE"
  );

  // 👉 Canceladas → Historial
  const cotizacionesConfirmadas = reservas.filter(
    (r) =>
      r.cotizacion &&
      (r.cotizacion.estado === "CONFIRMADO" ||
        r.cotizacion.estado === "RECHAZADO")
  );

  // --- Helper de paginación (cliente-side) ---
  const paginate = (arr, page) => {
    const total = arr.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const p = Math.min(Math.max(1, page), totalPages);
    const start = (p - 1) * perPage;
    const end = start + perPage;
    return {
      slice: arr.slice(start, end),
      total,
      totalPages,
      start,
      end,
      page: p,
    };
  };

  // Obtener slices paginados para cada sección
  const pagPend = paginate(reservasPendientes, pagePend);
  const pagEn = paginate(cotizacionesEnEspera, pageEn);
  const pagHist = paginate(cotizacionesConfirmadas, pageHist);

  // Reset página cuando cambian las listas
  useEffect(() => setPagePend(1), [reservasPendientes.length, perPage]);
  useEffect(() => setPageEn(1), [cotizacionesEnEspera.length, perPage]);
  useEffect(() => setPageHist(1), [cotizacionesConfirmadas.length, perPage]);
  // --- fin helper ---

  // ============================================================
  // 🔥 3. EL RESTO DE TU CÓDIGO SIGUE IGUAL
  // ============================================================

  const [modalTipo, setModalTipo] = useState("");
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [precioCotizacion, setPrecioCotizacion] = useState("");
  const [detallesCotizacion, setDetallesCotizacion] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpanded = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const abrirModalCotizacion = (reserva) => {
    if (reserva.cotizacion) return;

    setCotizacionSeleccionada(reserva);
    setModalTipo("crear");
    setPrecioCotizacion("");
    setDetallesCotizacion("");
  };

  const abrirModalDetalles = (reserva) => {
    setCotizacionSeleccionada(reserva);
    setModalTipo("ver_detalles");
  };

  // ===============================
  // 🔥 CREAR COTIZACIÓN (ACTUALIZADA)
  // ===============================
  const crearCotizacion = async () => {
    if (!precioCotizacion || !detallesCotizacion) {
      alert("Por favor ingresa todos los campos.");
      return;
    }

    try {
      const resp = await fetch("http://localhost:4001/mecanica/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_reserva: cotizacionSeleccionada.id_reserva,
          total: parseFloat(precioCotizacion),
          detalles: detallesCotizacion,
        }),
      });

      if (!resp.ok) {
        throw new Error("Error al enviar la cotización");
      }

      const nueva = await resp.json();

      // 🔥 Actualizar UI sin recargar
      setReservas((prev) =>
        prev.map((r) =>
          r.id_reserva === cotizacionSeleccionada.id_reserva
            ? {
                ...r,
                cotizacion: {
                  total: nueva.total,
                  detalles: nueva.detalles,
                  estado: nueva.estado,
                },
              }
            : r
        )
      );

      alert("Cotización enviada correctamente.");
      setModalTipo("");
    } catch (error) {
      console.error("Error creando cotización:", error);
      alert("Hubo un error al enviar la cotización.");
    }
  };

  const ReservaCard = ({ reserva, index, onActionClick, type }) => {
    const isExpanded = expandedCard === reserva.id_reserva;

    const estadoActual = reserva.cotizacion?.estado || reserva.respuestaCliente;

    const cardBg = "bg-[#16182c] hover:bg-white/10";
    const titleColor = "text-white";
    const detailColor = "text-white/70";
    const dividerColor = "border-white/10";

    const statusColor =
      estadoActual === "CONFIRMADA"
        ? "text-green-300 bg-green-600/30"
        : estadoActual === "CANCELADA"
        ? "text-red-300 bg-red-600/30"
        : "text-yellow-300 bg-yellow-600/30";
    return (
      <div
        key={reserva.id_reserva}
        className={`${cardBg} rounded-xl p-4 mb-3 border border-white/10 shadow-lg sm:p-6 transition-colors duration-200`}
      >
        {/* HEADER */}
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpanded(reserva.id_reserva)}
        >
          <div className="flex items-center space-x-3">
            <span className={`font-bold text-lg ${titleColor}`}>
              {index + 1}.
            </span>
            <div className="flex flex-col">
              <span
                className={`font-semibold truncate max-w-[200px] ${titleColor}`}
              >
                {reserva.cliente.nombre}
              </span>
              <span className={`text-sm flex items-center ${detailColor}`}>
                <Car className="w-4 h-4 mr-1" />
                {reserva.vehiculo}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}
            >
              {reserva.cotizacion ? reserva.cotizacion.estado : estadoActual}
            </span>
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${detailColor}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${detailColor}`} />
            )}
          </div>
        </div>

        {/* EXPANDIBLE */}
        {isExpanded && (
          <div className={`mt-4 pt-4 border-t ${dividerColor} space-y-3`}>
            <div className={`flex items-center text-sm ${detailColor}`}>
              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
              Fecha/Hora: {reserva.fecha} @ {reserva.hora_inicio}
            </div>

            <div className={`flex items-start text-sm ${detailColor}`}>
              <Wrench className="w-4 h-4 mr-2 text-yellow-400 mt-0.5" />
              Servicio: {reserva.servicio}
            </div>

            {/* CONTACTO */}
            <div
              className={`text-sm ${detailColor} border-t border-dashed ${dividerColor} pt-3`}
            >
              <p className={`font-semibold ${titleColor} mb-1`}>Contacto:</p>
              <p>Email: {reserva.cliente.correo}</p>
              <p>Tel: {reserva.cliente.telefono}</p>
            </div>

            {/* COTIZACIÓN SI EXISTE */}
            {reserva.cotizacion && (
              <div
                className={`text-sm ${detailColor} border-t border-dashed ${dividerColor} pt-3`}
              >
                <p
                  className={`font-semibold ${titleColor} mb-1 flex items-center`}
                >
                  <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                  Cotización: S/ {reserva.cotizacion.total}
                </p>
                <p className="text-xs italic text-white/50">
                  {reserva.cotizacion.detalles}
                </p>
              </div>
            )}

            {/* BOTÓN DE ACCIÓN */}
            <div className={`pt-3 border-t ${dividerColor}`}>
              {type === "pendientes" && (
                <button
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  onClick={() => onActionClick(reserva)}
                >
                  Crear Cotización
                </button>
              )}

              {type === "en_espera" && (
                <button
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                  onClick={() => abrirModalDetalles(reserva)}
                >
                  Ver Cotización Enviada
                </button>
              )}

              {type === "confirmadas" && (
                <button
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
                  onClick={() => abrirModalDetalles(reserva)}
                >
                  Ver Detalles
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // 🔥 4. RETORNO (NO TOCO TU DISEÑO)
  // ============================================================

  return (
    <div className="p-4 sm:p-8 space-y-10 min-h-screen text-white">
      {/* RESERVAS POR COTIZAR */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-yellow-500" /> Reservas por
          Cotizar (Sin Cotización Enviada)
        </h3>

        {pagPend.slice.length > 0 ? (
          pagPend.slice.map((reserva, idx) => (
            <ReservaCard
              key={reserva.id_reserva}
              reserva={reserva}
              index={pagPend.start + idx}
              onActionClick={abrirModalCotizacion}
              type="pendientes"
            />
          ))
        ) : (
          <p className="text-white/60 italic bg-[#16182c] p-3 rounded-lg">
            No hay reservas pendientes de cotización.
          </p>
        )}

        {/* PAGINADOR SECCIÓN Pendientes */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-white/70">
            Mostrando {Math.min(pagPend.start + 1, pagPend.total)}-
            {Math.min(pagPend.end, pagPend.total)} de {pagPend.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagePend((p) => Math.max(1, p - 1))}
              disabled={pagPend.page === 1}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: pagPend.totalPages }, (_, i) => i + 1).map(
              (n) => (
                <button
                  key={n}
                  onClick={() => setPagePend(n)}
                  className={`px-3 py-1 rounded ${
                    n === pagPend.page
                      ? "bg-violet-600 text-white"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() =>
                setPagePend((p) => Math.min(pagPend.totalPages, p + 1))
              }
              disabled={pagPend.page === pagPend.totalPages}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <hr className="border-gray-700" />

      {/* COTIZACIONES ENVIADAS */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-500" /> Cotizaciones
          Enviadas (En Espera)
        </h3>

        {pagEn.slice.length > 0 ? (
          pagEn.slice.map((reserva, idx) => (
            <ReservaCard
              key={reserva.id_reserva}
              reserva={reserva}
              index={pagEn.start + idx}
              type="en_espera"
            />
          ))
        ) : (
          <p className="text-white/60 italic bg-[#16182c] p-3 rounded-lg">
            No hay cotizaciones enviadas.
          </p>
        )}

        {/* PAGINADOR SECCIÓN En Espera */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-white/70">
            Mostrando {Math.min(pagEn.start + 1, pagEn.total)}-
            {Math.min(pagEn.end, pagEn.total)} de {pagEn.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageEn((p) => Math.max(1, p - 1))}
              disabled={pagEn.page === 1}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: pagEn.totalPages }, (_, i) => i + 1).map(
              (n) => (
                <button
                  key={n}
                  onClick={() => setPageEn(n)}
                  className={`px-3 py-1 rounded ${
                    n === pagEn.page
                      ? "bg-violet-600 text-white"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() =>
                setPageEn((p) => Math.min(pagEn.totalPages, p + 1))
              }
              disabled={pagEn.page === pagEn.totalPages}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <hr className="border-gray-700" />

      {/* HISTORIAL */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-green-500" /> Historial de
          Respuestas
        </h3>

        {pagHist.slice.length > 0 ? (
          pagHist.slice.map((reserva, idx) => (
            <ReservaCard
              key={reserva.id_reserva}
              reserva={reserva}
              index={pagHist.start + idx}
              type="confirmadas"
            />
          ))
        ) : (
          <p className="text-white/60 italic bg-[#16182c] p-3 rounded-lg">
            No hay cotizaciones confirmadas o rechazadas.
          </p>
        )}

        {/* PAGINADOR SECCIÓN Historial */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-white/70">
            Mostrando {Math.min(pagHist.start + 1, pagHist.total)}-
            {Math.min(pagHist.end, pagHist.total)} de {pagHist.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageHist((p) => Math.max(1, p - 1))}
              disabled={pagHist.page === 1}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: pagHist.totalPages }, (_, i) => i + 1).map(
              (n) => (
                <button
                  key={n}
                  onClick={() => setPageHist(n)}
                  className={`px-3 py-1 rounded ${
                    n === pagHist.page
                      ? "bg-violet-600 text-white"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() =>
                setPageHist((p) => Math.min(pagHist.totalPages, p + 1))
              }
              disabled={pagHist.page === pagHist.totalPages}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {/* --------- MODALES (NO LOS MODIFIQUÉ) --------- */}
      {modalTipo === "crear" && cotizacionSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13162b] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setModalTipo("")}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-blue-400 border-b pb-3 border-white/10">
              Crear Cotización
            </h2>

            <div className="mb-4">
              <label className="text-white/70 text-sm block mb-1">
                Precio cotizado (S/):
              </label>
              <input
                type="number"
                value={precioCotizacion}
                onChange={(e) => setPrecioCotizacion(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                placeholder="Ej. 120.00"
              />
            </div>

            <div className="mb-4">
              <label className="text-white/70 text-sm block mb-1">
                Detalles del servicio:
              </label>
              <textarea
                value={detallesCotizacion}
                onChange={(e) => setDetallesCotizacion(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                rows={4}
              ></textarea>
            </div>

            <button
              onClick={crearCotizacion}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Enviar Cotización
            </button>
          </div>
        </div>
      )}

      {modalTipo === "ver_detalles" && cotizacionSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13162b] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setModalTipo("")}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              Resumen de Cotización
            </h2>

            <p className="text-lg font-bold text-blue-400 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              {cotizacionSeleccionada.vehiculo}
            </p>

            <div className="space-y-3 text-white/80 border-t pt-4 mt-4">
              <p className="font-medium flex justify-between items-center text-lg">
                <span>Monto Total:</span>
                <span className="text-xl text-green-400 font-bold">
                  S/ {cotizacionSeleccionada.cotizacion.total}
                </span>
              </p>

              <p className="flex justify-between items-center">
                <span>Estado:</span>
                <span className="font-semibold text-green-400">
                  {cotizacionSeleccionada.respuestaCliente}
                </span>
              </p>
            </div>

            <div className="space-y-2 text-white/80 border-t pt-4 mt-4">
              <p className="font-semibold">Detalles:</p>
              <p className="text-sm italic">
                {cotizacionSeleccionada.cotizacion.detalles}
              </p>
            </div>

            <button
              onClick={() => setModalTipo("")}
              className="w-full mt-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
