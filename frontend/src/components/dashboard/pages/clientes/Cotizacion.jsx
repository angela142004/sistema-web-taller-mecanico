// src/pages/cliente/Cotizacion.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  X,
  Printer,
  RotateCcw,
} from "lucide-react";

/* ========= helpers ========= */
const money = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
const fmtDate = (s) => new Date(s).toLocaleDateString();

/* ========= API (stubs; conecta tu backend con VITE_API_BASE_URL) ========= */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const API = {
  async listQuotes() {
    try {
      if (!API_BASE) throw new Error("sin backend");
      const res = await fetch(`${API_BASE}/api/client/quotes`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al listar");
      return await res.json();
    } catch {
      // Mock si no hay backend
      await new Promise((r) => setTimeout(r, 600));
      return [
        {
          id: 23015,
          fecha: "2025-08-24",
          servicio: "Revisión general",
          marca: "Toyota",
          modelo: "Corolla",
          estado: "cotizado",
          items: [
            { desc: "Revisión general", qty: 1, price: 80 },
            { desc: "Filtro de aire", qty: 1, price: 25 },
            { desc: "Aceite 5W-30", qty: 4, price: 12 },
          ],
          otros: 0,
          igv: 0.18,
          notas:
            "Válido por 7 días. No incluye reparaciones no diagnosticadas.",
        },
        {
          id: 23016,
          fecha: "2025-08-23",
          servicio: "Frenos",
          marca: "Kia",
          modelo: "Rio",
          estado: "aprobado",
          items: [
            { desc: "Pastillas delanteras", qty: 1, price: 120 },
            { desc: "Rectificado de discos", qty: 1, price: 60 },
            { desc: "Mano de obra", qty: 1, price: 90 },
          ],
          otros: 10,
          igv: 0.18,
          notas: "Tiempo estimado: 3 horas.",
        },
      ];
    }
  },

  async acceptQuote(id) {
    try {
      if (!API_BASE) throw new Error("sin backend");
      const res = await fetch(`${API_BASE}/api/client/quotes/${id}/accept`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al aceptar");
      return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 500));
      return { ok: true };
    }
  },

  async requestChanges(id, message) {
    try {
      if (!API_BASE) throw new Error("sin backend");
      const res = await fetch(
        `${API_BASE}/api/client/quotes/${id}/request-changes`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }
      );
      if (!res.ok) throw new Error("Error al solicitar cambios");
      return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 500));
      return { ok: true };
    }
  },
};

/* ========= UI genéricos ========= */
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 text-white">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[min(780px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#15132b] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer ? <div className="mt-5">{footer}</div> : null}
      </div>
    </div>
  );
}

const EstadoChip = ({ estado }) => {
  const map = {
    cotizado: { text: "Cotizado", color: "bg-sky-500/80" },
    aprobado: { text: "Aprobado", color: "bg-emerald-600/80" },
    rechazado: { text: "Rechazado", color: "bg-rose-600/80" },
    facturado: { text: "Facturado", color: "bg-violet-600/80" },
  };
  const { text, color } = map[estado] ?? map.cotizado;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {text}
    </span>
  );
};

function Toast({ type = "ok", children }) {
  const style =
    type === "ok"
      ? "bg-emerald-600/90"
      : type === "warn"
      ? "bg-amber-600/90"
      : "bg-rose-600/90";
  return (
    <div
      className={`fixed top-4 right-4 z-[60] rounded-xl px-4 py-2 text-sm text-white shadow-lg ${style}`}
    >
      {children}
    </div>
  );
}

