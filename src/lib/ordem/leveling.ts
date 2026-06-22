// ─── ORDEM PARANORMAL — Progressão de NEX (subir de "nível") ──────────────────
// Cada passo de NEX (5%→10%→…→99%) concede ganhos automáticos (PV/PE/SAN) e,
// em certos marcos, escolhas: trilha, poder de classe, aumento de atributo,
// grau de treinamento e — para ocultistas — novos círculos de ritual.
// Fonte: Livro de Regras (Jambô) — Tabelas 1.x de progressão de classe.

import {
  CLASS_BY_ID, NEX_VALUES, nexLevel, computeVitals,
  type ClassId, type AttrKey, type OrdemAttrs, type TrainDegree, type Vitals,
} from "./data";
import {
  CLASS_NEX_TABLE, TRAIL_BY_ID, type TrailPower,
} from "./abilities";
import { type RitualCircle } from "./rituals";

export const MAX_NEX = 99;

// Próximo valor de NEX (ou null se já no máximo).
export function nextNexValue(nex: number): number | null {
  for (const v of NEX_VALUES) if (v > nex) return v;
  return null;
}

// ── Marcos de progressão (idênticos entre as três classes) ───────────────────
const ATTR_NEX     = new Set([20, 50, 80, 95]); // +1 atributo
const POWER_NEX    = new Set([15, 30, 45, 60, 75, 90]); // poder de classe à escolha
const TRAINING_NEX = new Set([35, 70]); // grau de treinamento
const TRAIL_AUTO   = new Set([40, 65, 99]); // poder de trilha automático
const VERSATIL_NEX = 50; // poder extra (Versatilidade)

// Quantidade-base de perícias afetadas pelo Grau de Treinamento (+ Intelecto).
const TRAINING_BASE: Record<ClassId, number> = {
  combatente: 2, especialista: 5, ocultista: 3,
};

// Círculo de ritual liberado em cada NEX (ocultista).
const RITUAL_CIRCLE_NEX: Record<number, RitualCircle> = { 25: 2, 55: 3, 85: 4 };

export interface NexPlan {
  fromNex: number;
  toNex: number;
  fromLevel: number;
  toLevel: number;
  // Escolhas exigidas neste passo:
  needsTrail: boolean;                 // NEX 10%: escolher trilha (1ª vez)
  trailPowerNex: number | null;        // NEX 10/40/65/99: poder de trilha concedido
  powerChoices: number;                // nº de poderes de classe a escolher
  attrIncreases: number;               // nº de aumentos de atributo (+1 cada)
  trainingCount: number;               // nº de perícias a melhorar (0 = nenhum marco)
  trainingTarget: TrainDegree | null;  // grau-alvo: veterano (35%) / expert (70%)
  ritualCircleUnlocked: RitualCircle | null;
  featureText: string;                 // descrição-resumo do marco (Tabela de classe)
}

// Monta o plano de subida do NEX atual para o próximo.
export function buildNexPlan(classId: ClassId, currentNex: number, int: number): NexPlan | null {
  const toNex = nextNexValue(currentNex);
  if (toNex == null) return null;

  const isVersatil = toNex === VERSATIL_NEX;
  const powerChoices =
    (POWER_NEX.has(toNex) ? 1 : 0) + (isVersatil ? 1 : 0);

  const isTraining = TRAINING_NEX.has(toNex);
  const trainingTarget: TrainDegree | null =
    toNex === 35 ? "veterano" : toNex === 70 ? "expert" : null;

  const tableEntry = CLASS_NEX_TABLE[classId].find((a) => a.nex === toNex);

  return {
    fromNex: currentNex,
    toNex,
    fromLevel: nexLevel(currentNex),
    toLevel: nexLevel(toNex),
    needsTrail: toNex === 10,
    trailPowerNex: toNex === 10 || TRAIL_AUTO.has(toNex) ? toNex : null,
    powerChoices,
    attrIncreases: ATTR_NEX.has(toNex) ? 1 : 0,
    trainingCount: isTraining ? TRAINING_BASE[classId] + Math.max(0, int) : 0,
    trainingTarget,
    ritualCircleUnlocked:
      classId === "ocultista" ? RITUAL_CIRCLE_NEX[toNex] ?? null : null,
    featureText: tableEntry?.description ?? "",
  };
}

// Poder de trilha concedido em um NEX específico (após a trilha escolhida).
export function trailPowerAt(trailId: string | null, nex: number): TrailPower | null {
  if (!trailId) return null;
  const t = TRAIL_BY_ID[trailId];
  if (!t) return null;
  return t.powers.find((p) => p.nex === nex) ?? null;
}

// Recalcula vitais para um dado NEX e conjunto de atributos.
// transcenderThisStep: se um poder Transcender foi escolhido neste passo, o
// ocultista/agente abre mão do ganho de Sanidade do NEX atingido.
export function recomputeVitals(
  classId: ClassId,
  nex: number,
  attrs: OrdemAttrs,
  originId: string | undefined,
  transcenderThisStep = false,
): Vitals {
  const v = computeVitals(classId, nex, attrs.vig, attrs.pre, originId);
  if (transcenderThisStep) {
    v.sanMax = Math.max(0, v.sanMax - CLASS_BY_ID[classId].sanPerNex);
  }
  return v;
}

// ── Progressão persistida por personagem (campo `abilities`) ──────────────────
export interface OrdemProgression {
  trailId: string | null;
  classPowers: string[];       // ids de CLASS_POWERS escolhidos
  paranormalPowers: string[];  // ids de PARANORMAL_POWERS (Transcender / Cultista)
  features: { nex: number; text: string }[]; // marcos automáticos registrados
}

export function emptyProgression(): OrdemProgression {
  return { trailId: null, classPowers: [], paranormalPowers: [], features: [] };
}

// Normaliza o JSON de `abilities` (aceita formatos antigos) numa OrdemProgression.
export function normalizeProgression(raw: unknown, trailColumn?: string | null): OrdemProgression {
  const base = emptyProgression();
  if (trailColumn) base.trailId = trailColumn;

  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;

  // Formato antigo do Cultista Arrependido: { paranormalPower: "id" }
  if (typeof o.paranormalPower === "string") {
    base.paranormalPowers.push(o.paranormalPower);
  }
  if (Array.isArray(o.paranormalPowers)) {
    base.paranormalPowers = (o.paranormalPowers as unknown[]).filter((x): x is string => typeof x === "string");
  }
  if (Array.isArray(o.classPowers)) {
    base.classPowers = (o.classPowers as unknown[]).filter((x): x is string => typeof x === "string");
  }
  if (typeof o.trailId === "string") base.trailId = o.trailId;
  if (Array.isArray(o.features)) {
    base.features = (o.features as unknown[]).filter(
      (f): f is { nex: number; text: string } =>
        !!f && typeof f === "object" && typeof (f as { nex: unknown }).nex === "number",
    );
  }
  return base;
}

export const ATTR_KEYS_LEVELING: AttrKey[] = ["agi", "for", "int", "pre", "vig"];
