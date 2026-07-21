// PHB item catalog for D&D 5e (based on LivroJogador.md)

export type WeaponCategory =
  | "arma-simples-cac"
  | "arma-simples-dist"
  | "arma-marcial-cac"
  | "arma-marcial-dist";

export type WeaponEntry = {
  name: string;
  category: WeaponCategory;
  damage: string;       // "1d6"
  damageType: string;   // "perfurante"
  finesse: boolean;     // acuidade — uses max(str, dex)
  ranged: boolean;
  range?: string;       // thrown or ranged range "6/18"
  twoHanded?: boolean;
  versatile?: string;   // "1d8" when used two-handed
};

export const WEAPONS: WeaponEntry[] = [
  // ── Simples corpo-a-corpo ──────────────────────────────────────────────
  { name: "Adaga",        category: "arma-simples-cac", damage: "1d4",  damageType: "perfurante", finesse: true,  ranged: false, range: "6/18" },
  { name: "Azagaia",      category: "arma-simples-cac", damage: "1d6",  damageType: "perfurante", finesse: false, ranged: false, range: "9/36" },
  { name: "Bordão",       category: "arma-simples-cac", damage: "1d6",  damageType: "concussão",  finesse: false, ranged: false, versatile: "1d8" },
  { name: "Clava Grande", category: "arma-simples-cac", damage: "1d8",  damageType: "concussão",  finesse: false, ranged: false, twoHanded: true },
  { name: "Foice Curta",  category: "arma-simples-cac", damage: "1d4",  damageType: "cortante",   finesse: false, ranged: false },
  { name: "Lança",        category: "arma-simples-cac", damage: "1d6",  damageType: "perfurante", finesse: false, ranged: false, range: "6/18", versatile: "1d8" },
  { name: "Maça",         category: "arma-simples-cac", damage: "1d6",  damageType: "concussão",  finesse: false, ranged: false },
  { name: "Machadinha",   category: "arma-simples-cac", damage: "1d6",  damageType: "cortante",   finesse: false, ranged: false, range: "6/18" },
  { name: "Martelo Leve", category: "arma-simples-cac", damage: "1d4",  damageType: "concussão",  finesse: false, ranged: false, range: "6/18" },
  { name: "Porrete",      category: "arma-simples-cac", damage: "1d4",  damageType: "concussão",  finesse: false, ranged: false },
  // ── Simples à distância ───────────────────────────────────────────────
  { name: "Arco Curto",   category: "arma-simples-dist", damage: "1d6",  damageType: "perfurante", finesse: false, ranged: true,  range: "24/96", twoHanded: true },
  { name: "Besta Leve",   category: "arma-simples-dist", damage: "1d8",  damageType: "perfurante", finesse: false, ranged: true,  range: "24/96", twoHanded: true },
  { name: "Dardo",        category: "arma-simples-dist", damage: "1d4",  damageType: "perfurante", finesse: true,  ranged: true,  range: "6/18" },
  { name: "Funda",        category: "arma-simples-dist", damage: "1d4",  damageType: "concussão",  finesse: false, ranged: true,  range: "9/36" },
  // ── Marcial corpo-a-corpo ─────────────────────────────────────────────
  { name: "Alabarda",           category: "arma-marcial-cac", damage: "1d10", damageType: "cortante",   finesse: false, ranged: false, twoHanded: true },
  { name: "Cimitarra",          category: "arma-marcial-cac", damage: "1d6",  damageType: "cortante",   finesse: true,  ranged: false },
  { name: "Chicote",            category: "arma-marcial-cac", damage: "1d4",  damageType: "cortante",   finesse: true,  ranged: false },
  { name: "Espada Curta",       category: "arma-marcial-cac", damage: "1d6",  damageType: "perfurante", finesse: true,  ranged: false },
  { name: "Espada Grande",      category: "arma-marcial-cac", damage: "2d6",  damageType: "cortante",   finesse: false, ranged: false, twoHanded: true },
  { name: "Espada Longa",       category: "arma-marcial-cac", damage: "1d8",  damageType: "cortante",   finesse: false, ranged: false, versatile: "1d10" },
  { name: "Glaive",             category: "arma-marcial-cac", damage: "1d10", damageType: "cortante",   finesse: false, ranged: false, twoHanded: true },
  { name: "Lança de Montaria",  category: "arma-marcial-cac", damage: "1d12", damageType: "perfurante", finesse: false, ranged: false },
  { name: "Lança Longa",        category: "arma-marcial-cac", damage: "1d10", damageType: "perfurante", finesse: false, ranged: false, twoHanded: true },
  { name: "Maça Estrela",       category: "arma-marcial-cac", damage: "1d8",  damageType: "perfurante", finesse: false, ranged: false },
  { name: "Machado Grande",     category: "arma-marcial-cac", damage: "1d12", damageType: "cortante",   finesse: false, ranged: false, twoHanded: true },
  { name: "Machado de Batalha", category: "arma-marcial-cac", damage: "1d8",  damageType: "cortante",   finesse: false, ranged: false, versatile: "1d10" },
  { name: "Malho",              category: "arma-marcial-cac", damage: "2d6",  damageType: "concussão",  finesse: false, ranged: false, twoHanded: true },
  { name: "Mangual",            category: "arma-marcial-cac", damage: "1d8",  damageType: "concussão",  finesse: false, ranged: false },
  { name: "Martelo de Guerra",  category: "arma-marcial-cac", damage: "1d8",  damageType: "concussão",  finesse: false, ranged: false, versatile: "1d10" },
  { name: "Picareta de Guerra", category: "arma-marcial-cac", damage: "1d8",  damageType: "perfurante", finesse: false, ranged: false },
  { name: "Rapieira",           category: "arma-marcial-cac", damage: "1d8",  damageType: "perfurante", finesse: true,  ranged: false },
  { name: "Tridente",           category: "arma-marcial-cac", damage: "1d6",  damageType: "perfurante", finesse: false, ranged: false, range: "6/18", versatile: "1d8" },
  // ── Marcial à distância ───────────────────────────────────────────────
  { name: "Arco Longo",   category: "arma-marcial-dist", damage: "1d8",  damageType: "perfurante", finesse: false, ranged: true, range: "45/180", twoHanded: true },
  { name: "Besta de Mão", category: "arma-marcial-dist", damage: "1d6",  damageType: "perfurante", finesse: false, ranged: true, range: "9/36" },
  { name: "Besta Pesada", category: "arma-marcial-dist", damage: "1d10", damageType: "perfurante", finesse: false, ranged: true, range: "30/120", twoHanded: true },
  { name: "Zarabatana",   category: "arma-marcial-dist", damage: "1",    damageType: "perfurante", finesse: false, ranged: true, range: "7,5/30" },
];

