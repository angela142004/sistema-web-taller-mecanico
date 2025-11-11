import { Router } from "express";
import {
  getModelos,
  getModeloById,
  createModelo,
  updateModelo,
  deleteModelo,
} from "../controllers/modelos.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas (lectura)
router.get("/", getModelos); // GET /mecanica/modelos
router.get("/:id", getModeloById); // GET /mecanica/modelos/:id

// Rutas protegidas (crear/actualizar/eliminar)
router.post("/", verifyToken, createModelo); // POST /mecanica/modelos
router.put("/:id", verifyToken, updateModelo); // PUT /mecanica/modelos/:id
router.delete("/:id", verifyToken, deleteModelo); // DELETE /mecanica/modelos/:id

export default router;
