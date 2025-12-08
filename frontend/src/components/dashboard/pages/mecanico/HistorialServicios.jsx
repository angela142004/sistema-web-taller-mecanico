import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  Wrench,
  Car,
  Calendar,
  User,
  MapPin,
  Loader,
  Search,
  DollarSign,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4001";

export default function HistorialServicios() {
  const [serviciosFinalizados, setServiciosFinalizados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  // reset página al cambiar filtro/perPage/datos
  useEffect(
    () => setPage(1),
    [filtroBusqueda, perPage, serviciosFinalizados.length]
  );
  // --- FIN PAGINACIÓN ---

  const idUsuario = Number(localStorage.getItem("id_usuario"));
  const token = localStorage.getItem("token") || "";

  // ========================================================
  // 📌 Cargar asignaciones FINALIZADAS del mecánico logueado
  // ========================================================
  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API}/mecanica/asignaciones`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();

      console.log("Asignaciones obtenidas:", data);

      // ⭐ Filtrar SOLO asignaciones del mecánico + estado finalizado
      const filtradas = data.filter((a) => {
        const idUsuarioMecanico = a.mecanico?.usuario?.id_usuario;

        return (
          Number(idUsuarioMecanico) === Number(idUsuario) &&
          a.estado === "finalizado"
        );
      });

      console.log("Asignaciones finalizadas del mecánico logueado:", filtradas);

      // ⭐ Mapeo SEGURO
      const mapeadas = filtradas.map((a) => {
        const reserva = a.cotizacion?.reserva || {};
        const vehiculo = reserva.vehiculo || {};
        const modelo = vehiculo.modelo || {};
        const marca = modelo.marca || {};

        const fechaRaw = reserva.fecha?.split("T")[0] || "";
        const clienteUsuario = reserva.cliente?.usuario || {};

        return {
          idReserva: reserva.id_reserva,
          estado: a.estado,
          servicio: reserva.servicio?.nombre ?? "Servicio",
          vehiculo: `${marca.nombre ?? ""} ${modelo.nombre ?? ""}`.trim(),
          fecha: fechaRaw,
          horaInicio: reserva.hora_inicio ?? "",
          costo: Number(a.cotizacion?.total ?? 0),

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

      setServiciosFinalizados(mapeadas);
      setCargando(false);
    } catch (e) {
      console.error("Error cargando historial:", e);
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // ========================================================
  // 📌 Filtro de búsqueda
  // ========================================================
  const serviciosFiltrados = useMemo(() => {
    const texto = filtroBusqueda.toLowerCase();

    return serviciosFinalizados.filter(
      (s) =>
        s.vehiculo.toLowerCase().includes(texto) ||
        s.servicio.toLowerCase().includes(texto) ||
        s.cliente.nombre.toLowerCase().includes(texto) ||
        s.idReserva?.toString().includes(texto)
    );
  }, [serviciosFinalizados, filtroBusqueda]);

  // --- cálculo paginación sobre serviciosFiltrados ---
  const total = serviciosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayedServicios = serviciosFiltrados.slice(startIndex, endIndex);
  // --- fin cálculo ---

  if (cargando) {
    return (
      <div className="p-8 min-h-screen flex flex-col items-center justify-center text-white bg-gray-900">
        <Loader className="w-12 h-12 text-green-400 animate-spin" />
        <p className="mt-4 text-lg">Cargando historial de servicios...</p>
      </div>
    );
  }

  const formatCosto = (c) => `$${Number(c).toFixed(2)}`;

  // ========================================================
  // 📌 Tarjeta móvil
  // ========================================================
  const MobileCard = ({ servicio }) => (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg ring-1 ring-gray-700 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-gray-700">
        <span className="font-extrabold text-xl text-yellow-400">
          #{servicio.visualId}
        </span>

        <span className="text-2xl font-bold text-green-400">
          {formatCosto(servicio.costo)}
        </span>
      </div>

      <p className="text-sm text-gray-300 flex justify-between">
        <span className="font-semibold flex items-center">
          <Car className="w-4 h-4 mr-2 text-blue-400" /> Vehículo
        </span>
        <span className="text-white">{servicio.vehiculo}</span>
      </p>

      <p className="text-sm text-gray-300 flex justify-between">
        <span className="font-semibold flex items-center">
          <Wrench className="w-4 h-4 mr-2 text-yellow-400" /> Servicio
        </span>
        <span>{servicio.servicio}</span>
      </p>

      <p className="text-sm text-gray-300 flex justify-between">
        <span className="font-semibold flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-purple-400" /> Fecha
        </span>
        <span>{servicio.fecha}</span>
      </p>

      <div className="pt-2 border-t border-dashed border-gray-700 text-xs">
        <p className="text-gray-400 flex items-center mb-1">
          <User className="w-4 h-4 mr-2 text-green-500" />{" "}
          {servicio.cliente.nombre}
        </p>
        <p className="text-gray-500 flex items-center">
          <MapPin className="w-3 h-3 mr-2" /> {servicio.cliente.direccion}
        </p>
      </div>
    </div>
  );

  // ========================================================
  // 📌 Render principal
  // ========================================================
  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen text-white bg-gray-900">
      <h2 className="text-4xl font-extrabold flex items-center border-b-2 border-green-600 pb-3">
        <CheckCircle className="w-10 h-10 mr-3 text-green-400" /> Historial de
        Servicios Completados
      </h2>

      {/* Filtro */}
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h3 className="text-2xl font-semibold flex items-center">
          <Wrench className="w-6 h-6 mr-3 text-yellow-400" /> Registros
          Históricos
        </h3>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-green-500"
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-4">
        {displayedServicios.length > 0 ? (
          displayedServicios.map((s, idx) => (
            <MobileCard
              key={s.idReserva}
              servicio={{ ...s, visualId: startIndex + idx + 1 }}
            />
          ))
        ) : (
          <p className="text-center text-gray-400 italic">
            No se encontraron servicios.
          </p>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-lg shadow-xl ring-1 ring-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                Vehículo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                Servicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase hidden md:table-cell">
                Cliente
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                Costo
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {displayedServicios.map((s, idx) => (
              <tr key={s.idReserva} className="hover:bg-gray-700/50">
                <td className="px-4 py-3 text-yellow-400 font-medium">
                  {startIndex + idx + 1}
                </td>

                <td className="px-4 py-3 text-gray-300">{s.vehiculo}</td>
                <td className="px-4 py-3 text-gray-300">{s.servicio}</td>
                <td className="px-4 py-3 text-gray-300">{s.fecha}</td>
                <td className="px-4 py-3 text-gray-300 hidden md:table-cell">
                  {s.cliente.nombre}
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-400">
                  {formatCosto(s.costo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

            <div className="flex items-center gap-1 overflow-auto max-w-[360px] px-1">
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
