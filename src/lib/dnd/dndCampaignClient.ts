// ─── D&D 5e — Mestre: cliente de dados (API DB) ──────────────────────────────
export interface NPCAttack { name: string; bonus: string; damage: string; description: string }

export interface DndNpc {
  id: string; name: string; race: string; role: string; alignment: string; trait: string;
  appearance: string; notes: string; hp: number | null; ac: number | null;
  str: number | null; dex: number | null; con: number | null; int: number | null;
  wis: number | null; cha: number | null; attacks: string; // JSON NPCAttack[]
}

export interface DndCombatant {
  id: string; characterId: string | null; name: string; initiative: number;
  hp: number | null; maxHp: number | null; tempHp: number; ac: number | null;
  conditions: string; concentration: boolean; isPlayer: boolean; order: number;
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
  dndStory: DndStory | null;
  dndNpcs: DndNpc[];
  dndCombatants: DndCombatant[];
  dndSessions: DndGameSession[];
  dndItems: DndCampaignItem[];
  dndClues: DndClue[];
  dndClocks: DndClock[];
}

export interface DndCampaignSummary {
  id: string; name: string; nextSessionAt: string | null; createdAt: string;
  _count: { dndNpcs: number; dndCombatants: number; dndSessions: number };
}

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data;
}
const BASE = "/api/dnd/campaigns";

export async function listCampaigns(): Promise<DndCampaignSummary[]> {
  return (await jsonOrThrow(await fetch(BASE))).campaigns;
}
export async function getCampaign(id: string): Promise<DndCampaign> {
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
  data: Partial<{ name: string; notes: string; nextSessionAt: string | null; story: Partial<DndStory> }>,
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
export async function importPc(campaignId: string, token: string): Promise<{ combatant: DndCombatant; name: string }> {
  return jsonOrThrow(await fetch(`${BASE}/${campaignId}/import`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
  }));
}
