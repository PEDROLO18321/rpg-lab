// ─── TORMENTA 20 — núcleo de regras ──────────────────────────────────────────
// Fonte: Tormenta 20 (Jambô), Livro Básico. Atributos For/Des/Con/Int/Sab/Car,
// escala 1–20+ (modificador D&D-like), PV/PM por classe, Defesa = 10 + Des + armadura.

// ─── ATRIBUTOS ───────────────────────────────────────────────────────────────

export type AttrKey = "for" | "des" | "con" | "int" | "sab" | "car";

export const ATTR_KEYS: AttrKey[] = ["for", "des", "con", "int", "sab", "car"];

export const ATTR_LABEL: Record<AttrKey, string> = {
  for: "Força",
  des: "Destreza",
  con: "Constituição",
  int: "Inteligência",
  sab: "Sabedoria",
  car: "Carisma",
};

export const ATTR_ABBR: Record<AttrKey, string> = {
  for: "For",
  des: "Des",
  con: "Con",
  int: "Int",
  sab: "Sab",
  car: "Car",
};

export type TormentaAttrs = Record<AttrKey, number>;

// Tabela 1-1: Modificadores de Atributo.
export function attrMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Tabela 1-2: Atributos por Pontos (20 pontos, base 10 em todos).
export const POINT_BUY_COST: Record<number, number> = {
  8: -2, 9: -1, 10: 0, 11: 1, 12: 2, 13: 3, 14: 4, 15: 6, 16: 8, 17: 11, 18: 14,
};
export const POINT_BUY_TOTAL = 20;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 18;

export function pointBuyCost(attrs: TormentaAttrs): number {
  return ATTR_KEYS.reduce((sum, k) => sum + (POINT_BUY_COST[attrs[k]] ?? 0), 0);
}

// ─── PERÍCIAS (Tabela 2-1, 29 perícias) ──────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  attr: AttrKey;
  trainedOnly: boolean;  // "Somente Treinada?"
  armorPenalty: boolean; // "Penalidade de Armadura?"
}

export const SKILLS: Skill[] = [
  { id: "acrobacia",     name: "Acrobacia",     attr: "des", trainedOnly: false, armorPenalty: true  },
  { id: "adestramento",  name: "Adestramento",  attr: "car", trainedOnly: true,  armorPenalty: false },
  { id: "atletismo",     name: "Atletismo",     attr: "for", trainedOnly: false, armorPenalty: false },
  { id: "atuacao",       name: "Atuação",       attr: "car", trainedOnly: false, armorPenalty: false },
  { id: "cavalgar",      name: "Cavalgar",      attr: "des", trainedOnly: false, armorPenalty: false },
  { id: "conhecimento",  name: "Conhecimento",  attr: "int", trainedOnly: true,  armorPenalty: false },
  { id: "cura",          name: "Cura",          attr: "sab", trainedOnly: false, armorPenalty: false },
  { id: "diplomacia",    name: "Diplomacia",    attr: "car", trainedOnly: false, armorPenalty: false },
  { id: "enganacao",     name: "Enganação",     attr: "car", trainedOnly: false, armorPenalty: false },
  { id: "fortitude",     name: "Fortitude",     attr: "con", trainedOnly: false, armorPenalty: false },
  { id: "furtividade",   name: "Furtividade",   attr: "des", trainedOnly: false, armorPenalty: true  },
  { id: "guerra",        name: "Guerra",        attr: "int", trainedOnly: true,  armorPenalty: false },
  { id: "iniciativa",    name: "Iniciativa",    attr: "des", trainedOnly: false, armorPenalty: false },
  { id: "intimidacao",   name: "Intimidação",   attr: "car", trainedOnly: false, armorPenalty: false },
  { id: "intuicao",      name: "Intuição",      attr: "sab", trainedOnly: false, armorPenalty: false },
  { id: "investigacao",  name: "Investigação",  attr: "int", trainedOnly: false, armorPenalty: false },
  { id: "jogatina",      name: "Jogatina",      attr: "car", trainedOnly: true,  armorPenalty: false },
  { id: "ladinagem",     name: "Ladinagem",     attr: "des", trainedOnly: true,  armorPenalty: true  },
  { id: "luta",          name: "Luta",          attr: "for", trainedOnly: false, armorPenalty: false },
  { id: "misticismo",    name: "Misticismo",    attr: "int", trainedOnly: true,  armorPenalty: false },
  { id: "nobreza",       name: "Nobreza",       attr: "int", trainedOnly: true,  armorPenalty: false },
  { id: "oficio",        name: "Ofício",        attr: "int", trainedOnly: true,  armorPenalty: false },
  { id: "percepcao",     name: "Percepção",     attr: "sab", trainedOnly: false, armorPenalty: false },
  { id: "pilotagem",     name: "Pilotagem",     attr: "des", trainedOnly: true,  armorPenalty: false },
  { id: "pontaria",      name: "Pontaria",      attr: "des", trainedOnly: false, armorPenalty: false },
  { id: "reflexos",      name: "Reflexos",      attr: "des", trainedOnly: false, armorPenalty: false },
  { id: "religiao",      name: "Religião",      attr: "sab", trainedOnly: true,  armorPenalty: false },
  { id: "sobrevivencia", name: "Sobrevivência", attr: "sab", trainedOnly: false, armorPenalty: false },
  { id: "vontade",       name: "Vontade",       attr: "sab", trainedOnly: false, armorPenalty: false },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);

// Tabela 1-3: bônus em perícias = metade do nível (arred. baixo), treinada soma +2 fixo.
export const SKILL_TRAINED_BONUS = 2;

export function skillModifier(level: number, attributeMod: number, trained: boolean): number {
  return Math.floor(level / 2) + attributeMod + (trained ? SKILL_TRAINED_BONUS : 0);
}

// ─── MAGIA ───────────────────────────────────────────────────────────────────

// Tabela 4-1: Custo de Magias, por círculo.
export const SPELL_PM_COST: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 1, 2: 3, 3: 6, 4: 10, 5: 15 };

export type MagicSchool = "Abjuração" | "Adivinhação" | "Convocação" | "Encantamento" | "Evocação" | "Ilusão" | "Necromancia" | "Transmutação";
export type MagicTradition = "arcana" | "divina";

// ─── DEFESA & DESLOCAMENTO ───────────────────────────────────────────────────

export const BASE_DEFENSE = 10;
export const BASE_MOVEMENT = 9; // metros

export function computeDefense(desMod: number, armorBonus: number, shieldBonus: number, otherBonus = 0): number {
  return BASE_DEFENSE + desMod + armorBonus + shieldBonus + otherBonus;
}

// ─── TAMANHOS ────────────────────────────────────────────────────────────────

export type CreatureSize = "Minúsculo" | "Pequeno" | "Médio" | "Grande" | "Enorme" | "Colossal";
