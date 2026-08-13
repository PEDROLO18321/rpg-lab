// ─── TORMENTA 20 — geração automática de personagem ("Crie Para Mim") ───────
// Módulo puro (Math.random, sem I/O) usado pelo formulário de geração
// automática. A criação (nível 1) monta o mesmo payload que o wizard manual
// envia para POST /api/tormenta/characters. A progressão de nível reaproveita
// as regras existentes (leveling.ts + powers/registry.ts) e só decide QUAL
// poder/atributo/magia escolher a cada nível — a aplicação em si continua
// sendo feita pelo endpoint HTTP já existente (POST .../levelup), chamado em
// sequência pelo formulário (nenhuma rota nova no servidor é necessária).

import { RACES, type Race } from "./races";
import { CLASSES, CLASS_BY_ID, type TormentaClass } from "./classes";
import { ORIGINS } from "./origins";
import { GODS } from "./gods";
import {
  ATTR_KEYS, POINT_BUY_COST, POINT_BUY_TOTAL, POINT_BUY_MAX,
  SKILL_BY_ID, attrMod, type AttrKey, type TormentaAttrs, type MagicSchool,
} from "./data";
import { resolveClassFixedSkills, resolveKeyAttribute } from "./creation";
import { WEAPONS, ARMORS } from "./items";
import { SPELLS, getSpellsForTradition, getSpellsForSchools, MAGIC_SCHOOLS } from "./spells";
import { randomTormentaName } from "./names";
import { casterProgressionFor, maxCircleAtLevel, type ChosenPower, type LevelUpPlan } from "./leveling";
import { getClassPowers, GENERAL_POWERS, type Power } from "./powers/registry";
import { ATTRIBUTE_INCREASE_POWER } from "./powers/types";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

// Classes sem conjuração não têm um atributo-chave explícito no modelo de
// dados (só `resolveKeyAttribute`, que cobre conjuradores + Paladino) — o
// resto é atribuído aqui por tema, na mesma linha do restante do sistema.
const NON_CASTER_PRIMARY: Record<string, AttrKey> = {
  barbaro: "for", bucaneiro: "car", cacador: "des", cavaleiro: "for",
  guerreiro: "for", inventor: "int", ladino: "des", lutador: "for", nobre: "car",
};

function primaryAttrFor(classId: string, pathId: string | null): AttrKey {
  return resolveKeyAttribute(classId, pathId) ?? NON_CASTER_PRIMARY[classId] ?? "for";
}

function buildPriorityOrder(primary: AttrKey): AttrKey[] {
  const order: AttrKey[] = [primary];
  if (!order.includes("con")) order.push("con");
  for (const k of ["des", "int", "sab", "car", "for"] as AttrKey[]) {
    if (!order.includes(k)) order.push(k);
  }
  return order;
}

// Distribui os 20 pontos de compra (Tabela 1-2) priorizando a habilidade-
// chave, depois Constituição, depois o resto — sobra é gasta na mesma ordem.
function distributeAttrs(priority: AttrKey[]): TormentaAttrs {
  const attrs: TormentaAttrs = { for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 };
  let budget = POINT_BUY_TOTAL;
  const RANK_TARGET = [16, 14, 12, 10, 10, 10];

  priority.forEach((key, i) => {
    const target = Math.min(RANK_TARGET[i] ?? 10, POINT_BUY_MAX);
    while (attrs[key] < target) {
      const delta = POINT_BUY_COST[attrs[key] + 1] - POINT_BUY_COST[attrs[key]];
      if (delta > budget) break;
      attrs[key]++;
      budget -= delta;
    }
  });

  let progress = true;
  while (budget > 0 && progress) {
    progress = false;
    for (const key of priority) {
      if (attrs[key] >= POINT_BUY_MAX) continue;
      const delta = POINT_BUY_COST[attrs[key] + 1] - POINT_BUY_COST[attrs[key]];
      if (delta <= budget) {
        attrs[key]++;
        budget -= delta;
        progress = true;
      }
      if (budget === 0) break;
    }
  }
  return attrs;
}

