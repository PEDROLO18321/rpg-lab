// ─── Call of Cthulhu — Guardião: cliente de dados (API DB) ───────────────────
export type Era = "1920s" | "modern" | "outro";

export interface CthulhuNPCAttack { name: string; skill: string; damage: string; description: string }

export interface CthulhuNpc {
  id: string; name: string; occupation: string; age: number | null; gender: string;
  nationality: string; description: string; personality: string; mythosTies: string; notes: string;
  str: number | null; con: number | null; siz: number | null; dex: number | null;
  int: number | null; pow: number | null; app: number | null; edu: number | null;
  hp: number | null; san: number | null; attacks: string; // JSON CthulhuNPCAttack[]
}

export interface CthulhuCombatant {
  id: string; characterId: string | null; name: string; dex: number;
  hp: number | null; maxHp: number | null; san: number | null; maxSan: number | null;
  mp: number | null; maxMp: number | null; conditions: string; isPlayer: boolean; order: number;
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
  phobias: string; manias: string; notes: string; // phobias/manias = JSON string[]
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
  cthulhuStory: CthulhuStory | null;
  cthulhuNpcs: CthulhuNpc[];
  cthulhuCombatants: CthulhuCombatant[];
  cthulhuSessions: CthulhuGameSession[];
  cthulhuItems: CthulhuCampaignItem[];
  cthulhuInsanity: CthulhuInsanityRecord[];
  cthulhuClues: CthulhuClue[];
  cthulhuClocks: CthulhuClock[];
}

export interface CthulhuCampaignSummary {
  id: string; name: string; era: Era; nextSessionAt: string | null; createdAt: string;
  _count: { cthulhuNpcs: number; cthulhuCombatants: number; cthulhuSessions: number };
}

export const ERA_LABEL: Record<Era, string> = { "1920s": "Década de 1920", modern: "Era Moderna", outro: "Outra Era" };

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data;
}
const BASE = "/api/cthulhu/campaigns";

export async function listCampaigns(): Promise<CthulhuCampaignSummary[]> {
  return (await jsonOrThrow(await fetch(BASE))).campaigns;
}
export async function getCampaign(id: string): Promise<CthulhuCampaign> {
  return (await jsonOrThrow(await fetch(`${BASE}/${id}`))).campaign;
}
export async function createCampaign(name: string, era: Era): Promise<string> {
  return (await jsonOrThrow(await fetch(BASE, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, era }),
  }))).id;
}
export async function deleteCampaign(id: string): Promise<void> {
  await jsonOrThrow(await fetch(`${BASE}/${id}`, { method: "DELETE" }));
}
export async function patchCampaign(
  id: string,
  data: Partial<{ name: string; era: Era; notes: string; nextSessionAt: string | null; story: Partial<CthulhuStory> }>,
): Promise<void> {
  await jsonOrThrow(await fetch(`${BASE}/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }));
}

export type ResourceName = "npcs" | "combatants" | "sessions" | "items" | "insanity" | "clues" | "clocks";

export async function createChild<T>(campaignId: string, resource: ResourceName, data: Record<string, unknown>): Promise<T> {
  return (await jsonOrThrow(await fetch(`${BASE}/${campaignId}/${resource}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }))).item;
}
export async function updateChild<T>(campaignId: string, resource: ResourceName, itemId: string, data: Record<string, unknown>): Promise<T> {
  return (await jsonOrThrow(await fetch(`${BASE}/${campaignId}/${resource}/${itemId}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }))).item;
}
export async function deleteChild(campaignId: string, resource: ResourceName, itemId: string): Promise<void> {
  await jsonOrThrow(await fetch(`${BASE}/${campaignId}/${resource}/${itemId}`, { method: "DELETE" }));
}
