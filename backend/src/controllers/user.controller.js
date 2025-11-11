// controllers/user.controller.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

const prisma = new PrismaClient();

// 📌 Registrar usuario
export const registerUser = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // Validar campos obligatorios
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

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario
    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        contraseña: hashedPassword,
        rol: rolFinal,
      },
    });

    // --- NUEVO: Si el usuario es cliente, crear registro automáticamente en Clientes ---
    if (rolFinal === "cliente") {
      await prisma.clientes.create({
        data: {
          id_usuario: newUser.id_usuario,
          telefono: "", // puede actualizarse después
          direccion: "",
        },
      });
      console.log(
        "[REGISTER] Cliente creado automáticamente para usuario:",
        newUser.id_usuario
      );
    }
    // --- FIN NUEVO ---

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

// 📌 Login de usuario
export const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Buscar usuario por correo
    const user = await prisma.usuarios.findUnique({ where: { correo } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Crear token JWT (asegurar que incluye id_usuario, correo, rol)
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        correo: user.correo,
        rol: user.rol,
      },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    console.log(
      "[LOGIN] Token creado para usuario:",
      user.id_usuario,
      "rol:",
      user.rol
    );

    // Devolver token + user completo
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al iniciar sesión", error: error.message });
  }
};

// 📌 Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        rol: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }
};

// 📌 Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.usuarios.findUnique({
      where: { id_usuario: Number(id) },
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        rol: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: error.message });
  }
};

// 📌 Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, contraseña, rol } = req.body;

    const hashedPassword = contraseña
      ? await bcrypt.hash(contraseña, 10)
      : undefined;

    const updatedUser = await prisma.usuarios.update({
      where: { id_usuario: Number(id) },
      data: {
        nombre,
        correo,
        rol,
        ...(hashedPassword && { contraseña: hashedPassword }),
      },
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        rol: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};

// 📌 Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.usuarios.delete({
      where: { id_usuario: Number(id) },
    });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error al eliminar el usuario", error: error.message });
  }
};

// 📌 NUEVO: Sincronizar clientes (crea entradas faltantes en tabla Clientes)
export const syncClientes = async (req, res) => {
  try {
    // Buscar todos los usuarios con rol "cliente" que no tienen entrada en Clientes
    const usuariosCliente = await prisma.usuarios.findMany({
      where: { rol: "cliente" },
    });

    let creados = 0;
    for (const usuario of usuariosCliente) {
      const clienteExiste = await prisma.clientes.findUnique({
        where: { id_usuario: usuario.id_usuario },
      });

      if (!clienteExiste) {
        await prisma.clientes.create({
          data: {
            id_usuario: usuario.id_usuario,
            telefono: "",
            direccion: "",
          },
        });
        creados++;
        console.log("[SYNC] Cliente creado para usuario:", usuario.id_usuario);
      }
    }

    res.json({
      message: `Sincronización completada. ${creados} clientes creados.`,
      creados,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al sincronizar clientes",
      error: error.message,
    });
  }
};
