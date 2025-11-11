import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"; // <-- nuevo
import { config } from "../config/env.js"; // <-- nuevo (asegúrate que existe)

const prisma = new PrismaClient();

/**
 * Helper: obtiene id_cliente a partir de req.user.id_usuario o tokenUser
 * Si no existe cliente asociado devuelve null.
 */
async function getClienteIdFromReq(req, tokenUser = null) {
  const userId =
    req.user?.id_usuario ||
    req.user?.id ||
    tokenUser?.id_usuario ||
    tokenUser?.id ||
    null;
  if (!userId) return null;
  const cliente = await prisma.clientes.findUnique({
    where: { id_usuario: Number(userId) },
    select: { id_cliente: true },
  });
  return cliente ? cliente.id_cliente : null;
}

/**
 * GET /vehiculos
 * - Si rol = admin (req.user.rol === 'admin') devuelve todos los vehiculos (opcional)
 * - Si es cliente devuelve solo sus vehiculos
 */
export const getVehiculos = async (req, res) => {
  console.log(
    "[CONTROLLER] getVehiculos called - method:",
    req.method,
    "url:",
    req.originalUrl,
    "from:",
    req.ip
  );
  try {
    const userRole = req.user?.rol;
    let where = {};

    if (userRole === "admin") {
      // sin filtro, devuelve todo (puedes añadir paginación)
      where = {};
    } else {
      const id_cliente = await getClienteIdFromReq(req);
      if (!id_cliente) {
        return res
          .status(403)
          .json({ message: "No autorizado o cliente no encontrado" });
      }
      where = { id_cliente };
    }

    const vehiculos = await prisma.vehiculos.findMany({
      where,
      include: {
        modelo: {
          include: { marca: true },
        },
      },
      orderBy: { id_vehiculo: "desc" },
    });

    res.json(vehiculos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener vehículos", error: error.message });
  }
};

/**
 * GET /vehiculos/:id
 * - Verifica que el vehículo exista y el cliente sea propietario (si no es admin)
 */
export const getVehiculoById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id_vehiculo: Number(id) },
      include: {
        modelo: { include: { marca: true } },
      },
    });
    if (!vehiculo)
      return res.status(404).json({ message: "Vehículo no encontrado" });

    const userRole = req.user?.rol;
    if (userRole !== "admin") {
      const id_cliente = await getClienteIdFromReq(req);
      if (!id_cliente || vehiculo.id_cliente !== id_cliente) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    res.json(vehiculo);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener vehículo", error: error.message });
  }
};

/**
 * POST /vehiculos
 * Body puede contener:
 *  - id_modelo, anio, placa
 *  - o marca, modelo (nombres) + anio, placa  -> se crearán/usaràn Marca/Modelo
 */
export const createVehiculo = async (req, res) => {
  try {
    console.log("[CREATE VEHICULO] body:", req.body);
    console.log("[CREATE VEHICULO] req.user:", req.user);
    console.log(
      "[CREATE VEHICULO] headers Authorization:",
      req.headers?.authorization || req.headers?.Authorization
    );

    // Intentar extraer user info desde req.user; si no existe, decodificar token como fallback
    let tokenUser = req.user;
    if (!tokenUser) {
      const auth = req.headers?.authorization || req.headers?.Authorization;
      if (auth && typeof auth === "string" && auth.startsWith("Bearer ")) {
        const tk = auth.split(" ")[1];
        try {
          const decoded = jwt.verify(tk, config.jwtSecret);
          console.log("[CREATE VEHICULO] decoded token:", decoded);
          tokenUser = {
            id_usuario: decoded.id_usuario ?? decoded.id ?? decoded.sub,
            rol: decoded.rol ?? decoded.role,
            correo: decoded.correo,
          };
        } catch (err) {
          console.warn(
            "[CREATE VEHICULO] token invalido o expirado:",
            err.message
          );
        }
      }
    }

    const {
      id_modelo,
      anio,
      placa,
      marca,
      modelo,
      id_cliente: idClientePayload,
    } = req.body;

    // validar campos básicos
    if (!placa || !anio || (!id_modelo && !(marca && modelo))) {
      return res.status(400).json({
        message:
          "Faltan campos obligatorios (placa, anio, modelo/marca o id_modelo)",
      });
    }

    // obtener id_modelo: si no viene, crear/buscar marca y modelo
    let modeloId = id_modelo ? Number(id_modelo) : null;

    if (!modeloId) {
      const marcaNombre = String(marca).trim();
      const modeloNombre = String(modelo).trim();

      let marcaRegistro = await prisma.marcas.findUnique({
        where: { nombre: marcaNombre },
      });
      if (!marcaRegistro) {
        marcaRegistro = await prisma.marcas.create({
          data: { nombre: marcaNombre },
        });
      }

      let modeloRegistro = await prisma.modelos.findFirst({
        where: { nombre: modeloNombre, id_marca: marcaRegistro.id_marca },
      });
      if (!modeloRegistro) {
        modeloRegistro = await prisma.modelos.create({
          data: { nombre: modeloNombre, id_marca: marcaRegistro.id_marca },
        });
      }
      modeloId = modeloRegistro.id_modelo;
    }

    // determinar id_cliente:
    let id_cliente = null;
    const userRole = tokenUser?.rol ?? req.user?.rol;
    const userId =
      tokenUser?.id_usuario ??
      tokenUser?.id ??
      req.user?.id_usuario ??
      req.user?.id ??
      null;

    if (userRole === "admin" && idClientePayload) {
      id_cliente = Number(idClientePayload);
      const existeCliente = await prisma.clientes.findUnique({
        where: { id_cliente },
      });
      if (!existeCliente) {
        return res
          .status(400)
          .json({ message: "id_cliente proporcionado no existe" });
      }
    } else {
      // obtener o crear cliente para el usuario autenticado (pasar tokenUser como fallback)
      id_cliente = await getClienteIdFromReq(req, tokenUser);
      if (!id_cliente) {
        if (!userId) {
          console.log(
            "[CREATE VEHICULO] userId no encontrado, devolviendo 403"
          );
          return res
            .status(403)
            .json({ message: "No autorizado o cliente no encontrado" });
        }
        // crear registro Clientes automáticamente
        console.log("[CREATE VEHICULO] Creando cliente para userId:", userId);
        const nuevoCliente = await prisma.clientes.create({
          data: {
            id_usuario: Number(userId),
            telefono: "",
            direccion: "",
          },
        });
        id_cliente = nuevoCliente.id_cliente;
        console.log(
          "[CREATE VEHICULO] Cliente creado automaticamente id_cliente=",
          id_cliente
        );
      } else {
        console.log(
          "[CREATE VEHICULO] Cliente encontrado id_cliente=",
          id_cliente
        );
      }
    }

    // crear vehículo
    const nuevo = await prisma.vehiculos.create({
      data: {
        id_cliente: Number(id_cliente),
        id_modelo: Number(modeloId),
        anio: Number(anio),
        placa: String(placa).trim(),
      },
    });

    const vehiculoCreado = await prisma.vehiculos.findUnique({
      where: { id_vehiculo: nuevo.id_vehiculo },
      include: { modelo: { include: { marca: true } } },
    });

    res.status(201).json(vehiculoCreado);
  } catch (error) {
    console.error("[CREATE VEHICULO] error:", error);
    if (error.code === "P2002" && error.meta?.target?.includes("placa")) {
      return res.status(400).json({ message: "La placa ya está registrada" });
    }
    res
      .status(500)
      .json({ message: "Error al crear vehículo", error: error.message });
  }
};

