import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ==========================
// 📌 Crear asignación
// ==========================
export const crearAsignacion = async (req, res) => {
  try {
    console.log("BODY RECIBIDO:", req.body);

    const { id_cotizacion, id_mecanico, estado, observaciones } = req.body;

    if (!id_cotizacion || !id_mecanico) {
      return res
        .status(400)
        .json({ message: "id_cotizacion y id_mecanico son obligatorios" });
    }

    const nuevaAsignacion = await prisma.asignaciones.create({
      data: {
        id_cotizacion,
        id_mecanico,
        fecha_asignacion: new Date(),
        estado: estado || "pendiente",
        observaciones: observaciones || null,
      },
    });

    res.status(201).json(nuevaAsignacion);
  } catch (error) {
    console.error("Error al crear asignación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Obtener TODAS las asignaciones (CORREGIDO COMPLETO)
// ==========================

export const obtenerAsignaciones = async (req, res) => {
  try {
    const asignaciones = await prisma.asignaciones.findMany({
      include: {
        cotizacion: {
          include: {
            reserva: {
              include: {
                cliente: {
                  include: {
                    usuario: true, // 🔥 AQUÍ ESTABA LA CLAVE
                  },
                },
                vehiculo: {
                  include: {
                    modelo: {
                      include: {
                        marca: true,
                      },
                    },
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
    console.error("Error al obtener asignaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Obtener por ID (CORREGIDO COMPLETO)
// ==========================
export const obtenerAsignacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const asignacion = await prisma.asignaciones.findUnique({
      where: { id_asignacion: Number(id) },
      include: {
        cotizacion: {
          include: {
            reserva: {
              include: {
                vehiculo: {
                  include: {
                    modelo: {
                      include: {
                        marca: true,
                      },
                    },
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

    if (!asignacion) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    res.json(asignacion);
  } catch (error) {
    console.error("Error al obtener asignación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Actualizar asignación
// ==========================
export const actualizarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_cotizacion,
      id_mecanico,
      fecha_asignacion,
      estado,
      observaciones,
    } = req.body;

    const asignacionActualizada = await prisma.asignaciones.update({
      where: { id_asignacion: Number(id) },
      data: {
        id_cotizacion,
        id_mecanico,
        fecha_asignacion: fecha_asignacion
          ? new Date(fecha_asignacion)
          : undefined,
        estado,
        observaciones,
      },
    });

    res.json(asignacionActualizada);
  } catch (error) {
    console.error("Error al actualizar asignación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Cambiar solo el estado
// ==========================
export const actualizarEstadoAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }

    const nuevaActualizacion = await prisma.asignaciones.update({
      where: { id_asignacion: Number(id) },
      data: { estado },
    });

    if (estado.toLowerCase() === "finalizado") {
      // 🔥 CAMBIA SOLO ESTE NOMBRE según lo que te dé el LOG
      await prisma.historial_Servicios.create({
        data: {
          id_asignacion: Number(id),
          descripcion: "Servicio finalizado correctamente",
          fecha: new Date(),
        },
      });
    }

    res.json(nuevaActualizacion);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Eliminar asignación
// ==========================
export const eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.asignaciones.delete({
      where: { id_asignacion: Number(id) },
    });

    res.json({ message: "Asignación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
