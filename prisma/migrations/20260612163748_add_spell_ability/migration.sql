-- AlterTable
ALTER TABLE "DndSheet" ADD COLUMN     "spellAbility" TEXT;

-- CreateTable
CREATE TABLE "TormentaSheet" (
    "id" TEXT NOT NULL,
    "race" TEXT,
    "origin" TEXT,
    "background" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "mana" INTEGER NOT NULL DEFAULT 1,
    "str" INTEGER NOT NULL DEFAULT 10,
    "dex" INTEGER NOT NULL DEFAULT 10,
    "con" INTEGER NOT NULL DEFAULT 10,
    "int" INTEGER NOT NULL DEFAULT 10,
    "wis" INTEGER NOT NULL DEFAULT 10,
    "cha" INTEGER NOT NULL DEFAULT 10,
    "pvMax" INTEGER NOT NULL DEFAULT 10,
    "pvCurrent" INTEGER NOT NULL DEFAULT 10,
    "peMax" INTEGER NOT NULL DEFAULT 10,
    "peCurrent" INTEGER NOT NULL DEFAULT 10,
    "armor" INTEGER NOT NULL DEFAULT 10,
    "movement" INTEGER NOT NULL DEFAULT 6,

    CONSTRAINT "TormentaSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaClass" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "TormentaClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaEquipment" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,

    CONSTRAINT "TormentaEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaPowerG" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "TormentaPowerG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaSpell" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "TormentaSpell_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TormentaSheet" ADD CONSTRAINT "TormentaSheet_id_fkey" FOREIGN KEY ("id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaClass" ADD CONSTRAINT "TormentaClass_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "TormentaSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaEquipment" ADD CONSTRAINT "TormentaEquipment_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "TormentaSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaPowerG" ADD CONSTRAINT "TormentaPowerG_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "TormentaSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaSpell" ADD CONSTRAINT "TormentaSpell_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "TormentaSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
