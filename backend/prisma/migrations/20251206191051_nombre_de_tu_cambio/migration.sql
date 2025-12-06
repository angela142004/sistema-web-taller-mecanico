-- AlterTable
ALTER TABLE "public"."Usuarios" ADD COLUMN     "confirmado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token" TEXT;
