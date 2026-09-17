// ─── TORMENTA 20 — Mestre: cliente de dados (API DB) ─────────────────────────
import { campaignClient, type CampaignCounts } from "@/lib/campaign/client";
export interface NPCAttack { name: string; bonus: string; damage: string; description: string }

export interface TormentaNpc {
  id: string; name: string; race: string; role: string; description: string;
  personality: string; notes: string; pv: number | null; defense: number | null;
  forca: number | null; des: number | null; con: number | null; int: number | null;
  sab: number | null; car: number | null; attacks: NPCAttack[];
}

export interface TormentaCombatant {
  id: string; characterId: string | null; name: string; initiative: number;
  pv: number | null; maxPv: number | null; pm: number | null; maxPm: number | null;
  defense: number | null; conditions: string[]; isPlayer: boolean; order: number;
}

export interface TormentaGameSession {
  id: string; number: number; name: string; objective: string;
  events: string; summary: string; sessionDate: string;
}

export interface TormentaCampaignItem {
  id: string; name: string; description: string;
  type: "arma" | "armadura" | "magico" | "consumivel" | "misc";
  rarity: "comum" | "incomum" | "raro" | "muito raro" | "lendário";
  sessionId: string | null;
}

export interface TormentaClue {
  id: string; title: string; content: string; source: string;
  discovered: boolean; sessionId: string | null;
}

export interface TormentaClock {
  id: string; name: string; segments: number; filled: number;
  kind: "ameaca" | "missao" | "neutro"; notes: string;
}

export interface TormentaStory {
  objective: string; purpose: string; generalHistory: string;
  currentArc: string; mainVillain: string;
}

export interface TormentaCampaign {
  id: string; name: string; inviteCode: string;
  nextSessionAt: string | null; notes: string | null; createdAt: string;
  story: TormentaStory | null;
  npcs: TormentaNpc[];
  combatants: TormentaCombatant[];
  sessions: TormentaGameSession[];
  items: TormentaCampaignItem[];
  clues: TormentaClue[];
  clocks: TormentaClock[];
}

export interface TormentaCampaignSummary {
  id: string; name: string; nextSessionAt: string | null; createdAt: string;
  counts: CampaignCounts;
}

export type ResourceName = "npcs" | "combatants" | "sessions" | "items" | "clues" | "clocks";

export const tormentaClient = campaignClient<TormentaCampaign, TormentaCampaignSummary, ResourceName>("tormenta");

export const {
  listCampaigns, getCampaign, createCampaign, deleteCampaign, patchCampaign,
  createChild, updateChild, deleteChild,
} = tormentaClient;
