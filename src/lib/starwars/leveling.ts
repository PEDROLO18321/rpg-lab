// Star Wars: Além da Fronteira — progressão de nível, multiclasse e limite de PP por turno

import { ARCHETYPE_FORMULA, CLASS_BY_ID, FORCE_BASE_CLASS_IDS, archetypePv1, archetypePvPerLevel, archetypePe1, archetypePePerLevel } from "./classes";
import { TIER_BONUS, SPECIES_BY_ID } from "./species";
import { SKILLS } from "./skills";
import { SKILL_GRADE_ORDER } from "./data";

/** Nível total do personagem (soma dos níveis de todas as classes + bônus sem classe). */
export const MAX_LEVEL = 2000;

/** Nível máximo que uma única classe pode atingir (multiclasse: cada classe tem seu próprio teto). */
export const CLASS_LEVEL_CAP = 40;

/**
 * Sentinela usado no lugar de um classId real quando o jogador escolhe um nível "Bônus":
 * conta pro nível total (e evolução normal do nível), mas não pertence a nenhuma classe —
 * não concede PV/PE de arquétipo nem habilidade de classe. Existe pra permitir alcançar o
 * nível total máximo (2000) mesmo depois que todas as classes possuídas baterem no teto (40).
 */
export const BONUS_LEVEL_ID = "__bonus__";

export function ppLevelUpGain(pre: number): number {
  return 1 + pre;
}

/**
 * PV/PE ganhos ao subir de nível numa classe específica (embute Vigor/Sensitividade pela fórmula do
 * arquétipo). Quando é o 1º nível nessa classe (multiclasse virgem: toLevelInClass === 1), usa a base
 * da classe (pv1/pe1), não o incremento por nível — senão o personagem nasceria com menos PV/PE do que
 * deveria na nova classe.
 */
export function levelUpGain(classId: string, vig: number, sen: number, toLevelInClass: number): { pv: number; pe: number } {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return { pv: 0, pe: 0 };
  const f = ARCHETYPE_FORMULA[cls.archetype];
  if (toLevelInClass === 1) return { pv: archetypePv1(f, vig), pe: archetypePe1(f, sen) };
  return { pv: archetypePvPerLevel(f, vig), pe: archetypePePerLevel(f, sen) };
}

/** Todas as 25 perícias já estão no grau máximo (Mestre) — não sobra nenhuma pra escolher subir. */
export function allSkillsAtMaxGrade(skills: Record<string, string>): boolean {
  const maxGrade = SKILL_GRADE_ORDER[SKILL_GRADE_ORDER.length - 1];
  return SKILLS.every((s) => skills[s.id] === maxGrade);
}

/** Soma PV/PE/PP "por fatia" — cada nível investido numa classe usa a fórmula daquela classe (multiclasse). */
export function computeTotalVitals(
  classLevels: Record<string, number>,
  speciesId: string,
  vig: number,
  sen: number,
  pre: number
): { pvMax: number; peMax: number; ppMax: number } {
  const species = SPECIES_BY_ID[speciesId];
  const tierBonus = species ? TIER_BONUS[species.tier] : { pv: 0, pe: 0 };

  let pvMax = tierBonus.pv;
  let peMax = tierBonus.pe;
  let ppMax = 2 + pre;
  let ppModifierSum = 0;

  for (const [classId, levels] of Object.entries(classLevels)) {
    const cls = CLASS_BY_ID[classId];
    if (!cls || levels <= 0) continue;
    const f = ARCHETYPE_FORMULA[cls.archetype];
    pvMax += archetypePv1(f, vig) + (levels - 1) * archetypePvPerLevel(f, vig);
    peMax += archetypePe1(f, sen) + (levels - 1) * archetypePePerLevel(f, sen);
    ppModifierSum += cls.ppModifier; // modificador de PP é acumulativo entre todas as classes
  }
  ppMax += ppModifierSum;

  return { pvMax, peMax, ppMax };
}

/** Limite de PP gasto por turno: 3 + ceil(nível total / 2). */
export function ppMaxPerTurn(totalLevel: number): number {
  return 3 + Math.ceil(totalLevel / 2);
}

