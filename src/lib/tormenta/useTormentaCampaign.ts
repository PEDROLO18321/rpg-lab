"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCampaign, patchCampaign, createChild, updateChild, deleteChild,
  type TormentaCampaign, type TormentaStory, type ResourceName,
} from "./tormentaCampaignClient";

const RESOURCE_KEY: Record<ResourceName, keyof TormentaCampaign> = {
  npcs: "tormentaNpcs", combatants: "tormentaCombatants", sessions: "tormentaSessions",
  items: "tormentaItems", clues: "tormentaClues", clocks: "tormentaClocks",
};

export interface TormentaApi {
  campaign: TormentaCampaign;
  patch: (data: Partial<{ name: string; notes: string; nextSessionAt: string | null; story: Partial<TormentaStory> }>) => Promise<void>;
  addChild: <T = unknown>(resource: ResourceName, data: Record<string, unknown>) => Promise<T>;
  editChild: (resource: ResourceName, id: string, data: Record<string, unknown>) => Promise<void>;
  removeChild: (resource: ResourceName, id: string) => Promise<void>;
}

export interface TormentaState { status: "loading" | "ready" | "notfound"; api: TormentaApi | null }

function blankStory(): TormentaStory {
  return { objective: "", purpose: "", generalHistory: "", currentArc: "", mainVillain: "" };
}

export function useTormentaCampaign(id: string): TormentaState {
  const [campaign, setCampaign] = useState<TormentaCampaign | null>(null);
  const [status, setStatus] = useState<TormentaState["status"]>("loading");

  useEffect(() => {
    let alive = true;
    getCampaign(id)
      .then((c) => { if (alive) { setCampaign(c); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("notfound"); });
    return () => { alive = false; };
  }, [id]);

  const patch: TormentaApi["patch"] = useCallback(async (data) => {
    await patchCampaign(id, data);
    setCampaign((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (data.name !== undefined) next.name = data.name;
      if (data.notes !== undefined) next.notes = data.notes;
      if (data.nextSessionAt !== undefined) next.nextSessionAt = data.nextSessionAt;
      if (data.story) next.tormentaStory = { ...(prev.tormentaStory ?? blankStory()), ...data.story };
      return next;
    });
  }, [id]);

  const addChild: TormentaApi["addChild"] = useCallback(async (resource, data) => {
    const item = await createChild<Record<string, unknown>>(id, resource, data);
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: [...(prev[RESOURCE_KEY[resource]] as unknown[]), item] }) as TormentaCampaign : prev);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return item as any;
  }, [id]);

  const editChild: TormentaApi["editChild"] = useCallback(async (resource, itemId, data) => {
    setCampaign((prev) => {
      if (!prev) return prev;
      const list = (prev[RESOURCE_KEY[resource]] as { id: string }[]).map((it) => (it.id === itemId ? { ...it, ...data } : it));
      return { ...prev, [RESOURCE_KEY[resource]]: list } as TormentaCampaign;
    });
    await updateChild(id, resource, itemId, data);
  }, [id]);

  const removeChild: TormentaApi["removeChild"] = useCallback(async (resource, itemId) => {
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: (prev[RESOURCE_KEY[resource]] as { id: string }[]).filter((it) => it.id !== itemId) }) as TormentaCampaign : prev);
    await deleteChild(id, resource, itemId);
  }, [id]);

  return { status, api: campaign ? { campaign, patch, addChild, editChild, removeChild } : null };
}
