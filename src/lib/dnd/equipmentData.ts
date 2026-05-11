export const SIMPLE_MELEE_WEAPONS = [
  "Adaga", "Azagaia", "Bordão", "Clava Grande", "Foice Curta",
  "Lança", "Maça", "Machadinha", "Martelo Leve", "Porrete",
];

export const SIMPLE_RANGED_WEAPONS = ["Arco Curto", "Beste Leve", "Dardo", "Funda"];
export const SIMPLE_WEAPONS = [...SIMPLE_MELEE_WEAPONS, ...SIMPLE_RANGED_WEAPONS];

export const MARTIAL_MELEE_WEAPONS = [
  "Alabarda", "Cimitarra", "Chicote", "Espada Curta", "Espada Grande",
  "Espada Longa", "Glaive", "Lança de Montaria", "Lança Longa",
  "Maça Estrela", "Machado Grande", "Machado de Batalha", "Malho",
  "Mangual", "Martelo de Guerra", "Picareta de Guerra", "Rapieira", "Tridente",
];

export const MARTIAL_RANGED_WEAPONS = [
  "Arco Longo", "Besta de Mão", "Besta Pesada", "Rede", "Zarabatana",
];

export const MARTIAL_WEAPONS = [...MARTIAL_MELEE_WEAPONS, ...MARTIAL_RANGED_WEAPONS];
export const ALL_WEAPONS = [...SIMPLE_WEAPONS, ...MARTIAL_WEAPONS];
export const MELEE_WEAPONS = [...SIMPLE_MELEE_WEAPONS, ...MARTIAL_MELEE_WEAPONS];

export const INSTRUMENTS = [
  "Alaúde", "Flauta", "Flauta de pã", "Gaita de foles", "Lira",
  "Oboé", "Tambor", "Trombeta", "Violino", "Xilofone",
];

export const ARCANE_FOCI = ["Bastão arcano", "Cajado arcano", "Cristal", "Orbe", "Varinha"];
export const DRUIDIC_FOCI = ["Ramo de visco", "Cajado druídico", "Totem", "Varinha de teixo"];

export const ARTISAN_TOOLS = [
  "Ferramentas de carpinteiro", "Ferramentas de cartógrafo", "Ferramentas de costureiro",
  "Ferramentas de coureiro", "Ferramentas de entalhador", "Ferramentas de ferreiro",
  "Ferramentas de funileiro", "Ferramentas de joalheiro", "Ferramentas de oleiro",
  "Ferramentas de pedreiro", "Ferramentas de pintor", "Ferramentas de sapateiro",
  "Ferramentas de vidreiro", "Suprimentos de alquimista", "Suprimentos de cervejeiro",
  "Suprimentos de caligrafia", "Utensílios de cozinheiro",
];

export type WeaponCategory =
  | "weapon-simple"
  | "weapon-simple-melee"
  | "weapon-martial"
  | "weapon-martial-melee"
  | "weapon-melee-any"
  | "weapon-any"
  | "instrument"
  | "arcane-focus"
  | "druidic-focus"
  | "artisan-tool";

export function getWeaponList(cat: WeaponCategory): string[] {
  switch (cat) {
    case "weapon-simple":        return SIMPLE_WEAPONS;
    case "weapon-simple-melee":  return SIMPLE_MELEE_WEAPONS;
    case "weapon-martial":       return MARTIAL_WEAPONS;
    case "weapon-martial-melee": return MARTIAL_MELEE_WEAPONS;
    case "weapon-melee-any":     return MELEE_WEAPONS;
    case "weapon-any":           return ALL_WEAPONS;
    case "instrument":           return INSTRUMENTS;
    case "arcane-focus":         return ARCANE_FOCI;
    case "druidic-focus":        return DRUIDIC_FOCI;
    case "artisan-tool":         return ARTISAN_TOOLS;
  }
}

export function getCategoryLabel(cat: WeaponCategory): string {
  switch (cat) {
    case "weapon-simple":        return "Arma Simples";
    case "weapon-simple-melee":  return "Arma Corpo-a-Corpo Simples";
    case "weapon-martial":       return "Arma Marcial";
    case "weapon-martial-melee": return "Arma Marcial Corpo-a-Corpo";
    case "weapon-melee-any":     return "Arma Corpo-a-Corpo";
    case "weapon-any":           return "Qualquer Arma";
    case "instrument":           return "Instrumento Musical";
    case "arcane-focus":         return "Foco Arcano";
    case "druidic-focus":        return "Foco Druídico";
    case "artisan-tool":         return "Ferramenta de Artesão";
  }
}

export function rollGold(startingGold: string): number {
  const m = startingGold.match(/(\d+)d(\d+)\s*(?:[×x]\s*(\d+))?/i);
  if (!m) return 0;
  const dice = parseInt(m[1]);
  const sides = parseInt(m[2]);
  const mult  = m[3] ? parseInt(m[3]) : 1;
  let total = 0;
  for (let i = 0; i < dice; i++) total += Math.floor(Math.random() * sides) + 1;
  return total * mult;
}
