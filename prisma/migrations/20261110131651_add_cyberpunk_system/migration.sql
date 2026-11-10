-- CreateTable
CREATE TABLE "CyberpunkSheet" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'solo',
    "roleRank" INTEGER NOT NULL DEFAULT 4,
    "creationMethod" TEXT NOT NULL DEFAULT 'streetrat',
    "int" INTEGER NOT NULL DEFAULT 5,
    "ref" INTEGER NOT NULL DEFAULT 5,
    "dex" INTEGER NOT NULL DEFAULT 5,
    "tech" INTEGER NOT NULL DEFAULT 5,
    "cool" INTEGER NOT NULL DEFAULT 5,
    "will" INTEGER NOT NULL DEFAULT 5,
    "luck" INTEGER NOT NULL DEFAULT 5,
    "move" INTEGER NOT NULL DEFAULT 5,
    "body" INTEGER NOT NULL DEFAULT 5,
    "emp" INTEGER NOT NULL DEFAULT 5,
    "luckCurrent" INTEGER NOT NULL DEFAULT 5,
    "hpMax" INTEGER NOT NULL DEFAULT 35,
    "hpCurrent" INTEGER NOT NULL DEFAULT 35,
    "humanityMax" INTEGER NOT NULL DEFAULT 50,
    "humanity" INTEGER NOT NULL DEFAULT 50,
    "deathSavePenalty" INTEGER NOT NULL DEFAULT 0,
    "improvementPoints" INTEGER NOT NULL DEFAULT 0,
    "eurobucks" INTEGER NOT NULL DEFAULT 0,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "skills" JSONB NOT NULL DEFAULT '{}',
    "armor" JSONB NOT NULL DEFAULT '{}',
    "weapons" JSONB NOT NULL DEFAULT '[]',
    "cyberware" JSONB NOT NULL DEFAULT '[]',
    "gear" JSONB NOT NULL DEFAULT '[]',
    "criticalInjuries" JSONB NOT NULL DEFAULT '[]',
    "lifepath" JSONB NOT NULL DEFAULT '{}',
    "background" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,

    CONSTRAINT "CyberpunkSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyberpunkStory" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL DEFAULT '',
    "generalHistory" TEXT NOT NULL DEFAULT '',
    "currentArc" TEXT NOT NULL DEFAULT '',
    "mainVillain" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CyberpunkStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyberpunkNpc" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "threat" TEXT NOT NULL DEFAULT 'mook',
    "trait" TEXT NOT NULL DEFAULT '',
    "appearance" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "hp" INTEGER,
    "hpMax" INTEGER,
    "spHead" INTEGER NOT NULL DEFAULT 0,
    "spBody" INTEGER NOT NULL DEFAULT 0,
    "int" INTEGER,
    "ref" INTEGER,
    "dex" INTEGER,
    "tech" INTEGER,
    "cool" INTEGER,
    "will" INTEGER,
    "luck" INTEGER,
    "move" INTEGER,
    "body" INTEGER,
    "emp" INTEGER,
    "skills" JSONB NOT NULL DEFAULT '{}',
    "weapons" JSONB NOT NULL DEFAULT '[]',
    "cyberware" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CyberpunkNpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyberpunkCombatant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "name" TEXT NOT NULL,
    "initiative" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER,
    "maxHp" INTEGER,
    "spHead" INTEGER NOT NULL DEFAULT 0,
    "spBody" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "isPlayer" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deathSavePenalty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CyberpunkCombatant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyberpunkGameSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "events" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "sessionDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CyberpunkGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyberpunkCampaignItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'misc',
    "rarity" TEXT NOT NULL DEFAULT 'comum',
    "sessionId" TEXT,

    CONSTRAINT "CyberpunkCampaignItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyberpunkClue" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "discovered" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CyberpunkClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyberpunkClock" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "segments" INTEGER NOT NULL DEFAULT 4,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'ameaca',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CyberpunkClock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CyberpunkStory_campaignId_key" ON "CyberpunkStory"("campaignId");

-- AddForeignKey
ALTER TABLE "CyberpunkSheet" ADD CONSTRAINT "CyberpunkSheet_id_fkey" FOREIGN KEY ("id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyberpunkStory" ADD CONSTRAINT "CyberpunkStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyberpunkNpc" ADD CONSTRAINT "CyberpunkNpc_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyberpunkCombatant" ADD CONSTRAINT "CyberpunkCombatant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyberpunkGameSession" ADD CONSTRAINT "CyberpunkGameSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyberpunkCampaignItem" ADD CONSTRAINT "CyberpunkCampaignItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyberpunkClue" ADD CONSTRAINT "CyberpunkClue_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyberpunkClock" ADD CONSTRAINT "CyberpunkClock_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
