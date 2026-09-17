// ─── Call of Cthulhu — Guardião: cliente de dados (API DB) ───────────────────
import { campaignClient, type CampaignCounts } from "@/lib/campaign/client";
export type Era = "1920s" | "modern" | "outro";

export interface CthulhuNPCAttack { name: string; skill: string; damage: string; description: string }

export interface CthulhuNpc {
  id: string; name: string; occupation: string; age: number | null; gender: string;
  nationality: string; description: string; personality: string; mythosTies: string; notes: string;
  str: number | null; con: number | null; siz: number | null; dex: number | null;
  int: number | null; pow: number | null; app: number | null; edu: number | null;
  hp: number | null; san: number | null; attacks: CthulhuNPCAttack[];
}

export interface CthulhuCombatant {
  id: string; characterId: string | null; name: string; dex: number;
  hp: number | null; maxHp: number | null; san: number | null; maxSan: number | null;
  mp: number | null; maxMp: number | null; conditions: string[]; isPlayer: boolean; order: number;
}

export interface CthulhuGameSession {
  id: string; number: number; name: string; objective: string;
  events: string; summary: string; sessionDate: string;
}

export interface CthulhuCampaignItem {
  id: string; name: string; description: string;
  type: "tomo" | "artefato" | "arma" | "equipamento" | "misc";
  mythos: boolean; sessionId: string | null;
}

export interface CthulhuInsanityRecord {
  id: string; characterId: string | null; investigatorName: string;
  currentSan: number; maxSan: number; sessionLoss: number;
  status: "normal" | "temp_insane" | "indef_insane";
  phobias: string[]; manias: string[]; notes: string;
}

export interface CthulhuClue {
  id: string; title: string; content: string; source: string;
  discovered: boolean; sessionId: string | null;
}

export interface CthulhuClock {
  id: string; name: string; segments: number; filled: number;
  kind: "ameaca" | "missao" | "neutro"; notes: string;
}

export interface CthulhuStory {
  objective: string; hook: string; generalHistory: string; currentArc: string; mainCult: string;
}

export interface CthulhuCampaign {
  id: string; name: string; era: Era; inviteCode: string;
  nextSessionAt: string | null; notes: string | null; createdAt: string;
  story: CthulhuStory | null;
  npcs: CthulhuNpc[];
  combatants: CthulhuCombatant[];
  sessions: CthulhuGameSession[];
  items: CthulhuCampaignItem[];
  insanity: CthulhuInsanityRecord[];
  clues: CthulhuClue[];
  clocks: CthulhuClock[];
}

export interface CthulhuCampaignSummary {
  id: string; name: string; era: Era; nextSessionAt: string | null; createdAt: string;
  counts: CampaignCounts;
}

export const ERA_LABEL: Record<Era, string> = { "1920s": "Década de 1920", modern: "Era Moderna", outro: "Outra Era" };

export type ResourceName =
  | "npcs" | "combatants" | "sessions" | "items" | "insanity" | "clues" | "clocks";

export const cthulhuClient =
  campaignClient<CthulhuCampaign, CthulhuCampaignSummary, ResourceName, { era: Era }>("cthulhu");

export const {
  listCampaigns, getCampaign, createCampaign, deleteCampaign, patchCampaign,
  createChild, updateChild, deleteChild,
} = cthulhuClient;
