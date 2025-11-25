import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, Send } from "lucide-react"; // Importar 'Send' para el botón de enviar

// Ejemplo de las reservas con información del cliente
export default function AdminReservas() {
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  // Estado para rastrear qué reserva se está intentando cancelar
  const [reservaParaCancelar, setReservaParaCancelar] = useState(null); // Contendrá el id_reserva o null
  // Estado para el mensaje de cancelación, ahora vinculado a la reserva activa
  const [mensajeCancelacion, setMensajeCancelacion] = useState("");
  
  const [reservas, setReservas] = useState([
    {
      id_reserva: 1,
      vehiculo: "Toyota Corolla",
      cliente: {
        nombre: "Juan Pérez",
        correo: "juan.perez@example.com",
        telefono: "123-456-7890",
      },
      fecha: "2023-11-25",
      hora_inicio: "10:00",
      servicio: "Revisión general",
      estado: "Pendiente",
      mensajeCancelacion: "",
    },
    {
      id_reserva: 2,
      vehiculo: "Ford Fiesta",
      cliente: {
        nombre: "Ana García",
        correo: "ana.garcia@example.com",
        telefono: "098-765-4321",
      },
      fecha: "2023-11-26",
      hora_inicio: "14:00",
      servicio: "Cambio de aceite y filtro",
      estado: "Pendiente",
      mensajeCancelacion: "",
    },
    {
      id_reserva: 3,
      vehiculo: "Honda Civic",
      cliente: {
        nombre: "Carlos Rodríguez",
        correo: "carlos.rodriguez@example.com",
        telefono: "321-654-9870",
      },
      fecha: "2023-11-27",
      hora_inicio: "09:00",
      servicio: "Cambio de pastillas de freno",
      estado: "Pendiente",
      mensajeCancelacion: "",
    },
  ]);

  // Función para aceptar la reserva
  const aceptarReserva = (idReserva) => {
    // Si la reserva actual era la que se iba a cancelar, se resetea el estado de cancelación
    if (reservaParaCancelar === idReserva) {
      setReservaParaCancelar(null);
      setMensajeCancelacion("");
    }
    
    setReservas((prev) =>
      prev.map((r) =>
        r.id_reserva === idReserva
          ? { ...r, estado: "Confirmada" }
          : r
      )
    );
  };
  
  // Función para iniciar el proceso de cancelación (mostrar el campo de texto)
  const iniciarCancelacion = (idReserva) => {
    setReservaParaCancelar(idReserva);
    setMensajeCancelacion(""); // Limpiar cualquier mensaje previo
  };
  
  // Función final para cancelar la reserva (enviando el motivo)
  const confirmarCancelacion = (idReserva) => {
    if (mensajeCancelacion.trim() === "") {
      alert("Por favor ingresa un motivo de cancelación.");
      return;
    }

    setReservas((prev) =>
      prev.map((r) =>
        r.id_reserva === idReserva
          ? { ...r, estado: "Cancelada", mensajeCancelacion }
          : r
      )
    );

    // Limpiar el estado de cancelación después de la acción
    setReservaParaCancelar(null);
    setMensajeCancelacion("");
  };
  
  // Filtrar las reservas según el estado seleccionado
  const filteredReservas = reservas.filter((reserva) => {
    if (estadoFiltro === "Todos") return true;
    return reserva.estado === estadoFiltro;
  });

  return (
    <div className="space-y-6">

      {/* Filtro de estado */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-white font-semibold">Filtrar por estado:</label>

        <div className="relative w-56">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="w-full p-2 rounded-xl bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
          >
            <option value="Todos">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
        </div>
      </div>

      {/* Mostrar las reservas filtradas */}
      <div className="space-y-4">
        {filteredReservas.map((reserva) => (
          <div key={reserva.id_reserva}>
            
            {/* Tarjeta de la Reserva */}
            <div
              className="p-4 rounded-xl bg-white/10 border border-white/20 flex justify-between items-center"
            >
              <div>
                <p className="text-white font-semibold">Vehículo: {reserva.vehiculo}</p>
                <p className="text-white/70">Fecha: {reserva.fecha} | Hora: {reserva.hora_inicio}</p>
                <p className="text-white/70">Servicio: {reserva.servicio}</p>
                <p className="text-white/70">Cliente: {reserva.cliente.nombre} | {reserva.cliente.correo} | {reserva.cliente.telefono}</p>

                <p
                  className={`text-sm font-medium mt-2 ${
                    reserva.estado === "Pendiente"
                      ? "text-yellow-400"
                      : reserva.estado === "Confirmada"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  Estado: {reserva.estado}
                </p>

                {reserva.estado === "Cancelada" && (
                  <p className="text-sm text-white/70 mt-2">
                    Motivo de cancelación: **{reserva.mensajeCancelacion}**
                  </p>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-4">
                {reserva.estado === "Pendiente" && (
                  <>
                    <button
                      onClick={() => aceptarReserva(reserva.id_reserva)}
                      className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition duration-150"
                      title="Aceptar Reserva"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() => iniciarCancelacion(reserva.id_reserva)}
                      className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition duration-150"
                      title="Rechazar Reserva"
                    >
                      <XCircle size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Formulario de Cancelación (Solo se muestra para la reserva seleccionada) */}
            {reservaParaCancelar === reserva.id_reserva && (
              <div className="mt-2 p-3 rounded-b-xl bg-white/5 border border-white/20 border-t-0">
                <label className="text-white font-semibold mb-2 block" htmlFor={`motivoCancelacion-${reserva.id_reserva}`}>
                  Escribe el motivo de la cancelación:
                </label>
                <div className="flex gap-2">
                    <textarea
                        id={`motivoCancelacion-${reserva.id_reserva}`}
                        value={mensajeCancelacion}
                        onChange={(e) => setMensajeCancelacion(e.target.value)}
                        placeholder="El vehículo no está disponible o el horario ya fue ocupado..."
                        rows="2"
                        className="flex-grow p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    ></textarea>
                    <button
                        onClick={() => confirmarCancelacion(reserva.id_reserva)}
                        className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white self-end transition duration-150 flex items-center justify-center disabled:opacity-50"
                        title="Enviar Motivo y Rechazar"
                        disabled={mensajeCancelacion.trim() === ""}
                    >
                        <Send size={18} />
                    </button>
                </div>
              </div>
            )}
            
          </div>
        ))}
        
        {/* Mensaje si no hay reservas */}
        {filteredReservas.length === 0 && (
            <div className="text-center p-6 text-white/70 border border-white/10 rounded-xl">
                No hay reservas para el estado **{estadoFiltro}**.
            </div>
        )}
      </div>
    </div>
  );
}