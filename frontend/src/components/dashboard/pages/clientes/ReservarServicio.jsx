import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Ellipsis } from "lucide-react";

/* --- Servicios del taller (extenso) --- */
const SERVICIOS = [
  "Revisión general",
  "Mantenimiento preventivo",
  "Cambio de aceite y filtro",
  "Cambio de filtros (aire, cabina, combustible)",
  "Revisión de luces y sistema eléctrico",
  "Batería (prueba/cambio)",
  "Alternador (reparación/cambio)",
  "Arranque (motor de arranque)",
  "Sistema de frenos (inspección general)",
  "Cambio de pastillas de freno",
  "Cambio de discos/tambores",
  "Rectificado de discos",
  "Purgado de frenos",
  "Líquido de frenos (cambio)",
  "Suspensión (amortiguadores, bujes, rótulas)",
  "Dirección (terminales, axiales, cremallera)",
  "Alineación y balanceo",
  "Embrague (revisión/cambio)",
  "Caja de cambios (mecánica/automática)",
  "Diferencial (servicio)",
  "Transmisión (homocinéticas, ejes)",
  "Correa de distribución (cambio kit)",
  "Correa de accesorios (cambio)",
  "Bomba de agua (cambio)",
  "Sistema de enfriamiento (radiador, mangueras)",
  "Refrigerante (flushing/cambio)",
  "Aire acondicionado (carga de gas, diagnóstico)",
  "Compresor de A/C (reparación/cambio)",
  "Inyección electrónica (limpieza de inyectores)",
  "Cuerpo de aceleración (limpieza)",
  "Bomba de combustible (diagnóstico/cambio)",
  "Afinamiento/puesta a punto",
  "Escape/catalizador (revisión/reemplazo)",
  "Turbo (diagnóstico/mantenimiento)",
  "Sensor O2/MAF/Map (diagnóstico/reemplazo)",
  "Revisión técnica vehicular (pre-ITV)",
  "Elevavidrios/cerraduras (eléctricas)",
  "Pulido/encerado",
  "Lavado de motor",
  "Programación de llaves/controles",
  "Calibración de sensores (TPMS/ADAS básico)",
];

/* Marcas (A–Z) */
const BRANDS = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "BAIC",
  "Bentley",
  "BMW",
  "Brilliance",
  "Bugatti",
  "BYD",
  "Cadillac",
  "Changan",
  "Changhe",
  "Chery",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "Cupra",
  "Dacia",
  "Daihatsu",
  "Dodge",
  "Dongfeng",
  "DS Automobiles",
  "FAW",
  "Ferrari",
  "Fiat",
  "Fisker",
  "Ford",
  "Foton",
  "GAC",
  "Geely",
  "Genesis",
  "GMC",
  "Great Wall",
  "Haval",
  "Hino",
  "Honda",
  "Hummer",
  "Hyundai",
  "Infiniti",
  "Isuzu",
  "Iveco",
  "JAC",
  "Jaguar",
  "Jeep",
  "Jetour",
  "JMC",
  "Kia",
  "Koenigsegg",
  "Lada",
  "Lamborghini",
  "Lancia",
  "Land Rover",
  "Leapmotor",
  "Lexus",
  "Lifan",
  "Lincoln",
  "Lotus",
  "Lucid",
  "Mahindra",
  "Maserati",
  "Maxus",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Mitsubishi",
  "NIO",
  "Nissan",
  "Opel",
  "Pagani",
  "Peugeot",
  "Polestar",
  "Pontiac",
  "Porsche",
  "Proton",
  "RAM",
  "Renault",
  "Rivian",
  "Rolls-Royce",
  "Rover",
  "Saab",
  "Scion",
  "SEAT",
  "Seres",
  "Škoda",
  "Smart",
  "SsangYong",
  "Subaru",
  "Suzuki",
  "TATA",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "Wuling",
  "Xpeng",
  "Zotye",
];

