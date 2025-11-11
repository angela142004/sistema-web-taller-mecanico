import dotenv from "dotenv";

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "tu-clave-secreta-super-segura-2024", // fallback para desarrollo
  apiKey: process.env.API_KEY,
  corsOrigin: process.env.CORS_ORIGIN,
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
};
