// ─── ORDEM PARANORMAL — Armas, Proteções e Munições (Cap. 3) ─────────────────

export type WeaponProf = "simples" | "tatica" | "pesada";
export type WeaponKind = "corpo" | "arremesso" | "disparo" | "fogo";
export type Grip = "leve" | "uma" | "duas";
export type DamageType = "C" | "I" | "P" | "B" | "Fogo";

export interface Weapon {
  id: string;
  name: string;
  prof: WeaponProf;
  kind: WeaponKind;
  grip: Grip;
  damage: string; // ex "1d8" ou "1d8/1d10" (uma/duas mãos)
  crit: string; // ex "x2", "19", "19/x3"
  range: string | null; // "Curto" | "Médio" | "Longo" | null
  type: DamageType;
  spaces: number;
  category: number; // 0..IV (numérico)
  tags?: string[]; // "ágil", "automática", "arremesso"
}

export const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  C: "Corte",
  I: "Impacto",
  P: "Perfuração",
  B: "Balístico",
  Fogo: "Fogo",
};

export const WEAPONS: Weapon[] = [
  // ── Simples · Corpo a corpo · Leves ──
  { id: "faca",     name: "Faca",     prof: "simples", kind: "corpo", grip: "leve", damage: "1d4", crit: "19", range: "Curto", type: "C", spaces: 1, category: 0, tags: ["ágil", "arremesso"] },
  { id: "martelo",  name: "Martelo",  prof: "simples", kind: "corpo", grip: "leve", damage: "1d6", crit: "x2", range: null, type: "I", spaces: 1, category: 0 },
  { id: "punhal",   name: "Punhal",   prof: "simples", kind: "corpo", grip: "leve", damage: "1d4", crit: "x3", range: null, type: "P", spaces: 1, category: 0, tags: ["ágil"] },
  // ── Simples · Corpo a corpo · Uma mão ──
  { id: "bastao",   name: "Bastão",   prof: "simples", kind: "corpo", grip: "uma", damage: "1d6/1d8", crit: "x2", range: null, type: "I", spaces: 1, category: 0 },
  { id: "machete",  name: "Machete",  prof: "simples", kind: "corpo", grip: "uma", damage: "1d6", crit: "19", range: null, type: "C", spaces: 1, category: 0 },
  { id: "lanca",    name: "Lança",    prof: "simples", kind: "corpo", grip: "uma", damage: "1d6", crit: "x2", range: "Curto", type: "P", spaces: 1, category: 0, tags: ["arremesso"] },
  // ── Simples · Corpo a corpo · Duas mãos ──
  { id: "cajado",   name: "Cajado",   prof: "simples", kind: "corpo", grip: "duas", damage: "1d6/1d6", crit: "x2", range: null, type: "I", spaces: 2, category: 0, tags: ["ágil"] },
  // ── Simples · Disparo · Duas mãos ──
  { id: "arco",     name: "Arco",     prof: "simples", kind: "disparo", grip: "duas", damage: "1d6", crit: "x3", range: "Médio", type: "P", spaces: 2, category: 0 },
  { id: "besta",    name: "Besta",    prof: "simples", kind: "disparo", grip: "duas", damage: "1d8", crit: "19", range: "Médio", type: "P", spaces: 2, category: 0 },
  // ── Simples · Fogo · Leves ──
  { id: "pistola",  name: "Pistola",  prof: "simples", kind: "fogo", grip: "leve", damage: "1d12", crit: "18", range: "Curto", type: "B", spaces: 1, category: 1 },
  { id: "revolver", name: "Revólver", prof: "simples", kind: "fogo", grip: "leve", damage: "2d6", crit: "19/x3", range: "Curto", type: "B", spaces: 1, category: 1 },
  // ── Simples · Fogo · Duas mãos ──
  { id: "fuzil-caca", name: "Fuzil de caça", prof: "simples", kind: "fogo", grip: "duas", damage: "2d8", crit: "19/x3", range: "Médio", type: "B", spaces: 2, category: 1 },

  // ── Táticas · Corpo a corpo · Leves ──
  { id: "machadinha", name: "Machadinha", prof: "tatica", kind: "corpo", grip: "leve", damage: "1d6", crit: "x3", range: "Curto", type: "C", spaces: 1, category: 0, tags: ["arremesso"] },
  { id: "nunchaku",   name: "Nunchaku",   prof: "tatica", kind: "corpo", grip: "leve", damage: "1d8", crit: "x2", range: null, type: "I", spaces: 1, category: 0, tags: ["ágil"] },
  // ── Táticas · Corpo a corpo · Uma mão ──
  { id: "corrente",   name: "Corrente",   prof: "tatica", kind: "corpo", grip: "uma", damage: "1d8", crit: "x2", range: null, type: "I", spaces: 1, category: 0 },
  { id: "espada",     name: "Espada",     prof: "tatica", kind: "corpo", grip: "uma", damage: "1d8/1d10", crit: "19", range: null, type: "C", spaces: 1, category: 1 },
  { id: "florete",    name: "Florete",    prof: "tatica", kind: "corpo", grip: "uma", damage: "1d6", crit: "18", range: null, type: "C", spaces: 1, category: 1, tags: ["ágil"] },
  { id: "machado",    name: "Machado",    prof: "tatica", kind: "corpo", grip: "uma", damage: "1d8", crit: "x3", range: null, type: "C", spaces: 1, category: 1 },
  { id: "maca",       name: "Maça",       prof: "tatica", kind: "corpo", grip: "uma", damage: "2d4", crit: "x2", range: null, type: "I", spaces: 1, category: 1 },
  // ── Táticas · Corpo a corpo · Duas mãos ──
  { id: "acha",       name: "Acha",       prof: "tatica", kind: "corpo", grip: "duas", damage: "1d12", crit: "x3", range: null, type: "C", spaces: 2, category: 1 },
  { id: "gadanho",    name: "Gadanho",    prof: "tatica", kind: "corpo", grip: "duas", damage: "2d4", crit: "x4", range: null, type: "C", spaces: 2, category: 1 },
  { id: "katana",     name: "Katana",     prof: "tatica", kind: "corpo", grip: "duas", damage: "1d10", crit: "19", range: null, type: "C", spaces: 2, category: 1, tags: ["ágil"] },
  { id: "marreta",    name: "Marreta",    prof: "tatica", kind: "corpo", grip: "duas", damage: "3d4", crit: "x2", range: null, type: "I", spaces: 2, category: 1 },
  { id: "montante",   name: "Montante",   prof: "tatica", kind: "corpo", grip: "duas", damage: "2d6", crit: "19", range: null, type: "C", spaces: 2, category: 1 },
  { id: "motoserra",  name: "Motoserra",  prof: "tatica", kind: "corpo", grip: "duas", damage: "3d6", crit: "x2", range: null, type: "C", spaces: 2, category: 1 },
  // ── Táticas · Disparo · Duas mãos ──
  { id: "arco-composto", name: "Arco composto", prof: "tatica", kind: "disparo", grip: "duas", damage: "1d10", crit: "x3", range: "Médio", type: "P", spaces: 2, category: 1 },
  { id: "balestra",      name: "Balestra",      prof: "tatica", kind: "disparo", grip: "duas", damage: "1d12", crit: "19", range: "Médio", type: "P", spaces: 2, category: 1 },
  // ── Táticas · Fogo · Uma mão ──
  { id: "submetralhadora", name: "Submetralhadora", prof: "tatica", kind: "fogo", grip: "uma", damage: "2d6", crit: "19/x3", range: "Curto", type: "B", spaces: 1, category: 1, tags: ["automática"] },
  // ── Táticas · Fogo · Duas mãos ──
  { id: "espingarda",       name: "Espingarda",       prof: "tatica", kind: "fogo", grip: "duas", damage: "4d6", crit: "x3", range: "Curto", type: "B", spaces: 2, category: 1 },
  { id: "fuzil-assalto",    name: "Fuzil de assalto", prof: "tatica", kind: "fogo", grip: "duas", damage: "2d10", crit: "19/x3", range: "Médio", type: "B", spaces: 2, category: 2, tags: ["automática"] },
  { id: "fuzil-precisao",   name: "Fuzil de precisão",prof: "tatica", kind: "fogo", grip: "duas", damage: "2d10", crit: "19/x3", range: "Longo", type: "B", spaces: 2, category: 3 },

  // ── Pesadas · À distância · Duas mãos ──
  { id: "bazuca",        name: "Bazuca",        prof: "pesada", kind: "fogo", grip: "duas", damage: "10d8", crit: "x2", range: "Médio", type: "I", spaces: 2, category: 3 },
  { id: "lanca-chamas",  name: "Lança-chamas",  prof: "pesada", kind: "fogo", grip: "duas", damage: "6d6", crit: "x2", range: "Curto", type: "Fogo", spaces: 2, category: 3 },
  { id: "metralhadora",  name: "Metralhadora",  prof: "pesada", kind: "fogo", grip: "duas", damage: "2d12", crit: "19/x3", range: "Médio", type: "B", spaces: 2, category: 2, tags: ["automática"] },
];

