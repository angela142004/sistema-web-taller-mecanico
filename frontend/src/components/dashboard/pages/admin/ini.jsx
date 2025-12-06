import { useState, useEffect } from "react";
import {
  Users,
  ClipboardList,
  Wrench,
  ShieldCheck,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  Activity,
  Zap,
  DollarSign,
  Package,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AdminInicio() {
  const adminName = localStorage.getItem("nombre") || "Administrador";
  const token = localStorage.getItem("token");

  const [selectedPeriod, setSelectedPeriod] = useState("semanal");

  // ----------- ESTADOS PRINCIPALES -----------
  const [clientes, setClientes] = useState(0);
  const [reservas, setReservas] = useState(0);
  const [enProceso, setEnProceso] = useState(0);
  const [mecanicos, setMecanicos] = useState(0);

  const [loading, setLoading] = useState(true);

  // ========== FUNCIÓN PARA CARGAR TODO ==========
  const fetchDashboardAdmin = async () => {
    try {
      // -----------------------------------
      // 1️⃣ CLIENTES
      // -----------------------------------
      const resClientes = await fetch("http://localhost:4001/mecanica/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataClientes = await resClientes.json();

      const clientesFiltrados = dataClientes.filter((u) => u.rol === "cliente");

      setClientes(clientesFiltrados.length);

      // -----------------------------------
      // 2️⃣ RESERVAS (todas)
      // -----------------------------------
      const resReservas = await fetch(
        "http://localhost:4001/mecanica/reservas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const dataReservas = await resReservas.json();
      setReservas(Array.isArray(dataReservas) ? dataReservas.length : 0);

      // -----------------------------------
      // 3️⃣ ASIGNACIONES EN PROCESO
      // -----------------------------------
      const resAsignaciones = await fetch(
        "http://localhost:4001/mecanica/asignaciones",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dataAsignaciones = await resAsignaciones.json();

      const enProcesoList = dataAsignaciones.filter(
        (a) => a.estado?.toLowerCase() === "en_proceso"
      );

      setEnProceso(enProcesoList.length);

      // -----------------------------------
      // 4️⃣ MECÁNICOS
      // -----------------------------------
      const resMecanicos = await fetch("http://localhost:4001/mecanica/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataMecanicos = await resMecanicos.json();

      const filtradosMecanicos = dataMecanicos.filter(
        (u) => u.rol === "mecanico"
      );

      setMecanicos(filtradosMecanicos.length);
    } catch (error) {
      console.error("Error cargando dashboard admin:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar al cargar
  useEffect(() => {
    fetchDashboardAdmin();
  }, []);

  const tiempoRelativo = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diff = (ahora - fecha) / 1000; // segundos

    if (diff < 60) return `Hace ${Math.floor(diff)} seg`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;

    const dias = Math.floor(diff / 86400);
    return `Hace ${dias} día${dias > 1 ? "s" : ""}`;
  };

  // -------- ACTIVIDAD RECIENTE ----------
  const [actividadReciente, setActividadReciente] = useState([]);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4001/mecanica/reservas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!Array.isArray(data)) return;

      // Transformar cada reserva en un evento del dashboard
      const actividades = data.map((r) => ({
        id: r.id_reserva,
        cliente: r.cliente?.usuario?.nombre || "Cliente desconocido",
        servicio: r.servicio?.nombre || "Servicio",
        estado: r.estado?.toLowerCase() || "pendiente",
        tiempo: tiempoRelativo(r.fecha),
      }));

      // ORDENAR POR FECHA RECIENTE
      actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setActividadReciente(actividades);
    } catch (error) {
      console.error("Error obteniendo reservas:", error);
    }
  };

  useEffect(() => {
    fetchReservas();

    // Auto-refresh cada 20 segundos
    const interval = setInterval(fetchReservas, 20000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchReservas();

    // Refresh automático cada 20 segundos
    const interval = setInterval(fetchReservas, 20000);
    return () => clearInterval(interval);
  }, []);

  // Estado para rendimiento semanal dinámico
  const [rendimientoSemanal, setRendimientoSemanal] = useState([]);

  // Helper: parsear fecha y devolver Date en horario LOCAL (sin efectos timezone)
  function parseFechaComoLocal(fechaRaw) {
    if (!fechaRaw) return null;

    // Si ya es Date
    if (fechaRaw instanceof Date) {
      return new Date(
        fechaRaw.getFullYear(),
        fechaRaw.getMonth(),
        fechaRaw.getDate()
      );
    }

    // Intentar extraer YYYY-MM-DD del string (funciona con "YYYY-MM-DD" y "YYYY-MM-DDTHH:MM:SS..." y con "...Z")
    const m = String(fechaRaw).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      return new Date(y, mo, d); // crea fecha en LOCAL timezone a las 00:00 local
    }

    // Fallback: intentar construir Date y convertir a local date (por si viene otro formato)
    const d = new Date(fechaRaw);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    return null;
  }

  // Función para obtener rendimiento desde el backend (robusta contra formatos)
  const fetchRendimientoSemanal = async () => {
    try {
      const res = await fetch("http://localhost:4001/mecanica/cotizaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      console.log("Backend:", result);

      const data = Array.isArray(result) ? result : result.cotizaciones || [];

      // Días en orden LUN -> DOM para mostrar
      const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      const conteo = Object.fromEntries(diasSemana.map((d) => [d, 0]));

      // Mapa getDay() -> texto día
      const mapaDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

      data.forEach((cot) => {
        // usa exactamente el campo `fecha` de tu schema
        const fechaRaw = cot.fecha || cot.createdAt || cot.fecha_creacion;
        const fechaLocal = parseFechaComoLocal(fechaRaw);

        if (!fechaLocal) {
          console.warn("Fecha inválida/ignorada:", fechaRaw, cot);
          return;
        }

        const indice = fechaLocal.getDay(); // ahora correctamente basado en fecha local
        const diaTexto = mapaDias[indice];
        conteo[diaTexto] = (conteo[diaTexto] || 0) + 1;
      });

      const max = Math.max(...Object.values(conteo), 1);

      const resultado = diasSemana.map((dia) => ({
        dia,
        servicios: conteo[dia] || 0,
        progreso: Math.round((conteo[dia] / max) * 100),
      }));

      console.log("Resultado final (rendimientoSemanal):", resultado);
      setRendimientoSemanal(resultado);
    } catch (error) {
      console.error("Error cargando rendimiento semanal:", error);
    }
  };

  // Llamar al cargar el componente
  useEffect(() => {
    fetchRendimientoSemanal();
  }, []);

  // estados para costos
  const [costosSemanal, setCostosSemanal] = useState([]);
  const [costosMensual, setCostosMensual] = useState([]);

  // helper: parsear fechaRaw como FECHA LOCAL (sin efecto timezone)
  function parseFechaComoLocal(fechaRaw) {
    if (!fechaRaw) return null;

    // si ya es Date -> normalizar a local (sin hora)
    if (fechaRaw instanceof Date) {
      return new Date(
        fechaRaw.getFullYear(),
        fechaRaw.getMonth(),
        fechaRaw.getDate()
      );
    }

    const s = String(fechaRaw);

    // extraer YYYY-MM-DD si existe al inicio (sirve para "YYYY-MM-DD" y "YYYY-MM-DDTHH:MM:SS...")
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      return new Date(y, mo, d); // aquí se crea en midnight local, sin shift UTC
    }

    // fallback: intentar construir Date y convertir a local date
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    // si todo falla
    return null;
  }

  // función corregida para obtener costos (usa parseFechaComoLocal)
  const fetchCostos = async () => {
    try {
      const res = await fetch("http://localhost:4001/mecanica/cotizaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = await res.json();
      const cotizaciones = Array.isArray(raw) ? raw : raw.cotizaciones || [];

      // Días para orden semanal
      const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      const mapaDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

      // inicializar acumuladores
      const semanalCosto = Object.fromEntries(
        diasSemana.map((d) => [d, { costo: 0, cotizaciones: 0 }])
      );
      const mensualCosto = {
        "Semana 1": { costo: 0, cotizaciones: 0 },
        "Semana 2": { costo: 0, cotizaciones: 0 },
        "Semana 3": { costo: 0, cotizaciones: 0 },
        "Semana 4": { costo: 0, cotizaciones: 0 },
      };

      cotizaciones.forEach((cot) => {
        // usar el campo fecha de tu schema
        const fechaRaw = cot.fecha || cot.createdAt || cot.fecha_creacion;
        const fechaLocal = parseFechaComoLocal(fechaRaw);
        if (!fechaLocal) {
          console.warn("Fecha inválida (ignorada):", fechaRaw, cot);
          return;
        }

        // día de la semana (local)
        const diaTexto = mapaDias[fechaLocal.getDay()]; // "Lun", etc

        // semana del mes (1..5), capear a 4 para mantener 4 semanas
        const diaDelMes = fechaLocal.getDate(); // 1..31
        let numeroSemana = Math.ceil(diaDelMes / 7); // 1..5
        numeroSemana = Math.min(Math.max(1, numeroSemana), 4); // forzar 1..4
        const semanaTexto = `Semana ${numeroSemana}`;

        // total (prisma decimal puede venir como string) -> number seguro
        const total =
          typeof cot.total === "object" && cot.total?.toNumber
            ? cot.total.toNumber()
            : Number(cot.total || 0);

        // acumular
        semanalCosto[diaTexto].costo += total;
        semanalCosto[diaTexto].cotizaciones += 1;

        if (mensualCosto[semanaTexto]) {
          mensualCosto[semanaTexto].costo += total;
          mensualCosto[semanaTexto].cotizaciones += 1;
        }
      });

      // convertir a arrays en el orden esperado
      const semanalArray = diasSemana.map((dia) => ({
        dia,
        costo: Math.round(semanalCosto[dia].costo * 100) / 100, // redondeo 2 decimales
        cotizaciones: semanalCosto[dia].cotizaciones,
      }));

      const mensualArray = Object.keys(mensualCosto).map((semana) => ({
        semana,
        costo: Math.round(mensualCosto[semana].costo * 100) / 100,
        cotizaciones: mensualCosto[semana].cotizaciones,
      }));

      setCostosSemanal(semanalArray);
      setCostosMensual(mensualArray);
    } catch (error) {
      console.error("Error cargando costos:", error);
    }
  };

  // Llamar al cargar el componente (y cuando cambie token, si aplica)
  useEffect(() => {
    fetchCostos();
  }, []);

  const datosActuales =
    selectedPeriod === "semanal" ? costosSemanal : costosMensual;
  const maxCosto = Math.max(...datosActuales.map((d) => d.costo));

  // Top repuestos más utilizados
  const topRepuestos = [
    { nombre: "Filtro de Aceite", uso: 45, cambio: "+12%", tipo: "aumento" },
    { nombre: "Pastillas de Freno", uso: 38, cambio: "+8%", tipo: "aumento" },
    { nombre: "Bujías", uso: 32, cambio: "-5%", tipo: "disminucion" },
    { nombre: "Amortiguadores", uso: 28, cambio: "+15%", tipo: "aumento" },
    { nombre: "Batería", uso: 22, cambio: "+3%", tipo: "aumento" },
  ];

  return (
    <div className="text-white space-y-6 animate-fadeIn p-4 sm:p-6 min-h-screen">
      {/* ---------- BLOQUE DE BIENVENIDA ---------- */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1b223b] via-[#13182b] to-[#0e1220] p-8 sm:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute -top-20 -right-10 w-60 h-60 bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 blur-[100px]"></div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Panel de Control –{" "}
              <span className="text-blue-400">{adminName}</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg mt-2 max-w-2xl">
              Gestión inteligente de tu taller mecánico
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Activity className="text-green-400 animate-pulse" size={20} />
            <div>
              <p className="text-xs text-white/60">Estado del sistema</p>
              <p className="text-sm font-semibold text-green-400">Operativo</p>
            </div>
          </div>
        </div>

        {/* ---------- CARDS RESUMEN ---------- */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <DashboardCard
            icon={<Users size={26} />}
            color="bg-blue-600/30 text-blue-300"
            title="Clientes"
            value={loading ? "..." : clientes}
            trend="+12%"
          />

          <DashboardCard
            icon={<ClipboardList size={26} />}
            color="bg-emerald-600/30 text-emerald-300"
            title="Reservas"
            value={loading ? "..." : reservas}
            trend="+8%"
          />

          <DashboardCard
            icon={<Wrench size={26} />}
            color="bg-yellow-500/30 text-yellow-300"
            title="En Proceso"
            value={loading ? "..." : enProceso}
            trend="0%"
          />

          <DashboardCard
            icon={<ShieldCheck size={26} />}
            color="bg-purple-500/30 text-purple-300"
            title="Mecánicos"
            value={loading ? "..." : mecanicos}
            trend="+2"
          />
        </div>
      </div>

      {/* ---------- SECCIÓN: ACTIVIDAD EN TIEMPO REAL ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente */}
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0f172a] p-6 border border-white/5 shadow-2xl shadow-black/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
              <Zap className="text-cyan-400" size={24} />
              Actividad en Tiempo Real
            </h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            {actividadReciente.map((item) => (
              <div
                key={item.id}
                className="bg-[#1e293b] hover:bg-[#243447] border border-white/5 p-4 rounded-xl transition group shadow-lg shadow-black/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Ícono + fondo (colores mejorados) */}
                    <div
                      className={`p-2 rounded-lg ${
                        item.estado === "completado"
                          ? "bg-emerald-500/15"
                          : item.estado === "en_proceso"
                          ? "bg-amber-500/15"
                          : "bg-blue-500/15"
                      }`}
                    >
                      {item.estado === "completado" ? (
                        <CheckCircle2 className="text-emerald-400" size={20} />
                      ) : item.estado === "en_proceso" ? (
                        <Clock className="text-amber-300" size={20} />
                      ) : (
                        <Calendar className="text-blue-300" size={20} />
                      )}
                    </div>

                    {/* Información */}
                    <div>
                      <p className="font-semibold text-white">{item.cliente}</p>
                      <p className="text-sm text-white/60">{item.servicio}</p>

                      {/* Estado (nuevo color badge pro) */}
                      <span
                        className={`inline-block px-2 py-1 mt-1 rounded-md text-xs font-medium capitalize ${
                          item.estado === "completado"
                            ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/20"
                            : item.estado === "en_proceso"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/20"
                            : "bg-blue-600/20 text-blue-300 border border-blue-500/20"
                        }`}
                      >
                        {item.estado}
                      </span>

                      <p className="text-xs text-white/40 mt-1">
                        {item.tiempo}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className="text-white/40 group-hover:text-white/80 transition"
                    size={20}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rendimiento Semanal */}
        <div className="rounded-3xl bg-[#16182c] p-6 border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="text-green-400" size={22} />
            Rendimiento Semanal
          </h2>

          <div className="space-y-4">
            {rendimientoSemanal.map((dia) => (
              <div key={dia.dia}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/80 font-medium">
                    {dia.dia}
                  </span>
                  <span className="text-sm text-white/60">
                    {dia.servicios} servicios
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${dia.progreso}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- CONTROL DE COSTOS Y COTIZACIONES ---------- */}
      <div className="rounded-3xl bg-[#16182c] p-6 sm:p-8 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <DollarSign className="text-green-400" size={26} />
            Control de Costos por Cotizaciones
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod("semanal")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedPeriod === "semanal"
                  ? "bg-green-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setSelectedPeriod("mensual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedPeriod === "mensual"
                  ? "bg-green-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {/* Resumen de costos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/70">
                Total {selectedPeriod === "semanal" ? "Semanal" : "Mensual"}
              </p>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">
              $
              {datosActuales
                .reduce((acc, d) => acc + d.costo, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-green-400 mt-1">
              +18.5% vs período anterior
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/70">Total Cotizaciones</p>
              <ClipboardList className="text-blue-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">
              {datosActuales.reduce((acc, d) => acc + d.cotizaciones, 0)}
            </p>
            <p className="text-xs text-blue-400 mt-1">
              +12% vs período anterior
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/70">Promedio por Cotización</p>
              <BarChart3 className="text-purple-400" size={20} />
            </div>
            <p className="text-3xl font-bold text-white">
              $
              {Math.round(
                datosActuales.reduce((acc, d) => acc + d.costo, 0) /
                  datosActuales.reduce((acc, d) => acc + d.cotizaciones, 0)
              )}
            </p>
            <p className="text-xs text-purple-400 mt-1">
              +5% vs período anterior
            </p>
          </div>
        </div>

        {/* Gráfico de barras interactivo */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6 text-white/90">
            Costos por {selectedPeriod === "semanal" ? "Día" : "Semana"}
          </h3>

          <div className="space-y-5">
            {datosActuales.map((item, index) => {
              const label =
                selectedPeriod === "semanal" ? item.dia : item.semana;
              const porcentaje = (item.costo / maxCosto) * 100;

              return (
                <div key={index} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white/80">
                      {label}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-400">
                        ${item.costo.toLocaleString()}
                      </span>
                      <span className="text-xs text-white/50 ml-2">
                        ({item.cotizaciones} cotizaciones)
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full bg-white/5 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-700 flex items-center justify-end px-3 group-hover:brightness-110"
                      style={{ width: `${porcentaje}%` }}
                    >
                      <span className="text-xs font-bold text-white/90">
                        {Math.round(porcentaje)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------- ANÁLISIS DE INVENTARIO ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Repuestos */}
        <div className="rounded-3xl bg-[#16182c] p-6 border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package className="text-orange-400" size={24} />
            Repuestos Más Utilizados
          </h2>

          <div className="space-y-4">
            {topRepuestos.map((repuesto, index) => (
              <div
                key={index}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-white">
                      {repuesto.nombre}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        repuesto.tipo === "aumento"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {repuesto.cambio}
                    </span>
                    {repuesto.tipo === "aumento" ? (
                      <ArrowUpRight className="text-green-400" size={16} />
                    ) : (
                      <ArrowDownRight className="text-red-400" size={16} />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${(repuesto.uso / 45) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-white/60 min-w-[60px] text-right">
                    {repuesto.uso} usos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="rounded-3xl bg-[#16182c] p-6 border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingDown className="text-red-400" size={24} />
            Alertas de Inventario
          </h2>

          <div className="space-y-4">
            <AlertCard
              nivel="bajo"
              producto="Amortiguador Trasero Izquierdo"
              stock={10}
              minimo={15}
              marca="Toyota"
            />
            <AlertCard
              nivel="critico"
              producto="Pastillas de Freno Delanteras"
              stock={20}
              minimo={30}
              marca="Ford"
            />
            <AlertCard
              nivel="bajo"
              producto="Bujía de Encendido Iridium"
              stock={30}
              minimo={40}
              marca="Honda"
            />
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Package className="text-red-400" size={20} />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">
                  Reabastecimiento Recomendado
                </p>
                <p className="text-sm text-white/70">
                  3 productos requieren pedido urgente para mantener el stock
                  óptimo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===============================================
// COMPONENTE DE CARD REUTILIZABLE
// ===============================================
function DashboardCard({ icon, color, title, value, trend }) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 hover:scale-105 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp size={14} />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-white/60 mb-1">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
    </div>
  );
}

// ===============================================
// COMPONENTE DE ALERTA DE STOCK
// ===============================================
function AlertCard({ nivel, producto, stock, minimo, marca }) {
  const nivelConfig = {
    critico: {
      bg: "from-red-500/20 to-red-600/20",
      border: "border-red-500/40",
      icon: "bg-red-500/30 text-red-400",
      text: "CRÍTICO",
    },
    bajo: {
      bg: "from-yellow-500/20 to-orange-600/20",
      border: "border-yellow-500/40",
      icon: "bg-yellow-500/30 text-yellow-400",
      text: "BAJO",
    },
  };

  const config = nivelConfig[nivel];

  return (
    <div
      className={`bg-gradient-to-br ${config.bg} border ${config.border} p-4 rounded-xl`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${config.icon}`}
            >
              {config.text}
            </span>
            <span className="text-xs text-white/50">{marca}</span>
          </div>
          <p className="font-semibold text-white text-sm">{producto}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60">Stock actual</p>
          <p className="text-lg font-bold text-white">{stock} unidades</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">Mínimo requerido</p>
          <p className="text-lg font-bold text-white/80">{minimo} unidades</p>
        </div>
      </div>
    </div>
  );
}
