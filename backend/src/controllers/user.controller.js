// src/controllers/user.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/env.js";
import { transporter } from "../config/mailer.js"; // <--- IMPORTANTE
import crypto from "crypto"; // Viene con Node.js, no hay que instalar nada
const prisma = new PrismaClient();

/**
/**
 * @desc Registrar nuevo usuario (CON CONFIRMACIÓN DE CORREO)
 */
export const registerUser = async (req, res) => {
  try {
    const {
      dni,
      nombre,
      correo,
      contraseña,
      rol,
      telefono,
      direccion,
      especialidad,
      fechaIngreso,
    } = req.body;

    if (!dni || !nombre || !correo || !contraseña) {
      return res.status(400).json({
        message: "DNI, Nombre, Correo y Contraseña son obligatorios",
      });
    }

    if (dni.length !== 8) {
      return res.status(400).json({ message: "El DNI debe tener 8 dígitos" });
    }

    if (!correo.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ message: "Solo se permiten correos Gmail" });
    }

    const exists = await prisma.usuarios.findFirst({
      where: { OR: [{ dni }, { correo }] },
    });

    if (exists) {
      return res.status(400).json({ message: "DNI o correo ya registrados" });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const rolFinal = ["cliente", "mecanico", "admin"].includes(rol)
      ? rol
      : "cliente";

    const autoConfirm = true; // 🔥 DESACTIVA CONFIRMACIÓN POR CORREO

    const newUser = await prisma.usuarios.create({
      data: {
        dni,
        nombre,
        correo,
        contraseña: hashedPassword,
        rol: rolFinal,
        confirmado: autoConfirm,
        token: autoConfirm ? null : crypto.randomBytes(20).toString("hex"),
      },
    });

    if (rolFinal === "cliente") {
      await prisma.clientes.create({
        data: {
          id_usuario: newUser.id_usuario,
          telefono: telefono || "",
          direccion: direccion || "",
        },
      });
    }

    if (rolFinal === "mecanico") {
      await prisma.mecanicos.create({
        data: {
          id_usuario: newUser.id_usuario,
          telefono: telefono || "",
          especialidad: especialidad || "",
          fecha_ingreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
        },
      });
    }

    return res.status(201).json({
      message: "Usuario registrado correctamente",
    });
  } catch (error) {
    console.error("Error registro:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

/**
 * @desc Iniciar sesión
/**
 * @desc Iniciar sesión (CON VALIDACIÓN DE CONFIRMACIÓN)
 */
export const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    const user = await prisma.usuarios.findUnique({ where: { correo } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(contraseña, user.contraseña);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        correo: user.correo,
        rol: user.rol,
      },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    let id_cliente = null;
    if (user.rol === "cliente") {
      const cliente = await prisma.clientes.findUnique({
        where: { id_usuario: user.id_usuario },
        select: { id_cliente: true },
      });
      id_cliente = cliente?.id_cliente || null;
    }

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        id_cliente,
        foto: user.foto,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

/**
 * @desc Obtener todos los usuarios
 */
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.usuarios.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error en getUsers:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @desc Obtener usuario por ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = parseInt(id);

    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: idUsuario },
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const clienteData = await prisma.clientes.findFirst({
      where: { id_usuario: idUsuario },
    });

    const responseData = {
      ...user,
      telefono: clienteData?.telefono || "",
      direccion: clienteData?.direccion || "",
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error en getUserById:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @desc Actualizar usuario
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.usuarios.findUnique({
      where: { id_usuario: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const {
      nombre,
      correo,
      contraseña,
      rol,
      telefono,
      direccion,
      especialidad,
      fecha_ingreso,
    } = req.body;

    // ========= Actualizar tabla usuarios =========
    const updateData = {
      nombre,
      correo,
      rol: rol || existingUser.rol,
    };

    if (contraseña && contraseña.trim() !== "") {
      updateData.contraseña = await bcrypt.hash(contraseña, 10);
    }

    const updatedUser = await prisma.usuarios.update({
      where: { id_usuario: parseInt(id) },
      data: updateData,
    });

    const finalRole = updatedUser.rol;

    // ========= Actualizar cliente =========
    if (finalRole === "cliente") {
      await prisma.clientes.updateMany({
        where: { id_usuario: updatedUser.id_usuario },
        data: {
          telefono: telefono ?? undefined,
          direccion: direccion ?? undefined,
        },
      });
    }

    // ========= Actualizar mecanico =========
    if (finalRole === "mecanico") {
      await prisma.mecanicos.updateMany({
        where: { id_usuario: updatedUser.id_usuario },
        data: {
          telefono: telefono ?? undefined,
          especialidad: especialidad ?? undefined,
          fecha_ingreso: fecha_ingreso ?? undefined,
        },
      });
    }

    // ========= DEVOLVER TODO COMPLETO =========
    const fullUser = await prisma.usuarios.findUnique({
      where: { id_usuario: updatedUser.id_usuario },
      include: {
        cliente: true,
        mecanico: true,
      },
    });

    // ...
    res.json({
      message: "Usuario actualizado correctamente",
      user: {
        ...updatedUser,

        // Agregar datos extra según rol
        cliente:
          finalRole === "cliente"
            ? await prisma.clientes.findUnique({
                where: { id_usuario: updatedUser.id_usuario },
              })
            : null,

        mecanico:
          finalRole === "mecanico"
            ? await prisma.mecanicos.findUnique({
                where: { id_usuario: updatedUser.id_usuario },
              })
            : null,
      },
    });
  } catch (error) {
    console.error("Error en updateUser:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
export const updateUserr = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = parseInt(id);
    const { nombre, correo, contraseña, rol, telefono, direccion } = req.body;

    // 1. Construcción DINÁMICA del objeto updateDataUser
    const updateDataUser = {};
    if (nombre) updateDataUser.nombre = nombre;
    if (correo) updateDataUser.correo = correo;
    if (rol) updateDataUser.rol = rol;

    if (contraseña) {
      updateDataUser.contraseña = await bcrypt.hash(contraseña, 10);
    }

    let updatedUser = null;
    if (Object.keys(updateDataUser).length > 0) {
      updatedUser = await prisma.usuarios.update({
        where: { id_usuario: idUsuario },
        data: updateDataUser,
      });
    }

    // 2. Manejo de la tabla CLIENTES (Upsert)
    if (telefono !== undefined || direccion !== undefined) {
      const clienteExistente = await prisma.clientes.findFirst({
        where: { id_usuario: idUsuario },
      });

      if (clienteExistente) {
        await prisma.clientes.update({
          where: { id_cliente: clienteExistente.id_cliente },
          data: {
            telefono:
              telefono !== undefined ? telefono : clienteExistente.telefono,
            direccion:
              direccion !== undefined ? direccion : clienteExistente.direccion,
          },
        });
      } else {
        await prisma.clientes.create({
          data: {
            id_usuario: idUsuario,
            telefono: telefono || "",
            direccion: direccion || "",
          },
        });
      }
    }

    res.json({
      message: "Datos actualizados correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error en updateUser:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @desc Eliminar usuario
 */
/**
 * @desc Eliminar usuario
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.usuarios.delete({
      where: { id_usuario: parseInt(id) },
    });

    res.json({
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en deleteUser:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getUsersByRol = async (req, res) => {
  try {
    const { rol } = req.params;

    const users = await prisma.usuarios.findMany({
      where: { rol },
      include: {
        cliente: true,
        mecanico: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error en getUsersByRol:", error);
    res.status(500).json({ message: "Error interno", error: error.message });
  }
};

/**
 * @desc Cerrar sesión
 */
export const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logoutUser:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al cerrar sesión" });
  }
};

/**
 * @desc Subir foto de perfil (SOLUCIÓN BIGINT)
 * Usamos 'select' para que Prisma NO devuelva el ID del usuario y evite el error de serialización.
 */
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    // Convertimos el ID a número entero
    const idUsuario = parseInt(req.user.id_usuario);
    const filename = req.file.filename;

    console.log(`[Upload] Guardando foto para ID: ${idUsuario}`);

    // === SOLUCIÓN: Usamos select para traer SOLO la foto y evitar el ID gigante ===
    await prisma.usuarios.update({
      where: { id_usuario: idUsuario },
      data: { foto: filename },
      select: { foto: true },
    });

    res.json({
      message: "Foto actualizada correctamente",
      foto: filename,
    });
  } catch (error) {
    console.error("Error al subir foto:", error);
    res
      .status(500)
      .json({ message: "Error al guardar la imagen", error: error.message });
  }
};
/**
 * @desc Confirmar Cuenta (NUEVA FUNCIÓN)
 */
export const confirmAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const usuario = await prisma.usuarios.findFirst({
      where: { token: token },
    });

    if (!usuario) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Confirmar usuario y borrar el token
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        confirmado: true,
        token: null, // Borramos el token para que no se use de nuevo
      },
    });

    res.json({
      message: "Cuenta confirmada exitosamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al confirmar cuenta" });
  }
};

/**
 * @desc CONSULTAR DNI (Versión ApiMigo - Método POST)
 */
export const consultarDNI = async (req, res) => {
  const { dni } = req.params;

  // DNI de prueba
  if (dni === "12345678") {
    return res.json({ nombreCompleto: "Juan Perez Simulador" });
  }

  try {
    const response = await axios.get(`https://api.apimigo.com/dni/${dni}`, {
      headers: {
        Authorization: `Bearer ${process.env.API_MIGO_KEY}`,
      },
    });

    return res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error ApiMigo:", error.response.status);

      // 🔥 DEVUELVE EL ERROR REAL
      return res.status(error.response.status).json({
        message: "Error al consultar DNI",
        detalle: error.response.data,
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
