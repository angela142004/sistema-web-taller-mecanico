// routes/user.routes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  logoutUser,
  deleteUser,
  uploadProfilePhoto,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

// ✅ ESTA ES LA LÍNEA QUE FALTABA:
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Registro de usuario
router.post("/register", registerUser);

// Login de usuario
router.post("/login", loginUser);

// Obtener todos los usuarios (protegido con JWT)
router.get("/users", verifyToken, getUsers);

// Obtener un usuario por ID (protegido con JWT)
router.get("/users/:id", verifyToken, getUserById);

// Actualizar usuario (protegido con JWT)
router.put("/users/:id", verifyToken, updateUser);

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