/* Modelos de ejemplo por marca (se puede ampliar sin tocar el resto) */
const MODELS_BY_BRAND = {
  Toyota: ["Corolla", "Yaris", "Hilux", "RAV4", "Camry", "Prado", "Fortuner"],
  Hyundai: ["Accent", "Elantra", "Tucson", "Santa Fe", "i10", "Creta"],
  Kia: ["Rio", "Sportage", "Cerato", "Picanto", "Sorento"],
  Nissan: ["Versa", "Sentra", "Frontier", "Kicks", "X-Trail"],
  Chevrolet: ["Onix", "Spark", "Tracker", "Sail", "D-Max", "Trailblazer"],
  Volkswagen: ["Gol", "Polo", "T-Cross", "Tiguan", "Jetta"],
  Ford: ["Fiesta", "Focus", "Ranger", "Explorer", "Ecosport"],
  Honda: ["Civic", "Fit", "CR-V", "City", "HR-V"],
  Mazda: ["Mazda 2", "Mazda 3", "CX-3", "CX-5"],
  Renault: ["Logan", "Sandero", "Duster", "Koleos"],
  "Mercedes-Benz": ["Clase A", "Clase C", "GLA", "GLC"],
  BMW: ["Serie 1", "Serie 3", "X1", "X3"],
  Mitsubishi: ["L200", "Outlander", "ASX", "Montero"],
  Subaru: ["Forester", "XV", "Impreza"],
  Peugeot: ["208", "2008", "3008"],
  Audi: ["A3", "A4", "Q3", "Q5"],
};

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

/* Estilo pill */
const pill =
  "h-12 w-full rounded-full bg-[#3b138d] text-white placeholder:text-white/70 px-5 outline-none border border-white/10 focus:ring-2 focus:ring-white/20";

/* Combo buscable sin dependencias
    - showUseOption: si true, muestra 'Usar "texto"'
    - showChevron:   si true, muestra el botón con el chevron
    
    */
