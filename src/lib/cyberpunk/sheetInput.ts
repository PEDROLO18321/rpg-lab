// ─── Cyberpunk RED — guardas de entrada da ficha (puro, sem I/O) ─────────────
// As faixas dos números ficam em RANGES: PATCH, criação e importação leem da
// mesma tabela, para as três portas recusarem exatamente o mesmo lixo. Os
// campos Json também são conferidos por *forma* (lista × objeto): sem isso um
// `weapons: "abc"` passava pelo teto de tamanho e quebrava a ficha ao abrir.

import { ImportError } from "@/lib/characterTransfer";
import { ROLE_KEYS, getSkillDef } from "./data";

/** [mín, máx] de cada coluna numérica. Faixas do livro, com folga de mesa. */
export const RANGES = {
  stat: [1, 10],           // 2–8 na criação; ciberware/evolução podem passar
  roleRank: [1, 10],
  hpMax: [1, 200],
  hpCurrent: [0, 200],     // 0 = mortalmente ferido; abaixo disso não muda nada
  humanityMax: [0, 120],   // EMP 10 × 10 = 100, com folga
  humanity: [-100, 120],   // negativo = ciberpsicose, que o livro permite
  luckCurrent: [0, 10],
  eurobucks: [0, 10_000_000],
  improvementPoints: [0, 100_000],
  reputation: [0, 10],
  deathSavePenalty: [0, 20],
  skillLevel: [0, 10],
} as const satisfies Record<string, readonly [number, number]>;

export const CREATION_METHODS = ["streetrat", "edgerunner", "complete"] as const;
export type CreationMethodKey = (typeof CREATION_METHODS)[number];

/** Valor de um conjunto fechado; ausente devolve `undefined`, desconhecido recusa. */
export function enumIn<T extends string>(v: unknown, allowed: readonly T[], campo: string): T | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) {
    throw new ImportError(`O campo "${campo}" aceita: ${allowed.join(", ")}.`);
  }
  return v as T;
}

export const roleIn = (v: unknown) => enumIn(v, ROLE_KEYS, "role");
export const methodIn = (v: unknown) => enumIn(v, CREATION_METHODS, "creationMethod");

/** Campo Json que precisa ser lista (`weapons`, `cyberware`…) ou objeto (`armor`…). */
export function shapeIn(v: unknown, kind: "array" | "object", campo: string): unknown {
  if (v === undefined || v === null) return undefined;
  const ok = kind === "array"
    ? Array.isArray(v)
    : typeof v === "object" && !Array.isArray(v);
  if (!ok) throw new ImportError(`O campo "${campo}" precisa ser ${kind === "array" ? "uma lista" : "um objeto"}.`);
  return v;
}

/** Perícias: { chave: nível 0..10 }, só chaves que existem em data.ts. */
export function skillsIn(v: unknown): Record<string, number> | undefined {
  const obj = shapeIn(v, "object", "skills") as Record<string, unknown> | undefined;
  if (!obj) return undefined;
  const entries = Object.entries(obj);
  if (entries.length > 300) throw new ImportError(`O campo "skills" tem entradas demais.`);
  const [min, max] = RANGES.skillLevel;
  const out: Record<string, number> = {};
  for (const [key, level] of entries) {
    if (!getSkillDef(key)) throw new ImportError(`Perícia desconhecida: "${key}".`);
    if (typeof level !== "number" || !Number.isFinite(level) || level < min || level > max) {
      throw new ImportError(`Nível de "${key}" aceita de ${min} a ${max}.`);
    }
    out[key] = Math.trunc(level);
  }
  return out;
}

/** Soma da perda de Humanidade dos implantes; ignora item malformado em vez de somar NaN. */
export function humanityLossOf(cyberware: unknown): number {
  if (!Array.isArray(cyberware)) return 0;
  return cyberware.reduce((n: number, c) => {
    const hl = (c as { humanityLoss?: unknown } | null)?.humanityLoss;
    return n + (typeof hl === "number" && Number.isFinite(hl) && hl > 0 ? hl : 0);
  }, 0);
}
