import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/register" element={<Register />} />
  </Routes>
);

export default AppRoutes;
