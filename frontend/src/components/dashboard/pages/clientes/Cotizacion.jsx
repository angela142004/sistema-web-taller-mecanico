import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  RotateCcw,
} from "lucide-react";

/* === Helpers === */
const money = (n) =>
  (Number(n) || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  });
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("es-PE") : "—");

/* === Chips, toasts y modales === */
function EstadoChip({ estado }) {
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
}

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
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  );
}

/* === Select personalizado oscuro === */
function DarkSelect({ value, setValue, options }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 rounded-2xl bg-[#3b138d] text-white px-4 pr-9
                   outline-none border border-white/10 focus:ring-2 focus:ring-white/20
                   flex items-center justify-between capitalize"
      >
        <span>{value}</span>
        <ChevronDown size={16} className="text-white" />
      </button>

      {open && (
        <div className="absolute mt-1 w-full rounded-xl border border-white/10 bg-[#1e1442] shadow-lg z-20">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setValue(opt);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm capitalize hover:bg-white/10 ${
                opt === value ? "bg-[#3b138d]" : ""
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* === Tarjeta móvil === */
function QuoteCardMobile({ c, onView, onAccept, onReject }) {
  const canAccept = c.estado === "cotizado"; // solo cotizado puede aprobarse
  const canReject = c.estado === "cotizado"; // solo cotizado puede rechazarse
  const btn =
    "h-10 rounded-xl grid place-items-center transition disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/70">
            #{c.id_cotizacion} · {fmtDate(c.fecha)}
          </div>
          <div className="font-semibold">{c.reserva?.servicio?.nombre}</div>
          <div className="text-sm text-white/80">
            {c.reserva?.vehiculo?.modelo?.marca?.nombre} •{" "}
            {c.reserva?.vehiculo?.modelo?.nombre} —{" "}
            {c.reserva?.vehiculo?.placa}
          </div>
        </div>
        <EstadoChip estado={c.estado} />
      </div>
      <div className="mt-3 text-sm text-white/80">
        Total estimado: <b className="text-white">{money(c.total)}</b>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={`${btn} bg-white/10 hover:bg-white/15`}
          onClick={() => onView(c)}
        >
          <Eye size={18} />
        </button>
        <button
          className={`${btn} bg-emerald-600/80 hover:bg-emerald-600`}
          disabled={!canAccept}
          onClick={() => onAccept(c.id_cotizacion)}
        >
          <CheckCircle2 size={18} />
        </button>
        <button
          className={`${btn} bg-rose-600/80 hover:bg-rose-600 col-span-2`}
          disabled={!canReject}
          onClick={() => onReject(c)}
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
}

/* === Página principal === */
export default function CotizacionCliente() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [current, setCurrent] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todas");

  // 🚀 Ejemplo manual (visual)
  useEffect(() => {
    setCotizaciones([
      {
        id_cotizacion: 1,
        fecha: "2025-11-11",
        estado: "cotizado",
        total: 320,
        reserva: {
          servicio: { nombre: "Cambio de aceite y filtro" },
          vehiculo: {
            placa: "ABC-123",
            modelo: { nombre: "Corolla", marca: { nombre: "Toyota" } },
          },
        },
      },
      {
        id_cotizacion: 2,
        fecha: "2025-11-09",
        estado: "aprobado",
        total: 480,
        reserva: {
          servicio: { nombre: "Frenos completos" },
          vehiculo: {
            placa: "XYZ-789",
            modelo: { nombre: "Rio", marca: { nombre: "Kia" } },
          },
        },
      },
    ]);
    setLoading(false);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cotizaciones
      .filter((c) => (status === "todas" ? true : c.estado === status))
      .filter((c) => {
        const s = c.reserva?.servicio?.nombre?.toLowerCase() || "";
        const v = c.reserva?.vehiculo?.modelo?.nombre?.toLowerCase() || "";
        const m = c.reserva?.vehiculo?.modelo?.marca?.nombre?.toLowerCase() || "";
        return (
          s.includes(q) ||
          v.includes(q) ||
          m.includes(q) ||
          String(c.id_cotizacion).includes(q)
        );
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [cotizaciones, query, status]);

  const aceptar = (id) => {
    setCotizaciones((prev) =>
      prev.map((c) =>
        c.id_cotizacion === id
          ? { ...c, estado: c.estado === "rechazado" ? c.estado : "aprobado" }
          : c
      )
    );
    setToast({ type: "ok", msg: "Cotización aprobada ✅" });
    setTimeout(() => setToast(null), 1800);
  };

  const rechazar = (id, motivo) => {
    setCotizaciones((prev) =>
      prev.map((c) =>
        c.id_cotizacion === id
          ? { ...c, estado: c.estado === "aprobado" ? c.estado : "rechazado", motivo }
          : c
      )
    );
    setToast({ type: "warn", msg: "Solicitud enviada al taller 📨" });
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="space-y-6 text-white">
      {toast && <Toast type={toast.type}>{toast.msg}</Toast>}

      {/* ====== Barra de control ====== */}
      <div className="grid grid-cols-12 gap-3 items-stretch">
        <div className="col-span-12 sm:col-span-6 relative">
          <input
            className="w-full h-11 rounded-2xl bg-[#3b138d] text-white placeholder:text-white/70 px-9 pr-9
                       outline-none border border-white/10 focus:ring-2 focus:ring-white/20"
            placeholder="Buscar por servicio, marca, modelo o N°"
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
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="col-span-8 sm:col-span-4">
          <DarkSelect
            value={status}
            setValue={setStatus}
            options={["todas", "cotizado", "aprobado", "rechazado", "facturado"]}
          />
        </div>

        <div className="col-span-4 sm:col-span-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15
                       flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Recargar</span>
          </button>
        </div>
      </div>

      {/* ====== Tabla Desktop ====== */}
      <div className="hidden md:block rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:py-3 [&>th]:px-4 [&>th]:text-left">
              <th>N°</th>
              <th>Servicio</th>
              <th>Vehículo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-white/70">
                  Cargando…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-white/70">
                  No hay cotizaciones.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const canAccept = c.estado === "cotizado";
                const canReject = c.estado === "cotizado";
                return (
                  <tr
                    key={c.id_cotizacion}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-2">{c.id_cotizacion}</td>
                    <td className="px-4 py-2">
                      {c.reserva?.servicio?.nombre || "—"}
                    </td>
                    <td className="px-4 py-2">
                      {c.reserva?.vehiculo?.modelo?.marca?.nombre || "—"} •{" "}
                      {c.reserva?.vehiculo?.modelo?.nombre || "—"} —{" "}
                      {c.reserva?.vehiculo?.placa || "—"}
                    </td>
                    <td className="px-4 py-2">{fmtDate(c.fecha)}</td>
                    <td className="px-4 py-2">
                      <EstadoChip estado={c.estado} />
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15"
                        onClick={() => {
                          setCurrent(c);
                          setModal("view");
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600"
                        disabled={!canAccept}
                        onClick={() => aceptar(c.id_cotizacion)}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600"
                        disabled={!canReject}
                        onClick={() => {
                          setCurrent(c);
                          setModal("rechazar");
                        }}
                      >
                        <XCircle size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ====== Móvil ====== */}
      <div className="md:hidden space-y-3">
        {filtered.map((c) => (
          <QuoteCardMobile
            key={c.id_cotizacion}
            c={c}
            onView={(data) => {
              setCurrent(data);
              setModal("view");
            }}
            onAccept={aceptar}
            onReject={(row) => {
              setCurrent(row);
              setModal("rechazar");
            }}
          />
        ))}
      </div>

      {/* ====== Modal VER ====== */}
      <Modal
        open={modal === "view" && current}
        onClose={() => setModal(null)}
        title={`Cotización #${current?.id_cotizacion}`}
        footer={
          current && (
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Total: <b>{money(current.total)}</b>
              </div>
              <button
                className="px-4 h-10 rounded-lg bg-emerald-600/80 hover:bg-emerald-600"
                disabled={current.estado !== "cotizado"}
                onClick={() => {
                  aceptar(current.id_cotizacion);
                  setModal(null);
                }}
              >
                Aceptar
              </button>
            </div>
          )
        }
      >
        {current && (
          <div className="space-y-2 text-sm">
            <p>
              <b>Servicio:</b> {current.reserva?.servicio?.nombre || "—"}
            </p>
            <p>
              <b>Vehículo:</b>{" "}
              {current.reserva?.vehiculo?.modelo?.marca?.nombre}{" "}
              {current.reserva?.vehiculo?.modelo?.nombre} (
              {current.reserva?.vehiculo?.placa})
            </p>
            <p>
              <b>Fecha:</b> {fmtDate(current.fecha)}
            </p>
            <p>
              <b>Estado:</b> <EstadoChip estado={current.estado} />
            </p>
          </div>
        )}
      </Modal>

      {/* ====== Modal RECHAZAR ====== */}
      <Modal
        open={modal === "rechazar" && current}
        onClose={() => setModal(null)}
        title={`Solicitar cambios – #${current?.id_cotizacion}`}
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
                const motivo =
                  document.getElementById("motivo-rechazo")?.value || "";
                rechazar(current.id_cotizacion, motivo);
                setModal(null);
              }}
            >
              Enviar solicitud
            </button>
          </div>
        }
      >
        <p className="text-sm text-white/90 mb-3">
          Indica qué parte de la cotización deseas modificar o revisar.
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

