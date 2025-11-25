import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Calendar, Wrench, Car, XCircle, DollarSign } from "lucide-react";

export default function AsignarMecanico() {
  // Estado de las reservas, mecánicos y el modal
  const [reservas, setReservas] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [mecanicoAsignado, setMecanicoAsignado] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // Simulación de datos de mecánicos y reservas
  useEffect(() => {
    // Cargar reservas y mecánicos
    setReservas([
      {
        id_reserva: 1001,
        cliente: { nombre: "Ana García", correo: "ana.garcia@example.com", telefono: "098-765-4321", direccion: "Calle Ficticia 123" },
        vehiculo: "Ford Fiesta",
        fecha: "2023-11-25",
        hora_inicio: "14:00",
        servicio: "Cambio de aceite y filtro",
        respuestaCliente: "Aprobado",
      },
      {
        id_reserva: 1002,
        cliente: { nombre: "Luis Gómez", correo: "luis.gomez@example.com", telefono: "333-222-1111", direccion: "Calle Real 456" },
        vehiculo: "Chevrolet Spark",
        fecha: "2023-11-26",
        hora_inicio: "09:30",
        servicio: "Diagnóstico de motor",
        respuestaCliente: "Aprobado",
      },
    ]);

    setMecanicos([
      { id_mecanico: 1, nombre: "Carlos Mendoza", disponible: true },
      { id_mecanico: 2, nombre: "Laura Díaz", disponible: false },
      { id_mecanico: 3, nombre: "José Martínez", disponible: true },
    ]);
  }, []);

  const toggleExpanded = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const abrirModalAsignar = (reserva) => {
    setReservaSeleccionada(reserva);
    setOpenModal(true);
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setMecanicoSeleccionado(null);
    setReservaSeleccionada(null);
  };

  const asignarMecanico = () => {
    if (!mecanicoSeleccionado) {
      alert("Por favor selecciona un mecánico.");
      return;
    }

    alert(`Mecánico ${mecanicoSeleccionado.nombre} asignado a la reserva ${reservaSeleccionada.id_reserva}`);
    cerrarModal();
  };

  return (
    <div className="p-4 sm:p-8 space-y-10  min-h-screen text-white">
      {/* Sección: Reservas Aprobadas */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 sm:text-lg flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-yellow-500" />
          Reservas Aprobadas para asignar mecanico
        </h3>

        <div>
          {reservas.length > 0 ? (
            reservas.map((reserva) => (
              <div
                key={reserva.id_reserva}
                className="bg-[#2a2e44] rounded-xl p-4 mb-3 shadow-md sm:p-6 transition-colors duration-200"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpanded(reserva.id_reserva)}
                >
                  {/* Fila principal visible siempre */}
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-white">{reserva.cliente.nombre}</span>
                    <span className="text-sm text-gray-300">{reserva.vehiculo}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full text-yellow-800 bg-yellow-200">
                      {reserva.respuestaCliente}
                    </span>
                    {expandedCard === reserva.id_reserva ? (
                      <ChevronUp className="w-5 h-5 text-gray-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </div>

                {/* Contenido expandible */}
                {expandedCard === reserva.id_reserva && (
                  <div className="mt-4 pt-4 border-t border-gray-500 space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      Fecha: {reserva.fecha} @ {reserva.hora_inicio}
                    </div>
                    <div className="flex items-start text-sm text-gray-300">
                      <Wrench className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                      Servicio: {reserva.servicio}
                    </div>

                    {/* Detalles de contacto del cliente */}
                    <div className="text-sm text-gray-300 border-t border-dashed border-gray-500 pt-3">
                      <p className="font-semibold text-white mb-1">Contacto:</p>
                      <p>Email: {reserva.cliente.correo}</p>
                      <p>Tel: {reserva.cliente.telefono}</p>
                      <p>Dirección: {reserva.cliente.direccion}</p>
                    </div>

                    {/* Botón de acción para asignar mecánico */}
                    <div className="pt-3 border-t border-gray-500">
                      <button
                        className="w-full text-center py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
                        onClick={() => abrirModalAsignar(reserva)}
                      >
                        Asignar Mecánico
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-white/60 italic">No hay reservas aprobadas para asignar un mecánico.</p>
          )}
        </div>
      </section>

      {/* Modal para asignar mecánico */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#2a2e44] rounded-2xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-3 border-gray-300">
              Asignar Mecánico
            </h2>

            <div className="space-y-4">
              <label className="text-white">Seleccionar Mecánico:</label>
              <select
                className="w-full p-3 bg-[#3b4751] rounded-lg text-white"
                onChange={(e) => setMecanicoSeleccionado(mecanicos.find(m => m.id_mecanico == e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>Selecciona un mecánico</option>
                {mecanicos.map(mecanico => (
                  <option key={mecanico.id_mecanico} value={mecanico.id_mecanico} disabled={!mecanico.disponible}>
                    {mecanico.nombre} - {mecanico.disponible ? "Disponible" : "No disponible"}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={asignarMecanico}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
            >
              Asignar
            </button>

            <button
              onClick={cerrarModal}
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

