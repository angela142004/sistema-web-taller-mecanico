import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc Obtener todos los repuestos (incluyendo nombres de Marca y Modelo)
 */
export const getRepuestos = async (req, res) => {
  try {
    const repuestos = await prisma.repuestos.findMany({
      include: {
        marca: true, // Traer el nombre de la marca
        modelo: true, // Traer el nombre del modelo
      },
      orderBy: {
        id_repuesto: "desc", // Los más nuevos primero
      },
    });

    // Convertir Decimales a Números para que React no tenga problemas
    const repuestosFormateados = repuestos.map((r) => ({
      ...r,
      precio_compra: Number(r.precio_compra),
      precio_venta: Number(r.precio_venta),
    }));

    res.json(repuestosFormateados);
  } catch (error) {
    console.error("Error al obtener repuestos:", error);
    res.status(500).json({ message: "Error interno al cargar el inventario" });
  }
};

/**
 * @desc Crear un nuevo repuesto
 */
export const createRepuesto = async (req, res) => {
  try {
    const {
      descripcion,
      id_marca,
      id_modelo,
      anio,
      precio_compra,
      precio_venta,
      stock,
    } = req.body;

    const nuevoRepuesto = await prisma.repuestos.create({
      data: {
        descripcion,
        id_marca: parseInt(id_marca),
        id_modelo: parseInt(id_modelo),
        anio: parseInt(anio),
        precio_compra: parseFloat(precio_compra),
        precio_venta: parseFloat(precio_venta),
        stock: parseInt(stock),
      },
    });

    res.status(201).json({
      message: "Repuesto creado correctamente",
      repuesto: nuevoRepuesto,
    });
  } catch (error) {
    console.error("Error al crear repuesto:", error);
    res.status(500).json({ message: "Error al guardar el repuesto" });
  }
};

/**
 * @desc Actualizar un repuesto existente
 */
export const updateRepuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      descripcion,
      id_marca,
      id_modelo,
      anio,
      precio_compra,
      precio_venta,
      stock,
    } = req.body;

    const repuestoActualizado = await prisma.repuestos.update({
      where: { id_repuesto: parseInt(id) },
      data: {
        descripcion,
        id_marca: parseInt(id_marca),
        id_modelo: parseInt(id_modelo),
        anio: parseInt(anio),
        precio_compra: parseFloat(precio_compra),
        precio_venta: parseFloat(precio_venta),
        stock: parseInt(stock),
      },
    });

    res.json({
      message: "Repuesto actualizado correctamente",
      repuesto: repuestoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar repuesto:", error);
    res.status(500).json({ message: "Error al actualizar" });
  }
};

/**
 * @desc Eliminar un repuesto
 */
export const deleteRepuesto = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.repuestos.delete({
      where: { id_repuesto: parseInt(id) },
    });

    res.json({ message: "Repuesto eliminado del inventario" });
  } catch (error) {
    console.error("Error al eliminar repuesto:", error);
    res.status(500).json({ message: "Error al eliminar" });
  }
};
/**
 * @desc Obtener repuestos con stock bajo
 */
export const getRepuestosStockBajo = async (req, res) => {
  try {
    const LIMITE_STOCK = 5; // 🔥 Cambia este valor si deseas otro límite

    const repuestosBajoStock = await prisma.repuestos.findMany({
      where: {
        stock: {
          lt: LIMITE_STOCK,
        },
      },
      include: {
        marca: true,
        modelo: true,
      },
      orderBy: {
        stock: "asc",
      },
    });

    res.json(repuestosBajoStock);
  } catch (error) {
    console.error("Error al obtener repuestos con stock bajo:", error);
    res.status(500).json({ message: "Error al cargar notificaciones" });
  }
};
