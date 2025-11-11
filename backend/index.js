// index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import userRoutes from "./src/routes/user.routes.js";
import vehiculosRoutes from "./src/routes/vehiculos.routes.js";
import marcasRoutes from "./src/routes/marcas.routes.js";
import modelosRoutes from "./src/routes/modelos.routes.js";
import serviciosRoutes from "./src/routes/servicios.routes.js"; // <-- nueva importación
import { getServicios } from "./src/controllers/servicios.controller.js"; // <-- NUEVO: import directo para fallback

dotenv.config(); // lee las variables de entorno desde .env

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // tu frontend en React
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

// Middleware de logging para todas las rutas bajo /mecanica
app.use("/mecanica", (req, res, next) => {
  console.log(`[API LOG] ${req.method} ${req.originalUrl} - from ${req.ip}`);
  next();
});

// Rutas
app.use("/mecanica", userRoutes);
app.use("/mecanica/vehiculos", vehiculosRoutes);
app.use("/mecanica/marcas", marcasRoutes);
app.use("/mecanica/modelos", modelosRoutes);
app.use("/mecanica/servicios", serviciosRoutes); // <-- montar rutas de servicios

// --- NUEVO: ruta fallback directa para GET /mecanica/servicios (diagnóstico / garantía) ---
app.get("/mecanica/servicios", getServicios);

// Endpoint diagnóstico
app.get("/mecanica", (req, res) => {
  res.json({
    ok: true,
    message: "API /mecanica running",
    endpoints: [
      "/mecanica/marcas (GET)",
      "/mecanica/modelos?marcaId=ID (GET)",
      "/mecanica/vehiculos (GET, POST, ...)",
      "/mecanica/servicios (GET)",
      "/mecanica/login (POST)",
    ],
  });
});

// Función segura para listar rutas
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

// Puerto
const PORT = process.env.PORT || 4001;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  listRoutes(); // ✅ Ahora se ejecuta después de que el servidor esté listo
});

export default app;
