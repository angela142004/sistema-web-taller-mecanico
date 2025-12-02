import { useState, useEffect } from "react";
import { Car, Wrench, Info, Check, X } from "lucide-react";

export default function CotizacionCliente() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:4001";
  const token = localStorage.getItem("token") || "";

  const [cotizaciones, setCotizaciones] = useState([]);
  const [error, setError] = useState("");

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
        setError("No se pudieron cargar las cotizaciones (mostrando ejemplos)");
        setCotizaciones(ejemplos);
        return;
      }

      const data = await res.json();
      setCotizaciones(data.length ? data : ejemplos);
    } catch {
      setError("No se pudieron cargar las cotizaciones (mostrando ejemplos)");
      setCotizaciones(ejemplos);
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
          body: JSON.stringify({
            motivo: "El cliente rechazó la cotización",
          }),
        }
      );

      if (!res.ok) return alert("No se pudo rechazar");

      alert("Cotización rechazada");
      cargarCotizaciones();
    } catch {
      alert("Error al rechazar");
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

      {/* LISTA */}
      {cotizaciones.map((c) => (
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

          {/* BOTONES SOLO SI ESTÁ PENDIENTE O COTIZADO */}
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
      ))}
    </div>
  );
}
