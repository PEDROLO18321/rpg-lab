// ─── Call of Cthulhu — Guardião: sub-recursos do cenário ─────────────────────
export interface ResourceConfig {
  delegate:
    | "cthulhuNpc" | "cthulhuCombatant" | "cthulhuGameSession"
    | "cthulhuCampaignItem" | "cthulhuInsanityRecord" | "cthulhuClue" | "cthulhuClock";
  fields: string[];
}

export const CTHULHU_RESOURCES: Record<string, ResourceConfig> = {
  npcs: {
    delegate: "cthulhuNpc",
    fields: ["name", "occupation", "age", "gender", "nationality", "description",
      "personality", "mythosTies", "notes",
      "str", "con", "siz", "dex", "int", "pow", "app", "edu", "hp", "san", "attacks"],
  },
  combatants: {
    delegate: "cthulhuCombatant",
    fields: ["characterId", "name", "dex", "hp", "maxHp", "san", "maxSan", "mp", "maxMp", "conditions", "isPlayer", "order"],
  },
  sessions: {
    delegate: "cthulhuGameSession",
    fields: ["number", "name", "objective", "events", "summary", "sessionDate"],
  },
  items: {
    delegate: "cthulhuCampaignItem",
    fields: ["name", "description", "type", "mythos", "sessionId"],
  },
  insanity: {
    delegate: "cthulhuInsanityRecord",
    fields: ["characterId", "investigatorName", "currentSan", "maxSan", "sessionLoss", "status", "phobias", "manias", "notes"],
  },
  clues: {
    delegate: "cthulhuClue",
    fields: ["title", "content", "source", "discovered", "sessionId"],
  },
  clocks: {
    delegate: "cthulhuClock",
    fields: ["name", "segments", "filled", "kind", "notes"],
  },
};

export const CTHULHU_INCLUDE = {
  cthulhuStory: true,
  cthulhuNpcs: { orderBy: { createdAt: "asc" } },
  cthulhuCombatants: { orderBy: { order: "asc" } },
  cthulhuSessions: { orderBy: { number: "asc" } },
  cthulhuItems: true,
  cthulhuInsanity: true,
  cthulhuClues: { orderBy: { createdAt: "asc" } },
  cthulhuClocks: { orderBy: { createdAt: "asc" } },
} as const;

export const CTHULHU_STORY_FIELDS = ["objective", "hook", "generalHistory", "currentArc", "mainCult"];
