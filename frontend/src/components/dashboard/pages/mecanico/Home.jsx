import { useState } from "react";
import { Car, Wrench, CheckCircle, ChevronRight, X } from "lucide-react";

export default function DashboardInicio() {
  const usuario = localStorage.getItem("nombre") || "Mecánico";
  const serviciosAsignados = localStorage.getItem("serviciosAsignados") || 5;
  const serviciosFinalizados = localStorage.getItem("serviciosFinalizados") || 3;

  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="text-white space-y-10 animate-fadeIn p-4 sm:p-6">

      {/* ---------- BLOQUE DE BIENVENIDA ---------- */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#292c44] to-[#15162c] p-8 sm:p-10 shadow-xl border border-white/20 relative overflow-hidden">

        {/* Glow Decorativo */}
        <div className="absolute -top-16 -right-12 w-64 h-64 bg-purple-600/40 blur-[130px]"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 blur-[100px]"></div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight relative z-10">
          ¡Bienvenido, <span className="text-indigo-400">{usuario}</span>! 👋
        </h1>

        <p className="text-white/80 text-base sm:text-lg mt-2 relative z-10 max-w-2xl">
          Eres parte esencial de <b>Automotriz Kleberth</b>. Aquí podrás gestionar los servicios asignados y finalizados para mantener nuestros vehículos en excelente estado.
        </p>

        {/* ---------- CARDS DE SERVICIOS ---------- */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          
          {/* CARD 1 - Servicios Asignados */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 transition group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-600/30 text-violet-300">
                <Car size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Servicios Asignados</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">{serviciosAsignados}</h2>
              </div>
            </div>
          </div>

          {/* CARD 2 - Servicios Finalizados */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg hover:bg-white/10 transition group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-600/30 text-emerald-300">
                <CheckCircle size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Servicios Finalizados</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">{serviciosFinalizados}</h2>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ---------- BLOQUE CONSEJOS PARA EL MECÁNICO ---------- */}
      <div className="rounded-3xl bg-[#202040] p-6 sm:p-8 border border-white/10 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Consejos para ti como Mecánico 🔧
        </h2>
        <p className="text-white/70 leading-relaxed max-w-2xl text-sm sm:text-base">
          Mantén siempre la seguridad como prioridad. Aquí te dejamos algunos consejos para realizar tu trabajo de manera más eficiente y segura.
        </p>
        <button
          onClick={() => setOpenModal(true)}
          className="mt-5 flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition"
        >
          Ver más consejos <ChevronRight size={18} />
        </button>
      </div>

      {/* ---------- MODAL CONSEJOS COMPLETOS ---------- */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1735] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 animate-fadeIn shadow-2xl relative">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-indigo-300">
              Consejos para mejorar tu trabajo
            </h2>

            <div className="space-y-4 text-white/80 text-sm leading-relaxed">
              <p>🔧 <b>Revisa las herramientas</b> antes de comenzar cualquier servicio. Asegúrate de que estén en buen estado.</p>
              <p>🧰 <b>Organiza tu área de trabajo</b>. Un espacio limpio y ordenado facilita las reparaciones.</p>
              <p>⚠️ <b>Usa siempre equipo de protección</b> para evitar accidentes.</p>
              <p>🔧 <b>Mantén un registro detallado</b> de los trabajos realizados para un mejor seguimiento.</p>
              <p>🛠 <b>Realiza mantenimiento preventivo</b> en las herramientas y equipos que utilizas.</p>
              <p>🔌 <b>Verifica las conexiones eléctricas</b> antes de realizar cualquier reparación relacionada con el sistema eléctrico del vehículo.</p>
              <p>📝 <b>Comunica cualquier hallazgo importante</b> al cliente para evitar problemas futuros.</p>
            </div>

            <button
              onClick={() => setOpenModal(false)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

