import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ==========================
// 📌 Crear cotización
// ==========================
export const crearCotizacion = async (req, res) => {
  try {
    const { id_reserva, total, detalles } = req.body;

    if (!id_reserva || !total || !detalles) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // 1️⃣ Validar si YA existe una cotización para esa reserva
    const existente = await prisma.cotizaciones.findUnique({
      where: { id_reserva },
    });

    if (existente) {
      return res.status(400).json({
        message: "Ya existe una cotización para esta reserva.",
      });
    }

    // 2️⃣ Crear cotización con estado PENDIENTE
    const nuevaCotizacion = await prisma.cotizaciones.create({
      data: {
        id_reserva,
        fecha: new Date(),
        total,
        detalles,
        estado: "PENDIENTE",
      },
    });

    res.status(201).json(nuevaCotizacion);
  } catch (error) {
    console.error("Error al crear cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Obtener todas
// ==========================
export const obtenerCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await prisma.cotizaciones.findMany({
      include: {
        reserva: {
          include: {
            cliente: {
              include: {
                usuario: true,
              },
            },
            vehiculo: {
              include: {
                modelo: true,
              },
            },
            servicio: true,
          },
        },

        // 🔥 AGREGADO: trae las asignaciones SI EXISTEN
        asignaciones: {
          include: {
            mecanico: {
              include: {
                usuario: true, // por si quieres mostrar el nombre del mecánico
              },
            },
          },
        },

        // 🔥 Puedes agregar factura aquí si quieres
        // factura: true,
      },
    });

    res.json(cotizaciones);
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error);
    res.status(500).json({ error: "Error al obtener cotizaciones" });
  }
};

// ==========================
// 📌 Obtener cotización por ID
// ==========================
export const obtenerCotizacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cotizacion = await prisma.cotizaciones.findUnique({
      where: { id_cotizacion: Number(id) },
      include: {
        reserva: true,
      },
    });

    if (!cotizacion) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    res.json(cotizacion);
  } catch (error) {
    console.error("Error al obtener cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Actualizar cotización
// ==========================
export const actualizarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, total, estado } = req.body;

    const cotizacionActualizada = await prisma.cotizaciones.update({
      where: { id_cotizacion: Number(id) },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        total,
        estado,
      },
    });

    res.json(cotizacionActualizada);
  } catch (error) {
    console.error("Error al actualizar cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Cambiar estado (PENDIENTE → CONFIRMADO, RECHAZADO, etc.)
// ==========================
export const actualizarEstadoCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }

    const nuevaActualizacion = await prisma.cotizaciones.update({
      where: { id_cotizacion: Number(id) },
      data: { estado },
    });

    res.json(nuevaActualizacion);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ==========================
// 📌 Eliminar cotización
// ==========================
export const eliminarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cotizaciones.delete({
      where: { id_cotizacion: Number(id) },
    });

    res.json({ message: "Cotización eliminada" });
  } catch (error) {
    console.error("Error al eliminar cotización:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
