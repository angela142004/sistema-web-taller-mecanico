// src/routes/reservas.routes.js
import { Router } from "express";
import {
  getReservas,
  getReservaById,
  createReserva,
  updateReserva,
  deleteReserva,
  getHorasOcupadas,
  getReservasCliente,
  getReservasPendientes,
  updateEstadoReserva, // 👈🔥 IMPORTARLO
  getReservasConfirmadas,
} from "../controllers/reservas.controller.js";

const router = Router();

router.get("/", getReservas);
router.get("/cliente", getReservasCliente);
router.get("/horas", getHorasOcupadas);
router.get("/pendientes", getReservasPendientes);
router.get("/confirmadas", getReservasConfirmadas);
router.post("/", createReserva);

// 🔥 RUTA CORRECTA PARA CAMBIAR ESTADO
router.patch("/estado/:id", updateEstadoReserva);

// TODAS LAS RUTAS DINÁMICAS VAN AL FINAL
router.get("/:id", getReservaById);
router.put("/:id", updateReserva);
router.delete("/:id", deleteReserva);

export default router;
