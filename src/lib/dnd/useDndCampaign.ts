"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCampaign, patchCampaign, createChild, updateChild, deleteChild, importPc,
  type DndCampaign, type DndStory, type ResourceName,
} from "./dndCampaignClient";

const RESOURCE_KEY: Record<ResourceName, keyof DndCampaign> = {
  npcs: "dndNpcs", combatants: "dndCombatants", sessions: "dndSessions",
  items: "dndItems", clues: "dndClues", clocks: "dndClocks",
};

export interface DndApi {
  campaign: DndCampaign;
  patch: (data: Partial<{ name: string; notes: string; nextSessionAt: string | null; story: Partial<DndStory> }>) => Promise<void>;
  addChild: <T = unknown>(resource: ResourceName, data: Record<string, unknown>) => Promise<T>;
  editChild: (resource: ResourceName, id: string, data: Record<string, unknown>) => Promise<void>;
  removeChild: (resource: ResourceName, id: string) => Promise<void>;
  importAgent: (token: string) => Promise<string>;
}

export interface DndState { status: "loading" | "ready" | "notfound"; api: DndApi | null }

function blankStory(): DndStory {
  return { objective: "", purpose: "", generalHistory: "", currentArc: "", mainVillain: "" };
}

export function useDndCampaign(id: string): DndState {
  const [campaign, setCampaign] = useState<DndCampaign | null>(null);
  const [status, setStatus] = useState<DndState["status"]>("loading");

  useEffect(() => {
    let alive = true;
    getCampaign(id)
      .then((c) => { if (alive) { setCampaign(c); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("notfound"); });
    return () => { alive = false; };
  }, [id]);

  const patch: DndApi["patch"] = useCallback(async (data) => {
    await patchCampaign(id, data);
    setCampaign((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (data.name !== undefined) next.name = data.name;
      if (data.notes !== undefined) next.notes = data.notes;
      if (data.nextSessionAt !== undefined) next.nextSessionAt = data.nextSessionAt;
      if (data.story) next.dndStory = { ...(prev.dndStory ?? blankStory()), ...data.story };
      return next;
    });
  }, [id]);

  const addChild: DndApi["addChild"] = useCallback(async (resource, data) => {
    const item = await createChild<Record<string, unknown>>(id, resource, data);
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: [...(prev[RESOURCE_KEY[resource]] as unknown[]), item] }) as DndCampaign : prev);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return item as any;
  }, [id]);

  const editChild: DndApi["editChild"] = useCallback(async (resource, itemId, data) => {
    setCampaign((prev) => {
      if (!prev) return prev;
      const list = (prev[RESOURCE_KEY[resource]] as { id: string }[]).map((it) => (it.id === itemId ? { ...it, ...data } : it));
      return { ...prev, [RESOURCE_KEY[resource]]: list } as DndCampaign;
    });
    await updateChild(id, resource, itemId, data);
  }, [id]);

  const removeChild: DndApi["removeChild"] = useCallback(async (resource, itemId) => {
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: (prev[RESOURCE_KEY[resource]] as { id: string }[]).filter((it) => it.id !== itemId) }) as DndCampaign : prev);
    await deleteChild(id, resource, itemId);
  }, [id]);

  const importAgent: DndApi["importAgent"] = useCallback(async (token) => {
    const r = await importPc(id, token);
    setCampaign((prev) => prev ? { ...prev, dndCombatants: [...prev.dndCombatants, r.combatant] } : prev);
    return r.name;
  }, [id]);

  return { status, api: campaign ? { campaign, patch, addChild, editChild, removeChild, importAgent } : null };
}
