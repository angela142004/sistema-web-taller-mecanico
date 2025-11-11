import { Router } from "express";
import {
  getMarcas,
  getMarcaById,
  createMarca,
  updateMarca,
  deleteMarca,
} from "../controllers/marcas.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas (lectura)
router.get("/", getMarcas); // GET /mecanica/marcas
router.get("/:id", getMarcaById); // GET /mecanica/marcas/:id

// Rutas protegidas (crear/actualizar/eliminar)
router.post("/", verifyToken, createMarca); // POST /mecanica/marcas
router.put("/:id", verifyToken, updateMarca); // PUT /mecanica/marcas/:id
router.delete("/:id", verifyToken, deleteMarca); // DELETE /mecanica/marcas/:id

export default router;
