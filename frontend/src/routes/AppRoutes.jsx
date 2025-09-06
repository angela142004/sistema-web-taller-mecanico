import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Nosotros from "../pages/Nosotros";
import Servicios from "../pages/Servicios";
import Procesos from "../pages/Procesos";
import DashboardAdmin from "../pages/DashboardAdmin";
import DashboardCliente from "../pages/DashboardCliente";
import DashboardMecanico from "../pages/DashboardMecan";

// Función para proteger rutas según rol
const PrivateRoute = ({ children, rol }) => {
  const userRol = localStorage.getItem("rol"); // lo guardaste en el login
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (rol && userRol !== rol) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/register" element={<Register />} />
    <Route path="/nosotros" element={<Nosotros />} />
    <Route path="/servicios" element={<Servicios />} />
    <Route path="/procesos" element={<Procesos />} />

    {/* Dashboards protegidos */}
    <Route
      path="/dashboard/admin"
      element={
        <PrivateRoute rol="admin">
          <DashboardAdmin />
        </PrivateRoute>
      }
    />
    <Route
      path="/dashboard/cliente"
      element={
        <PrivateRoute rol="cliente">
          <DashboardCliente />
        </PrivateRoute>
      }
    />
    <Route
      path="/dashboard/mecanico"
      element={
        <PrivateRoute rol="mecanico">
          <DashboardMecanico />
        </PrivateRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
