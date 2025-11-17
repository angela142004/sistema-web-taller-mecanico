import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Nosotros from "../pages/Nosotros";
import Servicios from "../pages/Servicios";
import Procesos from "../pages/Procesos";
import DashboardAdmin from "../pages/DashboardAdmin";
import DashboardCliente from "../pages/DashboardCliente";
import DashboardMecanico from "../pages/DashboardMecan";
import AppRouter from "../components/dashboard/route/AppRouter";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminRouter from "../components/dashboard/route/AdminRouter";
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

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <PublicLayout>
          <Home />
        </PublicLayout>
      }
    />
    <Route
      path="/register"
      element={
        <PublicLayout>
          <Register />
        </PublicLayout>
      }
    />
    <Route
      path="/nosotros"
      element={
        <PublicLayout>
          <Nosotros />
        </PublicLayout>
      }
    />
    <Route
      path="/servicios"
      element={
        <PublicLayout>
          <Servicios />
        </PublicLayout>
      }
    />
    <Route
      path="/procesos"
      element={
        <PublicLayout>
          <Procesos />
        </PublicLayout>
      }
    />

    {/* Dashboards protegidos: NO usan PublicLayout */}
    <Route
      path="/dashboard/admin/*"
      element={
        <PrivateRoute rol="admin">
          <AdminRouter />
        </PrivateRoute>
      }
    />
    <Route
      path="/dashboard/cliente/*"
      element={
        <PrivateRoute rol="cliente">
          <AppRouter />
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
