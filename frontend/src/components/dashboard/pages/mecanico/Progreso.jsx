import { useState, useEffect, useCallback } from "react";
// 💡 Importaciones ajustadas a los íconos necesarios
import { CheckCircle, Wrench, Car, Clock, FileText, User, Mail, Phone, Loader } from "lucide-react";

// 💡 ESTRUCTURA SIMPLIFICADA: Solo los tres estados requeridos
const ESTADOS_SERVICIO = {
  PENDIENTE: {
    nombre: "Pendiente",
    color: "text-blue-400 bg-blue-900/40 border-blue-700",
    icono: Clock,
  },
  EN_PROCESO: {
    nombre: "En proceso",
    color: "text-yellow-400 bg-yellow-900/40 border-yellow-700",
    icono: Loader,
  },
  FINALIZADO: {
    nombre: "Finalizado",
    color: "text-green-400 bg-green-900/40 border-green-700",
    icono: CheckCircle,
  },
};

export default function ProgresoDeVehiculo() {
  const [serviciosConfirmados, setServiciosConfirmados] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Función para obtener las propiedades de un estado (color, ícono)
  const obtenerPropiedadesEstado = (nombreEstado) => {
    // Busca la clave del estado (e.g., 'PENDIENTE') por su nombre (e.g., 'Pendiente')
    const estadoKey = Object.keys(ESTADOS_SERVICIO).find(
      (key) => ESTADOS_SERVICIO[key].nombre === nombreEstado
    );
    // Devuelve las propiedades si existe, si no, usa PENDIENTE como fallback
    return ESTADOS_SERVICIO[estadoKey] || ESTADOS_SERVICIO.PENDIENTE;
  };

  // Función para actualizar el estado del servicio.
  const actualizarEstado = useCallback((idReserva, nuevoEstadoKey) => {
    if (!ESTADOS_SERVICIO[nuevoEstadoKey]) {
      console.error("Estado de servicio no válido:", nuevoEstadoKey);
      return;
    }

    setServiciosConfirmados((prevServicios) =>
      prevServicios.map((servicio) =>
        servicio.idReserva === idReserva
          ? { ...servicio, estado: ESTADOS_SERVICIO[nuevoEstadoKey].nombre }
          : servicio
      )
    );
  }, []);

  // Simulación de carga de datos (inicialización)
  useEffect(() => {
    const cargarServicios = () => {
      const serviciosSimulados = [
        {
          idReserva: 1001,
          cliente: { nombre: "Ana García", correo: "ana.garcia@example.com", telefono: "098-765-4321" },
          vehiculo: "Ford Fiesta",
          servicio: "Cambio de aceite y filtro",
          estado: ESTADOS_SERVICIO.PENDIENTE.nombre,
        },
        {
          idReserva: 1002,
          cliente: { nombre: "Luis Gómez", correo: "luis.gomez@example.com", telefono: "333-222-1111" },
          vehiculo: "Chevrolet Spark",
          servicio: "Diagnóstico de motor",
          estado: ESTADOS_SERVICIO.EN_PROCESO.nombre,
        },
        {
          idReserva: 1003,
          cliente: { nombre: "Martín López", correo: "martin.l@example.com", telefono: "444-555-6666" },
          vehiculo: "Toyota Corolla",
          servicio: "Revisión de frenos",
          estado: ESTADOS_SERVICIO.FINALIZADO.nombre,
        },
      ];

      setTimeout(() => {
        setServiciosConfirmados(serviciosSimulados);
        setCargando(false);
      }, 500); // Carga rápida
    };

    cargarServicios();
  }, []);

  if (cargando) {
    return (
      <div className="p-8 min-h-screen flex flex-col items-center justify-center text-white">
        <Loader className="w-12 h-12 text-purple-400 animate-spin" />
        <p className="mt-4 text-lg">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-10 min-h-screen text-white">

      <section>
        <h3 className="text-white text-2xl font-semibold mb-6 flex items-center">
          <Wrench className="w-6 h-6 mr-3 text-yellow-400" />
          Servicios Activos ({serviciosConfirmados.length})
        </h3>
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviciosConfirmados.length > 0 ? (
            serviciosConfirmados.map((servicio) => {
              const propsEstado = obtenerPropiedadesEstado(servicio.estado);
              const IconoEstado = propsEstado.icono;

              return (
                <div
                  key={servicio.idReserva}
                  className="bg-gray-800 rounded-xl p-6 shadow-2xl ring-2 ring-gray-700 hover:ring-purple-500 transition-all duration-300"
                >
                  <div className="flex justify-between items-start border-b border-gray-700 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-xl text-yellow-400">#{servicio.idReserva}</span>
                      <span className="text-base text-gray-400">| {servicio.vehiculo}</span>
                    </div>
                    {/* Estado dinámico con color e ícono */}
                    <div className={`mt-0 text-sm font-bold px-4 py-1.5 rounded-full ${propsEstado.color} flex items-center`}>
                      <IconoEstado className="w-4 h-4 mr-2" />
                      {servicio.estado}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-400">
                    <p className="flex items-start text-base">
                      <Wrench className="w-5 h-5 mr-3 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="font-semibold text-white mr-1">Servicio:</span> {servicio.servicio}
                    </p>

                    {/* Detalles del Cliente */}
                    <div className="pt-3 border-t border-dashed border-gray-700">
                      <p className="font-semibold text-white mb-2 flex items-center text-base">
                        <User className="w-5 h-5 mr-2 text-green-500" />
                        Datos del Cliente
                      </p>
                      <ul className="ml-2 space-y-1">
                        <li className="flex items-center text-sm">
                          <span className="font-medium text-gray-300 mr-2">{servicio.cliente.nombre}</span>
                        </li>
                        <li className="flex items-center text-xs text-gray-500">
                          <Mail className="w-3 h-3 mr-2" /> {servicio.cliente.correo}
                        </li>
                        <li className="flex items-center text-xs text-gray-500">
                          <Phone className="w-3 h-3 mr-2" /> {servicio.cliente.telefono}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Botones de cambio de estado (Solo 3) */}
                  <div className="mt-6 pt-4 border-t border-gray-700 space-x-3 flex flex-wrap">
                    {Object.keys(ESTADOS_SERVICIO).map((estadoKey) => {
                      const estadoData = ESTADOS_SERVICIO[estadoKey];
                      const isActive = servicio.estado === estadoData.nombre;
                      const baseClass = `py-2 px-3 rounded-lg text-sm transition-all duration-200 border`;
                      
                      return (
                        <button
                          key={estadoKey}
                          onClick={() => actualizarEstado(servicio.idReserva, estadoKey)}
                          disabled={isActive}
                          className={`${baseClass} ${
                            isActive
                              ? `opacity-70 cursor-not-allowed ${estadoData.color.replace('text', 'bg').replace('border', 'ring')} ring-2 text-white`
                              : `bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300`
                          } mb-2`}
                        >
                          {estadoData.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-white/50 italic col-span-full">👍 No hay servicios activos en este momento.</p>
          )}
        </div>
      </section>

    </div>
  );
}