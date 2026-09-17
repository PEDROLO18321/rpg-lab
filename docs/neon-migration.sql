-- ============================================================================
--  RPG Lab — migração das colunas JSON (texto -> jsonb)
--  Para colar no SQL Editor do Neon Console.
--
--  SEGURO DE RODAR MAIS DE UMA VEZ: cada coluna só é convertida se ainda
--  estiver como texto, então reexecutar não dá erro nem altera nada.
--
--  Roda tudo dentro de uma transação: se qualquer valor não for JSON válido,
--  NADA é aplicado e o banco fica exatamente como estava.
--
--  ANTES DE RODAR: faça backup / crie um branch do banco no Neon.
-- ============================================================================

BEGIN;

-- 1. Converte as colunas, preservando o conteúdo -----------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndSheet'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "DndSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "DndSheet" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndSheet'
               AND column_name='spellSlotsUsed' AND data_type <> 'jsonb') THEN
    ALTER TABLE "DndSheet" ALTER COLUMN "spellSlotsUsed" DROP DEFAULT;
    ALTER TABLE "DndSheet" ALTER COLUMN "spellSlotsUsed" TYPE JSONB USING "spellSlotsUsed"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='skills' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "skills" TYPE JSONB USING "skills"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='schoolsChosen' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "schoolsChosen" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "schoolsChosen" TYPE JSONB USING "schoolsChosen"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='spellsKnown' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "spellsKnown" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "spellsKnown" TYPE JSONB USING "spellsKnown"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='powers' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "powers" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "powers" TYPE JSONB USING "powers"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='weapons' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "weapons" TYPE JSONB USING "weapons"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='equipment' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "equipment" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "equipment" TYPE JSONB USING "equipment"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='background' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "background" TYPE JSONB USING "background"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='skillChecks' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skillChecks" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skillChecks" TYPE JSONB USING "skillChecks"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='skills' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skills" TYPE JSONB USING "skills"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='background' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "background" TYPE JSONB USING "background"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='weapons' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "weapons" TYPE JSONB USING "weapons"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='insanityData' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "insanityData" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "insanityData" TYPE JSONB USING "insanityData"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='spellsData' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "spellsData" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "spellsData" TYPE JSONB USING "spellsData"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='skills' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "skills" TYPE JSONB USING "skills"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='abilities' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "abilities" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "abilities" TYPE JSONB USING "abilities"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='rituals' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "rituals" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "rituals" TYPE JSONB USING "rituals"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='inventory' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "inventory" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "inventory" TYPE JSONB USING "inventory"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='weapons' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "weapons" TYPE JSONB USING "weapons"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='background' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "background" TYPE JSONB USING "background"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='insanity' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "insanity" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "insanity" TYPE JSONB USING "insanity"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='classes' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classes" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classes" TYPE JSONB USING "classes"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='humanAttrChoice' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "humanAttrChoice" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "humanAttrChoice" TYPE JSONB USING "humanAttrChoice"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='unlockedProphecies' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "unlockedProphecies" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "unlockedProphecies" TYPE JSONB USING "unlockedProphecies"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='skills' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "skills" TYPE JSONB USING "skills"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='classPowers' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classPowers" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classPowers" TYPE JSONB USING "classPowers"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='generalPowers' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "generalPowers" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "generalPowers" TYPE JSONB USING "generalPowers"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='equipment' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "equipment" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "equipment" TYPE JSONB USING "equipment"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='weapons' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "weapons" TYPE JSONB USING "weapons"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='background' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "background" TYPE JSONB USING "background"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndNpc'
               AND column_name='attacks' AND data_type <> 'jsonb') THEN
    ALTER TABLE "DndNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "DndNpc" ALTER COLUMN "attacks" TYPE JSONB USING "attacks"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndCombatant'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "DndCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "DndCombatant" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuNpc'
               AND column_name='attacks' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "CthulhuNpc" ALTER COLUMN "attacks" TYPE JSONB USING "attacks"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuCombatant'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "CthulhuCombatant" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuInsanityRecord'
               AND column_name='phobias' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "phobias" DROP DEFAULT;
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "phobias" TYPE JSONB USING "phobias"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuInsanityRecord'
               AND column_name='manias' AND data_type <> 'jsonb') THEN
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "manias" DROP DEFAULT;
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "manias" TYPE JSONB USING "manias"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemNpc'
               AND column_name='attacks' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "OrdemNpc" ALTER COLUMN "attacks" TYPE JSONB USING "attacks"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemCombatant'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "OrdemCombatant" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSanityRecord'
               AND column_name='traumas' AND data_type <> 'jsonb') THEN
    ALTER TABLE "OrdemSanityRecord" ALTER COLUMN "traumas" DROP DEFAULT;
    ALTER TABLE "OrdemSanityRecord" ALTER COLUMN "traumas" TYPE JSONB USING "traumas"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaNpc'
               AND column_name='attacks' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "TormentaNpc" ALTER COLUMN "attacks" TYPE JSONB USING "attacks"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaCombatant'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "TormentaCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "TormentaCombatant" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsNpc'
               AND column_name='attacks' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "attacks" TYPE JSONB USING "attacks"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsNpc'
               AND column_name='skills' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "skills" TYPE JSONB USING "skills"::jsonb;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsCombatant'
               AND column_name='conditions' AND data_type <> 'jsonb') THEN
    ALTER TABLE "StarWarsCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "StarWarsCombatant" ALTER COLUMN "conditions" TYPE JSONB USING "conditions"::jsonb;
  END IF;
