import { useState } from "react";
import { Car, CalendarCheck2, Wrench, FileText, ChevronRight, X } from "lucide-react";

export default function DashboardInicio() {
  const usuario = localStorage.getItem("nombre") || "Cliente";

  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="text-white space-y-10 animate-fadeIn p-4 sm:p-6">

      {/* ---------- BLOQUE DE BIENVENIDA ---------- */}
      <div className="rounded-3xl bg-gradient-to-br from-[#2a215b] via-[#1c183b] to-[#15132b] 
                      p-8 sm:p-10 shadow-2xl border border-white/10 relative overflow-hidden">

        {/* Glow Decorativo */}
        <div className="absolute -top-20 -right-10 w-60 h-60 bg-violet-600/30 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 blur-[90px]"></div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight relative z-10">
          ¡Hola, <span className="text-violet-400">{usuario}</span>! 👋
        </h1>

        <p className="text-white/80 text-base sm:text-lg mt-2 relative z-10 max-w-2xl">
          Bienvenido a tu panel de <b>Automotriz Kleberth</b>.  
          Gestiona tus vehículos, reservas, mantenimientos y más.
        </p>

        {/* ---------- CARDS RESUMEN ---------- */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 relative z-10">

          {/* CARD 1 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-600/30 text-violet-300">
                <Car size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Vehículos</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">3</h2>
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-600/30 text-blue-300">
                <CalendarCheck2 size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Reservas</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">2</h2>
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-600/30 text-emerald-300">
                <Wrench size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Finalizados</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">5</h2>
              </div>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-lg 
                          hover:bg-white/10 transition group">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500/30 text-yellow-300">
                <FileText size={26} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/60">Cotizaciones</p>
                <h2 className="text-xl sm:text-3xl font-bold mt-1">1</h2>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* ---------- BLOQUE CONSEJOS ---------- */}
      <div className="rounded-3xl bg-[#1d1a38] p-6 sm:p-8 border border-white/10 shadow-xl">

        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Recomendaciones para tu vehículo 🔧
        </h2>

        <p className="text-white/70 leading-relaxed max-w-2xl text-sm sm:text-base">
          Mantén tu vehículo en óptimas condiciones revisando regularmente niveles, frenos y llantas.
          Un mantenimiento preventivo cada 6 meses evita daños mayores.
        </p>

        <button
          onClick={() => setOpenModal(true)}
          className="mt-5 flex items-center gap-2 text-violet-300 hover:text-violet-200 transition"
        >
          Ver consejos completos <ChevronRight size={18} />
        </button>
      </div>


      {/* ---------- MODAL CONSEJOS COMPLETOS ---------- */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          
          <div className="bg-[#1a1735] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 animate-fadeIn shadow-2xl relative">

            {/* Botón cerrar */}
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

              <p>🔧 <b>Realiza mantenimientos preventivos</b> cada 6 meses para evitar averías costosas.</p>

              <p>🛢 <b>Cambia el aceite</b> según la recomendación del fabricante. Un aceite limpio evita desgaste del motor.</p>

              <p>🚗 <b>Revisa la presión de tus llantas</b> al menos una vez al mes. Ayuda al ahorro de combustible y evita accidentes.</p>

              <p>🧊 <b>Controla el nivel de refrigerante</b> para evitar sobrecalentamientos que dañen el motor.</p>

              <p>🔋 <b>Inspecciona la batería</b> cada temporada. Limpia los bornes y verifica que no haya sulfato.</p>

              <p>💡 <b>Chequea luces y frenos</b> regularmente para mantener tu seguridad y la de los demás.</p>

              <p>🛡 <b>No ignores ruidos extraños</b>. Siempre son señales de que algo necesita atención.</p>
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
