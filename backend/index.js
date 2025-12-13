// ===============================
// ✅ PARCHE BigInt → String (DEBE IR PRIMERO)
// ===============================
BigInt.prototype.toJSON = function () {
  return this.toString();
};

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Rutas y controladores
import userRoutes from "./src/routes/user.routes.js";
import vehiculosRoutes from "./src/routes/vehiculos.routes.js";
import marcasRoutes from "./src/routes/marcas.routes.js";
import modelosRoutes from "./src/routes/modelos.routes.js";
import serviciosRoutes from "./src/routes/servicios.routes.js";
import reservasRoutes from "./src/routes/reservas.routes.js";
import { getServicios } from "./src/controllers/servicios.controller.js";
import { config } from "./src/config/env.js";

import cotizacionesRoutes from "./src/routes/cotizacion.routes.js";
import cotizacionClienteRoutes from "./src/routes/cotizacion.cliente.routes.js";

// ⭐ NUEVOS
import mecanicosRoutes from "./src/routes/mecanicos.routes.js";
import asignacionesRoutes from "./src/routes/asignacion.routes.js";
import asignacionClienteRoutes from "./src/routes/asignacion.cliente.routes.js";
import historialRoutes from "./src/routes/historial.routes.js";
import repuestosRoutes from "./src/routes/repuestos.routes.js";

dotenv.config();

const app = express();

// ===============================
// 📁 CONFIGURACIÓN __dirname
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// 🌐 CORS CONFIG
// ===============================
const corsOptions = {
  origin: config.corsOrigin,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ===============================
// 📌 MIDDLEWARES
// ===============================
app.use(morgan("dev"));
app.use(express.json());

// 📂 Hacer pública la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log general de API
app.use("/mecanica", (req, res, next) => {
  console.log(`[API LOG] ${req.method} ${req.originalUrl} - from ${req.ip}`);
  next();
});

// ===============================
// 🚏 RUTAS
// ===============================

app.use("/mecanica", userRoutes);

app.use("/mecanica/vehiculos", vehiculosRoutes);
app.use("/mecanica/marcas", marcasRoutes);
app.use("/mecanica/modelos", modelosRoutes);
app.use("/mecanica/servicios", serviciosRoutes);
app.use("/mecanica/reservas", reservasRoutes);

app.use("/mecanica/cotizaciones", cotizacionesRoutes);
app.use("/mecanica/cotizaciones-cliente", cotizacionClienteRoutes);

// 👨‍🔧 ADMIN/MECÁNICO
app.use("/mecanica/mecanicos", mecanicosRoutes);
app.use("/mecanica/asignaciones", asignacionesRoutes);
app.use("/mecanica/repuestos", repuestosRoutes);
// 👤 CLIENTE
app.use("/mecanica/asignaciones-cliente", asignacionClienteRoutes);
app.use("/mecanica/historial", historialRoutes);

// Fallback servicios
app.get("/mecanica/servicios", getServicios);

// Endpoint base
app.get("/mecanica", (req, res) => {
  res.json({
    ok: true,
    message: "API /mecanica running",
    endpoints: [
      "/mecanica/marcas",
      "/mecanica/modelos",
      "/mecanica/vehiculos",
      "/mecanica/servicios",
      "/mecanica/reservas",
      "/mecanica/login",
      "/mecanica/cotizaciones",
      "/mecanica/cotizaciones-cliente",
      "/mecanica/mecanicos",
      "/mecanica/asignaciones",
      "/mecanica/asignaciones-cliente",
      "/mecanica/historial",
    ],
  });
});

// ===============================
// 🚀 SERVER
// ===============================
const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
