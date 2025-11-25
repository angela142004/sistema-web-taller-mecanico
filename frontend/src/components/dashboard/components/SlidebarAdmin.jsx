import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  CalendarCheck2,
  FileText,
  Clock,
  Gauge,
  ClipboardCheck,
  Settings,
  ChevronRight,
  X,
  Car,
  Wrench,
  Users,
  Boxes,
} from "lucide-react";

// ================= ITEM =================
const Item = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200
        ${isActive ? "bg-white/10 text-white font-medium" : "text-white/80 hover:bg-white/5"}`}
    >
      {/* Indicador lateral violeta */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-r-md bg-[#8b5cf6] transition-all duration-300
          ${isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`}
      />
      <Icon size={18} className={isActive ? "text-white" : "text-white/70"} />
      <span>{label}</span>
    </NavLink>
  );
};

// ================= SIDEBAR =================
export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden
        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-[#15132b] border-r border-white/10
        flex flex-col shadow-[4px_0_10px_rgba(0,0,0,0.25)]
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:z-auto`}
      >
        {/* Encabezado */}
        <div className="p-4 relative shrink-0 border-b border-white/5">
          <div className="text-[11px] leading-5 text-white/60 tracking-wide">
            ADMINISTRADOR - <br /> MULTISERVICIOS AUTOMOTRIZ KLEBERTH
          </div>
          <button
            onClick={onClose}
            className="lg:hidden absolute right-3 top-3 p-2 rounded-lg hover:bg-white/10"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-3 flex-1 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3a3370] scrollbar-track-transparent">

          <Item to="/dashboard/admin" icon={Home} label="Inicio" onClick={onClose} />

          <Item to="/dashboard/admin/reserva" icon={CalendarCheck2} label="Reservas" onClick={onClose} />

          <Item to="/dashboard/admin/cotizaciones" icon={FileText} label="Cotizaciones" onClick={onClose} />

          <Item to="/dashboard/admin/servicio" icon={Wrench} label="Asignar Mecánico" onClick={onClose} />

          <Item to="/dashboard/admin/progreso" icon={Gauge} label="Progreso de Vehículos" onClick={onClose} />

          <Item to="/dashboard/admin/repuestos" icon={Car} label="Inventario de Repuestos" onClick={onClose} />

          <Item to="/dashboard/admin/registro" icon={Users} label="Gestión de Usuarios" onClick={onClose} />

          <Item to="/dashboard/admin/historial" icon={Clock} label="Historial" onClick={onClose} />

          <Item to="/dashboard/admin/configuracion" icon={Settings} label="Configuración" onClick={onClose} />

        </nav>

        {/* Tarjeta inferior */}
        <div className="p-3 mt-auto border-t border-white/5">
          <div className="rounded-2xl bg-[#2a2752] p-4 text-white shadow-inner">
            <p className="text-sm font-semibold leading-snug">
              “Gestiona con eficiencia, controla con facilidad.”
            </p>
            <div className="mt-3 flex items-center gap-1 text-white/80">
              <span className="text-xs">más</span>
              <ChevronRight size={14} />
              <ChevronRight size={14} />
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64 transition-all duration-300"></div>
    </>
  );
}
