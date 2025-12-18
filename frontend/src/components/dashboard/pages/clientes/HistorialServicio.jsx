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

/* -------------------- UI -------------------- */
function ChipEstado({ estado }) {
  // Normalizamos el valor (evita null, minúsculas, espacios, femenino, etc.)
  const s = (estado || "").trim().toUpperCase();

  // Aceptamos variaciones en femenino o minúsculas
  const normalized =
    s === "FINALIZADA" ? "FINALIZADO" : s === "CONFIRMADO" ? "CONFIRMADA" : s;

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
  }[normalized];

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[normalized] || "bg-gray-600/50"
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

/* ----------- ControlBar ----------- */
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

        {/* Export removed: se eliminó el botón Exportar para cumplir request */}
        <div className="h-11" />
      </div>
    </div>
  );
}

/* ----------- Modal ----------- */
/* ----------- Modal ----------- */
function Modal({ open, onClose, data }) {
  if (!open || !data) return null;

  /* ---------- NUEVO: función para imprimir solo el contenido ---------- */
  const handlePrint = () => {
    const printContent = document.getElementById("print-area").innerHTML;

    const win = window.open("", "", "width=900,height=650");

    win.document.write(`
      <html>
        <head>
          <title>MULTISERVICIOS -
AUTOMOTRIZ KLEBERTH</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              background: #ffffff;
              color: #111827;
            }
            h2 {
              text-align: center;
              margin-bottom: 20px;
            }
            p {
              font-size: 14px;
              margin: 5px 0;
            }
            .label {
              font-weight: bold;
              color: #111827;
            }
            .estado {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
              color: white;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-[min(95vw,550px)] rounded-2xl border border-white/10 bg-[#15132b] p-6 text-white shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* 🔻 NUEVO: CONTENEDOR PARA IMPRESIÓN */}
        <div id="print-area" className="space-y-3 text-sm">
          <h2 className="text-xl font-bold text-center text-white mb-4">
            Detalle del servicio
          </h2>

          <p>
            <span className="font-semibold text-white">Servicio:</span>{" "}
            {data.asignacion?.cotizacion?.reserva?.servicio?.nombre}
          </p>

          <p>
            <span className="font-semibold text-white">Vehículo:</span>{" "}
            {
              data.asignacion?.cotizacion?.reserva?.vehiculo?.modelo?.marca
                ?.nombre
            }{" "}
            {data.asignacion?.cotizacion?.reserva?.vehiculo?.modelo?.nombre}
          </p>

          <p>
            <span className="font-semibold text-white">Fecha:</span>{" "}
            {fmtDate(data.fecha)}
          </p>

          <p>
            <span className="font-semibold text-white">Mecánico:</span>{" "}
            {data.asignacion?.mecanico?.usuario?.nombre}
          </p>

          <p>
            <span className="font-semibold text-white">Descripción:</span>{" "}
            {data.descripcion}
          </p>

          <p>
            <span className="font-semibold text-white">Costo total:</span>{" "}
            {money(data.asignacion?.cotizacion?.total)}
          </p>

          <p>
            <span className="font-semibold text-white">Estado:</span>{" "}
            <ChipEstado estado={data.asignacion?.estado || data.estado} />
          </p>
        </div>

        {/* Botones */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={handlePrint}
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

/* ----------- Card ----------- */
function CardHistorial({ row, onView }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-white/10 transition">
      <div>
        <div className="text-sm text-white/70">
          #{row.nro} · {fmtDate(row.fecha)}
        </div>
        <div className="font-semibold text-white">{row.servicio}</div>
        <div className="text-sm text-white/80">{row.vehiculo}</div>

        <div className="text-sm text-white/80 mt-1">
          Mecánico: {row.mecanico} · Costo: <b>{money(row.costo)}</b>
        </div>
      </div>

      <div className="mt-3 sm:mt-0 flex gap-2 items-center">
        <ChipEstado estado={row.estado} />

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
  // ...existing state...
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("fecha");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  // Reset página cuando cambian filtros/orden/datos
  useEffect(() => setPage(1), [query, sortBy, perPage, rows.length]);
  // --- FIN PAGINACIÓN ---

  // 🚀 Cargar datos del backend
  useEffect(() => {
    async function load() {
      try {
        const id = Number(localStorage.getItem("id_usuario"));
        const token = localStorage.getItem("token");

        if (!id || !token) {
          console.error("No hay datos de sesión");
          setLoading(false);
          return;
        }

        const API = import.meta.env.VITE_API_URL;

        const res = await fetch(`${API}/mecanica/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener historial");

        let data = await res.json();

        setRows(data);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return [...rows]
      .filter((r) =>
        [r.servicio, r.mecanico, r.vehiculo].some((x) =>
          x?.toLowerCase().includes(q)
        )
      )
      .sort((a, b) =>
        sortBy === "costo"
          ? b.costo - a.costo
          : new Date(b.fecha) - new Date(a.fecha)
      );
  }, [rows, query, sortBy]);

  // paginado aplicando sobre filtered
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const displayed = filtered.slice(startIndex, endIndex);

  if (loading)
    return (
      <div className="text-white/80 p-5 animate-pulse">
        Cargando historial...
      </div>
    );

  return (
    <div className="space-y-4 text-white max-w-full overflow-hidden">
      <ControlBar
        query={query}
        setQuery={setQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReload={() => window.location.reload()}
      />

      {displayed.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
          No hay servicios finalizados aún.
        </div>
      ) : (
        <div className="grid gap-3">
          {displayed.map((r, index) => (
            <CardHistorial
              key={r.id_historial}
              row={{ ...r, nro: startIndex + index + 1 }}
              onView={setSelected}
            />
          ))}
        </div>
      )}

      {/* PAGINADOR RESPONSIVE */}
      <div className="mt-4">
        {/* Desktop: controles completos */}
        <div className="hidden md:flex items-center justify-between">
          <div className="text-sm text-white/70">
            Mostrando {Math.min(startIndex + 1, total)}-
            {Math.min(endIndex, total)} de {total}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white/10 text-white p-2 rounded"
            >
              <option value={5}>5 / pág</option>
              <option value={6}>6 / pág</option>
              <option value={10}>10 / pág</option>
            </select>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1 max-w-[480px] overflow-auto px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] px-3 py-1 rounded text-sm ${
                    n === page
                      ? "bg-violet-600 text-white"
                      : "bg-[#2a2a2a] text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Mobile: compacto */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              {startIndex + 1} - {Math.min(endIndex, total)} de {total}
            </div>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white/10 text-white p-2 rounded"
            >
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex-1 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <div className="text-sm text-white/70 text-center w-24">
              {page}/{totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex-1 px-3 py-2 rounded bg-[#2a2a2a] text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        data={selected}
      />
    </div>
  );
}
