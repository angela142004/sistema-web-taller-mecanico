import { NavLink } from "react-router-dom";
import {
  Home,
  CalendarCheck2,
  FileText,
  Clock,
  Gauge,
  Settings,
  ChevronRight,
  X,
} from "lucide-react";

const Item = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    end={to === "/cliente"}
    onClick={onClick}
    className={({ isActive }) =>
      `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition
       ${
         isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"
       }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={18} className={isActive ? "text-white" : "text-white/70"} />
        <span>{label}</span>
      </>
    )}
  </NavLink>
);

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* Overlay (solo móvil) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden
        ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer / Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#15132b] border-r border-white/10
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        /* ⬇️ desktop */
        lg:sticky lg:top-0 lg:left-0 lg:z-auto lg:w-64 lg:translate-x-0 lg:h-screen lg:max-h-screen
        flex flex-col`}
        aria-label="Panel de navegación"
      >
        {/* Header SIN línea inferior */}
        <div className="p-4 relative">
          <div className="text-[11px] leading-5 text-white/60 tracking-wide">
            MULTISERVICIOS -<br /> AUTOMOTRIZ KLEBERTH
          </div>
          <button
            onClick={onClose}
            className="lg:hidden absolute right-3 top-3 p-2 rounded-lg hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Menú: ocupa todo el espacio disponible */}
        <nav className="p-3 flex-1 overflow-y-auto space-y-1">
          <Item
            to="/dashboard/cliente"
            icon={Home}
            label="Inicio"
            onClick={onClose}
          />
          <Item
            to="/dashboard/cliente/reservar"
            icon={CalendarCheck2}
            label="Reservar Servicio"
            onClick={onClose}
          />
          <Item
            to="/dashboard/cliente/cotizacion"
            icon={FileText}
            label="Cotización"
            onClick={onClose}
          />
          <Item
            to="/dashboard/cliente/historial"
            icon={Clock}
            label="Consultar historial del servicio"
            onClick={onClose}
          />
          <Item
            to="/dashboard/cliente/vehiculos"
            icon={Gauge}
            label="Mis vehículos"
            onClick={onClose}
          />
          <Item
            to="/dashboard/cliente/configuracion"
            icon={Settings}
            label="Configuración"
            onClick={onClose}
          />
        </nav>

        {/* Tarjeta inferior */}
        <div className="p-3">
          <div className="rounded-2xl bg-[#2a2752] p-4 text-white">
            <p className="text-sm font-semibold">
              “Confianza, rapidez y calidad en el cuidado de tu vehículo.”
            </p>
            <div className="mt-3 flex items-center gap-1 text-white/80">
              <span className="text-xs">más</span>
              <ChevronRight size={16} />
              <ChevronRight size={16} />
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
