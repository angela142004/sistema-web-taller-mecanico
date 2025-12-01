// src/middlewares/upload.middleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// 1. Configuración para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Definir ruta de almacenamiento
// Esto guardará las fotos en: backend/uploads
const uploadDir = path.join(__dirname, "../../uploads");

// 3. Crear la carpeta si no existe (Seguridad para Windows/Linux)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 4. Configuración del Storage (Nombre y Destino)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generamos nombre único: Timestamp + Random + Extensión original
    // Ejemplo: 1730055_8832_foto.png
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 5. Filtro de Archivos (Solo imágenes)
const fileFilter = (req, file, cb) => {
  // Aceptamos jpg, jpeg, png, webp, gif, etc.
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Formato no válido. Por favor sube solo imágenes."), false);
  }
};

// 6. Exportar el middleware configurado
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5 MB
});
