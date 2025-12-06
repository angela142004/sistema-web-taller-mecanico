import { useState, useEffect } from "react";
import { CheckCircle, Clock, Wrench, Car, User, Mail, Phone, MapPin, Handshake } from "lucide-react";

export default function ServicioAsignadoMecanico() {
  // Estado para los servicios asignados al mecánico
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  // Simulación de datos: Servicios asignados, todos inicialmente pendientes de confirmar
  useEffect(() => {
    const serviciosSimulados = [
      {
        id_reserva: 1001,
        cliente: { nombre: "Ana García", correo: "ana.garcia@example.com", telefono: "098-765-4321", direccion: "Calle Ficticia 123" },
        vehiculo: "Ford Fiesta",
        fecha: "2023-11-25",
        hora_inicio: "14:00",
        servicio: "Cambio de aceite y filtro",
        confirmado_por_mecanico: false, 
      },
      {
        id_reserva: 1002,
        cliente: { nombre: "Luis Gómez", correo: "luis.gomez@example.com", telefono: "333-222-1111", direccion: "Calle Real 456" },
        vehiculo: "Chevrolet Spark",
        fecha: "2023-11-26",
        hora_inicio: "09:30",
        servicio: "Diagnóstico de motor",
        confirmado_por_mecanico: false, 
      },
      {
        id_reserva: 1003,
        cliente: { nombre: "Martín López", correo: "martin.l@example.com", telefono: "444-555-6666", direccion: "Av. Central 999" },
        vehiculo: "Toyota Corolla",
        fecha: "2023-11-27",
        hora_inicio: "11:00",
        servicio: "Revisión de frenos",
        confirmado_por_mecanico: false, 
      },
    ];

    setServiciosAsignados(serviciosSimulados);
  }, []);

  /**
   * Función para que el mecánico confirme que ha recibido el servicio asignado.
   * Al confirmar, el servicio se elimina de esta lista (pasa a otra vista/page).
   * @param {number} id_reserva - El ID de la reserva a confirmar.
   */
  const confirmarRecepcion = (id_reserva) => {
    // Simulación de envío de datos al backend (cambiando el estado a 'confirmado')
    
    // Filtra el servicio confirmado, eliminándolo de la lista local
    setServiciosAsignados(prevServicios => 
      prevServicios.filter(servicio => servicio.id_reserva !== id_reserva)
    );
    
    alert(`¡Servicio ${id_reserva} CONFIRMADO! Ya puedes empezar el trabajo.`);
  };
  
  const serviciosPendientes = serviciosAsignados.filter(s => !s.confirmado_por_mecanico);

  return (
    <div className="p-4 sm:p-8 space-y-10 min-h-screen text-white ">


      {/* Sección: Servicios Pendientes de Confirmación */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 sm:text-lg flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-400" />
          Servicios Nuevos ({serviciosPendientes.length})
        </h3>
        
        <div className="space-y-4">
          {serviciosPendientes.length > 0 ? (
            serviciosPendientes.map((servicio) => (
              <div
                key={servicio.id_reserva}
                className="bg-gray-800 rounded-xl p-4 shadow-2xl transition-shadow duration-300 hover:shadow-purple-600/30"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 pb-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-yellow-400">Reserva #{servicio.id_reserva}</span>
                    <span className="text-sm text-gray-400">| {servicio.vehiculo}</span>
                  </div>
                  {/* Badge morado para indicar pendiente */}
                  <div className="mt-2 sm:mt-0 text-sm font-medium px-3 py-1 rounded-full text-purple-400 bg-purple-900/40 border border-purple-700">
                    PENDIENTE DE RECIBIR
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-semibold text-white mr-1">Servicio:</span> {servicio.servicio}
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="font-semibold text-white mr-1">Fecha/Hora:</span> {servicio.fecha} @ {servicio.hora_inicio}
                  </p>
                  
                  {/* Detalles del Cliente */}
                  <div className="pt-3 border-t border-dashed border-gray-700">
                    <p className="font-semibold text-white mb-1 flex items-center">
                       <User className="w-4 h-4 mr-2 text-green-500" />
                        Datos del Cliente:
                    </p>
                    <ul className="ml-2 space-y-1">
                      <li className="flex items-center text-xs text-gray-400">
                        <Mail className="w-3 h-3 mr-2 text-gray-500" /> {servicio.cliente.nombre} (<span className="text-gray-300">{servicio.cliente.correo}</span>)
                      </li>
                      <li className="flex items-center text-xs text-gray-400">
                        <Phone className="w-3 h-3 mr-2 text-gray-500" /> {servicio.cliente.telefono}
                      </li>
                      <li className="flex items-center text-xs text-gray-400">
                        <MapPin className="w-3 h-3 mr-2 text-gray-500" /> {servicio.cliente.direccion}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Botón de Confirmación */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <button
                    className="w-full text-center py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg text-sm transition-colors duration-200 flex items-center justify-center"
                    onClick={() => confirmarRecepcion(servicio.id_reserva)}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    CONFIRMAR RECEPCIÓN
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/50 italic">👍 No hay servicios nuevos pendientes de confirmar.</p>
          )}
        </div>
      </section>

    </div>
  );
}