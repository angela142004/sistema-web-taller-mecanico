import { useState, useEffect } from "react";
import {
  Car,
  Wrench,
  CircleHelp,
  Info,
  Check,
  X,
  Edit3,
  MessageSquareText,
} from "lucide-react";

export default function CotizacionCliente() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [error, setError] = useState("");

  const [modalTipo, setModalTipo] = useState(""); // aprobar - modificar - rechazar
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);

  const [mensaje, setMensaje] = useState("");

  // ░░░ EJEMPLOS SI FALLA EL BACKEND ░░░
  const ejemplos = [
    {
      id_cotizacion: 5001,
      total: 350,
      estado: "cotizado",
      fecha: "2025-11-20T10:30:00.000Z",
      reserva: {
        id_reserva: 1003,
        fecha: "2025-11-25T09:00:00.000Z",
        vehiculo: {
          placa: "JHK-909",
          modelo: { nombre: "Hilux", marca: { nombre: "Toyota" } },
        },
        servicio: { nombre: "Revisión de frenos" },
        asignacion: [
          {
            estado: "en_proceso",
            mecanico: { usuario: { nombre: "Luis Alberto" } },
          },
        ],
      },
    },
    {
      id_cotizacion: 5002,
      total: 180,
      estado: "cotizado",
      fecha: "2025-11-21T14:10:00.000Z",
      reserva: {
        id_reserva: 1005,
        fecha: "2025-11-28T12:00:00.000Z",
        vehiculo: {
          placa: "CCD-222",
          modelo: { nombre: "Civic", marca: { nombre: "Honda" } },
        },
        servicio: { nombre: "Cambio de pastillas" },
        asignacion: [
          {
            estado: "pendiente",
            mecanico: { usuario: { nombre: "Kevin Morales" } },
          },
        ],
      },
    },
  ];

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    try {
      const res = await fetch(`${API}/mecanica/cotizaciones/cliente`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setError("No se pudieron cargar las cotizaciones (mostrando ejemplos)");
        setCotizaciones(ejemplos);
        return;
      }

      const data = await res.json();
      setCotizaciones(data.length ? data : ejemplos);
    } catch {
      setError("No se pudieron cargar las cotizaciones (mostrando ejemplos)");
      setCotizaciones(ejemplos);
    }
  };

  const abrirModal = (tipo, cotizacion) => {
    setModalTipo(tipo);
    setCotizacionSeleccionada(cotizacion);
    setMensaje("");
  };

  const enviarRespuesta = () => {
    if (modalTipo === "modificar" && mensaje.trim() === "") {
      return alert("Debes escribir qué deseas modificar.");
    }
    if (modalTipo === "rechazar" && mensaje.trim() === "") {
      return alert("Debes escribir el motivo del rechazo.");
    }

    alert(
      `Cotización #${cotizacionSeleccionada.id_cotizacion}\n\nAcción: ${modalTipo.toUpperCase()}\nMensaje enviado al mecánico:\n${
        mensaje || "Sin mensaje"
      }`
    );
    // Aquí se enviaría la solicitud al backend
    setModalTipo("");
    setCotizacionSeleccionada(null);
  };

  return (
    <div className="space-y-6">
      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 flex gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      {/* LISTA DE COTIZACIONES */}
      {cotizaciones.map((c) => {
        const asig = c.reserva.asignacion?.[0];

        return (
          <section
            key={c.id_cotizacion}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
          >
            {/* VEHÍCULO */}
            <div className="flex items-center gap-2 text-white font-semibold">
              <Car size={18} />
              {c.reserva.vehiculo.modelo.marca.nombre}{" "}
              {c.reserva.vehiculo.modelo.nombre} —{" "}
              {c.reserva.vehiculo.placa}
            </div>

            {/* SERVICIO */}
            <p className="text-white/80 flex gap-2 items-center">
              <Wrench size={18} />
              Servicio:{" "}
              <span className="text-white">{c.reserva.servicio.nombre}</span>
            </p>

            {/* MECÁNICO */}
            {asig ? (
              <p className="text-white/70">
                Mecánico:{" "}
                <span className="text-white font-semibold">
                  {asig.mecanico.usuario.nombre}
                </span>{" "}
                — {asig.estado}
              </p>
            ) : (
              <p className="text-white/60">Mecánico aún no asignado.</p>
            )}

            {/* PRECIO */}
            <p className="text-purple-300 font-bold text-lg">
              Total cotizado: S/ {c.total}
            </p>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Aceptar */}
              <button
                onClick={() => abrirModal("aprobar", c)}
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-green-600/20 border border-green-600/40 text-green-300 hover:bg-green-600/30"
              >
                <Check size={18} />
                Aprobar cotización
              </button>

              {/* Solicitar modificación */}
              <button
                onClick={() => abrirModal("modificar", c)}
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-yellow-600/20 border border-yellow-600/40 text-yellow-300 hover:bg-yellow-600/30"
              >
                <Edit3 size={18} />
                Solicitar modificación
              </button>

              {/* Rechazar */}
              <button
                onClick={() => abrirModal("rechazar", c)}
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-red-600/20 border border-red-600/40 text-red-300 hover:bg-red-600/30"
              >
                <X size={18} />
                Rechazar
              </button>
            </div>
          </section>
        );
      })}

      {/* MODAL */}
      {modalTipo !== "" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="w-full max-w-lg bg-[#0f1120] border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-white text-xl font-semibold flex items-center gap-2">
              <MessageSquareText size={20} />
              {modalTipo === "aprobar" && "Confirmar aprobación"}
              {modalTipo === "modificar" && "Solicitar modificación"}
              {modalTipo === "rechazar" && "Rechazar cotización"}
            </h2>

            {/* Campo mensaje (obligatorio en modificar y rechazar) */}
            {modalTipo !== "aprobar" && (
              <div>
                <label className="text-white/80">
                  {modalTipo === "modificar"
                    ? "¿Qué deseas que el mecánico modifique?"
                    : "Motivo del rechazo"}
                </label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className="w-full mt-2 p-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  rows={3}
                  placeholder="Escribe aquí..."
                ></textarea>
              </div>
            )}

            <button
              onClick={enviarRespuesta}
              className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Enviar
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