END $$;

-- 2. Restaura os valores padrão das colunas que os tinham --------------------
ALTER TABLE "StarWarsSheet" ALTER COLUMN "classes" SET DEFAULT '{}';
ALTER TABLE "StarWarsSheet" ALTER COLUMN "unlockedProphecies" SET DEFAULT '[]';
ALTER TABLE "DndNpc" ALTER COLUMN "attacks" SET DEFAULT '[]';
ALTER TABLE "DndCombatant" ALTER COLUMN "conditions" SET DEFAULT '[]';
ALTER TABLE "CthulhuNpc" ALTER COLUMN "attacks" SET DEFAULT '[]';
ALTER TABLE "CthulhuCombatant" ALTER COLUMN "conditions" SET DEFAULT '[]';
ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "phobias" SET DEFAULT '[]';
ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "manias" SET DEFAULT '[]';
ALTER TABLE "OrdemNpc" ALTER COLUMN "attacks" SET DEFAULT '[]';
ALTER TABLE "OrdemCombatant" ALTER COLUMN "conditions" SET DEFAULT '[]';
ALTER TABLE "OrdemSanityRecord" ALTER COLUMN "traumas" SET DEFAULT '[]';
ALTER TABLE "TormentaNpc" ALTER COLUMN "attacks" SET DEFAULT '[]';
ALTER TABLE "TormentaCombatant" ALTER COLUMN "conditions" SET DEFAULT '[]';
ALTER TABLE "StarWarsNpc" ALTER COLUMN "attacks" SET DEFAULT '[]';
ALTER TABLE "StarWarsNpc" ALTER COLUMN "skills" SET DEFAULT '[]';
ALTER TABLE "StarWarsCombatant" ALTER COLUMN "conditions" SET DEFAULT '[]';

-- 3. Registra a migração na tabela de controle do Prisma ---------------------
--    Sem isto, o próximo `prisma migrate deploy` tentaria aplicá-la de novo.
INSERT INTO "_prisma_migrations"
  (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT gen_random_uuid()::text, '861898ec80c05cfb1956931426ee1f29d71e53f875e4b994632f57494f72ecd1',
       now(), '20260917120000_json_columns', NULL, NULL, now(), 1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260917120000_json_columns'
);

COMMIT;

-- ============================================================================
--  Conferência (rode depois; esperado: 48)
-- ============================================================================
-- SELECT count(*) AS colunas_jsonb
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND data_type = 'jsonb';
