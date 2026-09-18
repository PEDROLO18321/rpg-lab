// ─── Ficha de jogador na visão do mestre (somente leitura) ───────────────────
// O mestre vê fichas de cinco sistemas na mesma aba. Em vez de renderizar cinco
// fichas completas, cada sistema é reduzido aqui a uma forma comum — vitais,
// atributos, estatísticas, perícias — e a UI é uma só. Nada aqui escreve.
import { parseJsonField } from "@/lib/characterTransfer";
import type { SystemKey } from "@/lib/campaign/registry";

import { RACES as DND_RACES, ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASS_LABELS as DND_CLASS_LABELS } from "@/lib/dnd/classes";

import {
  ATTR_KEYS as T20_KEYS, ATTR_LABEL as T20_LABEL, attrMod,
  SKILL_BY_ID as T20_SKILL,
} from "@/lib/tormenta/data";
import { RACE_BY_ID as T20_RACE } from "@/lib/tormenta/races";
import { CLASS_BY_ID as T20_CLASS } from "@/lib/tormenta/classes";
import { ORIGIN_BY_ID as T20_ORIGIN } from "@/lib/tormenta/origins";

import {
  ATTR_LABELS as COC_LABEL, SKILLS as COC_SKILLS, OCCUPATIONS as COC_OCC,
} from "@/lib/cthulhu/data";

import {
  ATTR_KEYS as ORD_KEYS, ATTR_LABEL as ORD_LABEL, SKILL_BY_ID as ORD_SKILL,
  CLASS_BY_ID as ORD_CLASS, TRAIN_LABEL,
} from "@/lib/ordem/data";
import { ORIGIN_BY_ID as ORD_ORIGIN } from "@/lib/ordem/origins";

import {
  ATTR_KEYS as SW_KEYS, ATTR_LABEL as SW_LABEL,
  SKILL_GRADE_LABEL, PATH_LABEL,
} from "@/lib/starwars/data";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { CLASS_BY_ID as SW_CLASS } from "@/lib/starwars/classes";
import { PLANET_BY_ID } from "@/lib/starwars/planets";
import { SKILL_BY_ID as SW_SKILL } from "@/lib/starwars/skills";

export interface PartyVital { label: string; current: number; max: number; temp: number }
export interface PartyAttr { label: string; value: number; detail?: string }
export interface PartyStat { label: string; value: string }
export interface PartySkill { name: string; detail: string }

export interface PartySheet {
  id: string;
  name: string;
  portraitUrl: string | null;
  system: SystemKey;
  ownerName: string;
  linkedAt: string;
  /** Linha de identidade: "Anão · Guerreiro 3 · Nível 3". */
  subtitle: string;
  vitals: PartyVital[];
  attrs: PartyAttr[];
  stats: PartyStat[];
  skills: PartySkill[];
  conditions: string[];
  notes: string | null;
}

/** Parte da ficha que depende do sistema; o resto vem do Character. */
type SystemPart = Omit<
  PartySheet,
  "id" | "name" | "portraitUrl" | "system" | "ownerName" | "linkedAt"
>;

// As colunas variam por sistema e o acesso é guiado pelo mapa BUILDERS. Como
// nada aqui escreve no banco, a tipagem frouxa não abre brecha de segurança.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const vital = (label: string, current: unknown, max: unknown, temp: unknown = 0): PartyVital => ({
  label,
  current: Number(current) || 0,
  max: Number(max) || 0,
  temp: Number(temp) || 0,
});

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

/** Junta as partes não vazias da linha de identidade. */
const line = (...parts: (string | null | undefined | false)[]) =>
  parts.filter(Boolean).join(" · ");

/** Nomes de condição vêm como string[] em coluna Json. */
const conditionsOf = (raw: unknown): string[] => {
  const list = parseJsonField<unknown[]>(raw, []);
  return Array.isArray(list) ? list.filter((c): c is string => typeof c === "string") : [];
};

// ── D&D 5e ───────────────────────────────────────────────────────────────────

function fromDnd(s: Row): SystemPart {
  const classes: Row[] = s.classes ?? [];
  const classLine = classes
    .map((c) => `${DND_CLASS_LABELS[c.className] ?? c.className} ${c.level}`)
    .join(" / ");
  const race = DND_RACES.find((r) => r.id === s.race)?.name ?? s.race;

  const attrs: PartyAttr[] = (["str", "dex", "con", "int", "wis", "cha"] as const).map((k) => ({
    label: ABILITY_LABELS[k],
    value: s[k],
    detail: signed(Math.floor((s[k] - 10) / 2)),
  }));

  const skills: PartySkill[] = (s.skills ?? [])
    .filter((sk: Row) => sk.proficient || sk.expertise)
    .map((sk: Row) => ({
      name: sk.skillName,
      detail: sk.expertise ? "Especialista" : "Proficiente",
    }));

  return {
    subtitle: line(race, classLine, `Nível ${s.level}`, s.background, s.alignment),
    vitals: [vital("PV", s.hpCurrent, s.hpMax, s.hpTemp)],
    attrs,
    stats: [
      { label: "CA", value: String(s.armorClass) },
      { label: "Iniciativa", value: signed(s.initiative) },
      { label: "Deslocamento", value: `${s.speed} pés` },
      { label: "Dados de Vida", value: s.hitDice ? `${s.hitDice} (${s.hitDiceUsed} usados)` : "—" },
      { label: "Inspiração", value: s.inspiration ? "Sim" : "Não" },
      { label: "XP", value: String(s.xp) },
    ],
    skills,
    conditions: conditionsOf(s.conditions),
    notes: null,
  };
}

