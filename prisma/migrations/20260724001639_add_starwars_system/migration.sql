-- CreateTable
CREATE TABLE "StarWarsSheet" (
    "id" TEXT NOT NULL,
    "species" TEXT,
    "planet" TEXT,
    "path" TEXT,
    "classes" TEXT NOT NULL DEFAULT '{}',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "humanAttrChoice" TEXT,
    "agi" INTEGER NOT NULL DEFAULT 1,
    "int" INTEGER NOT NULL DEFAULT 1,
    "forca" INTEGER NOT NULL DEFAULT 1,
    "vig" INTEGER NOT NULL DEFAULT 1,
    "pre" INTEGER NOT NULL DEFAULT 1,
    "sen" INTEGER NOT NULL DEFAULT 1,
    "pvMax" INTEGER NOT NULL DEFAULT 10,
    "pvCurrent" INTEGER NOT NULL DEFAULT 10,
    "pvTemp" INTEGER NOT NULL DEFAULT 0,
    "peMax" INTEGER NOT NULL DEFAULT 0,
    "peCurrent" INTEGER NOT NULL DEFAULT 0,
    "peTemp" INTEGER NOT NULL DEFAULT 0,
    "ppMax" INTEGER NOT NULL DEFAULT 0,
    "ppCurrent" INTEGER NOT NULL DEFAULT 0,
    "sabreForm" TEXT,
    "skills" TEXT,
    "classPowers" TEXT,
    "generalPowers" TEXT,
    "equipment" TEXT,
    "weapons" TEXT,
    "conditions" TEXT,
    "background" TEXT,
    "notes" TEXT,

    CONSTRAINT "StarWarsSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarWarsStory" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "objective" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL DEFAULT '',
    "generalHistory" TEXT NOT NULL DEFAULT '',
    "currentArc" TEXT NOT NULL DEFAULT '',
    "mainVillain" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "StarWarsStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarWarsNpc" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "personality" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "pv" INTEGER,
    "agi" INTEGER,
    "int" INTEGER,
    "forca" INTEGER,
    "vig" INTEGER,
    "pre" INTEGER,
    "sen" INTEGER,
    "attacks" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarWarsNpc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarWarsCombatant" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT,
    "name" TEXT NOT NULL,
    "initiative" INTEGER NOT NULL DEFAULT 0,
    "pv" INTEGER,
    "maxPv" INTEGER,
    "pe" INTEGER,
    "maxPe" INTEGER,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "isPlayer" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StarWarsCombatant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarWarsGameSession" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL DEFAULT '',
    "events" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "sessionDate" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarWarsGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarWarsCampaignItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'misc',
    "rarity" TEXT NOT NULL DEFAULT 'comum',
    "sessionId" TEXT,

    CONSTRAINT "StarWarsCampaignItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarWarsClue" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "discovered" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarWarsClue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarWarsClock" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "segments" INTEGER NOT NULL DEFAULT 4,
    "filled" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'ameaca',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarWarsClock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StarWarsStory_campaignId_key" ON "StarWarsStory"("campaignId");

-- AddForeignKey
ALTER TABLE "StarWarsSheet" ADD CONSTRAINT "StarWarsSheet_id_fkey" FOREIGN KEY ("id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarWarsStory" ADD CONSTRAINT "StarWarsStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarWarsNpc" ADD CONSTRAINT "StarWarsNpc_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarWarsCombatant" ADD CONSTRAINT "StarWarsCombatant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarWarsGameSession" ADD CONSTRAINT "StarWarsGameSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarWarsCampaignItem" ADD CONSTRAINT "StarWarsCampaignItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarWarsClue" ADD CONSTRAINT "StarWarsClue_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarWarsClock" ADD CONSTRAINT "StarWarsClock_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
