import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Slidebar.jsx";
import Topbar from "../components/Topbar.jsx";

// páginas
import Home from "../pages/clientes/Home.jsx";
import ReservarServicio from "../pages/clientes/ReservarServicio.jsx";
import Cotizacion from "../pages/clientes/Cotizacion.jsx";
import HistorialServicio from "../pages/clientes/HistorialServicio.jsx";
import EstadoVehiculo from "../pages/clientes/EstadoVehiculo.jsx";
import Configuracion from "../pages/clientes/Configuracion.jsx";
import NotFound from "../pages/clientes/NotFound.jsx";
import MiVehiculo from "../pages/clientes/MiVehiculo.jsx";

function ClientLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // cerrar al cambiar de ruta y con ESC
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f2e] via-[#0a0e29] to-[#090d1f]">
      <div className="flex">
        <Sidebar isOpen={open} onClose={() => setOpen(false)} />
        <main className="flex-1 min-h-screen">
          <Topbar onOpenSidebar={() => setOpen(true)} />
          <div className="px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route index element={<Home />} />
        <Route path="reservar" element={<ReservarServicio />} />
        <Route path="cotizacion" element={<Cotizacion />} />
        <Route path="historial" element={<HistorialServicio />} />
        <Route path="estado" element={<EstadoVehiculo />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="vehiculos" element={<MiVehiculo />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
