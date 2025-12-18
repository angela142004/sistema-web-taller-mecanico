import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Wrench,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function ServicioAsignadoMecanico() {
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  useEffect(() => {
    setPage(1);
  }, [serviciosAsignados.length, perPage]);

  const total = serviciosAsignados.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayedServicios = serviciosAsignados.slice(startIndex, endIndex);
  // --- FIN PAGINACIÓN ---

  const idUsuario = Number(localStorage.getItem("id_usuario"));
  const token = localStorage.getItem("token") || "";
  const API = import.meta.env.VITE_API_URL;

  // ========================================================
  // 📌 Cargar asignaciones reales
  // ========================================================
  useEffect(() => {
    const controller = new AbortController();

    const fetchAsignaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/mecanica/asignaciones`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          setMessage({
            text: "No se pudieron cargar asignaciones",
            type: "error",
          });
          return;
        }

        const data = await res.json();

        // ⭐ Filtrar solo las del mecánico logueado ⭐
        const filtradas = data.filter((a) => {
          const idUsuarioMecanico = a.mecanico?.usuario?.id_usuario;
          return Number(idUsuarioMecanico) === Number(idUsuario);
        });

        // ⭐ Mapeo ⭐
        const mapeadas = filtradas.map((a) => {
          const reserva = a.cotizacion?.reserva || {};
          const vehiculo = reserva.vehiculo || {};
          const modelo = vehiculo.modelo || {};
          const marca = modelo.marca || {};

          const clienteUsuario = reserva.cliente?.usuario || {};

          const fechaRaw = reserva.fecha || "";
          const fecha = fechaRaw ? fechaRaw.split("T")[0] : "";

          return {
            id_asignacion: a.id_asignacion,
            id_reserva: reserva.id_reserva,
            confirmado_por_mecanico: Boolean(a.confirmado_por_mecanico),

            fecha: fecha
              ? `${fecha.split("-")[2]}/${fecha.split("-")[1]}/${
                  fecha.split("-")[0]
                }`
              : "",

            hora_inicio: reserva.hora_inicio ?? "",
            servicio: reserva.servicio?.nombre ?? "Servicio",
            vehiculo: `${marca.nombre ?? ""} ${modelo.nombre ?? ""}`.trim(),

            cliente: {
              nombre: clienteUsuario.nombre ?? "Cliente",
              correo: clienteUsuario.correo ?? "",
              telefono:
                reserva.cliente?.telefono ?? clienteUsuario.telefono ?? "—",

              direccion:
                reserva.cliente?.direccion ?? clienteUsuario.direccion ?? "—",
            },

            raw: a,
          };
        });

        setServiciosAsignados(mapeadas);
      } catch (error) {
        if (error.name !== "AbortError")
          setMessage({ text: "Error cargando asignaciones", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchAsignaciones();
    return () => controller.abort();
  }, [idUsuario, token, API]);

  // ========================================================
  // 📌 Confirmar recepción (NUEVO ENDPOINT)
  // ========================================================
  const confirmarRecepcion = async (id_asignacion) => {
    setActionLoading(id_asignacion);
    try {
      const res = await fetch(
        `${API}/mecanica/asignaciones/${id_asignacion}/recepcion`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!res.ok) {
        setMessage({
          text: "No se pudo confirmar la recepción",
          type: "error",
        });
        return;
      }

      // ⭐ Actualizar UI sin borrar la tarjeta ⭐
      setServiciosAsignados((prev) =>
        prev.map((s) =>
          s.id_asignacion === id_asignacion
            ? { ...s, confirmado_por_mecanico: true }
            : s
        )
      );

      setMessage({
        text: "Servicio recibido por el mecánico",
        type: "success",
      });
    } catch (error) {
      setMessage({
        text: "Error de red al confirmar servicio",
        type: "error",
      });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const serviciosPendientes = serviciosAsignados;

  return (
    <div className="p-4 sm:p-8 space-y-10 min-h-screen text-white">
      {message.text && (
        <div
          className={`p-3 rounded-md ${
            message.type === "success" ? "bg-green-800/30" : "bg-red-800/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-400" />
          Servicios Asignados ({total})
        </h3>

        <div className="space-y-4">
          {displayedServicios.length ? (
            displayedServicios.map((servicio, i) => (
              <div
                key={servicio.id_asignacion}
                className="bg-gray-800 rounded-xl p-4 shadow-2xl hover:shadow-purple-600/30"
              >
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
                  <div className="font-bold text-lg text-yellow-400">
                    Reserva #{startIndex + i + 1}
                  </div>

                  {/* 🔥 SI YA CONFIRMÓ, MOSTRAR BADGE */}
                  {servicio.confirmado_por_mecanico ? (
                    <div className="px-3 py-1 text-sm rounded-full bg-green-900/40 text-green-400 border border-green-700">
                      RECIBIDO POR EL MECÁNICO
                    </div>
                  ) : (
                    <div className="px-3 py-1 text-sm rounded-full bg-purple-900/40 text-purple-400 border border-purple-700">
                      PENDIENTE DE RECIBIR
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-gray-400 space-y-2 text-sm">
                  <p className="flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-semibold text-white mr-1">
                      Servicio:
                    </span>
                    {servicio.servicio}
                  </p>

                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="font-semibold text-white mr-1">
                      Fecha/Hora:
                    </span>
                    {servicio.fecha} @ {servicio.hora_inicio}
                  </p>

                  {/* Cliente */}
                  <div className="pt-3 border-t border-gray-700">
                    <p className="font-semibold text-white mb-1 flex items-center">
                      <User className="w-4 h-4 mr-2 text-green-500" />
                      Datos del Cliente
                    </p>

                    <ul className="ml-2 space-y-1">
                      <li className="flex items-center text-xs">
                        <Mail className="w-3 h-3 mr-2" />
                        {servicio.cliente.nombre} ({servicio.cliente.correo})
                      </li>

                      <li className="flex items-center text-xs">
                        <Phone className="w-3 h-3 mr-2" />
                        {servicio.cliente.telefono}
                      </li>

                      <li className="flex items-center text-xs">
                        <MapPin className="w-3 h-3 mr-2" />
                        {servicio.cliente.direccion}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 🔥 Botón solo si NO está confirmado */}
                {!servicio.confirmado_por_mecanico && (
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => confirmarRecepcion(servicio.id_asignacion)}
                      disabled={actionLoading === servicio.id_asignacion}
                      className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center ${
                        actionLoading === servicio.id_asignacion
                          ? "bg-purple-400/40 cursor-wait"
                          : "bg-purple-700 hover:bg-purple-800"
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {actionLoading === servicio.id_asignacion
                        ? "Confirmando..."
                        : "CONFIRMAR RECEPCIÓN"}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-white/50 italic">
              No tienes servicios asignados.
            </p>
          )}
        </div>

        {/* PAGINADOR */}
        <div className="mt-4">
          <div className="hidden md:flex items-center justify-between">
            <div className="text-sm text-white/70">
              Mostrando {Math.min(startIndex + 1, total)}-
              {Math.min(endIndex, total)} de {total}
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
                <option value={4}>4 / pág</option>
                <option value={6}>6 / pág</option>
                <option value={10}>10 / pág</option>
              </select>

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1 max-w-[360px] overflow-auto px-1">
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
                <option value={4}>4</option>
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
      </section>
    </div>
  );
}
