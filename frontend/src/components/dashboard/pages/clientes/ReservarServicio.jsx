import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Ellipsis } from "lucide-react";

/* --- Servicios del taller (extenso) --- */
const SERVICIOS = [
  "Revisión general",
  "Mantenimiento preventivo",
  "Cambio de aceite y filtro",
  "Cambio de filtros (aire, cabina, combustible)",
  "Scanner y diagnóstico electrónico",
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
  "Rotación de neumáticos",
  "Montaje/Desmontaje de neumáticos",
  "Parcheo de llantas",
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
  "Revisión pre-compra",
  "Inspección para viaje",
  "Revisión técnica vehicular (pre-ITV)",
  "Cambio de parabrisas/cristales",
  "Elevavidrios/cerraduras (eléctricas)",
  "Carrocería y pintura (hojalatería)",
  "Pulido/encerado",
  "Lavado de motor",
  "Instalación de accesorios (alarma, audio, luces)",
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

/* --- Página --- */
export default function ReservarServicio() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const modelOptions = useMemo(
    () => (marca && MODELS_BY_BRAND[marca] ? MODELS_BY_BRAND[marca] : []),
    [marca]
  );
  useEffect(() => setModelo(""), [marca]); // si cambia la marca, limpiar modelo

  const disabled = !(modelo && marca && servicio && fecha && hora);

  const confirmar = () => {
    alert(
      `✅ Reserva registrada:
    - Marca: ${marca}
    - Modelo: ${modelo}
    - Servicio: ${servicio}
    - Fecha: ${new Date(fecha).toLocaleDateString()} ${hora}`
    );
  };

  return (
    <div className="space-y-6">
      {/* CARD 1: Marca + Modelo (Modelo sin chevron) */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
        <Ellipsis className="absolute right-4 top-4 text-white/60" size={18} />
        <div className="grid gap-6 md:grid-cols-2">
          <Combo
            label="Marca"
            value={marca}
            onChange={setMarca}
            options={BRANDS}
            placeholder="Seleccionar o escribir marca"
            showUseOption={true}
            showChevron={true}
          />
          <Combo
            label="Modelo"
            value={modelo}
            onChange={setModelo}
            options={modelOptions}
            placeholder={
              modelOptions.length
                ? "Seleccionar o escribir modelo"
                : "Escribir modelo del carro"
            }
            showUseOption={false}
            showChevron={false} // ⬅️ SIN flecha
          />
        </div>
      </section>

      {/* CARD 2: Servicio */}
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
                Seleccionar servicio
              </option>
              {SERVICIOS.map((s) => (
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
              <p className="font-medium">{servicio || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Fecha y hora</p>
              <p className="font-medium">
                {fecha ? new Date(fecha).toLocaleDateString() : "—"}{" "}
                {hora || ""}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end justify-between gap-4">
            <div className="text-right text-xs text-white/70">
              <div>{marca || "—"}</div>
              <div>{servicio || "—"}</div>
              <div>
                {fecha ? new Date(fecha).toLocaleDateString() : "—"}{" "}
                {hora || ""}
              </div>
            </div>

            <button
              disabled={!(modelo && marca && servicio && fecha && hora)}
              onClick={confirmar}
              className={`w-full md:w-[420px] h-12 rounded-xl font-semibold transition
                    ${
                      !(modelo && marca && servicio && fecha && hora)
                        ? "bg-white/10 text-white/40 cursor-not-allowed"
                        : "bg-[#3b138d] hover:bg-[#4316a1]"
                    }`}
            >
              Confirmar Reserva
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