function SkeletonTableRows({ rows = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-white/10">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="py-3 px-4">
              <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function Info({ k, v }) {
  return (
    <div className="grid grid-cols-5 items-center">
      <div className="col-span-2 text-white/80">{k}</div>
      <div className="col-span-3">{v}</div>
    </div>
  );
}

/* ========= Barra de controles ========= */
function ControlBar({ query, setQuery, status, setStatus, onReload }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-stretch">
      {/* Buscador */}
      <div className="col-span-12 relative">
        <input
          className="w-full h-11 rounded-2xl bg-[#3b138d] text-white placeholder:text-white/70
                     px-9 pr-9 outline-none border border-white/10 focus:ring-2 focus:ring-white/20"
          placeholder="Buscar por servicio, marca, modelo o N°"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar cotización"
        />
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/90"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filtro estado */}
      <div className="col-span-8 sm:col-span-4 relative">
        <select
          className="w-full h-11 rounded-2xl bg-white/10 text-white px-4 pr-9 outline-none
                     border border-white/10 focus:ring-2 focus:ring-white/20 appearance-none"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="todas">todas</option>
          <option value="cotizado">cotizado</option>
          <option value="aprobado">aprobado</option>
          <option value="rechazado">rechazado</option>
          <option value="facturado">facturado</option>
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/90"
        />
      </div>

      {/* Recargar */}
      <div className="col-span-4 sm:col-span-2">
        <button
          onClick={onReload}
          className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15
                     flex items-center justify-center gap-2"
          aria-label="Recargar cotizaciones"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Recargar</span>
        </button>
      </div>
    </div>
  );
}

/* ========= Acciones (desktop en línea / móvil 2×2) ========= */
function ActionCell({ quote, onView, onPrint, onAccept, onReject }) {
  const canAccept = quote.estado === "cotizado";
  const canReject = quote.estado === "cotizado" || quote.estado === "aprobado";
  const btn =
    "h-10 w-10 rounded-xl grid place-items-center transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="text-white">
      {/* MÓVIL: 2x2 */}
      <div className="grid grid-cols-2 gap-2 md:hidden min-w-[140px]">
        <button
          className={`${btn} bg-white/10 hover:bg-white/15`}
          onClick={onView}
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
        <button
          className={`${btn} bg-white/10 hover:bg-white/15`}
          onClick={onPrint}
          title="Descargar / Imprimir"
        >
          <Download size={18} />
        </button>
        <button
          className={`${btn} bg-emerald-600/80 hover:bg-emerald-600`}
          disabled={!canAccept}
          onClick={onAccept}
          title="Aceptar"
        >
          <CheckCircle2 size={18} />
        </button>
        <button
          className={`${btn} bg-rose-600/80 hover:bg-rose-600`}
          disabled={!canReject}
          onClick={onReject}
          title="Solicitar cambios"
        >
          <XCircle size={18} />
        </button>
      </div>

      {/* DESKTOP: en línea */}
      <div className="hidden md:flex gap-2">
        <button
          className={`${btn} bg-white/10 hover:bg-white/15`}
          onClick={onView}
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
        <button
          className={`${btn} bg-white/10 hover:bg-white/15`}
          onClick={onPrint}
          title="Descargar / Imprimir"
        >
          <Download size={18} />
        </button>
        <button
          className={`${btn} bg-emerald-600/80 hover:bg-emerald-600`}
          disabled={!canAccept}
          onClick={onAccept}
          title="Aceptar"
        >
          <CheckCircle2 size={18} />
        </button>
        <button
          className={`${btn} bg-rose-600/80 hover:bg-rose-600`}
          disabled={!canReject}
          onClick={onReject}
          title="Solicitar cambios"
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
}

/* ========= Tarjeta móvil (en lugar de tabla) ========= */
function QuoteCardMobile({ c, onView, onPrint, onAccept, onReject }) {
  const subtotal =
    (c.items || []).reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0) +
    (c.otros || 0);
  const imp = +(subtotal * (c.igv ?? 0)).toFixed(2);
  const total = subtotal + imp;

  const canAccept = c.estado === "cotizado";
  const canReject = c.estado === "cotizado" || c.estado === "aprobado";
  const btn =
    "h-10 rounded-xl grid place-items-center transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/70">
            #{c.id} · {fmtDate(c.fecha)}
          </div>
          <div className="font-semibold">{c.servicio}</div>
          <div className="text-sm text-white/80">
            {c.marca} • {c.modelo}
          </div>
        </div>
        <EstadoChip estado={c.estado} />
      </div>

      <div className="mt-3 text-sm text-white/80">
        Total estimado: <b className="text-white">{money(total)}</b>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={`${btn} bg-white/10 hover:bg-white/15`}
          onClick={() => onView({ ...c, subtotal, imp, total })}
        >
          <Eye size={18} />
        </button>
        <button
          className={`${btn} bg-white/10 hover:bg-white/15`}
          onClick={onPrint}
        >
          <Download size={18} />
        </button>
        <button
          className={`${btn} bg-emerald-600/80 hover:bg-emerald-600`}
          disabled={!canAccept}
          onClick={() => onAccept(c.id)}
        >
          <CheckCircle2 size={18} />
        </button>
        <button
          className={`${btn} bg-rose-600/80 hover:bg-rose-600`}
          disabled={!canReject}
          onClick={() => onReject(c)}
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
}

