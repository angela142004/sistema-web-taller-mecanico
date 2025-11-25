import { useState } from "react";
import { Search, History, Car, User, Wrench, Calendar } from "lucide-react";

// --- SIMULACIÓN DE DATOS BASE (Basado en tu esquema de Prisma) ---

// Base de Clientes (Clientes + Usuarios)
const clientesData = [
  { id_cliente: 1, nombre: "Juan Pérez", telefono: "555-1234", direccion: "Calle 1, Ciudad A" },
  { id_cliente: 2, nombre: "María Gómez", telefono: "555-5678", direccion: "Av. 2, Ciudad B" },
];

// Base de Mecánicos (Mecanicos + Usuarios)
const mecanicosData = [
  { id_mecanico: 1, nombre: "Carlos Rivera", especialidad: "Motores Gasolina" },
  { id_mecanico: 2, nombre: "Laura Soto", especialidad: "Frenos y Suspensión" },
];

// Base de Vehículos (incluye Marca/Modelo para el historial)
const vehiculosData = [
  { id_vehiculo: 101, id_cliente: 1, placa: "ABC-123", marca: "Toyota", modelo: "Corolla", anio: 2020 },
  { id_vehiculo: 102, id_cliente: 2, placa: "XYZ-789", marca: "Ford", modelo: "Fiesta", anio: 2018 },
];

// Base de Reservas (asociadas a los servicios)
const reservasData = [
    { id_reserva: 1, id_cliente: 1, id_vehiculo: 101, servicio_nombre: "Cambio de Aceite", fecha: new Date('2025-11-01T09:00:00') },
    { id_reserva: 2, id_cliente: 2, id_vehiculo: 102, servicio_nombre: "Revisión de Frenos", fecha: new Date('2025-11-15T14:30:00') },
];


// Base de Historial_Servicios (EL FILTRO PRINCIPAL para servicios FINALIZADOS)
const historialInicial = [
  {
    id_historial: 1,
    id_reserva: 1,
    id_mecanico: 1,
    descripcion: "Se realizó el cambio de aceite estándar y filtro. Nivel de líquidos revisado.",
    fecha: new Date('2025-11-01'),
    costo: 35.00,
  },
  {
    id_historial: 2,
    id_reserva: 2,
    id_mecanico: 2,
    descripcion: "Se reemplazaron las pastillas de freno delanteras y se rectificaron discos.",
    fecha: new Date('2025-11-15'),
    costo: 120.50,
  },
];


// --- FUNCIONES DE UTILIDAD PARA UNIR DATOS ---

const getClienteInfo = (id) => {
    const cliente = clientesData.find(c => c.id_cliente === id);
    return cliente ? { nombre: cliente.nombre, telefono: cliente.telefono } : { nombre: "N/A", telefono: "N/A" };
};

const getMecanicoInfo = (id) => {
    const mecanico = mecanicosData.find(m => m.id_mecanico === id);
    return mecanico ? { nombre: mecanico.nombre, especialidad: mecanico.especialidad } : { nombre: "N/A", especialidad: "N/A" };
};

const getVehiculoInfo = (id) => {
    const vehiculo = vehiculosData.find(v => v.id_vehiculo === id);
    return vehiculo ? { placa: vehiculo.placa, marca: vehiculo.marca, modelo: vehiculo.modelo } : { placa: "N/A", marca: "N/A", modelo: "N/A" };
};

const getReservaInfo = (id) => {
    return reservasData.find(r => r.id_reserva === id);
};


// --- COMPONENTE PRINCIPAL ---

