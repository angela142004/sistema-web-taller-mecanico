-- DropForeignKey
ALTER TABLE "public"."Asignaciones" DROP CONSTRAINT "Asignaciones_id_cotizacion_fkey";

-- DropForeignKey
ALTER TABLE "public"."Asignaciones" DROP CONSTRAINT "Asignaciones_id_mecanico_fkey";

-- DropForeignKey
ALTER TABLE "public"."Clientes" DROP CONSTRAINT "Clientes_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cotizaciones" DROP CONSTRAINT "Cotizaciones_id_reserva_fkey";

-- DropForeignKey
ALTER TABLE "public"."Facturas" DROP CONSTRAINT "Facturas_id_cotizacion_fkey";

-- DropForeignKey
ALTER TABLE "public"."Historial_Servicios" DROP CONSTRAINT "Historial_Servicios_id_asignacion_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mecanicos" DROP CONSTRAINT "Mecanicos_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reservas" DROP CONSTRAINT "Reservas_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reservas" DROP CONSTRAINT "Reservas_id_vehiculo_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vehiculos" DROP CONSTRAINT "Vehiculos_id_cliente_fkey";

-- AddForeignKey
ALTER TABLE "public"."Clientes" ADD CONSTRAINT "Clientes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mecanicos" ADD CONSTRAINT "Mecanicos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vehiculos" ADD CONSTRAINT "Vehiculos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Clientes"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservas" ADD CONSTRAINT "Reservas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."Clientes"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservas" ADD CONSTRAINT "Reservas_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "public"."Vehiculos"("id_vehiculo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asignaciones" ADD CONSTRAINT "Asignaciones_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "public"."Cotizaciones"("id_cotizacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asignaciones" ADD CONSTRAINT "Asignaciones_id_mecanico_fkey" FOREIGN KEY ("id_mecanico") REFERENCES "public"."Mecanicos"("id_mecanico") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Historial_Servicios" ADD CONSTRAINT "Historial_Servicios_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "public"."Asignaciones"("id_asignacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cotizaciones" ADD CONSTRAINT "Cotizaciones_id_reserva_fkey" FOREIGN KEY ("id_reserva") REFERENCES "public"."Reservas"("id_reserva") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Facturas" ADD CONSTRAINT "Facturas_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "public"."Cotizaciones"("id_cotizacion") ON DELETE CASCADE ON UPDATE CASCADE;
