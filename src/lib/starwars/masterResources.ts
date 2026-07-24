// ─── STAR WARS: ALÉM DA FRONTEIRA — Mestre: sub-recursos da campanha ─────────
export interface ResourceConfig {
  delegate: "starWarsNpc" | "starWarsCombatant" | "starWarsGameSession" | "starWarsCampaignItem" | "starWarsClue" | "starWarsClock";
  fields: string[];
}

export const STARWARS_RESOURCES: Record<string, ResourceConfig> = {
  npcs: {
    delegate: "starWarsNpc",
    fields: ["name", "species", "role", "description", "personality", "notes",
      "pv", "agi", "int", "forca", "vig", "pre", "sen", "attacks"],
  },
  combatants: {
    delegate: "starWarsCombatant",
    fields: ["characterId", "name", "initiative", "pv", "maxPv", "pe", "maxPe",
      "conditions", "isPlayer", "order"],
  },
  sessions: {
    delegate: "starWarsGameSession",
    fields: ["number", "name", "objective", "events", "summary", "sessionDate"],
  },
  items: {
    delegate: "starWarsCampaignItem",
    fields: ["name", "description", "type", "rarity", "sessionId"],
  },
  clues: {
    delegate: "starWarsClue",
    fields: ["title", "content", "source", "discovered", "sessionId"],
  },
  clocks: {
    delegate: "starWarsClock",
    fields: ["name", "segments", "filled", "kind", "notes"],
  },
};

export const STARWARS_INCLUDE = {
  starWarsStory: true,
  starWarsNpcs: { orderBy: { createdAt: "asc" } },
  starWarsCombatants: { orderBy: { order: "asc" } },
  starWarsSessions: { orderBy: { number: "asc" } },
  starWarsItems: true,
  starWarsClues: { orderBy: { createdAt: "asc" } },
  starWarsClocks: { orderBy: { createdAt: "asc" } },
} as const;

export const STARWARS_STORY_FIELDS = ["objective", "purpose", "generalHistory", "currentArc", "mainVillain"];
