-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('cliente', 'mecanico', 'admin');

-- CreateEnum
CREATE TYPE "public"."EstadoReserva" AS ENUM ('pendiente', 'aprobado', 'cotizado', 'facturado', 'cancelado');

-- CreateEnum
CREATE TYPE "public"."EstadoAsignacion" AS ENUM ('pendiente', 'en_proceso', 'finalizado', 'cancelado');

-- CreateEnum
CREATE TYPE "public"."EstadoCotizacion" AS ENUM ('cotizado', 'aprobado', 'facturado');

-- CreateEnum
CREATE TYPE "public"."EstadoAtencion" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "public"."Usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "contraseña" VARCHAR(255) NOT NULL,
    "rol" "public"."Rol" NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."Clientes" (
    "id_cliente" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "direccion" VARCHAR(150) NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "public"."Mecanicos" (
    "id_mecanico" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "especialidad" VARCHAR(100) NOT NULL,
    "fecha_ingreso" DATE NOT NULL,

    CONSTRAINT "Mecanicos_pkey" PRIMARY KEY ("id_mecanico")
);

-- CreateTable
CREATE TABLE "public"."Vehiculos" (
    "id_vehiculo" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_modelo" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "placa" VARCHAR(15) NOT NULL,

    CONSTRAINT "Vehiculos_pkey" PRIMARY KEY ("id_vehiculo")
);

-- CreateTable
CREATE TABLE "public"."Modelos" (
    "id_modelo" SERIAL NOT NULL,
    "id_marca" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "Modelos_pkey" PRIMARY KEY ("id_modelo")
);

-- CreateTable
CREATE TABLE "public"."Marcas" (
    "id_marca" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "Marcas_pkey" PRIMARY KEY ("id_marca")
);

-- CreateTable
CREATE TABLE "public"."Repuestos" (
    "id_repuesto" SERIAL NOT NULL,
    "descripcion" VARCHAR(150) NOT NULL,
    "id_marca" INTEGER NOT NULL,
    "id_modelo" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "precio_compra" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Repuestos_pkey" PRIMARY KEY ("id_repuesto")
);

-- CreateTable
CREATE TABLE "public"."Servicios" (
    "id_servicio" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "duracion" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "Servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "public"."Reservas" (
    "id_reserva" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_vehiculo" INTEGER NOT NULL,
    "id_servicio" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fin" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoAtencion" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "Reservas_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateTable
CREATE TABLE "public"."Asignaciones" (
    "id_asignacion" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "id_mecanico" INTEGER NOT NULL,
    "fecha_asignacion" DATE NOT NULL,
    "estado" "public"."EstadoAsignacion" NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "Asignaciones_pkey" PRIMARY KEY ("id_asignacion")
);

-- CreateTable
CREATE TABLE "public"."Historial_Servicios" (
    "id_historial" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "id_mecanico" INTEGER NOT NULL,
    "descripcion" TEXT,
    "fecha" DATE NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Historial_Servicios_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "public"."Cotizaciones" (
    "id_cotizacion" SERIAL NOT NULL,
    "id_reserva" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" "public"."EstadoCotizacion" NOT NULL,

    CONSTRAINT "Cotizaciones_pkey" PRIMARY KEY ("id_cotizacion")
);

-- CreateTable
CREATE TABLE "public"."Facturas" (
    "id_factura" SERIAL NOT NULL,
    "id_cotizacion" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_correo_key" ON "public"."Usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Clientes_id_usuario_key" ON "public"."Clientes"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Mecanicos_id_usuario_key" ON "public"."Mecanicos"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculos_placa_key" ON "public"."Vehiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "Marcas_nombre_key" ON "public"."Marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Servicios_nombre_key" ON "public"."Servicios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cotizaciones_id_reserva_key" ON "public"."Cotizaciones"("id_reserva");

-- CreateIndex
CREATE UNIQUE INDEX "Facturas_id_cotizacion_key" ON "public"."Facturas"("id_cotizacion");

-- AddForeignKey
ALTER TABLE "public"."Clientes" ADD CONSTRAINT "Clientes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mecanicos" ADD CONSTRAINT "Mecanicos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vehiculos" ADD CONSTRAINT "Vehiculos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vehiculos" ADD CONSTRAINT "Vehiculos_id_modelo_fkey" FOREIGN KEY ("id_modelo") REFERENCES "public"."Modelos"("id_modelo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Modelos" ADD CONSTRAINT "Modelos_id_marca_fkey" FOREIGN KEY ("id_marca") REFERENCES "public"."Marcas"("id_marca") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repuestos" ADD CONSTRAINT "Repuestos_id_marca_fkey" FOREIGN KEY ("id_marca") REFERENCES "public"."Marcas"("id_marca") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repuestos" ADD CONSTRAINT "Repuestos_id_modelo_fkey" FOREIGN KEY ("id_modelo") REFERENCES "public"."Modelos"("id_modelo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservas" ADD CONSTRAINT "Reservas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservas" ADD CONSTRAINT "Reservas_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "public"."Vehiculos"("id_vehiculo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservas" ADD CONSTRAINT "Reservas_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "public"."Servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asignaciones" ADD CONSTRAINT "Asignaciones_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "public"."Reservas"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asignaciones" ADD CONSTRAINT "Asignaciones_id_mecanico_fkey" FOREIGN KEY ("id_mecanico") REFERENCES "public"."Mecanicos"("id_mecanico") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_Servicios" ADD CONSTRAINT "Historial_Servicios_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "public"."Reservas"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_Servicios" ADD CONSTRAINT "Historial_Servicios_id_mecanico_fkey" FOREIGN KEY ("id_mecanico") REFERENCES "public"."Mecanicos"("id_mecanico") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cotizaciones" ADD CONSTRAINT "Cotizaciones_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "public"."Reservas"("id_reserva") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facturas" ADD CONSTRAINT "Facturas_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "public"."Cotizaciones"("id_cotizacion") ON DELETE RESTRICT ON UPDATE CASCADE;
