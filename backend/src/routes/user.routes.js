// routes/user.routes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  confirmAccount,
  getUserById,
  updateUser,
  updateUserr,
  logoutUser,
  deleteUser,
  getUsersByRol,
  uploadProfilePhoto,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Registro de usuario
router.post("/register", registerUser);
router.get("/confirmar/:token", confirmAccount);
// Login de usuario
router.post("/login", loginUser);

// Obtener todos los usuarios (protegido con JWT)
router.get("/users", verifyToken, getUsers);
// ⭐⭐⭐ Nueva ruta: obtener usuarios por rol
router.get("/users/rol/:rol", verifyToken, getUsersByRol);
// Obtener un usuario por ID (protegido con JWT)
router.get("/users/:id", verifyToken, getUserById);

// Actualizar usuario (protegido con JWT)
router.put("/users/:id", verifyToken, updateUser);

// Actualizar usuario (protegido con JWT)
router.put("/users/:id", verifyToken, updateUserr);

// Eliminar usuario (protegido con JWT)
router.delete("/users/:id", verifyToken, deleteUser);

// 'foto' es el nombre del campo que debe enviar el Frontend en el FormData
// Ahora sí funcionará porque 'upload' ya está importado arriba
router.post(
  "/upload-photo",
  verifyToken,
  upload.single("foto"),
  uploadProfilePhoto
);

router.post("/logout", logoutUser);

export default router;
