// ─── ORDEM PARANORMAL — geração automática de personagem ("Crie Para Mim") ──
// Módulo puro (Math.random, sem I/O). generateLevel1Build monta o mesmo
// payload que o wizard manual (CharacterWizard.finish()) envia para
// POST /api/ordem/characters, reaproveitando as funções puras de creation.ts.
// pickNexUpgrade decide UM passo de NEX (trilha/atributo/poder/treino/rituais)
// e devolve o corpo exato do PATCH que o LevelUpModal já envia para
// /api/ordem/characters/{id} — quem chama repete isso em sequência, sem
// precisar de nenhuma rota nova no servidor (mesmo padrão do Tormenta 20).

import {
  CLASSES, CLASS_BY_ID, SKILLS, computeVitals, computeDefense,
  type ClassId, type AttrKey, type OrdemAttrs, type TrainDegree,
} from "./data";
import { ORIGINS } from "./origins";
import { PARANORMAL_POWERS, CLASS_POWERS_BY_CLASS, TRAILS_BY_CLASS } from "./abilities";
import { RITUALS, maxRitualCircle } from "./rituals";
import { randomOrdemName } from "./names";
import { WEAPONS, type WeaponProf } from "./items";
import type { ConfiguredItem } from "./modifications";
import {
  computeSkillPlan, buildTrainedSkills, type OrdemWizardData,
} from "./creation";
import {
  buildNexPlan, trailPowerAt, recomputeVitals, type OrdemProgression,
} from "./leveling";

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

// A classe não tem um "atributo-chave" explícito no modelo de dados (ao
// contrário de D&D/Tormenta) — atribuído aqui por tema/mecânica dominante.
const CLASS_PRIMARY_ATTR: Record<ClassId, AttrKey> = {
  combatente: "agi",
  especialista: "int",
  ocultista: "int",
};

const CLASS_WEAPON_PROFS: Record<ClassId, WeaponProf[]> = {
  combatente: ["simples", "tatica"],
  especialista: ["simples"],
  ocultista: ["simples"],
};

function buildPriorityOrder(primary: AttrKey): AttrKey[] {
  const order: AttrKey[] = [primary];
  for (const k of ["pre", "vig", "for", "int", "agi"] as AttrKey[]) {
    if (!order.includes(k)) order.push(k);
  }
  return order;
}

// 4 pontos livres, base 1 em tudo, teto inicial 3 — distribui priorizando o
// atributo-chave da classe, sem nunca precisar zerar um atributo.
function distributeAttrs(priority: AttrKey[]): OrdemAttrs {
  const attrs: OrdemAttrs = { agi: 1, for: 1, int: 1, pre: 1, vig: 1 };
  let budget = 4;
  let progress = true;
  while (budget > 0 && progress) {
    progress = false;
    for (const key of priority) {
      if (budget <= 0) break;
      if (attrs[key] < 3) {
        attrs[key]++;
        budget--;
        progress = true;
      }
    }
  }
  return attrs;
}

function pickEquipment(classId: ClassId): { weapons: ConfiguredItem[]; protections: ConfiguredItem[] } {
  const profs = CLASS_WEAPON_PROFS[classId];
  const cat0 = WEAPONS.filter((w) => profs.includes(w.prof) && w.category === 0);
  const cat1 = WEAPONS.filter((w) => profs.includes(w.prof) && w.category === 1);

  const weapons: ConfiguredItem[] = [];
  if (cat0.length) weapons.push({ id: pick(cat0).id, mods: [], curses: [] });

  const protections: ConfiguredItem[] = [];
  let cat1Left = 2; // limite da patente inicial "recruta" pra itens de categoria I
  if (cat1.length && cat1Left > 0 && Math.random() < 0.6) {
    weapons.push({ id: pick(cat1).id, mods: [], curses: [] });
    cat1Left--;
  }
  if (cat1Left > 0 && Math.random() < 0.5) {
    protections.push({ id: "leve", mods: [], curses: [] });
    cat1Left--;
  }
  return { weapons, protections };
}

export interface AutoGenerateOptions { charName?: string; classId?: ClassId }

