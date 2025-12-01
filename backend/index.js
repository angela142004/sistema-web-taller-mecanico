// index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

// Rutas y controladores
import userRoutes from "./src/routes/user.routes.js";
import vehiculosRoutes from "./src/routes/vehiculos.routes.js";
import marcasRoutes from "./src/routes/marcas.routes.js";
import modelosRoutes from "./src/routes/modelos.routes.js";
import serviciosRoutes from "./src/routes/servicios.routes.js";
import reservasRoutes from "./src/routes/reservas.routes.js";
import { getServicios } from "./src/controllers/servicios.controller.js";
import cotizacionesRoutes from "./src/routes/cotizacion.routes.js";
import cotizacionClienteRoutes from "./src/routes/cotizacion.cliente.routes.js";

import asignacionesRoutes from "./src/routes/asignacion.routes.js";
import asignacionClienteRoutes from "./src/routes/asignacion.cliente.routes.js";
import historialRoutes from "./src/routes/historial.routes.js";
import { getReservasPendientes } from "./src/controllers/reservas.controller.js";
// ⭐ NUEVO
import mecanicosRoutes from "./src/routes/mecanicos.routes.js";

dotenv.config();

const app = express();

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// MIDDLEWARES
app.use(morgan("dev"));
app.use(express.json());

// Log de API
app.use("/mecanica", (req, res, next) => {
  console.log(`[API LOG] ${req.method} ${req.originalUrl} - from ${req.ip}`);
  next();
});

// === RUTAS ===
app.use("/mecanica", userRoutes);
app.use("/mecanica/vehiculos", vehiculosRoutes);
app.use("/mecanica/marcas", marcasRoutes);
app.use("/mecanica/modelos", modelosRoutes);
app.use("/mecanica/servicios", serviciosRoutes);
app.use("/mecanica/reservas", reservasRoutes);

app.use("/mecanica/cotizaciones", cotizacionesRoutes);
app.use("/mecanica/cotizaciones-cliente", cotizacionClienteRoutes);
// 👨‍🔧 ADMIN/MECÁNICO
app.use("/mecanica/mecanicos", mecanicosRoutes); // ⭐ NUEVO

// 👨‍🔧 ADMIN/MECÁNICO
app.use("/mecanica/asignaciones", asignacionesRoutes);

// 👤 CLIENTE (CORREGIDO)
app.use("/mecanica/asignaciones-cliente", asignacionClienteRoutes);
app.use("/mecanica/historial", historialRoutes);

// Fallback servicios
app.get("/mecanica/servicios", getServicios);

// Endpoint de prueba
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
      "/mecanica/mecanicos", // ⭐ Añadido aquí también
      "/mecanica/asignaciones",
      "/mecanica/asignaciones-cliente", // ⭐ corregido aquí también
    ],
  });
});

// Mostrar rutas registradas
function listRoutes() {
  console.log("=== Registered routes ===");

  if (!app._router) {
    console.log("⚠️ No hay rutas registradas todavía.");
    return;
  }

  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .join(",")
        .toUpperCase();
      routes.push({ path, methods });
    } else if (
      middleware.name === "router" &&
      middleware.handle &&
      middleware.handle.stack
    ) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods)
            .join(",")
            .toUpperCase();
          routes.push({ path, methods });
        }
      });
    }
  });

  const unique = [];
  routes.forEach((r) => {
    const key = r.methods + " " + r.path;
    if (!unique.includes(key)) unique.push(key);
  });

  unique.forEach((u) => console.log(u));
  console.log("=== End routes ===");
}

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  listRoutes();
});

export default app;