export default function HistorialServiciosPage() {
  const [historial, setHistorial] = useState(historialInicial);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  // 1. Unir toda la información para el historial
  const historialCompleto = historial.map(h => {
    const reserva = getReservaInfo(h.id_reserva);
    if (!reserva) return null; // Saltar si la reserva no existe (Error de datos)

    const cliente = getClienteInfo(reserva.id_cliente);
    const mecanico = getMecanicoInfo(h.id_mecanico);
    const vehiculo = getVehiculoInfo(reserva.id_vehiculo);

    return {
      ...h,
      cliente: cliente.nombre,
      mecanico: mecanico.nombre,
      placa: vehiculo.placa,
      vehiculo_descripcion: `${vehiculo.marca} ${vehiculo.modelo}`,
      servicio_nombre: reserva.servicio_nombre,
      fecha_atencion: reserva.fecha, // Fecha original de la cita
      costo: h.costo.toFixed(2),
    };
  }).filter(item => item !== null);


  // 2. Lógica de Filtrado (por Cliente, Mecánico, Vehículo o Servicio)
  const historialFiltrado = historialCompleto.filter((registro) => {
    const busquedaLower = filtroBusqueda.toLowerCase();
    
    return (
      registro.cliente.toLowerCase().includes(busquedaLower) ||
      registro.mecanico.toLowerCase().includes(busquedaLower) ||
      registro.placa.toLowerCase().includes(busquedaLower) ||
      registro.vehiculo_descripcion.toLowerCase().includes(busquedaLower) ||
      registro.servicio_nombre.toLowerCase().includes(busquedaLower) ||
      registro.descripcion.toLowerCase().includes(busquedaLower)
    );
  });

  // Función de formato de fecha
  const formatFecha = (date) => new Date(date).toLocaleDateString('es-ES', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });


  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <History size={28} className="text-blue-400" /> Historial de Servicios Finalizados
      </h2>

      {/* --- Barra de Búsqueda y Filtros --- */}
      <div className="relative w-full md:w-96 mb-6">
        <input
          type="text"
          placeholder="Buscar por cliente, mecánico, placa o servicio..."
          value={filtroBusqueda}
          onChange={(e) => setFiltroBusqueda(e.target.value)}
          className="w-full p-2 pl-10 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
      </div>

      {/* --- Versión para Desktop/Tablet (Tabla) --- */}
      <div className="hidden md:block overflow-x-auto bg-white/10 rounded-xl shadow-lg border border-white/20">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/15">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Fecha Finalizado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Cliente / Vehículo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Mecánico Asignado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Servicio Realizado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Descripción del Trabajo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Costo Final ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {historialFiltrado.map((h) => (
              <tr key={h.id_historial} className="hover:bg-white/5 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{h.id_historial}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300">{formatFecha(h.fecha)}</td>
                <td className="px-6 py-4 text-sm text-white">
                    <span className="font-semibold">{h.cliente}</span><br/>
                    <span className="text-white/70 text-xs">{h.vehiculo_descripcion} ({h.placa})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{h.mecanico}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300 font-medium">{h.servicio_nombre}</td>
                <td className="px-6 py-4 text-xs text-white/80 max-w-xs overflow-hidden truncate" title={h.descripcion}>
                    {h.descripcion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-400">$ {h.costo}</td>
              </tr>
            ))}
            {historialFiltrado.length === 0 && (
                <tr>
                    <td colSpan="7" className="px-6 py-6 text-center text-white/70">
                        No se encontraron servicios finalizados con el filtro "{filtroBusqueda}".
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Versión para Móvil (Tarjetas Apiladas) --- */}
      <div className="md:hidden space-y-4">
        {historialFiltrado.map((h) => (
          <div key={h.id_historial} className="bg-white/10 rounded-xl p-4 border border-white/20 shadow-md space-y-2">
            
            <p className="text-xs text-white/70 flex items-center gap-1"><History size={14}/> 
                <span className="font-semibold text-yellow-300">Finalizado el: {formatFecha(h.fecha)}</span> 
                (ID: {h.id_historial})
            </p>

            <div className="border-t border-white/10 pt-2 space-y-1">
                <p className="text-sm font-medium text-blue-300 flex items-center gap-1">Servicio: <span className="text-white">{h.servicio_nombre}</span></p>

                <p className="text-sm text-white flex items-center gap-1">
                    <User size={14}/> Cliente: <span className="font-semibold">{h.cliente}</span>
                </p>

                <p className="text-sm text-white flex items-center gap-1">
                    <Wrench size={14}/> Mecánico: {h.mecanico}
                </p>

                <p className="text-sm text-white/70 flex items-center gap-1">
                    <Car size={14}/> Vehículo: {h.vehiculo_descripcion} ({h.placa})
                </p>
            </div>
            
            <p className="text-xs italic text-white/50 border-t border-white/10 pt-2">
                Trabajo: {h.descripcion}
            </p>

            <div className="flex justify-end pt-2">
                <p className="text-lg font-bold text-green-400">Total: $ {h.costo}</p>
            </div>
          </div>
        ))}
        {historialFiltrado.length === 0 && (
            <div className="text-center p-6 text-white/70 border border-white/10 rounded-xl">
                No se encontraron servicios finalizados con el filtro "{filtroBusqueda}".
            </div>
        )}
      </div>
    </div>
  );
}