/* ========= Leyenda de estados (abajo) ========= */
function LegendItem({ label, color, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        {label}
      </span>
      <span className="text-white/80 text-sm">{children}</span>
    </li>
  );
}
function LegendSection() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h4 className="font-semibold mb-3">Estados</h4>
      <ul className="grid gap-2">
        <LegendItem label="Cotizado" color="bg-sky-500/80">
          El taller envió la propuesta. Puedes aceptarla o solicitar cambios.
        </LegendItem>
        <LegendItem label="Aprobado" color="bg-emerald-600/80">
          Confirmaste la cotización; el taller procede con el servicio.
        </LegendItem>
        <LegendItem label="Rechazado" color="bg-rose-600/80">
          Solicitaste cambios; el taller te enviará una nueva propuesta.
        </LegendItem>
        <LegendItem label="Facturado" color="bg-violet-600/80">
          Se emitió la boleta o factura correspondiente.
        </LegendItem>
      </ul>
    </div>
  );
}

/* ========= Página: Cotizaciones (Cliente) ========= */
export default function CotizacionCliente() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState(null); // {type,msg}

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todas");

  const [current, setCurrent] = useState(null);
  const [modal, setModal] = useState(null); // "view" | "rechazar"

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await API.listQuotes();
      setQuotes(data);
    } catch {
      setErr("No pudimos cargar tus cotizaciones. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes
      .filter((c) => (status === "todas" ? true : c.estado === status))
      .filter(
        (c) =>
          c.servicio.toLowerCase().includes(q) ||
          c.marca.toLowerCase().includes(q) ||
          c.modelo.toLowerCase().includes(q) ||
          String(c.id).includes(q)
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [quotes, query, status]);

  /* acciones */
  const aceptar = async (id) => {
    const prev = quotes;
    setQuotes((p) =>
      p.map((c) => (c.id === id ? { ...c, estado: "aprobado" } : c))
    );
    try {
      await API.acceptQuote(id);
      setToast({ type: "ok", msg: "Cotización aceptada. ¡Gracias!" });
    } catch {
      setQuotes(prev);
      setToast({ type: "error", msg: "No se pudo aceptar. Intenta de nuevo." });
    } finally {
      setTimeout(() => setToast(null), 1800);
    }
  };

  const rechazar = async (id, motivo) => {
    const prev = quotes;
    setQuotes((p) =>
      p.map((c) => (c.id === id ? { ...c, estado: "rechazado", motivo } : c))
    );
    try {
      await API.requestChanges(id, motivo);
      setToast({ type: "warn", msg: "Solicitud enviada al taller." });
    } catch {
      setQuotes(prev);
      setToast({ type: "error", msg: "No se pudo enviar tu solicitud." });
    } finally {
      setTimeout(() => setToast(null), 1800);
    }
  };

  const printOrDownload = () => window.print();

  return (
    <div className="space-y-6 text-white">
      {toast && <Toast type={toast.type}>{toast.msg}</Toast>}

      {/* Controles */}
      <ControlBar
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        onReload={load}
      />

      {/* ======== Desktop/Tablet: Tabla ======== */}
      <div className="hidden md:block rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:py-3 [&>th]:px-4 [&>th]:text-left">
              <th className="w-20">N°</th>
              <th>Servicio</th>
              <th>Vehículo</th>
              <th className="w-40">Fecha</th>
              <th className="w-40">Estado</th>
              <th className="w-56">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTableRows rows={4} />
            ) : err ? (
              <tr>
                <td colSpan={6} className="py-10">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-white/90">{err}</span>
                    <button
                      onClick={load}
                      className="px-3 h-9 rounded-lg bg-white/10 hover:bg-white/15"
                    >
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/80">
                  No hay cotizaciones para mostrar.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const subtotal =
                  (c.items || []).reduce(
                    (s, it) => s + (it.qty || 0) * (it.price || 0),
                    0
                  ) + (c.otros || 0);
                const imp = +(subtotal * (c.igv ?? 0)).toFixed(2);
                const total = subtotal + imp;

                return (
                  <tr
                    key={c.id}
                    className="border-t border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">{c.id}</td>
                    <td className="px-4">{c.servicio}</td>
                    <td className="px-4">
                      {c.marca} • {c.modelo}
                    </td>
                    <td className="px-4">{fmtDate(c.fecha)}</td>
                    <td className="px-4">
                      <EstadoChip estado={c.estado} />
                    </td>
                    <td className="px-4">
                      <ActionCell
                        quote={c}
                        onView={() => {
                          setCurrent({ ...c, subtotal, imp, total });
                          setModal("view");
                        }}
                        onPrint={printOrDownload}
                        onAccept={() => aceptar(c.id)}
                        onReject={() => {
                          setCurrent(c);
                          setModal("rechazar");
                        }}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ======== Móvil: Listado de Tarjetas ======== */}
      <div className="md:hidden space-y-3">
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
            No hay cotizaciones para mostrar.
          </div>
        ) : (
          filtered.map((c) => (
            <QuoteCardMobile
              key={c.id}
              c={c}
              onView={(data) => {
                setCurrent(data);
                setModal("view");
              }}
              onPrint={printOrDownload}
              onAccept={aceptar}
              onReject={(row) => {
                setCurrent(row);
                setModal("rechazar");
              }}
            />
          ))
        )}
      </div>

      {/* Leyenda de estados (abajo) */}
      <LegendSection />

      {/* Modal VER */}
      <Modal
        open={modal === "view" && current}
        onClose={() => setModal(null)}
        title={`Cotización #${current?.id}`}
        footer={
          current && (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                Subtotal: <b>{money(current.subtotal)}</b> · IGV(18%):{" "}
                <b>{money(current.imp)}</b> · Total:{" "}
                <b>{money(current.total)}</b>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 h-10 rounded-lg bg-white/10 hover:bg-white/15"
                  onClick={window.print}
                >
                  <Printer size={16} className="inline -mt-0.5 mr-1" />
                  Imprimir / Descargar
                </button>
                <button
                  className="px-4 h-10 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40"
                  disabled={current.estado !== "cotizado"}
                  onClick={() => {
                    aceptar(current.id);
                    setModal(null);
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          )
        }
      >
        {current && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Info k="Servicio" v={current.servicio} />
              <Info k="Fecha" v={fmtDate(current.fecha)} />
              <Info k="Vehículo" v={`${current.marca} • ${current.modelo}`} />
              <Info k="Estado" v={<EstadoChip estado={current.estado} />} />
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr className="[&>th]:py-2 [&>th]:px-3 [&>th]:text-left">
                    <th>Concepto</th>
                    <th className="w-24">Cant.</th>
                    <th className="w-28">Precio</th>
                    <th className="w-32">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {current.items.map((it, i) => (
                    <tr key={i} className="border-t border-white/10">
                      <td className="py-2 px-3">{it.desc}</td>
                      <td className="px-3">{it.qty}</td>
                      <td className="px-3">{money(it.price)}</td>
                      <td className="px-3">{money(it.qty * it.price)}</td>
                    </tr>
                  ))}
                  {current.otros ? (
                    <tr className="border-t border-white/10">
                      <td className="py-2 px-3">Otros</td>
                      <td className="px-3">—</td>
                      <td className="px-3">—</td>
                      <td className="px-3">{money(current.otros)}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <p className="text-white/90">{current.notas}</p>
          </div>
        )}
      </Modal>

      {/* Modal RECHAZAR / SOLICITAR CAMBIOS */}
      <Modal
        open={modal === "rechazar" && current}
        onClose={() => setModal(null)}
        title={`Solicitar cambios — #${current?.id}`}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="px-4 h-10 rounded-lg bg-white/10 hover:bg-white/15"
              onClick={() => setModal(null)}
            >
              Cancelar
            </button>
            <button
              className="px-4 h-10 rounded-lg bg-rose-600/80 hover:bg-rose-600"
              onClick={() => {
                const txt =
                  document.getElementById("motivo-rechazo")?.value || "";
                rechazar(current.id, txt);
                setModal(null);
              }}
            >
              Enviar solicitud
            </button>
          </div>
        }
      >
        <p className="text-sm text-white/90 mb-3">
          Cuéntanos qué te gustaría cambiar (marca de repuestos, alcance del
          servicio, presupuesto, etc.).
        </p>
        <textarea
          id="motivo-rechazo"
          className="w-full min-h-[120px] rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/60"
          placeholder="Escribe tu mensaje aquí…"
        />
      </Modal>
    </div>
  );
}
