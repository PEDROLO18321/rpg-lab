// ─── STAR WARS: ALÉM DA FRONTEIRA — Mestre: cliente de dados (API DB) ────────
export interface NPCAttack { name: string; bonus: string; damage: string; description: string }
export interface NPCSkill { skillId: string; value: number }

export interface StarWarsNpc {
  id: string; name: string; species: string; role: string; description: string;
  personality: string; notes: string; pv: number | null;
  agi: number | null; int: number | null; forca: number | null;
  vig: number | null; pre: number | null; sen: number | null; attacks: string;
  skills: string;
}

export interface StarWarsCombatant {
  id: string; characterId: string | null; name: string; initiative: number;
  pv: number | null; maxPv: number | null; pe: number | null; maxPe: number | null;
  conditions: string; isPlayer: boolean; order: number;
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
  starWarsStory: StarWarsStory | null;
  starWarsNpcs: StarWarsNpc[];
  starWarsCombatants: StarWarsCombatant[];
  starWarsSessions: StarWarsGameSession[];
  starWarsItems: StarWarsCampaignItem[];
  starWarsClues: StarWarsClue[];
  starWarsClocks: StarWarsClock[];
}

export interface StarWarsCampaignSummary {
  id: string; name: string; nextSessionAt: string | null; createdAt: string;
  _count: { starWarsNpcs: number; starWarsCombatants: number; starWarsSessions: number };
}

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data;
}
const BASE = "/api/starwars/campaigns";

export async function listCampaigns(): Promise<StarWarsCampaignSummary[]> {
  return (await jsonOrThrow(await fetch(BASE))).campaigns;
}
export async function getCampaign(id: string): Promise<StarWarsCampaign> {
  return (await jsonOrThrow(await fetch(`${BASE}/${id}`))).campaign;
}
export async function createCampaign(name: string): Promise<string> {
  return (await jsonOrThrow(await fetch(BASE, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
  }))).id;
}
export async function deleteCampaign(id: string): Promise<void> {
  await jsonOrThrow(await fetch(`${BASE}/${id}`, { method: "DELETE" }));
}
export async function patchCampaign(
  id: string,
  data: Partial<{ name: string; notes: string; nextSessionAt: string | null; story: Partial<StarWarsStory> }>,
): Promise<void> {
  await jsonOrThrow(await fetch(`${BASE}/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  }));
}

export type ResourceName = "npcs" | "combatants" | "sessions" | "items" | "clues" | "clocks";

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
