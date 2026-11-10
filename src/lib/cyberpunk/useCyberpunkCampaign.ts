"use client";

import { useCampaign, type CampaignApi, type CampaignState } from "@/lib/campaign/useCampaign";
import { cyberpunkClient, type CyberpunkCampaign, type CyberpunkStory, type ResourceName } from "./cyberpunkCampaignClient";

export type CyberpunkApi = CampaignApi<CyberpunkCampaign, CyberpunkStory, ResourceName>;
export type CyberpunkState = CampaignState<CyberpunkCampaign, CyberpunkStory, ResourceName>;

function blankStory(): CyberpunkStory {
  return { objective: "", purpose: "", generalHistory: "", currentArc: "", mainVillain: "" };
}

export function useCyberpunkCampaign(id: string): CyberpunkState {
  return useCampaign(cyberpunkClient, id, blankStory);
}
