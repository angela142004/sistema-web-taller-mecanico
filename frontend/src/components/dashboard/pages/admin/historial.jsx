import { useState, useEffect } from "react";
import { Search, History, Car, User, Wrench, ChevronDown } from "lucide-react";

export default function HistorialServiciosPage() {
  const [historial, setHistorial] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("servicio");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // ============================
  // 🔥 Obtener historial desde backend
  // ============================
  const fetchHistorial = async (busqueda = "") => {
    try {
      const token = localStorage.getItem("token");

      let url = "";

      if (busqueda.trim() === "") {
        url = "http://localhost:4001/mecanica/historial/admin";
      } else {
        url = `http://localhost:4001/mecanica/historial/buscar?${tipoFiltro}=${encodeURIComponent(
          busqueda
        )}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = await response.json();

      // =====================================
      // 🔥 Normalizar datos si vienen de /buscar
      // =====================================
      data = data.map((h) => {
        // Si ya vienen planos (del admin), no tocar
        if (h.vehiculo) return h;

        const asign = h.asignacion;
        const res = asign.cotizacion.reserva;

        return {
          id_historial: h.id_historial,
          fecha: h.fecha,
          vehiculo: `${res.vehiculo.modelo.nombre} ${res.vehiculo.modelo.marca.nombre}`,
          mecanico: asign.mecanico.usuario.nombre,
          cliente: res.cliente.usuario.nombre,
          servicio: res.servicio.nombre,
          costo: asign.cotizacion.total,
          estado: h.estado,
        };
      });

      setHistorial(data);
    } catch (error) {
      console.error("Error obteniendo historial:", error);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  // ============================
  // 🔍 Buscar mientras escribe
  // ============================
  const handleSearch = (value) => {
    setFiltroBusqueda(value);
    fetchHistorial(value);
  };

  // ============================
  // 🔥 Solo mostrar finalizados
  // ============================
  // 🔥 Si estoy buscando → NO filtrar por finalizado
  const historialMostrado =
    filtroBusqueda.trim() === ""
      ? historial.filter((r) => r.estado?.toLowerCase() === "finalizado")
      : historial;

  const formatFecha = (date) =>
    new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <History size={28} className="text-blue-400" /> Historial de Servicios
        Finalizados
      </h2>

      {/* ============================ */}
      {/* Barra de búsqueda + selector */}
      {/* ============================ */}
      <div className="flex gap-3 items-center mb-6">
        {/* Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={`Buscar por ${tipoFiltro}...`}
            value={filtroBusqueda}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 pl-10 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"
          />
        </div>

        {/* Selector de filtro */}
        <div className="relative">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20"
          >
            Buscar por:{" "}
            <span className="font-semibold capitalize">{tipoFiltro}</span>
            <ChevronDown size={16} />
          </button>

          {menuAbierto && (
            <div className="absolute w-full bg-white/10 backdrop-blur border border-white/20 rounded-xl mt-2 shadow-md z-20">
              {["servicio", "mecanico", "cliente", "vehiculo"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setTipoFiltro(opt);
                    setMenuAbierto(false);
                    fetchHistorial(filtroBusqueda); // actualiza en vivo
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-white/20 text-white capitalize"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================ */}
      {/* TABLA DESKTOP */}
      {/* ============================ */}
      <div className="hidden md:block overflow-x-auto bg-white/10 rounded-xl shadow-lg border border-white/20">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/15">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase">
                Vehículo
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase">
                Mecánico
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase">
                Servicio
              </th>
              <th className="px-6 py-3 text-xs font-medium text-white/70 uppercase">
                Costo
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {historialMostrado.map((h, index) => (
              <tr key={h.id_historial} className="hover:bg-white/5">
                <td className="px-6 py-4 text-white">{index + 1}</td>

                <td className="px-6 py-4 text-yellow-300">
                  {formatFecha(h.fecha)}
                </td>
                <td className="px-6 py-4 text-white">{h.vehiculo}</td>
                <td className="px-6 py-4 text-white">{h.mecanico}</td>
                <td className="px-6 py-4 text-white">{h.cliente}</td>
                <td className="px-6 py-4 text-blue-300 font-medium">
                  {h.servicio}
                </td>
                <td className="px-6 py-4 text-green-400 font-bold">
                  $ {h.costo}
                </td>
              </tr>
            ))}

            {historialMostrado.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-6 text-center text-white/70">
                  No se encontraron servicios finalizados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ============================ */}
      {/* VISTA MÓVIL */}
      {/* ============================ */}
      <div className="md:hidden space-y-4">
        {historialMostrado.map((h) => (
          <div
            key={h.id_historial}
            className="bg-white/10 p-4 rounded-xl border border-white/20 shadow-md space-y-2"
          >
            <p className="text-xs text-white/70 flex items-center gap-1">
              <History size={14} />
              <span className="text-yellow-300 font-semibold">
                Finalizado: {formatFecha(h.fecha)}
              </span>
            </p>

            <p className="text-sm text-white flex items-center gap-1">
              <Car size={14} /> {h.vehiculo}
            </p>

            <p className="text-sm text-white flex items-center gap-1">
              <Wrench size={14} /> {h.mecanico}
            </p>

            <p className="text-sm text-white flex items-center gap-1">
              <User size={14} /> Cliente: {h.cliente}
            </p>

            <p className="text-sm text-blue-300">Servicio: {h.servicio}</p>

            <p className="text-lg text-green-400 font-bold">
              Total: $ {h.costo}
            </p>
          </div>
        ))}

        {historialMostrado.length === 0 && (
          <div className="text-center p-6 text-white/70 border border-white/10 rounded-xl">
            No se encontraron servicios finalizados.
          </div>
        )}
      </div>
    </div>
  );
}
