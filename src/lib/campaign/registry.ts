// ─── Registro de campanhas por sistema ───────────────────────────────────────
// A *mecânica* da área do Mestre (listar, criar, editar, sub-recursos) é a mesma
// nos cinco sistemas; o que muda é a configuração: nomes de relação no Prisma,
// quais sub-recursos existem e quais campos cada um aceita. Essa variação é
// dado, não código — fica toda aqui, e as rotas/cliente são genéricos.

export type SystemKey = "dnd" | "tormenta" | "ordem" | "cthulhu" | "starwars";

export interface ResourceConfig {
  /** Delegate do PrismaClient, ex.: prisma.dndNpc. */
  delegate: string;
  /** Relação em Campaign, ex.: dndNpcs. */
  relation: string;
  /** Whitelist de campos aceitos em POST/PATCH. */
  fields: string[];
  orderBy?: Record<string, "asc" | "desc">;
}

export interface CampaignConfig {
  /** Slug do System no banco. */
  slug: string;
  label: string;
  /** Relação da história, ex.: dndStory. */
  storyRelation: string;
  storyFields: string[];
  /** Campos extras da própria campanha, além de name/notes/nextSessionAt. */
  enumFields?: Record<string, readonly string[]>;
  resources: Record<string, ResourceConfig>;
  /** Sub-recursos contados na listagem de campanhas. */
  counts: readonly ["npcs", "combatants", "sessions"];
}

const BY_CREATED = { createdAt: "asc" } as const;
const BY_ORDER = { order: "asc" } as const;
const BY_NUMBER = { number: "asc" } as const;

const SESSION_FIELDS = ["number", "name", "objective", "events", "summary", "sessionDate"];
const CLUE_FIELDS = ["title", "content", "source", "discovered", "sessionId"];
const CLOCK_FIELDS = ["name", "segments", "filled", "kind", "notes"];

