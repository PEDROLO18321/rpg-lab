import { RACES } from "./races";
import type { Race, Subrace, AbilityKey } from "./races";
import { CLASSES } from "./classes";
import type { DndClass } from "./classes";
import { BACKGROUNDS } from "./backgrounds";
import type { Background } from "./backgrounds";
import { parseEquipmentLine } from "./equipmentParser";
import { getWeaponList } from "./equipmentData";
import { SPELLCASTING, getSpellsForClass } from "./spells";
import type { Spell } from "./spells";
import { STANDARD_LANGUAGES, EXOTIC_LANGUAGES, ALIGNMENTS } from "./descOptions";
import { ALL_SKILLS } from "./skillsData";
import { randomPhysical, pick } from "./physicalTraits";
import { buildLevelUpPlan, spellChoicesOnLevelUp, maxSpellLevelAt } from "./leveling";
import {
  levelUpCharacterOnce,
  type SheetSnapshot,
  type CreateCharacterInput,
  type DescData,
  type LevelUpOnceSuccess,
} from "./characterService";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const FULL_LABEL_TO_KEY: Record<string, AbilityKey> = {
  "Força": "str", "Destreza": "dex", "Constituição": "con",
  "Inteligência": "int", "Sabedoria": "wis", "Carisma": "cha",
};

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}

/** Sorteia `n` itens distintos de `arr` (ou todos, se `arr` tiver menos que `n`). */
function sampleDistinct<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const count = Math.min(Math.max(0, n), pool.length);
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// ── Nível 1 ──────────────────────────────────────────────────────────────────

/** Distribui o array padrão [15,14,13,12,10,8] priorizando as habilidades-chave da classe. */
function distributeAbilities(cls: DndClass): Record<AbilityKey, number> {
  const priority: AbilityKey[] = [];
  for (const label of cls.primaryAbilities) {
    const k = FULL_LABEL_TO_KEY[label];
    if (k && !priority.includes(k)) priority.push(k);
  }
  for (const k of ["con", "dex", "wis", "int", "cha", "str"] as AbilityKey[]) {
    if (!priority.includes(k)) priority.push(k);
  }
  const scores = {} as Record<AbilityKey, number>;
  priority.forEach((k, i) => { scores[k] = STANDARD_ARRAY[i]; });
  return scores;
}

function buildEquipmentChoices(cls: DndClass, bg: Background): Record<string, string> {
  const choices: Record<string, string> = {};
  function process(items: string[], prefix: string) {
    items.forEach((raw, idx) => {
      const line = parseEquipmentLine(raw);
      if (line.type !== "choice") return;
      const opt = pick(line.choices);
      choices[`${prefix}_${idx}`] = opt.letter;
      if (opt.sub) {
        for (let k = 0; k < opt.sub.count; k++) {
          choices[`${prefix}_${idx}_${opt.letter}_${k}`] = pick(getWeaponList(opt.sub.category));
        }
      }
    });
  }
  process(cls.startingEquipment, "cls");
  process(bg.startingEquipment, "bg");
  return choices;
}

function pickSpellSelection(classId: string): { selectedCantrips: string[]; selectedSpells: string[] } {
  const config = SPELLCASTING[classId];
  if (!config) return { selectedCantrips: [], selectedSpells: [] };
  return {
    selectedCantrips: sampleDistinct(getSpellsForClass(classId, 0), config.cantripsKnown).map((s) => s.id),
    selectedSpells:   sampleDistinct(getSpellsForClass(classId, 1), config.spellsKnown).map((s) => s.id),
  };
}

function pickLanguages(race: Race, subrace: Subrace | undefined, bg: Background): string[] {
  const total = (bg.languages ?? 0) + (subrace?.languages ?? 0) + (race.languageBonus ?? 0);
  if (total <= 0) return [];
  return sampleDistinct([...STANDARD_LANGUAGES, ...EXOTIC_LANGUAGES], total);
}

function pickDesc(raceId: string, bg: Background): DescData {
  const physical = randomPhysical(raceId) ?? {};
  return {
    alignment: pick(ALIGNMENTS).id,
    ...physical,
    personalityTrait: bg.personalityTraits.length > 0 ? pick(bg.personalityTraits) : undefined,
    ideal: bg.ideals.length > 0 ? pick(bg.ideals) : undefined,
    bond: bg.bonds.length > 0 ? pick(bg.bonds) : undefined,
    flaw: bg.flaws.length > 0 ? pick(bg.flaws) : undefined,
    backstory: "",
  };
}

export interface AutoGenerateOptions {
  level: number;
  charName?: string;
  classId?: string;
}

/** Monta o payload de criação (nível 1) com todas as escolhas sorteadas. */
export function generateLevel1Build(opts: AutoGenerateOptions): Omit<CreateCharacterInput, "userId" | "systemId"> {
  const cls = (opts.classId && CLASSES.find((c) => c.id === opts.classId)) || pick(CLASSES);
  const race = pick(RACES);
  const subrace = race.subraces.length > 0 ? pick(race.subraces) : undefined;
  const bg = pick(BACKGROUNDS);
  const subclassId = cls.subclasses.length > 0 ? pick(cls.subclasses).id : undefined;

  const abilityBases = distributeAbilities(cls);
  const selectedSkills = sampleDistinct(cls.skillChoices, cls.skillCount);

  let racialAbilityBonuses: Partial<Record<AbilityKey, number>> | undefined;
  let selectedRacialSkills: string[] | undefined;
  if (race.abilityBonusChoices) {
    const excluded = new Set(race.abilityBonusChoices.exclude ?? []);
    const pool = ABILITIES.filter((k) => !excluded.has(k));
    racialAbilityBonuses = {};
    for (const k of sampleDistinct(pool, race.abilityBonusChoices.count)) {
      racialAbilityBonuses[k] = race.abilityBonusChoices.amount;
    }
  }
  if (race.racialSkills) {
    const pool = ALL_SKILLS.filter((s) => !selectedSkills.includes(s));
    selectedRacialSkills = sampleDistinct(pool, race.racialSkills.count);
  }

  const { selectedCantrips, selectedSpells } = pickSpellSelection(cls.id);
  const charName = opts.charName?.trim() || pick([...race.names.male, ...race.names.female]);

  return {
    charName,
    raceId: race.id,
    subraceId: subrace?.id,
    classId: cls.id,
    subclassId,
    backgroundId: bg.id,
    abilityBases,
    selectedSkills,
    desc: pickDesc(race.id, bg),
    equipmentChoices: buildEquipmentChoices(cls, bg),
    selectedCantrips,
    selectedSpells,
    selectedLanguages: pickLanguages(race, subrace, bg),
    racialAbilityBonuses,
    selectedRacialSkills,
  };
}

