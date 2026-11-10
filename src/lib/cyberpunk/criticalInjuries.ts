// ─── CYBERPUNK RED — Ferimentos Críticos ─────────────────────────────────────
// Disparados quando dois ou mais dados de dano mostram 6. Rola-se 2d6 na tabela
// do Corpo (ou da Cabeça, só em tiro mirado na cabeça), repetindo até sair um
// ferimento que o alvo ainda não tem. Todo ferimento causa +5 de dano direto
// ao HP. `dsPenalty` marca os que aumentam a penalidade-base da Salvaguarda
// contra a Morte em +1. Textos de efeito são paráfrases. Sem I/O.

import type { Rng } from "./rules";
import { rollD } from "./rules";

export type CritLocation = "body" | "head";

export interface CriticalInjuryDef {
  /** Resultado do 2d6 (2..12). */
  roll: number;
  key: string;
  name: string;
  nameEn: string;
  location: CritLocation;
  effect: string;
  /** Aumenta a penalidade-base de Salvaguarda contra a Morte em +1. */
  dsPenalty: boolean;
  /** Correção rápida (Primeiros Socorros/Paramédico) e tratamento definitivo; null = não há. */
  quickFix: string | null;
  treatment: string;
}

const I = (
  location: CritLocation, roll: number, key: string, name: string, nameEn: string,
  effect: string, dsPenalty: boolean, quickFix: string | null, treatment: string,
): CriticalInjuryDef => ({ location, roll, key, name, nameEn, effect, dsPenalty, quickFix, treatment });

export const BODY_CRITICALS: CriticalInjuryDef[] = [
  I("body", 2, "dismemberedArm", "Braço Decepado", "Dismembered Arm", "Braço perdido; larga o que segura.", true, null, "Cirurgia DV17"),
  I("body", 3, "dismemberedHand", "Mão Decepada", "Dismembered Hand", "Mão perdida; larga o que segura.", true, null, "Cirurgia DV17"),
  I("body", 4, "collapsedLung", "Pulmão Perfurado", "Collapsed Lung", "-2 MOVIMENTO (mínimo 1).", true, "Paramédico DV15", "Cirurgia DV15"),
  I("body", 5, "brokenRibs", "Costelas Quebradas", "Broken Ribs", "A cada turno movendo-se mais de 4 m a pé, sofre o dano de bônus de novo.", false, "Paramédico DV13", "Paramédico DV15 ou Cirurgia DV13"),
  I("body", 6, "brokenArm", "Braço Quebrado", "Broken Arm", "Braço inutilizado; larga o que segura.", false, "Paramédico DV13", "Paramédico DV15 ou Cirurgia DV13"),
  I("body", 7, "foreignObjectBody", "Objeto Estranho", "Foreign Object", "A cada turno movendo-se mais de 4 m, sofre o dano de bônus de novo.", false, "Primeiros Socorros ou Paramédico DV13", "A correção rápida remove de vez"),
  I("body", 8, "brokenLeg", "Perna Quebrada", "Broken Leg", "-4 MOVIMENTO (mínimo 1).", false, "Paramédico DV13", "Paramédico DV15 ou Cirurgia DV13"),
  I("body", 9, "tornMuscle", "Músculo Rompido", "Torn Muscle", "-2 em ataques corpo a corpo.", false, "Primeiros Socorros ou Paramédico DV13", "A correção rápida remove de vez"),
  I("body", 10, "spinalInjury", "Lesão na Coluna", "Spinal Injury", "No próximo turno perde a Ação (ainda pode se mover).", true, "Paramédico DV15", "Cirurgia DV15"),
  I("body", 11, "crushedFingers", "Dedos Esmagados", "Crushed Fingers", "-4 em ações com aquela mão.", false, "Paramédico DV13", "Cirurgia DV15"),
  I("body", 12, "dismemberedLeg", "Perna Decepada", "Dismembered Leg", "Perna perdida; -6 MOVIMENTO (mínimo 1); não consegue desviar.", true, null, "Cirurgia DV17"),
];

