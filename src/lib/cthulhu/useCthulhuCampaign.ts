"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCampaign, patchCampaign, createChild, updateChild, deleteChild,
  type CthulhuCampaign, type CthulhuStory, type ResourceName, type Era,
} from "./cthulhuCampaignClient";

const RESOURCE_KEY: Record<ResourceName, keyof CthulhuCampaign> = {
  npcs: "cthulhuNpcs", combatants: "cthulhuCombatants", sessions: "cthulhuSessions",
  items: "cthulhuItems", insanity: "cthulhuInsanity", clues: "cthulhuClues", clocks: "cthulhuClocks",
};

export interface CthulhuApi {
  campaign: CthulhuCampaign;
  patch: (data: Partial<{ name: string; era: Era; notes: string; nextSessionAt: string | null; story: Partial<CthulhuStory> }>) => Promise<void>;
  addChild: <T = unknown>(resource: ResourceName, data: Record<string, unknown>) => Promise<T>;
  editChild: (resource: ResourceName, id: string, data: Record<string, unknown>) => Promise<void>;
  removeChild: (resource: ResourceName, id: string) => Promise<void>;
}

export interface CthulhuState { status: "loading" | "ready" | "notfound"; api: CthulhuApi | null }

function blankStory(): CthulhuStory {
  return { objective: "", hook: "", generalHistory: "", currentArc: "", mainCult: "" };
}

export function useCthulhuCampaign(id: string): CthulhuState {
  const [campaign, setCampaign] = useState<CthulhuCampaign | null>(null);
  const [status, setStatus] = useState<CthulhuState["status"]>("loading");

  useEffect(() => {
    let alive = true;
    getCampaign(id)
      .then((c) => { if (alive) { setCampaign(c); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("notfound"); });
    return () => { alive = false; };
  }, [id]);

  const patch: CthulhuApi["patch"] = useCallback(async (data) => {
    await patchCampaign(id, data);
    setCampaign((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (data.name !== undefined) next.name = data.name;
      if (data.era !== undefined) next.era = data.era;
      if (data.notes !== undefined) next.notes = data.notes;
      if (data.nextSessionAt !== undefined) next.nextSessionAt = data.nextSessionAt;
      if (data.story) next.cthulhuStory = { ...(prev.cthulhuStory ?? blankStory()), ...data.story };
      return next;
    });
  }, [id]);

  const addChild: CthulhuApi["addChild"] = useCallback(async (resource, data) => {
    const item = await createChild<Record<string, unknown>>(id, resource, data);
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: [...(prev[RESOURCE_KEY[resource]] as unknown[]), item] }) as CthulhuCampaign : prev);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return item as any;
  }, [id]);

  const editChild: CthulhuApi["editChild"] = useCallback(async (resource, itemId, data) => {
    setCampaign((prev) => {
      if (!prev) return prev;
      const list = (prev[RESOURCE_KEY[resource]] as { id: string }[]).map((it) => (it.id === itemId ? { ...it, ...data } : it));
      return { ...prev, [RESOURCE_KEY[resource]]: list } as CthulhuCampaign;
    });
    await updateChild(id, resource, itemId, data);
  }, [id]);

  const removeChild: CthulhuApi["removeChild"] = useCallback(async (resource, itemId) => {
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: (prev[RESOURCE_KEY[resource]] as { id: string }[]).filter((it) => it.id !== itemId) }) as CthulhuCampaign : prev);
    await deleteChild(id, resource, itemId);
  }, [id]);

  return { status, api: campaign ? { campaign, patch, addChild, editChild, removeChild } : null };
}
