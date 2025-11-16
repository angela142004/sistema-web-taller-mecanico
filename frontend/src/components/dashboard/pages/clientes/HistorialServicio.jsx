import { useMemo, useState, useRef, useEffect } from "react";
import {
  Search,
  RotateCcw,
  Eye,
  Download,
  ChevronDown,
  Check,
  X,
  Printer,
} from "lucide-react";

/* -------------------- helpers -------------------- */
const money = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
const fmtDate = (s) => new Date(s).toLocaleDateString();

/* -------------------- mock (para ver diseño) -------------------- */
const MOCK = [
  {
    id_historial: 1001,
    fecha: "2025-11-05",
    descripcion: "Cambio de pastillas y rectificado de discos",
    costo: 380,
    mecanico: { usuario: { nombre: "Carlos Ruiz" } },
    reserva: {
      estado: "FINALIZADO",
      servicio: { nombre: "Servicio de frenos" },
      vehiculo: {
        modelo: { nombre: "Yaris", marca: { nombre: "Toyota" } },
      },
      cotizacion: { total: 380, estado: "aprobado" },
    },
  },
  {
    id_historial: 1002,
    fecha: "2025-11-07",
    descripcion: "Cambio de aceite y filtro",
    costo: 180,
    mecanico: { usuario: { nombre: "Luis Mendoza" } },
    reserva: {
      estado: "FINALIZADO",
      servicio: { nombre: "Mantenimiento preventivo" },
      vehiculo: {
        modelo: { nombre: "Accent", marca: { nombre: "Hyundai" } },
      },
      cotizacion: { total: 180, estado: "aprobado" },
    },
  },
  {
    id_historial: 1003,
    fecha: "2025-11-08",
    descripcion: "Diagnóstico eléctrico completo",
    costo: 250,
    mecanico: { usuario: { nombre: "Ernesto Díaz" } },
    reserva: {
      estado: "FINALIZADO", // Cambié el estado para mostrar solo los finalizados
      servicio: { nombre: "Revisión eléctrica" },
      vehiculo: {
        modelo: { nombre: "Rio", marca: { nombre: "Kia" } },
      },
      cotizacion: { total: 250, estado: "aprobado" },
    },
  },
];

