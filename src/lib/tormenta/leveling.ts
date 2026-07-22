// ─── TORMENTA 20 — Progressão de Nível (Capítulo 1: "Nível de Personagem") ────
// Do 1º ao 20º nível. Fonte: Tabela 1-3 (XP), "Benefícios por Nível" (pág. 34-35)
// e a tabela "Tabela 1-X: O <Classe>" de cada classe (progressão individual).
//
// Regras gerais (idênticas para as 14 classes):
//  - PV/PM: somam o valor por nível da classe + mod. de atributo a cada nível
//    (ver computePvMax/computePmMax).
//  - Bônus em perícias: metade do nível (arred. baixo) + 2 se treinada — já
//    implementado em data.ts (skillModifier), recalculado sempre a partir do
//    nível atual, sem necessidade de armazenar histórico.
//  - Atributos NÃO sobem automaticamente: só mudam via o poder "Aumento de
//    Atributo" (+2 a escolha, +1 da 2ª vez no mesmo atributo), que é uma opção
//    de poder disponível em todas as classes (ver powers/types.ts).
//  - A partir do 2º nível, e a cada nível seguinte, o personagem escolhe UM
//    poder — da lista da própria classe OU de qualquer Poder Geral (Combate,
//    Destino, Magia, Tormenta ou Concedido) cujo pré-requisito cumpra ("você
//    pode sempre substituir um poder de classe por um poder geral", pág. 33).
//  - Conjuradores completos (Arcanista, Clérigo): 2º círculo no 5º nível, 3º
//    no 9º, 4º no 13º, 5º no 17º; aprendem 1 magia nova a cada nível.
//  - Conjuradores por escola (Bardo, Druida): 2º círculo no 6º nível, 3º no
//    10º, 4º no 14º (nunca alcançam o 5º); aprendem 1 magia nova a cada nível
//    PAR.
//  - Arcanista/Feiticeiro: aprende magia a cada nível ÍMPAR (3º, 5º...) em vez
//    de a cada nível. Arcanista/Mago: ganha 1 magia extra do novo círculo
//    sempre que o alcança (além do ganho normal daquele nível).

import { CLASS_BY_ID, type TormentaClass } from "./classes";
import type { AttrKey } from "./data";
import type { Power, PowerCategory } from "./powers/types";

export const MAX_LEVEL = 20;

// Tabela 1-3: Níveis de Personagem — XP mínimo para alcançar cada nível.
export const XP_THRESHOLDS: number[] = [
  0, // índice 0 não usado
  0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000,
  55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000,
];

export function nextLevel(level: number): number | null {
  return level < MAX_LEVEL ? level + 1 : null;
}

// ── Pontos de Vida / Pontos de Mana ───────────────────────────────────────────

export function computePvMax(classId: string, level: number, conMod: number): number {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return 1;
  let total = Math.max(1, cls.pvBase + conMod);
  for (let l = 2; l <= level; l++) total += Math.max(1, cls.pvPerLevel + conMod);
  return total;
}

export function computePmMax(classId: string, level: number, keyAttrMod: number): number {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return 0;
  return Math.max(0, cls.pmPerLevel * level + keyAttrMod);
}

// ── Progressão de Magia ───────────────────────────────────────────────────────

export interface CasterProgression {
  maxCircle: 1 | 2 | 3 | 4 | 5;
  circleAtLevel: Partial<Record<2 | 3 | 4 | 5, number>>;
  spellLevelRule: "all" | "even"; // em quais níveis (a partir do 2º) ganha 1 magia nova
}

export function casterProgressionFor(cls: TormentaClass): CasterProgression | null {
  if (!cls.spellcasting) return null;
  if (cls.spellcasting.schoolChoiceCount) {
    // Conjurador por escola (Bardo, Druida): nunca alcança o 5º círculo.
    return { maxCircle: 4, circleAtLevel: { 2: 6, 3: 10, 4: 14 }, spellLevelRule: "even" };
  }
  // Conjurador completo (Arcanista, Clérigo).
  return { maxCircle: 5, circleAtLevel: { 2: 5, 3: 9, 4: 13, 5: 17 }, spellLevelRule: "all" };
}

export function maxCircleAtLevel(prog: CasterProgression, level: number): number {
  let circle = 1;
  for (const [c, atLevel] of Object.entries(prog.circleAtLevel)) {
    if (level >= (atLevel as number)) circle = Math.max(circle, Number(c));
  }
  return circle;
}

// Círculo desbloqueado exatamente NESTE nível (null se nenhum círculo novo).
export function circleUnlockedAt(prog: CasterProgression, level: number): number | null {
  for (const [c, atLevel] of Object.entries(prog.circleAtLevel)) {
    if (atLevel === level) return Number(c);
  }
  return null;
}

// Quantas magias novas são aprendidas ao alcançar `level` (a partir do 2º).
// Feiticeiro é a única exceção de cadência (ímpar em vez de todo nível).
export function spellGainAtLevel(classId: string, pathId: string | null, level: number, prog: CasterProgression): number {
  if (level < 2) return 0;
  if (classId === "arcanista" && pathId === "feiticeiro") {
    return level % 2 === 1 ? 1 : 0; // 3º, 5º, 7º...
  }
  if (prog.spellLevelRule === "even") return level % 2 === 0 ? 1 : 0;
  return 1;
}

// Mago: 1 magia extra do círculo recém-alcançado, além do ganho normal do nível.
export function bonusMageSpellAt(classId: string, pathId: string | null, level: number, prog: CasterProgression): number {
  if (classId !== "arcanista" || pathId !== "mago") return 0;
  return circleUnlockedAt(prog, level) !== null ? 1 : 0;
}

// ── Aumento de Atributo ───────────────────────────────────────────────────────

export interface ChosenPower {
  level: number;
  id: string;
  name: string;
  category: PowerCategory;
  description: string; // copiado do catálogo no momento da escolha (a ficha não depende de lookups posteriores)
  prerequisite?: string;
  classId?: string;
  attrKey?: AttrKey;   // preenchido só para "aumento-de-atributo"
  attrAmount?: number; // +2 (1ª vez no atributo) ou +1 (demais vezes)
  fixed?: boolean;     // true = característica automática da classe (não é escolha)
}

export function countAttributeIncreases(powers: ChosenPower[], attr: AttrKey): number {
  return powers.filter((p) => p.id === "aumento-de-atributo" && p.attrKey === attr).length;
}

export function nextAttributeIncreaseAmount(powers: ChosenPower[], attr: AttrKey): 1 | 2 {
  return countAttributeIncreases(powers, attr) === 0 ? 2 : 1;
}

// ── Plano de subida de nível ──────────────────────────────────────────────────

export interface LevelUpPlan {
  fromLevel: number;
  toLevel: number;
  requiresPowerPick: boolean; // sempre true do 2º nível em diante
  spellsGained: number;       // inclui bônus de Mago, se aplicável
  circleUnlocked: number | null;
}

export function buildLevelUpPlan(classId: string, pathId: string | null, fromLevel: number): LevelUpPlan | null {
  const toLevel = nextLevel(fromLevel);
  if (toLevel === null) return null;
  const cls = CLASS_BY_ID[classId];
  const prog = cls ? casterProgressionFor(cls) : null;
  const spellsGained = prog ? spellGainAtLevel(classId, pathId, toLevel, prog) + bonusMageSpellAt(classId, pathId, toLevel, prog) : 0;
  return {
    fromLevel,
    toLevel,
    requiresPowerPick: toLevel >= 2,
    spellsGained,
    circleUnlocked: prog ? circleUnlockedAt(prog, toLevel) : null,
  };
}
