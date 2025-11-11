// routes/user.routes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  syncClientes,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Registro de usuario
router.post("/register", registerUser);

// Login de usuario
router.post("/login", loginUser);

// 🆕 Sincronizar clientes (crear entradas faltantes en tabla Clientes)
router.post("/sync-clientes", verifyToken, syncClientes);

// Obtener todos los usuarios (protegido con JWT)
router.get("/users", verifyToken, getUsers);

// Obtener un usuario por ID (protegido con JWT)
router.get("/users/:id", verifyToken, getUserById);

// Actualizar usuario (protegido con JWT)
router.put("/users/:id", verifyToken, updateUser);

// Eliminar usuario (protegido con JWT)
router.delete("/users/:id", verifyToken, deleteUser);

export default router;
