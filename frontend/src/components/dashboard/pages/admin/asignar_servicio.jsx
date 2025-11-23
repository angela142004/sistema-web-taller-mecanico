import { useState } from "react";
import {
  Users,
  ClipboardList,
  Wrench,
  ShieldCheck,
  BarChart3,
  ChevronRight,
  X,
} from "lucide-react";

export default function AdminInicio() {
  const adminName = localStorage.getItem("nombre") || "Administrador";

  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="text-white space-y-10 animate-fadeIn p-4 sm:p-6">
      {/* ---------- BLOQUE DE BIENVENIDA ---------- */}
      <div
        className="rounded-3xl bg-gradient-to-br from-[#1b223b] via-[#13182b] to-[#0e1220]
                      p-8 sm:p-10 shadow-2xl border border-white/10 relative overflow-hidden"
      >
        {/* Decoración */}
        <div className="absolute -top-20 -right-10 w-60 h-60 bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 blur-[100px]"></div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight relative z-10">
          Panel de Control – <span className="text-blue-400">{adminName}</span>{" "}
          👋
        </h1>

        <p className="text-white/80 text-base sm:text-lg mt-2 max-w-2xl relative z-10">
          Aquí puedes administrar clientes, mecánicos, reservas, reportes y toda
          la información del taller.
        </p>

        {/* ---------- CARDS RESUMEN ---------- */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
          {/* CLIENTES */}
          <div
            className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-600/30 text-blue-300">
                <Users size={26} />
              </div>
              <div>
                <p className="text-xs text-white/60">Clientes</p>
                <h2 className="text-2xl font-bold mt-1">152</h2>
              </div>
            </div>
          </div>

          {/* RESERVAS ACTIVAS */}
          <div
            className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-600/30 text-emerald-300">
                <ClipboardList size={26} />
              </div>
              <div>
                <p className="text-xs text-white/60">Reservas</p>
                <h2 className="text-2xl font-bold mt-1">24</h2>
              </div>
            </div>
          </div>

          {/* MANTENIMIENTOS */}
          <div
            className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500/30 text-yellow-300">
                <Wrench size={26} />
              </div>
              <div>
                <p className="text-xs text-white/60">En Proceso</p>
                <h2 className="text-2xl font-bold mt-1">8</h2>
              </div>
            </div>
          </div>

          {/* MECÁNICOS */}
          <div
            className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/30 text-purple-300">
                <ShieldCheck size={26} />
              </div>
              <div>
                <p className="text-xs text-white/60">Mecánicos</p>
                <h2 className="text-2xl font-bold mt-1">12</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- ACCESOS RÁPIDOS ---------- */}
      <div className="rounded-3xl bg-[#16182c] p-6 sm:p-8 border border-white/10 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Accesos rápidos ⚡
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl flex justify-between items-center transition">
            Gestionar Clientes <ChevronRight />
          </button>

          <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl flex justify-between items-center transition">
            Ver Reservas <ChevronRight />
          </button>

          <button className="bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl flex justify-between items-center transition">
            Gestión de Mecánicos <ChevronRight />
          </button>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="mt-6 flex items-center gap-2 text-blue-300 hover:text-blue-200 transition"
        >
          Ver estadísticas del taller <BarChart3 size={18} />
        </button>
      </div>

      {/* ---------- MODAL ESTADÍSTICAS ---------- */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#13162b] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 animate-fadeIn shadow-2xl relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-blue-300">
              Estadísticas Generales 📊
            </h2>

            <div className="space-y-4 text-white/80 text-sm leading-relaxed">
              <p>
                📌 <b>Clientes activos:</b> 152
              </p>
              <p>
                🔧 <b>Mantenimientos mensuales:</b> 34
              </p>
              <p>
                📅 <b>Reservas completadas este mes:</b> 19
              </p>
              <p>
                🧰 <b>Mecánicos disponibles:</b> 12
              </p>
              <p>
                💰 <b>Ingresos estimados:</b> S/ 12,500
              </p>
            </div>

            <button
              onClick={() => setOpenModal(false)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
