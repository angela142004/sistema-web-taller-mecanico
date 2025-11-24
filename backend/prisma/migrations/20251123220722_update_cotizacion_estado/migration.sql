/*
  Warnings:

  - The values [cotizado,aprobado,facturado] on the enum `EstadoCotizacion` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoCotizacion_new" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECHAZADO');
ALTER TABLE "public"."Cotizaciones" ALTER COLUMN "estado" TYPE "public"."EstadoCotizacion_new" USING ("estado"::text::"public"."EstadoCotizacion_new");
ALTER TYPE "public"."EstadoCotizacion" RENAME TO "EstadoCotizacion_old";
ALTER TYPE "public"."EstadoCotizacion_new" RENAME TO "EstadoCotizacion";
DROP TYPE "public"."EstadoCotizacion_old";
COMMIT;
