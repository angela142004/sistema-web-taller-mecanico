// src/routes/reservas.routes.js
import { Router } from "express";
import {
  getReservas,
  getReservaById,
  createReserva,
  updateReserva,
  deleteReserva,
  getHorasOcupadas,
} from "../controllers/reservas.controller.js";

const router = Router();

router.get("/", getReservas);
router.get("/:id", getReservaById);
router.post("/", createReserva);
router.put("/:id", updateReserva);
router.delete("/:id", deleteReserva);
router.get("/horas", getHorasOcupadas);

export default router;
