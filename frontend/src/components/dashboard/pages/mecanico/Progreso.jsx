import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  Wrench,
  Car,
  Clock,
  FileText,
  User,
  Loader,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

const ESTADOS_SERVICIO = {
  pendiente: { label: "Pendiente", icon: Clock },
  en_proceso: { label: "En proceso", icon: Loader },
  finalizado: { label: "Finalizado", icon: CheckCircle },
};

export default function ProgresoDeVehiculo() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  // --- BUSCADOR Y PAGINACIÓN ---
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  // reset página cuando cambian búsqueda/perPage/servicios
  useEffect(() => setPage(1), [searchQuery, perPage, servicios.length]);

  const filteredServicios = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return servicios;
    return servicios.filter((s) => {
      return (
        (s.servicio || "").toLowerCase().includes(q) ||
        (s.vehiculo || "").toLowerCase().includes(q) ||
        (s.placa || "").toLowerCase().includes(q) ||
        (s.cliente?.nombre || "").toLowerCase().includes(q)
      );
    });
  }, [servicios, searchQuery]);

  const total = filteredServicios.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayedServicios = filteredServicios.slice(startIndex, endIndex);
  // --- FIN BUSCADOR Y PAGINACIÓN ---

  const idUsuario = Number(localStorage.getItem("id_usuario"));
  const token = localStorage.getItem("token") || "";

  // ========================================================
  // 📌 Cargar asignaciones REALES del mecánico logueado
  // ========================================================
  const cargarAsignaciones = async () => {
    try {
      const res = await fetch(`${API}/mecanica/asignaciones`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();

      // ⭐ Filtrar solo asignaciones del mecánico logueado
      const filtradas = data.filter((a) => {
        const idUsuarioMecanico = a.mecanico?.usuario?.id_usuario;
        return Number(idUsuarioMecanico) === Number(idUsuario);
      });

      // ⭐ Mapeo SEGURO (como en tu frontend que sí funciona)
      const mapeadas = filtradas.map((a) => {
        const reserva = a.cotizacion?.reserva || {};
        const vehiculo = reserva.vehiculo || {};
        const modelo = vehiculo.modelo || {};
        const marca = modelo.marca || {};

        const fecha = reserva.fecha?.split("T")[0] || "";
        const clienteUsuario = reserva.cliente?.usuario || {};

        return {
          id_asignacion: a.id_asignacion,
          estado: a.estado,
          servicio: reserva.servicio?.nombre ?? "Servicio",
          vehiculo: `${marca.nombre ?? ""} ${modelo.nombre ?? ""}`.trim(),
          placa: vehiculo.placa ?? "",
          fecha: fecha
            ? `${fecha.split("-")[2]}/${fecha.split("-")[1]}/${
                fecha.split("-")[0]
              }`
            : "",
          hora_inicio: reserva.hora_inicio ?? "",
          mecanico_nombre: a.mecanico?.usuario?.nombre ?? "",

          cliente: {
            nombre: clienteUsuario.nombre ?? "Cliente",
            correo: clienteUsuario.correo ?? "—",
            telefono:
              reserva.cliente?.telefono ?? clienteUsuario.telefono ?? "—",
            direccion:
              reserva.cliente?.direccion ?? clienteUsuario.direccion ?? "—",
          },

          raw: a,
        };
      });

      setServicios(mapeadas);
      setCargando(false);
    } catch (error) {
      console.error("Error cargando asignaciones:", error);
      setCargando(false);
    }
  };

  // ========================================================
  // 📌 Cambiar estado del servicio
  // ========================================================
  const actualizarEstado = async (idAsignacion, nuevoEstado) => {
    try {
      await fetch(`${API}/mecanica/asignaciones/${idAsignacion}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      cargarAsignaciones();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
  }, []);

  if (cargando) {
    return (
      <div className="p-10 flex items-center justify-center flex-col text-white">
        <Loader className="w-12 h-12 animate-spin text-purple-400" />
        <p className="mt-4 text-lg">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Wrench className="text-yellow-400" /> Progreso de Vehículos
      </h3>

      {/* BARRA: Buscador + selector perPage */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por servicio, vehículo, placa o cliente..."
          className="w-full md:w-1/2 p-3 rounded-lg bg-white/5 border border-white/10 text-white"
        />
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-white/70">Por página:</label>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="p-2 rounded bg-white/5 text-white"
          >
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={9}>9</option>
          </select>
        </div>
      </div>

      {filteredServicios.length === 0 && !cargando && (
        <p className="text-white/60 italic">No tienes servicios asignados.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedServicios.map((s, index) => {
          const globalIndex = startIndex + index;
          const IconEstado = ESTADOS_SERVICIO[s.estado]?.icon;

          return (
            <div
              key={s.id_asignacion}
              className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700"
            >
              <div className="flex justify-between mb-4">
                <span className="text-yellow-400 font-bold text-xl">
                  #{globalIndex + 1}
                </span>

                <span className="capitalize text-gray-300 px-3 py-1 rounded-lg bg-gray-700 flex items-center gap-2">
                  <IconEstado className="w-4 h-4" />
                  {ESTADOS_SERVICIO[s.estado]?.label}
                </span>
              </div>

              {/* Vehículo */}
              <p className="flex items-center gap-2 mb-2 text-gray-300">
                <Car className="text-blue-400" />
                {s.vehiculo} — {s.placa}
              </p>

              {/* Servicio */}
              <p className="flex items-center gap-2 mb-2 text-gray-300">
                <FileText className="text-purple-400" />
                {s.servicio}
              </p>

              {/* Fecha */}
              <p className="flex items-center gap-2 mb-2 text-gray-300">
                <Clock className="text-yellow-400" />
                {s.fecha} @ {s.hora_inicio}
              </p>

              {/* Cliente */}
              <div className="border-t border-gray-600 pt-4 mt-4">
                <p className="flex items-center gap-2 text-white font-semibold">
                  <User className="text-green-400" /> Cliente
                </p>

                <p className="text-gray-300">{s.cliente.nombre}</p>
                <p className="text-gray-400 text-sm">{s.cliente.correo}</p>
                <p className="text-gray-400 text-sm">{s.cliente.telefono}</p>
                <p className="text-gray-400 text-sm">{s.cliente.direccion}</p>
              </div>

              {/* Botones de estado */}
              <div className="mt-5 flex gap-2 flex-wrap">
                {Object.keys(ESTADOS_SERVICIO).map((estado) => (
                  <button
                    key={estado}
                    disabled={s.estado === estado}
                    onClick={() => actualizarEstado(s.id_asignacion, estado)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      s.estado === estado
                        ? "bg-gray-600 cursor-not-allowed opacity-60"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {ESTADOS_SERVICIO[estado].label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINADOR (responsive) */}
      <div className="mt-6">
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
            <div className="flex items-center gap-1 overflow-auto max-w-[360px]">
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
            <div className="text-sm text-white/70">
              {page}/{totalPages}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex-1 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex-1 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
