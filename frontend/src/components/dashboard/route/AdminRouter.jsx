import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/SlidebarAdmin.jsx";
import Topbar from "../components/TopbarAdmin.jsx";

// páginas del admin
import Home from "../pages/admin/Inicio.jsx";
import Servicio from "../pages/admin/asignar_servicio.jsx"
import Cotizaciones from "../pages/admin/cotizaciones.jsx";
import Repuestos  from "../pages/admin/repuestos.jsx"
import Registro from "../pages/admin/registro.jsx";
import Historial from "../pages/admin/historial.jsx"
import Configuracion from "../pages/admin/configuracion.jsx";
import Reserva from "../pages/admin/reserva.jsx";
import Progreso from "../pages/admin/progreso.jsx";


function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // cerrar al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // cerrar con ESC
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

export default function AdminRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Home />} />
        <Route path="servicio" element={<Servicio />} />
        <Route path="cotizaciones" element={<Cotizaciones />} />
        <Route path="repuestos" element={<Repuestos />} />
        <Route path="registro" element={<Registro />} />
        <Route path="historial" element={<Historial />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="reserva" element={<Reserva />} />
        <Route path="progreso" element={<Progreso />} />



      </Route>
    </Routes>
  );
}
