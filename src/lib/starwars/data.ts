// Star Wars: Além da Fronteira — sistema autoral, base do sistema (atributos, criação, graus de treinamento)

export type AttrKey = "agi" | "int" | "forca" | "vig" | "pre" | "sen";

export const ATTR_LABEL: Record<AttrKey, string> = {
  agi: "Agilidade",
  int: "Inteligência",
  forca: "Força",
  vig: "Vigor",
  pre: "Presença",
  sen: "Sensitividade",
};

export const ATTR_ABBR: Record<AttrKey, string> = {
  agi: "AGI",
  int: "INT",
  forca: "FOR",
  vig: "VIG",
  pre: "PRE",
  sen: "SEN",
};

export const ATTR_KEYS: AttrKey[] = ["agi", "int", "forca", "vig", "pre", "sen"];

export type StarWarsAttrs = Record<AttrKey, number>;

export const BASE_ATTR_VALUE = 0;

/** Regra: 7 pontos livres na criação, distribuídos entre os 6 atributos. */
export const ATTR_CREATION_POINTS = 7;

/** Teto por atributo individual na criação — evita o build extremo de "um 7, resto 0". */
export const ATTR_CREATION_MAX_PER_ATTR = 4;

export function attrPointsSpent(attrs: StarWarsAttrs): number {
  return ATTR_KEYS.reduce((sum, k) => sum + Math.max(0, attrs[k] - BASE_ATTR_VALUE), 0);
}

export function attrPointsRemaining(attrs: StarWarsAttrs): number {
  return ATTR_CREATION_POINTS - attrPointsSpent(attrs);
}

export function attrsValid(attrs: StarWarsAttrs): boolean {
  return attrPointsRemaining(attrs) === 0
    && ATTR_KEYS.every((k) => attrs[k] >= 0 && attrs[k] - BASE_ATTR_VALUE <= ATTR_CREATION_MAX_PER_ATTR);
}

/** Graus de treinamento em perícia — bônus somado ao teste. */
export type SkillGrade = "inexperiente" | "iniciante" | "treinado" | "expert" | "veterano" | "mestre";

export const SKILL_GRADE_BONUS: Record<SkillGrade, number> = {
  inexperiente: 0,
  iniciante: 5,
  treinado: 10,
  expert: 15,
  veterano: 20,
  mestre: 25,
};

export const SKILL_GRADE_LABEL: Record<SkillGrade, string> = {
  inexperiente: "Inexperiente",
  iniciante: "Iniciante",
  treinado: "Treinado",
  expert: "Expert",
  veterano: "Veterano",
  mestre: "Mestre",
};

export const SKILL_GRADE_ORDER: SkillGrade[] = [
  "inexperiente",
  "iniciante",
  "treinado",
  "expert",
  "veterano",
  "mestre",
];

export function nextSkillGrade(grade: SkillGrade): SkillGrade | null {
  const idx = SKILL_GRADE_ORDER.indexOf(grade);
  if (idx === -1 || idx === SKILL_GRADE_ORDER.length - 1) return null;
  return SKILL_GRADE_ORDER[idx + 1];
}

export type Path = "luz" | "neutro" | "sombrio";

export const PATH_LABEL: Record<Path, string> = {
  luz: "Lado da Luz",
  neutro: "Neutro",
  sombrio: "Lado Sombrio",
};
