import { prisma } from "@/lib/prisma";
import { RACES } from "./races";
import { CLASSES } from "./classes";
import { BACKGROUNDS } from "./backgrounds";
import { resolveEquipment, extractStartingCurrency } from "./equipmentParser";
import { computeArmorAC } from "./items";
import { SPELLS, spellClassKey } from "./spells";
import type { Spell } from "./spells";
import type { AbilityKey } from "./races";
import {
  MAX_LEVEL,
  XP_THRESHOLDS,
  buildLevelUpPlan,
  averageHpGain,
  validateAsi,
  spellChoicesOnLevelUp,
  maxSpellLevelAt,
} from "./leveling";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface DescData {
  alignment?: string;
  age?: string; height?: string; weight?: string;
  eyes?: string; skin?: string; hair?: string;
  personalityTrait?: string; ideal?: string; bond?: string; flaw?: string;
  backstory?: string;
}

export interface CreateCharacterInput {
  userId: string;
  systemId: string;
  charName: string;
  raceId: string;
  subraceId?: string;
  classId: string;
  subclassId?: string;
  backgroundId: string;
  abilityBases: Record<AbilityKey, number>;
  selectedSkills: string[];
  desc?: DescData;
  equipmentChoices?: Record<string, string>;
  selectedCantrips?: string[];
  selectedSpells?: string[];
  selectedLanguages?: string[];
  racialAbilityBonuses?: Partial<Record<AbilityKey, number>>;
  selectedRacialSkills?: string[];
}

/** Estado mínimo de uma ficha necessário para calcular subidas de nível em memória. */
export interface SheetSnapshot {
  level: number;
  xp: number;
  hpMax: number;
  hpCurrent: number;
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
  race: string;
  classId: string;
  classLevel: number;
  hitDie: number;
  knownSpellNames: Set<string>;
}

export type CreateCharacterResult =
  | { ok: true; id: string; snapshot: SheetSnapshot }
  | { ok: false; error: string; status: number };

// ── Criação ──────────────────────────────────────────────────────────────────

