import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener todas las marcas con sus modelos
export const getMarcas = async (req, res) => {
  console.log(
    "[CONTROLLER] getMarcas called - method:",
    req.method,
    "url:",
    req.originalUrl,
    "from:",
    req.ip
  );
  try {
    const marcas = await prisma.marcas.findMany({
      include: { modelos: true },
      orderBy: { id_marca: "asc" },
    });
    res.json(marcas);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener marcas", error: error.message });
  }
};

// Obtener una marca por id (con modelos)
export const getMarcaById = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await prisma.marcas.findUnique({
      where: { id_marca: Number(id) },
      include: { modelos: true },
    });
    if (!marca) return res.status(404).json({ message: "Marca no encontrada" });
    res.json(marca);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener la marca", error: error.message });
  }
};

// Crear una nueva marca
export const createMarca = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !String(nombre).trim()) {
      return res
        .status(400)
        .json({ message: "El nombre de la marca es obligatorio" });
    }
    const nombreTrim = String(nombre).trim();

    // Verificar existencia
    const existing = await prisma.marcas.findUnique({
      where: { nombre: nombreTrim },
    });
    if (existing) {
      return res.status(400).json({ message: "La marca ya existe" });
    }

    const nueva = await prisma.marcas.create({
      data: { nombre: nombreTrim },
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "La marca ya existe" });
    }
    res
      .status(500)
      .json({ message: "Error al crear la marca", error: error.message });
  }
};

// Actualizar una marca
export const updateMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre || !String(nombre).trim()) {
      return res
        .status(400)
        .json({ message: "El nombre de la marca es obligatorio" });
    }
    const nombreTrim = String(nombre).trim();

    const marca = await prisma.marcas.findUnique({
      where: { id_marca: Number(id) },
    });
    if (!marca) return res.status(404).json({ message: "Marca no encontrada" });

    // Verificar que no exista otra marca con el mismo nombre
    const otra = await prisma.marcas.findFirst({
      where: { nombre: nombreTrim, NOT: { id_marca: Number(id) } },
    });
    if (otra) {
      return res
        .status(400)
        .json({ message: "Otra marca con ese nombre ya existe" });
    }

    const actualizado = await prisma.marcas.update({
      where: { id_marca: Number(id) },
      data: { nombre: nombreTrim },
    });

    res.json(actualizado);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "El nombre de marca ya está en uso" });
    }
    res
      .status(500)
      .json({ message: "Error al actualizar la marca", error: error.message });
  }
};

// Eliminar una marca (solo si no tiene modelos asociados)
export const deleteMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await prisma.marcas.findUnique({
      where: { id_marca: Number(id) },
      include: { modelos: true },
    });
    if (!marca) return res.status(404).json({ message: "Marca no encontrada" });

    if (marca.modelos && marca.modelos.length > 0) {
      return res.status(400).json({
        message:
          "La marca tiene modelos asociados. Elimine primero los modelos o actualice la marca.",
      });
    }

    await prisma.marcas.delete({ where: { id_marca: Number(id) } });
    res.json({ message: "Marca eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al eliminar la marca", error: error.message });
  }
};
