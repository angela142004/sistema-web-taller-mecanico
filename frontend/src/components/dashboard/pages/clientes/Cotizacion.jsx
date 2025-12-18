import { useState, useEffect } from "react";
import {
  Car,
  Wrench,
  Info,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CotizacionCliente() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token") || "";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [error, setError] = useState("");

  // 🔍 Buscador
  const [search, setSearch] = useState("");

  // 📄 Paginador
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 4;

  const ejemplos = [
    {
      id_cotizacion: 5001,
      total: 350,
      estado: "COTIZADO",
      reserva: {
        vehiculo: {
          placa: "JHK-909",
          modelo: { nombre: "Hilux", marca: { nombre: "Toyota" } },
        },
        servicio: { nombre: "Revisión de frenos" },
      },
    },
  ];

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    try {
      const res = await fetch(`${API}/mecanica/cotizaciones-cliente`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setError("No se pudieron cargar las cotizaciones");
        setCotizaciones([]);
        return;
      }

      const data = await res.json();
      setCotizaciones(data.length ? [...data].reverse() : []); // 👈 SIN EJEMPLOS
    } catch {
      setError("No se pudieron cargar las cotizaciones");
      setCotizaciones([]); // 👈 SIN EJEMPLOS
    }
  };

  const aprobarCotizacion = async (id) => {
    try {
      const res = await fetch(
        `${API}/mecanica/cotizaciones-cliente/${id}/aprobar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) return alert("No se pudo aprobar");

      alert("Cotización aprobada");
      cargarCotizaciones();
    } catch {
      alert("Error al aprobar");
    }
  };

  const rechazarCotizacion = async (id) => {
    try {
      const res = await fetch(
        `${API}/mecanica/cotizaciones-cliente/${id}/rechazar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ motivo: "El cliente rechazó la cotización" }),
        }
      );

      if (!res.ok) return alert("No se pudo rechazar");

      alert("Cotización rechazada");
      cargarCotizaciones();
    } catch {
      alert("Error al rechazar");
    }
  };

  // ============================
  // 🔍 FILTRO POR BUSCADOR
  // ============================
  const cotizacionesFiltradas = cotizaciones.filter((c) => {
    const texto = search.toLowerCase();
    return (
      c.reserva.vehiculo.placa.toLowerCase().includes(texto) ||
      c.reserva.vehiculo.modelo.nombre.toLowerCase().includes(texto) ||
      c.reserva.vehiculo.modelo.marca.nombre.toLowerCase().includes(texto) ||
      c.reserva.servicio.nombre.toLowerCase().includes(texto) ||
      c.estado.toLowerCase().includes(texto)
    );
  });

  // ============================
  // 📄 PAGINACIÓN
  // ============================
  const totalPaginas = Math.ceil(cotizacionesFiltradas.length / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const visibles = cotizacionesFiltradas.slice(inicio, inicio + porPagina);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPaginaActual(nueva);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-600/50 text-red-300 flex gap-2">
          <Info size={18} />
          {error}
        </div>
      )}

      {/* 🔍 BUSCADOR */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Buscar por placa, servicio, marca, estado..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginaActual(1);
          }}
          className="w-full p-3 pl-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
          size={18}
        />
      </div>

      {/* LISTA */}
      {visibles.length === 0 ? (
        <p className="text-center text-white/50">
          No se encontraron resultados.
        </p>
      ) : (
        visibles.map((c) => (
          <section
            key={c.id_cotizacion}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
          >
            {/* VEHÍCULO */}
            <div className="flex items-center gap-2 text-white font-semibold">
              <Car size={18} />
              {c.reserva.vehiculo.modelo.marca.nombre}{" "}
              {c.reserva.vehiculo.modelo.nombre} — {c.reserva.vehiculo.placa}
            </div>

            {/* SERVICIO */}
            <p className="text-white/80 flex gap-2 items-center">
              <Wrench size={18} />
              Servicio:{" "}
              <span className="text-white">{c.reserva.servicio.nombre}</span>
            </p>

            {/* PRECIO */}
            <p className="text-purple-300 font-bold text-lg">
              Total cotizado: S/ {c.total}
            </p>

            {/* ESTADO */}
            <p className="text-white/70 text-sm">
              Estado:{" "}
              <span
                className={
                  c.estado === "CONFIRMADO"
                    ? "text-green-400"
                    : c.estado === "RECHAZADO"
                    ? "text-red-400"
                    : "text-yellow-300"
                }
              >
                {c.estado}
              </span>
            </p>

            {(c.estado === "PENDIENTE" || c.estado === "COTIZADO") && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => aprobarCotizacion(c.id_cotizacion)}
                  className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-green-600/20 border border-green-600/40 text-green-300 hover:bg-green-600/30"
                >
                  <Check size={18} />
                  Aprobar
                </button>

                <button
                  onClick={() => rechazarCotizacion(c.id_cotizacion)}
                  className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-red-600/20 border border-red-600/40 text-red-300 hover:bg-red-600/30"
                >
                  <X size={18} />
                  Rechazar
                </button>
              </div>
            )}
          </section>
        ))
      )}

      {/* PAGINADOR */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-2 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-white">
            Página {paginaActual} de {totalPaginas}
          </span>

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="p-2 bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
