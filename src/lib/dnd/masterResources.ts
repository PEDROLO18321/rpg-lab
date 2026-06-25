// ─── D&D 5e — Mestre: sub-recursos da campanha ───────────────────────────────
export interface ResourceConfig {
  delegate: "dndNpc" | "dndCombatant" | "dndGameSession" | "dndCampaignItem" | "dndClue" | "dndClock";
  fields: string[];
}

export const DND_RESOURCES: Record<string, ResourceConfig> = {
  npcs: {
    delegate: "dndNpc",
    fields: ["name", "race", "role", "alignment", "trait", "appearance", "notes",
      "hp", "ac", "str", "dex", "con", "int", "wis", "cha", "attacks"],
  },
  combatants: {
    delegate: "dndCombatant",
    fields: ["characterId", "name", "initiative", "hp", "maxHp", "tempHp", "ac",
      "conditions", "concentration", "isPlayer", "order"],
  },
  sessions: {
    delegate: "dndGameSession",
    fields: ["number", "name", "objective", "events", "summary", "sessionDate"],
  },
  items: {
    delegate: "dndCampaignItem",
    fields: ["name", "description", "type", "rarity", "sessionId"],
  },
  clues: {
    delegate: "dndClue",
    fields: ["title", "content", "source", "discovered", "sessionId"],
  },
  clocks: {
    delegate: "dndClock",
    fields: ["name", "segments", "filled", "kind", "notes"],
  },
};

export const DND_INCLUDE = {
  dndStory: true,
  dndNpcs: { orderBy: { createdAt: "asc" } },
  dndCombatants: { orderBy: { order: "asc" } },
  dndSessions: { orderBy: { number: "asc" } },
  dndItems: true,
  dndClues: { orderBy: { createdAt: "asc" } },
  dndClocks: { orderBy: { createdAt: "asc" } },
} as const;

export const DND_STORY_FIELDS = ["objective", "purpose", "generalHistory", "currentArc", "mainVillain"];