/* -------------------- UI -------------------- */
function ChipEstado({ estado }) {
  const map = {
    PENDIENTE: "bg-sky-500/80",
    CONFIRMADA: "bg-indigo-600/80",
    CANCELADA: "bg-rose-600/80",
    FINALIZADO: "bg-green-500/80",
  };
  const label = {
    PENDIENTE: "Pendiente",
    CONFIRMADA: "Confirmada",
    CANCELADA: "Cancelada",
    FINALIZADO: "Finalizado",
  }[estado];
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[estado] || "bg-gray-600/50"
      }`}
    >
      {label || "—"}
    </span>
  );
}

function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function Select({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-11 w-full rounded-2xl bg-white/10 border border-white/10 text-white px-4 pr-9 text-left relative"
      >
        {current?.label}
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
          size={16}
        />
      </button>
      {open && (
        <ul className="absolute z-50 mt-2 w-[min(92vw,20rem)] md:w-56 right-0 rounded-2xl border border-white/10 bg-[#3b138d] p-1 shadow-lg">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full h-10 px-3 rounded-xl text-left flex items-center justify-between ${
                    active ? "bg-violet-600/40" : "hover:bg-white/10"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && <Check size={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ----------- ControlBar (buscador y filtros) ----------- */
function ControlBar({ query, setQuery, sortBy, setSortBy, onReload }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 grid gap-3">
      <div className="relative">
        <input
          className="w-full h-11 rounded-2xl bg-[#3b138d] text-white placeholder:text-white/70 pl-9 pr-9 outline-none border border-white/10 focus:ring-2 focus:ring-white/20"
          placeholder="Buscar por servicio, vehículo o mecánico"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/90"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Select
          options={[
            { value: "fecha", label: "Fecha" },
            { value: "servicio", label: "Servicio" },
            { value: "costo", label: "Costo" },
          ]}
          value={sortBy}
          onChange={setSortBy}
        />
        <button
          onClick={onReload}
          className="h-11 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} /> Recargar
        </button>
        <button
          onClick={() => alert("Exportar CSV (simulado)")}
          className="h-11 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-2"
        >
          <Download size={16} /> Exportar
        </button>
      </div>
    </div>
  );
}

/* ----------- Modal de detalle ----------- */
function Modal({ open, onClose, data }) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-[min(95vw,550px)] rounded-2xl border border-white/10 bg-[#15132b] p-6 text-white shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Detalle del servicio #{data.id_historial}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 text-sm text-white/80">
          <p>
            <span className="font-semibold text-white">Servicio:</span>{" "}
            {data.reserva?.servicio?.nombre}
          </p>
          <p>
            <span className="font-semibold text-white">Vehículo:</span>{" "}
            {data.reserva?.vehiculo?.modelo?.marca?.nombre}{" "}
            {data.reserva?.vehiculo?.modelo?.nombre}
          </p>
          <p>
            <span className="font-semibold text-white">Fecha:</span>{" "}
            {fmtDate(data.fecha)}
          </p>
          <p>
            <span className="font-semibold text-white">Mecánico:</span>{" "}
            {data.mecanico?.usuario?.nombre}
          </p>
          <p>
            <span className="font-semibold text-white">Descripción:</span>{" "}
            {data.descripcion}
          </p>
          <p>
            <span className="font-semibold text-white">Costo total:</span>{" "}
            {money(data.costo)}
          </p>
          <p>
            <span className="font-semibold text-white">Estado:</span>{" "}
            <ChipEstado estado={data.reserva?.estado} />
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="h-10 px-4 rounded-xl bg-[#3b138d] hover:bg-[#4316a1] flex items-center gap-2"
          >
            <Printer size={16} /> Imprimir / Descargar PDF
          </button>
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------- Tarjeta ----------- */
function CardHistorial({ row, onView }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-white/10 transition">
      <div>
        <div className="text-sm text-white/70">
          #{row.id_historial} · {fmtDate(row.fecha)}
        </div>
        <div className="font-semibold text-white">
          {row.reserva?.servicio?.nombre || "—"}
        </div>
        <div className="text-sm text-white/80">
          {row.reserva?.vehiculo?.modelo?.nombre} ·{" "}
          {row.reserva?.vehiculo?.modelo?.marca?.nombre}
        </div>
        <div className="text-sm text-white/80 mt-1">
          Mecánico: {row.mecanico?.usuario?.nombre || "—"} · Costo:{" "}
          <b>{money(row.costo)}</b>
        </div>
      </div>
      <div className="mt-3 sm:mt-0 flex gap-2 items-center">
        <ChipEstado estado={row.reserva?.estado || "PENDIENTE"} />
        <button
          onClick={() => onView(row)}
          className="h-10 px-4 rounded-xl bg-[#3b138d] hover:bg-[#4316a1]"
        >
          <Eye size={16} className="inline mr-2" />
          Ver
        </button>
      </div>
    </div>
  );
}

/* ----------- Página principal ----------- */
export default function HistorialCliente() {
  const [rows] = useState(MOCK);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("fecha");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return [...rows]
      .filter((r) =>
        [r.reserva?.servicio?.nombre, r.mecanico?.usuario?.nombre].some((x) =>
          x.toLowerCase().includes(q)
        )
      )
      .filter((r) => r.reserva?.estado === "FINALIZADO") // Mostrar solo los finalizados
      .sort((a, b) =>
        sortBy === "costo"
          ? b.costo - a.costo
          : new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
  }, [rows, query, sortBy]);

  return (
    <div className="space-y-4 text-white max-w-full overflow-hidden">
      <ControlBar
        query={query}
        setQuery={setQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReload={() => window.location.reload()}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
          No hay servicios finalizados aún.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <CardHistorial key={r.id_historial} row={r} onView={setSelected} />
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} data={selected} />
    </div>
  );
}
