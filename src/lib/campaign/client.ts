// ─── Cliente HTTP genérico da área do Mestre ─────────────────────────────────
// Os cinco sistemas falam com as mesmas rotas (/api/campaigns/<sistema>/…).
// Cada sistema só amarra os próprios tipos via `campaignClient<…>("dnd")`.
import type { SystemKey } from "@/lib/campaign/registry";

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Erro na requisição.");
  return data;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/** Contadores normalizados exibidos na lista de campanhas. */
export interface CampaignCounts {
  npcs: number;
  combatants: number;
  sessions: number;
}

export function campaignClient<TCampaign, TSummary, TResource extends string, TCreate = void>(
  system: SystemKey,
) {
  const BASE = `/api/campaigns/${system}`;

  return {
    async listCampaigns(): Promise<TSummary[]> {
      return (await jsonOrThrow(await fetch(BASE))).campaigns;
    },

    async getCampaign(id: string): Promise<TCampaign> {
      return (await jsonOrThrow(await fetch(`${BASE}/${id}`))).campaign;
    },

    async createCampaign(name: string, extra?: TCreate): Promise<string> {
      return (await jsonOrThrow(await fetch(BASE, {
        method: "POST", headers: JSON_HEADERS,
        body: JSON.stringify({ name, ...(extra ?? {}) }),
      }))).id;
    },

    async deleteCampaign(id: string): Promise<void> {
      await jsonOrThrow(await fetch(`${BASE}/${id}`, { method: "DELETE" }));
    },

    async patchCampaign(id: string, data: Record<string, unknown>): Promise<void> {
      await jsonOrThrow(await fetch(`${BASE}/${id}`, {
        method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(data),
      }));
    },

    async createChild<T>(campaignId: string, resource: TResource, data: Record<string, unknown>): Promise<T> {
      return (await jsonOrThrow(await fetch(`${BASE}/${campaignId}/${resource}`, {
        method: "POST", headers: JSON_HEADERS, body: JSON.stringify(data),
      }))).item;
    },

    async updateChild<T>(campaignId: string, resource: TResource, itemId: string, data: Record<string, unknown>): Promise<T> {
      return (await jsonOrThrow(await fetch(`${BASE}/${campaignId}/${resource}/${itemId}`, {
        method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(data),
      }))).item;
    },

    async deleteChild(campaignId: string, resource: TResource, itemId: string): Promise<void> {
      await jsonOrThrow(await fetch(`${BASE}/${campaignId}/${resource}/${itemId}`, { method: "DELETE" }));
    },
  };
}
