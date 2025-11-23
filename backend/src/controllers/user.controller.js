// src/controllers/user.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/env.js";

const prisma = new PrismaClient();

/**
 * @desc Registrar nuevo usuario
 */
export const registerUser = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !correo || !contraseña) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Validar rol
    const rolValido = ["cliente", "mecanico", "admin"];
    const rolFinal = rolValido.includes(rol) ? rol : "cliente";

    // Validar si el usuario ya existe (por nombre o correo)
    const existingUser = await prisma.usuarios.findFirst({
      where: {
        OR: [{ nombre: nombre }, { correo: correo }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario en la base de datos
    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        contraseña: hashedPassword,
        rol: rolFinal,
      },
    });

    // Si es cliente, crear registro en tabla clientes
    if (rolFinal === "cliente") {
      await prisma.clientes.create({
        data: {
          id_usuario: newUser.id_usuario,
          telefono: "", // puede actualizarse después
          direccion: "",
        },
      });
    }

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id_usuario: newUser.id_usuario,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

/**
 * @desc Iniciar sesión
 */
export const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res
        .status(400)
        .json({ message: "Correo y contraseña requeridos" });
    }

    const user = await prisma.usuarios.findUnique({
      where: { correo },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear token con duración de 24h
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        correo: user.correo,
        rol: user.rol,
      },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    // Si el usuario es cliente, obtener id_cliente
    let id_cliente = null;
    if (user.rol === "cliente") {
      const cliente = await prisma.clientes.findUnique({
        where: { id_usuario: user.id_usuario },
        select: { id_cliente: true },
      });
      id_cliente = cliente ? cliente.id_cliente : null;
    }

    // Devolver token y datos del usuario
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        id_cliente,
      },
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(500).json({ message: "Error interno del servidor" });
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
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
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
    const { nombre, correo, contraseña, rol } = req.body;

    const updateData = { nombre, correo, rol };
    if (contraseña) {
      updateData.contraseña = await bcrypt.hash(contraseña, 10);
    }

    const updatedUser = await prisma.usuarios.update({
      where: { id_usuario: parseInt(id) },
      data: updateData,
    });

    res.json({
      message: "Usuario actualizado correctamente",
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
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.usuarios.delete({
      where: { id_usuario: parseInt(id) },
    });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error en deleteUser:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