export const WEAPON_BY_ID: Record<string, Weapon> = Object.fromEntries(
  WEAPONS.map((w) => [w.id, w]),
);

// ─── Proteções ───────────────────────────────────────────────────────────────

export interface Protection {
  id: string;
  name: string;
  defense: number;
  category: number;
  spaces: number;
  note?: string;
}

export const PROTECTIONS: Protection[] = [
  { id: "leve",   name: "Proteção Leve",   defense: 5,  category: 1, spaces: 2 },
  { id: "pesada", name: "Proteção Pesada", defense: 10, category: 2, spaces: 5, note: "RD 2 (bal/corte/imp/perf); −5 em perícias de carga." },
  { id: "escudo", name: "Escudo",          defense: 2,  category: 1, spaces: 2, note: "Empunhado em uma mão; acumula com proteção." },
];

export const PROTECTION_BY_ID: Record<string, Protection> = Object.fromEntries(
  PROTECTIONS.map((p) => [p.id, p]),
);

// Bônus de Defesa concedido por proteções equipadas. Armadura de corpo
// (leve/pesada) não acumula entre si — usa a maior. Escudo acumula (+2).
export function armorDefenseBonus(ids: string[]): number {
  let body = 0;
  let shield = 0;
  for (const id of ids) {
    const p = PROTECTION_BY_ID[id];
    if (!p) continue;
    if (p.id === "escudo") shield += p.defense;
    else body = Math.max(body, p.defense);
  }
  return body + shield;
}

