import { useState, useEffect } from "react";
import { Check, X, Edit3, Info, Car, Wrench } from "lucide-react";

export default function CotizacionAdmin() {
  const [reservas, setReservas] = useState([
    {
      id_reserva: 1001,
      vehiculo: "Toyota Corolla",
      cliente: {
        nombre: "Juan Pérez",
        correo: "juan.perez@example.com",
        telefono: "123-456-7890",
      },
      fecha: "2023-11-25",
      hora_inicio: "10:00",
      servicio: "Revisión general",
      estado: "Confirmada",
      cotizacion: {
        total: 350,
        detalles: "Revisión general, cambio de aceite y filtros.",
        estado: "cotizado",
      },
      respuestaCliente: "Pendiente", // Respuesta del cliente
      mensajeModificacion: "", // En caso de solicitud de modificación
    },
    {
      id_reserva: 1002,
      vehiculo: "Ford Fiesta",
      cliente: {
        nombre: "Ana García",
        correo: "ana.garcia@example.com",
        telefono: "098-765-4321",
      },
      fecha: "2023-11-26",
      hora_inicio: "14:00",
      servicio: "Cambio de aceite y filtro",
      estado: "Confirmada",
      cotizacion: {
        total: 180,
        detalles: "Cambio de aceite, revisión de frenos.",
        estado: "cotizado",
      },
      respuestaCliente: "Modificación solicitada", // Respuesta del cliente
      mensajeModificacion: "El precio es muy alto, ¿podrías revisarlo?", // Ejemplo de solicitud de modificación
    },
  ]);

  const [modalTipo, setModalTipo] = useState(""); // Tipo de acción (aprobar, editar)
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);

  // Función para abrir el modal de cotización
  const abrirModalCotizacion = (reserva) => {
    setCotizacionSeleccionada(reserva);
    setModalTipo("cotizar");
  };

  // Función para enviar cotización
  const enviarCotizacion = () => {
    if (!cotizacionSeleccionada) {
      alert("Debes seleccionar una cotización.");
      return;
    }

    // Simulación de envío de cotización
    alert(`Cotización enviada con éxito para el vehículo ${cotizacionSeleccionada.vehiculo}.`);

    setModalTipo("");
    setCotizacionSeleccionada(null);
  };

  // Función para cambiar el estado de la respuesta del cliente
  const cambiarRespuestaCliente = (idReserva, respuesta) => {
    setReservas((prev) =>
      prev.map((r) =>
        r.id_reserva === idReserva ? { ...r, respuestaCliente: respuesta } : r
      )
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold mb-4">Reservas Confirmadas para Cotización</h3>
      {reservas.map((reserva) => (
        <section
          key={reserva.id_reserva}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
        >
          {/* VEHÍCULO */}
          <div className="flex items-center gap-2 text-white font-semibold">
            <Car size={18} />
            {reserva.vehiculo}
          </div>

          {/* SERVICIO */}
          <p className="text-white/80 flex gap-2 items-center">
            Servicio:{" "}
            <span className="text-white">{reserva.servicio}</span>
          </p>

          {/* PRECIO Y DETALLES */}
          <p className="text-white/70">
            Fecha de servicio: {new Date(reserva.fecha).toLocaleDateString()} {reserva.hora_inicio}
          </p>

          {/* RESPUESTA DEL CLIENTE */}
          {reserva.respuestaCliente && (
            <div className="mt-2">
              <p className="text-white/80 font-semibold">Respuesta del Cliente:</p>
              <p
                className={`text-white/70 ${
                  reserva.respuestaCliente === "Aprobado"
                    ? "text-green-400"
                    : reserva.respuestaCliente === "Rechazado"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {reserva.respuestaCliente}
              </p>

              {/* Mostrar mensaje de modificación si el cliente lo solicita */}
              {reserva.respuestaCliente === "Modificación solicitada" && reserva.mensajeModificacion && (
                <p className="text-yellow-300 font-semibold mt-2">
                  Motivo de modificación solicitada: {reserva.mensajeModificacion}
                </p>
              )}
            </div>
          )}

          {/* BOTONES PARA EL ADMINISTRADOR */}
          {reserva.respuestaCliente === "Pendiente" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => cambiarRespuestaCliente(reserva.id_reserva, "Aprobado")}
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-green-600/20 border border-green-600/40 text-green-300 hover:bg-green-600/30"
              >
                <Check size={18} />
                Aprobar cotización
              </button>

              <button
                onClick={() => cambiarRespuestaCliente(reserva.id_reserva, "Rechazado")}
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-red-600/20 border border-red-600/40 text-red-300 hover:bg-red-600/30"
              >
                <X size={18} />
                Rechazar cotización
              </button>
            </div>
          )}

          {/* Mostrar botón para cotizar */}
          {reserva.respuestaCliente === "Aprobado" && (
            <div className="mt-4 flex justify-between gap-3">
              <button
                onClick={() => abrirModalCotizacion(reserva)}
                className="w-full h-12 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold"
              >
                Cotizar servicio
              </button>
              <button
                onClick={() => setModalTipo("modificar")}
                className="w-full h-12 rounded-xl bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 font-semibold"
              >
                Modificar cotización
              </button>
            </div>
          )}
        </section>
      ))}

      {/* MODAL PARA COTIZAR */}
      {modalTipo === "cotizar" && cotizacionSeleccionada && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-white text-xl font-semibold">Cotización para: {cotizacionSeleccionada.vehiculo}</h2>

            <div>
              <label className="text-white/80">Precio cotizado (S/):</label>
              <input
                type="number"
                value={cotizacionSeleccionada.cotizacion.total}
                onChange={(e) => setCotizacionSeleccionada({ ...cotizacionSeleccionada, cotizacion: { ...cotizacionSeleccionada.cotizacion, total: e.target.value } })}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                placeholder="Ingresa el precio cotizado"
              />
            </div>

            <div>
              <label className="text-white/80">Detalles de la cotización:</label>
              <textarea
                value={cotizacionSeleccionada.cotizacion.detalles}
                onChange={(e) => setCotizacionSeleccionada({ ...cotizacionSeleccionada, cotizacion: { ...cotizacionSeleccionada.cotizacion, detalles: e.target.value } })}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                rows={3}
                placeholder="Describe los detalles de la cotización"
              ></textarea>
            </div>

            <button
              onClick={enviarCotizacion}
              className="w-full h-12 rounded-xl bg-green-600/20 hover:bg-green-600/30 text-white font-semibold"
            >
              Enviar Cotización
            </button>

            <button
              onClick={() => setModalTipo("")}
              className="w-full h-12 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
