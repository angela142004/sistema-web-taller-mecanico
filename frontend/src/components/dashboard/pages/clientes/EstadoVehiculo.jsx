import { useEffect, useState } from "react";
import {
  Car,
  Wrench,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

export default function EstadoVehiculo() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setVehiculos([
        {
          id_vehiculo: 1,
          placa: "ABC-123",
          modelo: "Toyota Corolla 2020",
          estado: "en_proceso",
          mecanico: "Carlos Ruiz",
          avance: 65,
          descripcion: "Revisión general y cambio de pastillas de freno",
          ultimaActualizacion: "2025-11-12 10:25 AM",
        },
        {
          id_vehiculo: 2,
          placa: "XYZ-987",
          modelo: "Kia Rio 2018",
          estado: "finalizado",
          mecanico: "Luis Fernández",
          avance: 100,
          descripcion: "Cambio de aceite completado",
          ultimaActualizacion: "2025-11-11 05:40 PM",
        },
        {
          id_vehiculo: 3,
          placa: "JPO-456",
          modelo: "Hyundai Accent 2021",
          estado: "pendiente",
          mecanico: "—",
          avance: 10,
          descripcion: "Esperando confirmación del cliente",
          ultimaActualizacion: "2025-11-10 09:10 AM",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Colores dinámicos
  const estadoColor = {
    pendiente: "bg-yellow-500/80",
    en_proceso: "bg-blue-500/80",
    finalizado: "bg-emerald-600/80",
    cancelado: "bg-rose-600/80",
  };

  const iconoEstado = {
    pendiente: Clock,
    en_proceso: Wrench,
    finalizado: CheckCircle2,
    cancelado: XCircle,
  };

  // ➜ Explicación de cada estado
  const estadoDescripcion = {
    pendiente:
      "Tu solicitud ha sido recibida. El taller está verificando disponibilidad y asignando un mecánico.",
    en_proceso:
      "Un mecánico ya está trabajando activamente en tu vehículo. Puedes seguir el progreso en esta tarjeta.",
    finalizado:
      "El servicio ha sido completado. Tu vehículo está listo para entrega.",
    cancelado:
      "El servicio ha sido cancelado. Si necesitas más información, comunícate con el taller.",
  };

  return (
    <div className="text-white space-y-6">
      <h1 className="text-2xl font-semibold">Estado de mis vehículos</h1>
      <p className="text-white/70 text-sm mb-4">
        Aquí puedes consultar el progreso y estado actual de tus vehículos en el taller.
      </p>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
          Cargando información…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-600/50 bg-rose-600/10 p-6 text-center text-rose-400 flex items-center justify-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
          No tienes vehículos registrados.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehiculos.map((v) => {
            const Icono = iconoEstado[v.estado] || Car;

            return (
              <div
                key={v.id_vehiculo}
                className="rounded-2xl border border-white/10 bg-[#1d1a38] shadow-xl p-5 flex flex-col justify-between transition hover:bg-[#221e45]/90"
              >
                {/* Encabezado */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold">{v.modelo}</h2>
                    <p className="text-sm text-white/70">Placa: {v.placa}</p>
                  </div>
                  <div className={`p-2 rounded-full ${estadoColor[v.estado]}`}>
                    <Icono size={18} />
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm text-white/80 mb-3">{v.descripcion}</p>

                {/* Estado Explicado */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="text-white/70" size={16} />
                    <span className="text-xs text-white/60 uppercase tracking-wide">
                      Estado actual: {v.estado.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 leading-5">
                    {estadoDescripcion[v.estado]}
                  </p>
                </div>

                {/* Barra de progreso */}
                <div className="w-full h-2 bg-white/10 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-2 ${estadoColor[v.estado]} transition-all duration-700`}
                    style={{ width: `${v.avance}%` }}
                  />
                </div>

                {/* Estado + mecánico */}
                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${estadoColor[v.estado]}`}
                  >
                    {v.estado.replace("_", " ")}
                  </span>
                  <span className="text-white/70">
                    👨‍🔧 {v.mecanico || "No asignado"}
                  </span>
                </div>

                {/* Última actualización */}
                <p className="mt-3 text-xs text-white/50">
                  Última actualización: {v.ultimaActualizacion}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
