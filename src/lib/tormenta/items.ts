// ─── TORMENTA 20 — Equipamento (Capítulo 3) ──────────────────────────────────
// Moeda: Tibar (T$). Fonte: Tabelas 3-1, 3-3, 3-4, 3-5.

export interface Weapon {
  id: string;
  name: string;
  category: "simples" | "marcial" | "exotica" | "fogo";
  group: string; // agrupamento de exibição (ex.: "Corpo a Corpo — Uma Mão")
  damage: string;
  critical: string;
  range?: string;
  damageType?: string;
  price: number; // T$ (0 = gratuita/fácil acesso)
  weight: number; // kg
  special?: string;
}

export const WEAPONS: Weapon[] = [
  // Simples — corpo a corpo leves
  { id: "adaga", name: "Adaga", category: "simples", group: "Corpo a Corpo — Leves", damage: "1d4", critical: "19", damageType: "Perfuração", price: 2, weight: 0.5, special: "Arremessável; +2 Ladinagem p/ ocultar; pode usar Des em vez de For no ataque" },
  { id: "espada-curta", name: "Espada curta", category: "simples", group: "Corpo a Corpo — Leves", damage: "1d6", critical: "19", damageType: "Perfuração", price: 10, weight: 1 },
  { id: "foice", name: "Foice", category: "simples", group: "Corpo a Corpo — Leves", damage: "1d6", critical: "x3", damageType: "Corte", price: 4, weight: 1 },
  { id: "manopla", name: "Manopla", category: "simples", group: "Corpo a Corpo — Leves", damage: "1d3", critical: "x2", damageType: "Impacto", price: 5, weight: 1, special: "Torna ataque desarmado letal; não pode ser desarmada" },
  // Simples — uma mão
  { id: "clava", name: "Clava", category: "simples", group: "Corpo a Corpo — Uma Mão", damage: "1d6", critical: "x2", damageType: "Impacto", price: 0, weight: 1.5 },
  { id: "lanca", name: "Lança", category: "simples", group: "Corpo a Corpo — Uma Mão", damage: "1d6", critical: "x2", damageType: "Perfuração", price: 2, weight: 1.5, special: "Arremessável" },
  { id: "maca", name: "Maça", category: "simples", group: "Corpo a Corpo — Uma Mão", damage: "1d8", critical: "x2", damageType: "Impacto", price: 12, weight: 6 },
  // Simples — duas mãos
  { id: "bordao", name: "Bordão", category: "simples", group: "Corpo a Corpo — Duas Mãos", damage: "1d6/1d6", critical: "x2", damageType: "Impacto", price: 0, weight: 2, special: "Arma dupla" },
  { id: "pique", name: "Pique", category: "simples", group: "Corpo a Corpo — Duas Mãos", damage: "1d8", critical: "x2", damageType: "Perfuração", price: 2, weight: 5, special: "Arma alongada" },
  { id: "tacape", name: "Tacape", category: "simples", group: "Corpo a Corpo — Duas Mãos", damage: "1d10", critical: "x2", damageType: "Impacto", price: 0, weight: 4 },
  // Simples — distância
  { id: "arco-curto", name: "Arco curto", category: "simples", group: "Ataque à Distância", damage: "1d6", critical: "x3", range: "Médio", damageType: "Perfuração", price: 30, weight: 1, special: "Duas mãos; utilizável montado" },
  { id: "besta-leve", name: "Besta leve", category: "simples", group: "Ataque à Distância", damage: "1d8", critical: "19", range: "Médio", damageType: "Perfuração", price: 35, weight: 3, special: "Duas mãos; recarregar = ação de movimento" },
  { id: "azagaia", name: "Azagaia", category: "simples", group: "Ataque à Distância", damage: "1d6", critical: "x2", range: "Médio", damageType: "Perfuração", price: 1, weight: 1, special: "Arremessável; usável corpo a corpo com –5" },
  { id: "funda", name: "Funda", category: "simples", group: "Ataque à Distância", damage: "1d4", critical: "x2", range: "Médio", damageType: "Impacto", price: 0, weight: 0.25, special: "Aplica mod. de Força ao dano" },
  // Marciais — leves
  { id: "escudo-leve-arma", name: "Escudo leve (como arma)", category: "marcial", group: "Corpo a Corpo — Leves", damage: "1d4", critical: "x2", damageType: "Impacto", price: 5, weight: 3, special: "Usado como arma perde bônus de Defesa até o próximo turno" },
  { id: "machadinha", name: "Machadinha", category: "marcial", group: "Corpo a Corpo — Leves", damage: "1d6", critical: "x3", range: "Curto", damageType: "Corte", price: 6, weight: 2, special: "Arremessável" },
  // Marciais — uma mão
  { id: "cimitarra", name: "Cimitarra", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d6", critical: "18", damageType: "Corte", price: 15, weight: 2, special: "Ágil" },
  { id: "espada-longa", name: "Espada longa", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d8", critical: "19", damageType: "Corte", price: 15, weight: 2 },
  { id: "florete", name: "Florete", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d6", critical: "18", damageType: "Perfuração", price: 20, weight: 1, special: "Ágil" },
  { id: "machado-batalha", name: "Machado de batalha", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d8", critical: "x3", damageType: "Corte", price: 10, weight: 3 },
  { id: "mangual", name: "Mangual", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d8", critical: "x2", damageType: "Impacto", price: 8, weight: 2.5, special: "Versátil (+2 em testes p/ desarmar)" },
  { id: "martelo-guerra", name: "Martelo de guerra", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d8", critical: "x3", damageType: "Impacto", price: 12, weight: 2.5 },
  { id: "picareta", name: "Picareta", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d6", critical: "x4", damageType: "Perfuração", price: 8, weight: 3 },
  { id: "tridente", name: "Tridente", category: "marcial", group: "Corpo a Corpo — Uma Mão", damage: "1d8", critical: "x2", damageType: "Perfuração", price: 15, weight: 2, special: "Versátil (+2 em testes p/ derrubar)" },
  // Marciais — duas mãos
  { id: "alabarda", name: "Alabarda", category: "marcial", group: "Corpo a Corpo — Duas Mãos", damage: "1d10", critical: "x3", damageType: "Corte/Perfuração", price: 10, weight: 6, special: "Arma alongada" },
  { id: "alfange", name: "Alfange", category: "marcial", group: "Corpo a Corpo — Duas Mãos", damage: "2d4", critical: "18", damageType: "Corte", price: 75, weight: 4 },
  { id: "gadanho", name: "Gadanho", category: "marcial", group: "Corpo a Corpo — Duas Mãos", damage: "2d4", critical: "x4", damageType: "Corte", price: 18, weight: 5 },
  { id: "lanca-montada", name: "Lança montada", category: "marcial", group: "Corpo a Corpo — Duas Mãos", damage: "1d8", critical: "x3", damageType: "Perfuração", price: 10, weight: 5, special: "Alongada; usável c/ 1 mão se montado; +2d8 em investida montada" },
  { id: "machado-guerra", name: "Machado de guerra", category: "marcial", group: "Corpo a Corpo — Duas Mãos", damage: "1d12", critical: "x3", damageType: "Corte", price: 20, weight: 6 },
  { id: "montante", name: "Montante", category: "marcial", group: "Corpo a Corpo — Duas Mãos", damage: "2d6", critical: "19", damageType: "Corte", price: 50, weight: 4 },
  // Marciais — distância
  { id: "arco-longo", name: "Arco longo", category: "marcial", group: "Ataque à Distância", damage: "1d8", critical: "x3", range: "Médio", damageType: "Perfuração", price: 100, weight: 1.5, special: "Duas mãos; não usável montado" },
  { id: "besta-pesada", name: "Besta pesada", category: "marcial", group: "Ataque à Distância", damage: "1d12", critical: "19", range: "Médio", damageType: "Perfuração", price: 50, weight: 4, special: "Duas mãos; recarregar = ação padrão" },
  // Exóticas
  { id: "chicote", name: "Chicote", category: "exotica", group: "Corpo a Corpo — Uma Mão", damage: "1d3", critical: "x2", damageType: "Corte", price: 2, weight: 1, special: "Alcance 4,5m; ágil; +2 p/ derrubar ou desarmar" },
  { id: "espada-bastarda", name: "Espada bastarda", category: "exotica", group: "Corpo a Corpo — Uma Mão", damage: "1d10/1d12", critical: "19", damageType: "Corte", price: 35, weight: 3, special: "Adaptável (pode ser usada como marcial de duas mãos)" },
  { id: "katana", name: "Katana", category: "exotica", group: "Corpo a Corpo — Uma Mão", damage: "1d8/1d10", critical: "19", damageType: "Corte", price: 100, weight: 2.5, special: "Adaptável; ágil" },
  { id: "machado-anao", name: "Machado anão", category: "exotica", group: "Corpo a Corpo — Uma Mão", damage: "1d10", critical: "x3", damageType: "Corte", price: 30, weight: 4, special: "Pode ser usado como marcial de duas mãos" },
  { id: "corrente-espinhos", name: "Corrente de espinhos", category: "exotica", group: "Corpo a Corpo — Duas Mãos", damage: "2d4/2d4", critical: "19", damageType: "Corte", price: 25, weight: 5, special: "Ágil; dupla; versátil; alcance 4,5m" },
  { id: "machado-taurico", name: "Machado táurico", category: "exotica", group: "Corpo a Corpo — Duas Mãos", damage: "2d8", critical: "x3", damageType: "Corte", price: 50, weight: 12, special: "–2 em testes de ataque (pesado/desbalanceado)" },
  { id: "rede", name: "Rede", category: "exotica", group: "Ataque à Distância", damage: "—", critical: "—", range: "Curto", price: 20, weight: 3, special: "Acerto não causa dano; enreda o alvo" },
  // Fogo
  { id: "mosquete", name: "Mosquete", category: "fogo", group: "Ataque à Distância", damage: "2d8", critical: "19/x3", range: "Médio", damageType: "Perfuração", price: 500, weight: 4, special: "Duas mãos; recarregar = ação padrão" },
  { id: "pistola", name: "Pistola", category: "fogo", group: "Ataque à Distância", damage: "2d6", critical: "19/x3", range: "Curto", damageType: "Perfuração", price: 250, weight: 1, special: "Conta como arma leve p/ Estilo de Duas Armas" },
];

export const WEAPON_BY_ID: Record<string, Weapon> = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));

export interface Armor {
  id: string;
  name: string;
  category: "leve" | "pesada" | "escudo";
  defenseBonus: number;
  armorPenalty: number;
  price: number;
  weight: number;
}

export const ARMORS: Armor[] = [
  { id: "acolchoada", name: "Armadura acolchoada", category: "leve", defenseBonus: 1, armorPenalty: 0, price: 5, weight: 5 },
  { id: "couro", name: "Armadura de couro", category: "leve", defenseBonus: 2, armorPenalty: 0, price: 20, weight: 7 },
  { id: "couro-batido", name: "Couro batido", category: "leve", defenseBonus: 3, armorPenalty: -1, price: 35, weight: 10 },
  { id: "gibao-peles", name: "Gibão de peles", category: "leve", defenseBonus: 4, armorPenalty: -3, price: 25, weight: 12 },
  { id: "couraca", name: "Couraça", category: "leve", defenseBonus: 5, armorPenalty: -4, price: 500, weight: 15 },
  { id: "brunea", name: "Brunea", category: "pesada", defenseBonus: 5, armorPenalty: -2, price: 50, weight: 15 },
  { id: "cota-malha", name: "Cota de malha", category: "pesada", defenseBonus: 6, armorPenalty: -2, price: 150, weight: 20 },
  { id: "loriga-segmentada", name: "Loriga segmentada", category: "pesada", defenseBonus: 7, armorPenalty: -3, price: 250, weight: 17 },
  { id: "meia-armadura", name: "Meia armadura", category: "pesada", defenseBonus: 8, armorPenalty: -4, price: 600, weight: 22 },
  { id: "armadura-completa", name: "Armadura completa", category: "pesada", defenseBonus: 10, armorPenalty: -5, price: 3000, weight: 25 },
  { id: "escudo-leve", name: "Escudo leve", category: "escudo", defenseBonus: 1, armorPenalty: -1, price: 5, weight: 3 },
  { id: "escudo-pesado", name: "Escudo pesado", category: "escudo", defenseBonus: 2, armorPenalty: -2, price: 15, weight: 7 },
];

export const ARMOR_BY_ID: Record<string, Armor> = Object.fromEntries(ARMORS.map((a) => [a.id, a]));

// Armadura pesada: não aplica bônus de Destreza na Defesa.
export function computeTormentaDefense(desMod: number, armorId: string | null, shieldId: string | null): number {
  const armor = armorId ? ARMOR_BY_ID[armorId] : null;
  const shield = shieldId ? ARMOR_BY_ID[shieldId] : null;
  const desApplied = armor?.category === "pesada" ? 0 : desMod;
  return 10 + desApplied + (armor?.defenseBonus ?? 0) + (shield?.defenseBonus ?? 0);
}

export interface GearItem {
  id: string;
  name: string;
  category: "geral" | "alquimia" | "vestuario";
  price: number;
  weight?: number;
  description: string;
}

export const GEAR: GearItem[] = [
  { id: "agua-benta", name: "Água benta", category: "geral", price: 10, weight: 0.5, description: "2d10 dano de luz contra morto-vivo/demônio/diabo em alcance curto (Reflexos reduz à metade)." },
  { id: "algemas", name: "Algemas", category: "geral", price: 15, weight: 1, description: "Par de algemas para criatura Média; escapar exige Acrobacia CD 30 ou Força CD 26." },
  { id: "barraca", name: "Barraca", category: "geral", price: 10, weight: 10, description: "Conta como saco de dormir para 2 pessoas; +2 em Sobrevivência para acampar." },
  { id: "corda", name: "Corda (10m)", category: "geral", price: 1, weight: 5, description: "Corda de cânhamo resistente." },
  { id: "kit-oficio", name: "Kit de ofício", category: "geral", price: 30, weight: 4, description: "Ferramentas do Ofício; sem ele, –5 nos testes." },
  { id: "kit-disfarces", name: "Kit de disfarces", category: "geral", price: 50, weight: 4, description: "Cosméticos e apêndices falsos; sem ele, –5 em Enganação para disfarce." },
  { id: "kit-ladrao", name: "Kit de ladrão", category: "geral", price: 30, weight: 0.5, description: "Gazuas e arames; sem ele, –5 em Ladinagem para abrir fechaduras/sabotar." },
  { id: "kit-medicamentos", name: "Kit de medicamentos", category: "geral", price: 50, weight: 2, description: "Ervas, unguentos e bandagens; sem ele, –5 em Cura." },
  { id: "lampiao", name: "Lampião", category: "geral", price: 7, weight: 1, description: "Ilumina 9m; carga de óleo dura 6h." },
  { id: "mochila", name: "Mochila", category: "geral", price: 2, weight: 1, description: "Bolsa reforçada de couro com bolsos e tiras." },
  { id: "pe-de-cabra", name: "Pé de cabra", category: "geral", price: 2, weight: 2.5, description: "+5 em Força para arrombar; usável em combate como clava." },
  { id: "racao", name: "Ração de viagem (por dia)", category: "geral", price: 0.5, weight: 0.5, description: "Alimenta uma pessoa por um dia." },
  { id: "saco-dormir", name: "Saco de dormir", category: "geral", price: 1, weight: 2.5, description: "Colchão e coberta para descanso ao relento." },
  { id: "tocha", name: "Tocha", category: "geral", price: 0.1, weight: 0.5, description: "Queima 1h, ilumina 6m; usável como arma simples leve (1d4+1 fogo)." },
  { id: "acido", name: "Ácido", category: "alquimia", price: 10, weight: 0.5, description: "2d4 dano de ácido em alcance curto (Reflexos CD 15 reduz à metade)." },
  { id: "balsamo-restaurador", name: "Bálsamo restaurador", category: "alquimia", price: 10, weight: 0.5, description: "Recupera 2d4 PV (ação completa, CD 15)." },
  { id: "bomba", name: "Bomba", category: "alquimia", price: 50, weight: 0.5, description: "6d6 dano de impacto em raio de 3m (Reflexos CD 20 reduz à metade)." },
  { id: "essencia-mana", name: "Essência de mana", category: "alquimia", price: 50, weight: 0.1, description: "Recupera 1d4 PM (ação padrão, CD 20)." },
  { id: "fogo-alquimico", name: "Fogo alquímico", category: "alquimia", price: 10, weight: 0.5, description: "1d6 dano de fogo, alvo pega fogo (Reflexos CD 15 reduz/evita)." },
  { id: "traje-viajante", name: "Traje de viajante", category: "vestuario", price: 5, weight: 2, description: "Roupas padrão de aventureiros." },
  { id: "traje-camuflado", name: "Traje camuflado", category: "vestuario", price: 20, weight: 2, description: "+2 em Furtividade no terreno correto." },
];

export const GEAR_BY_ID: Record<string, GearItem> = Object.fromEntries(GEAR.map((g) => [g.id, g]));

// Tabela 3-1: dinheiro inicial no 1º nível.
export const STARTING_MONEY_DICE = "4d6"; // T$

// Kit fixo de todo personagem, independente de dinheiro (pág. 139).
export const DEFAULT_STARTING_KIT = ["Mochila", "Saco de dormir", "Traje de viajante"];
