import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import dayjs from "dayjs";

const prisma = new PrismaClient();

/**
 * Obtener todas las reservas
 */
export const getReservas = async (req, res) => {
  try {
    const reservas = await prisma.reservas.findMany({
      include: {
        cliente: { include: { usuario: true } },
        vehiculo: { include: { modelo: true } },
        servicio: true,
      },
      orderBy: { fecha: "desc" },
    });
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

/**
 * Obtener reserva por ID
 */
export const getReservaById = async (req, res) => {
  const { id } = req.params;
  try {
    const reserva = await prisma.reservas.findUnique({
      where: { id_reserva: Number(id) },
      include: {
        cliente: { include: { usuario: true } },
        vehiculo: { include: { modelo: true } },
        servicio: true,
      },
    });

    if (!reserva)
      return res.status(404).json({ error: "Reserva no encontrada" });

    res.json(reserva);
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    res.status(500).json({ error: "Error al obtener reserva" });
  }
};

/**
/**
 * Crear nueva reserva
 */
export const createReserva = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "Token no proporcionado" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const cliente = await prisma.clientes.findUnique({
      where: { id_usuario: decoded.id_usuario },
    });

    if (!cliente)
      return res.status(404).json({ error: "Cliente no encontrado" });

    const { id_vehiculo, id_servicio, fecha, hora_inicio } = req.body;

    if (!id_vehiculo || !id_servicio || !fecha || !hora_inicio)
      return res.status(400).json({ error: "Faltan datos obligatorios" });

    // Obtener duración en minutos
    const servicio = await prisma.servicios.findUnique({
      where: { id_servicio: Number(id_servicio) },
      select: { duracion: true },
    });

    if (!servicio)
      return res.status(404).json({ error: "Servicio no encontrado" });

    // Normalizar fecha DD/MM/YYYY a YYYY-MM-DD
    let fechaISO = fecha;
    if (fecha.includes("/")) {
      const [dia, mes, anio] = fecha.split("/");
      fechaISO = `${anio}-${mes}-${dia}`;
    }

    // Convertir hora_inicio en minutos totales
    const [hInicio, mInicio] = hora_inicio.split(":").map(Number);
    const minutosTotales = hInicio * 60 + mInicio + servicio.duracion;

    // Calcular hora_fin
    const horaFinHoras = Math.floor(minutosTotales / 60);
    const horaFinMinutos = minutosTotales % 60;
    const hora_fin = `${String(horaFinHoras).padStart(2, "0")}:${String(
      horaFinMinutos
    ).padStart(2, "0")}`;

    // Construir fecha sin conversión a UTC
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    const fechaDate = new Date(anio, mes - 1, dia, 0, 0, 0);

    // Contar cuántas reservas del mismo servicio ya existen en ese horario
    const reservasSimultaneas = await prisma.reservas.count({
      where: {
        id_servicio: Number(id_servicio),
        fecha: fechaDate,
        hora_inicio: hora_inicio,
      },
    });

    if (reservasSimultaneas >= 3)
      return res
        .status(409)
        .json({ error: "No hay disponibilidad para este servicio a esa hora" });

    // Crear reserva
    const nuevaReserva = await prisma.reservas.create({
      data: {
        id_cliente: cliente.id_cliente,
        id_vehiculo: Number(id_vehiculo),
        id_servicio: Number(id_servicio),
        fecha: fechaDate,
        hora_inicio,
        hora_fin,
        estado: "PENDIENTE",
      },
      include: {
        servicio: true,
        vehiculo: true,
        cliente: { include: { usuario: true } },
      },
    });

    res.status(201).json({
      message: "Reserva creada exitosamente",
      reserva: nuevaReserva,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ error: "Error al crear reserva" });
  }
};

/**
 * Actualizar estado
 */
export const updateReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const reservaActualizada = await prisma.reservas.update({
      where: { id_reserva: Number(id) },
      data: { estado },
    });

    res.json({
      message: "Estado actualizado",
      reserva: reservaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    res.status(500).json({ error: "Error al actualizar la reserva" });
  }
};

/**
 * Eliminar reserva
 */
export const deleteReserva = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.reservas.delete({
      where: { id_reserva: Number(id) },
    });

    res.json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(500).json({ error: "Error al eliminar la reserva" });
  }
};
/**
 * Obtener horas ocupadas por fecha
 * GET /mecanica/reservas/horas?fecha=YYYY-MM-DD
 */
export const getHorasOcupadas = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) return res.status(400).json({ error: "La fecha es requerida" });

    // Convertir YYYY-MM-DD → Date
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const fechaDate = new Date(anio, mes - 1, dia, 0, 0, 0);

    // Buscar reservas del día
    const reservas = await prisma.reservas.findMany({
      where: { fecha: fechaDate },
      select: { hora_inicio: true, hora_fin: true },
    });

    res.json({
      horasOcupadas: reservas,
    });
  } catch (error) {
    console.error("Error al obtener horas ocupadas:", error);
    res.status(500).json({ error: "Error al obtener horas ocupadas" });
  }
};
/**
 /**
 * Obtener reservas del cliente autenticado
 * GET /mecanica/reservas/cliente
 */
export const getReservasCliente = async (req, res) => {
  try {
    // 1️⃣ Verificar que venga el token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // 3️⃣ Obtener el cliente asociado al usuario
    const cliente = await prisma.clientes.findUnique({
      where: { id_usuario: decoded.id_usuario },
    });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // 4️⃣ Obtener solo las reservas, con lo mínimo necesario para el dashboard
    const reservas = await prisma.reservas.findMany({
      where: { id_cliente: cliente.id_cliente },
      include: {
        vehiculo: {
          include: {
            modelo: {
              include: { marca: true }, // para mostrar marca y modelo
            },
          },
        },
        servicio: true, // para mostrar nombre del servicio
      },
      orderBy: { fecha: "desc" },
    });

    // 5️⃣ Devolver reservas
    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas del cliente:", error);
    res.status(500).json({ error: "Error al obtener reservas del cliente" });
  }
};
