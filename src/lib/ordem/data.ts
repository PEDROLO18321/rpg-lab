// ─── ORDEM PARANORMAL RPG — núcleo de regras ─────────────────────────────────
// Mecânica baseada no Livro de Regras (Jambô, v1.2).
// Atributos 0–5 · NEX 5%–99% · perícias por grau de treino · PV/PE/SAN por classe.

// ─── ATRIBUTOS ───────────────────────────────────────────────────────────────

export type AttrKey = "agi" | "for" | "int" | "pre" | "vig";

export const ATTR_KEYS: AttrKey[] = ["agi", "for", "int", "pre", "vig"];

export const ATTR_LABEL: Record<AttrKey, string> = {
  agi: "Agilidade",
  for: "Força",
  int: "Intelecto",
  pre: "Presença",
  vig: "Vigor",
};

export const ATTR_ABBR: Record<AttrKey, string> = {
  agi: "AGI",
  for: "FOR",
  int: "INT",
  pre: "PRE",
  vig: "VIG",
};

export interface OrdemAttrs {
  agi: number;
  for: number;
  int: number;
  pre: number;
  vig: number;
}

// Distribuição inicial: cada atributo começa em 1, 4 pontos para distribuir,
// pode reduzir 1 atributo a 0 para ganhar +1 ponto. Máximo inicial = 3.
export const ATTR_START = 1;
export const ATTR_POINTS = 4;
export const ATTR_MAX_INITIAL = 3;
export const ATTR_MIN = 0;
export const ATTR_MAX = 5;

// ─── PERÍCIAS (28) ───────────────────────────────────────────────────────────

export type TrainDegree = "destreinado" | "treinado" | "veterano" | "expert";

export const TRAIN_BONUS: Record<TrainDegree, number> = {
  destreinado: 0,
  treinado: 5,
  veterano: 10,
  expert: 15,
};

export const TRAIN_LABEL: Record<TrainDegree, string> = {
  destreinado: "Destreinado",
  treinado: "Treinado",
  veterano: "Veterano",
  expert: "Expert",
};

export interface Skill {
  id: string;
  name: string;
  attr: AttrKey;
  trainedOnly: boolean; // só pode ser usada se treinada
  carga: boolean; // sofre penalidade de carga
  kit: boolean; // exige kit de perícia
}

export const SKILLS: Skill[] = [
  { id: "acrobacia",     name: "Acrobacia",     attr: "agi", trainedOnly: false, carga: true,  kit: false },
  { id: "adestramento",  name: "Adestramento",  attr: "pre", trainedOnly: true,  carga: false, kit: false },
  { id: "artes",         name: "Artes",         attr: "pre", trainedOnly: true,  carga: false, kit: false },
  { id: "atletismo",     name: "Atletismo",     attr: "for", trainedOnly: false, carga: false, kit: false },
  { id: "atualidades",   name: "Atualidades",   attr: "int", trainedOnly: false, carga: false, kit: false },
  { id: "ciencias",      name: "Ciências",      attr: "int", trainedOnly: true,  carga: false, kit: false },
  { id: "crime",         name: "Crime",         attr: "agi", trainedOnly: true,  carga: true,  kit: true  },
  { id: "diplomacia",    name: "Diplomacia",    attr: "pre", trainedOnly: false, carga: false, kit: false },
  { id: "enganacao",     name: "Enganação",     attr: "pre", trainedOnly: false, carga: false, kit: true  },
  { id: "fortitude",     name: "Fortitude",     attr: "vig", trainedOnly: false, carga: false, kit: false },
  { id: "furtividade",   name: "Furtividade",   attr: "agi", trainedOnly: false, carga: true,  kit: false },
  { id: "iniciativa",    name: "Iniciativa",    attr: "agi", trainedOnly: false, carga: false, kit: false },
  { id: "intimidacao",   name: "Intimidação",   attr: "pre", trainedOnly: false, carga: false, kit: false },
  { id: "intuicao",      name: "Intuição",      attr: "pre", trainedOnly: false, carga: false, kit: false },
  { id: "investigacao",  name: "Investigação",  attr: "int", trainedOnly: false, carga: false, kit: false },
  { id: "luta",          name: "Luta",          attr: "for", trainedOnly: false, carga: false, kit: false },
  { id: "medicina",      name: "Medicina",      attr: "int", trainedOnly: false, carga: false, kit: true  },
  { id: "ocultismo",     name: "Ocultismo",     attr: "int", trainedOnly: true,  carga: false, kit: false },
  { id: "percepcao",     name: "Percepção",     attr: "pre", trainedOnly: false, carga: false, kit: false },
  { id: "pilotagem",     name: "Pilotagem",     attr: "agi", trainedOnly: true,  carga: false, kit: false },
  { id: "pontaria",      name: "Pontaria",      attr: "agi", trainedOnly: false, carga: false, kit: false },
  { id: "profissao",     name: "Profissão",     attr: "int", trainedOnly: true,  carga: false, kit: false },
  { id: "reflexos",      name: "Reflexos",      attr: "agi", trainedOnly: false, carga: false, kit: false },
  { id: "religiao",      name: "Religião",      attr: "pre", trainedOnly: true,  carga: false, kit: false },
  { id: "sobrevivencia", name: "Sobrevivência", attr: "int", trainedOnly: false, carga: false, kit: false },
  { id: "tatica",        name: "Tática",        attr: "int", trainedOnly: true,  carga: false, kit: false },
  { id: "tecnologia",    name: "Tecnologia",    attr: "int", trainedOnly: true,  carga: false, kit: true  },
  { id: "vontade",       name: "Vontade",       attr: "pre", trainedOnly: false, carga: false, kit: false },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);

