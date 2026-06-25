-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "nextSessionAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT '1';

-- CreateTable
CREATE TABLE "OrdemStory" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "hook" TEXT NOT NULL DEFAULT '',
    "generalHistory" TEXT NOT NULL DEFAULT '',
    "currentArc" TEXT NOT NULL DEFAULT '',
    "mainThreat" TEXT NOT NULL DEFAULT '',
    "membrana" TEXT NOT NULL DEFAULT 'danificada',

    CONSTRAINT "OrdemStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemNpc" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "age" INTEGER,
    "gender" TEXT NOT NULL DEFAULT '',
    "affiliation" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "personality" TEXT NOT NULL DEFAULT '',
    "paranormalTies" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "agi" INTEGER,
    "forca" INTEGER,
    "int" INTEGER,
    "pre" INTEGER,
    "vig" INTEGER,
    "pv" INTEGER,
    "pe" INTEGER,
    "san" INTEGER,
    "defense" INTEGER,
    "attacks" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdemNpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemCombatant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "name" TEXT NOT NULL,
    "init" INTEGER NOT NULL DEFAULT 0,
    "pv" INTEGER,
    "maxPv" INTEGER,
    "pe" INTEGER,
    "maxPe" INTEGER,
    "san" INTEGER,
    "maxSan" INTEGER,
    "rd" INTEGER NOT NULL DEFAULT 0,
    "isPlayer" BOOLEAN NOT NULL DEFAULT false,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrdemCombatant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemGameSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "events" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "sessionDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdemGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'misc',
    "paranormal" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,

    CONSTRAINT "OrdemItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemSanityRecord" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "agentName" TEXT NOT NULL DEFAULT '',
    "currentSan" INTEGER NOT NULL DEFAULT 0,
    "maxSan" INTEGER NOT NULL DEFAULT 0,
    "sessionLoss" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "traumas" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "OrdemSanityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemClue" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "discovered" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdemClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemClock" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "segments" INTEGER NOT NULL DEFAULT 4,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'ameaca',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdemClock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemReward" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "agentName" TEXT NOT NULL DEFAULT '',
    "prestige" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL DEFAULT '',
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdemReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrdemStory_campaignId_key" ON "OrdemStory"("campaignId");

-- AddForeignKey
ALTER TABLE "OrdemStory" ADD CONSTRAINT "OrdemStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemNpc" ADD CONSTRAINT "OrdemNpc_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemCombatant" ADD CONSTRAINT "OrdemCombatant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemGameSession" ADD CONSTRAINT "OrdemGameSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemItem" ADD CONSTRAINT "OrdemItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemSanityRecord" ADD CONSTRAINT "OrdemSanityRecord_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemClue" ADD CONSTRAINT "OrdemClue_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemClock" ADD CONSTRAINT "OrdemClock_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemReward" ADD CONSTRAINT "OrdemReward_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
