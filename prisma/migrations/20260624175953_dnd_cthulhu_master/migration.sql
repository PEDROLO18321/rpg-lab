-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "era" TEXT;

-- CreateTable
CREATE TABLE "DndCampaignStory" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL DEFAULT '',
    "generalHistory" TEXT NOT NULL DEFAULT '',
    "currentArc" TEXT NOT NULL DEFAULT '',
    "mainVillain" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DndCampaignStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndNpc" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "alignment" TEXT NOT NULL DEFAULT '',
    "trait" TEXT NOT NULL DEFAULT '',
    "appearance" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "hp" INTEGER,
    "ac" INTEGER,
    "str" INTEGER,
    "dex" INTEGER,
    "con" INTEGER,
    "int" INTEGER,
    "wis" INTEGER,
    "cha" INTEGER,
    "attacks" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DndNpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndCombatant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "name" TEXT NOT NULL,
    "initiative" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER,
    "maxHp" INTEGER,
    "tempHp" INTEGER NOT NULL DEFAULT 0,
    "ac" INTEGER,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "isPlayer" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DndCombatant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndGameSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "events" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "sessionDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DndGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndCampaignItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'misc',
    "rarity" TEXT NOT NULL DEFAULT 'comum',
    "sessionId" TEXT,

    CONSTRAINT "DndCampaignItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndClue" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "discovered" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DndClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DndClock" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "segments" INTEGER NOT NULL DEFAULT 4,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'ameaca',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DndClock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuCampaignStory" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "hook" TEXT NOT NULL DEFAULT '',
    "generalHistory" TEXT NOT NULL DEFAULT '',
    "currentArc" TEXT NOT NULL DEFAULT '',
    "mainCult" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CthulhuCampaignStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuNpc" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL DEFAULT '',
    "age" INTEGER,
    "gender" TEXT NOT NULL DEFAULT '',
    "nationality" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "personality" TEXT NOT NULL DEFAULT '',
    "mythosTies" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "str" INTEGER,
    "con" INTEGER,
    "siz" INTEGER,
    "dex" INTEGER,
    "int" INTEGER,
    "pow" INTEGER,
    "app" INTEGER,
    "edu" INTEGER,
    "hp" INTEGER,
    "san" INTEGER,
    "attacks" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CthulhuNpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuCombatant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "name" TEXT NOT NULL,
    "dex" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER,
    "maxHp" INTEGER,
    "san" INTEGER,
    "maxSan" INTEGER,
    "mp" INTEGER,
    "maxMp" INTEGER,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "isPlayer" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CthulhuCombatant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuGameSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "events" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "sessionDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CthulhuGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuCampaignItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'misc',
    "mythos" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,

    CONSTRAINT "CthulhuCampaignItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuInsanityRecord" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "investigatorName" TEXT NOT NULL DEFAULT '',
    "currentSan" INTEGER NOT NULL DEFAULT 0,
    "maxSan" INTEGER NOT NULL DEFAULT 0,
    "sessionLoss" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "phobias" TEXT NOT NULL DEFAULT '[]',
    "manias" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CthulhuInsanityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuClue" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "discovered" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CthulhuClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CthulhuClock" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "segments" INTEGER NOT NULL DEFAULT 4,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'ameaca',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CthulhuClock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DndCampaignStory_campaignId_key" ON "DndCampaignStory"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CthulhuCampaignStory_campaignId_key" ON "CthulhuCampaignStory"("campaignId");

-- AddForeignKey
ALTER TABLE "DndCampaignStory" ADD CONSTRAINT "DndCampaignStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DndNpc" ADD CONSTRAINT "DndNpc_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DndCombatant" ADD CONSTRAINT "DndCombatant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DndGameSession" ADD CONSTRAINT "DndGameSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DndCampaignItem" ADD CONSTRAINT "DndCampaignItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DndClue" ADD CONSTRAINT "DndClue_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DndClock" ADD CONSTRAINT "DndClock_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuCampaignStory" ADD CONSTRAINT "CthulhuCampaignStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuNpc" ADD CONSTRAINT "CthulhuNpc_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuCombatant" ADD CONSTRAINT "CthulhuCombatant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuGameSession" ADD CONSTRAINT "CthulhuGameSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuCampaignItem" ADD CONSTRAINT "CthulhuCampaignItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuInsanityRecord" ADD CONSTRAINT "CthulhuInsanityRecord_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuClue" ADD CONSTRAINT "CthulhuClue_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CthulhuClock" ADD CONSTRAINT "CthulhuClock_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
