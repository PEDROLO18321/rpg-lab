"use client";

import { useCampaign, type CampaignApi, type CampaignState } from "@/lib/campaign/useCampaign";
import { starWarsClient, type StarWarsCampaign, type StarWarsStory, type ResourceName } from "./starwarsCampaignClient";

export type StarWarsApi = CampaignApi<StarWarsCampaign, StarWarsStory, ResourceName>;
export type StarWarsState = CampaignState<StarWarsCampaign, StarWarsStory, ResourceName>;

function blankStory(): StarWarsStory {
  return { objective: "", purpose: "", generalHistory: "", currentArc: "", mainVillain: "" };
}

export function useStarWarsCampaign(id: string): StarWarsState {
  return useCampaign(starWarsClient, id, blankStory);
}
