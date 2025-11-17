import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Slidebar.jsx";
import Topbar from "../components/Topbar.jsx";

// páginas del admin
import Inicio from "../pages/admin/Inicio.jsx";

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
        <Route index element={<Inicio />} />
        {/* Aquí luego agregas más rutas: usuarios, reportes, etc */}
      </Route>
    </Routes>
  );
}
