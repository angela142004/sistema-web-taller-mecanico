import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Ellipsis } from "lucide-react";

const TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
];

const pill =
  "h-12 w-full rounded-full bg-[#3b138d] text-white placeholder:text-white/70 px-5 outline-none border border-white/10 focus:ring-2 focus:ring-white/20";

export default function ReservarServicio() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [vehiculos, setVehiculos] = useState([]); // del cliente
  const [servicios, setServicios] = useState([]); // desde la BD
  const [vehiculoId, setVehiculoId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchVehiculos();
    fetchServicios();
  }, []);

  // Obtener vehículos del cliente (relacionados con usuario logueado)
  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/mecanica/vehiculos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("No se pudieron obtener los vehículos");
      const data = await res.json();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener servicios
  const fetchServicios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/mecanica/servicios`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Error al cargar servicios");
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular hora de fin en base a duración del servicio
  const duracionSeleccionada = useMemo(() => {
    const s = servicios.find((x) => x.id_servicio === Number(servicioId));
    return s ? Number(s.duracion ?? 0) : 0;
  }, [servicioId, servicios]);

  const canConfirm = Boolean(vehiculoId && servicioId && fecha && hora);

  const buildDateTimes = () => {
    const start = new Date(`${fecha}T${hora}:00`);
    const end = new Date(start.getTime() + duracionSeleccionada * 60000);
    return { start, end };
  };

  const handleConfirm = async () => {
    setError("");
    setSuccess("");
    if (!canConfirm) {
      setError("Completa todos los campos antes de confirmar.");
      return;
    }

    setSubmitting(true);
    try {
      const { start, end } = buildDateTimes();

      const payload = {
        id_vehiculo: Number(vehiculoId),
        id_servicio: Number(servicioId),
        fecha: start.toISOString(),
        hora_inicio: start.toISOString(),
        hora_fin: end.toISOString(),
        estado: "PENDIENTE",
      };

      const res = await fetch(`${API}/mecanica/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al crear la reserva");
      }

      setSuccess("✅ Reserva creada correctamente");
      setVehiculoId("");
      setServicioId("");
      setFecha("");
      setHora("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error global */}
      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300">
          {error}
        </div>
      )}

      {/* CARD 1: Seleccionar vehículo */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <h3 className="text-white font-semibold mb-4">Seleccionar vehículo</h3>

        {vehiculos.length === 0 ? (
          <div className="text-white/60">
            No tienes vehículos registrados. Ve a “Mis vehículos” para agregar uno.
          </div>
        ) : (
          <select
            value={vehiculoId}
            onChange={(e) => setVehiculoId(e.target.value)}
            className={`${pill}`}
          >
            <option value="">Seleccionar vehículo</option>
            {vehiculos.map((v) => {
              const id = v.id_vehiculo ?? v.id;
              const marca = v.modelo?.marca?.nombre ?? "—";
              const modelo = v.modelo?.nombre ?? "—";
              return (
                <option key={id} value={id}>
                  {marca} {modelo} — {v.placa}
                </option>
              );
            })}
          </select>
        )}
      </section>

      {/* CARD 2: Seleccionar servicio */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <h3 className="text-white font-semibold mb-4">Seleccionar servicio</h3>

        <div className="relative">
          <select
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
            className={`${pill} appearance-none pr-10`}
          >
            <option value="" disabled>
              Seleccionar servicio
            </option>
            {servicios.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre} — {s.duracion} min
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white"
          />
        </div>
      </section>

      {/* CARD 3: Fecha y hora */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold">Seleccionar Fecha</label>
            <div className="relative">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={`${pill} pr-12 [color-scheme:dark]`}
              />
              <Calendar
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold">Seleccionar Hora</label>
            <div className="relative">
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={`${pill} appearance-none pr-10`}
              >
                <option value="">Seleccionar hora</option>
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CARD 4: Confirmar */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <h3 className="text-white font-semibold mb-4">Confirmar reserva</h3>

        <button
          disabled={!canConfirm || submitting}
          onClick={handleConfirm}
          className={`w-full md:w-[420px] h-12 rounded-xl font-semibold transition ${
            !canConfirm
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-[#3b138d] hover:bg-[#4316a1]"
          }`}
        >
          {submitting ? "Guardando..." : "Confirmar Reserva"}
        </button>

        {success && (
          <p className="text-green-400 mt-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
            {success}
          </p>
        )}
      </section>
    </div>
  );
}
