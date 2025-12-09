-- CreateTable
CREATE TABLE "public"."Historial_Costos" (
    "id_historial" SERIAL NOT NULL,
    "semana" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "datos" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "total_cotizaciones" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historial_Costos_pkey" PRIMARY KEY ("id_historial")
);
