// Star Wars: Além da Fronteira — progressão de nível, multiclasse e limite de PP por turno

import { ARCHETYPE_FORMULA, CLASS_BY_ID, FORCE_BASE_CLASS_IDS } from "./classes";
import { TIER_BONUS, SPECIES_BY_ID } from "./species";

export const MAX_LEVEL = 99;

export function ppLevelUpGain(pre: number): number {
  return 1 + pre;
}

/**
 * PV/PE ganhos ao subir de nível numa classe específica (soma o atributo de novo, igual ao padrão do sistema).
 * Quando é o 1º nível nessa classe (multiclasse virgem: toLevelInClass === 1), usa a base da classe (pv1/pe1),
 * não o incremento por nível — senão o personagem nasceria com menos PV/PE do que deveria na nova classe.
 */
export function levelUpGain(classId: string, vig: number, sen: number, toLevelInClass: number): { pv: number; pe: number } {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return { pv: 0, pe: 0 };
  const f = ARCHETYPE_FORMULA[cls.archetype];
  if (toLevelInClass === 1) return { pv: f.pv1 + vig, pe: f.pe1 + sen };
  return { pv: f.pvPerLevel + vig, pe: f.pePerLevel + sen };
}

/** Nível múltiplo de 5 (5, 10, 15...) força "subir grau de perícia" como única escolha do nível. */
export function isSkillGradeMandatory(toLevel: number): boolean {
  return toLevel % 5 === 0;
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
    pvMax += f.pv1 + vig + (levels - 1) * (f.pvPerLevel + vig);
    peMax += f.pe1 + sen + (levels - 1) * (f.pePerLevel + sen);
    ppModifierSum += cls.ppModifier; // modificador de PP é acumulativo entre todas as classes
  }
  ppMax += ppModifierSum;

  return { pvMax, peMax, ppMax };
}

/** Limite de PP gasto por turno: 3 + ceil(nível total / 2). */
export function ppMaxPerTurn(totalLevel: number): number {
  return 3 + Math.ceil(totalLevel / 2);
}

export type LevelUpChoiceKind = "atributo" | "poder_geral" | "habilidade_classe" | "grau_pericia";

/** Transições ímpar→par liberam atributo OU habilidade; par→ímpar liberam poder geral OU habilidade. */
export function availableChoiceKinds(fromLevel: number, toLevel: number): LevelUpChoiceKind[] {
  const wasOdd = fromLevel % 2 === 1;
  const kinds: LevelUpChoiceKind[] = ["grau_pericia"]; // sempre disponível
  if (wasOdd) kinds.push("atributo", "habilidade_classe");
  else kinds.push("poder_geral", "habilidade_classe");
  return kinds;
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
