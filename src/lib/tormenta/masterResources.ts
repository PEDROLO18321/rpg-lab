// ─── TORMENTA 20 — Mestre: sub-recursos da campanha ──────────────────────────
export interface ResourceConfig {
  delegate: "tormentaNpc" | "tormentaCombatant" | "tormentaGameSession" | "tormentaCampaignItem" | "tormentaClue" | "tormentaClock";
  fields: string[];
}

export const TORMENTA_RESOURCES: Record<string, ResourceConfig> = {
  npcs: {
    delegate: "tormentaNpc",
    fields: ["name", "race", "role", "description", "personality", "notes",
      "pv", "defense", "forca", "des", "con", "int", "sab", "car", "attacks"],
  },
  combatants: {
    delegate: "tormentaCombatant",
    fields: ["characterId", "name", "initiative", "pv", "maxPv", "pm", "maxPm",
      "defense", "conditions", "isPlayer", "order"],
  },
  sessions: {
    delegate: "tormentaGameSession",
    fields: ["number", "name", "objective", "events", "summary", "sessionDate"],
  },
  items: {
    delegate: "tormentaCampaignItem",
    fields: ["name", "description", "type", "rarity", "sessionId"],
  },
  clues: {
    delegate: "tormentaClue",
    fields: ["title", "content", "source", "discovered", "sessionId"],
  },
  clocks: {
    delegate: "tormentaClock",
    fields: ["name", "segments", "filled", "kind", "notes"],
  },
};

export const TORMENTA_INCLUDE = {
  tormentaStory: true,
  tormentaNpcs: { orderBy: { createdAt: "asc" } },
  tormentaCombatants: { orderBy: { order: "asc" } },
  tormentaSessions: { orderBy: { number: "asc" } },
  tormentaItems: true,
  tormentaClues: { orderBy: { createdAt: "asc" } },
  tormentaClocks: { orderBy: { createdAt: "asc" } },
} as const;

export const TORMENTA_STORY_FIELDS = ["objective", "purpose", "generalHistory", "currentArc", "mainVillain"];