/**
 * PUT /vehiculos/:id
 * Permite actualizar anio, placa, id_modelo o marca/modelo (si se pasan nombres)
 * Verifica propiedad (cliente) a menos que sea admin.
 */
export const updateVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_modelo, anio, placa, marca, modelo } = req.body;

    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id_vehiculo: Number(id) },
    });
    if (!vehiculo)
      return res.status(404).json({ message: "Vehículo no encontrado" });

    const userRole = req.user?.rol;
    if (userRole !== "admin") {
      const id_cliente = await getClienteIdFromReq(req);
      if (!id_cliente || vehiculo.id_cliente !== id_cliente) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    // resolver id_modelo si se pasan marca/modelo
    let modeloId = id_modelo ? Number(id_modelo) : null;
    if (!modeloId && marca && modelo) {
      const marcaNombre = String(marca).trim();
      const modeloNombre = String(modelo).trim();

      let marcaRegistro = await prisma.marcas.findUnique({
        where: { nombre: marcaNombre },
      });
      if (!marcaRegistro) {
        marcaRegistro = await prisma.marcas.create({
          data: { nombre: marcaNombre },
        });
      }

      let modeloRegistro = await prisma.modelos.findFirst({
        where: { nombre: modeloNombre, id_marca: marcaRegistro.id_marca },
      });
      if (!modeloRegistro) {
        modeloRegistro = await prisma.modelos.create({
          data: { nombre: modeloNombre, id_marca: marcaRegistro.id_marca },
        });
      }
      modeloId = modeloRegistro.id_modelo;
    }

    const dataToUpdate = {};
    if (modeloId) dataToUpdate.id_modelo = Number(modeloId);
    if (anio) dataToUpdate.anio = Number(anio);
    if (placa) dataToUpdate.placa = String(placa).trim();

    const updated = await prisma.vehiculos.update({
      where: { id_vehiculo: Number(id) },
      data: dataToUpdate,
    });

    const vehiculoActualizado = await prisma.vehiculos.findUnique({
      where: { id_vehiculo: updated.id_vehiculo },
      include: { modelo: { include: { marca: true } } },
    });

    res.json(vehiculoActualizado);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002" && error.meta?.target?.includes("placa")) {
      return res.status(400).json({ message: "La placa ya está registrada" });
    }
    res
      .status(500)
      .json({ message: "Error al actualizar vehículo", error: error.message });
  }
};

/**
 * DELETE /vehiculos/:id
 * Verifica propiedad (cliente) a menos que sea admin.
 */
export const deleteVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await prisma.vehiculos.findUnique({
      where: { id_vehiculo: Number(id) },
    });
    if (!vehiculo)
      return res.status(404).json({ message: "Vehículo no encontrado" });

    const userRole = req.user?.rol;
    if (userRole !== "admin") {
      const id_cliente = await getClienteIdFromReq(req);
      if (!id_cliente || vehiculo.id_cliente !== id_cliente) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    await prisma.vehiculos.delete({ where: { id_vehiculo: Number(id) } });
    res.json({ message: "Vehículo eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al eliminar vehículo", error: error.message });
  }
};
