import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Listar todos los servicios
export const getServicios = async (req, res) => {
  console.log("[SERVICIOS] getServicios called");
  try {
    const servicios = await prisma.servicios.findMany({
      orderBy: { id_servicio: "asc" },
    });
    res.json(servicios);
  } catch (error) {
    console.error("[SERVICIOS] Error getServicios:", error);
    res
      .status(500)
      .json({ message: "Error al obtener servicios", error: error.message });
  }
};

// Obtener servicio por id
export const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[SERVICIOS] getServicioById id:", id);
    const servicio = await prisma.servicios.findUnique({
      where: { id_servicio: Number(id) },
    });
    if (!servicio)
      return res.status(404).json({ message: "Servicio no encontrado" });
    res.json(servicio);
  } catch (error) {
    console.error("[SERVICIOS] Error getServicioById:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el servicio", error: error.message });
  }
};

// Crear nuevo servicio (protegido en rutas)
export const createServicio = async (req, res) => {
  try {
    const { nombre, descripcion, duracion } = req.body;
    console.log("[SERVICIOS] createServicio body:", req.body);

    if (!nombre || !String(nombre).trim()) {
      return res
        .status(400)
        .json({ message: "El nombre del servicio es obligatorio" });
    }

    const nuevo = await prisma.servicios.create({
      data: {
        nombre: String(nombre).trim(),
        descripcion: descripcion ? String(descripcion) : null,
        duracion: duracion ? Number(duracion) : undefined,
      },
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error("[SERVICIOS] Error createServicio:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Ya existe un servicio con ese nombre" });
    }
    res
      .status(500)
      .json({ message: "Error al crear el servicio", error: error.message });
  }
};

// Actualizar servicio (protegido en rutas)
export const updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion } = req.body;
    console.log("[SERVICIOS] updateServicio id:", id, "body:", req.body);

    const servicioExist = await prisma.servicios.findUnique({
      where: { id_servicio: Number(id) },
    });
    if (!servicioExist)
      return res.status(404).json({ message: "Servicio no encontrado" });

    if (nombre && !String(nombre).trim()) {
      return res
        .status(400)
        .json({ message: "El nombre del servicio no puede estar vacío" });
    }

    const actualizado = await prisma.servicios.update({
      where: { id_servicio: Number(id) },
      data: {
        ...(nombre && { nombre: String(nombre).trim() }),
        descripcion:
          typeof descripcion !== "undefined"
            ? descripcion
            : servicioExist.descripcion,
        ...(typeof duracion !== "undefined" && { duracion: Number(duracion) }),
      },
    });

    res.json(actualizado);
  } catch (error) {
    console.error("[SERVICIOS] Error updateServicio:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "El nombre del servicio ya está en uso" });
    }
    res.status(500).json({
      message: "Error al actualizar el servicio",
      error: error.message,
    });
  }
};

// Eliminar servicio (protegido en rutas)
export const deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[SERVICIOS] deleteServicio id:", id);

    const servicio = await prisma.servicios.findUnique({
      where: { id_servicio: Number(id) },
      include: { reservas: true },
    });
    if (!servicio)
      return res.status(404).json({ message: "Servicio no encontrado" });

    if (servicio.reservas && servicio.reservas.length > 0) {
      return res.status(400).json({
        message:
          "El servicio tiene reservas asociadas. Elimínelas primero o desvincúlelas.",
      });
    }

    await prisma.servicios.delete({
      where: { id_servicio: Number(id) },
    });

    res.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("[SERVICIOS] Error deleteServicio:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el servicio", error: error.message });
  }
};