export const CAMPAIGNS: Record<SystemKey, CampaignConfig> = {
  dnd: {
    slug: "dnd",
    label: "D&D 5e",
    storyRelation: "dndStory",
    storyFields: ["objective", "purpose", "generalHistory", "currentArc", "mainVillain"],
    counts: ["npcs", "combatants", "sessions"],
    resources: {
      npcs: {
        delegate: "dndNpc", relation: "dndNpcs", orderBy: BY_CREATED,
        fields: ["name", "race", "role", "alignment", "trait", "appearance", "notes",
          "hp", "ac", "str", "dex", "con", "int", "wis", "cha", "attacks"],
      },
      combatants: {
        delegate: "dndCombatant", relation: "dndCombatants", orderBy: BY_ORDER,
        fields: ["characterId", "name", "initiative", "hp", "maxHp", "tempHp", "ac",
          "conditions", "concentration", "isPlayer", "order"],
      },
      sessions: { delegate: "dndGameSession", relation: "dndSessions", orderBy: BY_NUMBER, fields: SESSION_FIELDS },
      items: {
        delegate: "dndCampaignItem", relation: "dndItems",
        fields: ["name", "description", "type", "rarity", "sessionId"],
      },
      clues: { delegate: "dndClue", relation: "dndClues", orderBy: BY_CREATED, fields: CLUE_FIELDS },
      clocks: { delegate: "dndClock", relation: "dndClocks", orderBy: BY_CREATED, fields: CLOCK_FIELDS },
    },
  },

  tormenta: {
    slug: "tormenta20",
    label: "Tormenta 20",
    storyRelation: "tormentaStory",
    storyFields: ["objective", "purpose", "generalHistory", "currentArc", "mainVillain"],
    counts: ["npcs", "combatants", "sessions"],
    resources: {
      npcs: {
        delegate: "tormentaNpc", relation: "tormentaNpcs", orderBy: BY_CREATED,
        fields: ["name", "race", "role", "description", "personality", "notes",
          "pv", "defense", "forca", "des", "con", "int", "sab", "car", "attacks"],
      },
      combatants: {
        delegate: "tormentaCombatant", relation: "tormentaCombatants", orderBy: BY_ORDER,
        fields: ["characterId", "name", "initiative", "pv", "maxPv", "pm", "maxPm",
          "defense", "conditions", "isPlayer", "order"],
      },
      sessions: { delegate: "tormentaGameSession", relation: "tormentaSessions", orderBy: BY_NUMBER, fields: SESSION_FIELDS },
      items: {
        delegate: "tormentaCampaignItem", relation: "tormentaItems",
        fields: ["name", "description", "type", "rarity", "sessionId"],
      },
      clues: { delegate: "tormentaClue", relation: "tormentaClues", orderBy: BY_CREATED, fields: CLUE_FIELDS },
      clocks: { delegate: "tormentaClock", relation: "tormentaClocks", orderBy: BY_CREATED, fields: CLOCK_FIELDS },
    },
  },

  cthulhu: {
    slug: "cthulhu",
    label: "Call of Cthulhu",
    storyRelation: "cthulhuStory",
    storyFields: ["objective", "hook", "generalHistory", "currentArc", "mainCult"],
    enumFields: { era: ["1920s", "modern", "outro"] },
    counts: ["npcs", "combatants", "sessions"],
    resources: {
      npcs: {
        delegate: "cthulhuNpc", relation: "cthulhuNpcs", orderBy: BY_CREATED,
        fields: ["name", "occupation", "age", "gender", "nationality", "description",
          "personality", "mythosTies", "notes",
          "str", "con", "siz", "dex", "int", "pow", "app", "edu", "hp", "san", "attacks"],
      },
      combatants: {
        delegate: "cthulhuCombatant", relation: "cthulhuCombatants", orderBy: BY_ORDER,
        fields: ["characterId", "name", "dex", "hp", "maxHp", "san", "maxSan", "mp", "maxMp",
          "conditions", "isPlayer", "order"],
      },
      sessions: { delegate: "cthulhuGameSession", relation: "cthulhuSessions", orderBy: BY_NUMBER, fields: SESSION_FIELDS },
      items: {
        delegate: "cthulhuCampaignItem", relation: "cthulhuItems",
        fields: ["name", "description", "type", "mythos", "sessionId"],
      },
      insanity: {
        delegate: "cthulhuInsanityRecord", relation: "cthulhuInsanity",
        fields: ["characterId", "investigatorName", "currentSan", "maxSan", "sessionLoss",
          "status", "phobias", "manias", "notes"],
      },
      clues: { delegate: "cthulhuClue", relation: "cthulhuClues", orderBy: BY_CREATED, fields: CLUE_FIELDS },
      clocks: { delegate: "cthulhuClock", relation: "cthulhuClocks", orderBy: BY_CREATED, fields: CLOCK_FIELDS },
    },
  },

  ordem: {
    slug: "ordem",
    label: "Ordem Paranormal",
    storyRelation: "ordemStory",
    storyFields: ["objective", "hook", "generalHistory", "currentArc", "mainThreat", "membrana"],
    enumFields: { tier: ["1", "2", "3", "4"] },
    counts: ["npcs", "combatants", "sessions"],
    resources: {
      npcs: {
        delegate: "ordemNpc", relation: "ordemNpcs", orderBy: BY_CREATED,
        fields: ["name", "role", "age", "gender", "affiliation", "description",
          "personality", "paranormalTies", "notes",
          "agi", "forca", "int", "pre", "vig", "pv", "pe", "san", "defense", "attacks"],
      },
      combatants: {
        delegate: "ordemCombatant", relation: "ordemCombatants", orderBy: BY_ORDER,
        fields: ["characterId", "name", "init", "pv", "maxPv", "pe", "maxPe",
          "san", "maxSan", "rd", "isPlayer", "conditions", "order"],
      },
      sessions: { delegate: "ordemGameSession", relation: "ordemSessions", orderBy: BY_NUMBER, fields: SESSION_FIELDS },
      items: {
        delegate: "ordemItem", relation: "ordemItems",
        fields: ["name", "description", "type", "paranormal", "sessionId"],
      },
      sanity: {
        delegate: "ordemSanityRecord", relation: "ordemSanity",
        fields: ["characterId", "agentName", "currentSan", "maxSan", "sessionLoss",
          "status", "traumas", "notes"],
      },
      clues: { delegate: "ordemClue", relation: "ordemClues", orderBy: BY_CREATED, fields: CLUE_FIELDS },
      clocks: { delegate: "ordemClock", relation: "ordemClocks", orderBy: BY_CREATED, fields: CLOCK_FIELDS },
      rewards: {
        delegate: "ordemReward", relation: "ordemRewards", orderBy: { createdAt: "desc" },
        fields: ["characterId", "agentName", "prestige", "reason", "sessionId"],
      },
    },
  },

  starwars: {
    slug: "starwars",
    label: "Star Wars",
    storyRelation: "starWarsStory",
    storyFields: ["objective", "purpose", "generalHistory", "currentArc", "mainVillain"],
    counts: ["npcs", "combatants", "sessions"],
    resources: {
      npcs: {
        delegate: "starWarsNpc", relation: "starWarsNpcs", orderBy: BY_CREATED,
        fields: ["name", "species", "role", "description", "personality", "notes",
          "pv", "agi", "int", "forca", "vig", "pre", "sen", "attacks", "skills"],
      },
      combatants: {
        delegate: "starWarsCombatant", relation: "starWarsCombatants", orderBy: BY_ORDER,
        fields: ["characterId", "name", "initiative", "pv", "maxPv", "pe", "maxPe",
          "conditions", "isPlayer", "order"],
      },
      sessions: { delegate: "starWarsGameSession", relation: "starWarsSessions", orderBy: BY_NUMBER, fields: SESSION_FIELDS },
      items: {
        delegate: "starWarsCampaignItem", relation: "starWarsItems",
        fields: ["name", "description", "type", "rarity", "sessionId"],
      },
      clues: { delegate: "starWarsClue", relation: "starWarsClues", orderBy: BY_CREATED, fields: CLUE_FIELDS },
      clocks: { delegate: "starWarsClock", relation: "starWarsClocks", orderBy: BY_CREATED, fields: CLOCK_FIELDS },
    },
  },
};

export function isSystemKey(v: string): v is SystemKey {
  return Object.prototype.hasOwnProperty.call(CAMPAIGNS, v);
}
