import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Nosotros from "../pages/Nosotros";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/register" element={<Register />} />
    <Route path="/nosotros" element={<Nosotros />} />
  </Routes>
);

export default AppRoutes;
