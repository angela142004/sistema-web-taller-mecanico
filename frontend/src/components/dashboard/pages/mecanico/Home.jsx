import { useState, useEffect } from "react";
import {
  Car,
  Wrench,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  X,
  ChevronRight,
  Activity,
} from "lucide-react";

export default function DashboardInicio() {
  // ...existing code...
  const usuario = "Mecánico";

  const [serviciosAsignados, setServiciosAsignados] = useState(0);
  const [serviciosPendientes, setServiciosPendientes] = useState(0);
  const [serviciosEnProceso, setServiciosEnProceso] = useState(0);
  const [serviciosFinalizados, setServiciosFinalizados] = useState(0);
  const [serviciosRecientes, setServiciosRecientes] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("semana");

  // ID DEL MECÁNICO LOGUEADO (si lo guardas)
  const idUsuario = Number(localStorage.getItem("id_usuario"));

  const token = localStorage.getItem("token") || "";
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const controller = new AbortController();

    const cargarDatos = async () => {
      try {
        const res = await fetch(`${API}/mecanica/asignaciones`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          console.error("Error fetch asignaciones:", res.status);
          return;
        }

        const data = await res.json();

        // === Filtrar asignaciones del mecánico logueado ===
        const asignacionesFiltradas = data.filter((a) => {
          const mech = a.mecanico?.usuario?.id_usuario;
          return Number(mech) === Number(idUsuario);
        });

        // Contadores de estados
        const pendientes = asignacionesFiltradas.filter(
          (a) => a.estado?.toLowerCase() === "pendiente"
        ).length;

        const enProceso = asignacionesFiltradas.filter(
          (a) => a.estado?.toLowerCase() === "en_proceso"
        ).length;

        const finalizados = asignacionesFiltradas.filter(
          (a) => a.estado?.toLowerCase() === "finalizado"
        ).length;

        setServiciosAsignados(asignacionesFiltradas.length);
        setServiciosPendientes(pendientes);
        setServiciosEnProceso(enProceso);
        setServiciosFinalizados(finalizados);

        // Servicios recientes (últimos 4)
        const recientes = asignacionesFiltradas
          .slice()
          .sort(
            (a, b) =>
              new Date(b.fecha_asignacion) - new Date(a.fecha_asignacion)
          )
          .slice(0, 4)
          .map((a) => {
            const cliente =
              a.cotizacion?.reserva?.cliente?.usuario?.nombre || "Cliente";
            const marca =
              a.cotizacion?.reserva?.vehiculo?.modelo?.marca?.nombre || "";
            const modelo =
              a.cotizacion?.reserva?.vehiculo?.modelo?.nombre || "";
            const vehiculo =
              `${marca} ${modelo}`.trim() ||
              a.cotizacion?.reserva?.vehiculo?.placa ||
              "Vehículo";
            const estado = a.estado ?? "pendiente";
            const prioridad = a.observaciones?.toLowerCase().includes("urgente")
              ? "alta"
              : "media";

            return {
              id: a.id_asignacion,
              cliente,
              vehiculo,
              estado,
              prioridad,
            };
          });

        setServiciosRecientes(recientes);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("❌ Error cargando asignaciones:", error);
        }
      }
    };

    if (idUsuario) cargarDatos();

    return () => controller.abort();
  }, [idUsuario, token, API]); // ✅ Dependencias corregidas

  // Badges (usar claves del backend)
  const getEstadoBadge = (estado) => {
    const e = String(estado || "").toLowerCase();
    const badges = {
      pendiente: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      en_proceso: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      finalizado: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    };
    return badges[e] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  // Helper: normalizar estado -> etiqueta legible
  const prettyEstado = (estado) => {
    const s = String(estado || "")
      .toLowerCase()
      .replace(/\s+/g, "");
    if (s.includes("pend")) return "Pendiente";
    if (
      s.includes("en_proceso") ||
      s.includes("en-proceso") ||
      s.includes("enproceso") ||
      s.includes("enpro")
    )
      return "En Proceso";
    if (s.includes("final")) return "Finalizado";
    return String(estado || "").length ? String(estado) : "—";
  };

  // Iconos de prioridad
  const getPrioridadIcon = (prioridad) => {
    if (prioridad === "alta")
      return <AlertCircle className="text-red-400" size={16} />;
    if (prioridad === "media")
      return <Clock className="text-yellow-400" size={16} />;
    return <Activity className="text-green-400" size={16} />;
  };

  // Datos para gráfica dinámica
  const estadosServicios = [
    {
      estado: "Pendiente",
      cantidad: serviciosPendientes,
      color: "bg-amber-500",
      porcentaje:
        serviciosAsignados === 0
          ? 0
          : (serviciosPendientes / serviciosAsignados) * 100,
    },
    {
      estado: "En Proceso",
      cantidad: serviciosEnProceso,
      color: "bg-blue-500",
      porcentaje:
        serviciosAsignados === 0
          ? 0
          : (serviciosEnProceso / serviciosAsignados) * 100,
    },
    {
      estado: "Finalizados",
      cantidad: serviciosFinalizados,
      color: "bg-emerald-500",
      porcentaje:
        serviciosAsignados === 0
          ? 0
          : (serviciosFinalizados / serviciosAsignados) * 100,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con animación */}
        <div className="relative overflow-hidden rounded-3xl bg-blue-500/20 to-pink-600 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Wrench className="text-white" size={28} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Taller Mecánico</p>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  ¡Hola, {usuario}! 👋
                </h1>
              </div>
            </div>
            <p className="text-white/90 text-lg mt-3 max-w-2xl">
              Panel de control para gestionar tus servicios asignados en{" "}
              <span className="font-semibold">Automotriz Kleberth</span>
            </p>
          </div>
        </div>

        {/* Grid de métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Servicios Asignados */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <Car className="text-indigo-400" size={24} />
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={14} /> +12%
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">Total Asignados</p>
              <h3 className="text-4xl font-bold text-white">
                {serviciosAsignados}
              </h3>
            </div>
          </div>

          {/* Card Pendientes */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Clock className="text-amber-400" size={24} />
                </div>
                <span className="text-xs text-amber-400 font-medium">
                  Por iniciar
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">Pendientes</p>
              <h3 className="text-4xl font-bold text-white">
                {serviciosPendientes}
              </h3>
            </div>
          </div>

          {/* Card En Proceso */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Activity className="text-blue-400" size={24} />
                </div>
                <span className="text-xs text-blue-400 font-medium pulse">
                  En curso
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">En Proceso</p>
              <h3 className="text-4xl font-bold text-white">
                {serviciosEnProceso}
              </h3>
            </div>
          </div>

          {/* Card Finalizados */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <CheckCircle className="text-emerald-400" size={24} />
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={14} /> +8%
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-1">Finalizados</p>
              <h3 className="text-4xl font-bold text-white">
                {serviciosFinalizados}
              </h3>
            </div>
          </div>
        </div>

        {/* Grid de contenido secundario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfica de distribución */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/50 backdrop-blur-sm p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Distribución de Servicios
              </h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="año">Este año</option>
              </select>
            </div>

            <div className="space-y-6">
              {estadosServicios.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${item.color}`}
                      ></div>
                      <span className="text-slate-300 font-medium">
                        {item.estado}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-white">
                      {item.cantidad}
                    </span>
                  </div>
                  <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${item.color} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.porcentaje.toFixed(1)}% del total
                  </p>
                </div>
              ))}
            </div>

            {/* Indicador de eficiencia */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Tasa de finalización</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {(
                      (serviciosFinalizados /
                        (serviciosAsignados + serviciosFinalizados)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="text-emerald-400">
                  <TrendingUp size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Servicios recientes */}
          <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm p-6 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4">Servicios Recientes</h2>
            <div className="space-y-3">
              {serviciosRecientes.map((servicio) => (
                <div
                  key={servicio.id}
                  className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPrioridadIcon(servicio.prioridad)}
                      <p className="font-medium text-sm">{servicio.cliente}</p>
                    </div>
                    <ChevronRight
                      className="text-slate-600 group-hover:text-indigo-400 transition"
                      size={18}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {servicio.vehiculo}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs border ${getEstadoBadge(
                      servicio.estado
                    )}`}
                  >
                    {prettyEstado(servicio.estado)}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition">
              Ver todos los servicios
            </button>
          </div>
        </div>

        {/* Consejos para el mecánico */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 border border-purple-500/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Wrench className="text-purple-400" size={24} />
                Consejos Profesionales
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl">
                Mantén siempre la seguridad como prioridad. Aquí te dejamos
                algunos consejos para realizar tu trabajo de manera más
                eficiente y segura.
              </p>
            </div>
            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition flex items-center gap-2 shrink-0"
            >
              Ver más <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Modal de consejos */}
        {openModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Consejos Profesionales
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 text-slate-300 max-h-96 overflow-y-auto pr-2">
                {[
                  {
                    icon: "🔧",
                    title: "Revisa las herramientas",
                    text: "Antes de comenzar cualquier servicio, asegúrate de que estén en buen estado y calibradas.",
                  },
                  {
                    icon: "🧰",
                    title: "Organiza tu área de trabajo",
                    text: "Un espacio limpio y ordenado facilita las reparaciones y reduce el riesgo de accidentes.",
                  },
                  {
                    icon: "⚠️",
                    title: "Usa equipo de protección",
                    text: "Guantes, gafas y calzado de seguridad son esenciales para prevenir lesiones.",
                  },
                  {
                    icon: "📝",
                    title: "Mantén registro detallado",
                    text: "Documenta cada trabajo realizado para un mejor seguimiento y referencias futuras.",
                  },
                  {
                    icon: "🛠",
                    title: "Mantenimiento preventivo",
                    text: "Cuida tus herramientas y equipos para prolongar su vida útil y eficiencia.",
                  },
                  {
                    icon: "🔌",
                    title: "Verifica conexiones eléctricas",
                    text: "Siempre desconecta la batería antes de trabajar en el sistema eléctrico del vehículo.",
                  },
                  {
                    icon: "💬",
                    title: "Comunica hallazgos",
                    text: "Informa al cliente sobre cualquier problema adicional detectado durante la inspección.",
                  },
                  {
                    icon: "⏰",
                    title: "Gestiona tu tiempo",
                    text: "Prioriza los servicios según urgencia y complejidad para optimizar tu jornada.",
                  },
                ].map((consejo, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-purple-500/50 transition"
                  >
                    <p className="flex items-start gap-3">
                      <span className="text-2xl">{consejo.icon}</span>
                      <span>
                        <strong className="text-white">{consejo.title}:</strong>{" "}
                        {consejo.text}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setOpenModal(false)}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
