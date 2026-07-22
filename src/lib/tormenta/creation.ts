// ─── TORMENTA 20 — lógica de criação de personagem (nível 1) ─────────────────

import { ATTR_KEYS, POINT_BUY_TOTAL, attrMod, type AttrKey, type TormentaAttrs } from "./data";
import { CLASS_BY_ID } from "./classes";
import { ORIGIN_BY_ID } from "./origins";
import { RACE_BY_ID } from "./races";
import { pointBuyCost } from "./data";

// ── Atributos (compra por pontos, Tabela 1-2) ────────────────────────────────

export function attrPointsRemaining(attrs: TormentaAttrs): number {
  return POINT_BUY_TOTAL - pointBuyCost(attrs);
}

export function attrsValid(attrs: TormentaAttrs): boolean {
  return attrPointsRemaining(attrs) === 0 && ATTR_KEYS.every((k) => attrs[k] >= 8 && attrs[k] <= 18);
}

// Atributos finais = base (compra) + bônus racial (fixo ou escolhido).
export function finalAttrs(base: TormentaAttrs, racialBonus: Partial<Record<AttrKey, number>>): TormentaAttrs {
  const out = { ...base };
  for (const [k, v] of Object.entries(racialBonus) as [AttrKey, number][]) {
    out[k] = Math.max(3, out[k] + v);
  }
  return out;
}

// ── Perícias treinadas ────────────────────────────────────────────────────────

export interface SkillPlan {
  classFixed: string[];   // perícias fixas da classe (após resolver "a|b")
  classChoiceCount: number;
  originFixed: string[];  // perícias fixas da origem (nenhuma nesta implementação)
  originChoiceCount: number;
  originPool: string[];
  intBonusPicks: number;  // perícias extras livres = bônus de Inteligência (mín. 0)
}

export function resolveClassFixedSkills(classId: string, fixedChoices: Record<string, string>): string[] {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return [];
  return cls.skillsFixed
    .map((f) => (f.includes("|") ? fixedChoices[f] : f))
    .filter((id): id is string => !!id);
}

export function buildSkillPlan(classId: string, originId: string, intScore: number): SkillPlan {
  const cls = CLASS_BY_ID[classId];
  const origin = ORIGIN_BY_ID[originId];
  return {
    classFixed: cls ? cls.skillsFixed.filter((f) => !f.includes("|")) : [],
    classChoiceCount: cls?.skillChoiceCount ?? 0,
    originFixed: [],
    originChoiceCount: origin?.chooseCount ?? 0,
    originPool: origin?.skillPool ?? [],
    intBonusPicks: Math.max(0, attrMod(intScore)),
  };
}

// ── Vitais (PV / PM / Defesa) no 1º nível ─────────────────────────────────────

export interface TormentaVitals {
  pvMax: number;
  pmMax: number;
}

export function computeVitals(classId: string, conMod: number, keyAttrMod: number): TormentaVitals {
  const cls = CLASS_BY_ID[classId];
  if (!cls) return { pvMax: 1, pmMax: 0 };
  const pvMax = Math.max(1, cls.pvBase + conMod);
  const pmMax = cls.pmPerLevel + keyAttrMod;
  return { pvMax, pmMax: Math.max(0, pmMax) };
}

// Atributo somado ao total de PM: atributo-chave de conjuração, ou Carisma
// para o Paladino (poder "Abençoado", que não é um conjurador).
export function resolveKeyAttribute(classId: string, pathId?: string | null): AttrKey | null {
  const cls = CLASS_BY_ID[classId];
  if (cls?.spellcasting?.keyAttribute) return cls.spellcasting.keyAttribute;
  if (classId === "arcanista") {
    if (pathId === "feiticeiro") return "car";
    if (pathId === "mago" || pathId === "bruxo") return "int";
  }
  if (classId === "paladino") return "car";
  return null;
}

// ── Raça: bônus de atributo resolvido (fixo + escolhas do jogador) ───────────

export function racialAttrBonus(raceId: string, variantId: string | null, chosen: AttrKey[]): Partial<Record<AttrKey, number>> {
  const race = RACE_BY_ID[raceId];
  if (!race) return {};
  const variant = race.variants?.find((v) => v.id === variantId);
  const bonus: Partial<Record<AttrKey, number>> = { ...(variant?.attrBonus ?? race.attrBonus) };
  if (race.attrChoiceBonus) {
    for (const k of chosen.slice(0, race.attrChoiceBonus.count)) {
      bonus[k] = (bonus[k] ?? 0) + race.attrChoiceBonus.amount;
    }
  }
  return bonus;
}