/** Monta o payload de criação (NEX 5%) com todas as escolhas sorteadas. */
export function generateLevel1Build(opts: AutoGenerateOptions = {}) {
  const cls = (opts.classId && CLASS_BY_ID[opts.classId]) || pick(CLASSES);
  const origin = pick(ORIGINS);

  const priority = buildPriorityOrder(CLASS_PRIMARY_ATTR[cls.id]);
  const attrs = distributeAttrs(priority);

  const fixedChoices: Record<string, string> = {};
  for (const f of cls.fixedSkills) {
    if (f.includes("|")) fixedChoices[f] = pick(f.split("|"));
  }

  const originSkills = origin.chooseAny ? sampleDistinct(SKILLS.map((s) => s.id), origin.chooseAny) : [];
  const paranormalPowerId = origin.id === "cultista-arrependido" ? pick(PARANORMAL_POWERS).id : "";

  const data: OrdemWizardData = {
    name: opts.charName?.trim() || randomOrdemName(),
    attrs,
    originId: origin.id,
    originSkills,
    paranormalPowerId,
    classId: cls.id,
    fixedChoices,
    trainedSkills: [],
    startingRituals: cls.id === "ocultista"
      ? sampleDistinct(RITUALS.filter((r) => r.circle === 1).map((r) => r.id), 3)
      : [],
    weapons: [],
    protections: [],
    generalItems: [],
    background: { appearance: "", personality: "", history: "", objective: "" },
  };

  const plan = computeSkillPlan(data);
  const pool = SKILLS.map((s) => s.id).filter((id) => !plan.locked.has(id));
  data.trainedSkills = sampleDistinct(pool, plan.need);

  const equipment = pickEquipment(cls.id);
  data.weapons = equipment.weapons;
  data.protections = equipment.protections;

  return {
    name: data.name,
    origin: data.originId,
    className: cls.id,
    nex: 5,
    attrs: data.attrs,
    skills: buildTrainedSkills(data),
    weapons: data.weapons,
    inventory: [
      ...data.protections.map((c) => ({ kind: "protection", id: c.id, mods: c.mods, curses: c.curses })),
      ...data.generalItems.map((c) => ({ kind: "general", id: c.id, mods: c.mods, curses: c.curses })),
    ],
    rituals: data.classId === "ocultista" && data.startingRituals.length ? data.startingRituals : null,
    paranormalPower: data.paranormalPowerId || null,
    background: data.background,
  };
}

// ── Progressão automática (NEX > 5%) ──────────────────────────────────────────

export interface OrdemSnapshot {
  nex: number;
  agi: number; for: number; int: number; pre: number; vig: number;
  pvMax: number; pvCurrent: number;
  peMax: number; peCurrent: number;
  sanMax: number; sanCurrent: number;
  defense: number;
  classId: ClassId;
  originId?: string;
  progression: OrdemProgression;
  skills: Record<string, TrainDegree>;
  rituals: string[];
}

/**
 * Decide UM passo de NEX (o próximo a partir de `snapshot.nex`) e devolve o
 * corpo exato do PATCH pra /api/ordem/characters/{id}, junto com o snapshot
 * já atualizado (pra encadear a próxima chamada sem reconsultar o banco).
 * Retorna null quando já está no NEX máximo (99%).
 */
