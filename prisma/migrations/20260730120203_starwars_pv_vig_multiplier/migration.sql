-- AlterTable
ALTER TABLE "StarWarsSheet" ADD COLUMN     "pvClassSum" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pvLevelGain" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pvVigMultiplier" INTEGER NOT NULL DEFAULT 4;

-- Backfill: personagens já existentes preservam o PV Máximo atual como base (pvClassSum),
-- já que a nova regra só ADICIONA o bônus de Vigor por cima — não substitui o valor antigo.
UPDATE "StarWarsSheet" SET "pvClassSum" = "pvMax";
