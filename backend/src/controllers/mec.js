import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ==========================================
// FUNCIONES PARA EL ADMINISTRADOR
// ==========================================

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
 * @desc Obtener mecánico por ID (de tabla Mecánicos)
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
 * @desc Actualizar datos de mecánico (Admin)
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

// ==========================================
// ⭐ FUNCIONES NUEVAS: PERFIL DEL PROPIO MECÁNICO
// ==========================================

/**
 * @desc Obtener PERFIL (usando id_usuario)
 * Usado por: Configuracion.jsx
 */
export const getMecanicoProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = parseInt(id);

    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: idUsuario },
      include: { mecanico: true },
    });

    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // Aplanamos la respuesta para el frontend
    const response = {
      ...usuario,
      telefono: usuario.mecanico?.telefono || "",
      especialidad: usuario.mecanico?.especialidad || "",
      fecha_ingreso: usuario.mecanico?.fecha_ingreso || null,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener perfil mecánico" });
  }
};

/**
 * @desc Actualizar PERFIL (usando id_usuario)
 * Usado por: Configuracion.jsx
 */
export const updateMecanicoProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = parseInt(id);
    const { nombre, correo, telefono, especialidad, contraseña } = req.body;

    // 1. Validar existencia
    const usuarioExiste = await prisma.usuarios.findUnique({
      where: { id_usuario: idUsuario },
    });
    if (!usuarioExiste)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // 2. Actualizar tabla USUARIOS
    const dataUsuario = {};
    if (nombre) dataUsuario.nombre = nombre;
    if (correo) dataUsuario.correo = correo;
    if (contraseña && contraseña.trim() !== "") {
      dataUsuario.contraseña = await bcrypt.hash(contraseña, 10);
    }

    if (Object.keys(dataUsuario).length > 0) {
      await prisma.usuarios.update({
        where: { id_usuario: idUsuario },
        data: dataUsuario,
      });
    }

    // 3. UPSERT en tabla MECANICOS (Crea si no existe)
    const datosMecanico = {
      telefono: telefono || "",
      especialidad: especialidad || "General",
    };

    await prisma.mecanicos.upsert({
      where: { id_usuario: idUsuario },
      update: datosMecanico,
      create: {
        id_usuario: idUsuario,
        ...datosMecanico,
        fecha_ingreso: new Date(),
      },
    });

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error updateMecanicoProfile:", error);
    res.status(500).json({ message: "Error interno al actualizar perfil" });
  }
};
