import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../middlewares/auth.middleware.js";

const prisma = new PrismaClient();
const router = Router();

/*
  ==========================
  📌 Obtener estado de vehículo del cliente logueado
  ==========================
*/
router.get("/", verifyToken, async (req, res) => {
  try {
    const asignaciones = await prisma.asignaciones.findMany({
      where: {
        cotizacion: {
          reserva: {
            cliente: {
              id_usuario: req.user.id_usuario,
            },
          },
        },
      },
      include: {
        cotizacion: {
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
        },
        mecanico: {
          include: {
            usuario: true,
          },
        },
      },
    });

    res.json(asignaciones);
  } catch (error) {
    console.error("Error obteniendo estado del vehículo:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/*
  ==========================
  📌 Actualizar estado (por si deseas usarlo a futuro)
  ==========================
*/
router.put("/:id/estado", verifyToken, async (req, res) => {
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ message: "Debe enviar un estado válido" });
  }

  try {
    const updated = await prisma.asignaciones.update({
      where: { id_asignacion: Number(req.params.id) },
      data: { estado },
    });

    res.json({ message: "Estado actualizado", updated });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