// ── Tormenta 20 ──────────────────────────────────────────────────────────────

function fromTormenta(s: Row): SystemPart {
  const attrs: PartyAttr[] = T20_KEYS.map((k) => {
    const value = k === "for" ? s.forca : s[k];
    return { label: T20_LABEL[k], value, detail: signed(attrMod(value)) };
  });

  const trained = parseJsonField<Record<string, boolean>>(s.skills, {});
  const skills: PartySkill[] = Object.entries(trained)
    .filter(([, on]) => on)
    .map(([id]) => ({ name: T20_SKILL[id]?.name ?? id, detail: "Treinada" }));

  const bg = parseJsonField<Row>(s.background, {});

  return {
    subtitle: line(
      T20_RACE[s.race]?.name ?? s.race,
      T20_CLASS[s.className]?.name ?? s.className,
      s.path,
      `Nível ${s.level}`,
      T20_ORIGIN[s.origin]?.name,
    ),
    vitals: [
      vital("PV", s.pvCurrent, s.pvMax, s.pvTemp),
      vital("PM", s.pmCurrent, s.pmMax, s.pmTemp),
    ],
    attrs,
    stats: [
      { label: "Defesa", value: String(s.defense) },
      { label: "Deslocamento", value: `${s.movement} m` },
      { label: "Dinheiro", value: `T$ ${s.money}` },
      { label: "XP", value: String(s.xp) },
    ],
    skills,
    conditions: conditionsOf(s.conditions),
    notes: [bg.objective, s.notes].filter(Boolean).join("\n\n") || null,
  };
}

// ── Call of Cthulhu 7e ───────────────────────────────────────────────────────

const COC_ERA: Record<string, string> = { "1920s": "Anos 1920", modern: "Era Moderna" };

function fromCthulhu(s: Row): SystemPart {
  const attrs: PartyAttr[] = (["for", "con", "tam", "des", "apa", "int", "pod", "edu"] as const)
    .map((k) => {
      const col = `atrib${k.charAt(0).toUpperCase()}${k.slice(1)}`;
      const value = s[col];
      // Cthulhu rola contra metade e um quinto do valor: o mestre precisa dos dois.
      return { label: COC_LABEL[k], value, detail: `${Math.floor(value / 2)}/${Math.floor(value / 5)}` };
    });

  // Só perícias acima do valor base interessam ao mestre.
  const values = parseJsonField<Record<string, number>>(s.skills, {});
  const skills: PartySkill[] = COC_SKILLS
    .filter((sk) => (values[sk.id] ?? sk.base) > sk.base)
    .map((sk) => ({ name: sk.name, detail: `${values[sk.id]}%` }));

  const insanity = parseJsonField<Row>(s.insanityData, {});

  return {
    subtitle: line(
      COC_OCC.find((o) => o.id === s.occupation)?.name ?? s.occupation,
      s.age ? `${s.age} anos` : null,
      COC_ERA[s.era] ?? s.era,
    ),
    vitals: [
      vital("PV", s.pvCurrent, s.pvMax, s.pvTemp),
      vital("Sanidade", s.sanCurrent, s.sanMax, s.sanTemp),
    ],
    attrs,
    stats: [
      { label: "Sorte", value: String(s.luck) },
      { label: "Movimento", value: String(s.mov) },
      { label: "Pontos de Magia", value: String(s.pmCurrent) },
      { label: "Estado mental", value: insanity.status ? String(insanity.status) : "Estável" },
    ],
    skills,
    conditions: [
      ...(Array.isArray(insanity.phobias) ? insanity.phobias.map(String) : []),
      ...(Array.isArray(insanity.manias) ? insanity.manias.map(String) : []),
    ],
    notes: s.notes ?? null,
  };
}

// ── Ordem Paranormal ─────────────────────────────────────────────────────────

