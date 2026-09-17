-- ============================================================================
--  REVERSÃO da migração 20260917120000_json_columns  (jsonb -> text)
--
--  Use SOMENTE se precisar voltar o banco ao formato antigo para rodar uma
--  versão anterior do código. A conversão é sem perda: JSON válido vira o
--  mesmo texto de onde veio.
--
--  Rode em transação: ou tudo volta, ou nada muda.
-- ============================================================================

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndSheet'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "DndSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "DndSheet" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndSheet'
               AND column_name='spellSlotsUsed' AND data_type = 'jsonb') THEN
    ALTER TABLE "DndSheet" ALTER COLUMN "spellSlotsUsed" DROP DEFAULT;
    ALTER TABLE "DndSheet" ALTER COLUMN "spellSlotsUsed" TYPE TEXT USING "spellSlotsUsed"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='skills' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "skills" TYPE TEXT USING "skills"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='schoolsChosen' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "schoolsChosen" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "schoolsChosen" TYPE TEXT USING "schoolsChosen"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='spellsKnown' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "spellsKnown" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "spellsKnown" TYPE TEXT USING "spellsKnown"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='powers' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "powers" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "powers" TYPE TEXT USING "powers"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='weapons' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "weapons" TYPE TEXT USING "weapons"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='equipment' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "equipment" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "equipment" TYPE TEXT USING "equipment"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaSheet'
               AND column_name='background' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "TormentaSheet" ALTER COLUMN "background" TYPE TEXT USING "background"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='skillChecks' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skillChecks" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skillChecks" TYPE TEXT USING "skillChecks"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='skills' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "skills" TYPE TEXT USING "skills"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='background' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "background" TYPE TEXT USING "background"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='weapons' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "weapons" TYPE TEXT USING "weapons"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='insanityData' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "insanityData" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "insanityData" TYPE TEXT USING "insanityData"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuSheet'
               AND column_name='spellsData' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "spellsData" DROP DEFAULT;
    ALTER TABLE "CthulhuSheet" ALTER COLUMN "spellsData" TYPE TEXT USING "spellsData"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='skills' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "skills" TYPE TEXT USING "skills"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='abilities' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "abilities" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "abilities" TYPE TEXT USING "abilities"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='rituals' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "rituals" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "rituals" TYPE TEXT USING "rituals"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='inventory' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "inventory" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "inventory" TYPE TEXT USING "inventory"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='weapons' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "weapons" TYPE TEXT USING "weapons"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='background' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "background" TYPE TEXT USING "background"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSheet'
               AND column_name='insanity' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSheet" ALTER COLUMN "insanity" DROP DEFAULT;
    ALTER TABLE "OrdemSheet" ALTER COLUMN "insanity" TYPE TEXT USING "insanity"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='classes' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classes" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classes" TYPE TEXT USING "classes"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='humanAttrChoice' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "humanAttrChoice" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "humanAttrChoice" TYPE TEXT USING "humanAttrChoice"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='unlockedProphecies' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "unlockedProphecies" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "unlockedProphecies" TYPE TEXT USING "unlockedProphecies"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='skills' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "skills" TYPE TEXT USING "skills"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='classPowers' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classPowers" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "classPowers" TYPE TEXT USING "classPowers"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='generalPowers' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "generalPowers" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "generalPowers" TYPE TEXT USING "generalPowers"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='equipment' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "equipment" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "equipment" TYPE TEXT USING "equipment"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='weapons' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "weapons" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "weapons" TYPE TEXT USING "weapons"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsSheet'
               AND column_name='background' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "background" DROP DEFAULT;
    ALTER TABLE "StarWarsSheet" ALTER COLUMN "background" TYPE TEXT USING "background"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndNpc'
               AND column_name='attacks' AND data_type = 'jsonb') THEN
    ALTER TABLE "DndNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "DndNpc" ALTER COLUMN "attacks" TYPE TEXT USING "attacks"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='DndCombatant'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "DndCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "DndCombatant" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuNpc'
               AND column_name='attacks' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "CthulhuNpc" ALTER COLUMN "attacks" TYPE TEXT USING "attacks"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuCombatant'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "CthulhuCombatant" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuInsanityRecord'
               AND column_name='phobias' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "phobias" DROP DEFAULT;
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "phobias" TYPE TEXT USING "phobias"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='CthulhuInsanityRecord'
               AND column_name='manias' AND data_type = 'jsonb') THEN
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "manias" DROP DEFAULT;
    ALTER TABLE "CthulhuInsanityRecord" ALTER COLUMN "manias" TYPE TEXT USING "manias"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemNpc'
               AND column_name='attacks' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "OrdemNpc" ALTER COLUMN "attacks" TYPE TEXT USING "attacks"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemCombatant'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "OrdemCombatant" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='OrdemSanityRecord'
               AND column_name='traumas' AND data_type = 'jsonb') THEN
    ALTER TABLE "OrdemSanityRecord" ALTER COLUMN "traumas" DROP DEFAULT;
    ALTER TABLE "OrdemSanityRecord" ALTER COLUMN "traumas" TYPE TEXT USING "traumas"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaNpc'
               AND column_name='attacks' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "TormentaNpc" ALTER COLUMN "attacks" TYPE TEXT USING "attacks"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='TormentaCombatant'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "TormentaCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "TormentaCombatant" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsNpc'
               AND column_name='attacks' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "attacks" DROP DEFAULT;
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "attacks" TYPE TEXT USING "attacks"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsNpc'
               AND column_name='skills' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "skills" DROP DEFAULT;
    ALTER TABLE "StarWarsNpc" ALTER COLUMN "skills" TYPE TEXT USING "skills"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='StarWarsCombatant'
               AND column_name='conditions' AND data_type = 'jsonb') THEN
    ALTER TABLE "StarWarsCombatant" ALTER COLUMN "conditions" DROP DEFAULT;
    ALTER TABLE "StarWarsCombatant" ALTER COLUMN "conditions" TYPE TEXT USING "conditions"::text;
  END IF;
END $$;

-- Remove o registro para o Prisma voltar a considerar a migração pendente.
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260917120000_json_columns';

COMMIT;
