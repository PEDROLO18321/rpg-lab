"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCampaign, patchCampaign, createChild, updateChild, deleteChild, importPc,
  type OrdemCampaign, type OrdemStory, type ResourceName, type Tier,
} from "./ordemCampaignClient";

const RESOURCE_KEY: Record<ResourceName, keyof OrdemCampaign> = {
  npcs: "ordemNpcs",
  combatants: "ordemCombatants",
  sessions: "ordemSessions",
  items: "ordemItems",
  sanity: "ordemSanity",
  clues: "ordemClues",
  clocks: "ordemClocks",
  rewards: "ordemRewards",
};

export interface OperacaoApi {
  campaign: OrdemCampaign;
  patch: (data: Partial<{ name: string; tier: Tier; notes: string; nextSessionAt: string | null; story: Partial<OrdemStory> }>) => Promise<void>;
  addChild: <T = unknown>(resource: ResourceName, data: Record<string, unknown>) => Promise<T>;
  editChild: (resource: ResourceName, id: string, data: Record<string, unknown>) => Promise<void>;
  removeChild: (resource: ResourceName, id: string) => Promise<void>;
  importAgent: (token: string) => Promise<string>;
  setLocal: (updater: (c: OrdemCampaign) => OrdemCampaign) => void;
}

export interface OperacaoState {
  status: "loading" | "ready" | "notfound";
  api: OperacaoApi | null;
}

export function useOperacao(id: string): OperacaoState {
  const [campaign, setCampaign] = useState<OrdemCampaign | null>(null);
  const [status, setStatus] = useState<OperacaoState["status"]>("loading");

  useEffect(() => {
    let alive = true;
    getCampaign(id)
      .then((c) => { if (alive) { setCampaign(c); setStatus("ready"); } })
      .catch(() => { if (alive) setStatus("notfound"); });
    return () => { alive = false; };
  }, [id]);

  const setLocal = useCallback((updater: (c: OrdemCampaign) => OrdemCampaign) => {
    setCampaign((prev) => (prev ? updater(prev) : prev));
  }, []);

  const patch: OperacaoApi["patch"] = useCallback(async (data) => {
    await patchCampaign(id, data);
    setCampaign((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      if (data.name !== undefined) next.name = data.name;
      if (data.tier !== undefined) next.tier = data.tier;
      if (data.notes !== undefined) next.notes = data.notes;
      if (data.nextSessionAt !== undefined) next.nextSessionAt = data.nextSessionAt;
      if (data.story) next.ordemStory = { ...(prev.ordemStory ?? blankStory()), ...data.story };
      return next;
    });
  }, [id]);

  const addChild: OperacaoApi["addChild"] = useCallback(async (resource, data) => {
    const item = await createChild<Record<string, unknown>>(id, resource, data);
    setCampaign((prev) => {
      if (!prev) return prev;
      const key = RESOURCE_KEY[resource];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...prev, [key]: [...(prev[key] as any[]), item] } as OrdemCampaign;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return item as any;
  }, [id]);

  const editChild: OperacaoApi["editChild"] = useCallback(async (resource, itemId, data) => {
    // Otimista: aplica local imediatamente.
    setCampaign((prev) => {
      if (!prev) return prev;
      const key = RESOURCE_KEY[resource];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list = (prev[key] as any[]).map((it) => (it.id === itemId ? { ...it, ...data } : it));
      return { ...prev, [key]: list } as OrdemCampaign;
    });
    await updateChild(id, resource, itemId, data);
  }, [id]);

  const removeChild: OperacaoApi["removeChild"] = useCallback(async (resource, itemId) => {
    setCampaign((prev) => {
      if (!prev) return prev;
      const key = RESOURCE_KEY[resource];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...prev, [key]: (prev[key] as any[]).filter((it) => it.id !== itemId) } as OrdemCampaign;
    });
    await deleteChild(id, resource, itemId);
  }, [id]);

  const importAgent: OperacaoApi["importAgent"] = useCallback(async (token) => {
    const r = await importPc(id, token);
    setCampaign((prev) => prev ? {
      ...prev,
      ordemCombatants: [...prev.ordemCombatants, r.combatant],
      ordemSanity: [...prev.ordemSanity, r.sanity],
    } : prev);
    return r.name;
  }, [id]);

  return {
    status,
    api: campaign ? { campaign, patch, addChild, editChild, removeChild, importAgent, setLocal } : null,
  };
}

function blankStory(): OrdemStory {
  return { objective: "", hook: "", generalHistory: "", currentArc: "", mainThreat: "", membrana: "danificada" };
}
