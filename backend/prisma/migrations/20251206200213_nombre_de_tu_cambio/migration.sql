/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Usuarios" ADD COLUMN     "dni" VARCHAR(8);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_dni_key" ON "public"."Usuarios"("dni");
