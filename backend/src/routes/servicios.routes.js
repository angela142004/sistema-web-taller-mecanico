import { Router } from "express";
import {
  getServicios,
  getServicioById,
  createServicio,
  updateServicio,
  deleteServicio,
} from "../controllers/servicios.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Log al cargar el archivo de rutas (diagnóstico)
console.log("[ROUTES] servicios.routes.js cargado");

// Rutas públicas (lectura)
router.get("/", getServicios); // GET /mecanica/servicios
router.get("/:id", getServicioById); // GET /mecanica/servicios/:id

// Rutas protegidas (crear/actualizar/eliminar) - requiere token
router.post("/", verifyToken, createServicio); // POST /mecanica/servicios
router.put("/:id", verifyToken, updateServicio); // PUT /mecanica/servicios/:id
router.delete("/:id", verifyToken, deleteServicio); // DELETE /mecanica/servicios/:id

export default router;