// ─── Munições ────────────────────────────────────────────────────────────────

export interface Ammo {
  id: string;
  name: string;
  category: number;
  spaces: number;
  duration: string;
}

export const AMMO: Ammo[] = [
  { id: "balas-curtas", name: "Balas curtas", category: 0, spaces: 1, duration: "2 cenas" },
  { id: "balas-longas", name: "Balas longas", category: 1, spaces: 1, duration: "1 cena" },
  { id: "cartuchos",    name: "Cartuchos",    category: 1, spaces: 1, duration: "1 cena" },
  { id: "combustivel",  name: "Combustível",  category: 1, spaces: 1, duration: "1 cena" },
  { id: "flechas",      name: "Flechas",      category: 0, spaces: 1, duration: "1 missão" },
  { id: "foguete",      name: "Foguete",      category: 1, spaces: 1, duration: "1 disparo" },
];

// ─── Itens gerais (Tabela 3.8) ───────────────────────────────────────────────

export type GeneralGroup = "acessorio" | "explosivo" | "operacional" | "paranormal";

export interface GeneralItem {
  id: string;
  name: string;
  group: GeneralGroup;
  category: number; // 0..IV
  spaces: number;
  desc: string;
  capacityBonus?: number; // ex.: mochila militar +2
}

export const GENERAL_GROUP_LABEL: Record<GeneralGroup, string> = {
  acessorio: "Acessórios",
  explosivo: "Explosivos",
  operacional: "Itens Operacionais",
  paranormal: "Itens Paranormais",
};

