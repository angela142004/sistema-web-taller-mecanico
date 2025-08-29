import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Nosotros from "../pages/Nosotros";
import Servicios from "../pages/Servicios";
import Procesos from "../pages/Procesos";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/register" element={<Register />} />
    <Route path="/nosotros" element={<Nosotros />} />
    <Route path="/servicios" element={<Servicios />} />
    <Route path="/procesos" element={<Procesos />} />
  </Routes>
);

export default AppRoutes;
