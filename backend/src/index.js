// index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
// aquí luego vas agregando más rutas, por ejemplo:
// import eventRoutes from "./routes/event.routes.js";

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

// Rutas
app.use("/api/users", userRoutes);
// app.use("/api/events", eventRoutes); // ejemplo futuro

// Puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
