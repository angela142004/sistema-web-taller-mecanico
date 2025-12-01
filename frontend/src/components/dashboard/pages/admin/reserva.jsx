import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ChevronDown } from "lucide-react";

export default function AdminReservas() {
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [reservas, setReservas] = useState([]);

  // ===============================
  // 🔥 Cargar reservas pendientes
  // ===============================
  useEffect(() => {
    const cargarPendientes = async () => {
      try {
        const res = await fetch(
          "http://localhost:4001/mecanica/reservas/pendientes"
        );
        const data = await res.json();

        const adaptadas = data.map((r) => {
          // 🔥 CORRECCIÓN DE FECHA (evita UTC -5)
          const fechaISO = r.fecha.split("T")[0]; // "2025-11-27"
          const fechaObj = new Date(fechaISO + "T12:00"); // fija hora segura → evita desfase

          const fechaLocal = fechaObj.toLocaleDateString("es-PE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });

          return {
            id_reserva: r.id_reserva,
            vehiculo:
              r.vehiculo?.model?.nombre ||
              r.vehiculo?.modelo?.nombre ||
              "Vehículo",
            cliente: {
              nombre:
                (r.cliente?.usuario?.nombre || "") +
                  " " +
                  (r.cliente?.usuario?.apellido || "") || "Cliente",
              correo: r.cliente?.usuario?.correo || "",
              telefono: r.cliente?.usuario?.telefono || "",
            },
            fecha: fechaLocal, // ←🔥 fecha corregida
            hora_inicio: r.hora_inicio,
            servicio:
              r.servicio?.nombre_servicio || r.servicio?.nombre || "Servicio",
            estado: r.estado,
          };
        });

        setReservas(adaptadas);
      } catch (error) {
        console.error("Error cargando reservas:", error);
      }
    };

    cargarPendientes();
  }, []);

  // ===============================
  // ✔️ Aceptar reserva
  // ===============================
  const aceptarReserva = async (idReserva) => {
    try {
      const res = await fetch(
        `http://localhost:4001/mecanica/reservas/estado/${idReserva}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "CONFIRMADA" }),
        }
      );

      if (!res.ok) {
        throw new Error("Error en el servidor");
      }

      setReservas((prev) =>
        prev.map((r) =>
          r.id_reserva === idReserva ? { ...r, estado: "CONFIRMADA" } : r
        )
      );

      alert("Reserva aprobada correctamente.");
    } catch (error) {
      console.error("Error aprobando reserva:", error);
      alert("No se pudo aprobar la reserva.");
    }
  };

  // ===============================
  // ❌ Cancelar reserva
  // ===============================
  const cancelarReserva = async (idReserva) => {
    try {
      const res = await fetch(
        `http://localhost:4001/mecanica/reservas/estado/${idReserva}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "CANCELADA" }),
        }
      );

      if (!res.ok) {
        throw new Error("Error en el servidor");
      }

      setReservas((prev) =>
        prev.map((r) =>
          r.id_reserva === idReserva ? { ...r, estado: "CANCELADA" } : r
        )
      );

      alert("Reserva cancelada correctamente.");
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      alert("No se pudo cancelar la reserva.");
    }
  };

  // ===============================
  // 🔥 Filtro
  // ===============================
  const filteredReservas = reservas.filter((reserva) => {
    if (estadoFiltro === "Todos") return true;
    return reserva.estado === estadoFiltro;
  });

  return (
    <div className="space-y-6">
      {/* Filtro */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-white font-semibold">Filtrar por estado:</label>

        <div className="relative w-56">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="w-full p-2 rounded-xl bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
          >
            <option value="Todos">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Aprobada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <ChevronDown
            size={18}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-70"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filteredReservas.map((reserva) => (
          <div
            key={reserva.id_reserva}
            className="p-4 rounded-xl bg-white/10 border border-white/20 flex justify-between items-center"
          >
            <div>
              <p className="text-white font-semibold">
                Vehículo: {reserva.vehiculo}
              </p>
              <p className="text-white/70">
                Fecha: {reserva.fecha} | Hora: {reserva.hora_inicio}
              </p>
              <p className="text-white/70">Servicio: {reserva.servicio}</p>
              <p className="text-white/70">
                Cliente: {reserva.cliente.nombre} | {reserva.cliente.correo} |{" "}
                {reserva.cliente.telefono}
              </p>

              <p
                className={`text-sm font-medium mt-2 ${
                  reserva.estado === "PENDIENTE"
                    ? "text-yellow-400"
                    : reserva.estado === "CONFIRMADA"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                Estado: {reserva.estado}
              </p>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-4">
              {reserva.estado === "PENDIENTE" && (
                <>
                  <button
                    onClick={() => aceptarReserva(reserva.id_reserva)}
                    className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition duration-150"
                  >
                    <CheckCircle size={18} />
                  </button>

                  <button
                    onClick={() => cancelarReserva(reserva.id_reserva)}
                    className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition duration-150"
                  >
                    <XCircle size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredReservas.length === 0 && (
          <div className="text-center p-6 text-white/70 border border-white/10 rounded-xl">
            No hay reservas para "{estadoFiltro}".
          </div>
        )}
      </div>
    </div>
  );
}
