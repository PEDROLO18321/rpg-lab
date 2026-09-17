"use client";

import { useCampaign, type CampaignApi, type CampaignState } from "@/lib/campaign/useCampaign";
import { tormentaClient, type TormentaCampaign, type TormentaStory, type ResourceName } from "./tormentaCampaignClient";

export type TormentaApi = CampaignApi<TormentaCampaign, TormentaStory, ResourceName>;
export type TormentaState = CampaignState<TormentaCampaign, TormentaStory, ResourceName>;

function blankStory(): TormentaStory {
  return { objective: "", purpose: "", generalHistory: "", currentArc: "", mainVillain: "" };
}

export function useTormentaCampaign(id: string): TormentaState {
  return useCampaign(tormentaClient, id, blankStory);
}
