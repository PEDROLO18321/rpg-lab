"use client";

import { useCampaign, type CampaignApi, type CampaignState } from "@/lib/campaign/useCampaign";
import { cthulhuClient, type CthulhuCampaign, type CthulhuStory, type ResourceName } from "./cthulhuCampaignClient";

export type CthulhuApi = CampaignApi<CthulhuCampaign, CthulhuStory, ResourceName>;
export type CthulhuState = CampaignState<CthulhuCampaign, CthulhuStory, ResourceName>;

function blankStory(): CthulhuStory {
  return { objective: "", hook: "", generalHistory: "", currentArc: "", mainCult: "" };
}

export function useCthulhuCampaign(id: string): CthulhuState {
  return useCampaign(cthulhuClient, id, blankStory);
}