export async function createCharacter(input: CreateCharacterInput): Promise<CreateCharacterResult> {
  const {
    userId, systemId, charName, raceId, subraceId, classId, subclassId, backgroundId,
    abilityBases, selectedSkills, desc, equipmentChoices, selectedCantrips, selectedSpells,
    selectedLanguages, racialAbilityBonuses, selectedRacialSkills,
  } = input;

  if (!userId || !systemId || !charName?.trim() || !raceId || !classId || !backgroundId) {
    return { ok: false, error: "Dados incompletos.", status: 400 };
  }
  if (!abilityBases || Object.keys(abilityBases).length !== 6) {
    return { ok: false, error: "Atributos incompletos.", status: 400 };
  }

  const race = RACES.find((r) => r.id === raceId);
  const subrace = race?.subraces.find((s) => s.id === subraceId);
  const cls = CLASSES.find((c) => c.id === classId);
  if (!race || !cls) {
    return { ok: false, error: "Raça ou classe inválida.", status: 400 };
  }

  const racialBonus: Partial<Record<AbilityKey, number>> = {};
  for (const [k, v] of Object.entries(race.baseBonus) as [AbilityKey, number][]) {
    racialBonus[k] = (racialBonus[k] ?? 0) + v;
  }
  if (subrace) {
    for (const [k, v] of Object.entries(subrace.bonus) as [AbilityKey, number][]) {
      racialBonus[k] = (racialBonus[k] ?? 0) + v;
    }
  }
  if (racialAbilityBonuses) {
    for (const [k, v] of Object.entries(racialAbilityBonuses) as [AbilityKey, number][]) {
      racialBonus[k] = (racialBonus[k] ?? 0) + v;
    }
  }

  const finalScores = ABILITIES.reduce((acc, k) => ({
    ...acc,
    [k]: (abilityBases[k] ?? 8) + (racialBonus[k] ?? 0),
  }), {} as Record<AbilityKey, number>);

  const conMod = mod(finalScores.con);
  const dexMod = mod(finalScores.dex);
  const wisMod = mod(finalScores.wis);

  const isAnaoDaColina = subraceId === "anao-colina";
  const hpMax = cls.hitDie + conMod + (isAnaoDaColina ? 1 : 0);

  const baseAC = 10 + dexMod;
  const unarmoredDefense = classId === "barbaro" ? 10 + dexMod + conMod
                          : classId === "monge"   ? 10 + dexMod + wisMod
                          : 10 + dexMod;
  const unarmoredBase = Math.max(baseAC, unarmoredDefense);

  const notesData = { ...(desc ?? {}), languages: selectedLanguages ?? [] };
  const notes = JSON.stringify(notesData);

  const subclassObj = subclassId ? cls.subclasses?.find((s) => s.id === subclassId) : null;

  const allSelectedSpellIds = [...(selectedCantrips ?? []), ...(selectedSpells ?? [])];
  const resolvedSpells = allSelectedSpellIds
    .map((id) => SPELLS.find((s) => s.id === id))
    .filter((s): s is Spell => !!s);

  const bg = BACKGROUNDS.find((b) => b.id === backgroundId);
  const ec: Record<string, string> = equipmentChoices ?? {};
  const resolvedItems = resolveEquipment(cls.startingEquipment, bg?.startingEquipment ?? [], ec);
  const startingCurrency = extractStartingCurrency(cls.startingEquipment, bg?.startingEquipment ?? []);

  const ac = computeArmorAC(resolvedItems, dexMod, unarmoredBase);

  const raceField = subraceId ? `${raceId}/${subraceId}` : raceId;

  const character = await prisma.character.create({
    data: {
      userId,
      systemId,
      name: charName.trim(),
      notes,
      dndSheet: {
        create: {
          race:       raceField,
          background: backgroundId,
          alignment:  desc?.alignment ?? null,
          level:      1,
          str: finalScores.str,
          dex: finalScores.dex,
          con: finalScores.con,
          int: finalScores.int,
          wis: finalScores.wis,
          cha: finalScores.cha,
          hpMax,
          hpCurrent: hpMax,
          hitDice:   `D${cls.hitDie}`,
          speed:     subrace?.speed ?? race.speed,
          armorClass:   ac,
          initiative:   dexMod,
          spellAbility: cls.spellcastingAbility ?? null,
          gp: startingCurrency.gp ?? 0,
          sp: startingCurrency.sp ?? 0,
          cp: startingCurrency.cp ?? 0,
          ep: startingCurrency.ep ?? 0,
          pp: startingCurrency.pp ?? 0,
          classes: {
            create: {
              className: classId,
              subclass:  subclassObj?.name ?? null,
              level:     1,
            },
          },
          skills: {
            create: Array.from(new Set([
              ...(selectedSkills ?? []),
              ...(selectedRacialSkills ?? []),
              ...(raceId === "meio-orc" ? ["Intimidação"] : []),
            ])).map((skillName: string) => ({
              skillName,
              proficient: true,
            })),
          },
          equipment: resolvedItems.length > 0 ? {
            create: resolvedItems.map((itemName: string) => ({
              itemName,
              quantity: 1,
            })),
          } : undefined,
          spells: resolvedSpells.length > 0 ? {
            create: resolvedSpells.map((spell) => ({
              spellName:   spell.name,
              level:       spell.level,
              school:      spell.school,
              prepared:    spell.level === 0,
              castingTime: spell.castingTime,
              range:       spell.range,
              duration:    spell.duration,
              components:  "",
            })),
          } : undefined,
        },
      },
    },
    select: { id: true },
  });

  return {
    ok: true,
    id: character.id,
    snapshot: {
      level: 1,
      xp: 0,
      hpMax,
      hpCurrent: hpMax,
      str: finalScores.str, dex: finalScores.dex, con: finalScores.con,
      int: finalScores.int, wis: finalScores.wis, cha: finalScores.cha,
      race: raceField,
      classId,
      classLevel: 1,
      hitDie: cls.hitDie,
      knownSpellNames: new Set(resolvedSpells.map((s) => s.name.toLowerCase())),
    },
  };
}

