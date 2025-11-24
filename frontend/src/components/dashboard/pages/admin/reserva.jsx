import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown } from "lucide-react";

// Ejemplo de las reservas con información del cliente
export default function AdminReservas() {
  const [estadoFiltro, setEstadoFiltro] = useState("Todos"); // Filtro de estado
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

  const [mensajeCancelacion, setMensajeCancelacion] = useState("");

  // Función para aceptar la reserva
  const aceptarReserva = (idReserva) => {
    setReservas((prev) =>
      prev.map((r) =>
        r.id_reserva === idReserva
          ? { ...r, estado: "Confirmada" }
          : r
      )
    );
  };

  // Función para cancelar la reserva
  const cancelarReserva = (idReserva) => {
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

    // Limpiar el campo de mensaje tras cancelar
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
          <div
            key={reserva.id_reserva}
            className="p-4 rounded-xl bg-white/10 border border-white/20 flex justify-between items-center"
          >
            <div>
              <p className="text-white font-semibold">Vehículo: {reserva.vehiculo}</p>
              <p className="text-white/70">Fecha: {reserva.fecha}</p>
              <p className="text-white/70">Hora: {reserva.hora_inicio}</p>
              <p className="text-white/70">Servicio: {reserva.servicio}</p>
              <p className="text-white/70">Cliente: {reserva.cliente.nombre}</p>
              <p className="text-white/70">Correo: {reserva.cliente.correo}</p>
              <p className="text-white/70">Teléfono: {reserva.cliente.telefono}</p>

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
                  Motivo de cancelación: {reserva.mensajeCancelacion}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {reserva.estado === "Pendiente" && (
                <>
                  <button
                    onClick={() => aceptarReserva(reserva.id_reserva)}
                    className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => cancelarReserva(reserva.id_reserva)}
                    className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Campo para mensaje de cancelación */}
      <div className="mt-4">
        <label className="text-white font-semibold" htmlFor="motivoCancelacion">
          Motivo de la cancelación
        </label>
        <textarea
          id="motivoCancelacion"
          value={mensajeCancelacion}
          onChange={(e) => setMensajeCancelacion(e.target.value)}
          placeholder="Escribe el motivo de la cancelación"
          rows="4"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
        ></textarea>
      </div>
    </div>
  );
}
