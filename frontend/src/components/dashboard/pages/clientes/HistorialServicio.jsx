// src/pages/cliente/Historial.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  RotateCcw,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Route as RouteIcon,
  XCircle,
  X,
  ArrowUpDown,
  ChevronDown,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ----------------- helpers ----------------- */
const money = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
const fmtDate = (s) => new Date(s).toLocaleDateString();

const toISO = (d) => d.toISOString().slice(0, 10);
const fromISO = (s) => (s ? new Date(`${s}T00:00:00`) : null);
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

/* ----------------- mock API (solo frontend) ----------------- */
const API = {
  async list() {
    await new Promise((r) => setTimeout(r, 250));
    return [
      {
        id: 10045,
        fechaSolicitud: "2025-08-20",
        fechaAtencion: "2025-08-24",
        servicio: "Revisión general",
        marca: "Toyota",
        modelo: "Corolla",
        estado: "entregado",
        total: 145,
        items: [
          { desc: "Revisión general", qty: 1, price: 80 },
          { desc: "Filtro de aire", qty: 1, price: 25 },
          { desc: "Aceite 5W-30", qty: 4, price: 10 },
        ],
        invoiceUrl: "#comprobante-10045",
      },
      {
        id: 10046,
        fechaSolicitud: "2025-08-25",
        fechaAtencion: "2025-08-26",
        servicio: "Frenos",
        marca: "Kia",
        modelo: "Rio",
        estado: "en_proceso",
        total: 0,
        items: [{ desc: "Diagnóstico de frenos", qty: 1, price: 0 }],
        invoiceUrl: null,
      },
      {
        id: 10047,
        fechaSolicitud: "2025-08-27",
        fechaAtencion: "2025-08-28",
        servicio: "Cambio de batería",
        marca: "Hyundai",
        modelo: "Accent",
        estado: "pendiente",
        total: 0,
        items: [{ desc: "Batería 12V (cotizar)", qty: 1, price: 0 }],
        invoiceUrl: null,
      },
    ];
  },
};

