-- CreateTable
CREATE TABLE "CthulhuSheet" (
    "id" TEXT NOT NULL,
    "occupation" TEXT,
    "era" TEXT,
    "age" INTEGER,
    "atribFor" INTEGER NOT NULL DEFAULT 50,
    "atribCon" INTEGER NOT NULL DEFAULT 50,
    "atribTam" INTEGER NOT NULL DEFAULT 65,
    "atribDes" INTEGER NOT NULL DEFAULT 50,
    "atribApa" INTEGER NOT NULL DEFAULT 50,
    "atribInt" INTEGER NOT NULL DEFAULT 65,
    "atribPod" INTEGER NOT NULL DEFAULT 50,
    "atribEdu" INTEGER NOT NULL DEFAULT 65,
    "sanCurrent" INTEGER NOT NULL DEFAULT 50,
    "sanMax" INTEGER NOT NULL DEFAULT 99,
    "pvMax" INTEGER NOT NULL DEFAULT 12,
    "pvCurrent" INTEGER NOT NULL DEFAULT 12,
    "luck" INTEGER NOT NULL DEFAULT 50,
    "mov" INTEGER NOT NULL DEFAULT 8,
    "pmCurrent" INTEGER NOT NULL DEFAULT 10,
    "skills" TEXT,
    "background" TEXT,
    "weapons" TEXT,
    "equipment" TEXT,
    "notes" TEXT,

    CONSTRAINT "CthulhuSheet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CthulhuSheet" ADD CONSTRAINT "CthulhuSheet_id_fkey" FOREIGN KEY ("id") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
