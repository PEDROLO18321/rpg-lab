// Star Wars: Além da Fronteira — escala de dano por nível.
// Regra: Dano Final = Dano Base × (1 + Nível / 5). "Base" é o dano no nível 1
// (o valor cadastrado na habilidade/item). Funciona pra qualquer nível, sem teto.
// Vale para dano de habilidades de classe, Poderes Gerais (quando tiverem valor
// numérico) e itens equipados. NÃO vale para o golpe de sabre "cru" (Investida de
// Sabre, Corte Duplo etc.), que mantém sua regra própria (6d6 × atributo + perícia)
// pra não empilhar dois multiplicadores.

export function damageLevelMultiplier(level: number): number {
  return 1 + level / 5;
}

const DICE_RE = /^(\d+)d(\d+)$/;

/** Média de uma notação de dado pura (ex. "4d6" → 14). Retorna null se não for dado puro. */
export function diceAverage(notation: string): number | null {
  const m = notation.trim().match(DICE_RE);
  if (!m) return null;
  const n = parseInt(m[1], 10), sides = parseInt(m[2], 10);
  return n * (sides + 1) / 2;
}

/** Valor de referência pra escalar: dado puro vira média, número puro fica como está. Formatos mistos (ex. com texto) retornam null — não escalam automaticamente. */
export function baseDamageValue(notation: string): number | null {
  const dice = diceAverage(notation);
  if (dice !== null) return dice;
  const n = Number(notation.trim());
  return Number.isFinite(n) ? n : null;
}

export function scaledDamage(base: number, level: number): number {
  return Math.round(base * damageLevelMultiplier(level));
}