// ── Picker item list (all PHB items) ──────────────────────────────────────

export type PickerItem = { name: string; group: string; cost: string };

export const ALL_PHB_ITEMS: PickerItem[] = [
  // Weapons
  ...WEAPONS.map((w) => ({
    name: w.name,
    group: w.category.startsWith("arma-simples") ? "Arma Simples" : "Arma Marcial",
    cost: "",
  })),
  // Armor & Shields
  { name: "Acolchoada",     group: "Armadura", cost: "5 po" },
  { name: "Couro",          group: "Armadura", cost: "10 po" },
  { name: "Couro Batido",   group: "Armadura", cost: "45 po" },
  { name: "Gibão de Peles", group: "Armadura", cost: "10 po" },
  { name: "Camisão de Malha", group: "Armadura", cost: "50 po" },
  { name: "Brunea",         group: "Armadura", cost: "50 po" },
  { name: "Peitoral",       group: "Armadura", cost: "400 po" },
  { name: "Meia-Armadura",  group: "Armadura", cost: "750 po" },
  { name: "Cota de Anéis",  group: "Armadura", cost: "30 po" },
  { name: "Cota de Malha",  group: "Armadura", cost: "75 po" },
  { name: "Cota de Talas",  group: "Armadura", cost: "200 po" },
  { name: "Placas",         group: "Armadura", cost: "1500 po" },
  { name: "Escudo",         group: "Armadura", cost: "10 po" },
  // Gear
  { name: "Ábaco",                   group: "Equipamento", cost: "2 po" },
  { name: "Ácido (vidro)",           group: "Equipamento", cost: "25 po" },
  { name: "Água Benta (frasco)",     group: "Equipamento", cost: "25 po" },
  { name: "Algemas",                 group: "Equipamento", cost: "2 po" },
  { name: "Aljava",                  group: "Equipamento", cost: "1 po" },
  { name: "Ampulheta",               group: "Equipamento", cost: "25 po" },
  { name: "Antídoto (vidro)",        group: "Equipamento", cost: "50 po" },
  { name: "Apito de Advertência",    group: "Equipamento", cost: "25 po" },
  { name: "Aríete Portátil",         group: "Equipamento", cost: "4 po" },
  { name: "Armadilha de Caça",       group: "Equipamento", cost: "5 po" },
  { name: "Arpéu",                   group: "Equipamento", cost: "2 po" },
  { name: "Balança de Mercador",     group: "Equipamento", cost: "5 po" },
  { name: "Bolsa de Componentes",    group: "Equipamento", cost: "25 po" },
  { name: "Caixa de Fogo",          group: "Equipamento", cost: "5 pp" },
  { name: "Cantil",                  group: "Equipamento", cost: "2 pp" },
  { name: "Cobertor de Inverno",     group: "Equipamento", cost: "5 pp" },
  { name: "Corda de Cânhamo (15m)",  group: "Equipamento", cost: "1 po" },
  { name: "Corda de Seda (15m)",     group: "Equipamento", cost: "10 po" },
  { name: "Corrente (3m)",           group: "Equipamento", cost: "5 po" },
  { name: "Espelho de Aço",          group: "Equipamento", cost: "5 po" },
  { name: "Estrepes (bolsa com 20)", group: "Equipamento", cost: "1 po" },
  { name: "Fechadura",               group: "Equipamento", cost: "10 po" },
  { name: "Foco Arcano (Bastão)",    group: "Equipamento", cost: "10 po" },
  { name: "Foco Arcano (Cajado)",    group: "Equipamento", cost: "5 po" },
  { name: "Foco Arcano (Cristal)",   group: "Equipamento", cost: "10 po" },
  { name: "Foco Arcano (Orbe)",      group: "Equipamento", cost: "20 po" },
  { name: "Foco Arcano (Varinha)",   group: "Equipamento", cost: "10 po" },
  { name: "Foco Druídico",           group: "Equipamento", cost: "varies" },
  { name: "Grimório",                group: "Equipamento", cost: "50 po" },
  { name: "Kit de Escalada",         group: "Equipamento", cost: "25 po" },
  { name: "Kit de Primeiros Socorros", group: "Equipamento", cost: "5 po" },
  { name: "Kit de Refeição",         group: "Equipamento", cost: "2 pp" },
  { name: "Lâmpada",                 group: "Equipamento", cost: "5 pp" },
  { name: "Lanterna Coberta",        group: "Equipamento", cost: "5 po" },
  { name: "Lanterna Furta-Fogo",     group: "Equipamento", cost: "10 po" },
  { name: "Lente de Aumento",        group: "Equipamento", cost: "100 po" },
  { name: "Livro",                   group: "Equipamento", cost: "25 po" },
  { name: "Luneta",                  group: "Equipamento", cost: "1000 po" },
  { name: "Mochila",                 group: "Equipamento", cost: "2 po" },
  { name: "Óleo (frasco)",           group: "Equipamento", cost: "1 pp" },
  { name: "Pé de Cabra",            group: "Equipamento", cost: "2 po" },
  { name: "Poção de Cura",           group: "Equipamento", cost: "50 po" },
  { name: "Porta Mapas/Pergaminhos", group: "Equipamento", cost: "1 po" },
  { name: "Rações de Viagem (1 dia)", group: "Equipamento", cost: "5 pp" },
  { name: "Roldana e Polia",         group: "Equipamento", cost: "1 po" },
  { name: "Símbolo Sagrado",         group: "Equipamento", cost: "5 po" },
  { name: "Tenda",                   group: "Equipamento", cost: "2 po" },
  { name: "Tocha",                   group: "Equipamento", cost: "1 pc" },
  { name: "Vela",                    group: "Equipamento", cost: "1 pc" },
  { name: "Veneno Básico (vidro)",   group: "Equipamento", cost: "100 po" },
  // Tools
  { name: "Ferramentas de Carpinteiro",  group: "Ferramenta", cost: "8 po" },
  { name: "Ferramentas de Cartógrafo",   group: "Ferramenta", cost: "15 po" },
  { name: "Ferramentas de Ferreiro",     group: "Ferramenta", cost: "20 po" },
  { name: "Ferramentas de Joalheiro",    group: "Ferramenta", cost: "25 po" },
  { name: "Ferramentas de Ladrão",       group: "Ferramenta", cost: "25 po" },
  { name: "Ferramentas de Navegação",    group: "Ferramenta", cost: "25 po" },
  { name: "Kit de Disfarce",             group: "Ferramenta", cost: "25 po" },
  { name: "Kit de Falsificação",         group: "Ferramenta", cost: "15 po" },
  { name: "Kit de Herbalismo",           group: "Ferramenta", cost: "5 po" },
  { name: "Kit de Venenos",              group: "Ferramenta", cost: "50 po" },
  { name: "Suprimentos de Alquimista",   group: "Ferramenta", cost: "50 po" },
  { name: "Suprimentos de Cervejeiro",   group: "Ferramenta", cost: "20 po" },
  { name: "Suprimentos de Caligrafia",   group: "Ferramenta", cost: "10 po" },
  { name: "Utensílios de Cozinheiro",    group: "Ferramenta", cost: "1 po" },
  // Instruments
  { name: "Alaúde",     group: "Instrumento", cost: "35 po" },
  { name: "Flauta",     group: "Instrumento", cost: "2 po" },
  { name: "Lira",       group: "Instrumento", cost: "30 po" },
  { name: "Oboé",       group: "Instrumento", cost: "2 po" },
  { name: "Tambor",     group: "Instrumento", cost: "6 po" },
  { name: "Trombeta",   group: "Instrumento", cost: "3 po" },
  { name: "Violino",    group: "Instrumento", cost: "30 po" },
  { name: "Xilofone",   group: "Instrumento", cost: "25 po" },
];