function fromOrdem(s: Row): SystemPart {
  const attrs: PartyAttr[] = ORD_KEYS.map((k) => ({
    label: ORD_LABEL[k],
    value: k === "for" ? s.forca : s[k],
  }));

  const degrees = parseJsonField<Record<string, string>>(s.skills, {});
  const skills: PartySkill[] = Object.entries(degrees)
    .filter(([, grade]) => Boolean(grade))
    .map(([id, grade]) => ({
      name: ORD_SKILL[id]?.name ?? id,
      detail: TRAIN_LABEL[grade as keyof typeof TRAIN_LABEL] ?? grade,
    }));

  const bg = parseJsonField<Row>(s.background, {});
  const insanity = parseJsonField<Row>(s.insanity, {});

  return {
    subtitle: line(
      ORD_CLASS[s.className as keyof typeof ORD_CLASS]?.name ?? s.className,
      s.trail,
      ORD_ORIGIN[s.origin]?.name,
      `NEX ${s.nex}%`,
      s.patente,
    ),
    vitals: [
      vital("PV", s.pvCurrent, s.pvMax, s.pvTemp),
      vital("PE", s.peCurrent, s.peMax, s.peTemp),
      vital("Sanidade", s.sanCurrent, s.sanMax, s.sanTemp),
    ],
    attrs,
    stats: [
      { label: "Defesa", value: String(s.defense) },
      { label: "Deslocamento", value: `${s.movement} m` },
      { label: "Prestígio", value: String(s.prestige) },
      { label: "Afinidade", value: s.affinity ?? "—" },
    ],
    skills,
    conditions: [
      ...conditionsOf(s.conditions),
      ...(Array.isArray(insanity.traumas) ? insanity.traumas.map(String) : []),
    ],
    notes: [bg.objective, s.notes].filter(Boolean).join("\n\n") || null,
  };
}

// ── Star Wars (autoral) ──────────────────────────────────────────────────────

function fromStarWars(s: Row): SystemPart {
  const attrs: PartyAttr[] = SW_KEYS.map((k) => ({ label: SW_LABEL[k], value: s[k] }));

  const classes = parseJsonField<Record<string, number>>(s.classes, {});
  const classLine = Object.entries(classes)
    .map(([id, lvl]) => `${SW_CLASS[id]?.name ?? id} ${lvl}`)
    .join(" / ");

  const grades = parseJsonField<Record<string, string>>(s.skills, {});
  const skills: PartySkill[] = Object.entries(grades)
    .filter(([, g]) => g && g !== "inexperiente")
    .map(([id, g]) => ({
      name: SW_SKILL[id]?.name ?? id,
      detail: SKILL_GRADE_LABEL[g as keyof typeof SKILL_GRADE_LABEL] ?? g,
    }));

  const bg = parseJsonField<Row>(s.background, {});

  return {
    subtitle: line(
      SPECIES_BY_ID[s.species]?.name ?? s.species,
      PLANET_BY_ID[s.planet]?.name,
      classLine,
      `Nível ${s.level}`,
      PATH_LABEL[s.path as keyof typeof PATH_LABEL],
    ),
    vitals: [
      vital("PV", s.pvCurrent, s.pvMax, s.pvTemp),
      vital("PE", s.peCurrent, s.peMax, s.peTemp),
      vital("PP", s.ppCurrent, s.ppMax, s.ppTemp),
    ],
    attrs,
    stats: [
      { label: "Organização", value: bg.organization ? String(bg.organization) : "—" },
      { label: "Forma de sabre", value: s.sabreForm ?? "—" },
      { label: "XP", value: String(s.xp) },
    ],
    skills,
    conditions: conditionsOf(s.conditions),
    notes: [bg.objective, s.notes].filter(Boolean).join("\n\n") || null,
  };
}

// ── Despacho ─────────────────────────────────────────────────────────────────

interface Builder {
  relation: string;
  build: (s: Row) => SystemPart;
  /** Sub-relações da ficha. Só D&D guarda classes e perícias em tabela. */
  include?: Row;
}

const BUILDERS: Record<SystemKey, Builder> = {
  dnd: {
    relation: "dndSheet",
    build: fromDnd,
    include: { classes: { orderBy: { level: "desc" } }, skills: true },
  },
  tormenta: { relation: "tormentaSheet", build: fromTormenta },
  cthulhu: { relation: "cthulhuSheet", build: fromCthulhu },
  ordem: { relation: "ordemSheet", build: fromOrdem },
  starwars: { relation: "starWarsSheet", build: fromStarWars },
};

/** `include` do Character que traz a ficha daquele sistema e o dono. */
export function partyInclude(system: SystemKey): Row {
  const { relation, include } = BUILDERS[system];
  return {
    user: { select: { name: true, email: true } },
    [relation]: include ? { include } : true,
  };
}

/**
 * Converte um Character (com a ficha do sistema incluída) na forma comum.
 * Devolve null quando a ficha daquele sistema não existe — personagem incompleto.
 */
export function toPartySheet(system: SystemKey, character: Row, linkedAt: Date): PartySheet | null {
  const { relation, build } = BUILDERS[system];
  const sheet = character[relation];
  if (!sheet) return null;

  return {
    id: character.id,
    name: character.name,
    portraitUrl: character.portraitUrl ?? null,
    system,
    ownerName: character.user?.name ?? character.user?.email ?? "Jogador",
    linkedAt: linkedAt.toISOString(),
    ...build(sheet),
  };
}
