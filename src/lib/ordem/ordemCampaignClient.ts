// ─── ORDEM PARANORMAL — Mestre: cliente de dados (API DB) ─────────────────────
import { campaignClient, type CampaignCounts } from "@/lib/campaign/client";
// Substitui o antigo ordemCampaignStorage (localStorage) por chamadas à API.
// Os tipos espelham os modelos Prisma da operação.

export type Tier = "1" | "2" | "3" | "4";
export type MembranaState = "intacta" | "estavel" | "danificada" | "arruinada" | "rompida";

export interface OrdemNPCAttack { name: string; test: string; damage: string; description: string }

export interface OrdemNpc {
  id: string; name: string; role: string; age: number | null; gender: string;
  affiliation: string; description: string; personality: string; paranormalTies: string;
  notes: string; agi: number | null; forca: number | null; int: number | null;
  pre: number | null; vig: number | null; pv: number | null; pe: number | null;
  san: number | null; defense: number | null; attacks: OrdemNPCAttack[];
}

export interface OrdemCombatant {
  id: string; characterId: string | null; name: string; init: number;
  pv: number | null; maxPv: number | null; pe: number | null; maxPe: number | null;
  san: number | null; maxSan: number | null; rd: number; isPlayer: boolean;
  conditions: string[];
  order: number;
}

export interface OrdemGameSession {
  id: string; number: number; name: string; objective: string;
  events: string; summary: string; sessionDate: string;
}

export interface OrdemItem {
  id: string; name: string; description: string;
  type: "arma" | "protecao" | "item-paranormal" | "equipamento" | "ritual" | "misc";
  paranormal: boolean; sessionId: string | null;
}

export interface OrdemSanityRecord {
  id: string; characterId: string | null; agentName: string; currentSan: number;
  maxSan: number; sessionLoss: number; status: "normal" | "perturbado" | "enlouquecido";
  traumas: string[]; notes: string;
}

export interface OrdemClue {
  id: string; title: string; content: string; source: string;
  discovered: boolean; sessionId: string | null;
}

export interface OrdemClock {
  id: string; name: string; segments: number; filled: number;
  kind: "ameaca" | "missao" | "neutro"; notes: string;
}

export interface OrdemReward {
  id: string; characterId: string | null; agentName: string;
  prestige: number; reason: string; sessionId: string | null;
}

export interface OrdemStory {
  objective: string; hook: string; generalHistory: string;
  currentArc: string; mainThreat: string; membrana: MembranaState;
}

export interface OrdemCampaign {
  id: string; name: string; tier: Tier; inviteCode: string;
  nextSessionAt: string | null; notes: string | null; createdAt: string;
  story: OrdemStory | null;
  npcs: OrdemNpc[];
  combatants: OrdemCombatant[];
  sessions: OrdemGameSession[];
  items: OrdemItem[];
  sanity: OrdemSanityRecord[];
  clues: OrdemClue[];
  clocks: OrdemClock[];
  rewards: OrdemReward[];
}

export interface CampaignSummary {
  id: string; name: string; tier: Tier; nextSessionAt: string | null; createdAt: string;
  counts: CampaignCounts;
}

export const TIER_LABEL: Record<Tier, string> = {
  "1": "1º Círculo · NEX 5-35%",
  "2": "2º Círculo · NEX 40-65%",
  "3": "3º Círculo · NEX 70-95%",
  "4": "4º Círculo · NEX 99%",
};

export const MEMBRANA_STATES: { id: MembranaState; label: string; color: string; effect: string }[] = [
  { id: "intacta",    label: "Intacta",    color: "#7dd3a8", effect: "Estado perfeito. Nenhuma manifestação paranormal: nenhum ritual, criatura ou poder paranormal funciona. Invasão física torna o local estável." },
  { id: "estavel",    label: "Estável",    color: "#5a9fd4", effect: "Seguro. Só rituais de 1º círculo (sem Discente/Verdadeiro), nunca de Medo. Criaturas não se manifestam, mas podem invadir e usar poderes." },
  { id: "danificada", label: "Danificada", color: "#c9941f", effect: "Estado mais comum. Todas as regras normais: todos rituais e poderes funcionam. Criaturas até 300 VD se manifestam (acima só invadindo de local pior)." },
  { id: "arruinada",  label: "Arruinada",  color: "#c0392b", effect: "Desastre. Todos rituais saem na forma Verdadeira de graça. Qualquer criatura se manifesta e ganha +10 ataque, +2 dados de dano, RD 10. Início de cada cena: 1d6 de dano mental a todos." },
  { id: "rompida",    label: "Rompida",    color: "#8b0000", effect: "Estado hipotético, nunca registrado. Ausência total de regras — um lugar tocado diretamente pelo Outro Lado." },
];

export type ResourceName =
  | "npcs" | "combatants" | "sessions" | "items" | "sanity" | "clues" | "clocks" | "rewards";

export const ordemClient =
  campaignClient<OrdemCampaign, CampaignSummary, ResourceName, { tier: Tier }>("ordem");

export const {
  listCampaigns, getCampaign, createCampaign, deleteCampaign, patchCampaign,
  createChild, updateChild, deleteChild,
} = ordemClient;
