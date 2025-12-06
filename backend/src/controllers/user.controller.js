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
    const { nombre, correo, contraseña, rol } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // 1. VALIDACIÓN DE GMAIL 📧
    if (!correo.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ message: "Solo se permiten correos de Gmail (@gmail.com)" });
    }

    const existingUser = await prisma.usuarios.findUnique({
      where: { correo },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Generar un token único aleatorio
    const tokenConfirmacion = crypto.randomBytes(20).toString("hex");

    // Crear usuario (confirmado = false por defecto en BD)
    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        contraseña: hashedPassword,
        rol: "cliente", // Forzamos cliente por defecto en registro público
        token: tokenConfirmacion, // Guardamos el token
        confirmado: false,
      },
    });

    // Crear registro en tabla clientes
    await prisma.clientes.create({
      data: { id_usuario: newUser.id_usuario, telefono: "", direccion: "" },
    });

    // 2. ENVIAR CORREO 📧
    // Ajusta el enlace al puerto de tu FRONTEND (ej: 5173)
    const urlConfirmacion = `http://localhost:5173/confirmar/${tokenConfirmacion}`;

    await transporter.sendMail({
      from: '"Soporte Taller Mecánico" <tu_correo_real@gmail.com>',
      to: correo,
      subject: "Confirma tu cuenta - Taller Mecánico",
      html: `
        <h1>Bienvenido ${nombre}</h1>
        <p>Para activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
        <a href="${urlConfirmacion}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Cuenta</a>
        <p>Si no te registraste, ignora este correo.</p>
      `,
    });

    res.status(201).json({
      message: "Usuario registrado. Revisa tu Gmail para confirmar la cuenta.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al registrar", error: error.message });
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
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // 3. VALIDAR SI ESTÁ CONFIRMADO
    if (!user.confirmado) {
      return res
        .status(403)
        .json({
          message: "Tu cuenta no ha sido confirmada. Revisa tu correo.",
        });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    // ... (El resto de tu lógica de token y response sigue igual) ...
    const token = jwt.sign(
      { id_usuario: user.id_usuario, correo: user.correo, rol: user.rol },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    let id_cliente = null;
    if (user.rol === "cliente") {
      const cliente = await prisma.clientes.findUnique({
        where: { id_usuario: user.id_usuario },
        select: { id_cliente: true },
      });
      id_cliente = cliente ? cliente.id_cliente : null;
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
    console.error("Error en login:", error);
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
