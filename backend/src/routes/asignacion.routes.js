import { Router } from "express";
import {
  crearAsignacion,
  obtenerAsignaciones,
  obtenerAsignacionPorId,
  actualizarAsignacion,
  actualizarEstadoAsignacion,
  eliminarAsignacion,
  marcarRecepcion,
} from "../controllers/asignacion.controller.js";

const router = Router();

// 📌 Crear una asignación
router.post("/", crearAsignacion);

// 📌 Obtener todas
router.get("/", obtenerAsignaciones);

// 📌 Obtener 1 por ID
router.get("/:id", obtenerAsignacionPorId);

// 📌 Actualizar todos los campos
router.put("/:id", actualizarAsignacion);

// 📌 Actualizar solo el estado
router.patch("/:id/estado", actualizarEstadoAsignacion);

// 📌 Marcar recepción
router.patch("/:id/recepcion", marcarRecepcion);

// 📌 Eliminar una asignación
router.delete("/:id", eliminarAsignacion);

export default router;
