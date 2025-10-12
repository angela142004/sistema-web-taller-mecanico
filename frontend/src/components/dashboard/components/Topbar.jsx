import { MessageSquareText, Bell, Search, Menu } from "lucide-react";

export default function Topbar({ onOpenSidebar = () => {} }) {
  return (
    <header
      className="sticky top-0 z-40 h-16 w-full border-b border-white/10
                 bg-gradient-to-b from-black/10 to-transparent backdrop-blur-sm
                 flex items-center justify-between px-4 sm:px-6"
    >
      {/* Botón hamburguesa (móvil) */}
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10"
        aria-label="Abrir menú"
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* Acciones derecha */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="p-2 rounded-xl text-white hover:bg-white/10">
          <MessageSquareText size={18} className="text-white" />
        </button>
        <button className="p-2 rounded-xl text-white hover:bg-white/10">
          <Bell size={18} className="text-white" />
        </button>

        <div className="relative hidden sm:block">
          <input
            placeholder="buscar"
            className="pl-3 pr-9 h-9 rounded-xl bg-white/5 border border-white/10
                       focus:outline-none focus:ring-2 focus:ring-white/20
                       text-sm placeholder:text-white/50 text-white"
          />
          <Search
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
          />
        </div>

        <div className="ml-1 w-8 h-8 rounded-full bg-white/20 grid place-items-center">
          <span className="text-[11px] text-white">👤</span>
        </div>
      </div>
    </header>
  );
}
