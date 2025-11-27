/*
  Warnings:

  - You are about to drop the column `costo` on the `Historial_Servicios` table. All the data in the column will be lost.
  - You are about to drop the column `id_mecanico` on the `Historial_Servicios` table. All the data in the column will be lost.
  - You are about to drop the column `id_reserva` on the `Historial_Servicios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_asignacion]` on the table `Historial_Servicios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_asignacion` to the `Historial_Servicios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Historial_Servicios" DROP CONSTRAINT "Historial_Servicios_id_mecanico_fkey";

-- DropForeignKey
ALTER TABLE "public"."Historial_Servicios" DROP CONSTRAINT "Historial_Servicios_id_reserva_fkey";

-- AlterTable
ALTER TABLE "public"."Historial_Servicios" DROP COLUMN "costo",
DROP COLUMN "id_mecanico",
DROP COLUMN "id_reserva",
ADD COLUMN     "id_asignacion" INTEGER NOT NULL,
ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Historial_Servicios_id_asignacion_key" ON "public"."Historial_Servicios"("id_asignacion");

-- AddForeignKey
ALTER TABLE "public"."Historial_Servicios" ADD CONSTRAINT "Historial_Servicios_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "public"."Asignaciones"("id_asignacion") ON DELETE RESTRICT ON UPDATE CASCADE;
