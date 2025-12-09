import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // ===========================
  // 🧍 Crear usuario administrador inicial
  // ===========================
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuarios.upsert({
    where: { correo: "admin@mail.com" },
    update: {
      confirmado: true, // ✅ por si ya existía
    },
    create: {
      nombre: "Administrador",
      correo: "admin@mail.com",
      contraseña: hashedPassword,
      rol: "admin",
      confirmado: true, // ✅ acceso inmediato
    },
  });

  console.log("✅ Usuario admin creado o existente:", admin.correo);

  // ===========================
  // 🧰 Limpiar tabla de servicios antes de insertar nuevos
  // ===========================
  await prisma.servicios.deleteMany();
  console.log("🗑️ Todos los servicios anteriores fueron eliminados.");

  // 🔁 Reiniciar contador de ID (secuencia autoincremental)
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE "Servicios_id_servicio_seq" RESTART WITH 1;`
  );
  console.log("🔄 Secuencia de IDs de Servicios reiniciada.");

  // ===========================
  // 🧰 Insertar todos los servicios iniciales con duración
  // ===========================
  const servicios = [
    { nombre: "Revisión general", duracion: 120 },
    { nombre: "Mantenimiento preventivo", duracion: 180 },
    { nombre: "Cambio de aceite y filtro", duracion: 60 },
    { nombre: "Cambio de filtros (aire, cabina, combustible)", duracion: 60 },
    { nombre: "Revisión de luces y sistema eléctrico", duracion: 45 },
    { nombre: "Batería (prueba/cambio)", duracion: 30 },
    { nombre: "Alternador (reparación/cambio)", duracion: 90 },
    { nombre: "Arranque (motor de arranque)", duracion: 90 },
    { nombre: "Sistema de frenos (inspección general)", duracion: 60 },
    { nombre: "Cambio de pastillas de freno", duracion: 60 },
    { nombre: "Cambio de discos/tambores", duracion: 90 },
    { nombre: "Rectificado de discos", duracion: 60 },
    { nombre: "Purgado de frenos", duracion: 45 },
    { nombre: "Líquido de frenos (cambio)", duracion: 45 },
    { nombre: "Suspensión (amortiguadores, bujes, rótulas)", duracion: 120 },
    { nombre: "Dirección (terminales, axiales, cremallera)", duracion: 120 },
    { nombre: "Alineación y balanceo", duracion: 90 },
    { nombre: "Embrague (revisión/cambio)", duracion: 180 },
    { nombre: "Caja de cambios (mecánica/automática)", duracion: 240 },
    { nombre: "Diferencial (servicio)", duracion: 150 },
    { nombre: "Transmisión (homocinéticas, ejes)", duracion: 150 },
    { nombre: "Correa de distribución (cambio kit)", duracion: 180 },
    { nombre: "Correa de accesorios (cambio)", duracion: 60 },
    { nombre: "Bomba de agua (cambio)", duracion: 120 },
    { nombre: "Sistema de enfriamiento (radiador, mangueras)", duracion: 120 },
    { nombre: "Refrigerante (flushing/cambio)", duracion: 60 },
    { nombre: "Aire acondicionado (carga de gas, diagnóstico)", duracion: 90 },
    { nombre: "Compresor de A/C (reparación/cambio)", duracion: 150 },
    { nombre: "Inyección electrónica (limpieza de inyectores)", duracion: 90 },
    { nombre: "Cuerpo de aceleración (limpieza)", duracion: 60 },
    { nombre: "Bomba de combustible (diagnóstico/cambio)", duracion: 90 },
    { nombre: "Afinamiento/puesta a punto", duracion: 120 },
    { nombre: "Escape/catalizador (revisión/reemplazo)", duracion: 120 },
    { nombre: "Turbo (diagnóstico/mantenimiento)", duracion: 120 },
    { nombre: "Sensor O2/MAF/Map (diagnóstico/reemplazo)", duracion: 60 },
    { nombre: "Revisión técnica vehicular (pre-ITV)", duracion: 60 },
    { nombre: "Elevavidrios/cerraduras (eléctricas)", duracion: 60 },
    { nombre: "Pulido/encerado", duracion: 120 },
    { nombre: "Lavado de motor", duracion: 45 },
    { nombre: "Programación de llaves/controles", duracion: 30 },
    { nombre: "Calibración de sensores (TPMS/ADAS básico)", duracion: 60 },
  ];

  for (const { nombre, duracion } of servicios) {
    await prisma.servicios.create({
      data: {
        nombre,
        descripcion: `Servicio de ${nombre.toLowerCase()}`,
        duracion,
      },
    });
  }
  console.log(`✅ ${servicios.length} servicios insertados correctamente.`);

  // ===========================
  // 🚗 Limpiar Marcas y Modelos antes de insertar nuevos
  // ===========================
  await prisma.modelos.deleteMany();
  await prisma.marcas.deleteMany();
  console.log("🗑️ Marcas y modelos anteriores eliminados.");

  // 🔁 Reiniciar secuencias de Marcas y Modelos
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE "Marcas_id_marca_seq" RESTART WITH 1;`
  );
  await prisma.$executeRawUnsafe(
    `ALTER SEQUENCE "Modelos_id_modelo_seq" RESTART WITH 1;`
  );
  console.log("🔄 Secuencias de Marcas y Modelos reiniciadas.");

  // ===========================
  // 🚘 Crear marcas y modelos iniciales
  // ===========================
  const dataMarcasModelos = [
    {
      nombre: "Toyota",
      modelos: ["Corolla", "Hilux", "Yaris", "RAV4"],
    },
    {
      nombre: "Nissan",
      modelos: ["Sentra", "Versa", "Frontier", "Kicks"],
    },
    {
      nombre: "Ford",
      modelos: ["Ranger", "Focus", "Explorer", "Fiesta"],
    },
    {
      nombre: "Hyundai",
      modelos: ["Elantra", "Tucson", "Santa Fe", "Accent"],
    },
  ];

  for (const marcaData of dataMarcasModelos) {
    const marca = await prisma.marcas.create({
      data: { nombre: marcaData.nombre },
    });

    for (const nombreModelo of marcaData.modelos) {
      await prisma.modelos.create({
        data: {
          nombre: nombreModelo,
          id_marca: marca.id_marca,
        },
      });
    }

    console.log(`✅ Marca ${marca.nombre} y sus modelos insertados.`);
  }

  // ===========================
  // 👥 Crear usuario cliente de prueba
  // ===========================
  const hashedClientePassword = await bcrypt.hash("cliente123", 10);

  const clienteUser = await prisma.usuarios.upsert({
    where: { correo: "cliente@mail.com" },
    update: {
      confirmado: true,
    },
    create: {
      nombre: "Cliente Prueba",
      correo: "cliente@mail.com",
      contraseña: hashedClientePassword,
      rol: "cliente",
      confirmado: true,
    },
  });

  console.log("✅ Usuario cliente creado o existente:", clienteUser.correo);

  // --- NUEVO: Crear entrada en Clientes si no existe ---
  const clienteExiste = await prisma.clientes.findUnique({
    where: { id_usuario: clienteUser.id_usuario },
  });

  if (!clienteExiste) {
    await prisma.clientes.create({
      data: {
        id_usuario: clienteUser.id_usuario,
        telefono: "+34 123 456 789",
        direccion: "Calle Principal 123",
      },
    });
    console.log("✅ Entrada en Clientes creada para:", clienteUser.correo);
  } else {
    console.log("ℹ️ Cliente ya existe en tabla Clientes");
  }

  // ===========================
  // 🔧 Sincronizar clientes existentes SIN entrada en tabla Clientes
  // ===========================
  const usuariosCliente = await prisma.usuarios.findMany({
    where: { rol: "cliente" },
  });

  let sincronizados = 0;
  for (const usuario of usuariosCliente) {
    const clienteRegistrado = await prisma.clientes.findUnique({
      where: { id_usuario: usuario.id_usuario },
    });

    if (!clienteRegistrado) {
      await prisma.clientes.create({
        data: {
          id_usuario: usuario.id_usuario,
          telefono: "",
          direccion: "",
        },
      });
      sincronizados++;
      console.log("✅ Sincronizado cliente para usuario:", usuario.id_usuario);
    }
  }

  if (sincronizados > 0) {
    console.log(
      `🔄 ${sincronizados} clientes sincronizados en tabla Clientes.`
    );
  } else {
    console.log("ℹ️ Todos los clientes ya están en tabla Clientes.");
  }
}

// ===========================
// 🔚 Ejecutar el seeding
// ===========================
main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🌱 Seed ejecutado correctamente.");
  })
  .catch(async (e) => {
    console.error("❌ Error ejecutando el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
