// ─── ORDEM PARANORMAL — armazenamento local das operações do Mestre ──────────
// Espelha o storage do Guardião (Cthulhu), adaptado ao sistema de Ordem:
// atributos AGI/FOR/INT/PRE/VIG, vitais PV/PE/SAN, NEX e elementos do Outro Lado.

export interface OrdemNPCAttack {
  name: string;
  test: string;
  damage: string;
  description: string;
}

export interface OrdemNPC {
  id: string;
  name: string;
  role: string;          // ocupação / afiliação
  age: number | null;
  gender: string;
  affiliation: string;   // Ordo Realitas, culto, civil...
  description: string;
  personality: string;
  paranormalTies: string;
  notes: string;
  agi: number | null;
  forc: number | null;
  int: number | null;
  pre: number | null;
  vig: number | null;
  pv: number | null;
  pe: number | null;
  san: number | null;
  defense: number | null;
  attacks: OrdemNPCAttack[];
}

export interface OrdemCombatant {
  id: string;
  name: string;
  init: number;
  pv: number | null;
  maxPv: number | null;
  pe: number | null;
  maxPe: number | null;
  san: number | null;
  maxSan: number | null;
  isPlayer: boolean;
}

export interface OrdemSession {
  id: string;
  number: number;
  name: string;
  objective: string;
  events: string;
  summary: string;
  sessionDate: string;
}

export interface OrdemItem {
  id: string;
  name: string;
  description: string;
  type: "arma" | "protecao" | "item-paranormal" | "equipamento" | "ritual" | "misc";
  paranormal: boolean;
  sessionId: string | null;
}

export type MembranaState = "intacta" | "estavel" | "danificada" | "arruinada" | "rompida";

export const MEMBRANA_STATES: { id: MembranaState; label: string; color: string; effect: string }[] = [
  { id: "intacta",    label: "Intacta",    color: "#7dd3a8", effect: "Estado perfeito. Nenhuma manifestação paranormal: nenhum ritual, criatura ou poder paranormal funciona. Invasão física torna o local estável." },
  { id: "estavel",    label: "Estável",    color: "#5a9fd4", effect: "Seguro. Só rituais de 1º círculo (sem Discente/Verdadeiro), nunca de Medo. Criaturas não se manifestam, mas podem invadir e usar poderes." },
  { id: "danificada", label: "Danificada", color: "#c9941f", effect: "Estado mais comum. Todas as regras normais: todos rituais e poderes funcionam. Criaturas até 300 VD se manifestam (acima só invadindo de local pior)." },
  { id: "arruinada",  label: "Arruinada",  color: "#c0392b", effect: "Desastre. Todos rituais saem na forma Verdadeira de graça. Qualquer criatura se manifesta e ganha +10 ataque, +2 dados de dano, RD 10. Início de cada cena: 1d6 de dano mental a todos." },
  { id: "rompida",    label: "Rompida",    color: "#8b0000", effect: "Estado hipotético, nunca registrado. Ausência total de regras — um lugar tocado diretamente pelo Outro Lado." },
];

export interface OrdemStoryData {
  objective: string;
  hook: string;
  generalHistory: string;
  currentArc: string;
  mainThreat: string;
  membrana?: MembranaState;
}

export interface OrdemSanityRecord {
  id: string;
  agentName: string;
  currentSan: number;
  maxSan: number;
  sessionLoss: number;
  status: "normal" | "perturbado" | "enlouquecido";
  traumas: string[];
  notes: string;
}

export interface OrdemCampaign {
  id: string;
  name: string;
  /** Círculo da operação, ligado às faixas de NEX dos agentes. */
  tier: "1" | "2" | "3" | "4";
  createdAt: string;
  npcs: OrdemNPC[];
  combatants: OrdemCombatant[];
  notes: string;
  story?: OrdemStoryData;
  sessions?: OrdemSession[];
  items?: OrdemItem[];
  sanityRecords?: OrdemSanityRecord[];
}

export const TIER_LABEL: Record<OrdemCampaign["tier"], string> = {
  "1": "1º Círculo · NEX 5-35%",
  "2": "2º Círculo · NEX 40-65%",
  "3": "3º Círculo · NEX 70-95%",
  "4": "4º Círculo · NEX 99%",
};

const KEY = "ordem_master_campaigns";

function load(): OrdemCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OrdemCampaign[]) : [];
  } catch {
    return [];
  }
}

function persist(campaigns: OrdemCampaign[]): void {
  localStorage.setItem(KEY, JSON.stringify(campaigns));
}

export function getOrdemCampaigns(): OrdemCampaign[] {
  return load();
}

export function getOrdemCampaign(id: string): OrdemCampaign | null {
  return load().find((c) => c.id === id) ?? null;
}

export function saveOrdemCampaign(campaign: OrdemCampaign): void {
  const all = load();
  const idx = all.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) all[idx] = campaign;
  else all.push(campaign);
  persist(all);
}

export function createOrdemCampaign(name: string, tier: OrdemCampaign["tier"]): OrdemCampaign {
  const campaign: OrdemCampaign = {
    id: crypto.randomUUID(),
    name: name.trim(),
    tier,
    createdAt: new Date().toISOString(),
    npcs: [],
    combatants: [],
    notes: "",
  };
  saveOrdemCampaign(campaign);
  return campaign;
}

export function deleteOrdemCampaign(id: string): void {
  persist(load().filter((c) => c.id !== id));
}
