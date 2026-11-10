// Modelo do assistente de criação: o que o jogador escolhe, e como isso vira o
// corpo do POST em /api/cyberpunk/characters. Fica fora dos componentes para
// que o passo de Revisão e o botão "Criar" leiam exatamente a mesma conta.

import { ARMORS_MAP, armorToSheetSlot, BULLETPROOF_SHIELD } from "@/lib/cyberpunk/armor";
import { CYBERWARE_MAP, cyberwareToSheetItem } from "@/lib/cyberpunk/cyberware";
import {
  BASIC_SKILL_KEYS, COMPLETE_PACKAGE_GEAR_EB, ROLE_KITS, ROLE_SKILL_CHOICES, ROLE_SKILL_PACKAGES,
  STARTING_EUROBUCKS_STREETRAT, STARTING_ROLE_RANK, type RoleKey, type Stats,
} from "@/lib/cyberpunk/data";
import { GEAR_MAP, sheetGearItem } from "@/lib/cyberpunk/gear";
import type { Lifepath } from "@/lib/cyberpunk/lifepath";
import { hpMax, humanityMax } from "@/lib/cyberpunk/rules";
import { WEAPONS_MAP } from "@/lib/cyberpunk/weapons";

export type Method = "streetrat" | "edgerunner" | "complete";

export interface WizardData {
  name: string;
  role: RoleKey;
  method: Method;
  stats: Stats | null;
  /** Método 2: o d10 de cada coluna (índice = STAT_KEYS), para a tabela mostrar a linha sorteada. */
  edgeRolls: (number | null)[];
  /** Método 2: o livro manda rolar uma vez só; depois de rolado, os valores travam. */
  edgeLocked: boolean;
  /** Método 1: linha escolhida (0..9). */
  streetratRow: number | null;
  /** Método 1: o d10 já foi usado. Escolher a linha na tabela segue livre; o botão de rolar não. */
  streetratRolled: boolean;
  /** Só o Pacote Completo: perícias distribuídas à mão. */
  skills: Record<string, number>;
  /** Especialidades digitadas nas perícias que pedem escolha (instrumento, ciência). */
  choices: Record<string, string>;
  lifepath: Partial<Lifepath>;
  /** Alternativas do "ou" do kit: "categoria:índice" → chave escolhida. */
  kitSel: Record<string, string>;
  weapons: string[];
  gear: { key: string; qty: number }[];
  armorHead: string;
  armorBody: string;
  shield: boolean;
  cyberware: string[];
  appearance: string;
}

export const INITIAL: WizardData = {
  name: "", role: "solo", method: "streetrat", stats: null,
  edgeRolls: Array(10).fill(null), edgeLocked: false, streetratRow: null, streetratRolled: false,
  skills: {}, choices: {}, lifepath: {}, kitSel: {},
  weapons: [], gear: [], armorHead: "", armorBody: "", shield: false, cyberware: [], appearance: "",
};

/**
 * Zera tudo que o sorteio de atributos produziu, travas incluídas. Só trocar de
 * método ou de papel chama isto: é a única forma de rolar de novo.
 */
export const ROLL_RESET = {
  edgeRolls: INITIAL.edgeRolls, edgeLocked: false, streetratRow: null, streetratRolled: false,
} satisfies Partial<WizardData>;

/** Pacote Completo: as 13 básicas já nascem em 2 (idioma e conhecimento local com a especialidade padrão). */
export function defaultCompleteSkills(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of BASIC_SKILL_KEYS) {
    if (k === "language") out["language:streetslang"] = 2;
    else if (k === "localExpert") out["localExpert:yourHome"] = 2;
    else out[k] = 2;
  }
  return out;
}

/** "language:" + origem em minúsculas sem espaço, igual ao gerador automático. */
export function languageKey(language: string): string {
  return `language:${language.toLowerCase().replace(/\s+/g, "")}`;
}

function specialtyKey(skill: string, label: string): string {
  return `${skill}:${label.trim().toLowerCase().replace(/[:\s]+/g, "")}`;
}

/** Perícias finais: pacote (ou distribuição) + especialidades + idioma cultural +4. */
export function finalSkills(d: WizardData): Record<string, number> {
  const out: Record<string, number> = d.method === "complete"
    ? { ...d.skills }
    : { ...ROLE_SKILL_PACKAGES[d.role] };
  if (d.method !== "complete") {
    for (const c of ROLE_SKILL_CHOICES[d.role]) {
      const label = d.choices[c.skill]?.trim();
      if (label) out[specialtyKey(c.skill, label)] = c.level;
    }
  }
  if (d.lifepath.language) {
    const k = languageKey(d.lifepath.language);
    out[k] = Math.max(out[k] ?? 0, 4);
  }
  return out;
}

export interface ResolvedEquipment {
  weapons: string[];
  gear: { key: string; qty: number }[];
  armorHead: string;
  armorBody: string;
  shield: boolean;
  cyberware: string[];
}

