import { Router } from "express";
import {
  crearHistorial,
  obtenerHistorial,
  obtenerHistorialPorId,
  actualizarHistorial,
  eliminarHistorial,
} from "../controllers/historial.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ==========================
// 📌 Rutas de Historial
// ==========================

// Obtener todo el historial
router.get("/", verifyToken, obtenerHistorial);

// Obtener historial por ID
router.get("/:id", verifyToken, obtenerHistorialPorId);

// Crear historial
router.post("/", verifyToken, crearHistorial);

// Actualizar historial
router.put("/:id", verifyToken, actualizarHistorial);

// Eliminar historial
router.delete("/:id", verifyToken, eliminarHistorial);

export default router;
