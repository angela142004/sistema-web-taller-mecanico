// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const verifyToken = (req, res, next) => {
  try {
    const auth = req.headers?.authorization || req.headers?.Authorization;
    console.log(
      "[VERIFY TOKEN] Authorization header:",
      auth ? "presente" : "ausente"
    );

    if (!auth || !auth.startsWith("Bearer ")) {
      console.log("[VERIFY TOKEN] No bearer token found");
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = auth.split(" ")[1];
    console.log("[VERIFY TOKEN] Token recibido, decodificando...");

    const decoded = jwt.verify(token, config.jwtSecret);
    console.log("[VERIFY TOKEN] Token decodificado:", decoded);

    // Llenar req.user con la estructura correcta
    req.user = {
      id_usuario: decoded.id_usuario,
      correo: decoded.correo,
      rol: decoded.rol,
    };
    console.log("[VERIFY TOKEN] req.user asignado:", req.user);

    next();
  } catch (error) {
    console.error("[VERIFY TOKEN] Error:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