/* ----------------- UI básicos ----------------- */
const ChipEstado = ({ v }) => {
  const map = {
    pendiente: "bg-sky-500/80",
    en_proceso: "bg-indigo-600/80",
    completado: "bg-emerald-600/80",
    entregado: "bg-violet-600/80",
    cancelado: "bg-rose-600/80",
  };
  const label = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    completado: "Completado",
    entregado: "Entregado",
    cancelado: "Cancelado",
  }[v];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[v]}`}>
      {label}
    </span>
  );
};

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

/* ---------- Select minimal (oscuro, mobile-safe) ---------- */
/* FIX: popup con ancho clamp y anclado a un lado (no left+right a la vez) */
function Select({ options, value, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-11 w-full rounded-2xl bg-white/10 border border-white/10 text-white px-3 pr-9 text-left"
      >
        {current?.label}
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
          size={16}
        />
      </button>

      {open && (
        <ul
          className="absolute z-50 mt-2 w-[min(92vw,20rem)] md:w-56
                     left-0 md:left-auto md:right-0
                     rounded-2xl border border-white/10 bg-[#24124a] p-1 shadow-lg"
          role="listbox"
        >
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
                    active ? "bg-violet-600/30" : "hover:bg-white/10"
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  <span>{opt.label}</span>
                  {active && <Check size={16} className="opacity-80" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- DateRangePicker compacto (mobile-first) ---------- */
/* FIX: popup con ancho clamp y anclado a un lado; nunca usa left+right juntos */
function DateRangePicker({ from, to, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() =>
    startOfMonth(fromISO(from) || new Date())
  );
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const label =
    from && to ? `${fmtDate(from)} – ${fmtDate(to)}` : "Rango de fechas";

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const first = (start.getDay() + 6) % 7; // lunes=0
    const total = first + end.getDate();
    const weeks = Math.ceil(total / 7) * 7;
    return Array.from({ length: weeks }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - first + i);
      return d;
    });
  }, [month]);

  const pick = (d) => {
    const iso = toISO(d);
    if (!from || (from && to)) onChange({ from: iso, to: "" });
    else
      onChange(iso < from ? { from: iso, to: from } : { from, to: iso }),
        setOpen(false);
  };

  const isSame = (a, b) => a && b && toISO(a) === toISO(b);
  const inRange = (d) => {
    if (!from || !to) return false;
    const s = toISO(d);
    return s >= from && s <= to;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-11 w-full rounded-2xl bg-white/10 border border-white/10 text-white pl-10 pr-3 text-left relative"
      >
        <CalendarIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-90"
        />
        {label}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2
                     w-[min(92vw,22rem)] md:w-[22rem]
                     left-0 md:left-auto md:right-0
                     rounded-2xl border border-white/10 bg-[#24124a] p-3 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              className="p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMonth(addMonths(month, -1))}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="font-semibold">
              {month.toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              className="p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-white/70 mb-1">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const inMonth = d.getMonth() === month.getMonth();
              const selected =
                isSame(d, fromISO(from)) || isSame(d, fromISO(to));
              const between = inRange(d);
              const base = "h-9 rounded-lg text-sm";
              const tone = !inMonth ? "text-white/40" : "text-white";
              const style = selected
                ? "bg-violet-600 text-white"
                : between
                ? "bg-violet-500/20"
                : "hover:bg-white/10";
              return (
                <button
                  key={i}
                  className={`${base} ${tone} ${style}`}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="h-9 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
              onClick={() => {
                const t = new Date();
                const s = new Date();
                s.setDate(t.getDate() - 6);
                onChange({ from: toISO(s), to: toISO(t) });
                setOpen(false);
              }}
            >
              Últ. 7 días
            </button>
            <button
              className="h-9 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
              onClick={() => {
                const t = new Date();
                const s = new Date();
                s.setDate(t.getDate() - 29);
                onChange({ from: toISO(s), to: toISO(t) });
                setOpen(false);
              }}
            >
              Últ. 30 días
            </button>
            <button
              className="h-9 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
              onClick={() => {
                const t = new Date();
                onChange({
                  from: toISO(startOfMonth(t)),
                  to: toISO(endOfMonth(t)),
                });
                setOpen(false);
              }}
            >
              Este mes
            </button>
            <button
              className="h-9 rounded-lg bg-white/10 hover:bg-white/15 text-sm"
              onClick={() => {
                const t = new Date();
                const s = new Date(t.getFullYear(), 0, 1);
                const e = new Date(t.getFullYear(), 11, 31);
                onChange({ from: toISO(s), to: toISO(e) });
                setOpen(false);
              }}
            >
              Este año
            </button>
            <button
              className="col-span-2 h-9 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-sm"
              onClick={() => {
                onChange({ from: "", to: "" });
                setOpen(false);
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- TOP filtros (mobile-first) ----------------- */
function ControlBar({
  query,
  setQuery,
  range,
  setRange,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  onExport,
  onReload,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="grid grid-cols-1 gap-3">
        {/* Buscar */}
        <div className="relative min-w-0">
          <input
            className="w-full h-11 rounded-2xl bg-[#3b138d] text-white placeholder:text-white/70 pl-9 pr-9 outline-none border border-white/10 focus:ring-2 focus:ring-white/20"
            placeholder="Buscar por servicio, vehículo o N°"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/90"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10"
              aria-label="Limpiar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Fechas */}
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />

        {/* Orden + acciones */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-3">
            <Select
              options={[
                { value: "fechaSolicitud", label: "Fecha solicitud" },
                { value: "fechaAtencion", label: "Fecha atención" },
                { value: "total", label: "Total" },
              ]}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
          <div className="col-span-1 grid grid-cols-3 gap-2">
            <button
              onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
              className="h-11 rounded-2xl bg-white/10 border border-white/10 grid place-items-center"
              title="Orden"
            >
              <ArrowUpDown size={16} />
            </button>
            <button
              onClick={onReload}
              className="h-11 rounded-2xl bg-white/10 border border-white/10 grid place-items-center"
              title="Recargar"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onExport}
              className="h-11 rounded-2xl bg-white/10 border border-white/10 grid place-items-center"
              title="Exportar"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Acciones (móvil 2x2) ----------------- */
function ActionCell({ row, onView, onDownload, onTrack, onCancel }) {
  const canCancel = row.estado === "pendiente";
  const canDownload = !!row.invoiceUrl;
  const btn =
    "h-10 w-10 rounded-xl grid place-items-center transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="w-full">
      {/* 2x2 en móvil */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <button className={`${btn} bg-white/10`} onClick={onView} title="Ver">
          <Eye size={18} />
        </button>
        <button
          className={`${btn} bg-white/10`}
          onClick={onDownload}
          disabled={!canDownload}
          title="Descargar"
        >
          <Download size={18} />
        </button>
        <button
          className={`${btn} bg-indigo-600/80 hover:bg-indigo-600`}
          onClick={onTrack}
          title="Seguimiento"
        >
          <RouteIcon size={18} />
        </button>
        <button
          className={`${btn} bg-rose-600/80 hover:bg-rose-600`}
          onClick={onCancel}
          disabled={!canCancel}
          title="Cancelar"
        >
          <XCircle size={18} />
        </button>
      </div>

      {/* desktop (horizontal) */}
      <div className="hidden sm:flex gap-2">
        <button className={`${btn} bg-white/10`} onClick={onView} title="Ver">
          <Eye size={18} />
        </button>
        <button
          className={`${btn} bg-white/10`}
          onClick={onDownload}
          disabled={!canDownload}
          title="Descargar"
        >
          <Download size={18} />
        </button>
        <button
          className={`${btn} bg-indigo-600/80 hover:bg-indigo-600`}
          onClick={onTrack}
          title="Seguimiento"
        >
          <RouteIcon size={18} />
        </button>
        <button
          className={`${btn} bg-rose-600/80 hover:bg-rose-600`}
          onClick={onCancel}
          disabled={!canCancel}
          title="Cancelar"
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
}

/* ----------------- Tarjeta móvil ----------------- */
function CardMobile({ row, onView, onDownload, onTrack, onCancel }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-white/70">
            #{row.id} · {fmtDate(row.fechaSolicitud)}
          </div>
          <div className="font-semibold truncate">{row.servicio}</div>
          <div className="text-sm text-white/80 truncate">
            {row.marca} • {row.modelo}
          </div>
          <div className="text-sm text-white/80 mt-1">
            Atención: <b className="text-white">{fmtDate(row.fechaAtencion)}</b>{" "}
            · Total:{" "}
            <b className="text-white">{row.total ? money(row.total) : "—"}</b>
          </div>
        </div>
        <ChipEstado v={row.estado} />
      </div>

      <div className="mt-4">
        <ActionCell
          row={row}
          onView={onView}
          onDownload={onDownload}
          onTrack={onTrack}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}

/* ----------------- Página (mobile-first) ----------------- */
export default function Historial() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [query, setQuery] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [sortBy, setSortBy] = useState("fechaSolicitud");
  const [sortDir, setSortDir] = useState("desc");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      setRows(await API.list());
    } catch {
      setErr("No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const f = fromISO(range.from),
      t = fromISO(range.to);

    return [...rows]
      .filter(
        (r) =>
          String(r.id).includes(q) ||
          r.servicio.toLowerCase().includes(q) ||
          r.marca.toLowerCase().includes(q) ||
          r.modelo.toLowerCase().includes(q)
      )
      .filter((r) => {
        if (!f && !t) return true;
        const d = new Date(r.fechaSolicitud);
        if (f && d < f) return false;
        if (t && d > t) return false;
        return true;
      })
      .sort((a, b) => {
        const va =
          sortBy === "total"
            ? a.total || 0
            : sortBy === "fechaAtencion"
            ? new Date(a.fechaAtencion).getTime()
            : new Date(a.fechaSolicitud).getTime();
        const vb =
          sortBy === "total"
            ? b.total || 0
            : sortBy === "fechaAtencion"
            ? new Date(b.fechaAtencion).getTime()
            : new Date(b.fechaSolicitud).getTime();
        return sortDir === "asc" ? va - vb : vb - va;
      });
  }, [rows, query, range, sortBy, sortDir]);

  const onView = (row) =>
    navigate(`/cliente/estado?orden=${row.id}`, { replace: false });
  const onDownload = (row) =>
    row.invoiceUrl && window.open(row.invoiceUrl, "_blank");
  const onTrack = (row) => navigate(`/cliente/estado?orden=${row.id}`);
  const onCancel = (row) =>
    alert(
      row.estado === "pendiente"
        ? "Cancelar (mock front)"
        : "No se puede cancelar."
    );

  const exportCSV = () => {
    const head = [
      "N°",
      "Servicio",
      "Marca",
      "Modelo",
      "Fecha solicitud",
      "Fecha atención",
      "Estado",
      "Total",
    ];
    const lines = filtered.map((r) => [
      r.id,
      r.servicio,
      r.marca,
      r.modelo,
      r.fechaSolicitud,
      r.fechaAtencion,
      r.estado,
      r.total ?? "",
    ]);
    const csv = [head, ...lines]
      .map((x) => x.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historial.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 text-white overflow-x-hidden max-w-[100vw]">
      <ControlBar
        query={query}
        setQuery={setQuery}
        range={range}
        setRange={setRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDir={sortDir}
        setSortDir={setSortDir}
        onExport={exportCSV}
        onReload={load}
      />

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
          Cargando…
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <span>{err}</span>
            <button
              onClick={load}
              className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/15"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
          No hay registros para mostrar.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <CardMobile
              key={r.id}
              row={r}
              onView={() => onView(r)}
              onDownload={() => onDownload(r)}
              onTrack={() => onTrack(r)}
              onCancel={() => onCancel(r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
