import { Router } from "express";
import {
  crearCotizacion,
  obtenerCotizaciones,
  obtenerCotizacionPorId,
  actualizarCotizacion,
  actualizarEstadoCotizacion,
  eliminarCotizacion,
  crearHistorialSemana,
  obtenerHistorialSemanas,
  eliminarHistorialSemana, // <-- nuevo
} from "../controllers/cotizacion.controller.js";

const router = Router();

// 📅 Crear historial semanal
router.post("/historial", crearHistorialSemana);

// 📅 Obtener historial de semanas
router.get("/historial", obtenerHistorialSemanas);

// 📅 Eliminar historial
router.delete("/historial-semanas/:id", eliminarHistorialSemana); // <-- nueva ruta

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
