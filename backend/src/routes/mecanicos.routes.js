import { Router } from "express";
import {
  crearMecanico,
  getMecanicos,
  getMecanicoById,
  updateMecanico,
  deleteMecanico,
} from "../controllers/mecanicos.controller.js";

const router = Router();

router.post("/crear", crearMecanico);
router.get("/", getMecanicos);
router.get("/:id", getMecanicoById);
router.put("/:id", updateMecanico);
router.delete("/:id", deleteMecanico);

export default router;
