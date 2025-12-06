import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/SlidebarMecanico.jsx";
import Topbar from "../components/TopbarMecanico.jsx";

// Páginas mecánico
import Home from "../pages/mecanico/Home.jsx"; // Página principal para mecánico
import HistorialServicios from "../pages/mecanico/HistorialServicios.jsx"; // Historial de servicios realizados
import Perfil from "../pages/mecanico/Perfil.jsx"; // Perfil del mecánico
import ServiciosAsignados from "../pages/mecanico/ServiciosAsignados.jsx"; // Servicios asignados al mecánico
import Progreso from "../pages/mecanico/Progreso.jsx";

function MecanicoLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cerrar al cambiar de ruta y con ESC
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

export default function MecanicoRouter() {
  return (
    <Routes>
      <Route element={<MecanicoLayout />}>
        <Route index element={<Home />} />
        <Route path="historial" element={<HistorialServicios />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="servicios-asignados" element={<ServiciosAsignados />} />
        <Route path="progreso" element={<Progreso />} />
      </Route>
    </Routes>
  );
}
