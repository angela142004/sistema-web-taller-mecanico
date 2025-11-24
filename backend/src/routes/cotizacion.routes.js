import { Router } from "express";
import {
  crearCotizacion,
  obtenerCotizaciones,
  obtenerCotizacionPorId,
  actualizarCotizacion,
  actualizarEstadoCotizacion,
  eliminarCotizacion,
} from "../controllers/cotizacion.controller.js";

const router = Router();

// 📌 Crear una cotización
router.post("/", crearCotizacion);

// 📌 Obtener todas
router.get("/", obtenerCotizaciones);

// 📌 Obtener 1 por ID
router.get("/:id", obtenerCotizacionPorId);

// 📌 Actualizar todo (fecha, total, etc.)
router.put("/:id", actualizarCotizacion);

// 📌 Actualizar solo el estado (Confirmar, Rechazar, Pendiente)
router.patch("/:id/estado", actualizarEstadoCotizacion);

// 📌 Eliminar
router.delete("/:id", eliminarCotizacion);

export default router;