// Evitar que la fecha cambie por la zona horaria
function formatDateLocal(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function Combo({
  label,
  value,
  onChange,
  options,
  placeholder = "",
  showUseOption = true,
  showChevron = true,
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || "");
  const [active, setActive] = useState(0);
  const ref = useRef(null);

  useEffect(() => setInput(value || ""), [value]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    return q === ""
      ? options
      : options.filter((o) => o.toLowerCase().includes(q));
  }, [options, input]);

  // cerrar al click fuera
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  // teclado
  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(
        (i) =>
          (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) onChange(filtered[active]);
      else onChange(input);
      setOpen(false);
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <label className="text-white font-semibold">{label}</label>
      <div className="relative">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`${pill} ${showChevron ? "pr-10" : "pr-5"}`}
        />
        {showChevron && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="absolute right-0 top-0 h-12 w-10 grid place-items-center"
            aria-label="Abrir opciones"
          >
            <ChevronDown size={18} className="text-white" />
          </button>
        )}

        {/* Panel de opciones */}
        {open && (filtered.length > 0 || showUseOption) && (
          <div className="absolute z-20 mt-2 w-full max-h-60 overflow-auto rounded-xl border border-white/10 bg-[#24124a] shadow-lg">
            {filtered.length > 0 ? (
              filtered.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    idx === active ? "bg-white/10" : ""
                  }`}
                >
                  {opt}
                </button>
              ))
            ) : showUseOption ? (
              <button
                type="button"
                onClick={() => {
                  onChange(input);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm"
              >
                Usar “{input}”
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Página (modificada y corregida) --- */
export default function ReservarServicio() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [servicio, setServicio] = useState(""); // will hold service id or name depending on API
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicios, setServicios] = useState([]); // loaded from backend
  const [vehiculos, setVehiculos] = useState([]); // user's vehicles from backend

  /* Marcas (A–Z) */
  const [marcasBackend, setMarcasBackend] = useState([]); // [{ id_marca, nombre }]
  const [modelosBackend, setModelosBackend] = useState({}); // { [id_marca]: [ { id_modelo, nombre } ] }

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Añadir estado para vehículo seleccionado
  const [vehiculoId, setVehiculoId] = useState(""); // id del vehículo elegido

  // Cargar servicios y vehículos al montar
  useEffect(() => {
    fetchServicios();
    fetchVehiculos();
    loadMarcasFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // función para cargar servicios desde backend
  const fetchServicios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/mecanica/servicios`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        console.warn("[fetchServicios] No ok status:", res.status);
        setServicios([]);
        return;
      }
      const data = await res.json();
      console.log("[fetchServicios] Datos recibidos:", data);
      setServicios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[fetchServicios] Error:", e?.message || e);
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  // función para cargar vehículos del cliente
  const fetchVehiculos = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/mecanica/vehiculos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        console.warn("[fetchVehiculos] No ok status:", res.status);
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      console.log("[fetchVehiculos] Datos recibidos:", data);
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[fetchVehiculos] Error:", e?.message || e);
      setError(`Error cargando vehículos: ${e?.message || e}`);
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  };

  // extraer loadMarcas en función reutilizable (usa API)
  const loadMarcasFromBackend = async () => {
    try {
      const res = await fetch(`${API}/mecanica/marcas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        console.warn("[loadMarcas] No ok status:", res.status);
        setMarcasBackend([]);
        return;
      }
      const data = await res.json();
      console.log("[loadMarcas] Datos recibidos:", data);
      setMarcasBackend(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[loadMarcas] Error:", e?.message || e);
      setMarcasBackend([]);
    }
  };

  // cargar modelos del backend cuando cambia la marca (si el endpoint existe)
  useEffect(() => {
    const loadModelos = async () => {
      const marcaObj = marcasBackend.find((m) => m.nombre === marca);
      if (!marcaObj) return;
      try {
        const res = await fetch(
          `${API}/mecanica/modelos?marcaId=${marcaObj.id_marca}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok) return;
        const data = await res.json();
        setModelosBackend((prev) => ({
          ...prev,
          [marcaObj.id_marca]: data || [],
        }));
      } catch (e) {
        // fallback: no rompe la UI
        console.warn("[loadModelos] fallback:", e?.message || e);
      }
    };
    loadModelos();
  }, [marca, marcasBackend, token]);

  // modelOptions: primero backend, luego fallback local MODELS_BY_BRAND
  const modelOptions = useMemo(() => {
    const marcaObj = marcasBackend.find((m) => m.nombre === marca);
    if (marcaObj && modelosBackend[marcaObj.id_marca]?.length) {
      return modelosBackend[marcaObj.id_marca].map((m) => m.nombre);
    }
    return marca && MODELS_BY_BRAND[marca] ? MODELS_BY_BRAND[marca] : [];
  }, [marca, marcasBackend, modelosBackend]);

  // obtener duración del servicio seleccionado
  const duracionSeleccionada = useMemo(() => {
    if (!servicio) return 0;
    const s = servicios.find(
      (x) =>
        String(x.id_servicio ?? x.id ?? x.idServicio) === String(servicio) ||
        x.nombre === servicio
    );
    return s ? Number(xToNumberSafe(s.duracion)) : 0;
  }, [servicio, servicios]);

  // helper: ensure numeric fallback
  function xToNumberSafe(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  // sustituir la validación original por exigir vehiculoId
  const canConfirm = Boolean(vehiculoId && servicio && fecha && hora);

  // calcular fechas ISO
  const buildDateTimes = () => {
    const startStr = `${fecha} ${hora}:00`;

    // calcular hora fin
    const [h, m] = hora.split(":").map(Number);
    const startDate = new Date(fecha);
    startDate.setHours(h, m, 0, 0);

    const endDate = new Date(
      startDate.getTime() + duracionSeleccionada * 60000
    );

    const endStr = `${endDate.getFullYear()}-${String(
      endDate.getMonth() + 1
    ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")} ${String(
      endDate.getHours()
    ).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}:00`;

    return { startStr, endStr };
  };

  const handleConfirm = async () => {
    setError("");
    setSuccess("");
    if (!canConfirm) {
      setError("Completa todos los campos y selecciona un vehículo.");
      return;
    }
    setSubmitting(true);
    try {
      // usar vehiculoId (seleccionado por el usuario)
      const idVehiculo = Number(vehiculoId);

      // encontrar id_servicio real
      const sObj = servicios.find(
        (x) =>
          String(x.id_servicio ?? x.id ?? x.idServicio) === String(servicio) ||
          x.nombre === servicio
      );
      const idServicio = sObj?.id_servicio ?? sObj?.id ?? sObj?.idServicio;

      const payload = {
        id_vehiculo: idVehiculo,
        id_servicio: Number(idServicio ?? servicio),
        fecha: fecha, // <-- sin T, sin horas
        hora_inicio: hora, // <-- solo HH:mm
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

      setSuccess("Reserva creada correctamente ✅");
      // limpiar formulario (o mantener según UX)
      setMarca("");
      setModelo("");
      setServicio("");
      setFecha("");
      setHora("");
      setVehiculoId("");
    } catch (e) {
      setError(e?.message || "Error al confirmar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  // helper para mostrar nombre de servicio desde id/objeto
  const servicioNombre = useMemo(() => {
    if (!servicio) return null;
    const s = servicios.find(
      (x) =>
        String(x.id_servicio ?? x.id ?? x.idServicio) === String(servicio) ||
        x.nombre === servicio
    );
    return s?.nombre ?? (typeof servicio === "string" ? servicio : null);
  }, [servicio, servicios]);

  return (
    <div className="space-y-6">
      {/* Mostrar error global si hay */}
      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300">
          {error}
        </div>
      )}

      {/* Mostrar spinner si está cargando */}
      {loading && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/60 text-center">
          ⏳ Cargando datos...
        </div>
      )}

      {/* CARD 1: Selección de vehículo */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <h3 className="text-white font-semibold mb-4">Seleccionar vehículo</h3>

        {loading ? (
          <div className="text-white/60">Cargando vehículos...</div>
        ) : vehiculos.length === 0 ? (
          <div className="text-white/60">
            No tienes vehículos registrados. Ve a "Mis vehículos" para agregar
            uno.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-white font-semibold">Vehículo</label>
              <select
                value={vehiculoId}
                onChange={(e) => {
                  const chosenId = e.target.value;
                  setVehiculoId(chosenId);
                  const chosen = vehiculos.find(
                    (v) =>
                      String(v.id_vehiculo ?? v.id ?? v.idVehiculo) === chosenId
                  );
                  if (chosen) {
                    setMarca(
                      chosen.modelo?.marca?.nombre ?? chosen.marca ?? marca
                    );
                    setModelo(
                      chosen.modelo?.nombre ??
                        chosen.model ??
                        chosen.modelo ??
                        modelo
                    );
                  }
                }}
                className={`${pill}`}
              >
                <option value="">Seleccionar vehículo</option>
                {vehiculos.map((v) => {
                  const id = v.id_vehiculo ?? v.id ?? v.idVehiculo ?? v.plate;
                  return (
                    <option key={id} value={String(id)}>
                      {v.modelo?.marca?.nombre ?? v.marca ?? "—"}{" "}
                      {v.modelo?.nombre ?? v.modelo ?? v.model ?? ""} —{" "}
                      {v.placa || v.plate || "—"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white font-semibold">Nota</label>
              <div className="text-sm text-white/70">
                Selecciona el vehículo para el cual deseas agendar el servicio.
                Si no aparece, regístralo en "Mis vehículos".
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CARD 2: Servicio (cargado desde backend) */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <div className="flex flex-col gap-2">
          <label className="text-white font-semibold">
            Seleccionar servicio
          </label>
          <div className="relative">
            <select
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              className={`${pill} appearance-none pr-10`}
            >
              <option value="" disabled>
                {loading ? "Cargando servicios..." : "Seleccionar servicio"}
              </option>

              {/* Si llegan servicios desde backend, los mostramos; sino mostramos la lista local */}
              {servicios.length > 0
                ? servicios.map((s) => (
                    <option
                      key={
                        s.id_servicio ??
                        s.id ??
                        s.idServicio ??
                        s.nombre ??
                        JSON.stringify(s)
                      }
                      value={
                        s.id_servicio ?? s.id ?? s.idServicio ?? s.nombre ?? ""
                      }
                    >
                      {s.nombre}
                      {s.duracion ? ` — ${s.duracion} min` : ""}
                    </option>
                  ))
                : SERVICIOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white"
            />
          </div>
        </div>
      </section>

      {/* CARD 3: Fecha y Hora */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold">
              Seleccionar Fecha
            </label>
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
                <option value="" disabled>
                  Seleccionar hora
                </option>
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

      {/* CARD 4: Resumen + Confirmar */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <h3 className="text-white font-semibold">Resumen del servicio</h3>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-white/60">Marca</p>
              <p className="font-medium">{marca || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Modelo</p>
              <p className="font-medium">{modelo || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Servicio</p>
              <p className="font-medium">{servicioNombre || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Fecha y hora</p>
              <p className="font-medium">
                {fecha ? formatDateLocal(fecha) : "—"} {hora || ""}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/60">Duración (min)</p>
              <p className="font-medium">{duracionSeleccionada || "—"}</p>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between gap-4">
            <div className="text-right text-xs text-white/70">
              <div>{marca || "—"}</div>
              <div>{servicioNombre || "—"}</div>
              <div>
                {fecha ? formatDateLocal(fecha) : "—"} {hora || ""}
              </div>
            </div>

            <button
              disabled={!canConfirm || submitting}
              onClick={handleConfirm}
              className={`w-full md:w-[420px] h-12 rounded-xl font-semibold transition
                    ${
                      !canConfirm
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-[#3b138d] hover:bg-[#4316a1]"
                    }`}
            >
              {submitting ? "Guardando..." : "Confirmar Reserva"}
            </button>
          </div>
        </div>

        <div className="mt-2">
          <span className="text-sm text-white/60">Estado</span>
          <div className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-600/90 text-white">
            PENDIENTE
          </div>
        </div>

        {(error || success) && (
          <div className="mt-4">
            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-green-400">{success}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
