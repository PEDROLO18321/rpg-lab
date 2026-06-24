// ─── ORDEM PARANORMAL — lógica de criação de personagem ──────────────────────
// Regras de criação (Cap. 1): atributos, perícias treinadas, sobreposições.

import {
  CLASS_BY_ID, type ClassId, type OrdemAttrs,
} from "./data";
import { ORIGIN_BY_ID } from "./origins";
import type { ConfiguredItem } from "./modifications";

export interface OrdemWizardData {
  name:               string;
  attrs:              OrdemAttrs;
  originId:           string;
  originSkills:       string[];                // escolhidas quando origem é "à escolha" (Amnésico)
  paranormalPowerId:  string;                  // cultista-arrependido: poder paranormal à escolha
  classId:            ClassId | "";
  fixedChoices:       Record<string, string>;  // "luta|pontaria" → "luta"
  trainedSkills:      string[];                // escolha livre da classe (skillBase + INT + sobreposições)
  startingRituals:    string[];                // ocultista: 3 rituais de 1º círculo
  weapons:            ConfiguredItem[];        // armas iniciais (com modificações/maldições)
  protections:        ConfiguredItem[];        // proteções iniciais (com modificações/maldições)
  generalItems:       ConfiguredItem[];        // itens gerais (Tabela 3.8) — acessórios podem ter mods
  background:         { appearance: string; personality: string; history: string; objective: string };
}

// ── Atributos ────────────────────────────────────────────────────────────────
// Começa 1 em cada, 4 pontos para distribuir; pode reduzir UM atributo a 0 por
// +1 ponto; máximo inicial 3. Todos os pontos devem ser gastos.
export function attrsValid(attrs: OrdemAttrs): boolean {
  const vals = Object.values(attrs);
  if (vals.some((v) => v < 0 || v > 3)) return false;
  const zeros = vals.filter((v) => v === 0).length;
  if (zeros > 1) return false; // apenas um atributo pode ir a 0
  const used = vals.reduce((a, v) => a + Math.max(0, v - 1), 0);
  return used - zeros === 4;
}

export function attrPointsRemaining(attrs: OrdemAttrs): number {
  const vals = Object.values(attrs);
  const used = vals.reduce((a, v) => a + Math.max(0, v - 1), 0);
  const zeros = vals.filter((v) => v === 0).length;
  return 4 + zeros - used;
}

// ── Perícias ─────────────────────────────────────────────────────────────────

export function resolvedOriginSkills(data: OrdemWizardData): string[] {
  const o = ORIGIN_BY_ID[data.originId];
  if (!o) return [];
  return o.chooseAny ? data.originSkills : o.skills;
}

export function resolvedFixedSkills(data: OrdemWizardData): string[] {
  if (!data.classId) return [];
  return CLASS_BY_ID[data.classId].fixedSkills
    .map((f) => (f.includes("|") ? data.fixedChoices[f] : f))
    .filter((id): id is string => !!id);
}

export interface SkillPlan {
  locked: Set<string>; // perícias já treinadas por origem + classe
  need: number;        // perícias livres a escolher (skillBase + INT + sobreposições)
}

// Sobreposição entre perícia fixa da classe e perícia da origem concede uma
// perícia livre adicional ("escolha outra", regra do Cap. 1).
export function computeSkillPlan(data: OrdemWizardData): SkillPlan {
  const originSkills = resolvedOriginSkills(data);
  const fixedSkills = resolvedFixedSkills(data);
  const locked = new Set<string>([...originSkills, ...fixedSkills]);
  const originSet = new Set(originSkills);
  const overlap = fixedSkills.filter((id) => originSet.has(id)).length;
  const base = data.classId ? CLASS_BY_ID[data.classId].skillBase : 0;
  const need = base + data.attrs.int + overlap;
  return { locked, need };
}

// Conjunto final de perícias treinadas (origem + fixas + livres).
export function buildTrainedSkills(data: OrdemWizardData): Record<string, "treinado"> {
  const out: Record<string, "treinado"> = {};
  for (const id of resolvedOriginSkills(data)) out[id] = "treinado";
  for (const id of resolvedFixedSkills(data)) out[id] = "treinado";
  for (const id of data.trainedSkills) out[id] = "treinado";
  return out;
}