// ─── CLASSES ─────────────────────────────────────────────────────────────────

export type ClassId = "combatente" | "especialista" | "ocultista";

export interface OrdemClass {
  id: ClassId;
  name: string;
  description: string;
  // PV/PE/SAN: inicial (NEX 5%) e ganho por novo NEX.
  pvInitial: number; // + Vigor
  pvPerNex: number; // + Vigor
  peInitial: number; // + Presença
  pePerNex: number; // + Presença
  sanInitial: number;
  sanPerNex: number;
  // Perícias treinadas iniciais à escolha = base + Intelecto.
  skillBase: number;
  // Perícias fixas (treinadas garantidas pela classe).
  fixedSkills: string[]; // ids; "luta|pontaria" = escolher uma
  proficiencies: string[];
  famous: string[];
}

export const CLASSES: OrdemClass[] = [
  {
    id: "combatente",
    name: "Combatente",
    description:
      "Perito em armas brancas e de fogo. Linha de frente contra o Outro Lado. Perigoso e durão.",
    pvInitial: 20, pvPerNex: 4,
    peInitial: 2,  pePerNex: 2,
    sanInitial: 12, sanPerNex: 3,
    skillBase: 1,
    fixedSkills: ["luta|pontaria", "fortitude|reflexos"],
    proficiencies: ["Armas simples", "Armas táticas", "Proteções leves"],
    famous: ["Senhor Veríssimo", "Joui Jouki", "Gal", "Tristan Monteiro"],
  },
  {
    id: "especialista",
    name: "Especialista",
    description:
      "Confia em esperteza e conhecimento técnico para resolver problemas. Versátil e habilidoso.",
    pvInitial: 16, pvPerNex: 3,
    peInitial: 3,  pePerNex: 3,
    sanInitial: 16, sanPerNex: 4,
    skillBase: 7,
    fixedSkills: [],
    proficiencies: ["Armas simples", "Proteções leves"],
    famous: ["Aaron", "Arthur Cervero", "Elizabeth Webber", "Chizue Akechi"],
  },
  {
    id: "ocultista",
    name: "Ocultista",
    description:
      "Estudioso do paranormal que domina rituais e os poderes do Outro Lado. Todo poder tem um preço.",
    pvInitial: 12, pvPerNex: 2,
    peInitial: 4,  pePerNex: 4,
    sanInitial: 20, sanPerNex: 5,
    skillBase: 3,
    fixedSkills: ["ocultismo", "vontade"],
    proficiencies: ["Armas simples"],
    famous: ["Agatha Volkomenn", "Dante", "Arnaldo Fritz", "Kian"],
  },
];

export const CLASS_BY_ID: Record<ClassId, OrdemClass> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
) as Record<ClassId, OrdemClass>;

// ─── ELEMENTOS DO OUTRO LADO ─────────────────────────────────────────────────

export type Element = "conhecimento" | "energia" | "morte" | "sangue" | "medo";

export const ELEMENT_LABEL: Record<Element, string> = {
  conhecimento: "Conhecimento",
  energia: "Energia",
  morte: "Morte",
  sangue: "Sangue",
  medo: "Medo",
};

export const ELEMENT_COLOR: Record<Element, string> = {
  conhecimento: "#d4af37", // dourado
  energia: "#b96bd6", // roxo/neon
  morte: "#5a5a5a", // preto/cinza
  sangue: "#a01818", // vermelho
  medo: "#9aa0a6", // prismático/neutro
};

// Elemento opressor (vantagem): chave é efetivo CONTRA valor.
export const ELEMENT_OPPRESSOR: Record<Exclude<Element, "medo">, Element> = {
  sangue: "conhecimento",
  conhecimento: "energia",
  energia: "morte",
  morte: "sangue",
};

// ─── PATENTES ────────────────────────────────────────────────────────────────

export interface Patente {
  id: string;
  name: string;
  minPP: number; // pontos de prestígio mínimos
  credit: string;
}

