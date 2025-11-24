import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middlewares/auth.middleware.js";

const prisma = new PrismaClient();
const router = Router();

// ==========================
// 📌 Obtener cotizaciones del cliente logeado
// ==========================
router.get("/", verifyToken, async (req, res) => {
  try {
    const cotizaciones = await prisma.cotizaciones.findMany({
      where: {
        reserva: {
          cliente: {
            id_usuario: req.user.id_usuario,
          },
        },
      },
      include: {
        reserva: {
          include: {
            vehiculo: {
              include: {
                modelo: { include: { marca: true } },
              },
            },
            servicio: true,
          },
        },
      },
    });

    res.json(cotizaciones);
  } catch (error) {
    console.error("Error obteniendo cotizaciones del cliente:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ==========================
// 📌 Aprobar cotización
// ==========================
router.put("/:id/aprobar", verifyToken, async (req, res) => {
  try {
    const updated = await prisma.cotizaciones.update({
      where: { id_cotizacion: Number(req.params.id) },
      data: { estado: "APROBADO" },
    });

    res.json({ message: "Cotización aprobada" });
  } catch (error) {
    console.error("Error al aprobar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ==========================
// 📌 Rechazar cotización
// ==========================
router.put("/:id/rechazar", verifyToken, async (req, res) => {
  const { motivo } = req.body;

  if (!motivo) {
    return res.status(400).json({ message: "Debe enviar un motivo" });
  }

  try {
    const updated = await prisma.cotizaciones.update({
      where: { id_cotizacion: Number(req.params.id) },
      data: {
        estado: "RECHAZADO",
        comentario_cliente: motivo,
      },
    });

    res.json({ message: "Cotización rechazada" });
  } catch (error) {
    console.error("Error al rechazar:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
