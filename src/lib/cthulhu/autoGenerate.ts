// ─── CALL OF CTHULHU — geração automática de investigador ("Crie Para Mim") ─
// Módulo puro (Math.random, sem I/O). Monta o mesmo payload que o wizard
// manual (CthulhuWizard.finish()) envia para POST /api/cthulhu/characters —
// não há sistema de nível em Call of Cthulhu, então a geração acontece toda
// de uma vez (sem progressão em múltiplas chamadas, ao contrário de D&D e
// Tormenta 20).

import {
  rollAll, rollSorteForAge, applyAgeModifiers, calcPV, calcPM, calcMOV,
  OCCUPATIONS, calcOccupationPoints, getSkillsForEra, getWeaponsForEra,
  type Occupation, type Weapon,
} from "./data";
import { randomCthulhuName } from "./names";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sampleDistinct<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const count = Math.min(Math.max(0, n), pool.length);
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// Distribui `total` pontos entre `ids`, em blocos de 5 (round-robin),
// evitando concentrar tudo numa única perícia (teto de +70 por perícia).
function distributePoints(ids: string[], total: number): Record<string, number> {
  const out: Record<string, number> = {};
  if (ids.length === 0) return out;
  let remaining = total;
  let guard = 0;
  while (remaining > 0 && guard < 10000) {
    guard++;
    let progressed = false;
    for (const id of ids) {
      if (remaining <= 0) break;
      const current = out[id] ?? 0;
      if (current >= 70) continue;
      const step = Math.min(remaining, 5);
      out[id] = current + step;
      remaining -= step;
      progressed = true;
    }
    if (!progressed) {
      out[ids[0]] = (out[ids[0]] ?? 0) + remaining;
      remaining = 0;
    }
  }
  return out;
}

function parseCost(s: string | undefined): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

const FREE_WEAPON_IDS = ["desarmado", "pedra"];

export interface AutoGenerateOptions {
  charName?: string;
  occupationId?: string;
  era?: "1920s" | "modern";
}

/** Monta o payload completo de criação — o mesmo formato enviado pelo wizard manual. */
export function generateInvestigator(opts: AutoGenerateOptions = {}) {
  const era = opts.era ?? "1920s";
  const age = 20 + Math.floor(Math.random() * 31); // 20–50 anos

  const raw = rollAll();
  raw.sorte = rollSorteForAge(age);
  const attrs = applyAgeModifiers(raw, age);

  const occ: Occupation = (opts.occupationId && OCCUPATIONS.find((o) => o.id === opts.occupationId)) || pick(OCCUPATIONS);

  const eraSkills = getSkillsForEra(era).filter((s) => s.id !== "mythos" && s.id !== "nivel_credito");
  const freePool = eraSkills.filter((s) => !occ.fixedSkills.includes(s.id)).map((s) => s.id);
  const freeSlots = sampleDistinct(freePool, occ.freeSkillCount);
  const occSkillIds = [...occ.fixedSkills, ...freeSlots];

  const [crMin, crMax] = occ.creditRange;
  const credit = crMin + Math.floor(Math.random() * (crMax - crMin + 1));
  const totalOccPoints = calcOccupationPoints(occ.formula, attrs);
  const remainingOcc = Math.max(0, totalOccPoints - credit);

  const occupationSkills: Record<string, number> = { nivel_credito: credit, ...distributePoints(occSkillIds, remainingOcc) };

  const totalIntPoints = attrs.int * 2;
  const interestPool = eraSkills.filter((s) => !occSkillIds.includes(s.id)).map((s) => s.id);
  const interestPicks = sampleDistinct(interestPool, Math.min(interestPool.length, 6));
  const interestSkills = distributePoints(interestPicks, totalIntPoints);

  const skills: Record<string, number> = {};
  for (const [k, v] of Object.entries(occupationSkills)) skills[k] = (skills[k] ?? 0) + v;
  for (const [k, v] of Object.entries(interestSkills)) skills[k] = (skills[k] ?? 0) + v;

  const pvMax = calcPV(attrs);
  const money = credit * 2;
  const eraWeapons = getWeaponsForEra(era);
  const costKey = era === "modern" ? "costModern" : "cost1920";
  const buyable = sampleDistinct(eraWeapons.filter((w) => !FREE_WEAPON_IDS.includes(w.id)), eraWeapons.length);
  const weapons = [...FREE_WEAPON_IDS];
  let budget = money;
  for (const w of buyable) {
    if (weapons.length >= FREE_WEAPON_IDS.length + 2) break;
    const cost = parseCost(w[costKey as keyof Weapon] as string | undefined);
    if (cost <= budget) {
      weapons.push(w.id);
      budget -= cost;
    }
  }

  return {
    name: opts.charName?.trim() || randomCthulhuName(era),
    era,
    age,
    occupation: occ.id,
    atribFor: attrs.for, atribCon: attrs.con, atribTam: attrs.tam, atribDes: attrs.des,
    atribApa: attrs.apa, atribInt: attrs.int, atribPod: attrs.pod, atribEdu: attrs.edu,
    sanCurrent: attrs.pod,
    sanMax: 99,
    pvMax,
    pvCurrent: pvMax,
    luck: attrs.sorte,
    mov: calcMOV(attrs, age),
    pmCurrent: calcPM(attrs),
    skills,
    background: {},
    weapons,
    equipment: null as string | null,
  };
}