export const PATENTES: Patente[] = [
  { id: "recruta",  name: "Recruta",              minPP: 0,   credit: "Baixo" },
  { id: "operador", name: "Operador",             minPP: 20,  credit: "Médio" },
  { id: "agente",   name: "Agente Especial",      minPP: 50,  credit: "Médio" },
  { id: "oficial",  name: "Oficial de Operações", minPP: 100, credit: "Alto" },
  { id: "elite",    name: "Agente de Elite",      minPP: 200, credit: "Ilimitado" },
];

export function patenteForPP(pp: number): Patente {
  let result = PATENTES[0];
  for (const p of PATENTES) if (pp >= p.minPP) result = p;
  return result;
}

// ─── NEX ─────────────────────────────────────────────────────────────────────

// Valores oficiais de NEX em ordem. Índice+1 = "nível" para PV/PE/SAN e limite de PE.
export const NEX_VALUES = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
  55, 60, 65, 70, 75, 80, 85, 90, 95, 99,
];

// Quantos "níveis" (passos de NEX) o personagem possui. NEX 5% = 1, NEX 99% = 20.
export function nexLevel(nex: number): number {
  let level = 1;
  for (let i = 0; i < NEX_VALUES.length; i++) {
    if (nex >= NEX_VALUES[i]) level = i + 1;
  }
  return level;
}

// Limite de PE por turno (TABELA 1.2). Igual ao nível de NEX.
export function peLimit(nex: number): number {
  return nexLevel(nex);
}

// ─── CÁLCULOS DERIVADOS ──────────────────────────────────────────────────────

export interface Vitals {
  pvMax: number;
  peMax: number;
  sanMax: number;
}

// PV = (inicial + Vig) + (níveis-1)·(porNex + Vig)
// PE = (inicial + Pre) + (níveis-1)·(porNex + Pre)
// SAN = inicial + (níveis-1)·porNex
export function computeVitals(classId: ClassId, nex: number, vig: number, pre: number, originId?: string): Vitals {
  const c = CLASS_BY_ID[classId];
  const levels = nexLevel(nex);
  const extra = levels - 1;

  let pvMax  = (c.pvInitial + vig) + extra * (c.pvPerNex + vig);
  let peMax  = (c.peInitial + pre) + extra * (c.pePerNex + pre);
  let sanMax = c.sanInitial + extra * c.sanPerNex;

  // Poderes de origem que alteram vitais (aplicados automaticamente).
  switch (originId) {
    case "cultista-arrependido": // Traços do Outro Lado
      sanMax = Math.floor(sanMax / 2);
      break;
    case "desgarrado": // Calejado: +1 PV para cada 5% de NEX
      pvMax += levels;
      break;
    case "vitima": // Cicatrizes Psicológicas: +1 SAN para cada 5% de NEX
      sanMax += levels;
      break;
    case "universitario": { // Dedicação: +1 PE, +1 PE adicional a cada NEX ímpar
      const oddSteps = NEX_VALUES.filter((v) => v <= nex && v >= 15 && ((v - 5) / 10) % 1 === 0).length;
      peMax += 1 + oddSteps;
      break;
    }
  }

  return { pvMax, peMax, sanMax };
}

export function computeDefense(agi: number): number {
  return 10 + agi;
}

export const BASE_MOVEMENT = 9; // metros

// Total de perícias treinadas escolhíveis na criação (base da classe + Intelecto).
export function trainedSkillCount(classId: ClassId, int: number): number {
  return CLASS_BY_ID[classId].skillBase + int;
}

// ─── ROLAGENS ────────────────────────────────────────────────────────────────

export function skillBonus(degree: TrainDegree): number {
  return TRAIN_BONUS[degree];
}

function d20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export interface RollResult {
  dice: number[]; // todos os d20 rolados
  chosen: number; // melhor (ou pior, se atributo 0)
  bonus: number;
  total: number;
  worstChosen: boolean; // true quando atributo 0 (escolhe o pior)
}

// Teste de perícia: rola 1d20 por ponto do atributo-base, escolhe o melhor
// (ou, se o atributo for 0, rola 2d20 e escolhe o pior). Soma bônus de treino.
export function rollSkill(attrValue: number, degree: TrainDegree = "destreinado"): RollResult {
  const bonus = skillBonus(degree);
  if (attrValue <= 0) {
    const dice = [d20(), d20()];
    const chosen = Math.min(...dice);
    return { dice, chosen, bonus, total: chosen + bonus, worstChosen: true };
  }
  const dice = Array.from({ length: attrValue }, () => d20());
  const chosen = Math.max(...dice);
  return { dice, chosen, bonus, total: chosen + bonus, worstChosen: false };
}

// Resultado bruto de um atributo (sem perícia): mesma mecânica, sem bônus de treino.
export function rollAttr(attrValue: number): RollResult {
  return rollSkill(attrValue, "destreinado");
}
