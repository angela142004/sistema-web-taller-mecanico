import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ==========================
// 📌 Crear historial (se crea SOLO cuando una asignación se finaliza)
// ==========================
export const crearHistorial = async (req, res) => {
  try {
    const { id_asignacion, descripcion } = req.body;

    if (!id_asignacion) {
      return res.status(400).json({ message: "id_asignacion es obligatorio" });
    }

    // Validar que la asignación exista
    const asignacion = await prisma.asignaciones.findUnique({
      where: { id_asignacion: Number(id_asignacion) },
    });

    if (!asignacion) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    // Validar que NO exista un historial previo
    const historialExistente = await prisma.historial_Servicios.findUnique({
      where: { id_asignacion: Number(id_asignacion) },
    });

    if (historialExistente) {
      return res
        .status(400)
        .json({ message: "Ya existe un historial para esta asignación" });
    }

    const nuevoHistorial = await prisma.historial_Servicios.create({
      data: {
        id_asignacion,
        descripcion: descripcion || null,
        fecha: new Date(),
      },
    });

    res.status(201).json(nuevoHistorial);
  } catch (error) {
    console.error("Error al crear historial:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Obtener TODO el historial (listado principal)
// ==========================
export const obtenerHistorial = async (req, res) => {
  try {
    const idUsuario = req.user.id_usuario; // viene desde verifyToken

    const historial = await prisma.historial_Servicios.findMany({
      where: {
        asignacion: {
          cotizacion: {
            reserva: {
              cliente: {
                id_usuario: idUsuario, // 🔥 solo historial del cliente logueado
              },
            },
          },
        },
      },
      include: {
        asignacion: {
          include: {
            mecanico: { include: { usuario: true } },
            cotizacion: {
              include: {
                reserva: {
                  include: {
                    servicio: true,
                    vehiculo: {
                      include: {
                        modelo: { include: { marca: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const respuesta = historial.map((h) => ({
      id_historial: h.id_historial,
      fecha: h.fecha,
      servicio: h.asignacion.cotizacion.reserva.servicio.nombre,
      vehiculo:
        `${h.asignacion.cotizacion.reserva.vehiculo.modelo.nombre} - ` +
        `${h.asignacion.cotizacion.reserva.vehiculo.modelo.marca.nombre}`,
      mecanico: h.asignacion.mecanico.usuario.nombre,
      costo: h.asignacion.cotizacion.total,
      estado: h.asignacion.estado,
      asignacion: h.asignacion,
    }));

    res.json(respuesta);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ message: "Error al obtener historial" });
  }
};

// ==========================
// 📌 Obtener un historial por ID (para el modal del botón "Ver")
// ==========================
export const obtenerHistorialPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await prisma.historial_Servicios.findUnique({
      where: { id_historial: Number(id) },
      include: {
        asignacion: {
          include: {
            mecanico: { include: { usuario: true } },
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
                    cliente: { include: { usuario: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!historial) {
      return res.status(404).json({ message: "Historial no encontrado" });
    }

    res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Actualizar historial
// ==========================
export const actualizarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, fecha } = req.body;

    const historialActualizado = await prisma.historial_Servicios.update({
      where: { id_historial: Number(id) },
      data: {
        descripcion,
        fecha: fecha ? new Date(fecha) : undefined,
      },
    });

    res.json(historialActualizado);
  } catch (error) {
    console.error("Error al actualizar historial:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Eliminar historial
// ==========================
export const eliminarHistorial = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.historial_Servicios.delete({
      where: { id_historial: Number(id) },
    });

    res.json({ message: "Historial eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar historial:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