function pickRaceSetup(): { race: Race; raceVariantId?: string; racialAttrChoices?: AttrKey[] } {
  const race = pick(RACES);
  const raceVariantId = race.variants && race.variants.length > 0 ? pick(race.variants).id : undefined;
  let racialAttrChoices: AttrKey[] | undefined;
  if (race.attrChoiceBonus) {
    const excluded = new Set(race.attrChoiceBonus.exclude ?? []);
    const pool = ATTR_KEYS.filter((k) => !excluded.has(k));
    racialAttrChoices = sampleDistinct(pool, race.attrChoiceBonus.count);
  }
  return { race, raceVariantId, racialAttrChoices };
}

function pickClassSetup(cls: TormentaClass): { pathId?: string; schoolsChosen?: string[]; godId?: string | null } {
  const pathId = cls.paths && cls.paths.length > 0 ? pick(cls.paths).id : undefined;
  const schoolsChosen = cls.spellcasting?.schoolChoiceCount
    ? sampleDistinct(MAGIC_SCHOOLS, cls.spellcasting.schoolChoiceCount)
    : undefined;

  let godId: string | null | undefined;
  if (cls.godChoice) {
    const eligible = GODS.filter((g) =>
      (cls.spellcasting?.tradition === "divina" || cls.id === "paladino") &&
      (cls.id === "clerigo" ? g.clericAllowed : cls.id === "paladino" ? g.paladinAllowed : true),
    ).filter((g) => cls.godChoice!.allowedGodIds.length === 0 || cls.godChoice!.allowedGodIds.includes(g.id));
    godId = eligible.length > 0 ? pick(eligible).id : (cls.godChoice.allowNone ? null : undefined);
  }
  return { pathId, schoolsChosen, godId };
}

function pickClassFixedChoice(cls: TormentaClass): Record<string, string> {
  const choice: Record<string, string> = {};
  for (const f of cls.skillsFixed) {
    if (f.includes("|")) choice[f] = pick(f.split("|"));
  }
  return choice;
}

function pickEquipment(cls: TormentaClass): { weaponId: string; armorId?: string; shieldId?: string } {
  const hasMarcial = cls.proficiencies.includes("Armas marciais");
  const hasPesada = cls.proficiencies.includes("Armaduras pesadas");
  const hasEscudo = cls.proficiencies.includes("Escudos");
  const weaponOptions = WEAPONS.filter((w) => w.category === "simples" || (hasMarcial && w.category === "marcial"));
  const armorOptions = ARMORS.filter((a) => a.category === "leve" || (hasPesada && a.category === "pesada"));
  const shieldOptions = hasEscudo ? ARMORS.filter((a) => a.category === "escudo") : [];

  const weaponId = pick(weaponOptions).id;
  const armorPick = pick<{ id: string } | null>([null, ...armorOptions]);
  const shieldPick = hasEscudo ? pick<{ id: string } | null>([null, ...shieldOptions]) : null;
  return { weaponId, armorId: armorPick?.id, shieldId: shieldPick?.id };
}

export interface AutoGenerateOptions { charName?: string; classId?: string }

