import { useState, useEffect } from "react";
import {
  Car,
  CalendarCheck2,
  Wrench,
  FileText,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

export default function DashboardInicio() {
  const usuario = localStorage.getItem("nombre") || "Cliente";
  const token = localStorage.getItem("token");
  const [openModal, setOpenModal] = useState(false);
  const [expandedReserva, setExpandedReserva] = useState(null);
  // ---- ESTADOS DE CONTADORES ----
  const [vehiculos, setVehiculos] = useState(0);
  const [reservas, setReservas] = useState(0);
  const [finalizados, setFinalizados] = useState(0);
  const [cotizaciones, setCotizaciones] = useState(0);
  const [reservasDetalle, setReservasDetalle] = useState([]);
  const [stats, setStats] = useState({
    pendiente: 0,
    proceso: 0,
    finalizado: 0,
  });
  const fetchVehiculos = async () => {
    try {
      const res = await fetch("http://localhost:4001/mecanica/vehiculos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setVehiculos(data.length);
    } catch (error) {
      console.error("Error obteniendo vehiculos:", error);
    }
  };

  const fetchReservas = async () => {
    try {
      const res = await fetch(
        "http://localhost:4001/mecanica/reservas/cliente",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setReservas(data.length);
    } catch (error) {
      console.error("Error obteniendo reservas:", error);
    }
  };

  const fetchAsignacionesFinalizadas = async () => {
    try {
      const res = await fetch("http://localhost:4001/mecanica/asignaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const idUsuario = Number(localStorage.getItem("id_usuario"));

      if (Array.isArray(data)) {
        const finalizadosCliente = data.filter((a) => {
          const esFinalizado = a.estado?.toLowerCase() === "finalizado";

          const usuarioAsignacion =
            a.cotizacion?.reserva?.cliente?.usuario?.id_usuario;

          const perteneceCliente = Number(usuarioAsignacion) === idUsuario;

          return esFinalizado && perteneceCliente;
        });

        setFinalizados(finalizadosCliente.length);
      }
    } catch (error) {
      console.error("Error obteniendo asignaciones:", error);
    }
  };

  const fetchCotizaciones = async () => {
    try {
      const res = await fetch(
        "http://localhost:4001/mecanica/cotizaciones-cliente",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setCotizaciones(data.length);
    } catch (error) {
      console.error("Error obteniendo cotizaciones:", error);
    }
  };
  const fetchEstadoServiciosCliente = async () => {
    try {
      const res = await fetch("http://localhost:4001/mecanica/asignaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const idUsuario = Number(localStorage.getItem("id_usuario"));

      if (!Array.isArray(data)) return;

      // Filtrar asignaciones que pertenecen al cliente
      const asignacionesCliente = data.filter((a) => {
        const usuarioAsignacion =
          a.cotizacion?.reserva?.cliente?.usuario?.id_usuario;
        return Number(usuarioAsignacion) === idUsuario;
      });

      let pendiente = 0;
      let proceso = 0;
      let finalizado = 0;

      asignacionesCliente.forEach((a) => {
        const estado = a.estado?.toLowerCase();

        if (estado === "pendiente") pendiente++;
        else if (estado === "en_proceso" || estado === "proceso") proceso++;
        else if (estado === "finalizado") finalizado++;
      });

      // ACTUALIZAR LA GRAFICA
      setStats({
        pendiente,
        proceso,
        finalizado,
      });
    } catch (error) {
      console.error("Error obteniendo estado de servicios:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchVehiculos();
    fetchReservas();
    fetchAsignacionesFinalizadas();
    fetchCotizaciones();
    fetchEstadoServiciosCliente(); // ← NUEVA FUNCIÓN

    const fetchReservasPendientes = async () => {
      try {
        const res = await fetch("http://localhost:4001/mecanica/reservas", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const idUsuario = Number(localStorage.getItem("id_usuario"));

        if (!Array.isArray(data)) return;

        const reservasCliente = data.filter(
          (r) => r.cliente?.usuario?.id_usuario === idUsuario
        );

        const reservasFormat = reservasCliente.map((r) => {
          // --- NORMALIZAR SERVICIOS ---
          let servicios = [];

          if (Array.isArray(r.servicio)) {
            servicios = r.servicio.map((s) => ({
              nombre: s.nombre,
              estado: s.estado?.toLowerCase(),
            }));
          } else if (r.servicio) {
            servicios = [
              {
                nombre: r.servicio.nombre,
                estado: r.servicio.estado?.toLowerCase(),
              },
            ];
          }

          return {
            id: r.id_reserva,
            vehiculo: `${r.vehiculo?.modelo?.nombre || "Vehículo"} ${
              r.vehiculo?.anio || ""
            }`,
            placa: r.vehiculo?.placa || "SIN-PLACA",
            fecha: r.fecha?.split("T")[0],
            estado: r.estado?.toLowerCase() || "pendiente",
            servicios,
          };
        });

        setReservasDetalle(reservasFormat);

        // --- STATS ---
        let p = 0,
          pr = 0,
          f = 0;

        reservasFormat.forEach((r) =>
          r.servicios.forEach((s) => {
            if (s.estado === "pendiente") p++;
            if (s.estado === "proceso") pr++;
            if (s.estado === "finalizado") f++;
          })
        );

        setStats({ pendiente: p, proceso: pr, finalizado: f });
      } catch (error) {
        console.error("Error obteniendo reservas pendientes:", error);
      }
    };

    fetchReservasPendientes();
  }, []);

  const iconEstado = (e) => {
    if (e === "confirmada")
      return <CheckCircle2 className="text-green-400" size={20} />;
    if (e === "pendiente")
      return <Clock className="text-yellow-400" size={20} />;
    return <XCircle className="text-red-400" size={20} />;
  };

  const colorEstado = (e) => {
    if (e === "confirmada")
      return "bg-green-500/20 text-green-300 border-green-500/30";
    if (e === "pendiente")
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  const total = stats.pendiente + stats.proceso + stats.finalizado;

  return (
    <div className="text-white space-y-8 p-4 sm:p-6 min-h-screen">
      <div className="rounded-3xl bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-blue-900/40 p-8 sm:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute -top-20 -right-10 w-60 h-60 bg-violet-600/30 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 blur-3xl"></div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight relative z-10">
          ¡Hola, <span className="text-violet-400">{usuario}</span>! 👋
        </h1>
        <p className="text-white/80 text-base sm:text-lg mt-2 relative z-10 max-w-2xl">
          Bienvenido a tu panel de <b>Automotriz Kleberth</b>. Gestiona tus
          vehículos, reservas y mantenimientos.
        </p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-600/30 text-violet-300">
                <Car size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Vehículos</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">
                  {vehiculos}
                </h2>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-600/30 text-blue-300">
                <CalendarCheck2 size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Reservas</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">
                  {reservas}
                </h2>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-600/30 text-emerald-300">
                <Wrench size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Finalizados</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">
                  {finalizados}
                </h2>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500/30 text-yellow-300">
                <FileText size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Cotizaciones</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">
                  {cotizaciones}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-purple-950/50 p-6 border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-violet-400" size={24} />
            <h2 className="text-xl font-semibold">Estado de Servicios</h2>
          </div>
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90" width="160" height="160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                  />
                  {total > 0 && (
                    <>
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray={`${
                          (stats.finalizado / total) * 440
                        } 440`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="12"
                        strokeDasharray={`${(stats.proceso / total) * 440} 440`}
                        strokeDashoffset={`-${
                          (stats.finalizado / total) * 440
                        }`}
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{total}</span>
                  <span className="text-xs text-white/60">Servicios</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-white/70">Finalizados</span>
                </div>
                <span className="font-semibold">{stats.finalizado}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-white/70">En Proceso</span>
                </div>
                <span className="font-semibold">{stats.proceso}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-white/70">Pendientes</span>
                </div>
                <span className="font-semibold">{stats.pendiente}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-slate-900/50 to-indigo-950/50 p-6 border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarCheck2 className="text-blue-400" size={24} />
            Tus Reservas Recientes
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {reservasDetalle.slice(-10).map((r) => (
              <div
                key={r.id}
                className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {iconEstado(r.estado)}
                      <div>
                        <h3 className="font-semibold">{r.vehiculo}</h3>
                        <p className="text-xs text-white/60">
                          Placa: {r.placa}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/70 mb-3">
                      <span>📅 {r.fecha}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${colorEstado(
                          r.estado
                        )}`}
                      >
                        {r.estado.toUpperCase()}
                      </span>
                    </div>
                    {r.servicios.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-white/50 font-semibold">
                          SERVICIOS:
                        </p>
                        {r.servicios.map((s, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                s.estado === "finalizado"
                                  ? "bg-green-500"
                                  : s.estado === "proceso"
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                              }`}
                            ></div>
                            <span className="text-sm text-white/80">
                              {s.nombre}
                            </span>
                            <span className="text-xs text-white/50 ml-auto">
                              {s.estado === "finalizado"
                                ? "✓ Listo"
                                : s.estado === "proceso"
                                ? "⚙️ En proceso"
                                : "⏳ Pendiente"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setExpandedReserva(expandedReserva === r.id ? null : r.id)
                    }
                    className="text-white/50 hover:text-white transition ml-2"
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        expandedReserva === r.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
                {expandedReserva === r.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm text-white/70">
                    <p>
                      📍 <b>Ubicación:</b> Automotriz Kleberth - Local Principal
                    </p>
                    <p>
                      ⏰ <b>Horario:</b> 9:00 AM - 5:00 PM
                    </p>
                    <p>
                      📞 <b>Contacto:</b> +51 987 654 321
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-slate-900/50 to-purple-950/50 p-6 sm:p-8 border border-white/10 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Recomendaciones para tu vehículo 🔧
        </h2>
        <p className="text-white/70 leading-relaxed max-w-2xl text-sm sm:text-base">
          Mantén tu vehículo en óptimas condiciones revisando niveles, frenos y
          llantas regularmente.
        </p>
        <button
          onClick={() => setOpenModal(true)}
          className="mt-5 flex items-center gap-2 text-violet-300 hover:text-violet-200 transition"
        >
          Ver consejos completos <ChevronRight size={18} />
        </button>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-violet-300">
              Consejos para el cuidado de tu vehículo
            </h2>
            <div className="space-y-4 text-white/80 text-sm leading-relaxed">
              <p>🔧 Mantenimientos cada 6 meses.</p>
              <p>🛢 Cambia el aceite cuando corresponde.</p>
              <p>🚗 Revisa la presión de llantas.</p>
              <p>🧊 Controla el nivel de refrigerante.</p>
              <p>🔋 Inspecciona la batería.</p>
            </div>
            <button
              onClick={() => setOpenModal(false)}
              className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-xl transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
