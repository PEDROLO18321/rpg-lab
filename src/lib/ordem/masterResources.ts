// ─── ORDEM PARANORMAL — Mestre: configuração de sub-recursos da operação ──────
// Mapeia cada sub-recurso (npcs, combatants, …) ao delegate do Prisma e à lista
// de campos permitidos em create/update. As rotas usam isto de forma genérica.

export interface ResourceConfig {
  /** Nome do delegate no PrismaClient (ex.: prisma.ordemNpc). */
  delegate:
    | "ordemNpc"
    | "ordemCombatant"
    | "ordemGameSession"
    | "ordemItem"
    | "ordemSanityRecord"
    | "ordemClue"
    | "ordemClock"
    | "ordemReward";
  /** Campos aceitos em POST/PATCH (whitelist). */
  fields: string[];
}

export const MASTER_RESOURCES: Record<string, ResourceConfig> = {
  npcs: {
    delegate: "ordemNpc",
    fields: [
      "name", "role", "age", "gender", "affiliation", "description",
      "personality", "paranormalTies", "notes",
      "agi", "forca", "int", "pre", "vig", "pv", "pe", "san", "defense", "attacks",
    ],
  },
  combatants: {
    delegate: "ordemCombatant",
    fields: [
      "characterId", "name", "init", "pv", "maxPv", "pe", "maxPe",
      "san", "maxSan", "rd", "isPlayer", "conditions", "order",
    ],
  },
  sessions: {
    delegate: "ordemGameSession",
    fields: ["number", "name", "objective", "events", "summary", "sessionDate"],
  },
  items: {
    delegate: "ordemItem",
    fields: ["name", "description", "type", "paranormal", "sessionId"],
  },
  sanity: {
    delegate: "ordemSanityRecord",
    fields: [
      "characterId", "agentName", "currentSan", "maxSan",
      "sessionLoss", "status", "traumas", "notes",
    ],
  },
  clues: {
    delegate: "ordemClue",
    fields: ["title", "content", "source", "discovered", "sessionId"],
  },
  clocks: {
    delegate: "ordemClock",
    fields: ["name", "segments", "filled", "kind", "notes"],
  },
  rewards: {
    delegate: "ordemReward",
    fields: ["characterId", "agentName", "prestige", "reason", "sessionId"],
  },
};

/** Mantém só as chaves permitidas de um corpo de requisição. */
export function pickFields(body: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (body[f] !== undefined) out[f] = body[f];
  }
  return out;
}