/** Monta o payload de criação (nível 1) com todas as escolhas sorteadas. */
export function generateLevel1Build(opts: AutoGenerateOptions = {}) {
  const cls = (opts.classId && CLASS_BY_ID[opts.classId]) || pick(CLASSES);
  const { race, raceVariantId, racialAttrChoices } = pickRaceSetup();
  const origin = pick(ORIGINS);
  const { pathId, schoolsChosen, godId } = pickClassSetup(cls);

  const primary = primaryAttrFor(cls.id, pathId ?? null);
  const priority = buildPriorityOrder(primary);
  const attrBases = distributeAttrs(priority);

  const classFixedChoice = pickClassFixedChoice(cls);
  const resolvedClassFixed = resolveClassFixedSkills(cls.id, classFixedChoice);

  const originSkillChoices = sampleDistinct(origin.skillPool, origin.chooseCount);
  const classPool = cls.skillChoices.filter((id) => !resolvedClassFixed.includes(id) && !originSkillChoices.includes(id));
  const classSkillChoices = sampleDistinct(classPool, cls.skillChoiceCount);

  const intMod = Math.max(0, attrMod(attrBases.int));
  const usedSoFar = new Set([...resolvedClassFixed, ...originSkillChoices, ...classSkillChoices]);
  const intPool = Object.keys(SKILL_BY_ID).filter((id) => !usedSoFar.has(id));
  const intBonusSkillChoices = sampleDistinct(intPool, intMod);

  const selectedSpells = cls.spellcasting
    ? sampleDistinct(
        (cls.spellcasting.schoolChoiceCount
          ? getSpellsForSchools(cls.spellcasting.tradition, (schoolsChosen ?? []) as MagicSchool[], 1)
          : getSpellsForTradition(cls.spellcasting.tradition, 1)
        ).map((s) => s.id),
        cls.spellcasting.startingSpells,
      )
    : [];

  const { weaponId, armorId, shieldId } = pickEquipment(cls);

  return {
    charName: opts.charName?.trim() || randomTormentaName(),
    raceId: race.id,
    raceVariantId,
    racialAttrChoices,
    classId: cls.id,
    pathId,
    schoolsChosen,
    godId,
    originId: origin.id,
    originSkillChoices,
    classSkillChoices,
    classFixedChoice,
    intBonusSkillChoices,
    attrBases,
    selectedSpells,
    weaponId,
    armorId,
    shieldId,
    desc: {},
  };
}

// ── Progressão automática (nível > 1) ─────────────────────────────────────────
// Cada chamada decide a escolha de UM nível; quem aplica é o endpoint HTTP já
// existente (POST /api/tormenta/characters/{id}/levelup), chamado em sequência
// pelo formulário — sem duplicar a lógica de regra do servidor.

export interface AutoLevelChoice { power: Power; attrKey?: AttrKey; newSpells: string[] }

export function pickLevelUpChoice(
  classId: string,
  pathId: string | null,
  plan: LevelUpPlan,
  currentAttrs: TormentaAttrs,
  existingPowers: ChosenPower[],
  spellsKnown: string[],
  schoolsChosen: string[],
): AutoLevelChoice {
  const cls = CLASS_BY_ID[classId];
  const primary = primaryAttrFor(classId, pathId);
  const priority = buildPriorityOrder(primary);

  const ownedIds = new Set(existingPowers.map((p) => p.id));
  const classPowers = getClassPowers(classId).filter((p) => !ownedIds.has(p.id));
  const generalPowers = GENERAL_POWERS.filter((p) => !ownedIds.has(p.id));

  const wantsAttrIncrease = plan.toLevel % 3 === 0;
  const attrTarget = priority.find((k) => currentAttrs[k] < 18);

  let power: Power;
  let attrKey: AttrKey | undefined;
  if (wantsAttrIncrease && attrTarget) {
    power = ATTRIBUTE_INCREASE_POWER;
    attrKey = attrTarget;
  } else if (classPowers.length > 0) {
    power = pick(classPowers);
  } else if (generalPowers.length > 0) {
    power = pick(generalPowers);
  } else {
    power = ATTRIBUTE_INCREASE_POWER;
    attrKey = attrTarget ?? "con";
  }

  let newSpells: string[] = [];
  if (plan.spellsGained > 0 && cls?.spellcasting) {
    const prog = casterProgressionFor(cls);
    const maxCircle = prog ? maxCircleAtLevel(prog, plan.toLevel) : 1;
    const known = new Set(spellsKnown);
    const pool = SPELLS.filter((s) =>
      s.tradition === cls.spellcasting!.tradition &&
      s.circle <= maxCircle &&
      (!cls.spellcasting!.schoolChoiceCount || schoolsChosen.includes(s.school)) &&
      !known.has(s.id),
    );
    newSpells = sampleDistinct(pool.map((s) => s.id), plan.spellsGained);
  }

  return { power, attrKey, newSpells };
}
