import { useState, useMemo } from "react";
import { Wrench, Calendar, CheckCircle, XCircle, Info } from "lucide-react";

// Datos simulados (sin cambios)
const initialData = [
  {
    id_reserva: 1,
    cliente: { nombre: "Juan Pérez", correo: "juan.perez@ejemplo.com" },
    vehiculo: "Toyota Corolla",
    fecha: "2023-11-24",
    hora_inicio: "10:00",
    estado_asignacion: "Pendiente",
    mecanico: { nombre: "Carlos López", especialidad: "Motor", estado: "Disponible" },
  },
  {
    id_reserva: 2,
    cliente: { nombre: "Ana García", correo: "ana.garcia@ejemplo.com" },
    vehiculo: "Ford Fiesta",
    fecha: "2023-11-25",
    hora_inicio: "14:00",
    estado_asignacion: "En Proceso",
    mecanico: { nombre: "Sofía Díaz", especialidad: "Frenos", estado: "Ocupado" },
  },
  {
    id_reserva: 3,
    cliente: { nombre: "Luis Soto", correo: "luis.soto@ejemplo.com" },
    vehiculo: "Chevrolet Spark",
    fecha: "2023-11-26",
    hora_inicio: "09:30",
    estado_asignacion: "Finalizado",
    mecanico: { nombre: "Ricardo Vega", especialidad: "Eléctrico", estado: "Disponible" },
  },
];

