"use client";

import { useCampaign, type CampaignApi, type CampaignState } from "@/lib/campaign/useCampaign";
import { ordemClient, type OrdemCampaign, type OrdemStory, type ResourceName } from "./ordemCampaignClient";

export type OperacaoApi = CampaignApi<OrdemCampaign, OrdemStory, ResourceName>;
export type OperacaoState = CampaignState<OrdemCampaign, OrdemStory, ResourceName>;

function blankStory(): OrdemStory {
  return {
    objective: "", hook: "", generalHistory: "",
    currentArc: "", mainThreat: "", membrana: "danificada",
  };
}

export function useOperacao(id: string): OperacaoState {
  return useCampaign(ordemClient, id, blankStory);
}
