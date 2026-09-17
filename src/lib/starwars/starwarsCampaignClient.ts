// ─── STAR WARS: ALÉM DA FRONTEIRA — Mestre: cliente de dados (API DB) ────────
import { campaignClient, type CampaignCounts } from "@/lib/campaign/client";
export interface NPCAttack { name: string; bonus: string; damage: string; description: string }
export interface NPCSkill { skillId: string; value: number }

export interface StarWarsNpc {
  id: string; name: string; species: string; role: string; description: string;
  personality: string; notes: string; pv: number | null;
  agi: number | null; int: number | null; forca: number | null;
  vig: number | null; pre: number | null; sen: number | null; attacks: NPCAttack[];
  skills: NPCSkill[];
}

export interface StarWarsCombatant {
  id: string; characterId: string | null; name: string; initiative: number;
  pv: number | null; maxPv: number | null; pe: number | null; maxPe: number | null;
  conditions: string[]; isPlayer: boolean; order: number;
}

export interface StarWarsGameSession {
  id: string; number: number; name: string; objective: string;
  events: string; summary: string; sessionDate: string;
}

export interface StarWarsCampaignItem {
  id: string; name: string; description: string;
  type: "arma" | "equipamento" | "nave" | "artefato" | "misc";
  rarity: "comum" | "incomum" | "raro" | "muito raro" | "lendário";
  sessionId: string | null;
}

export interface StarWarsClue {
  id: string; title: string; content: string; source: string;
  discovered: boolean; sessionId: string | null;
}

export interface StarWarsClock {
  id: string; name: string; segments: number; filled: number;
  kind: "ameaca" | "missao" | "neutro"; notes: string;
}

export interface StarWarsStory {
  objective: string; purpose: string; generalHistory: string;
  currentArc: string; mainVillain: string;
}

export interface StarWarsCampaign {
  id: string; name: string; inviteCode: string;
  nextSessionAt: string | null; notes: string | null; createdAt: string;
  story: StarWarsStory | null;
  npcs: StarWarsNpc[];
  combatants: StarWarsCombatant[];
  sessions: StarWarsGameSession[];
  items: StarWarsCampaignItem[];
  clues: StarWarsClue[];
  clocks: StarWarsClock[];
}

export interface StarWarsCampaignSummary {
  id: string; name: string; nextSessionAt: string | null; createdAt: string;
  counts: CampaignCounts;
}

export type ResourceName = "npcs" | "combatants" | "sessions" | "items" | "clues" | "clocks";

export const starWarsClient = campaignClient<StarWarsCampaign, StarWarsCampaignSummary, ResourceName>("starwars");

export const {
  listCampaigns, getCampaign, createCampaign, deleteCampaign, patchCampaign,
  createChild, updateChild, deleteChild,
} = starWarsClient;
