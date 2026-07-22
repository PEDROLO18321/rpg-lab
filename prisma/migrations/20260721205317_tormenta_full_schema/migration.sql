/*
  Warnings:

  - You are about to drop the column `armor` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the column `cha` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the column `dex` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the column `mana` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the column `peCurrent` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the column `peMax` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the column `str` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the column `wis` on the `TormentaSheet` table. All the data in the column will be lost.
  - You are about to drop the `TormentaClass` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TormentaEquipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TormentaPowerG` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TormentaSpell` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TormentaClass" DROP CONSTRAINT "TormentaClass_sheetId_fkey";

-- DropForeignKey
ALTER TABLE "TormentaEquipment" DROP CONSTRAINT "TormentaEquipment_sheetId_fkey";

-- DropForeignKey
ALTER TABLE "TormentaPowerG" DROP CONSTRAINT "TormentaPowerG_sheetId_fkey";

-- DropForeignKey
ALTER TABLE "TormentaSpell" DROP CONSTRAINT "TormentaSpell_sheetId_fkey";

-- AlterTable
ALTER TABLE "TormentaSheet" DROP COLUMN "armor",
DROP COLUMN "cha",
DROP COLUMN "dex",
DROP COLUMN "mana",
DROP COLUMN "peCurrent",
DROP COLUMN "peMax",
DROP COLUMN "str",
DROP COLUMN "wis",
ADD COLUMN     "car" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "className" TEXT,
ADD COLUMN     "conditions" TEXT,
ADD COLUMN     "defense" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "des" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "equipment" TEXT,
ADD COLUMN     "forca" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "godId" TEXT,
ADD COLUMN     "money" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "path" TEXT,
ADD COLUMN     "pmCurrent" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "pmMax" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "pmTemp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pvTemp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "raceVariant" TEXT,
ADD COLUMN     "sab" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "schoolsChosen" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "spellsKnown" TEXT,
ADD COLUMN     "weapons" TEXT,
ALTER COLUMN "movement" SET DEFAULT 9;

-- DropTable
DROP TABLE "TormentaClass";

-- DropTable
DROP TABLE "TormentaEquipment";

-- DropTable
DROP TABLE "TormentaPowerG";

-- DropTable
DROP TABLE "TormentaSpell";

-- CreateTable
CREATE TABLE "TormentaCampaignStory" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL DEFAULT '',
    "generalHistory" TEXT NOT NULL DEFAULT '',
    "currentArc" TEXT NOT NULL DEFAULT '',
    "mainVillain" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TormentaCampaignStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaNpc" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "personality" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "pv" INTEGER,
    "defense" INTEGER,
    "forca" INTEGER,
    "des" INTEGER,
    "con" INTEGER,
    "int" INTEGER,
    "sab" INTEGER,
    "car" INTEGER,
    "attacks" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TormentaNpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaCombatant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "name" TEXT NOT NULL,
    "initiative" INTEGER NOT NULL DEFAULT 0,
    "pv" INTEGER,
    "maxPv" INTEGER,
    "pm" INTEGER,
    "maxPm" INTEGER,
    "defense" INTEGER,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "isPlayer" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TormentaCombatant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaGameSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "events" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "sessionDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TormentaGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaCampaignItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'misc',
    "rarity" TEXT NOT NULL DEFAULT 'comum',
    "sessionId" TEXT,

    CONSTRAINT "TormentaCampaignItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaClue" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "discovered" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TormentaClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TormentaClock" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "segments" INTEGER NOT NULL DEFAULT 4,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'ameaca',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TormentaClock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TormentaCampaignStory_campaignId_key" ON "TormentaCampaignStory"("campaignId");

-- AddForeignKey
ALTER TABLE "TormentaCampaignStory" ADD CONSTRAINT "TormentaCampaignStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaNpc" ADD CONSTRAINT "TormentaNpc_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaCombatant" ADD CONSTRAINT "TormentaCombatant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaGameSession" ADD CONSTRAINT "TormentaGameSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaCampaignItem" ADD CONSTRAINT "TormentaCampaignItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaClue" ADD CONSTRAINT "TormentaClue_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TormentaClock" ADD CONSTRAINT "TormentaClock_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
