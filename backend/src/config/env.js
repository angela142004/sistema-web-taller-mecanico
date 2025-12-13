import dotenv from "dotenv";

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL,

  // 🔐 JWT (SIN fallback en producción)
  jwtSecret: process.env.JWT_SECRET,

  // 🌐 FRONTEND (OBLIGATORIO)
  frontendUrl: process.env.FRONTEND_URL,

  // 🌍 CORS
  corsOrigin: process.env.CORS_ORIGIN,

  // 🚀 SERVER
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || "production",
};
