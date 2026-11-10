// ─── Cyberpunk RED — Mestre: cliente de dados (API DB) ───────────────────────
import { campaignClient, type CampaignCounts } from "@/lib/campaign/client";

export type Threat = "mook" | "lieutenant" | "miniboss" | "boss";

export interface CyberpunkNpc {
  id: string; name: string; role: string; threat: Threat; trait: string;
  appearance: string; notes: string;
  hp: number | null; hpMax: number | null; spHead: number; spBody: number;
  int: number | null; ref: number | null; dex: number | null; tech: number | null;
  cool: number | null; will: number | null; luck: number | null; move: number | null;
  body: number | null; emp: number | null;
  skills: Record<string, number>; weapons: unknown[]; cyberware: unknown[];
}

export interface CyberpunkCombatant {
  id: string; characterId: string | null; name: string; initiative: number;
  hp: number | null; maxHp: number | null; spHead: number; spBody: number;
  conditions: string[]; isPlayer: boolean; order: number; deathSavePenalty: number;
}

export interface CyberpunkGameSession {
  id: string; number: number; name: string; objective: string;
  events: string; summary: string; sessionDate: string;
}

export interface CyberpunkCampaignItem {
  id: string; name: string; description: string;
  type: "arma" | "armadura" | "cyberware" | "equipamento" | "misc";
  rarity: string; sessionId: string | null;
}

export interface CyberpunkClue {
  id: string; title: string; content: string; source: string;
  discovered: boolean; sessionId: string | null;
}

export interface CyberpunkClock {
  id: string; name: string; segments: number; filled: number;
  kind: "ameaca" | "missao" | "neutro"; notes: string;
}

export interface CyberpunkStory {
  objective: string; purpose: string; generalHistory: string; currentArc: string; mainVillain: string;
}

export interface CyberpunkCampaign {
  id: string; name: string; inviteCode: string;
  nextSessionAt: string | null; notes: string | null; createdAt: string;
  story: CyberpunkStory | null;
  npcs: CyberpunkNpc[];
  combatants: CyberpunkCombatant[];
  sessions: CyberpunkGameSession[];
  items: CyberpunkCampaignItem[];
  clues: CyberpunkClue[];
  clocks: CyberpunkClock[];
}

export interface CyberpunkCampaignSummary {
  id: string; name: string; nextSessionAt: string | null; createdAt: string;
  counts: CampaignCounts;
}

export type ResourceName = "npcs" | "combatants" | "sessions" | "items" | "clues" | "clocks";

export const cyberpunkClient =
  campaignClient<CyberpunkCampaign, CyberpunkCampaignSummary, ResourceName>("cyberpunk");

export const {
  listCampaigns, getCampaign, createCampaign, deleteCampaign, patchCampaign,
  createChild, updateChild, deleteChild,
} = cyberpunkClient;
