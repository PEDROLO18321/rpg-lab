// ─── TORMENTA 20 — Mestre: cliente de dados (API DB) ─────────────────────────
export interface NPCAttack { name: string; bonus: string; damage: string; description: string }

export interface TormentaNpc {
  id: string; name: string; race: string; role: string; description: string;
  personality: string; notes: string; pv: number | null; defense: number | null;
  forca: number | null; des: number | null; con: number | null; int: number | null;
  sab: number | null; car: number | null; attacks: string; // JSON NPCAttack[]
}

export interface TormentaCombatant {
  id: string; characterId: string | null; name: string; initiative: number;
  pv: number | null; maxPv: number | null; pm: number | null; maxPm: number | null;
  defense: number | null; conditions: string; isPlayer: boolean; order: number;
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
  tormentaStory: TormentaStory | null;
  tormentaNpcs: TormentaNpc[];
  tormentaCombatants: TormentaCombatant[];
  tormentaSessions: TormentaGameSession[];
  tormentaItems: TormentaCampaignItem[];
  tormentaClues: TormentaClue[];
  tormentaClocks: TormentaClock[];
}

export interface TormentaCampaignSummary {
  id: string; name: string; nextSessionAt: string | null; createdAt: string;
  _count: { tormentaNpcs: number; tormentaCombatants: number; tormentaSessions: number };
}

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data;
}
const BASE = "/api/tormenta/campaigns";

export async function listCampaigns(): Promise<TormentaCampaignSummary[]> {
  return (await jsonOrThrow(await fetch(BASE))).campaigns;
}
export async function getCampaign(id: string): Promise<TormentaCampaign> {
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
  data: Partial<{ name: string; notes: string; nextSessionAt: string | null; story: Partial<TormentaStory> }>,
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