export const GENERAL_ITEMS: GeneralItem[] = [
  // ── Acessórios ──
  { id: "kit-pericia",   name: "Kit de perícia", group: "acessorio", category: 0, spaces: 1, desc: "Ferramentas para uma perícia que exige kit. Sem ele, −5 no teste." },
  { id: "utensilio",     name: "Utensílio",      group: "acessorio", category: 1, spaces: 1, desc: "+2 em uma perícia (exceto Luta/Pontaria). Precisa ser empunhado." },
  { id: "vestimenta",    name: "Vestimenta",     group: "acessorio", category: 1, spaces: 1, desc: "+2 em uma perícia (exceto Luta/Pontaria). Máximo de duas vestimentas." },
  // ── Explosivos ──
  { id: "granada-atordoamento", name: "Granada de atordoamento", group: "explosivo", category: 0, spaces: 1, desc: "Flashbang. Seres na área (raio 6m) ficam atordoados 1 rodada (Fort DT Agi)." },
  { id: "granada-fragmentacao", name: "Granada de fragmentação", group: "explosivo", category: 1, spaces: 1, desc: "8d6 de perfuração em raio 6m (Reflexos DT Agi reduz à metade)." },
  { id: "granada-fumaca",       name: "Granada de fumaça",       group: "explosivo", category: 0, spaces: 1, desc: "Fumaça densa: cega e dá camuflagem total por 2 rodadas." },
  { id: "granada-incendiaria",  name: "Granada incendiária",     group: "explosivo", category: 1, spaces: 1, desc: "6d6 de fogo em raio 6m e condição em chamas (Reflexos DT Agi)." },
  { id: "mina-antipessoal",     name: "Mina antipessoal",        group: "explosivo", category: 1, spaces: 1, desc: "Cone 6m, 12d6 de perfuração (Reflexos DT Int). Instalar exige Tática DT 15." },
  // ── Itens Operacionais ──
  { id: "algemas",          name: "Algemas",          group: "operacional", category: 0, spaces: 1, desc: "Prende os pulsos de um alvo agarrado. Escapar exige Acrobacia DT 30." },
  { id: "arpeu",            name: "Arpéu",            group: "operacional", category: 0, spaces: 1, desc: "Gancho + corda. Prender exige Pontaria DT 15; +5 em Atletismo para subir." },
  { id: "bandoleira",       name: "Bandoleira",       group: "operacional", category: 1, spaces: 1, desc: "Uma vez por rodada, saca/guarda um item como ação livre." },
  { id: "binoculos",        name: "Binóculos",        group: "operacional", category: 0, spaces: 1, desc: "+5 em Percepção para observar coisas distantes." },
  { id: "bloqueador-sinal", name: "Bloqueador de sinal", group: "operacional", category: 1, spaces: 1, desc: "Impede celulares em alcance médio de se conectarem." },
  { id: "cicatrizante",     name: "Cicatrizante",     group: "operacional", category: 1, spaces: 1, desc: "Ação padrão: cura 2d8+2 PV em você ou ser adjacente." },
  { id: "corda",            name: "Corda (10m)",      group: "operacional", category: 0, spaces: 1, desc: "+5 em Atletismo para descer/escalar; amarrar inconscientes." },
  { id: "equip-sobrevivencia", name: "Equipamento de sobrevivência", group: "operacional", category: 0, spaces: 2, desc: "+5 em Sobrevivência para acampar/orientar-se (mesmo destreinado)." },
  { id: "lanterna-tatica",  name: "Lanterna tática",  group: "operacional", category: 1, spaces: 1, desc: "Ilumina o escuro. Ação de movimento: ofusca um ser em alcance curto por 1 rodada." },
  { id: "mascara-gas",      name: "Máscara de gás",   group: "operacional", category: 0, spaces: 1, desc: "+10 em Fortitude contra efeitos que dependem de respiração." },
  { id: "mochila-militar",  name: "Mochila militar",  group: "operacional", category: 1, spaces: 0, desc: "Não ocupa espaço e aumenta sua capacidade de carga em +2 espaços.", capacityBonus: 2 },
  { id: "oculos-termico",   name: "Óculos de visão térmica", group: "operacional", category: 1, spaces: 1, desc: "Elimina a penalidade em testes por camuflagem." },
  { id: "pe-de-cabra",      name: "Pé de cabra",      group: "operacional", category: 0, spaces: 1, desc: "+5 em Força para arrombar portas. Em combate, funciona como um bastão." },
  { id: "pistola-dardos",   name: "Pistola de dardos", group: "operacional", category: 1, spaces: 1, desc: "Ataque à distância: alvo fica inconsciente até o fim da cena (Fort DT Agi)." },
  { id: "pistola-sinalizadora", name: "Pistola sinalizadora", group: "operacional", category: 0, spaces: 1, desc: "Disparo leve, alcance curto, 2d6 de fogo. Sinaliza posição." },
  { id: "soqueira",         name: "Soqueira",         group: "operacional", category: 0, spaces: 1, desc: "+1 em rolagens de dano desarmado. Aceita modificações de armas corpo a corpo." },
  { id: "spray-pimenta",    name: "Spray de pimenta", group: "operacional", category: 1, spaces: 1, desc: "Ação padrão: cega um adjacente por 1d4 rodadas (Fort DT Agi). Dois usos." },
  { id: "taser",            name: "Taser",            group: "operacional", category: 1, spaces: 1, desc: "Ação padrão: 1d6 elétrico e atordoa 1 rodada (Fort DT Agi). Dois usos." },
  { id: "traje-hazmat",     name: "Traje hazmat",     group: "operacional", category: 1, spaces: 2, desc: "+5 em resistência contra efeitos ambientais e RD químico 10." },
  // ── Itens Paranormais (Tabela 3.10) ──
  { id: "amarras-elemento", name: "Amarras de (elemento)", group: "paranormal", category: 2, spaces: 1, desc: "Cordas/correntes de um elemento. Armadilha (3x3m, ação completa + 2 PE; Reflexos DT Int ou imóvel) ou Laçar (ação padrão + 1 PE; Vontade DT Agi ou paralisado, manter 1 PE/rodada)." },
  { id: "camera-aura",      name: "Câmera de aura paranormal", group: "paranormal", category: 2, spaces: 1, desc: "Câmera amaldiçoada com Energia + sigilos de Conhecimento. Foto (ação padrão + 1 PE) revela auras paranormais em pessoas/objetos, na cor do elemento." },
  { id: "componentes-ritualisticos", name: "Componentes ritualísticos de (elemento)", group: "paranormal", category: 0, spaces: 1, desc: "Conjunto de objetos de um elemento (Sangue, Morte, Conhecimento ou Energia — não há de Medo). Necessários para conjurar rituais do elemento." },
  { id: "emissor-pulsos",   name: "Emissor de pulsos paranormais", group: "paranormal", category: 2, spaces: 1, desc: "Isca: ação completa + 1 PE emite pulso de um elemento que atrai criaturas do mesmo elemento e afasta as do oposto (Vontade DT Pre evita)." },
  { id: "escuta-ruidos",    name: "Escuta de ruídos paranormais", group: "paranormal", category: 2, spaces: 1, desc: "Microfone que capta ruídos paranormais. Ação completa + 2 PE grava por até 24h. Ouvir dá +5 em Ocultismo para identificar criatura." },
  { id: "medidor-membrana", name: "Medidor de estabilidade da membrana", group: "paranormal", category: 2, spaces: 1, desc: "Agente treinado em Ocultismo avalia o estado da Membrana numa área (chance de manifestação). Indicativo, não definitivo." },
  { id: "scanner-manifestacao", name: "Scanner de manifestação paranormal de (elemento)", group: "paranormal", category: 2, spaces: 1, desc: "Ativar é ação padrão (1 PE/rodada): sempre sabe a direção de todas as manifestações do elemento escolhido em alcance longo. Detecta também o complemento." },
];