// ── Subir 1 nível (classe existente, sem multiclasse) ─────────────────────────

export interface LevelUpOnceOptions {
  hpMode: "average" | "roll";
  hpRoll?: number;
  asi?: Partial<Record<AbilityKey, number>>;
  newSpells?: string[];
}

export interface LevelUpOnceSuccess {
  ok: true;
  newSheet: SheetSnapshot;
  sheetUpdate: {
    level: number; xp: number; hpMax: number; hpCurrent: number;
    str: number; dex: number; con: number; int: number; wis: number; cha: number;
    initiative: number;
  };
  classLevel: number;
  newFeatures: { name: string; source: string; description: string }[];
  newSpellRows: Spell[];
  summary: {
    newLevel: number;
    hpGain: number;
    hpDie: number;
    hpMode: "average" | "roll";
    conRetroactive: number;
    newHpMax: number;
    profBonusBefore: number;
    profBonusAfter: number;
    asiApplied: Partial<Record<AbilityKey, number>>;
    features: { name: string; source: string; description: string }[];
    slotsGained: Record<string, number>;
    newMaxSlots: Record<string, number>;
    cantripsBefore: number;
    cantripsAfter: number;
    spellsKnownBefore: number;
    spellsKnownAfter: number;
    spellsLearned: string[];
  };
}

export type LevelUpOnceResult =
  | LevelUpOnceSuccess
  | { ok: false; error: string; status: number };