export default function AdminProgresoVehiculos() {
  const [data, setData] = useState(initialData);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [showEstadoExplanation, setShowEstadoExplanation] = useState(false);

  const estadosAsignacion = ["Todos", "Pendiente", "En Proceso", "Finalizado"];

  // Filtrado de reservas según estado de asignación
  const filteredData = useMemo(() => {
    if (estadoFiltro === "Todos") return data;
    return data.filter((reserva) => reserva.estado_asignacion === estadoFiltro);
  }, [estadoFiltro, data]);

  // Componente para mostrar estado de asignación con colores (sin cambios)
  const EstadoAsignacionBadge = ({ estado }) => {
    let colorClass;
    switch (estado) {
      case "Pendiente":
        colorClass = "bg-yellow-500/20 text-yellow-400 border border-yellow-500";
        break;
      case "En Proceso":
        colorClass = "bg-blue-500/20 text-blue-400 border border-blue-500";
        break;
      case "Finalizado":
        colorClass = "bg-green-500/20 text-green-400 border border-green-500";
        break;
      default:
        colorClass = "bg-gray-500/20 text-gray-400 border border-gray-500";
        break;
    }
    return (
      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        {estado}
      </span>
    );
  };

  // Explicación de los estados (sin cambios)
  const EstadoExplicacion = () => (
    <div className="bg-[#13182b] text-white p-4 sm:p-6 rounded-xl shadow-xl mt-4 border border-[#2c3451]">
      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-blue-400">
        <Info size={20} /> Explicación de Estados
      </h3>
      <div className="space-y-2 text-sm text-gray-300">
        <p>
          <span className="font-semibold text-yellow-400">Pendiente:</span> El trabajo no ha sido iniciado por el mecánico.
        </p>
        <p>
          <span className="font-semibold text-blue-400">En Proceso:</span> El mecánico está trabajando activamente en el vehículo.
        </p>
        <p>
          <span className="font-semibold text-green-400">Finalizado:</span> El servicio ha sido completado y el vehículo está listo para la entrega.
        </p>
      </div>
    </div>
  );

  // --- NUEVO: VISTA DE TARJETAS PARA MÓVILES ---
  const MobileCardView = () => (
    <div className="grid grid-cols-1 gap-4 mt-6 sm:hidden"> {/* Solo visible en mobile */}
      {filteredData.length === 0 ? (
        <div className="text-center text-gray-400 py-6 bg-[#1b223b] rounded-xl p-4">
          No se encontraron reservas para mostrar con el estado seleccionado.
        </div>
      ) : (
        filteredData.map((reserva) => (
          <div key={reserva.id_reserva} className="bg-[#1b223b] p-4 rounded-xl shadow-lg border border-[#2c3451] space-y-3">
            <div className="flex justify-between items-start border-b border-[#444f68] pb-2">
              <h4 className="font-bold text-lg text-blue-400">Reserva #{reserva.id_reserva}</h4>
              <EstadoAsignacionBadge estado={reserva.estado_asignacion} />
            </div>

            <div className="text-sm space-y-2 text-gray-300">
              <p>
                <span className="font-semibold text-white">Cliente:</span> {reserva.cliente.nombre}
              </p>
              <p>
                <span className="font-semibold text-white">Vehículo:</span> {reserva.vehiculo}
              </p>
              <p className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-400" />
                <span className="font-semibold text-white">Fecha/Hora:</span> {reserva.fecha} @ {reserva.hora_inicio}
              </p>
              <p>
                <span className="font-semibold text-white">Mecánico:</span> {reserva.mecanico.nombre}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // --- TABLA TRADICIONAL PARA ESCRITORIO ---
  const ResponsiveTable = () => (
    <div className="overflow-x-auto mt-6 hidden sm:block"> {/* Oculta en mobile, visible en sm y superior */}
      <table className="min-w-full table-auto text-white divide-y divide-[#444f68]">
        <thead>
          <tr className="bg-[#2c3451] uppercase text-xs tracking-wider">
            <th className="px-4 py-3 font-bold text-left">ID</th>
            <th className="px-4 py-3 font-bold text-left">Cliente</th>
            <th className="px-4 py-3 font-bold text-left">Vehículo</th>
            <th className="px-4 py-3 font-bold text-left">Fecha/Hora</th>
            <th className="px-4 py-3 font-bold text-left">Mecánico</th>
            <th className="px-4 py-3 font-bold text-left">Estado Asignación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#444f68]">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-gray-400 py-6">
                No se encontraron reservas para mostrar con el estado seleccionado.
              </td>
            </tr>
          ) : (
            filteredData.map((reserva, index) => (
              <tr key={reserva.id_reserva} className={`${index % 2 === 0 ? "bg-[#1b223b]" : "bg-[#13182b]"} hover:bg-[#2c3451] transition-colors`}>
                <td className="px-4 py-3 text-sm text-gray-200">{reserva.id_reserva}</td>
                <td className="px-4 py-3 text-sm text-gray-200">{reserva.cliente.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-200">{reserva.vehiculo}</td>
                <td className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">{reserva.fecha} @ {reserva.hora_inicio}</td>
                <td className="px-4 py-3 text-sm text-gray-200">{reserva.mecanico.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap">
                  <EstadoAsignacionBadge estado={reserva.estado_asignacion} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 font-[Inter]">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 text-center sm:text-left">
        <Wrench size={30} className="inline mr-2 text-blue-400" /> Progreso de Vehículos
      </h1>

      {/* Controles de Filtro y Explicación (sin cambios) */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-3">
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="w-full sm:w-auto bg-[#1b223b] text-white p-3 rounded-xl border border-[#444f68] focus:ring-2 focus:ring-blue-500"
        >
          {estadosAsignacion.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowEstadoExplanation(!showEstadoExplanation)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-blue-400 bg-blue-900/30 hover:bg-blue-800/50 border border-blue-700/50"
        >
          <Info size={20} />
          {showEstadoExplanation ? 'Ocultar Explicación' : 'Ver Explicación de Estados'}
        </button>
      </div>

      {/* Explicación de los estados (Mostrado dinámicamente) */}
      {showEstadoExplanation && <EstadoExplicacion />}

      {/* Mostrar la vista de tarjetas en móvil */}
      <MobileCardView />

      {/* Mostrar la tabla tradicional en desktop/tablet */}
      <ResponsiveTable />
    </div>
  );
}