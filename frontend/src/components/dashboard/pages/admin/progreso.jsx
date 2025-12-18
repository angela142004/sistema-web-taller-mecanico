import { useState, useMemo, useEffect } from "react";
import { Wrench, Calendar, Info } from "lucide-react";
const API = import.meta.env.VITE_API_URL;
export default function AdminProgresoVehiculos() {
  const [data, setData] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [showEstadoExplanation, setShowEstadoExplanation] = useState(false);

  const estadosAsignacion = ["Todos", "Pendiente", "En Proceso", "Finalizado"];

  const formatearFecha = (fechaISO) => {
    const [y, m, d] = fechaISO.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  // 🚀 Cargar datos
  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        const response = await fetch(`${API}/mecanica/asignaciones`);
        const json = await response.json();

        const adaptado = json.map((a, index) => {
          const reserva = a.cotizacion.reserva;

          return {
            id_visual: index + 1,
            id_reserva_real: reserva.id_reserva,

            cliente: {
              nombre: reserva.cliente?.usuario?.nombre || "Sin nombre",
              correo: reserva.cliente?.usuario?.correo || "",
            },

            vehiculo: `${reserva.vehiculo.modelo.marca.nombre} ${reserva.vehiculo.modelo.nombre}`,
            fecha: reserva.fecha,
            hora_inicio: reserva.hora_inicio,

            // ⛔ BACKEND ENVÍA: pendiente | en_proceso | finalizado
            // ⛔ PERO FRONT NECESITA: Pendiente | En Proceso | Finalizado
            estado_asignacion: a.estado.replace("_", " ").toLowerCase(), // normalize

            mecanico: {
              nombre: a.mecanico.usuario.nombre,
            },
          };
        });

        setData(adaptado);
      } catch (error) {
        console.error("Error cargando asignaciones:", error);
      }
    };

    cargarAsignaciones();
  }, []);

  // --- FILTRO ---
  const filteredData = useMemo(() => {
    if (estadoFiltro === "Todos") return data;

    const estadoNormalizado = estadoFiltro.toLowerCase().replace(" ", "");

    return data.filter(
      (r) => r.estado_asignacion.replace(" ", "") === estadoNormalizado
    );
  }, [estadoFiltro, data]);

  // --- PAGINACIÓN (cliente-side) ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  // Reset página cuando cambian filtros/datos
  useEffect(() => {
    setPage(1);
  }, [filteredData, perPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayedData = filteredData.slice(startIndex, endIndex);
  // --- FIN PAGINACIÓN ---

  // --- BADGE DE ESTADO ---
  const EstadoAsignacionBadge = ({ estado }) => {
    const estadoNormalizado = estado.toLowerCase();

    let colorClass;
    switch (estadoNormalizado) {
      case "pendiente":
        colorClass =
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500";
        break;
      case "en proceso":
        colorClass = "bg-blue-500/20 text-blue-400 border border-blue-500";
        break;
      case "finalizado":
        colorClass = "bg-green-500/20 text-green-400 border border-green-500";
        break;
      default:
        colorClass = "bg-gray-500/20 text-gray-400 border border-gray-500";
        break;
    }

    return (
      <span
        className={`px-2 py-0.5 inline-flex text-xs rounded-full font-semibold ${colorClass}`}
      >
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  // --- EXPLICACIÓN ESTADOS ---
  const EstadoExplicacion = () => (
    <div className="bg-[#13182b] text-white p-4 sm:p-6 rounded-xl shadow-xl mt-4 border border-[#2c3451]">
      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-blue-400">
        <Info size={20} /> Explicación de Estados
      </h3>
      <div className="space-y-2 text-sm text-gray-300">
        <p>
          <span className="font-semibold text-yellow-400">Pendiente:</span> Aún
          no inicia.
        </p>
        <p>
          <span className="font-semibold text-blue-400">En Proceso:</span>{" "}
          Trabajo en curso.
        </p>
        <p>
          <span className="font-semibold text-green-400">Finalizado:</span>{" "}
          Servicio completado.
        </p>
      </div>
    </div>
  );

  // --- VISTA MOBILE ---
  const MobileCardView = () => (
    <div className="grid grid-cols-1 gap-4 mt-6 sm:hidden">
      {displayedData.length === 0 ? (
        <div className="text-center text-gray-400 py-6 bg-[#1b223b] rounded-xl p-4">
          No se encontraron reservas para este estado.
        </div>
      ) : (
        displayedData.map((reserva) => (
          <div
            key={reserva.id_visual}
            className="bg-[#1b223b] p-4 rounded-xl shadow-lg border border-[#2c3451] space-y-3"
          >
            <div className="flex justify-between items-start border-b border-[#444f68] pb-2">
              <h4 className="font-bold text-lg text-blue-400">
                Reserva #{reserva.id_visual}
              </h4>
              <EstadoAsignacionBadge estado={reserva.estado_asignacion} />
            </div>

            <div className="text-sm space-y-2 text-gray-300">
              <p>
                <span className="font-semibold text-white">Cliente:</span>{" "}
                {reserva.cliente.nombre}
              </p>
              <p>
                <span className="font-semibold text-white">Vehículo:</span>{" "}
                {reserva.vehiculo}
              </p>
              <p className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                <span className="font-semibold text-white">
                  Fecha/Hora:
                </span>{" "}
                {formatearFecha(reserva.fecha)} @ {reserva.hora_inicio}
              </p>
              <p>
                <span className="font-semibold text-white">Mecánico:</span>{" "}
                {reserva.mecanico.nombre}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // --- TABLA DESKTOP ---
  const ResponsiveTable = () => (
    <div className="overflow-x-auto mt-6 hidden sm:block">
      <table className="min-w-full table-auto text-white divide-y divide-[#444f68]">
        <thead>
          <tr className="bg-[#2c3451] uppercase text-xs tracking-wider">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Vehículo</th>
            <th className="px-4 py-3 text-left">Fecha/Hora</th>
            <th className="px-4 py-3 text-left">Mecánico</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#444f68]">
          {displayedData.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-gray-400 py-6">
                No se encontraron resultados.
              </td>
            </tr>
          ) : (
            displayedData.map((r, index) => (
              <tr
                key={r.id_visual}
                className={`${
                  index % 2 === 0 ? "bg-[#1b223b]" : "bg-[#13182b]"
                } hover:bg-[#2c3451]`}
              >
                <td className="px-4 py-3">{r.id_visual}</td>
                <td className="px-4 py-3">{r.cliente.nombre}</td>
                <td className="px-4 py-3">{r.vehiculo}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatearFecha(r.fecha)} @ {r.hora_inicio}
                </td>
                <td className="px-4 py-3">{r.mecanico.nombre}</td>
                <td className="px-4 py-3">
                  <EstadoAsignacionBadge estado={r.estado_asignacion} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // --- UI PAGINADOR ---
  const Paginador = () => (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-white/70">
        Mostrando {Math.min(startIndex + 1, filteredData.length)}-
        {Math.min(endIndex, filteredData.length)} de {filteredData.length}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
        >
          Anterior
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`px-3 py-1 rounded ${
              n === page
                ? "bg-violet-600 text-white"
                : "bg-[#2a2a2a] text-white"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 font-[Inter]">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
        <Wrench size={30} className="inline mr-2 text-blue-400" /> Progreso de
        Vehículos
      </h1>

      {/* FILTRO */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-3">
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="w-full sm:w-auto bg-[#1b223b] text-white p-3 rounded-xl border border-[#444f68]"
        >
          {estadosAsignacion.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowEstadoExplanation(!showEstadoExplanation)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-blue-400 bg-blue-900/30 border border-blue-700/50"
        >
          <Info size={20} />
          {showEstadoExplanation
            ? "Ocultar Explicación"
            : "Ver Explicación de Estados"}
        </button>
      </div>

      {showEstadoExplanation && <EstadoExplicacion />}

      <MobileCardView />
      <ResponsiveTable />
      <Paginador />
    </div>
  );
}
