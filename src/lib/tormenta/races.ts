export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type AbilityBonus = Partial<Record<AbilityKey, number>>;

export interface Subrace {
  id: string;
  name: string;
  description: string;
  bonus: AbilityBonus;
  traits: string[];
}

export interface RaceNames {
  male: string[];
  female: string[];
  family?: string[];
  childhood?: string[];
  honorific?: string[];
  nickname?: string[];
}

export interface Race {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseBonus: AbilityBonus;
  speed: number;
  size: "Pequeno" | "Médio";
  rarity: "comum" | "incomum";
  traits: string[];
  languages: string[];
  subraces: Subrace[];
  names: RaceNames;
}

export const RACES: Race[] = [
    
];