export const GENERAL_BY_ID: Record<string, GeneralItem> = Object.fromEntries(
  GENERAL_ITEMS.map((g) => [g.id, g]),
);

// ─── Patente: limite de itens por categoria (Tabela 3.1) ─────────────────────
// Categoria 0 é ilimitada (só restrita pela carga). Demais conforme a patente.
export const PATENTE_ITEM_LIMITS: Record<string, Record<number, number>> = {
  recruta:  { 1: 2, 2: 0, 3: 0, 4: 0 },
  operador: { 1: 3, 2: 1, 3: 0, 4: 0 },
  agente:   { 1: 3, 2: 2, 3: 1, 4: 0 },
  oficial:  { 1: 3, 2: 3, 3: 2, 4: 1 },
  elite:    { 1: 3, 2: 3, 3: 3, 4: 2 },
};

export function categoryLimit(patente: string, category: number): number {
  if (category <= 0) return Infinity;
  return PATENTE_ITEM_LIMITS[patente]?.[category] ?? 0;
}

// ─── Capacidade de carga ─────────────────────────────────────────────────────
// Espaços = 5 por ponto de Força (Força 0 = 2 espaços), + bônus de itens.
export function carryCapacity(forca: number, bonusSpaces = 0): number {
  return (forca <= 0 ? 2 : forca * 5) + bonusSpaces;
}

// Status de carga. Sobrecarregado: usado > capacidade → −5 Defesa,
// −5 em perícias de carga, −3m de deslocamento. Teto absoluto = 2× capacidade.
export interface LoadStatus {
  used: number;
  capacity: number;
  hardCap: number;       // 2× capacidade
  overloaded: boolean;
  overCap: boolean;      // passou do teto absoluto (inválido)
}

export const OVERLOAD_DEFENSE_PENALTY = 5;
export const OVERLOAD_MOVE_PENALTY = 3; // metros

export function loadStatus(usedSpaces: number, forca: number, bonusSpaces = 0): LoadStatus {
  const capacity = carryCapacity(forca, bonusSpaces);
  const hardCap = capacity * 2;
  return {
    used: usedSpaces,
    capacity,
    hardCap,
    overloaded: usedSpaces > capacity,
    overCap: usedSpaces > hardCap,
  };
}
