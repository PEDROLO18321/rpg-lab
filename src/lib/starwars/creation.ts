// Star Wars: Além da Fronteira — regras de criação de personagem

import { ATTR_KEYS, SKILL_GRADE_BONUS, type AttrKey, type SkillGrade, type StarWarsAttrs } from "./data";
import { SPECIES_BY_ID, TIER_BONUS } from "./species";
import { CLASS_BY_ID, ARCHETYPE_FORMULA } from "./classes";
import { PLANET_BY_ID } from "./planets";

/** A perícia da Habilidade Natal exige escolha do jogador quando o planeta lista 2 opções. Com 1 só, não há escolha. */
export function planetSkillNeedsChoice(planetId: string | null | undefined): boolean {
  if (!planetId) return false;
  const planet = PLANET_BY_ID[planetId];
  return !!planet && planet.naturalAbility.skills.length > 1;
}

/** Perícia efetivamente escolhida: a escolha do jogador se houver 2 opções, ou a única opção do planeta. */
export function effectivePlanetSkill(planetId: string | null | undefined, chosenSkillId: string | null | undefined): string | null {
  if (!planetId) return null;
  const planet = PLANET_BY_ID[planetId];
  if (!planet) return null;
  if (planet.naturalAbility.skills.length === 1) return planet.naturalAbility.skills[0];
  return chosenSkillId ?? null;
}

/** Bônus fixo da Habilidade Natal do planeta: +5 só na perícia escolhida (ou única, se o planeta só listar 1). Não altera o grau salvo — é somado por cima na hora do teste. */
export function planetSkillBonus(planetId: string | null | undefined, chosenSkillId: string | null | undefined, skillId: string): number {
  return effectivePlanetSkill(planetId, chosenSkillId) === skillId ? 5 : 0;
}

/** Bônus total de perícia: grau de treinamento + Habilidade Natal do planeta (se aplicável). */
export function totalSkillBonus(grade: SkillGrade, planetId: string | null | undefined, chosenSkillId: string | null | undefined, skillId: string): number {
  return SKILL_GRADE_BONUS[grade] + planetSkillBonus(planetId, chosenSkillId, skillId);
}

/** Pool de dados por atributo, mesma regra de Ordem Paranormal — aceita atributo negativo.
 * Atributo positivo: rola N d20 (N = valor do atributo) e usa o MAIOR resultado.
 * Atributo zero: rola 1d20 normal.
 * Atributo negativo: rola (|valor| + 1) d20 e usa o MENOR resultado. */
export function attributeDicePool(attr: number): { dice: number; take: "highest" | "lowest" } {
  if (attr > 0) return { dice: attr, take: "highest" };
  if (attr < 0) return { dice: Math.abs(attr) + 1, take: "lowest" };
  return { dice: 1, take: "highest" };
}

/** Aplica o modificador de espécie (fixo, ou a escolha livre do Humano) aos atributos base do jogador. */
export function finalAttrs(
  base: StarWarsAttrs,
  speciesId: string,
  humanChoice?: { plus2: AttrKey[]; plus1: AttrKey[]; minus1: AttrKey[] }
): StarWarsAttrs {
  const species = SPECIES_BY_ID[speciesId];
  const result: StarWarsAttrs = { ...base };
  if (!species) return result;

  if (species.attrFreeChoice && humanChoice) {
    for (const k of humanChoice.plus2) result[k] += 2;
    for (const k of humanChoice.plus1) result[k] += 1;
    for (const k of humanChoice.minus1) result[k] -= 1;
  } else {
    for (const k of ATTR_KEYS) {
      result[k] += species.attrBonus[k] ?? 0;
    }
  }
  return result;
}

/** Nº de perícias treinadas na criação = ceil(INT final × multiplicador do arquétipo da classe). */
export function trainedSkillCount(classId: string, intFinal: number): number {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return 0;
  const mult = ARCHETYPE_FORMULA[cls.archetype].skillMultiplier;
  return Math.ceil(Math.max(0, intFinal) * mult);
}

export interface StarWarsVitals {
  pvMax: number;
  peMax: number;
  ppMax: number;
}

/** PV/PE/PP no nível 1, combinando classe + espécie + atributo. */
export function computeVitals(classId: string, speciesId: string, vig: number, sen: number, pre: number): StarWarsVitals {
  const cls = CLASS_BY_ID[classId];
  const species = SPECIES_BY_ID[speciesId];
  if (!cls || !species) return { pvMax: 1, peMax: 0, ppMax: 0 };

  const formula = ARCHETYPE_FORMULA[cls.archetype];
  const tierBonus = TIER_BONUS[species.tier];
  const pvMax = formula.pv1 + tierBonus.pv + vig;
  const peMax = formula.pe1 + tierBonus.pe + sen;
  const ppMax = 2 + pre + cls.ppModifier;

  return { pvMax, peMax, ppMax };
}
