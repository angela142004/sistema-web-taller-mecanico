import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * @desc Crear un mecánico desde el panel admin
 */
export const crearMecanico = async (req, res) => {
  try {
    const {
      nombre,
      correo,
      contraseña,
      telefono,
      especialidad,
      fecha_ingreso,
    } = req.body;

    // Validaciones obligatorias
    if (
      !nombre ||
      !correo ||
      !contraseña ||
      !telefono ||
      !especialidad ||
      !fecha_ingreso
    ) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // Verificar si ya existe usuario por correo o nombre
    const existingUser = await prisma.usuarios.findFirst({
      where: {
        OR: [{ correo }, { nombre }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario con rol MECANICO
    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        contraseña: hashedPassword,
        rol: "mecanico",
      },
    });

    // Crear registro del mecánico
    const nuevoMecanico = await prisma.mecanicos.create({
      data: {
        id_usuario: nuevoUsuario.id_usuario,
        telefono,
        especialidad,
        fecha_ingreso: new Date(fecha_ingreso),
      },
    });

    res.status(201).json({
      message: "Mecánico creado correctamente",
      usuario: nuevoUsuario,
      mecanico: nuevoMecanico,
    });
  } catch (error) {
    console.error("Error en crearMecanico:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

/**
 * @desc Obtener todos los mecánicos
 */
export const getMecanicos = async (req, res) => {
  try {
    const mecanicos = await prisma.mecanicos.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
            foto: true,
          },
        },
        asignaciones: {
          where: {
            estado: { in: ["pendiente", "en_proceso"] },
          },
        },
      },
    });

    const mecanicosConDisponibilidad = mecanicos.map((m) => ({
      id_mecanico: m.id_mecanico,
      nombre: m.usuario.nombre,
      foto: m.usuario.foto,
      telefono: m.telefono,
      especialidad: m.especialidad,
      disponible: m.asignaciones.length === 0,
    }));

    res.json(mecanicosConDisponibilidad);
  } catch (error) {
    console.error("Error en getMecanicos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @desc Obtener mecánico por ID
 */
export const getMecanicoById = async (req, res) => {
  try {
    const { id } = req.params;

    const mecanico = await prisma.mecanicos.findUnique({
      where: { id_mecanico: parseInt(id) },
      include: { usuario: true },
    });

    if (!mecanico) {
      return res.status(404).json({ message: "Mecánico no encontrado" });
    }

    res.json(mecanico);
  } catch (error) {
    console.error("Error en getMecanicoById:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @desc Actualizar datos de mecánico
 */
export const updateMecanico = async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, especialidad, fecha_ingreso } = req.body;

    const updatedMecanico = await prisma.mecanicos.update({
      where: { id_mecanico: parseInt(id) },
      data: {
        telefono,
        especialidad,
        fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : undefined,
      },
    });

    res.json({
      message: "Mecánico actualizado correctamente",
      mecanico: updatedMecanico,
    });
  } catch (error) {
    console.error("Error en updateMecanico:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @desc Eliminar mecánico + su usuario
 */
export const deleteMecanico = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener el mecánico
    const mecanico = await prisma.mecanicos.findUnique({
      where: { id_mecanico: parseInt(id) },
    });

    if (!mecanico) {
      return res.status(404).json({ message: "Mecánico no encontrado" });
    }

    // 2. Eliminar mecanico
    await prisma.mecanicos.delete({
      where: { id_mecanico: parseInt(id) },
    });

    // 3. Eliminar usuario asociado
    await prisma.usuarios.delete({
      where: { id_usuario: mecanico.id_usuario },
    });

    res.json({ message: "Mecánico y usuario eliminados correctamente" });
  } catch (error) {
    console.error("Error en deleteMecanico:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