export function pickNexUpgrade(snapshot: OrdemSnapshot): { patch: Record<string, unknown>; next: OrdemSnapshot } | null {
  const baseAttrs: OrdemAttrs = { agi: snapshot.agi, for: snapshot.for, int: snapshot.int, pre: snapshot.pre, vig: snapshot.vig };
  const plan = buildNexPlan(snapshot.classId, snapshot.nex, baseAttrs.int);
  if (!plan) return null;

  const priorityAttr = buildPriorityOrder(CLASS_PRIMARY_ATTR[snapshot.classId]);

  let trailId = snapshot.progression.trailId;
  if (plan.needsTrail) {
    trailId = pick(TRAILS_BY_CLASS[snapshot.classId]).id;
  }

  const newAttrs = { ...baseAttrs };
  for (let i = 0; i < plan.attrIncreases; i++) {
    const target = priorityAttr.find((k) => newAttrs[k] < 5) ?? "vig";
    newAttrs[target] = Math.min(5, newAttrs[target] + 1);
  }

  const ownedPowers = new Set(snapshot.progression.classPowers);
  const transcendId = `${snapshot.classId[0]}_transcender`;
  const wantsTranscender = plan.powerChoices > 0 && Math.random() < 0.15 && !ownedPowers.has(transcendId);

  let gainedClassPowers: string[] = [];
  let gainedParanormal: string[] = [];
  let transcenderChosen = false;

  if (plan.powerChoices > 0) {
    if (wantsTranscender) {
      transcenderChosen = true;
      const ownedPara = new Set(snapshot.progression.paranormalPowers);
      const paraPool = PARANORMAL_POWERS.filter((p) => !ownedPara.has(p.id));
      gainedParanormal = sampleDistinct(paraPool.map((p) => p.id), plan.powerChoices);
      gainedClassPowers = [transcendId];
    } else {
      const powerPool = CLASS_POWERS_BY_CLASS[snapshot.classId].filter((p) => {
        if (p.id === transcendId) return false;
        if (ownedPowers.has(p.id)) return p.description.includes("várias vezes");
        return true;
      });
      gainedClassPowers = sampleDistinct(powerPool.map((p) => p.id), plan.powerChoices);
    }
  }

  const knownSkills: Record<string, TrainDegree> = { ...snapshot.skills };
  if (plan.trainingCount > 0 && plan.trainingTarget) {
    const target = plan.trainingTarget;
    const eligible = SKILLS.filter((s) => {
      const cur = knownSkills[s.id] ?? "destreinado";
      return target === "veterano" ? cur === "treinado" : cur === "veterano";
    }).map((s) => s.id);
    for (const id of sampleDistinct(eligible, Math.min(plan.trainingCount, eligible.length))) {
      knownSkills[id] = target;
    }
  }

  const knownRituals = [...snapshot.rituals];
  if (snapshot.classId === "ocultista") {
    const maxCircle = maxRitualCircle(plan.toNex) ?? 1;
    const learnable = RITUALS.filter((r) => r.circle <= maxCircle && !knownRituals.includes(r.id));
    knownRituals.push(...sampleDistinct(learnable.map((r) => r.id), Math.min(2, learnable.length)));
  }

  const vitBefore = computeVitals(snapshot.classId, plan.fromNex, baseAttrs.vig, baseAttrs.pre, snapshot.originId);
  const vitAfter = recomputeVitals(snapshot.classId, plan.toNex, newAttrs, snapshot.originId, transcenderChosen);
  const dPv = vitAfter.pvMax - vitBefore.pvMax;
  const dPe = vitAfter.peMax - vitBefore.peMax;
  const dSan = vitAfter.sanMax - vitBefore.sanMax;

  const nextProgression: OrdemProgression = {
    trailId: trailId ?? snapshot.progression.trailId,
    classPowers: [...snapshot.progression.classPowers, ...gainedClassPowers],
    paranormalPowers: [...snapshot.progression.paranormalPowers, ...gainedParanormal],
    features: [...snapshot.progression.features],
  };
  if (plan.featureText) nextProgression.features.push({ nex: plan.toNex, text: plan.featureText });
  const grantedTrailPower = trailId ? trailPowerAt(trailId, plan.trailPowerNex ?? -1) : null;
  if (grantedTrailPower) {
    nextProgression.features.push({ nex: plan.toNex, text: `Trilha · ${grantedTrailPower.name}: ${grantedTrailPower.description}` });
  }

  const newDefense = computeDefense(newAttrs.agi);
  const pvCurrent = snapshot.pvCurrent + Math.max(0, dPv);
  const peCurrent = snapshot.peCurrent + Math.max(0, dPe);
  const sanCurrent = snapshot.sanCurrent + Math.max(0, dSan);

  const patch = {
    nex: plan.toNex,
    agi: newAttrs.agi, forca: newAttrs.for, int: newAttrs.int, pre: newAttrs.pre, vig: newAttrs.vig,
    defense: newDefense,
    pvMax: vitAfter.pvMax, pvCurrent,
    peMax: vitAfter.peMax, peCurrent,
    sanMax: vitAfter.sanMax, sanCurrent,
    trail: nextProgression.trailId,
    abilities: nextProgression,
    skills: knownSkills,
    rituals: knownRituals.length ? knownRituals : null,
  };

  const next: OrdemSnapshot = {
    nex: plan.toNex,
    agi: newAttrs.agi, for: newAttrs.for, int: newAttrs.int, pre: newAttrs.pre, vig: newAttrs.vig,
    pvMax: vitAfter.pvMax, pvCurrent,
    peMax: vitAfter.peMax, peCurrent,
    sanMax: vitAfter.sanMax, sanCurrent,
    defense: newDefense,
    classId: snapshot.classId,
    originId: snapshot.originId,
    progression: nextProgression,
    skills: knownSkills,
    rituals: knownRituals,
  };

  return { patch, next };
}
