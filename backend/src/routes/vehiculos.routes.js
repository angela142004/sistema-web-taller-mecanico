import { Router } from "express";
import {
  getVehiculos,
  getVehiculoById,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from "../controllers/vehiculos.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ⚠️ CRÍTICO: Rutas SIN parámetros PRIMERO
// 1. /test-auth (diagnóstico)
router.get("/test-auth", (req, res) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  console.log("[TEST-AUTH] Authorization header:", auth);
  res.json({
    authHeaderPresent: !!auth,
    authHeader: auth || "NO HEADER",
    method: req.method,
    url: req.originalUrl,
  });
});

// 2. Rutas con verifyToken (en orden)
router.get("/", verifyToken, getVehiculos); // GET /vehiculos
router.post("/", verifyToken, createVehiculo); // POST /vehiculos
router.put("/:id", verifyToken, updateVehiculo); // PUT /vehiculos/:id
router.delete("/:id", verifyToken, deleteVehiculo); // DELETE /vehiculos/:id
router.get("/:id", verifyToken, getVehiculoById); // GET /vehiculos/:id (ÚLTIMA, es catch-all)

export default router;
