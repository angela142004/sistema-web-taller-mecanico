import { useState, useEffect, useMemo } from "react";
import { CheckCircle, Wrench, Car, Clock, User, Mail, Phone, MapPin, Loader, Calendar, Search, DollarSign } from "lucide-react";

// ---
// 💡 FUNCIÓN DE FORMATO: Para mostrar el costo con formato de moneda
const formatCosto = (costo) => `$${costo.toFixed(2)}`;
// ---

export default function HistorialServicios() {
  const [serviciosFinalizados, setServiciosFinalizados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  // Simulación de carga de datos (Se mantiene igual)
  useEffect(() => {
    const cargarDatos = () => {
      const serviciosSimulados = [
        { idReserva: 1001, cliente: { nombre: "Ana García", correo: "ana.garcia@example.com", telefono: "098-765-4321", direccion: "Calle Ficticia 123" }, vehiculo: "Ford Fiesta", servicio: "Cambio de aceite y filtro", fecha: "2023-11-25", horaInicio: "14:00", estado: "Finalizado", costo: 85.50, },
        { idReserva: 1002, cliente: { nombre: "Luis Gómez", correo: "luis.gomez@example.com", telefono: "333-222-1111", direccion: "Calle Real 456" }, vehiculo: "Chevrolet Spark", servicio: "Diagnóstico de motor", fecha: "2023-11-26", horaInicio: "09:30", estado: "Finalizado", costo: 45.00, },
        { idReserva: 1003, cliente: { nombre: "Martín López", correo: "martin.l@example.com", telefono: "444-555-6666", direccion: "Av. Central 999" }, vehiculo: "Toyota Corolla", servicio: "Revisión de frenos", fecha: "2023-11-27", horaInicio: "11:00", estado: "Finalizado", costo: 120.75, },
        { idReserva: 1004, cliente: { nombre: "Sofía Martínez", correo: "sofia.m@example.com", telefono: "555-123-4567", direccion: "Paseo del Río 200" }, vehiculo: "Honda Civic", servicio: "Alineación y balanceo", fecha: "2023-11-28", horaInicio: "15:30", estado: "Finalizado", costo: 95.00, },
        { idReserva: 1005, cliente: { nombre: "Andrés Díaz", correo: "andres.d@example.com", telefono: "666-987-6543", direccion: "Callejón Secreto 10" }, vehiculo: "Nissan Qashqai", servicio: "Reemplazo de batería", fecha: "2023-11-29", horaInicio: "10:00", estado: "Finalizado", costo: 65.00, },
      ];

      setTimeout(() => {
        setServiciosFinalizados(serviciosSimulados.filter(s => s.estado === "Finalizado"));
        setCargando(false);
      }, 700);
    };

    cargarDatos();
  }, []);

  // Filtrado de servicios (Se mantiene igual)
  const serviciosFiltrados = useMemo(() => {
    const textoBusqueda = filtroBusqueda.toLowerCase();
    
    if (!textoBusqueda) {
      return serviciosFinalizados;
    }

    return serviciosFinalizados.filter(servicio => 
      servicio.idReserva.toString().includes(textoBusqueda) ||
      servicio.vehiculo.toLowerCase().includes(textoBusqueda) ||
      servicio.servicio.toLowerCase().includes(textoBusqueda) ||
      servicio.cliente.nombre.toLowerCase().includes(textoBusqueda)
    );
  }, [serviciosFinalizados, filtroBusqueda]);

  // Renderizado de carga
  if (cargando) {
    return (
      <div className="p-8 min-h-screen flex flex-col items-center justify-center text-white bg-gray-900">
        <Loader className="w-12 h-12 text-green-400 animate-spin" />
        <p className="mt-4 text-lg">Cargando historial de servicios...</p>
      </div>
    );
  }

  // Componente de Tarjeta Móvil (Extraído para limpieza)
  const MobileCard = ({ servicio }) => (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg ring-1 ring-gray-700 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-gray-700">
        <span className="font-extrabold text-xl text-yellow-400">#{servicio.idReserva}</span>
        <span className="text-2xl font-bold text-green-400">{formatCosto(servicio.costo)}</span>
      </div>
      
      <p className="flex justify-between items-center text-sm text-gray-300">
        <span className="font-semibold flex items-center"><Car className="w-4 h-4 mr-2 text-blue-400"/> Vehículo:</span>
        <span className="font-medium text-white">{servicio.vehiculo}</span>
      </p>
      
      <p className="flex justify-between items-center text-sm text-gray-300">
        <span className="font-semibold flex items-center"><Wrench className="w-4 h-4 mr-2 text-yellow-400"/> Servicio:</span>
        <span className="text-right">{servicio.servicio}</span>
      </p>

      <p className="flex justify-between items-center text-sm text-gray-300">
        <span className="font-semibold flex items-center"><Calendar className="w-4 h-4 mr-2 text-purple-400"/> Fecha:</span>
        <span>{servicio.fecha}</span>
      </p>
      
      <div className="pt-2 border-t border-dashed border-gray-700 text-xs">
        <p className="text-gray-400 flex items-center mb-1"><User className="w-4 h-4 mr-2 text-green-500"/> Cliente: <span className="text-white ml-1">{servicio.cliente.nombre}</span></p>
        <p className="text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-2"/> {servicio.cliente.direccion}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen text-white bg-gray-900">
      <h2 className="text-4xl font-extrabold flex items-center border-b-2 border-green-600 pb-3">
        <CheckCircle className="w-10 h-10 mr-3 text-green-400" />
        Historial de Servicios Completados
      </h2>

      {/* --- */}

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-white text-2xl font-semibold flex items-center mb-4 sm:mb-0">
            <Wrench className="w-6 h-6 mr-3 text-yellow-400" />
            Registros Históricos
          </h3>

          {/* Filtro de Búsqueda (Se mantiene responsive) */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por vehículo, servicio o cliente..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors duration-200"
            />
          </div>
        </div>

        {/* --- */}

        {/* 💡 CONTENEDOR RESPONSIVE */}
        
        {/* 1. VISTA MÓVIL (Por defecto: Tarjetas) */}
        <div className="sm:hidden space-y-4">
          {serviciosFiltrados.length > 0 ? (
            serviciosFiltrados.map((servicio) => (
              <MobileCard key={servicio.idReserva} servicio={servicio} />
            ))
          ) : (
            <p className="text-white/50 italic text-center pt-8">
              <Search className="w-5 h-5 inline mr-2"/> No se encontraron servicios que coincidan.
            </p>
          )}
        </div>
        
        {/* 2. VISTA DE ESCRITORIO/TABLET (sm:block: Tabla) */}
        <div className="hidden sm:block overflow-x-auto rounded-lg shadow-xl ring-1 ring-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/80">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <Car className="w-4 h-4 inline mr-1 text-blue-400"/> Vehículo
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <Wrench className="w-4 h-4 inline mr-1 text-yellow-400"/> Servicio
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 inline mr-1 text-purple-400"/> Fecha
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  <User className="w-4 h-4 inline mr-1 text-green-400"/> Cliente
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 inline mr-1 text-green-400"/> Costo
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {serviciosFiltrados.length > 0 ? (
                serviciosFiltrados.map((servicio) => (
                  <tr key={servicio.idReserva} className="hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-400">
                      {servicio.idReserva}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {servicio.vehiculo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {servicio.servicio}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                      {servicio.fecha}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                      {servicio.cliente.nombre}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-green-400">
                      {formatCosto(servicio.costo)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">
                    <Search className="w-5 h-5 inline mr-2"/> No se encontraron servicios que coincidan con su búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mensaje si no hay historial cargado (solo se muestra si la lista original está vacía) */}
        {serviciosFinalizados.length === 0 && !cargando && (
             <p className="mt-8 text-white/50 italic text-center">
              <CheckCircle className="w-5 h-5 mr-2 inline text-green-400"/> ¡El historial está vacío!
            </p>
        )}
      </section>
    </div>
  );
}