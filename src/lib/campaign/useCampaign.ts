"use client";

// ─── Hook genérico da área do Mestre ─────────────────────────────────────────
// Carrega a campanha e aplica alterações otimistas. Como a API entrega a
// campanha normalizada (`story`, `npcs`, `combatants`…), a chave do sub-recurso
// é o próprio nome do recurso — não é preciso mapear nomes por sistema.
import { useCallback, useEffect, useState } from "react";

/** Só o que o hook consome do cliente — desacopla dos genéricos de campaignClient. */
export interface CampaignDataClient<TCampaign, TResource extends string> {
  getCampaign(id: string): Promise<TCampaign>;
  patchCampaign(id: string, data: Record<string, unknown>): Promise<void>;
  createChild<T>(campaignId: string, resource: TResource, data: Record<string, unknown>): Promise<T>;
  updateChild<T>(campaignId: string, resource: TResource, itemId: string, data: Record<string, unknown>): Promise<T>;
  deleteChild(campaignId: string, resource: TResource, itemId: string): Promise<void>;
}

export interface CampaignApi<TCampaign, TStory, TResource extends string> {
  campaign: TCampaign;
  patch: (data: Record<string, unknown> & { story?: Partial<TStory> }) => Promise<void>;
  addChild: <T = unknown>(resource: TResource, data: Record<string, unknown>) => Promise<T>;
  editChild: (resource: TResource, id: string, data: Record<string, unknown>) => Promise<void>;
  removeChild: (resource: TResource, id: string) => Promise<void>;
}

export interface CampaignState<TCampaign, TStory, TResource extends string> {
  status: "loading" | "ready" | "notfound";
  api: CampaignApi<TCampaign, TStory, TResource> | null;
}

type Bag = Record<string, unknown>;

export function useCampaign<TCampaign, TStory, TResource extends string>(
  client: CampaignDataClient<TCampaign, TResource>,
  id: string,
  blankStory: () => TStory,
): CampaignState<TCampaign, TStory, TResource> {
  const [campaign, setCampaign] = useState<TCampaign | null>(null);
  const [status, setStatus] = useState<CampaignState<TCampaign, TStory, TResource>["status"]>("loading");

  useEffect(() => {
    let alive = true;
    client.getCampaign(id)
      .then((c) => { if (alive) { setCampaign(c); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("notfound"); });
    return () => { alive = false; };
  }, [client, id]);

  /** Aplica uma alteração na cópia local da campanha. */
  const mutate = useCallback((fn: (prev: Bag) => Bag) => {
    setCampaign((prev) => (prev ? (fn(prev as Bag) as TCampaign) : prev));
  }, []);

  const patch = useCallback<CampaignApi<TCampaign, TStory, TResource>["patch"]>(async (data) => {
    await client.patchCampaign(id, data);
    const { story, ...rest } = data;
    mutate((prev) => {
      const next: Bag = { ...prev, ...rest };
      if (story) next.story = { ...((prev.story as TStory) ?? blankStory()), ...story };
      return next;
    });
  }, [client, id, blankStory, mutate]);

  const addChild = useCallback<CampaignApi<TCampaign, TStory, TResource>["addChild"]>(async (resource, data) => {
    const item = await client.createChild<Bag>(id, resource, data);
    mutate((prev) => ({ ...prev, [resource]: [...((prev[resource] as unknown[]) ?? []), item] }));
    return item as never;
  }, [client, id, mutate]);

  const editChild = useCallback<CampaignApi<TCampaign, TStory, TResource>["editChild"]>(async (resource, itemId, data) => {
    mutate((prev) => ({
      ...prev,
      [resource]: ((prev[resource] as { id: string }[]) ?? []).map((it) => (it.id === itemId ? { ...it, ...data } : it)),
    }));
    await client.updateChild(id, resource, itemId, data);
  }, [client, id, mutate]);

  const removeChild = useCallback<CampaignApi<TCampaign, TStory, TResource>["removeChild"]>(async (resource, itemId) => {
    mutate((prev) => ({
      ...prev,
      [resource]: ((prev[resource] as { id: string }[]) ?? []).filter((it) => it.id !== itemId),
    }));
    await client.deleteChild(id, resource, itemId);
  }, [client, id, mutate]);

  return {
    status,
    api: campaign ? { campaign, patch, addChild, editChild, removeChild } : null,
  };
}
