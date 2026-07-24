"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCampaign, patchCampaign, createChild, updateChild, deleteChild,
  type StarWarsCampaign, type StarWarsStory, type ResourceName,
} from "./starwarsCampaignClient";

const RESOURCE_KEY: Record<ResourceName, keyof StarWarsCampaign> = {
  npcs: "starWarsNpcs", combatants: "starWarsCombatants", sessions: "starWarsSessions",
  items: "starWarsItems", clues: "starWarsClues", clocks: "starWarsClocks",
};

export interface StarWarsApi {
  campaign: StarWarsCampaign;
  patch: (data: Partial<{ name: string; notes: string; nextSessionAt: string | null; story: Partial<StarWarsStory> }>) => Promise<void>;
  addChild: <T = unknown>(resource: ResourceName, data: Record<string, unknown>) => Promise<T>;
  editChild: (resource: ResourceName, id: string, data: Record<string, unknown>) => Promise<void>;
  removeChild: (resource: ResourceName, id: string) => Promise<void>;
}

export interface StarWarsState { status: "loading" | "ready" | "notfound"; api: StarWarsApi | null }

function blankStory(): StarWarsStory {
  return { objective: "", purpose: "", generalHistory: "", currentArc: "", mainVillain: "" };
}

export function useStarWarsCampaign(id: string): StarWarsState {
  const [campaign, setCampaign] = useState<StarWarsCampaign | null>(null);
  const [status, setStatus] = useState<StarWarsState["status"]>("loading");

  useEffect(() => {
    let alive = true;
    getCampaign(id)
      .then((c) => { if (alive) { setCampaign(c); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("notfound"); });
    return () => { alive = false; };
  }, [id]);

  const patch: StarWarsApi["patch"] = useCallback(async (data) => {
    await patchCampaign(id, data);
    setCampaign((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (data.name !== undefined) next.name = data.name;
      if (data.notes !== undefined) next.notes = data.notes;
      if (data.nextSessionAt !== undefined) next.nextSessionAt = data.nextSessionAt;
      if (data.story) next.starWarsStory = { ...(prev.starWarsStory ?? blankStory()), ...data.story };
      return next;
    });
  }, [id]);

  const addChild: StarWarsApi["addChild"] = useCallback(async (resource, data) => {
    const item = await createChild<Record<string, unknown>>(id, resource, data);
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: [...(prev[RESOURCE_KEY[resource]] as unknown[]), item] }) as StarWarsCampaign : prev);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return item as any;
  }, [id]);

  const editChild: StarWarsApi["editChild"] = useCallback(async (resource, itemId, data) => {
    setCampaign((prev) => {
      if (!prev) return prev;
      const list = (prev[RESOURCE_KEY[resource]] as { id: string }[]).map((it) => (it.id === itemId ? { ...it, ...data } : it));
      return { ...prev, [RESOURCE_KEY[resource]]: list } as StarWarsCampaign;
    });
    await updateChild(id, resource, itemId, data);
  }, [id]);

  const removeChild: StarWarsApi["removeChild"] = useCallback(async (resource, itemId) => {
    setCampaign((prev) => prev ? ({ ...prev, [RESOURCE_KEY[resource]]: (prev[RESOURCE_KEY[resource]] as { id: string }[]).filter((it) => it.id !== itemId) }) as StarWarsCampaign : prev);
    await deleteChild(id, resource, itemId);
  }, [id]);

  return { status, api: campaign ? { campaign, patch, addChild, editChild, removeChild } : null };
}