/** Kit do papel (com as alternativas escolhidas) somado ao que o jogador adicionou. */
export function resolveEquipment(d: WizardData): ResolvedEquipment {
  const r: ResolvedEquipment = {
    weapons: [...d.weapons], gear: d.gear.map((g) => ({ ...g })),
    armorHead: d.armorHead, armorBody: d.armorBody, shield: d.shield, cyberware: [...d.cyberware],
  };
  if (d.method === "complete") return r;

  const kit = ROLE_KITS[d.role];
  const pick = (cat: string, i: number, key: string) => d.kitSel[`${cat}:${i}`] ?? key;
  const addByKey = (key: string, qty: number) => {
    if (key === "bulletproofShield") { r.shield = true; return; }
    if (WEAPONS_MAP[key]) { r.weapons.push(key); return; }
    if (GEAR_MAP[key]) r.gear.push({ key, qty });
  };
  kit.weapons.forEach((e, i) => addByKey(pick("weapons", i, e.key), e.qty ?? 1));
  kit.gear.forEach((e, i) => addByKey(pick("gear", i, e.key), e.qty ?? 1));
  kit.armor.forEach((e, i) => {
    const key = pick("armor", i, e.key);
    if (key === "bulletproofShield") r.shield = true;
    else if (ARMORS_MAP[key]) {
      // O kit entrega uma peça para a cabeça e uma para o corpo; a escolha do
      // jogador (se houver) tem precedência.
      r.armorHead = r.armorHead || key;
      r.armorBody = r.armorBody || key;
    }
  });
  kit.cyberware.forEach((e, i) => r.cyberware.push(pick("cyberware", i, e.key)));
  return r;
}

/** Só o kit do papel, sem o que o jogador acrescentou (vazio no Pacote Completo). */
export function resolveKitOnly(d: WizardData): ResolvedEquipment {
  return resolveEquipment({ ...d, weapons: [], gear: [], armorHead: "", armorBody: "", shield: false, cyberware: [] });
}

/**
 * Dinheiro para gastar no equipamento. Pacote Completo: 2.550 eb (livro p.104).
 * Streetrat e Edgerunner: 500 eb além do kit, gastar ou guardar (livro p.98).
 */
export function equipmentBudget(d: WizardData): number {
  return d.method === "complete" ? COMPLETE_PACKAGE_GEAR_EB : STARTING_EUROBUCKS_STREETRAT;
}

/**
 * Custo em eb do que o jogador escolheu por conta própria. O kit do papel é
 * grátis, então só entram os campos `weapons`/`gear`/… (o escudo some da conta
 * se o kit já o entrega).
 */
export function equipmentCost(d: WizardData): number {
  let sum = 0;
  for (const k of d.weapons) sum += WEAPONS_MAP[k]?.cost ?? 0;
  for (const g of d.gear) sum += (GEAR_MAP[g.key]?.cost ?? 0) * g.qty;
  if (d.armorHead) sum += ARMORS_MAP[d.armorHead]?.cost ?? 0;
  if (d.armorBody) sum += ARMORS_MAP[d.armorBody]?.cost ?? 0;
  if (d.shield && !resolveKitOnly(d).shield) sum += BULLETPROOF_SHIELD.cost;
  for (const k of d.cyberware) sum += CYBERWARE_MAP[k]?.cost ?? 0;
  return sum;
}

export function chargenHumanity(d: WizardData): number {
  return resolveEquipment(d).cyberware.reduce((n, k) => n + (CYBERWARE_MAP[k]?.hl ?? 0), 0);
}

export function derived(stats: Stats, d: WizardData) {
  const hp = hpMax(stats.body, stats.will);
  const hum = humanityMax(stats.emp);
  return { hp, humanityMax: hum, humanity: hum - chargenHumanity(d) };
}

/** Corpo do POST. HP e Humanidade o servidor recalcula; mandamos só o que ele não deriva. */
export function buildPayload(d: WizardData) {
  const eq = resolveEquipment(d);
  const armor: Record<string, ReturnType<typeof armorToSheetSlot> | { name: string; sp: number; spMax: number; penalty: number }> = {};
  if (eq.armorHead && ARMORS_MAP[eq.armorHead]) armor.head = armorToSheetSlot(ARMORS_MAP[eq.armorHead]);
  if (eq.armorBody && ARMORS_MAP[eq.armorBody]) armor.body = armorToSheetSlot(ARMORS_MAP[eq.armorBody]);
  if (eq.shield) armor.shield = { name: BULLETPROOF_SHIELD.name, sp: BULLETPROOF_SHIELD.hp, spMax: BULLETPROOF_SHIELD.hp, penalty: 0 };

  const id = () => crypto.randomUUID();
  const weapons = eq.weapons.map((k) => WEAPONS_MAP[k]).filter(Boolean).map((w) => ({
    id: id(), name: w.name, skill: w.skill, damage: w.damage, rof: w.rof, mag: w.mag, ammo: w.mag,
    hands: w.hands, concealable: w.concealable, quality: w.quality, notes: w.notes,
  }));
  const gear = eq.gear.filter((g) => GEAR_MAP[g.key]).map((g) =>
    sheetGearItem(GEAR_MAP[g.key], id(), g.key.startsWith("ammo") ? Math.max(1, Math.round(g.qty / 10)) : g.qty));
  const cyberware = eq.cyberware.map((k) => CYBERWARE_MAP[k]).filter(Boolean).map((c) => cyberwareToSheetItem(c, id()));

  const lp = d.lifepath;
  const eurobucks = Math.max(0, equipmentBudget(d) - equipmentCost(d));

  return {
    name: d.name.trim(),
    role: d.role,
    roleRank: STARTING_ROLE_RANK,
    creationMethod: d.method,
    ...d.stats,
    skills: finalSkills(d),
    freeLanguageKey: lp.language ? languageKey(lp.language) : undefined,
    armor, weapons, gear, cyberware, eurobucks,
    lifepath: lp,
    background: { appearance: d.appearance, history: "", notes: d.method === "complete" ? "" : ROLE_KITS[d.role].fashion },
  };
}