// ── Progressão automática (nível > 1) ─────────────────────────────────────────

/**
 * Escolhe onde aplicar a Melhoria de Valor de Habilidade: +2 na primeira
 * habilidade-chave da classe com espaço (≤18, pra caber o +2 sem passar de
 * 20), senão Constituição, senão +1/+1 nas duas primeiras com espaço (≤19).
 * Dado o teto de nível 20 e os valores iniciais modestos (array padrão),
 * esgotar espaço em quase todas as habilidades é praticamente inatingível.
 */
function pickAsiIncreases(cls: DndClass, scores: Record<AbilityKey, number>): Partial<Record<AbilityKey, number>> {
  const order: AbilityKey[] = [];
  for (const label of cls.primaryAbilities) {
    const k = FULL_LABEL_TO_KEY[label];
    if (k && !order.includes(k)) order.push(k);
  }
  for (const k of ["con", "dex", "wis", "int", "cha", "str"] as AbilityKey[]) {
    if (!order.includes(k)) order.push(k);
  }

  const single = order.find((k) => scores[k] <= 18);
  if (single) return { [single]: 2 };

  const pair = order.filter((k) => scores[k] <= 19).slice(0, 2);
  if (pair.length === 2) return { [pair[0]]: 1, [pair[1]]: 1 };
  return {};
}

function pickNewSpells(
  classId: string,
  choices: { cantrips: number; spells: number },
  maxSpellLv: number,
  known: Set<string>
): string[] {
  const result: string[] = [];
  if (choices.cantrips > 0) {
    const pool = getSpellsForClass(classId, 0).filter((s) => !known.has(s.name.toLowerCase()));
    result.push(...sampleDistinct(pool, choices.cantrips).map((s) => s.id));
  }
  if (choices.spells > 0) {
    const pool: Spell[] = [];
    for (let lv = 1; lv <= Math.max(1, maxSpellLv); lv++) {
      pool.push(...getSpellsForClass(classId, lv).filter((s) => !known.has(s.name.toLowerCase())));
    }
    result.push(...sampleDistinct(pool, choices.spells).map((s) => s.id));
  }
  return result;
}

export interface AutoLevelResult {
  sheetUpdate: LevelUpOnceSuccess["sheetUpdate"];
  classLevel: number;
  allNewFeatures: { name: string; source: string; description: string }[];
  allNewSpellRows: Spell[];
}

/** Progride `start` até `targetLevel`, tudo em memória (nenhuma chamada ao banco). */
export function buildAutoLevelPlan(start: SheetSnapshot, targetLevel: number): AutoLevelResult {
  const cls = CLASSES.find((c) => c.id === start.classId);
  if (!cls) throw new Error("Classe inválida para geração automática.");

  let snapshot = start;
  let lastUpdate: LevelUpOnceSuccess["sheetUpdate"] | null = null;
  const allNewFeatures: { name: string; source: string; description: string }[] = [];
  const allNewSpellRows: Spell[] = [];

  while (snapshot.level < targetLevel) {
    const plan = buildLevelUpPlan(cls.id, snapshot.race, snapshot.classLevel, cls.hitDie, snapshot.level);
    if (!plan) break;

    const currentScores: Record<AbilityKey, number> = {
      str: snapshot.str, dex: snapshot.dex, con: snapshot.con,
      int: snapshot.int, wis: snapshot.wis, cha: snapshot.cha,
    };
    const asi = plan.asi ? pickAsiIncreases(cls, currentScores) : undefined;
    const choices = spellChoicesOnLevelUp(cls.id, plan.newLevel);
    const maxSpellLv = maxSpellLevelAt(cls.id, plan.newLevel);
    const newSpells = pickNewSpells(cls.id, choices, maxSpellLv, snapshot.knownSpellNames);

    const result = levelUpCharacterOnce(snapshot, { hpMode: "average", asi, newSpells });
    if (!result.ok) break; // defensivo — não deve ocorrer com escolhas geradas automaticamente

    snapshot = result.newSheet;
    lastUpdate = result.sheetUpdate;
    allNewFeatures.push(...result.newFeatures);
    allNewSpellRows.push(...result.newSpellRows);
  }

  return {
    sheetUpdate: lastUpdate ?? {
      level: snapshot.level, xp: snapshot.xp, hpMax: snapshot.hpMax, hpCurrent: snapshot.hpCurrent,
      str: snapshot.str, dex: snapshot.dex, con: snapshot.con,
      int: snapshot.int, wis: snapshot.wis, cha: snapshot.cha,
      initiative: mod(snapshot.dex),
    },
    classLevel: snapshot.classLevel,
    allNewFeatures,
    allNewSpellRows,
  };
}
