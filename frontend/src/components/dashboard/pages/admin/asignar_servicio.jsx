import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Calendar, Wrench } from "lucide-react";

export default function AsignarMecanico() {
  const [reservas, setReservas] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const [año, mes, dia] = fechaISO.split("T")[0].split("-");
    return `${dia}/${mes}/${año}`;
  };

  // ====================================================
  // 🔥 CARGAR COTIZACIONES
  // ====================================================
  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const res = await fetch("http://localhost:4001/mecanica/cotizaciones");
        const data = await res.json();

        const aprobadas = data.filter((c) => c.estado === "CONFIRMADO");

        const cotizacionesConvertidas = aprobadas.map((c) => {
          const asignacion = c.asignaciones?.[0] || null;

          return {
            id_cotizacion: c.id_cotizacion,
            id_asignacion: asignacion?.id_asignacion || null,
            id_mecanico_asignado: asignacion?.id_mecanico || null, // 👈 NUEVO
            cliente: {
              nombre: c.reserva?.cliente?.usuario?.nombre || "Sin nombre",
              correo: c.reserva?.cliente?.usuario?.correo || "-",
              telefono: c.reserva?.cliente?.telefono || "-",
              direccion: c.reserva?.cliente?.direccion || "-",
            },
            vehiculo: `${
              c.reserva?.vehiculo?.modelo?.nombre || "Modelo desconocido"
            } - ${c.reserva?.vehiculo?.placa || "Sin placa"}`,
            fecha: formatearFecha(c.reserva?.fecha),
            hora_inicio: c.reserva?.hora_inicio || "",
            servicio: c.reserva?.servicio?.nombre || "Sin servicio",
            mecanicoAsignado: asignacion?.mecanico?.usuario?.nombre || null,
            respuestaCliente: c.estado,
          };
        });

        setReservas(cotizacionesConvertidas);
      } catch (error) {
        console.error("Error cargando cotizaciones:", error);
      }
    };

    fetchCotizaciones();
  }, []);

  // ====================================================
  // 🔥 CARGAR MECÁNICOS
  // ====================================================
  useEffect(() => {
    const fetchMecanicos = async () => {
      try {
        const res = await fetch("http://localhost:4001/mecanica/mecanicos");
        const data = await res.json();

        const mecanicosFormateados = data.map((m) => ({
          id_mecanico: m.id_mecanico,
          nombre: m.nombre,
          disponible: m.disponible,
        }));

        setMecanicos(mecanicosFormateados);
      } catch (error) {
        console.error("Error cargando mecánicos:", error);
      }
    };

    fetchMecanicos();
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

  // ====================================================
  // 🔥 ASIGNAR MECÁNICO (CORREGIDO)
  // ====================================================
  const asignarMecanico = async () => {
    if (!mecanicoSeleccionado) {
      alert("Por favor selecciona un mecánico.");
      return;
    }

    const id_mecanico_anterior = reservaSeleccionada.id_mecanico_asignado;

    try {
      let url = "http://localhost:4001/mecanica/asignaciones";
      let method = "POST";

      if (reservaSeleccionada.id_asignacion) {
        url = `http://localhost:4001/mecanica/asignaciones/${reservaSeleccionada.id_asignacion}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cotizacion: reservaSeleccionada.id_cotizacion,
          id_mecanico: mecanicoSeleccionado.id_mecanico,
          fecha_asignacion: new Date().toISOString().split("T")[0],
          estado: "pendiente",
          observaciones: "Cambio de mecánico",
        }),
      });

      if (!res.ok) throw new Error("Error al asignar mecánico");

      const data = await res.json();

      // ==========================================================
      // 🔥 LIBERAR AL MECÁNICO ANTERIOR Y OCUPAR AL NUEVO
      // ==========================================================
      setMecanicos((prev) =>
        prev.map((m) => {
          if (m.id_mecanico === mecanicoSeleccionado.id_mecanico) {
            return { ...m, disponible: false }; // ahora lo ocupas
          }
          if (m.id_mecanico === id_mecanico_anterior) {
            return { ...m, disponible: true }; // lo liberas
          }
          return m;
        })
      );

      // ==========================================================
      // 🔥 ACTUALIZAR RESERVA
      // ==========================================================
      setReservas((prev) =>
        prev.map((r) =>
          r.id_cotizacion === reservaSeleccionada.id_cotizacion
            ? {
                ...r,
                mecanicoAsignado: mecanicoSeleccionado.nombre,
                id_asignacion: data.id_asignacion,
                id_mecanico_asignado: mecanicoSeleccionado.id_mecanico,
              }
            : r
        )
      );

      alert(`Mecánico ${mecanicoSeleccionado.nombre} asignado correctamente.`);
      cerrarModal();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al asignar mecánico.");
    }
  };

  // ====================================================
  // 🔥 UI
  // ====================================================
  return (
    <div className="p-4 sm:p-8 space-y-10 min-h-screen text-white">
      <section>
        <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-yellow-500" />
          Reservas aprobadas para asignar mecánico
        </h3>

        <div>
          {reservas.length > 0 ? (
            reservas.map((reserva) => (
              <div
                key={reserva.id_cotizacion}
                className="bg-[#2a2e44] rounded-xl p-4 mb-3 shadow-md sm:p-6"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpanded(reserva.id_cotizacion)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg">
                      {reserva.cliente.nombre}
                    </span>
                    <span className="text-sm text-gray-300">
                      {reserva.vehiculo}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full text-yellow-800 bg-yellow-200">
                      {reserva.respuestaCliente}
                    </span>
                    {expandedCard === reserva.id_cotizacion ? (
                      <ChevronUp className="w-5 h-5 text-gray-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </div>

                {expandedCard === reserva.id_cotizacion && (
                  <div className="mt-4 pt-4 border-t border-gray-500 space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      Fecha: {reserva.fecha} @ {reserva.hora_inicio}
                    </div>

                    <div className="flex items-center text-sm text-gray-300">
                      <Wrench className="w-4 h-4 mr-2 text-yellow-600" />
                      Servicio: {reserva.servicio}
                    </div>

                    <div className="pt-4 border-t border-gray-500">
                      {reserva.mecanicoAsignado ? (
                        <p className="text-green-400 font-medium">
                          Ya asignado a: {reserva.mecanicoAsignado}.{" "}
                          <button
                            onClick={() => abrirModalAsignar(reserva)}
                            className="underline text-blue-400"
                          >
                            Cambiar mecánico
                          </button>
                        </p>
                      ) : (
                        <button
                          onClick={() => abrirModalAsignar(reserva)}
                          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm"
                        >
                          Asignar mecánico
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-white/60 italic">No hay reservas aprobadas.</p>
          )}
        </div>
      </section>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#2a2e44] rounded-2xl p-6 space-y-5 shadow-2xl">
            <h2 className="text-xl font-semibold text-white border-b pb-3">
              Asignar Mecánico
            </h2>

            <div className="space-y-4">
              <label className="text-white">Seleccionar Mecánico:</label>
              <select
                className="w-full p-3 bg-[#3b4751] rounded-lg text-white"
                onChange={(e) =>
                  setMecanicoSeleccionado(
                    mecanicos.find((m) => m.id_mecanico == e.target.value)
                  )
                }
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona un mecánico
                </option>

                {mecanicos.map((m) => (
                  <option
                    key={m.id_mecanico}
                    value={m.id_mecanico}
                    disabled={!m.disponible}
                  >
                    {m.nombre} — {m.disponible ? "Disponible" : "Ocupado"}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={asignarMecanico}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Asignar
            </button>

            <button
              onClick={cerrarModal}
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
