// Tipos compartilhados do Bestiário Oficial de Mestre.
// Espelha o template obrigatório de StarWars-Teste/09-bestiario-regras.md §7.

export type ThreatLevel =
  | "Muito Fraco" | "Fraco" | "Médio" | "Forte" | "Elite"
  | "Chefe" | "Chefe Lendário" | "Ameaça Planetária" | "Ameaça Galáctica";

export type CombatRole =
  | "Dano" | "Tanque" | "Controle" | "Suporte"
  | "Furtivo/Assassino" | "Artilheiro à Distância" | "Enxame" | "Comandante";

export type CreatureSize = "Minúsculo" | "Pequeno" | "Médio" | "Grande" | "Enorme" | "Colossal";

export type CreatureType =
  | "Fauna" | "Humanoide" | "Droide" | "Criatura da Força"
  | "Besta Lendária" | "Enxame" | "Vegetal/Fungo" | "Sensitivo";

export type Intelligence = "Animal" | "Instintiva" | "Baixa" | "Média" | "Alta" | "Sobre-humana";

export type Disposition =
  | "Agressiva" | "Territorial" | "Furtiva" | "Oportunista"
  | "Leal" | "Selvagem" | "Calculista" | "Fanática" | "Protetora";

export type BestiaryBook =
  | "criaturas" | "jedi" | "sith" | "sensitivos"
  | "mandalorianos" | "militares" | "civis" | "fauna";

export const BOOK_LABEL: Record<BestiaryBook, string> = {
  criaturas: "Criaturas",
  jedi: "Jedi",
  sith: "Sith",
  sensitivos: "Sensitivos da Força",
  mandalorianos: "Mandalorianos",
  militares: "Militares",
  civis: "Civis",
  fauna: "Fauna por Planeta",
};

export interface CreatureAttack {
  name: string;
  range: string;
  hit: string;
  damage: string;
  damageType: string;
  cost: string;
  cooldown: string;
  effect: string;
}

export interface CreaturePower {
  name: string;
  /** Descrição + regra + recarga + duração + interações, como no texto original. */
  text: string;
}

export interface CreaturePassive {
  name: string;
  effect: string;
}

export interface CreatureAttrs {
  agi: number;
  int: number;
  forc: number;
  vig: number;
  pre: number;
  sen: number;
}

export interface StarWarsCreature {
  id: string;
  book: BestiaryBook;
  name: string;
  epithet?: string;
  category: string;
  faction: string;
  level: number;
  threat: ThreatLevel;
  role: string;
  size: CreatureSize;
  type: CreatureType;
  planet: string;
  environment: string;
  intelligence: Intelligence;
  disposition: string;
  pv: number;
  pe: number;
  defense: number;
  initiative: number;
  speed: string;
  attrs: CreatureAttrs;
  skills: string;
  attacks: CreatureAttack[];
  powers: CreaturePower[];
  passives: CreaturePassive[];
  ai: string;
  loot: string;
  lore: string;
}

/** Módulo de especialização (Jedi/Sith) ou loadout (Mandaloriano) — delta narrativo, não empilha. */
export interface CreatureModule {
  id: string;
  name: string;
  text: string;
}
