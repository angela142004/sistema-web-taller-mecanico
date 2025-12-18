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
  Download,
  Save,
  ChevronLeft,
  Printer,
  History,
  X,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

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

  // --- ESTADOS PARA REPUESTOS Y ALERTAS (traídos desde backend) ---
  const [topRepuestos, setTopRepuestos] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const REPUESTO_STOCK_MINIMO = 30;
  // --- FIN REPUESTOS ---

  // --- ESTADOS PARA COSTOS / COTIZACIONES ---
  const [costosSemanal, setCostosSemanal] = useState([]);
  const [costosMensual, setCostosMensual] = useState([]);
  // --- FIN COSTOS ---

  // ========== FUNCIÓN PARA CARGAR TODO ==========
  const fetchDashboardAdmin = async () => {
    try {
      // -----------------------------------
      // 1️⃣ CLIENTES
      // -----------------------------------
      const resClientes = await fetch(`${API}/mecanica/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataClientes = await resClientes.json();

      const clientesFiltrados = dataClientes.filter((u) => u.rol === "cliente");

      setClientes(clientesFiltrados.length);

      // -----------------------------------
      // 2️⃣ RESERVAS (todas)
      // -----------------------------------
      const resReservas = await fetch(`${API}/mecanica/reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataReservas = await resReservas.json();
      setReservas(Array.isArray(dataReservas) ? dataReservas.length : 0);

      // -----------------------------------
      // 3️⃣ ASIGNACIONES EN PROCESO
      // -----------------------------------
      const resAsignaciones = await fetch(`${API}/mecanica/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const dataAsignaciones = await resAsignaciones.json();

      const enProcesoList = dataAsignaciones.filter(
        (a) => a.estado?.toLowerCase() === "en_proceso"
      );

      setEnProceso(enProcesoList.length);

      // -----------------------------------
      // 4️⃣ MECÁNICOS
      // -----------------------------------
      const resMecanicos = await fetch(`${API}/mecanica/users`, {
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

  // Estados para historial semanal
  const [semanaActual, setSemanaActual] = useState(null);
  const [historialSemanas, setHistorialSemanas] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);

  // Función para obtener el rango de la semana actual
  const obtenerRangoSemana = (fecha = new Date()) => {
    const dia = fecha.getDay();
    const diff = dia === 0 ? -6 : 1 - dia; // Lunes como inicio

    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() + diff);
    lunes.setHours(0, 0, 0, 0);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);

    return { lunes, domingo };
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Inicializar semana actual
  useEffect(() => {
    const { lunes, domingo } = obtenerRangoSemana();
    setSemanaActual({
      inicio: lunes,
      fin: domingo,
      numero: getNumeroSemana(lunes),
    });

    // Cargar historial del storage
    cargarHistorial();
  }, []);

  // Función para obtener número de semana del año
  const getNumeroSemana = (fecha) => {
    const inicioAno = new Date(fecha.getFullYear(), 0, 1);
    const dias = Math.floor((fecha - inicioAno) / (24 * 60 * 60 * 1000));
    return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
  };

  // Helper: obtener el lunes de la semana 'week' en el año 'year'
  const getMondayOfWeek = (week, year) => {
    // Intento robusto compatible para la UI (no exige ISO-week exacto)
    const firstJan = new Date(year, 0, 1);
    const day = firstJan.getDay(); // 0..6 (Dom..Sab)
    // Calcular primer lunes del año
    const firstMondayOffset = day <= 1 ? 1 - day : 8 - day;
    const firstMonday = new Date(firstJan);
    firstMonday.setDate(firstJan.getDate() + firstMondayOffset);
    // Avanzar (week-1) semanas desde el primer lunes
    const target = new Date(firstMonday);
    target.setDate(firstMonday.getDate() + (week - 1) * 7);
    target.setHours(0, 0, 0, 0);
    return target;
  };

  // Cargar historial desde backend y mapear al formato que usa la UI
  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API}/mecanica/cotizaciones/historial`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        // intentar leer body de error para debugging
        const errBody = await res.text().catch(() => null);
        console.error(
          "[cargarHistorial] respuesta no OK:",
          res.status,
          errBody
        );
        setHistorialSemanas([]);
        return;
      }

      const registros = await res.json();
      if (!Array.isArray(registros)) {
        setHistorialSemanas([]);
        return;
      }

      // Mapear cada registro DB al formato que espera la UI
      const mapped = registros.map((r) => {
        const semanaNum = Number(r.semana) || 0;
        const anioNum = Number(r.anio) || new Date().getFullYear();

        // calcular fechas inicio/fin a partir de semana+anio
        const inicioDate = getMondayOfWeek(semanaNum || 1, anioNum);
        const finDate = new Date(inicioDate);
        finDate.setDate(inicioDate.getDate() + 6);

        return {
          id_historial: r.id_historial,
          numero: semanaNum,
          anio: anioNum,
          inicio: inicioDate.toISOString(),
          fin: finDate.toISOString(),
          datos: r.datos || [], // ya es JSON en DB
          totalCosto: Number(r.total ?? 0),
          totalCotizaciones: Number(r.total_cotizaciones ?? 0),
          creado_en: r.creado_en,
        };
      });

      setHistorialSemanas(mapped);
    } catch (err) {
      console.error("Error cargando historial desde backend:", err);
      setHistorialSemanas([]);
    }
  };

  // Guardar semana actual en backend (POST)
  const guardarSemanaActual = async () => {
    if (!semanaActual) return;

    const payload = {
      semana: semanaActual.numero,
      anio: semanaActual.inicio.getFullYear(),
      datos: costosSemanal,
      total: Number(costosSemanal.reduce((acc, d) => acc + d.costo, 0)),
      totalCotizaciones: Number(
        costosSemanal.reduce((acc, d) => acc + d.cotizaciones, 0)
      ),
    };

    try {
      const res = await fetch(`${API}/mecanica/cotizaciones/historial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al guardar semana en servidor");
      }

      alert("✅ Semana guardada en servidor correctamente");
      await cargarHistorial();
    } catch (error) {
      console.error("Error al guardar semana en backend:", error);
      alert("❌ Error al guardar la semana en servidor");
    }
  };
  // 🆕 FUNCIÓN PARA ELIMINAR SEMANA DEL HISTORIAL
  const eliminarSemanaHistorial = async (idHistorial) => {
    if (!confirm("¿Estás seguro de eliminar esta semana del historial?")) {
      return;
    }

    try {
      const res = await fetch(
        `${API}/mecanica/cotizaciones/historial-semanas/${idHistorial}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error al eliminar semana");
      }

      alert("✅ Semana eliminada correctamente");
      await cargarHistorial();

      // Si estábamos viendo los detalles de la semana eliminada, cerrar el modal
      if (semanaSeleccionada?.id_historial === idHistorial) {
        setSemanaSeleccionada(null);
      }
    } catch (error) {
      console.error("Error al eliminar semana:", error);
      alert("❌ Error al eliminar la semana");
    }
  };

  // Función para imprimir reporte
  const imprimirReporte = (datosSemana = null) => {
    const datos = datosSemana || {
      inicio: semanaActual.inicio.toISOString(),
      fin: semanaActual.fin.toISOString(),
      numero: semanaActual.numero,
      datos: costosSemanal,
      totalCosto: costosSemanal.reduce((acc, d) => acc + d.costo, 0),
      totalCotizaciones: costosSemanal.reduce(
        (acc, d) => acc + d.cotizaciones,
        0
      ),
    };

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Semanal - Semana ${datos.numero}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1e40af;
            margin: 0;
          }
          .info-box {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #3b82f6;
            color: white;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .total-box {
            background: #10b981;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔧 Taller Mecánico - Reporte Semanal</h1>
          <p style="font-size: 18px; color: #666;">Semana ${
            datos.numero
          } del ${formatearFecha(new Date(datos.inicio))} al ${formatearFecha(
      new Date(datos.fin)
    )}</p>
        </div>

        <div class="info-box">
          <h3>📊 Resumen Ejecutivo</h3>
          <p><strong>Total de Cotizaciones:</strong> ${
            datos.totalCotizaciones
          }</p>
          <p><strong>Ingreso Total:</strong> $${datos.totalCosto.toLocaleString(
            "es-PE",
            { minimumFractionDigits: 2 }
          )}</p>
          <p><strong>Promedio por Cotización:</strong> $${(
            datos.totalCosto / datos.totalCotizaciones
          ).toFixed(2)}</p>
        </div>

        <h3>📅 Detalle Diario</h3>
        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Cotizaciones</th>
              <th>Costo Total</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
            ${datos.datos
              .map(
                (d) => `
              <tr>
                <td><strong>${d.dia}</strong></td>
                <td>${d.cotizaciones}</td>
                <td>$${d.costo.toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                })}</td>
                <td>$${(d.costo / d.cotizaciones).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-box">
          <h2 style="margin: 0;">💰 Total de la Semana: $${datos.totalCosto.toLocaleString(
            "es-PE",
            { minimumFractionDigits: 2 }
          )}</h2>
        </div>

        <div class="footer">
          <p>Reporte generado el ${new Date().toLocaleString("es-PE")}</p>
          <p>Sistema de Gestión - Taller Mecánico</p>
        </div>

        <script>
          window.onload = () => window.print();
        </script>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  const datosActuales =
    selectedPeriod === "semanal" ? costosSemanal : costosMensual;
  const maxCosto = datosActuales.length
    ? Math.max(...datosActuales.map((d) => d.costo))
    : 1;

  // Datos de ejemplo para otras secciones
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

      const res = await fetch(`${API}/mecanica/reservas`, {
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
        fecha: r.fecha,
        tiempo: tiempoRelativo(r.fecha),
      }));

      // ORDENAR POR FECHA RECIENTE
      actividades.sort(
        (a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)
      );

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

  // Estado para rendimiento semanal dinámico
  const [rendimientoSemanal, setRendimientoSemanal] = useState([]);

  // Helper: parsear fechaRaw como FECHA LOCAL (sin efecto timezone)
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

  // ------------------
  // fetchCostos: construye costosSemanal y costosMensual
  // ------------------
  const fetchCostos = async () => {
    try {
      const res = await fetch(`${API}/mecanica/cotizaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setCostosSemanal([]);
        setCostosMensual([]);
        return;
      }
      const raw = await res.json();
      const cotizaciones = Array.isArray(raw) ? raw : raw.cotizaciones || [];

      const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      const mapaDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

      const semanalAcum = Object.fromEntries(
        diasSemana.map((d) => [d, { costo: 0, cotizaciones: 0 }])
      );
      const mensualAcum = {
        "Semana 1": { costo: 0, cotizaciones: 0 },
        "Semana 2": { costo: 0, cotizaciones: 0 },
        "Semana 3": { costo: 0, cotizaciones: 0 },
        "Semana 4": { costo: 0, cotizaciones: 0 },
      };

      cotizaciones.forEach((cot) => {
        const fechaRaw = cot.fecha || cot.createdAt || cot.fecha_creacion;
        const fechaLocal = parseFechaComoLocal(fechaRaw);
        if (!fechaLocal) return;

        const diaTexto = mapaDias[fechaLocal.getDay()];

        const diaDelMes = fechaLocal.getDate();
        let numeroSemana = Math.ceil(diaDelMes / 7);
        numeroSemana = Math.min(Math.max(1, numeroSemana), 4);
        const semanaTexto = `Semana ${numeroSemana}`;

        const total =
          cot.total && typeof cot.total === "object" && cot.total.toNumber
            ? cot.total.toNumber()
            : Number(cot.total ?? 0);

        semanalAcum[diaTexto].costo += total;
        semanalAcum[diaTexto].cotizaciones += 1;

        if (mensualAcum[semanaTexto]) {
          mensualAcum[semanaTexto].costo += total;
          mensualAcum[semanaTexto].cotizaciones += 1;
        }
      });

      const semanalArray = diasSemana.map((dia) => ({
        dia,
        costo: Math.round(semanalAcum[dia].costo * 100) / 100,
        cotizaciones: semanalAcum[dia].cotizaciones,
      }));

      const mensualArray = Object.keys(mensualAcum).map((sem) => ({
        semana: sem,
        costo: Math.round(mensualAcum[sem].costo * 100) / 100,
        cotizaciones: mensualAcum[sem].cotizaciones,
      }));

      setCostosSemanal(semanalArray);
      setCostosMensual(mensualArray);
    } catch (err) {
      console.error("Error cargando costos:", err);
      setCostosSemanal([]);
      setCostosMensual([]);
    }
  };
  // ------------------

  // Función para obtener rendimiento desde el backend (robusta contra formatos)
  const fetchRendimientoSemanal = async () => {
    try {
      const res = await fetch(`${API}/mecanica/cotizaciones`, {
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
    // cargar tanto rendimiento como costos
    fetchRendimientoSemanal();
    fetchCostos();
    cargarHistorial();
    fetchRepuestos();
  }, []);

  // --- REPUESTOS: cargar top y alertas desde backend ---
  const fetchRepuestos = async () => {
    try {
      const res = await fetch(`${API}/mecanica/repuestos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error cargando repuestos");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];

      // top: los de menor stock (urgentes)
      const top = arr
        .slice()
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5)
        .map((r, i) => ({
          nombre: r.descripcion,
          uso: Math.max(0, 100 - r.stock), // heurística
          cambio: "+0%",
          tipo: r.stock <= REPUESTO_STOCK_MINIMO ? "aumento" : "disminucion",
          stock: r.stock,
          marca: r.marca?.nombre || "",
        }));

      setTopRepuestos(top);

      const alertas = arr
        .filter((r) => r.stock <= REPUESTO_STOCK_MINIMO)
        .map((r) => ({
          producto: r.descripcion,
          stock: r.stock,
          minimo: REPUESTO_STOCK_MINIMO,
          marca: r.marca?.nombre || "",
        }));
      setAlertasStock(alertas);
    } catch (err) {
      console.error("Error fetchRepuestos:", err);
      setTopRepuestos([]);
      setAlertasStock([]);
    }
  };

  // Cargar historial y repuestos al montar
  useEffect(() => {
    cargarHistorial();
    fetchRepuestos();
  }, []);

  return (
    <div className="text-white space-y-6 animate-fadeIn p-4 sm:p-6 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* BLOQUE DE BIENVENIDA */}
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

        {/* CARDS RESUMEN */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          <DashboardCard
            icon={<Users size={26} />}
            color="bg-blue-600/30 text-blue-300"
            title="Clientes"
            value={clientes}
            trend="+12%"
          />
          <DashboardCard
            icon={<ClipboardList size={26} />}
            color="bg-emerald-600/30 text-emerald-300"
            title="Reservas"
            value={reservas}
            trend="+8%"
          />
          <DashboardCard
            icon={<Wrench size={26} />}
            color="bg-yellow-500/30 text-yellow-300"
            title="En Proceso"
            value={enProceso}
            trend="0%"
          />
          <DashboardCard
            icon={<ShieldCheck size={26} />}
            color="bg-purple-500/30 text-purple-300"
            title="Mecánicos"
            value={mecanicos}
            trend="+2"
          />
        </div>
      </div>

      {/* SECCIÓN: ACTIVIDAD EN TIEMPO REAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-[#0f172a] p-6 border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
              <Zap className="text-cyan-400" size={24} />
              Actividad en Tiempo Real
            </h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {actividadReciente.map((item) => (
              <div
                key={item.id}
                className="bg-[#1e293b] hover:bg-[#243447] border border-white/5 p-4 rounded-xl transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
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
                    <div>
                      <p className="font-semibold text-white">{item.cliente}</p>
                      <p className="text-sm text-white/60">{item.servicio}</p>
                      <span
                        className={`inline-block px-2 py-1 mt-1 rounded-md text-xs font-medium capitalize ${
                          item.estado === "completado"
                            ? "bg-emerald-600/20 text-emerald-300"
                            : item.estado === "en_proceso"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-600/20 text-blue-300"
                        }`}
                      >
                        {item.estado.replace("_", " ")}
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

      {/* CONTROL DE COSTOS Y COTIZACIONES - MEJORADO */}
      <div className="rounded-3xl bg-[#16182c] p-6 sm:p-8 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
              <DollarSign className="text-green-400" size={26} />
              Control de Costos por Cotizaciones
            </h2>
            {semanaActual && (
              <p className="text-sm text-white/60 mt-1">
                📅 Semana {semanaActual.numero}:{" "}
                {formatearFecha(semanaActual.inicio)} -{" "}
                {formatearFecha(semanaActual.fin)}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
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
            <button
              onClick={() => setMostrarHistorial(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition flex items-center gap-2"
            >
              <History size={16} />
              Historial
            </button>
          </div>
        </div>

        {/* Acciones rápidas */}
        {selectedPeriod === "semanal" && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={guardarSemanaActual}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Save size={18} />
              Guardar Semana Actual
            </button>
            <button
              onClick={() => imprimirReporte()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer size={18} />
              Imprimir Reporte
            </button>
          </div>
        )}

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
                .toLocaleString("es-PE", { minimumFractionDigits: 2 })}
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
                        $
                        {item.costo.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })}
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
                        {isFinite(porcentaje)
                          ? Math.round(porcentaje) + "%"
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Historial */}
      {mostrarHistorial && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16182c] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <History className="text-blue-400" size={28} />
                Historial de Semanas
              </h2>
              <button
                onClick={() => setMostrarHistorial(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {historialSemanas.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <History size={48} className="mx-auto mb-4 opacity-30" />
                <p>No hay semanas guardadas en el historial</p>
                <p className="text-sm mt-2">
                  Guarda la semana actual para comenzar tu registro
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historialSemanas.map((semana, index) => (
                  <div
                    key={index}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-xl transition cursor-pointer"
                    onClick={() => setSemanaSeleccionada(semana)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Semana {semana.numero} -{" "}
                          {new Date(semana.inicio).getFullYear()}
                        </h3>
                        <p className="text-sm text-white/60">
                          {formatearFecha(new Date(semana.inicio))} -{" "}
                          {formatearFecha(new Date(semana.fin))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          $
                          {semana.totalCosto.toLocaleString("es-PE", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-white/50">
                          {semana.totalCotizaciones} cotizaciones
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          imprimirReporte(semana);
                        }}
                        className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                      >
                        <Printer size={16} />
                        Imprimir
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSemanaSeleccionada(semana);
                        }}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                      >
                        <ChevronRight size={16} />
                        Ver Detalles
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarSemanaHistorial(semana.id_historial);
                        }}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-300 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalles de Semana Seleccionada */}
      {semanaSeleccionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#16182c] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="text-green-400" size={28} />
                  Semana {semanaSeleccionada.numero} -{" "}
                  {new Date(semanaSeleccionada.inicio).getFullYear()}
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  {formatearFecha(new Date(semanaSeleccionada.inicio))} -{" "}
                  {formatearFecha(new Date(semanaSeleccionada.fin))}
                </p>
              </div>
              <button
                onClick={() => setSemanaSeleccionada(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 p-4 rounded-xl">
                <p className="text-sm text-white/70 mb-1">Total Generado</p>
                <p className="text-2xl font-bold text-white">
                  $
                  {semanaSeleccionada.totalCosto.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-4 rounded-xl">
                <p className="text-sm text-white/70 mb-1">Cotizaciones</p>
                <p className="text-2xl font-bold text-white">
                  {semanaSeleccionada.totalCotizaciones}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-4 rounded-xl">
                <p className="text-sm text-white/70 mb-1">Promedio</p>
                <p className="text-2xl font-bold text-white">
                  $
                  {(
                    semanaSeleccionada.totalCosto /
                    semanaSeleccionada.totalCotizaciones
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tabla de datos diarios */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">Detalle Diario</h3>
              <div className="space-y-3">
                {semanaSeleccionada.datos.map((dia, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                        <span className="font-bold text-white">{dia.dia}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {dia.cotizaciones} cotizaciones
                        </p>
                        <p className="text-xs text-white/60">
                          Promedio: ${(dia.costo / dia.cotizaciones).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-400">
                      $
                      {dia.costo.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de impresión */}
            <button
              onClick={() => imprimirReporte(semanaSeleccionada)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer size={18} />
              Imprimir Reporte Completo
            </button>
          </div>
        </div>
      )}

      {/* ANÁLISIS DE INVENTARIO */}
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
            {alertasStock.length === 0 ? (
              <div className="text-white/60">No hay alertas de stock</div>
            ) : (
              alertasStock.map((a, i) => (
                <AlertCard
                  key={i}
                  nivel={
                    a.stock <= Math.floor(a.minimo * 0.5) ? "critico" : "bajo"
                  }
                  producto={a.producto}
                  stock={a.stock}
                  minimo={a.minimo}
                  marca={a.marca}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE DE CARD REUTILIZABLE
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

// COMPONENTE DE ALERTA DE STOCK
function AlertCard({ nivel, producto, stock, minimo, marca }) {
  const nivelConfig = {
    critico: {
      bg: "from-red-500/20 to-red-600/20",
      border: "border-red-500/40",
      icon: "bg-red-500/30 text-red-400",
      text: "CRITICO",
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
