import { Router } from "express";
import {
  crearMecanico,
  getMecanicos,
  getMecanicoById,
  updateMecanico,
  deleteMecanico,
  getMecanicoProfile,
  updateMecanicoProfile,
} from "../controllers/mecanicos.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // Protección de rutas

const router = Router();

router.post("/crear", crearMecanico);
router.get("/", getMecanicos);
router.get("/:id", getMecanicoById);
router.put("/:id", updateMecanico);
router.delete("/:id", deleteMecanico);

// ⭐ RUTAS DE PERFIL (Uso del propio Mecánico)
// ==========================================
// Estas rutas usan el ID DE USUARIO, no el de mecánico
router.get("/profile/:id", verifyToken, getMecanicoProfile);
router.put("/profile/:id", verifyToken, updateMecanicoProfile);

export default router;
