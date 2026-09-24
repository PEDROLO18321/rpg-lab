// ─── D&D 5e — vocabulário comum da ficha ─────────────────────────────────────
// Constantes, tipos e utilitários usados pelos três modos (Ficha, Jogar e
// Editar). Moram aqui para que PlayMode.tsx e SheetClient.tsx possam importar
// sem um depender do outro.

import type { AbilityKey } from "@/lib/dnd/races";

// ── Constants ─────────────────────────────────────────────────────────────────

export const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
export const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};
export const SKILL_MAP: Record<string, AbilityKey> = {
  "Atletismo": "str",
  "Acrobacia": "dex", "Furtividade": "dex", "Prestidigitação": "dex",
  "Arcanismo": "int", "História": "int", "Investigação": "int", "Natureza": "int", "Religião": "int",
  "Adestrar Animais": "wis", "Intuição": "wis", "Medicina": "wis", "Percepção": "wis", "Sobrevivência": "wis",
  "Atuação": "cha", "Enganação": "cha", "Intimidação": "cha", "Persuasão": "cha",
};
export const SAVE_ABILITY: Record<string, AbilityKey> = {
  "Força": "str", "Destreza": "dex", "Constituição": "con",
  "Inteligência": "int", "Sabedoria": "wis", "Carisma": "cha",
};
export const CONDITIONS = [
  "Abalado", "Agarrado", "Assustado", "Cego", "Enfeitiçado",
  "Envenenado", "Exausto (Grau 1)", "Exausto (Grau 2)", "Exausto (Grau 3)",
  "Incapacitado", "Inconsciente", "Invisível",
  "Paralisado", "Petrificado", "Propenso", "Restrito", "Surdo",
];
export const CONDITION_COLOR: Record<string, string> = {
  "Envenenado": "#2d7d2d", "Cego": "#666", "Paralisado": "#8b0000",
  "Inconsciente": "#1a0a2e", "Propenso": "#5d3a1a", "Petrificado": "#607d8b",
  "Assustado": "#4a1464", "Enfeitiçado": "#c94818", "Abalado": "#e25c00",
  "Invisível": "#455a64", "Restrito": "#4e342e", "Agarrado": "#6a1b9a",
  "Incapacitado": "#6b0000", "Surdo": "#546e7a",
};
export const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
export type DiceType = typeof DICE_TYPES[number];
// Habilidade de conjuração dos meio-conjuradores (magias a partir do 2° nível)
export const HALF_CASTER_ABILITY: Record<string, string> = {
  paladino: "Carisma",
  patrulheiro: "Sabedoria",
};
export const ALIGNMENT_LABELS: Record<string, string> = {
  lg: "Leal e Bom", ng: "Neutro e Bom", cg: "Caótico e Bom",
  ln: "Leal e Neutro", nn: "Neutro", cn: "Caótico e Neutro",
  le: "Leal e Mau", ne: "Neutro e Mau", ce: "Caótico e Mau",
};

// PHB currency conversion (values in PC)
export const CP_VALUE: Record<string, number> = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 };
export const CURRENCY_LABEL: Record<string, string> = { cp: "PC", sp: "PP", ep: "PE", gp: "PO", pp: "PL" };
export const CURRENCY_COLOR: Record<string, string> = {
  cp: "#b5651d", sp: "#aaaaaa", ep: "#7eb8b5", gp: "#c9941f", pp: "#8b5cf6",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type SheetRow = {
  id: string;
  race: string | null;
  background: string | null;
  alignment: string | null;
  level: number;
  xp: number;
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
  hpMax: number; hpCurrent: number; hpTemp: number;
  hitDice: string | null; hitDiceUsed: number;
  deathSavesSuccess: number; deathSavesFailure: number;
  armorClass: number; initiative: number; speed: number;
  inspiration: boolean;
  cp: number; sp: number; ep: number; gp: number; pp: number;
  conditions: unknown;
  spellSlotsUsed: unknown;
  spellAbility: string | null;
  classes: { id: string; className: string; subclass: string | null; level: number }[];
  skills: { id: string; skillName: string; proficient: boolean; expertise: boolean }[];
  spells: { id: string; spellName: string; level: number; school: string | null; prepared: boolean; castingTime: string | null; range: string | null; duration: string | null; description: string | null }[];
  equipment: { id: string; itemName: string; quantity: number; equipped: boolean; weight: number | null; description: string | null }[];
  features: { id: string; name: string; source: string | null; description: string | null }[];
};

export type RollEntry = {
  id: number;
  label: string;
  dice: number;
  count: number;
  modifier: number;
  rolls: number[];
  total: number;
  isCrit?: boolean;
  isFumble?: boolean;
  advantageMode?: "advantage" | "disadvantage";
  allRolls?: number[];
  advantagePickIdx?: number;
  pickMode?: "sum" | "max";
};

// per-slot boolean array: true = slot used
export type SlotState = Record<string, boolean[]>;

// Descrição/personalidade serializada em Character.notes (ver StepDesc + POST de criação)
export type DescData = {
  alignment?: string;
  age?: string; height?: string; weight?: string;
  eyes?: string; skin?: string; hair?: string;
  personalityTrait?: string; ideal?: string; bond?: string; flaw?: string;
  backstory?: string;
  languages?: string[];
};

export function parseDesc(raw: string | null): DescData {
  if (!raw) return {};
  try {
    const d = JSON.parse(raw);
    return (d && typeof d === "object") ? d : {};
  } catch { return {}; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function mod(score: number) { return Math.floor((score - 10) / 2); }
export function signed(n: number)  { return n >= 0 ? `+${n}` : `${n}`; }

export const dndVBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "50%",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: "1.15rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
export const dndVBtnTemp: React.CSSProperties = {
  width: 26, height: 26, borderRadius: "4px",
  background: "rgba(79,195,247,0.1)", border: "1px dashed rgba(79,195,247,0.45)",
  color: "#4fc3f7", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

export const smallBtn: React.CSSProperties = {
  width: 26, height: 26, borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem",
  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
};
