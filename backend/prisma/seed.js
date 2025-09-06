import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Crear usuario administrador inicial
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuarios.upsert({
    where: { correo: "admin@mail.com" },
    update: {},
    create: {
      nombre: "Administrador",
      correo: "admin@mail.com",
      contraseña: hashedPassword,
      rol: "admin", // 👈 ENUM Rol
    },
  });
  console.log("Usuario admin creado o existente:", admin);

  // Crear algunos servicios iniciales
  const servicios = [
    {
      nombre: "Mantenimiento General",
      descripcion: "Revisión completa del vehículo",
    },
    { nombre: "Cambio de Aceite", descripcion: "Cambio de aceite y filtro" },
    {
      nombre: "Frenos",
      descripcion: "Revisión y cambio de pastillas de freno",
    },
  ];

  for (const s of servicios) {
    await prisma.servicios.upsert({
      where: { nombre: s.nombre },
      update: {},
      create: s,
    });
  }
  console.log("Servicios básicos insertados.");

  // Crear marcas iniciales
  const marcas = ["Toyota", "Nissan", "Ford", "Hyundai"];
  for (const nombre of marcas) {
    await prisma.marcas.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log("Marcas insertadas.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