/**
 * Todo nível sobe Vida + PE + PP (sem exceção, pra classe que recebe o nível). A única
 * exceção é o nível Bônus (sem classe): não tem PV/PE de arquétipo, só o PP geral.
 *
 * Além disso, toda subida de nível tem 1 escolha OBRIGATÓRIA, resolvida nesta ordem:
 *   1. Habilidade de Classe — se a classe tiver uma cadastrada exatamente nesse nível.
 *   2. Perícia — senão, treina uma perícia nova ou sobe o grau de uma já treinada.
 *   3. +1 Atributo — só se nem habilidade nem perícia sobrarem (perícias todas em Mestre).
 *
 * Em cima disso, alguns níveis exigem bônus adicionais (também obrigatórios):
 *   - Múltiplo de 5: mais 1 perícia (nova ou sobe grau) + 1 Poder Geral.
 *   - Múltiplo de 10: mais +1 Atributo.
 * (todo múltiplo de 10 também é múltiplo de 5, então acumula os dois.)
 *
 * Multiclasse é um evento à parte, isolado dessas regras — ver `isNewClass` na rota de level-up.
 */
export type MandatoryChoiceKind = "habilidade_classe" | "grau_pericia" | "atributo";

export function isMilestone5(toLevel: number): boolean {
  return toLevel % 5 === 0;
}

export function isMilestone10(toLevel: number): boolean {
  return toLevel % 10 === 0;
}

// ─── Multiclasse ──────────────────────────────────────────────────────────────

export const FREE_MULTICLASS_LEVEL = 2;
export const EXPERT_SKILLS_PER_MULTICLASS = 2;

/** A janela grátis existe só na transição para o nível 2, e só pra quem ainda tem 1 classe. */
export function isFreeMulticlassWindow(fromLevel: number, currentClassCount: number): boolean {
  return fromLevel === FREE_MULTICLASS_LEVEL - 1 && currentClassCount === 1;
}

/** Verifica se duas classes podem coexistir: nem duas classes-base ligadas à Força, nem duas de Caminho. */
export function canCombineClasses(classIdA: string, classIdB: string): boolean {
  if (classIdA === classIdB) return false;
  if (FORCE_BASE_CLASS_IDS.includes(classIdA) && FORCE_BASE_CLASS_IDS.includes(classIdB)) return false;
  const a = CLASS_BY_ID[classIdA], b = CLASS_BY_ID[classIdB];
  if (a?.isPathClass && b?.isPathClass) return false;
  return true;
}

/** Nível mínimo numa classe-base ligada à Força pra liberar as classes de Caminho (O Lado da Luz, O Equilíbrio, O Lado Negro). */
export const PATH_CLASS_UNLOCK_LEVEL = 40;

/** As classes de Caminho só aparecem como opção quando o personagem tem nível 40+ em Padawan Jedi, Acólito Sith ou Andarilho da Força — em qualquer uma delas. */
export function canUnlockPathClass(classLevels: Record<string, number>): boolean {
  return FORCE_BASE_CLASS_IDS.some((id) => (classLevels[id] ?? 0) >= PATH_CLASS_UNLOCK_LEVEL);
}

/**
 * Perícias em grau Expert (ou acima) exigidas pra adicionar mais uma classe.
 * A exigência é cumulativa: 2 Expert pra 1ª multiclasse paga, 4 pra 2ª, 6 pra 3ª...
 * A janela grátis do nível 2 não cobra nada.
 *
 * `currentClassCount - 2` desconta a classe inicial e a da janela grátis. Quem tem 2+
 * classes necessariamente usou a janela grátis: Expert exige vários aumentos de grau,
 * inalcançáveis no nível 2, então não há como ter pago pela segunda classe.
 */
export function expertSkillsRequiredForNewClass(fromLevel: number, currentClassCount: number): number {
  if (isFreeMulticlassWindow(fromLevel, currentClassCount)) return 0;
  const paidSoFar = Math.max(0, currentClassCount - 2);
  return (paidSoFar + 1) * EXPERT_SKILLS_PER_MULTICLASS;
}

/** Conta perícias em grau Expert ou acima (Expert / Veterano / Mestre). */
export function countExpertSkills(skills: Record<string, string>): number {
  return Object.values(skills).filter((g) => g === "expert" || g === "veterano" || g === "mestre").length;
}
