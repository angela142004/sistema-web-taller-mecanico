/*
  Warnings:

  - The values [cancelado] on the enum `EstadoAsignacion` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `id_reserva` on the `Asignaciones` table. All the data in the column will be lost.
  - Added the required column `id_cotizacion` to the `Asignaciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoAsignacion_new" AS ENUM ('pendiente', 'en_proceso', 'finalizado');
ALTER TABLE "public"."Asignaciones" ALTER COLUMN "estado" TYPE "public"."EstadoAsignacion_new" USING ("estado"::text::"public"."EstadoAsignacion_new");
ALTER TYPE "public"."EstadoAsignacion" RENAME TO "EstadoAsignacion_old";
ALTER TYPE "public"."EstadoAsignacion_new" RENAME TO "EstadoAsignacion";
DROP TYPE "public"."EstadoAsignacion_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Asignaciones" DROP CONSTRAINT "Asignaciones_id_reserva_fkey";

-- AlterTable
ALTER TABLE "public"."Asignaciones" DROP COLUMN "id_reserva",
ADD COLUMN     "id_cotizacion" INTEGER NOT NULL,
ALTER COLUMN "fecha_asignacion" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "public"."Asignaciones" ADD CONSTRAINT "Asignaciones_id_cotizacion_fkey" FOREIGN KEY ("id_cotizacion") REFERENCES "public"."Cotizaciones"("id_cotizacion") ON DELETE RESTRICT ON UPDATE CASCADE;
