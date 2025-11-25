import { useState } from "react";
// Importar XCircle para usarlo como 'X' en el modal
import { Car, Wrench, Info, Calendar, DollarSign, ChevronDown, ChevronUp, XCircle as X } from "lucide-react";

export default function CotizacionesAdmin() {
  const [reservas, setReservas] = useState([
    {
      id_reserva: 1001,
      vehiculo: "Toyota Corolla",
      cliente: {
        nombre: "Juan Pérez",
        correo: "juan.perez@example.com",
        telefono: "123-456-7890",
      },
      fecha: "2023-11-24",
      hora_inicio: "10:00",
      servicio: "Revisión general",
      respuestaCliente: "Pendiente",
      cotizacion: null, // Pendiente de cotización
    },
    {
      id_reserva: 1002,
      vehiculo: "Ford Fiesta",
      cliente: {
        nombre: "Ana García",
        correo: "ana.garcia@example.com",
        telefono: "098-765-4321",
      },
      fecha: "2023-11-25",
      hora_inicio: "14:00",
      servicio: "Cambio de aceite y filtro",
      respuestaCliente: "Aprobado",
      cotizacion: {
        total: 180,
        detalles: "Cambio de aceite y filtro, chequeo de niveles y frenos",
      },
    },
    {
      id_reserva: 1003,
      vehiculo: "Chevrolet Spark",
      cliente: {
        nombre: "Luis Gómez",
        correo: "luis.gomez@example.com",
        telefono: "333-222-1111",
      },
      fecha: "2023-11-26",
      hora_inicio: "09:30",
      servicio: "Diagnóstico de motor",
      respuestaCliente: "Rechazado",
      cotizacion: {
        total: 50,
        detalles: "Solo diagnóstico (se necesita cambiar bujías)",
      },
    },
    {
      id_reserva: 1004,
      vehiculo: "Nissan Versa",
      cliente: {
        nombre: "María Lopez",
        correo: "maria.lopez@example.com",
        telefono: "555-444-3333",
      },
      fecha: "2023-11-27",
      hora_inicio: "11:00",
      servicio: "Cambio de neumáticos",
      respuestaCliente: "Pendiente",
      cotizacion: {
        total: 350,
        detalles: "4 neumáticos nuevos marca X, incluye alineación y balanceo.",
      }, // Cotización enviada, en espera de respuesta
    },
  ]);

  const [modalTipo, setModalTipo] = useState("");
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [precioCotizacion, setPrecioCotizacion] = useState("");
  const [detallesCotizacion, setDetallesCotizacion] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpanded = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const reservasPendientes = reservas.filter(
    (r) => r.respuestaCliente === "Pendiente" && !r.cotizacion
  );

  const cotizacionesEnEspera = reservas.filter(
    (r) => r.respuestaCliente === "Pendiente" && r.cotizacion
  );

  const cotizacionesConfirmadas = reservas.filter(
    (r) => r.respuestaCliente === "Aprobado" || r.respuestaCliente === "Rechazado"
  );

  // Abre el modal SOLO para CREAR una cotización inicial (si no existe)
  const abrirModalCotizacion = (reserva) => {
    // REGLA: Si ya tiene cotización, no se abre el modal de edición/creación de nuevo
    if (reserva.cotizacion) {
      // Opcional: Mostrar alerta si se intenta cotizar de nuevo
      // alert("La cotización ya fue enviada y está en espera de la respuesta del cliente.");
      return;
    }
    setCotizacionSeleccionada(reserva);
    setModalTipo("crear");
    setPrecioCotizacion(reserva.cotizacion?.total || "");
    setDetallesCotizacion(reserva.cotizacion?.detalles || "");
  };

  // Abre el modal para ver el resumen de una cotización ya resuelta/enviada
  const abrirModalDetalles = (reserva) => {
    setCotizacionSeleccionada(reserva);
    setModalTipo("ver_detalles");
  };

  // Lógica de Crear Cotización
  const crearCotizacion = () => {
    if (!precioCotizacion || !detallesCotizacion) {
      alert("Por favor ingresa todos los campos de la cotización.");
      return;
    }

    setReservas((prev) =>
      prev.map((r) =>
        r.id_reserva === cotizacionSeleccionada.id_reserva
          ? {
              ...r,
              cotizacion: {
                total: parseFloat(precioCotizacion),
                detalles: detallesCotizacion,
              },
              // El estado se mueve a "Pendiente" (En Espera)
              respuestaCliente: "Pendiente", 
            }
          : r
      )
    );

    // Simulación de notificación
    alert(`Cotización creada y enviada al cliente: ${cotizacionSeleccionada.cliente.nombre} por S/ ${parseFloat(precioCotizacion).toFixed(2)}.`);
    
    // Cierra el modal y limpia el estado
    setModalTipo("");
    setCotizacionSeleccionada(null);
    setPrecioCotizacion("");
    setDetallesCotizacion("");
  };

  // --- Componente de tarjeta reutilizable para móvil/desktop ---
  const ReservaCard = ({ reserva, index, onActionClick, type }) => {
    const isExpanded = expandedCard === reserva.id_reserva;
    const isConfirmed = reserva.respuestaCliente === "Aprobado";
    const isRejected = reserva.respuestaCliente === "Rechazado";

    // Colores Adaptados al Panel Oscuro
    const cardBg = "bg-[#16182c] hover:bg-white/10";
    const titleColor = "text-white";
    const detailColor = "text-white/70";
    const dividerColor = "border-white/10"; // Borde sutil

    const statusColor = isConfirmed
      ? "text-green-300 bg-green-600/30"
      : isRejected
      ? "text-red-300 bg-red-600/30"
      : "text-yellow-300 bg-yellow-600/30";

    return (
      <div
        key={reserva.id_reserva}
        className={`${cardBg} rounded-xl p-4 mb-3 border border-white/10 shadow-lg sm:p-6 transition-colors duration-200`}
      >
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleExpanded(reserva.id_reserva)}
        >
          {/* Fila principal visible siempre */}
          <div className="flex items-center space-x-3">
            <span className={`font-bold text-lg ${titleColor}`}>{index + 1}.</span>
            <div className="flex flex-col">
              <span className={`font-semibold truncate max-w-[200px] ${titleColor}`}>{reserva.cliente.nombre}</span>
              <span className={`text-sm flex items-center ${detailColor}`}>
                <Car className="w-4 h-4 mr-1" />
                {reserva.vehiculo}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {reserva.respuestaCliente === "Pendiente" && reserva.cotizacion
                ? "En Espera"
                : reserva.respuestaCliente}
            </span>
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${detailColor}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${detailColor}`} />
            )}
          </div>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <div className={`mt-4 pt-4 border-t ${dividerColor} space-y-3`}>
            <div className={`flex items-center text-sm ${detailColor}`}>
              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
              Fecha/Hora: {reserva.fecha} @ {reserva.hora_inicio}
            </div>
            <div className={`flex items-start text-sm ${detailColor}`}>
              <Wrench className="w-4 h-4 mr-2 text-yellow-400 mt-0.5" />
              Servicio: {reserva.servicio}
            </div>

            {/* Detalles de contacto del cliente */}
            <div className={`text-sm ${detailColor} border-t border-dashed ${dividerColor} pt-3`}>
              <p className={`font-semibold ${titleColor} mb-1`}>Contacto:</p>
              <p>Email: {reserva.cliente.correo}</p>
              <p>Tel: {reserva.cliente.telefono}</p>
            </div>

            {/* Detalles de Cotización (Solo para Confirmadas/En Espera/Pendientes con cotización) */}
            {reserva.cotizacion && (
              <div className={`text-sm ${detailColor} border-t border-dashed ${dividerColor} pt-3`}>
                <p className={`font-semibold ${titleColor} mb-1`}>
                  <DollarSign className="w-4 h-4 inline mr-1 text-green-400" />
                  Cotización: S/ {reserva.cotizacion.total}
                </p>
                <p className="text-xs italic text-white/50">
                  Detalles: {reserva.cotizacion.detalles}
                </p>
              </div>
            )}

            {/* Botón de Acción */}
            <div className={`pt-3 border-t ${dividerColor}`}>
              {(type === "pendientes") && (
                <button
                  className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
                  onClick={() => onActionClick(reserva)} // Acción: Crear Cotización
                >
                  Crear Cotización
                </button>
              )}

              {/* CAMBIO: Para "en_espera", el botón cambia a solo ver detalles */}
              {(type === "en_espera") && (
                <button
                  className="w-full text-center py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
                  onClick={() => abrirModalDetalles(reserva)} // Acción: Solo Ver Detalles
                >
                  Ver Cotización Enviada
                </button>
              )}
              
              {type === "confirmadas" && (
                <button
                  className="w-full text-center py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
                  onClick={() => abrirModalDetalles(reserva)}
                >
                  Ver Detalles (Resumen)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  // -------------------------------------------------------------------

  return (
    // CAMBIO: Fondo principal con un azul oscuro más uniforme y profundo
    <div className="p-4 sm:p-8 space-y-10 min-h-screen text-white"> 

      {/* Sección 1: Reservas Pendientes de Cotización INICIAL */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 sm:text-lg flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-yellow-500" /> Reservas por Cotizar (Sin Cotización Enviada)
        </h3>

        <div>
          {reservasPendientes.length > 0 ? (
            reservasPendientes.map((reserva, index) => (
              <ReservaCard
                key={reserva.id_reserva}
                reserva={reserva}
                index={index}
                onActionClick={abrirModalCotizacion} // Acción: Crear
                type="pendientes"
              />
            ))
          ) : (
            <p className="text-white/60 italic p-3 rounded-lg bg-[#16182c]">No hay reservas pendientes de cotización inicial.</p>
          )}
        </div>
      </section>

      <hr className="border-gray-700" />

      {/* Sección 2: Cotizaciones Enviadas (En Espera) */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 sm:text-lg flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-500" /> Cotizaciones Enviadas (En Espera)
        </h3>

        <div>
          {cotizacionesEnEspera.length > 0 ? (
            cotizacionesEnEspera.map((reserva, index) => (
              <ReservaCard
                key={reserva.id_reserva}
                reserva={reserva}
                index={index}
                onActionClick={abrirModalCotizacion} // Se mantiene, pero la función lo ignora si ya tiene cotización
                type="en_espera"
              />
            ))
          ) : (
            <p className="text-white/60 italic p-3 rounded-lg bg-[#16182c]">No hay cotizaciones pendientes de respuesta del cliente.</p>
          )}
        </div>
      </section>

      <hr className="border-gray-700" />

      {/* Sección 3: Historial de Respuestas */}
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 sm:text-lg flex items-center">
          <Info className="w-5 h-5 mr-2 text-green-500" /> Historial de Respuestas
        </h3>

        <div>
          {cotizacionesConfirmadas.length > 0 ? (
            cotizacionesConfirmadas.map((reserva, index) => (
              <ReservaCard
                key={reserva.id_reserva}
                reserva={reserva}
                index={index}
                onActionClick={abrirModalDetalles}
                type="confirmadas"
              />
            ))
          ) : (
            <p className="text-white/60 italic p-3 rounded-lg bg-[#16182c]">No hay cotizaciones confirmadas o rechazadas aún.</p>
          )}
        </div>
      </section>

      {/* MODAL CREAR/EDITAR COTIZACIÓN (Solo para crear nuevas) */}
      {modalTipo === "crear" && cotizacionSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13162b] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 animate-fadeIn shadow-2xl relative">
            <button
              onClick={() => setModalTipo("")}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={22} /> {/* Componente 'X' ahora importado */}
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-400 border-b pb-3 border-white/10">
              Crear Cotización
              <span className="block text-sm font-normal text-white/60 mt-1">Para: {cotizacionSeleccionada.cliente.nombre} ({cotizacionSeleccionada.vehiculo})</span>
            </h2>

            <div className="mb-4">
              <label className="text-white/70 text-sm block mb-1">Precio cotizado (S/):</label>
              <input
                type="number"
                value={precioCotizacion}
                onChange={(e) => setPrecioCotizacion(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej. 150.00"
              />
            </div>

            <div className="mb-4">
              <label className="text-white/70 text-sm block mb-1">Detalles de la cotización:</label>
              <textarea
                value={detallesCotizacion}
                onChange={(e) => setDetallesCotizacion(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe el trabajo, repuestos y costos."
              ></textarea>
            </div>

            <button
              onClick={crearCotizacion}
              className="mt-4 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200"
            >
              Enviar Cotización
            </button>

            <button
              onClick={() => setModalTipo("")}
              className="mt-2 w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition duration-200 border border-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL PARA VER DETALLES (Resumen de Cotización) */}
      {modalTipo === "ver_detalles" && cotizacionSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13162b] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 animate-fadeIn shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-2 border-white/10 mb-4">
                <h2 className="text-2xl font-bold text-blue-400">
                    Resumen de Cotización
                </h2>
                <button onClick={() => setModalTipo("")} className="text-white/70 hover:text-white">
                    <X size={22} />
                </button>
            </div>

            <p className="text-lg font-bold text-blue-400 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                {cotizacionSeleccionada.vehiculo}
            </p>
            
            <div className="space-y-3 text-white/80 border-t pt-4 mt-4 border-dashed border-white/10">
                <p className="font-medium flex justify-between items-center text-lg">
                    <span><DollarSign className="w-5 h-5 inline mr-2 text-green-400" /> Monto Total:</span>
                    <span className="text-xl text-green-400 font-bold">S/ {cotizacionSeleccionada.cotizacion.total.toFixed(2)}</span>
                </p>
                <p className="flex justify-between items-center">
                    <span>Respuesta del Cliente:</span>
                    <span className={`font-semibold ${cotizacionSeleccionada.respuestaCliente === 'Aprobado' ? 'text-green-400' : cotizacionSeleccionada.respuestaCliente === 'Rechazado' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {cotizacionSeleccionada.respuestaCliente}
                    </span>
                </p>
            </div>

            <div className="space-y-2 text-white/80 border-t pt-4 mt-4 border-dashed border-white/10">
                <p className="font-semibold text-white">Detalles del Servicio:</p>
                <p className="text-sm italic bg-white/5 p-3 rounded-lg border border-white/10 whitespace-pre-line">
                    {cotizacionSeleccionada.cotizacion.detalles}
                </p>
            </div>

            <button
              onClick={() => setModalTipo("")}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200 mt-6"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}