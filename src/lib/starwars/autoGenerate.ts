// ─── STAR WARS: ALÉM DA FRONTEIRA — geração automática ("Crie Para Mim") ────
// Módulo puro (Math.random, sem I/O). generateLevel1Build monta o mesmo
// payload que o wizard manual (CharacterWizard.finish()) envia para
// POST /api/starwars/characters. O avanço de nível reaproveita as regras já
// existentes em leveling.ts/powers/registry.ts para decidir escolhas válidas
// a cada nível — quem chama repete POST .../levelup em sequência, sem rota
// nova no servidor (mesmo padrão do Tormenta 20 e Ordem Paranormal). Só
// personagens de classe única são gerados (sem multiclasse automática).

import { ATTR_KEYS, SKILL_GRADE_ORDER, type AttrKey, type StarWarsAttrs } from "./data";
import { SPECIES, SPECIES_BY_ID, type Species } from "./species";
import { PLANETS } from "./planets";
import { CLASSES, type Archetype } from "./classes";
import { SKILLS } from "./skills";
import { NAMES_BY_SPECIES } from "./names";
import { finalAttrs, trainedSkillCount, effectivePlanetSkill } from "./creation";
import { getClassAbilities, getAvailableAbilities } from "./powers/registry";
import { GENERAL_POWERS } from "./powers/generalPowers";
import { POOL_CLASS_IDS, getRemainingPoolAbilities, isMilestone5, isMilestone10 } from "./leveling";
import type { ChosenPower } from "./powers/types";

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

const ARCHETYPE_PRIORITY: Record<Archetype, AttrKey[]> = {
  marcial: ["vig", "forca", "agi", "int", "pre", "sen"],
  especialista: ["int", "pre", "agi", "vig", "sen", "forca"],
  sensivel: ["sen", "pre", "agi", "int", "vig", "forca"],
};

// 7 pontos livres na criação, teto 4 por atributo — distribui priorizando os
// atributos-chave do arquétipo da classe.
function distributeAttrs(priority: AttrKey[]): StarWarsAttrs {
  const attrs: StarWarsAttrs = { agi: 0, int: 0, forca: 0, vig: 0, pre: 0, sen: 0 };
  let budget = 7;
  let progress = true;
  while (budget > 0 && progress) {
    progress = false;
    for (const k of priority) {
      if (budget <= 0) break;
      if (attrs[k] < 4) {
        attrs[k]++;
        budget--;
        progress = true;
      }
    }
  }
  return attrs;
}

function buildHumanChoice(species: Species): { plus2: AttrKey[]; plus1: AttrKey[]; minus1: AttrKey[] } | undefined {
  if (!species.attrFreeChoice) return undefined;
  const { plus2, plus1, minus1 } = species.attrFreeChoice;
  const plus2Picks = sampleDistinct(ATTR_KEYS, plus2);
  const pool1 = ATTR_KEYS.filter((k) => !plus2Picks.includes(k));
  const plus1Picks = sampleDistinct(pool1, plus1);
  const pool2 = pool1.filter((k) => !plus1Picks.includes(k));
  const minus1Picks = sampleDistinct(pool2, minus1);
  return { plus2: plus2Picks, plus1: plus1Picks, minus1: minus1Picks };
}

export interface AutoGenerateOptions { charName?: string; classId?: string }

export interface AutoLevelState {
  levelInClass: number;
  skills: Record<string, string>;
  classPowerNames: string[];
  generalPowerIds: string[];
}

export interface GeneratedBuild {
  payload: Record<string, unknown>;
  classId: string;
  initialLevelState: AutoLevelState;
}

/** Monta o payload de criação (nível 1) com todas as escolhas sorteadas. */
export function generateLevel1Build(opts: AutoGenerateOptions = {}): GeneratedBuild {
  const species = pick(SPECIES);
  const planet = pick(PLANETS);
  const pathId = pick(["luz", "neutro", "sombrio"] as const);
  const selectableClasses = CLASSES.filter((c) => !c.isPathClass && !c.isPropheticClass);
  const cls = (opts.classId && selectableClasses.find((c) => c.id === opts.classId)) || pick(selectableClasses);

  const humanChoice = buildHumanChoice(species);
  const attrBases = distributeAttrs(ARCHETYPE_PRIORITY[cls.archetype]);
  const attrsFinal = finalAttrs(attrBases, species.id, humanChoice);

  const planetSkillChoice = planet.naturalAbility.skills.length > 1 ? pick(planet.naturalAbility.skills) : undefined;
  const chosenPlanetSkill = effectivePlanetSkill(planet.id, planetSkillChoice);

  const firstAbilities = getClassAbilities(cls.id).filter((a) => a.level === 1);
  let classAbilityChoice: string | undefined;
  let initialPowerName: string | undefined;
  if (firstAbilities.length > 1) {
    initialPowerName = pick(firstAbilities).name;
    classAbilityChoice = initialPowerName;
  } else if (firstAbilities.length === 1) {
    initialPowerName = firstAbilities[0].name;
  }

  const skillCount = trainedSkillCount(cls.id, attrsFinal.int);
  const excluded = new Set([...species.initialSkills, ...(chosenPlanetSkill ? [chosenPlanetSkill] : [])]);
  const skillPool = SKILLS.map((s) => s.id).filter((id) => !excluded.has(id));
  const skillChoices = sampleDistinct(skillPool, skillCount);

  const names = NAMES_BY_SPECIES[species.id];
  const charName = opts.charName?.trim() || pick([...names.male, ...names.female]);

  const initialSkills: Record<string, string> = {};
  for (const id of species.initialSkills) initialSkills[id] = "iniciante";
  if (chosenPlanetSkill) initialSkills[chosenPlanetSkill] = "iniciante";
  for (const id of skillChoices.slice(0, skillCount)) initialSkills[id] = "iniciante";

  return {
    payload: {
      charName,
      speciesId: species.id,
      humanChoice,
      planetId: planet.id,
      planetSkillChoice,
      pathId,
      classId: cls.id,
      classAbilityChoice,
      attrBases,
      skillChoices,
      desc: {},
    },
    classId: cls.id,
    initialLevelState: {
      levelInClass: 1,
      skills: initialSkills,
      classPowerNames: initialPowerName ? [initialPowerName] : [],
      generalPowerIds: [],
    },
  };
}

