// Star Wars: Além da Fronteira — agregação de habilidades de classe

import { CLASS_GROUP_A } from "./classGroupA";
import { CLASS_GROUP_B } from "./classGroupB";
import { CLASS_GROUP_C } from "./classGroupC";
import type { ClassAbility, ClassAbilityTable, ClassMilestone } from "./types";

export const ALL_CLASS_ABILITY_TABLES: ClassAbilityTable[] = [
  ...CLASS_GROUP_A,
  ...CLASS_GROUP_B,
  ...CLASS_GROUP_C,
];

export const CLASS_ABILITY_TABLE_BY_ID: Record<string, ClassAbilityTable> = Object.fromEntries(
  ALL_CLASS_ABILITY_TABLES.map((t) => [t.classId, t])
);

export function getClassAbilities(classId: string): ClassAbility[] {
  return CLASS_ABILITY_TABLE_BY_ID[classId]?.abilities ?? [];
}

export function getClassMilestones(classId: string): ClassMilestone[] {
  return CLASS_ABILITY_TABLE_BY_ID[classId]?.milestones ?? [];
}

/** Habilidades (dos 5 círculos) disponíveis até o nível investido naquela classe. */
export function getAvailableAbilities(classId: string, levelInClass: number): ClassAbility[] {
  return getClassAbilities(classId).filter((a) => a.level <= levelInClass);
}

/** Habilidades da classe agrupadas por "Nível de Classe", até maxLevel (padrão 25 — usado no wizard, antes de ter nível). */
export function getAbilitiesGroupedByLevel(classId: string, maxLevel = 25): { level: number; abilities: ClassAbility[] }[] {
  const abilities = getClassAbilities(classId).filter((a) => a.level <= maxLevel);
  const byLevel = new Map<number, ClassAbility[]>();
  for (const a of abilities) {
    if (!byLevel.has(a.level)) byLevel.set(a.level, []);
    byLevel.get(a.level)!.push(a);
  }
  return Array.from(byLevel.entries())
    .sort(([a], [b]) => a - b)
    .map(([level, abilities]) => ({ level, abilities }));
}

/** Marcos revelados: só depois de completar o 5º círculo (nível 20) na classe. */
export function getAvailableMilestones(classId: string, levelInClass: number): ClassMilestone[] {
  if (levelInClass < 20) return [];
  return getClassMilestones(classId).filter((m) => m.level <= levelInClass);
}

export { CLASS_GROUP_A, CLASS_GROUP_B, CLASS_GROUP_C };
export * from "./types";
export * from "./generalPowers";