export const PICKER_GROUPS = ["Tudo", "Arma Simples", "Arma Marcial", "Armadura", "Equipamento", "Ferramenta", "Instrumento"] as const;
export type PickerGroup = typeof PICKER_GROUPS[number];

// ── Armor table (PHB) — para cálculo de Classe de Armadura ────────────────
export type ArmorEntry = {
  name: string;
  baseAC: number;
  dexCap: number | null; // null = sem limite (leve); número = limite (média); 0 = não soma DES (pesada)
  strMin?: number;
};

export const ARMORS: ArmorEntry[] = [
  // Leve — soma DES sem limite
  { name: "Acolchoada",   baseAC: 11, dexCap: null },
  { name: "Couro",        baseAC: 11, dexCap: null },
  { name: "Couro Batido", baseAC: 12, dexCap: null },
  // Média — soma DES até +2
  { name: "Gibão de Peles",    baseAC: 12, dexCap: 2 },
  { name: "Camisão de Malha",  baseAC: 13, dexCap: 2 },
  { name: "Brunea",            baseAC: 14, dexCap: 2 },
  { name: "Peitoral",          baseAC: 14, dexCap: 2 },
  { name: "Meia-Armadura",     baseAC: 15, dexCap: 2 },
  // Pesada — não soma DES
  { name: "Cota de Anéis", baseAC: 14, dexCap: 0 },
  { name: "Cota de Malha", baseAC: 16, dexCap: 0, strMin: 13 },
  { name: "Cota de Talas", baseAC: 17, dexCap: 0, strMin: 15 },
  { name: "Placas",        baseAC: 18, dexCap: 0, strMin: 15 },
];

export const SHIELD_AC_BONUS = 2;

/**
 * Calcula a Classe de Armadura a partir dos itens equipados (nomes livres,
 * como retornados por resolveEquipment). Ignora armadura se nenhuma constar
 * na lista; adiciona +2 de Escudo se presente. `unarmoredBase` é o valor sem
 * armadura já considerando defesas de classe (bárbaro/monge).
 */
export function computeArmorAC(itemNames: string[], dexMod: number, unarmoredBase: number): number {
  const has = (name: string) => itemNames.some((i) => i.toLowerCase() === name.toLowerCase());
  const armor = ARMORS.find((a) => has(a.name));
  const shieldBonus = has("Escudo") ? SHIELD_AC_BONUS : 0;

  if (!armor) return unarmoredBase + shieldBonus;
  if (armor.dexCap === 0) return armor.baseAC + shieldBonus; // pesada: DES não é somada

  const dexBonus = armor.dexCap === null ? dexMod : Math.min(dexMod, armor.dexCap);
  return armor.baseAC + dexBonus + shieldBonus;
}