// ── Progressão automática (nível > 1, classe única) ───────────────────────────

function nonMaxSkillIds(skills: Record<string, string>): string[] {
  const maxGrade = SKILL_GRADE_ORDER[SKILL_GRADE_ORDER.length - 1];
  return SKILLS.filter((s) => (skills[s.id] ?? "inexperiente") !== maxGrade).map((s) => s.id);
}

function bumpSkill(skills: Record<string, string>, sid: string) {
  const current = skills[sid] ?? "inexperiente";
  const idx = SKILL_GRADE_ORDER.indexOf(current as (typeof SKILL_GRADE_ORDER)[number]);
  skills[sid] = SKILL_GRADE_ORDER[idx + 1];
}

/**
 * Decide UM nível de avanço (sempre na mesma classe) e devolve o corpo exato
 * do POST pra /api/starwars/characters/{id}/levelup, junto com o estado já
 * atualizado (perícias/poderes) pra encadear a próxima chamada. Nunca precisa
 * consultar o banco: PV/PE/PP e atributos são recalculados pelo próprio
 * servidor a partir do que já está salvo — só perícias e poderes precisam
 * ser rastreados aqui pra escolher opções válidas.
 */
export function pickLevelUpBody(classId: string, state: AutoLevelState): { body: Record<string, unknown>; nextState: AutoLevelState } {
  const toLevelInClass = state.levelInClass + 1;
  const skills = { ...state.skills };

  const isPoolClass = POOL_CLASS_IDS.has(classId);
  const ownedAsChosen: ChosenPower[] = state.classPowerNames.map((name) => ({ level: 0, id: name, name, source: "classe", classId }));
  const remainingPool = isPoolClass ? getRemainingPoolAbilities(classId, toLevelInClass, ownedAsChosen) : [];
  const linearAvail = !isPoolClass ? getAvailableAbilities(classId, toLevelInClass).filter((a) => a.level === toLevelInClass) : [];
  const hasHabilidade = isPoolClass ? remainingPool.length > 0 : linearAvail.length > 0;

  let classPowerId: string | undefined;
  let mandatorySkillId: string | undefined;
  let mandatoryAttrKey: string | undefined;

  if (hasHabilidade) {
    classPowerId = (isPoolClass ? pick(remainingPool) : pick(linearAvail)).name;
  } else {
    const nonMax = nonMaxSkillIds(skills);
    if (nonMax.length > 0) {
      mandatorySkillId = pick(nonMax);
      bumpSkill(skills, mandatorySkillId);
    } else {
      mandatoryAttrKey = pick(ATTR_KEYS);
    }
  }

  let milestoneSkillId: string | undefined;
  let milestonePowerId: string | undefined;
  let milestoneAttrKey: string | undefined;
  const generalPowerIds = [...state.generalPowerIds];

  const toLevel = toLevelInClass; // classe única: nível total == nível na classe
  if (isMilestone5(toLevel)) {
    const nonMaxAfter = nonMaxSkillIds(skills);
    if (nonMaxAfter.length > 0) {
      milestoneSkillId = pick(nonMaxAfter);
      bumpSkill(skills, milestoneSkillId);
    }
    const availablePowers = GENERAL_POWERS.filter((p) => !generalPowerIds.includes(p.id));
    if (availablePowers.length > 0) {
      milestonePowerId = pick(availablePowers).id;
      generalPowerIds.push(milestonePowerId);
    }
  }
  if (isMilestone10(toLevel)) {
    milestoneAttrKey = pick(ATTR_KEYS);
  }

  const classPowerNames = classPowerId ? [...state.classPowerNames, classPowerId] : state.classPowerNames;

  return {
    body: { classId, classPowerId, mandatorySkillId, mandatoryAttrKey, milestoneSkillId, milestonePowerId, milestoneAttrKey },
    nextState: { levelInClass: toLevelInClass, skills, classPowerNames, generalPowerIds },
  };
}
