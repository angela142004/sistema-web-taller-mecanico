import { Router } from "express";
import {
  getRepuestos,
  createRepuesto,
  updateRepuesto,
  deleteRepuesto,
} from "../controllers/repuestos.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // Para proteger las rutas

const router = Router();

// Todas las rutas protegidas (Solo admin/mecanico deberían ver esto)
router.get("/", verifyToken, getRepuestos);
router.post("/", verifyToken, createRepuesto);
router.put("/:id", verifyToken, updateRepuesto);
router.delete("/:id", verifyToken, deleteRepuesto);

export default router;
