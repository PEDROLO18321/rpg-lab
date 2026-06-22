-- CreateTable
CREATE TABLE "OrdemSheet" (
    "id" TEXT NOT NULL,
    "origin" TEXT,
    "className" TEXT,
    "trail" TEXT,
    "nex" INTEGER NOT NULL DEFAULT 5,
    "patente" TEXT NOT NULL DEFAULT 'recruta',
    "agi" INTEGER NOT NULL DEFAULT 1,
    "forca" INTEGER NOT NULL DEFAULT 1,
    "int" INTEGER NOT NULL DEFAULT 1,
    "pre" INTEGER NOT NULL DEFAULT 1,
    "vig" INTEGER NOT NULL DEFAULT 1,
    "pvMax" INTEGER NOT NULL DEFAULT 0,
    "pvCurrent" INTEGER NOT NULL DEFAULT 0,
    "pvTemp" INTEGER NOT NULL DEFAULT 0,
    "peMax" INTEGER NOT NULL DEFAULT 0,
    "peCurrent" INTEGER NOT NULL DEFAULT 0,
    "peTemp" INTEGER NOT NULL DEFAULT 0,
    "sanMax" INTEGER NOT NULL DEFAULT 0,
    "sanCurrent" INTEGER NOT NULL DEFAULT 0,
    "sanTemp" INTEGER NOT NULL DEFAULT 0,
    "defense" INTEGER NOT NULL DEFAULT 10,
    "movement" INTEGER NOT NULL DEFAULT 9,
    "prestige" INTEGER NOT NULL DEFAULT 0,
    "affinity" TEXT,
    "skills" TEXT,
    "abilities" TEXT,
    "rituals" TEXT,
    "inventory" TEXT,
    "weapons" TEXT,
    "background" TEXT,
    "conditions" TEXT,
    "insanity" TEXT,
    "notes" TEXT,

    CONSTRAINT "OrdemSheet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrdemSheet" ADD CONSTRAINT "OrdemSheet_id_fkey" FOREIGN KEY ("id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
