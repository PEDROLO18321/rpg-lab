"use client";

import { useCampaign, type CampaignApi, type CampaignState } from "@/lib/campaign/useCampaign";
import { dndClient, type DndCampaign, type DndStory, type ResourceName } from "./dndCampaignClient";

export type DndApi = CampaignApi<DndCampaign, DndStory, ResourceName>;
export type DndState = CampaignState<DndCampaign, DndStory, ResourceName>;

function blankStory(): DndStory {
  return { objective: "", purpose: "", generalHistory: "", currentArc: "", mainVillain: "" };
}

export function useDndCampaign(id: string): DndState {
  return useCampaign(dndClient, id, blankStory);
}
