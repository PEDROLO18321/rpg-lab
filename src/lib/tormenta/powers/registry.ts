// ─── TORMENTA 20 — Registro unificado de Poderes ─────────────────────────────
// Junta todos os catálogos extraídos em um único ponto de consulta, usado pelo
// modal de subida de nível. "Poderes Gerais" = Combate + Destino + Magia +
// Tormenta + Concedidos — qualquer um pode substituir um Poder de Classe
// (pág. 33 do livro: "você pode sempre substituir um poder de classe por um
// poder geral").

import { ATTRIBUTE_INCREASE_POWER, type Power } from "./types";
import { COMBAT_POWERS } from "./combat";
import { DESTINY_POWERS, MAGIC_POWERS, TORMENTA_POWERS } from "./destinyMagicTormenta";
import { GRANTED_POWERS } from "./granted";
import {
  ARCANISTA_LEVELS, ARCANISTA_POWERS, ARCANISTA_FEATURES,
  BARBARO_LEVELS, BARBARO_POWERS, BARBARO_FEATURES,
  BARDO_LEVELS, BARDO_POWERS, BARDO_FEATURES,
  BUCANEIRO_LEVELS, BUCANEIRO_POWERS, BUCANEIRO_FEATURES,
  CACADOR_LEVELS, CACADOR_POWERS, CACADOR_FEATURES,
  type ClassLevelRow, type ClassFeature,
} from "./classGroupA";
import {
  CAVALEIRO_LEVELS, CAVALEIRO_POWERS, CAVALEIRO_FEATURES,
  CLERIGO_LEVELS, CLERIGO_POWERS, CLERIGO_FEATURES,
  DRUIDA_LEVELS, DRUIDA_POWERS, DRUIDA_FEATURES,
  GUERREIRO_LEVELS, GUERREIRO_POWERS, GUERREIRO_FEATURES,
  INVENTOR_LEVELS, INVENTOR_POWERS, INVENTOR_FEATURES,
} from "./classGroupB";
import {
  LADINO_LEVELS, LADINO_POWERS, LADINO_FEATURES,
  LUTADOR_LEVELS, LUTADOR_POWERS, LUTADOR_FEATURES,
  NOBRE_LEVELS, NOBRE_POWERS, NOBRE_FEATURES,
  PALADINO_LEVELS, PALADINO_POWERS, PALADINO_FEATURES,
} from "./classGroupC";

export type { Power, PowerCategory } from "./types";
export type { ClassLevelRow, ClassFeature } from "./classGroupA";

export const GENERAL_POWERS: Power[] = [
  ...COMBAT_POWERS,
  ...DESTINY_POWERS,
  ...MAGIC_POWERS,
  ...TORMENTA_POWERS,
  ...GRANTED_POWERS,
];

const CLASS_POWERS: Record<string, Power[]> = {
  arcanista: ARCANISTA_POWERS, barbaro: BARBARO_POWERS, bardo: BARDO_POWERS,
  bucaneiro: BUCANEIRO_POWERS, cacador: CACADOR_POWERS, cavaleiro: CAVALEIRO_POWERS,
  clerigo: CLERIGO_POWERS, druida: DRUIDA_POWERS, guerreiro: GUERREIRO_POWERS,
  inventor: INVENTOR_POWERS, ladino: LADINO_POWERS, lutador: LUTADOR_POWERS,
  nobre: NOBRE_POWERS, paladino: PALADINO_POWERS,
};

const CLASS_LEVELS: Record<string, ClassLevelRow[]> = {
  arcanista: ARCANISTA_LEVELS, barbaro: BARBARO_LEVELS, bardo: BARDO_LEVELS,
  bucaneiro: BUCANEIRO_LEVELS, cacador: CACADOR_LEVELS, cavaleiro: CAVALEIRO_LEVELS,
  clerigo: CLERIGO_LEVELS, druida: DRUIDA_LEVELS, guerreiro: GUERREIRO_LEVELS,
  inventor: INVENTOR_LEVELS, ladino: LADINO_LEVELS, lutador: LUTADOR_LEVELS,
  nobre: NOBRE_LEVELS, paladino: PALADINO_LEVELS,
};

const CLASS_FEATURES: Record<string, ClassFeature[]> = {
  arcanista: ARCANISTA_FEATURES, barbaro: BARBARO_FEATURES, bardo: BARDO_FEATURES,
  bucaneiro: BUCANEIRO_FEATURES, cacador: CACADOR_FEATURES, cavaleiro: CAVALEIRO_FEATURES,
  clerigo: CLERIGO_FEATURES, druida: DRUIDA_FEATURES, guerreiro: GUERREIRO_FEATURES,
  inventor: INVENTOR_FEATURES, ladino: LADINO_FEATURES, lutador: LUTADOR_FEATURES,
  nobre: NOBRE_FEATURES, paladino: PALADINO_FEATURES,
};

export function getClassPowers(classId: string): Power[] {
  return CLASS_POWERS[classId] ?? [];
}

export function getClassLevelTable(classId: string): ClassLevelRow[] {
  return CLASS_LEVELS[classId] ?? [];
}

export function getClassFeatures(classId: string): ClassFeature[] {
  return CLASS_FEATURES[classId] ?? [];
}

export function getFeaturesAtLevel(classId: string, level: number): ClassFeature[] {
  return getClassFeatures(classId).filter((f) => f.level === level);
}

// Todos os poderes disponíveis para escolha ao subir de nível: da própria
// classe (incluindo "Aumento de Atributo") + qualquer Poder Geral.
export function getAvailablePowers(classId: string): Power[] {
  return [ATTRIBUTE_INCREASE_POWER, ...getClassPowers(classId), ...GENERAL_POWERS];
}

export const POWER_BY_ID: Record<string, Power> = Object.fromEntries(
  [ATTRIBUTE_INCREASE_POWER, ...GENERAL_POWERS,
    ...Object.values(CLASS_POWERS).flat(),
  ].map((p) => [p.id, p]),
);
