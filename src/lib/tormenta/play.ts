// ─── TORMENTA 20 — Regras de mesa (modo Jogar) ───────────────────────────────
// Funções puras sobre os dados de regra: ataque, dano, crítico, descanso,
// sangramento e custo de magia. Sem I/O — a UI decide o que fazer com elas.
// Fonte: Livro Básico, Capítulo 5 (Combate) e Apêndice.

import { SPELL_PM_COST } from "./data";
import type { Weapon } from "./items";

// ─── CRÍTICO ─────────────────────────────────────────────────────────────────
// "Cada arma tem uma margem de ameaça (18, 19 ou 20) e um multiplicador (x2, x3
// ou x4). Quando nenhuma margem aparece, será 20. Quando nenhum multiplicador
// aparece, será x2." A coluna da tabela de armas vem como "19", "x3", "19/x3"
// ou "—" (arma que não causa dano, como a rede).

export interface CriticalSpec { threat: number; multiplier: number }

export function parseCritical(critical: string): CriticalSpec | null {
  if (!critical || critical === "—") return null;
  let threat = 20;
  let multiplier = 2;
  for (const part of critical.split("/")) {
    const p = part.trim();
    if (p.startsWith("x")) multiplier = parseInt(p.slice(1)) || 2;
    else if (/^\d+$/.test(p)) threat = parseInt(p);
  }
  return { threat, multiplier };
}

// ─── DANO ────────────────────────────────────────────────────────────────────
// "1d8"; armas duplas e adaptáveis trazem duas faces ("1d6/1d6", "1d10/1d12") —
// a ficha usa a primeira, que é o uso padrão da arma.

export interface DamageDice { count: number; sides: number }

export function parseDamageDice(damage: string): DamageDice | null {
  const first = damage.split("/")[0]?.trim() ?? "";
  const m = first.match(/^(\d*)d(\d+)$/);
  if (!m) return null;
  return { count: parseInt(m[1] || "1"), sides: parseInt(m[2]) };
}

/**
 * Multiplica os dados de dano no acerto crítico. "Bônus numéricos de dano,
 * assim como dados extras, não são multiplicados" — por isso só `count` cresce.
 */
export function criticalDamageDice(dice: DamageDice, multiplier: number): DamageDice {
  return { count: dice.count * multiplier, sides: dice.sides };
}

// ─── ATAQUE ──────────────────────────────────────────────────────────────────
// "Teste de ataque é um tipo específico de teste de perícia: Luta para um
// ataque corpo a corpo, Pontaria para um ataque à distância."

const RANGED_GROUP = "Ataque à Distância";

export function isRanged(weapon: Weapon): boolean {
  return weapon.group === RANGED_GROUP;
}

export function attackSkillId(weapon: Weapon): "luta" | "pontaria" {
  return isRanged(weapon) ? "pontaria" : "luta";
}

/**
 * "Dano com arma corpo a corpo ou de arremesso = dano da arma + modificador de
 * Força. Dano com arma de disparo = dano da arma." Arcos, bestas e armas de
 * fogo são de disparo; as arremessáveis (azagaia, machadinha…) continuam
 * somando Força, e a funda diz isso explicitamente na coluna Especial.
 */
export function damageUsesStrength(weapon: Weapon): boolean {
  if (!isRanged(weapon)) return true;
  const special = weapon.special ?? "";
  return special.includes("Arremessável") || special.includes("mod. de Força ao dano");
}

// ─── DESCANSO (pág. 108) ─────────────────────────────────────────────────────
// "Com uma noite de descanso (oito horas de sono), você recupera PV e PM de
// acordo com seu nível e condições de descanso."

export type RestQuality = "ruim" | "normal" | "confortavel" | "luxuosa";

export const REST_LABEL: Record<RestQuality, string> = {
  ruim: "Ruim — ao relento",
  normal: "Normal — estalagem comum",
  confortavel: "Confortável",
  luxuosa: "Luxuosa",
};

export function restRecovery(level: number, quality: RestQuality): number {
  switch (quality) {
    case "ruim": return Math.floor(level / 2);
    case "confortavel": return level * 2;
    case "luxuosa": return level * 3;
    default: return level;
  }
}

// ─── FERIMENTOS & MORTE (pág. 217) ───────────────────────────────────────────
// "Quando seus pontos de vida chegam a –10 ou a um número negativo igual à
// metade de seus PV totais (o que for menor), você morre."

export function deathThreshold(pvMax: number): number {
  return -Math.max(10, Math.floor(pvMax / 2));
}

/** 0 PV ou menos: cai inconsciente e começa a sangrar. */
export function isDying(pvCurrent: number): boolean {
  return pvCurrent <= 0;
}

export function isDead(pvCurrent: number, pvMax: number): boolean {
  return pvCurrent <= deathThreshold(pvMax);
}

/** Teste de Constituição (CD 15) no início do turno para estabilizar. */
export const STABILIZE_DC = 15;

// ─── PONTOS TEMPORÁRIOS (pág. 108) ───────────────────────────────────────────
// "Pontos temporários são sempre os primeiros a serem gastos."

export interface Pool { current: number; temp: number }

/** Gasta `amount` do par (temporários primeiro). `floor` limita o valor final. */
export function spendFromPool(pool: Pool, amount: number, floor: number): Pool {
  const fromTemp = Math.min(pool.temp, amount);
  const rest = amount - fromTemp;
  return { current: Math.max(floor, pool.current - rest), temp: pool.temp - fromTemp };
}

/** Recupera até o máximo — "você nunca pode recuperar mais do que perdeu". */
export function recoverToMax(current: number, amount: number, max: number): number {
  return Math.min(max, current + amount);
}

// ─── MAGIA ───────────────────────────────────────────────────────────────────

/** Custo em PM do círculo, +1 se o conjurador estiver alquebrado. */
export function spellPmCost(circle: 1 | 2 | 3 | 4 | 5, alquebrado: boolean): number {
  return SPELL_PM_COST[circle] + (alquebrado ? 1 : 0);
}
