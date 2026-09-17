// ─── D&D 5e — Mestre: tipos e cliente de dados ───────────────────────────────
// A mecânica de rede vive em @/lib/campaign/client; aqui só os tipos do sistema.
import { campaignClient, type CampaignCounts } from "@/lib/campaign/client";

export interface NPCAttack { name: string; bonus: string; damage: string; description: string }

export interface DndNpc {
  id: string; name: string; race: string; role: string; alignment: string; trait: string;
  appearance: string; notes: string; hp: number | null; ac: number | null;
  str: number | null; dex: number | null; con: number | null; int: number | null;
  wis: number | null; cha: number | null; attacks: NPCAttack[];
}

export interface DndCombatant {
  id: string; characterId: string | null; name: string; initiative: number;
  hp: number | null; maxHp: number | null; tempHp: number; ac: number | null;
  conditions: string[]; concentration: boolean; isPlayer: boolean; order: number;
}

export interface DndGameSession {
  id: string; number: number; name: string; objective: string;
  events: string; summary: string; sessionDate: string;
}

export interface DndCampaignItem {
  id: string; name: string; description: string;
  type: "arma" | "armadura" | "magia" | "consumível" | "misc";
  rarity: "comum" | "incomum" | "raro" | "muito raro" | "lendário";
  sessionId: string | null;
}

export interface DndClue {
  id: string; title: string; content: string; source: string;
  discovered: boolean; sessionId: string | null;
}

export interface DndClock {
  id: string; name: string; segments: number; filled: number;
  kind: "ameaca" | "missao" | "neutro"; notes: string;
}

export interface DndStory {
  objective: string; purpose: string; generalHistory: string;
  currentArc: string; mainVillain: string;
}

export interface DndCampaign {
  id: string; name: string; inviteCode: string;
  nextSessionAt: string | null; notes: string | null; createdAt: string;
  story: DndStory | null;
  npcs: DndNpc[];
  combatants: DndCombatant[];
  sessions: DndGameSession[];
  items: DndCampaignItem[];
  clues: DndClue[];
  clocks: DndClock[];
}

export interface DndCampaignSummary {
  id: string; name: string; nextSessionAt: string | null; createdAt: string;
  counts: CampaignCounts;
}

export type ResourceName = "npcs" | "combatants" | "sessions" | "items" | "clues" | "clocks";

export const dndClient = campaignClient<DndCampaign, DndCampaignSummary, ResourceName>("dnd");

export const {
  listCampaigns, getCampaign, createCampaign, deleteCampaign, patchCampaign,
  createChild, updateChild, deleteChild,
} = dndClient;