export function levelUpCharacterOnce(sheet: SheetSnapshot, opts: LevelUpOnceOptions): LevelUpOnceResult {
  const cls = CLASSES.find((c) => c.id === sheet.classId);
  if (!cls) return { ok: false, error: "Classe do personagem não reconhecida.", status: 400 };
  if (sheet.level >= MAX_LEVEL) return { ok: false, error: "Nível máximo (20) já alcançado.", status: 400 };

  const plan = buildLevelUpPlan(cls.id, sheet.race ?? "", sheet.classLevel, cls.hitDie, sheet.level);
  if (!plan) return { ok: false, error: "Nível máximo já alcançado.", status: 400 };

  const currentScores: Record<AbilityKey, number> = {
    str: sheet.str, dex: sheet.dex, con: sheet.con, int: sheet.int, wis: sheet.wis, cha: sheet.cha,
  };

  let hpDie: number;
  if (opts.hpMode === "roll") {
    const r = opts.hpRoll;
    if (!r || !Number.isInteger(r) || r < 1 || r > cls.hitDie) {
      return { ok: false, error: `Rolagem de PV inválida (1–${cls.hitDie}).`, status: 400 };
    }
    hpDie = r;
  } else {
    hpDie = averageHpGain(cls.hitDie);
  }

  const asiIncreases: Partial<Record<AbilityKey, number>> = {};
  if (plan.asi) {
    const raw = opts.asi ?? {};
    for (const k of ABILITIES) {
      const v = Number(raw[k] ?? 0);
      if (v > 0) asiIncreases[k] = v;
    }
    const err = validateAsi(asiIncreases, currentScores);
    if (err) return { ok: false, error: err, status: 400 };
  }

  const newScores = { ...currentScores };
  for (const [k, v] of Object.entries(asiIncreases) as [AbilityKey, number][]) {
    newScores[k] += v;
  }

  const conModBefore = mod(currentScores.con);
  const conModAfter  = mod(newScores.con);
  const hpGain        = Math.max(1, hpDie + conModAfter);
  const retroactiveHp = (conModAfter - conModBefore) * plan.fromLevel;
  const newHpMax = sheet.hpMax + hpGain + retroactiveHp;

  const choices    = spellChoicesOnLevelUp(cls.id, plan.newLevel);
  const classKey   = spellClassKey(cls.id);
  const maxSpellLv = maxSpellLevelAt(cls.id, plan.newLevel);

  const requestedIds = opts.newSpells ?? [];
  const newSpellRows: Spell[] = [];
  const known = new Set(sheet.knownSpellNames);
  let cantripCount = 0;
  let spellCount   = 0;
  for (const sid of requestedIds) {
    const sp = SPELLS.find((s) => s.id === sid);
    if (!sp) return { ok: false, error: `Magia desconhecida: ${sid}`, status: 400 };
    if (!sp.classes.includes(classKey)) {
      return { ok: false, error: `${sp.name} não pertence à lista da sua classe.`, status: 400 };
    }
    if (known.has(sp.name.toLowerCase())) {
      return { ok: false, error: `${sp.name} já é conhecida.`, status: 400 };
    }
    if (sp.level === 0) {
      cantripCount++;
      if (cantripCount > choices.cantrips) {
        return { ok: false, error: "Truques escolhidos além do permitido.", status: 400 };
      }
    } else {
      if (sp.level > maxSpellLv) {
        return { ok: false, error: `${sp.name} é de nível maior que seus espaços (${maxSpellLv}°).`, status: 400 };
      }
      spellCount++;
      if (spellCount > choices.spells) {
        return { ok: false, error: "Magias escolhidas além do permitido.", status: 400 };
      }
    }
    known.add(sp.name.toLowerCase());
    newSpellRows.push(sp);
  }

  const newFeatures = [
    ...plan.classFeatures.map((f) => ({ ...f, source: `${cls.name} ${plan.newLevel}°` })),
    ...plan.raceFeatures.map((f)  => ({ ...f, source: `Raça · ${plan.newLevel}° nível` })),
  ];

  const sheetUpdate = {
    level:      plan.totalLevelAfter,
    xp:         Math.max(sheet.xp, XP_THRESHOLDS[plan.totalLevelAfter]),
    hpMax:      newHpMax,
    hpCurrent:  sheet.hpCurrent + hpGain + retroactiveHp,
    str: newScores.str, dex: newScores.dex, con: newScores.con,
    int: newScores.int, wis: newScores.wis, cha: newScores.cha,
    initiative: mod(newScores.dex),
  };

  const newSheet: SheetSnapshot = {
    level: plan.totalLevelAfter,
    xp: sheetUpdate.xp,
    hpMax: newHpMax,
    hpCurrent: sheetUpdate.hpCurrent,
    str: newScores.str, dex: newScores.dex, con: newScores.con,
    int: newScores.int, wis: newScores.wis, cha: newScores.cha,
    race: sheet.race,
    classId: sheet.classId,
    classLevel: plan.newLevel,
    hitDie: sheet.hitDie,
    knownSpellNames: known,
  };

  return {
    ok: true,
    newSheet,
    sheetUpdate,
    classLevel: plan.newLevel,
    newFeatures,
    newSpellRows,
    summary: {
      newLevel:          plan.totalLevelAfter,
      hpGain:            hpGain + retroactiveHp,
      hpDie,
      hpMode:            opts.hpMode,
      conRetroactive:    retroactiveHp,
      newHpMax,
      profBonusBefore:   plan.profBonusBefore,
      profBonusAfter:    plan.profBonusAfter,
      asiApplied:        asiIncreases,
      features:          newFeatures,
      slotsGained:       plan.slotsGained,
      newMaxSlots:       plan.newMaxSlots,
      cantripsBefore:    plan.cantripsBefore,
      cantripsAfter:     plan.cantripsAfter,
      spellsKnownBefore: plan.spellsKnownBefore,
      spellsKnownAfter:  plan.spellsKnownAfter,
      spellsLearned:     newSpellRows.map((sp) => sp.name),
    },
  };
}
