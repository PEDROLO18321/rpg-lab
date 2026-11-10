// Tipos e contas puras da ficha. As abas recebem `sh` (estado) e `patch`
// (grava local + servidor) — nenhuma aba conhece fetch nem estado do vizinho.

import { worstPenalty } from "@/lib/cyberpunk/armor";
import { getSkillDef, type StatKey, type Stats } from "@/lib/cyberpunk/data";
import type { Lifepath } from "@/lib/cyberpunk/lifepath";
import { effectiveMove, woundState } from "@/lib/cyberpunk/rules";
import type { PlayRollEntry } from "@/components/play/types";

export interface ArmorSlot { name: string; sp: number; spMax: number; penalty: number }
export interface SheetWeapon {
  id: string; name: string; skill: string; damage: string; rof: number; mag: number | null;
  ammo: number | null; hands: number; concealable: boolean; quality: string; notes: string;
}
export interface SheetCyber { id: string; key: string; name: string; category: string; humanityLoss: number; cost: number; notes: string }
export interface SheetGear { id: string; name: string; qty: number; cost: number; notes: string }
export interface SheetInjury { id: string; key: string; name: string; location: "body" | "head"; effect: string }
export interface SheetBackground { appearance?: string; history?: string; notes?: string; deck?: string[] }

export interface SheetState extends Stats {
  name: string;
  portraitUrl: string | null;
  role: string;
  roleRank: number;
  creationMethod: string;
  luckCurrent: number;
  hpMax: number;
  hpCurrent: number;
  humanityMax: number;
  humanity: number;
  deathSavePenalty: number;
  improvementPoints: number;
  eurobucks: number;
  reputation: number;
  skills: Record<string, number>;
  armor: { head?: ArmorSlot; body?: ArmorSlot; shield?: ArmorSlot };
  weapons: SheetWeapon[];
  cyberware: SheetCyber[];
  gear: SheetGear[];
  criticalInjuries: SheetInjury[];
  lifepath: Partial<Lifepath>;
  background: SheetBackground;
  notes: string;
}

export type Patch = (p: Partial<SheetState>) => void;

/** Entrada do histórico: o tipo comum mais o dado que o toast 3D desenha. */
export type RollEntry = PlayRollEntry & { sides: number };

export interface RollOpts {
  /** Soma ao teste (penalidades de ferimento e armadura entram aqui). */
  modifier?: number;
  /** DV do alvo, quando o jogador informou: o histórico diz se acertou. */
  dv?: number | null;
}

export interface TabProps {
  sh: SheetState;
  patch: Patch;
  /** Teste d10 (explode/implode): ATRIBUTO + perícia + modificador. */
  roll: (label: string, stat: number, skill: number, opts?: RollOpts) => void;
  /** Empilha no histórico uma rolagem que não é teste de perícia (salvaguarda, perda de Humanidade). */
  push: (e: Omit<RollEntry, "id">) => void;
  /** Rolagem solta de dados de dano ("3d6"), já com aviso de crítico. */
  rollDamage: (label: string, expr: string) => { total: number; dice: number[]; critical: boolean };
}

/** "language:streetslang" → "Idioma: streetslang". */
export function skillLabel(key: string): string {
  const def = getSkillDef(key);
  const base = def ? def.name.replace(/ \(especificar\)/, "") : key;
  const i = key.indexOf(":");
  return i < 0 ? base : `${base}: ${key.slice(i + 1)}`;
}

export function statOfSkill(key: string): StatKey {
  return getSkillDef(key)?.stat ?? "int";
}

/** Penalidade de armadura (REF/DES/MOV): só a pior peça vestida, uma vez. */
export function armorPenaltyOf(sh: SheetState): number {
  return worstPenalty([sh.armor.head, sh.armor.body].filter((a): a is ArmorSlot => !!a));
}

export function woundOf(sh: SheetState) {
  return woundState(sh.hpCurrent, sh.hpMax);
}

/** MOVIMENTO final: armadura e ferimento mortal; Gravemente Ferido já aparece como -2 de Ações. */
export function moveOf(sh: SheetState): number {
  const w = woundOf(sh);
  return effectiveMove(sh.move, armorPenaltyOf(sh) + w.movePenalty, w.state !== "ok");
}

/** Modificador automático de um teste: ferimento em todas as Ações; armadura em REF e DES. */
export function autoModifier(sh: SheetState, stat: StatKey): number {
  const armor = stat === "ref" || stat === "dex" ? armorPenaltyOf(sh) : 0;
  return woundOf(sh).actionPenalty + armor;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
