// ─── CYBERPUNK RED — geração automática de Edgerunner ("Crie Para Mim") ─────
// Módulo puro (rng injetável, sem I/O). Monta o mesmo formato de campos que a
// ficha `CyberpunkSheet` espera, a partir dos Métodos 1 (Streetrat: uma linha
// da tabela) e 2 (Edgerunner: um d10 por coluna). O Método 3 (Pacote
// Completo) é manual e validado em creation.ts.

import { ARMORS_MAP, armorToSheetSlot, BULLETPROOF_SHIELD } from "./armor";
import { cyberwareToSheetItem, CYBERWARE_MAP } from "./cyberware";
import {
  ROLE_KEYS, ROLE_KITS, ROLE_SKILL_CHOICES, ROLE_SKILL_PACKAGES, STAT_KEYS, STARTING_EUROBUCKS_STREETRAT,
  STARTING_ROLE_RANK, STREETRAT_STATS, statsFromRow,
  type KitEntry, type RoleKey, type Stats,
} from "./data";
import { GEAR_MAP, sheetGearItem } from "./gear";
import { rollLifepath } from "./lifepath";
import { randomCyberpunkName } from "./names";
import { hpMax, humanityMax, rollD, type Rng } from "./rules";
import { WEAPONS_MAP } from "./weapons";

export type CreationMethod = "streetrat" | "edgerunner";

export interface AutoGenerateOptions {
  role?: RoleKey;
  method?: CreationMethod;
  name?: string;
  rng?: Rng;
}

const INSTRUMENTS = ["guitarra", "teclado", "bateria", "baixo", "violino"];
const SCIENCES = ["química", "biologia", "física", "matemática", "farmacologia"];

function pick<T>(arr: readonly T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

let counter = 0;
function genId(rng: Rng): string {
  counter += 1;
  return `${Math.floor(rng() * 36 ** 6).toString(36)}${counter.toString(36)}`;
}

/** Escolhe a chave de uma linha do kit, sorteando entre as alternativas do "ou". */
export function resolveKitEntry(entry: KitEntry, rng: Rng): string {
  return pick([entry.key, ...(entry.alt ?? [])], rng);
}

/** Atributos do Método 1: uma única linha da tabela do papel. */
export function rollStreetratStats(role: RoleKey, rng: Rng): Stats {
  const row = STREETRAT_STATS[role][rollD(10, rng) - 1];
  return statsFromRow(row);
}

/** Atributos do Método 2: um d10 separado para cada coluna. */
export function rollEdgerunnerStats(role: RoleKey, rng: Rng): Stats {
  const table = STREETRAT_STATS[role];
  const row = STAT_KEYS.map((_, col) => table[rollD(10, rng) - 1][col]);
  return statsFromRow(row);
}

export function generateEdgerunner(opts: AutoGenerateOptions = {}) {
  const rng = opts.rng ?? Math.random;
  const role: RoleKey = opts.role ?? pick(ROLE_KEYS, rng);
  const method: CreationMethod = opts.method ?? "streetrat";
  const stats = method === "streetrat" ? rollStreetratStats(role, rng) : rollEdgerunnerStats(role, rng);
  const kit = ROLE_KITS[role];
  const lifepath = rollLifepath(rng);

  // Perícias: pacote fixo + escolhas de especialidade + idioma cultural (+4).
  const skills: Record<string, number> = { ...ROLE_SKILL_PACKAGES[role] };
  for (const c of ROLE_SKILL_CHOICES[role]) {
    const pool = c.skill === "playInstrument" ? INSTRUMENTS : SCIENCES;
    skills[`${c.skill}:${pick(pool, rng)}`] = c.level;
  }
  skills[`language:${lifepath.language.toLowerCase().replace(/\s+/g, "")}`] = 4;

  // Armas, munição e granadas do kit.
  const weapons: Record<string, unknown>[] = [];
  const gear: ReturnType<typeof sheetGearItem>[] = [];
  const armor: Record<string, ReturnType<typeof armorToSheetSlot>> = {};

  const addShield = () => {
    armor.shield = { name: BULLETPROOF_SHIELD.name, sp: BULLETPROOF_SHIELD.hp, spMax: BULLETPROOF_SHIELD.hp, penalty: 0 };
  };
  const addItem = (key: string, qty: number) => {
    if (key === "bulletproofShield") return addShield();
    const w = WEAPONS_MAP[key];
    if (w) {
      weapons.push({
        id: genId(rng), name: w.name, skill: w.skill, damage: w.damage, rof: w.rof, mag: w.mag, ammo: w.mag,
        hands: w.hands, concealable: w.concealable, quality: w.quality, notes: w.notes,
      });
      return;
    }
    const g = GEAR_MAP[key];
    if (!g) return;
    const isAmmo = key.startsWith("ammo");
    gear.push(sheetGearItem(g, genId(rng), isAmmo ? Math.max(1, Math.round(qty / 10)) : qty));
  };

  for (const e of kit.weapons) addItem(resolveKitEntry(e, rng), e.qty ?? 1);
  for (const e of kit.gear) addItem(resolveKitEntry(e, rng), e.qty ?? 1);
  for (const e of kit.armor) {
    const key = resolveKitEntry(e, rng);
    if (key === "bulletproofShield") addShield();
    else if (ARMORS_MAP[key]) {
      armor.head = armorToSheetSlot(ARMORS_MAP[key]);
      armor.body = armorToSheetSlot(ARMORS_MAP[key]);
    }
  }

  // Ciberware do kit: a HL é a fixa de criação e já reduz a Humanidade atual.
  const cyberware = kit.cyberware
    .map((e) => CYBERWARE_MAP[resolveKitEntry(e, rng)])
    .filter(Boolean)
    .map((def) => cyberwareToSheetItem(def, genId(rng)));
  const hl = cyberware.reduce((n, c) => n + c.humanityLoss, 0);

  const hp = hpMax(stats.body, stats.will);
  const hum = humanityMax(stats.emp);

  return {
    name: opts.name ?? randomCyberpunkName(rng),
    role,
    roleRank: STARTING_ROLE_RANK,
    creationMethod: method,
    ...stats,
    luckCurrent: stats.luck,
    hpMax: hp,
    hpCurrent: hp,
    humanityMax: hum,
    humanity: hum - hl,
    deathSavePenalty: 0,
    improvementPoints: 0,
    eurobucks: STARTING_EUROBUCKS_STREETRAT,
    reputation: 0,
    skills,
    armor,
    weapons,
    cyberware,
    gear,
    criticalInjuries: [] as unknown[],
    lifepath,
    background: { appearance: `${lifepath.clothing}, ${lifepath.hairstyle.toLowerCase()}, ${lifepath.affectation.toLowerCase()}`, history: "", notes: kit.fashion },
  };
}