export const HEAD_CRITICALS: CriticalInjuryDef[] = [
  I("head", 2, "lostEye", "Olho Perdido", "Lost Eye", "-4 em ataques à distância e Percepção visual.", true, null, "Cirurgia DV17"),
  I("head", 3, "brainInjury", "Lesão Cerebral", "Brain Injury", "-2 em todas as Ações.", true, null, "Cirurgia DV17"),
  I("head", 4, "damagedEye", "Olho Danificado", "Damaged Eye", "-2 em ataques à distância e Percepção visual.", false, "Paramédico DV15", "Cirurgia DV13"),
  I("head", 5, "concussion", "Concussão", "Concussion", "-2 em todas as Ações.", false, "Primeiros Socorros ou Paramédico DV13", "A correção rápida remove de vez"),
  I("head", 6, "brokenJaw", "Mandíbula Quebrada", "Broken Jaw", "-4 em ações que dependem de fala.", false, "Paramédico DV13", "Paramédico ou Cirurgia DV13"),
  I("head", 7, "foreignObjectHead", "Objeto Estranho", "Foreign Object", "A cada turno movendo-se mais de 4 m, sofre o dano de bônus de novo.", false, "Primeiros Socorros ou Paramédico DV13", "A correção rápida remove de vez"),
  I("head", 8, "whiplash", "Lesão Cervical (Chicote)", "Whiplash", "Aumenta a penalidade-base de Salvaguarda.", true, "Paramédico DV13", "Paramédico ou Cirurgia DV13"),
  I("head", 9, "crackedSkull", "Crânio Rachado", "Cracked Skull", "Tiros mirados na cabeça causam ×3 em vez de ×2.", true, "Paramédico DV15", "Paramédico ou Cirurgia DV15"),
  I("head", 10, "damagedEar", "Ouvido Danificado", "Damaged Ear", "Se andou mais de 4 m, perde a Ação de Movimento no turno seguinte; -2 em Percepção auditiva.", false, "Paramédico DV13", "Cirurgia DV13"),
  I("head", 11, "crushedWindpipe", "Traqueia Esmagada", "Crushed Windpipe", "Não consegue falar.", true, null, "Cirurgia DV15"),
  I("head", 12, "lostEar", "Orelha Perdida", "Lost Ear", "Se andou mais de 4 m, perde a Ação de Movimento no turno seguinte; -4 em Percepção auditiva.", true, null, "Cirurgia DV17"),
];

export const CRITICAL_BONUS_DAMAGE = 5;

export function getCriticalTable(location: CritLocation): CriticalInjuryDef[] {
  return location === "head" ? HEAD_CRITICALS : BODY_CRITICALS;
}

export function getCriticalByKey(key: string): CriticalInjuryDef | undefined {
  return [...BODY_CRITICALS, ...HEAD_CRITICALS].find((c) => c.key === key);
}

/**
 * Rola 2d6 na tabela do local, repetindo enquanto cair num ferimento que o
 * alvo já tem. Se o alvo já tiver todos (improvável), devolve o último sorteado.
 */
export function rollCriticalInjury(location: CritLocation, owned: string[] = [], rng: Rng = Math.random): CriticalInjuryDef {
  const table = getCriticalTable(location);
  const available = table.filter((c) => !owned.includes(c.key));
  let pick = table[rollD(6, rng) + rollD(6, rng) - 2];
  if (available.length === 0) return pick;
  while (owned.includes(pick.key)) pick = table[rollD(6, rng) + rollD(6, rng) - 2];
  return pick;
}

/** Soma da penalidade-base de Salvaguarda gerada pelos ferimentos atuais. */
export function baseDeathSavePenalty(ownedKeys: string[]): number {
  return ownedKeys.reduce((n, k) => n + (getCriticalByKey(k)?.dsPenalty ? 1 : 0), 0);
}
