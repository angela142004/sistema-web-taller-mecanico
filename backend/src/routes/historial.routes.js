import { Router } from "express";
import {
  crearHistorial,
  obtenerHistorial,
  obtenerHistorialPorId,
  actualizarHistorial,
  eliminarHistorial,
  obtenerHistorialAdmin,
  buscarHistorial, // ⬅️ IMPORTANTE: importar búsqueda
} from "../controllers/historial.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ==========================
// 📌 Rutas de Historial
// ==========================

// 🔥 HISTORIAL COMPLETO PARA ADMIN
router.get("/admin", verifyToken, obtenerHistorialAdmin);

// 🔍 BUSCAR HISTORIAL (servicio, mecánico, vehículo)
router.get("/buscar", verifyToken, buscarHistorial); // ⬅️ NUEVA RUTA

// Obtener todo el historial (solo del cliente logueado)
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
