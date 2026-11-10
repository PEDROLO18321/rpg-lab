// ─── CYBERPUNK RED — validação do Pacote Completo (Método 3) ─────────────────
// No Pacote Completo o jogador distribui 62 pontos entre os 10 atributos (cada
// um de 2 a 8) e 86 pontos de perícia (nível máximo 6 na criação; perícias ×2
// custam o dobro por nível). As 13 básicas precisam estar no mínimo em 2, e o
// idioma da origem cultural (+4) é grátis, por isso fica fora da conta.
// Valida e explica o erro — quem monta a ficha é a rota/UI. Sem I/O.

import {
  BASIC_SKILL_KEYS, COMPLETE_SKILL_POINTS, COMPLETE_STAT_POINTS, SKILL_MAX_AT_CREATION,
  STAT_KEYS, STAT_MAX, STAT_MIN, getSkillDef, skillBaseKey, skillPointCost,
  type Stats,
} from "./data";

export interface CompletePackageResult {
  /** Sem nenhuma violação de regra (pode ainda sobrar pontos). */
  valid: boolean;
  /** Valid e todos os pontos gastos. */
  complete: boolean;
  statPointsUsed: number;
  statPointsLeft: number;
  skillPointsUsed: number;
  skillPointsLeft: number;
  errors: string[];
}

/** Chaves de perícia básica que precisam de nível ≥ 2 (idioma e conhecimento local aceitam qualquer especialidade). */
function hasBasic(skills: Record<string, number>, baseKey: string): boolean {
  return Object.entries(skills).some(([k, lvl]) => skillBaseKey(k) === baseKey && lvl >= 2);
}

export function validateCompletePackage(input: {
  stats: Stats;
  skills: Record<string, number>;
  /** Chave do idioma cultural (+4 grátis), ex. "language:portuguese". */
  freeLanguageKey?: string;
}): CompletePackageResult {
  const errors: string[] = [];

  let statPointsUsed = 0;
  for (const k of STAT_KEYS) {
    const v = input.stats[k];
    if (!Number.isInteger(v)) { errors.push(`Atributo ${k.toUpperCase()} inválido.`); continue; }
    if (v < STAT_MIN || v > STAT_MAX) errors.push(`Atributo ${k.toUpperCase()} deve ficar entre ${STAT_MIN} e ${STAT_MAX}.`);
    statPointsUsed += v;
  }
  if (statPointsUsed > COMPLETE_STAT_POINTS) errors.push(`Atributos gastam ${statPointsUsed} pontos; o limite é ${COMPLETE_STAT_POINTS}.`);

  let skillPointsUsed = 0;
  for (const [key, level] of Object.entries(input.skills)) {
    if (!getSkillDef(key)) { errors.push(`Perícia desconhecida: ${key}.`); continue; }
    if (!Number.isInteger(level) || level < 0) { errors.push(`Nível inválido em ${key}.`); continue; }
    if (level > SKILL_MAX_AT_CREATION) errors.push(`${key} passa do nível máximo ${SKILL_MAX_AT_CREATION} na criação.`);
    if (key === input.freeLanguageKey) {
      // O +4 do idioma cultural é de graça; só o que passar de 4 custa.
      skillPointsUsed += skillPointCost(key, Math.max(0, level - 4));
      continue;
    }
    skillPointsUsed += skillPointCost(key, level);
  }
  if (skillPointsUsed > COMPLETE_SKILL_POINTS) errors.push(`Perícias gastam ${skillPointsUsed} pontos; o limite é ${COMPLETE_SKILL_POINTS}.`);

  for (const base of BASIC_SKILL_KEYS) {
    if (!hasBasic(input.skills, base)) errors.push(`A perícia básica "${base}" precisa estar no mínimo em 2.`);
  }

  const valid = errors.length === 0;
  return {
    valid,
    complete: valid && statPointsUsed === COMPLETE_STAT_POINTS && skillPointsUsed === COMPLETE_SKILL_POINTS,
    statPointsUsed,
    statPointsLeft: COMPLETE_STAT_POINTS - statPointsUsed,
    skillPointsUsed,
    skillPointsLeft: COMPLETE_SKILL_POINTS - skillPointsUsed,
    errors,
  };
}
