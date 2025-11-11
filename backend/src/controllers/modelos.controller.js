import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /modelos?marcaId=123
export const getModelos = async (req, res) => {
  try {
    const { marcaId } = req.query;
    const where = marcaId ? { id_marca: Number(marcaId) } : {};
    const modelos = await prisma.modelos.findMany({
      where,
      include: { marca: true },
      orderBy: { nombre: "asc" },
    });
    res.json(modelos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener modelos", error: error.message });
  }
};

// GET /modelos/:id
export const getModeloById = async (req, res) => {
  try {
    const { id } = req.params;
    const modelo = await prisma.modelos.findUnique({
      where: { id_modelo: Number(id) },
      include: { marca: true },
    });
    if (!modelo)
      return res.status(404).json({ message: "Modelo no encontrado" });
    res.json(modelo);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener modelo", error: error.message });
  }
};

// POST /modelos
// body: { id_marca }  OR  { marca, nombre }  (si se pasa marca por nombre, crear/buscar marca)
export const createModelo = async (req, res) => {
  try {
    const { id_marca, nombre, marca } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ message: "El nombre del modelo es obligatorio" });
    }

    let marcaId = id_marca ? Number(id_marca) : null;

    if (!marcaId) {
      if (!marca) {
        return res
          .status(400)
          .json({ message: "Debe indicar id_marca o el nombre de la marca" });
      }
      const marcaNombre = String(marca).trim();
      let marcaRegistro = await prisma.marcas.findUnique({
        where: { nombre: marcaNombre },
      });
      if (!marcaRegistro) {
        marcaRegistro = await prisma.marcas.create({
          data: { nombre: marcaNombre },
        });
      }
      marcaId = marcaRegistro.id_marca;
    }

    // evitar duplicado: mismo nombre dentro de la misma marca
    const existing = await prisma.modelos.findFirst({
      where: { nombre: String(nombre).trim(), id_marca: marcaId },
    });
    if (existing) {
      return res
        .status(400)
        .json({
          message: "Ya existe un modelo con ese nombre para la marca indicada",
        });
    }

    const nuevo = await prisma.modelos.create({
      data: {
        nombre: String(nombre).trim(),
        id_marca: Number(marcaId),
      },
    });

    const modeloCreado = await prisma.modelos.findUnique({
      where: { id_modelo: nuevo.id_modelo },
      include: { marca: true },
    });

    res.status(201).json(modeloCreado);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Modelo duplicado" });
    }
    res
      .status(500)
      .json({ message: "Error al crear modelo", error: error.message });
  }
};

// PUT /modelos/:id
// body: { nombre, id_marca }  o { nombre, marca } (nombre de marca)
export const updateModelo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, id_marca, marca } = req.body;

    const modelo = await prisma.modelos.findUnique({
      where: { id_modelo: Number(id) },
    });
    if (!modelo)
      return res.status(404).json({ message: "Modelo no encontrado" });

    let marcaId = id_marca ? Number(id_marca) : modelo.id_marca;

    if (!id_marca && marca) {
      const marcaNombre = String(marca).trim();
      let marcaRegistro = await prisma.marcas.findUnique({
        where: { nombre: marcaNombre },
      });
      if (!marcaRegistro) {
        marcaRegistro = await prisma.marcas.create({
          data: { nombre: marcaNombre },
        });
      }
      marcaId = marcaRegistro.id_marca;
    }

    if (nombre) {
      // verificar duplicado dentro de la misma marca (excluyendo el actual)
      const dup = await prisma.modelos.findFirst({
        where: {
          nombre: String(nombre).trim(),
          id_marca: marcaId,
          NOT: { id_modelo: Number(id) },
        },
      });
      if (dup) {
        return res
          .status(400)
          .json({
            message:
              "Ya existe otro modelo con ese nombre para la marca indicada",
          });
      }
    }

    const dataToUpdate = {};
    if (nombre) dataToUpdate.nombre = String(nombre).trim();
    if (marcaId) dataToUpdate.id_marca = Number(marcaId);

    const updated = await prisma.modelos.update({
      where: { id_modelo: Number(id) },
      data: dataToUpdate,
    });

    const modeloActualizado = await prisma.modelos.findUnique({
      where: { id_modelo: updated.id_modelo },
      include: { marca: true },
    });

    res.json(modeloActualizado);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Conflicto de datos (duplicado)" });
    }
    res
      .status(500)
      .json({ message: "Error al actualizar modelo", error: error.message });
  }
};

// DELETE /modelos/:id
export const deleteModelo = async (req, res) => {
  try {
    const { id } = req.params;

    const modelo = await prisma.modelos.findUnique({
      where: { id_modelo: Number(id) },
      include: { vehiculos: true, repuestos: true },
    });
    if (!modelo)
      return res.status(404).json({ message: "Modelo no encontrado" });

    // impedir borrado si hay vehículos o repuestos asociados
    const vehiculosCount = await prisma.vehiculos.count({
      where: { id_modelo: Number(id) },
    });
    const repuestosCount = await prisma.repuestos.count({
      where: { id_modelo: Number(id) },
    });

    if (vehiculosCount > 0 || repuestosCount > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar el modelo porque tiene vehículos o repuestos asociados",
      });
    }

    await prisma.modelos.delete({ where: { id_modelo: Number(id) } });
    res.json({ message: "Modelo eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al eliminar modelo", error: error.message });
  }
};
