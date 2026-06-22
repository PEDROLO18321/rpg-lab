export interface NPCAttack {
  name: string;
  bonus: string;
  damage: string;
  description: string;
}

export interface NPC {
  id: string;
  name: string;
  race: string;
  role: string;
  alignment: string;
  trait: string;
  appearance: string;
  notes: string;
  hp: number | null;
  ac: number | null;
  str: number | null;
  dex: number | null;
  con: number | null;
  int: number | null;
  wis: number | null;
  cha: number | null;
  attacks: NPCAttack[];
}

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hp: number | null;
  maxHp: number | null;
  isPlayer: boolean;
}

export interface CampaignSession {
  id: string;
  number: number;
  name: string;
  objective: string;
  events: string;
  summary: string;
  sessionDate: string;
}

export interface CampaignItem {
  id: string;
  name: string;
  description: string;
  type: "arma" | "armadura" | "magia" | "consumível" | "misc";
  rarity: "comum" | "incomum" | "raro" | "muito raro" | "lendário";
  sessionId: string | null;
}

export interface CampaignStoryData {
  objective: string;
  purpose: string;
  generalHistory: string;
  currentArc: string;
}

export interface Campaign {
  id: string;
  name: string;
  createdAt: string;
  npcs: NPC[];
  combatants: Combatant[];
  notes: string;
  story?: CampaignStoryData;
  sessions?: CampaignSession[];
  items?: CampaignItem[];
}

const KEY = "dnd_mestre_campaigns";

function load(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Campaign[]) : [];
  } catch {
    return [];
  }
}

function persist(campaigns: Campaign[]): void {
  localStorage.setItem(KEY, JSON.stringify(campaigns));
}

export function getCampaigns(): Campaign[] {
  return load();
}

export function getCampaign(id: string): Campaign | null {
  return load().find((c) => c.id === id) ?? null;
}

export function saveCampaign(campaign: Campaign): void {
  const all = load();
  const idx = all.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) all[idx] = campaign;
  else all.push(campaign);
  persist(all);
}

export function createCampaign(name: string): Campaign {
  const campaign: Campaign = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    npcs: [],
    combatants: [],
    notes: "",
  };
  saveCampaign(campaign);
  return campaign;
}

export function deleteCampaign(id: string): void {
  persist(load().filter((c) => c.id !== id));
}
