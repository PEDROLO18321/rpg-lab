export interface CthulhuNPCAttack {
  name: string;
  skill: string;
  damage: string;
  description: string;
}

export interface CthulhuNPC {
  id: string;
  name: string;
  occupation: string;
  age: number | null;
  gender: string;
  nationality: string;
  description: string;
  personality: string;
  mythosTies: string;
  notes: string;
  str: number | null;
  con: number | null;
  siz: number | null;
  dex: number | null;
  int: number | null;
  pow: number | null;
  app: number | null;
  edu: number | null;
  hp: number | null;
  san: number | null;
  attacks: CthulhuNPCAttack[];
}

export interface CthulhuCombatant {
  id: string;
  name: string;
  dex: number;
  hp: number | null;
  maxHp: number | null;
  san: number | null;
  maxSan: number | null;
  isPlayer: boolean;
}

export interface CthulhuSession {
  id: string;
  number: number;
  name: string;
  objective: string;
  events: string;
  summary: string;
  sessionDate: string;
}

export interface CthulhuItem {
  id: string;
  name: string;
  description: string;
  type: "tomo" | "artefato" | "arma" | "equipamento" | "misc";
  mythos: boolean;
  sessionId: string | null;
}

export interface CthulhuStoryData {
  objective: string;
  hook: string;
  generalHistory: string;
  currentArc: string;
  mainCult: string;
}

export interface CthulhuInsanityRecord {
  id: string;
  investigatorName: string;
  currentSan: number;
  maxSan: number;
  sessionLoss: number;
  status: "normal" | "temp_insane" | "indef_insane";
  phobias: string[];
  manias: string[];
  notes: string;
}

export interface CthulhuCampaign {
  id: string;
  name: string;
  era: "1920s" | "modern" | "outro";
  createdAt: string;
  npcs: CthulhuNPC[];
  combatants: CthulhuCombatant[];
  notes: string;
  story?: CthulhuStoryData;
  sessions?: CthulhuSession[];
  items?: CthulhuItem[];
  insanityRecords?: CthulhuInsanityRecord[];
}

const KEY = "cthulhu_guardian_campaigns";

function load(): CthulhuCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CthulhuCampaign[]) : [];
  } catch {
    return [];
  }
}

function persist(campaigns: CthulhuCampaign[]): void {
  localStorage.setItem(KEY, JSON.stringify(campaigns));
}

export function getCthulhuCampaigns(): CthulhuCampaign[] {
  return load();
}

export function getCthulhuCampaign(id: string): CthulhuCampaign | null {
  return load().find((c) => c.id === id) ?? null;
}

export function saveCthulhuCampaign(campaign: CthulhuCampaign): void {
  const all = load();
  const idx = all.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) all[idx] = campaign;
  else all.push(campaign);
  persist(all);
}

export function createCthulhuCampaign(name: string, era: CthulhuCampaign["era"]): CthulhuCampaign {
  const campaign: CthulhuCampaign = {
    id: crypto.randomUUID(),
    name: name.trim(),
    era,
    createdAt: new Date().toISOString(),
    npcs: [],
    combatants: [],
    notes: "",
  };
  saveCthulhuCampaign(campaign);
  return campaign;
}

export function deleteCthulhuCampaign(id: string): void {
  persist(load().filter((c) => c.id !== id));
}
