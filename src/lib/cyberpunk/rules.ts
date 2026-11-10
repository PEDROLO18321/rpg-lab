// ─── CYBERPUNK RED — regras puras (sem I/O) ──────────────────────────────────
// Toda função aqui é determinística: quem precisa de aleatoriedade recebe um
// `rng` injetável (padrão Math.random). É isso que permite testar o d10 que
// "explode" e "implode" sem sorte nenhuma, e manter a lib livre de I/O.
//
// Fórmulas conferidas no livro-base:
//  - HP = 10 + 5 × ceil((CORPO + VONTADE) / 2); limiar de Gravemente Ferido = ceil(HP/2).
//  - Salvaguarda contra a Morte: rola 1d10 + penalidade e precisa ficar ESTRITAMENTE
//    abaixo do CORPO; um 10 natural sempre falha.
//  - Arma branca ignora metade da armadura: PA efetivo = ceil(PA / 2).
//  - Humanidade = EMP × 10; a EMP atual é floor(Humanidade / 10) (calculada, nunca fixa).

export type Rng = () => number;

/** d(sides) com rng injetável: devolve 1..sides. */
export function rollD(sides: number, rng: Rng = Math.random): number {
  return Math.floor(rng() * sides) + 1;
}

export function parseDice(expr: string): { count: number; sides: number } {
  const m = /^(\d+)d(\d+)$/i.exec(expr.trim());
  if (!m) throw new Error(`Expressão de dados inválida: ${expr}`);
  return { count: Number(m[1]), sides: Number(m[2]) };
}

export function rollDice(expr: string, rng: Rng = Math.random): { dice: number[]; total: number } {
  const { count, sides } = parseDice(expr);
  const dice = Array.from({ length: count }, () => rollD(sides, rng));
  return { dice, total: dice.reduce((a, b) => a + b, 0) };
}

// ─── Derivados ──────────────────────────────────────────────────────────────

/** HP = 10 + 5 × (média de CORPO e VONTADE arredondada para cima). */
export function hpMax(body: number, will: number): number {
  return 10 + 5 * Math.ceil((body + will) / 2);
}

/** Limiar de Gravemente Ferido: metade do HP máximo, arredondada para cima. */
export function seriousThreshold(hp: number): number {
  return Math.ceil(hp / 2);
}

/** Alvo da Salvaguarda contra a Morte = CORPO. */
export function deathSave(body: number): number {
  return body;
}

/**
 * Resolve uma Salvaguarda contra a Morte. O teste é "rolar ABAIXO do CORPO":
 * 1d10 + penalidade acumulada precisa ser < CORPO. Um 10 natural sempre falha,
 * mesmo que o CORPO fosse alto o bastante para tolerá-lo.
 */
export function deathSaveSucceeds(body: number, penalty: number, roll: number): boolean {
  if (roll === 10) return false;
  return roll + penalty < body;
}

/** Cada salvaguarda feita aumenta a penalidade em +1 (acumulativo). */
export function nextDeathSavePenalty(penalty: number): number {
  return penalty + 1;
}

/** Humanidade máxima = EMP × 10 menos a perda permanente (terapia/ciberware mantido). */
export function humanityMax(emp: number, permanentLoss = 0): number {
  return Math.max(0, emp * 10 - permanentLoss);
}

/** EMP efetiva cai sempre que a dezena da Humanidade cai: HUM 44 → 4, HUM 39 → 3. */
export function currentEmp(humanity: number): number {
  return Math.max(0, Math.floor(humanity / 10));
}

/** Humanidade abaixo de zero = ciberpsicose (o personagem vira NPC do Mestre). */
export function isCyberpsycho(humanity: number): boolean {
  return humanity < 0;
}

/** Base de um teste de perícia: ATRIBUTO + nível (o d10 e o modificador entram depois). */
export function skillBase(stat: number, level: number): number {
  return stat + level;
}

// ─── Ferimentos ─────────────────────────────────────────────────────────────

export type WoundState = "ok" | "leve" | "grave" | "mortal";

export interface WoundInfo {
  state: WoundState;
  /** Penalidade em todas as Ações (os estados não se acumulam, um substitui o outro). */
  actionPenalty: number;
  /** Penalidade em MOVIMENTO (mínimo final 1 é aplicado por quem usa). */
  movePenalty: number;
  /** DV para estabilizar (Primeiros Socorros/Paramédico); null se estiver ileso. */
  stabilizeDv: number | null;
}

/**
 * Estado de ferimento a partir do HP atual e máximo.
 * HP < 1 = Mortalmente Ferido; HP < metade = Gravemente Ferido; HP < máximo = Levemente.
 */
export function woundState(hp: number, max: number): WoundInfo {
  if (hp < 1) return { state: "mortal", actionPenalty: -4, movePenalty: -6, stabilizeDv: 15 };
  if (hp < seriousThreshold(max)) return { state: "grave", actionPenalty: -2, movePenalty: 0, stabilizeDv: 13 };
  if (hp < max) return { state: "leve", actionPenalty: 0, movePenalty: 0, stabilizeDv: 10 };
  return { state: "ok", actionPenalty: 0, movePenalty: 0, stabilizeDv: null };
}

/** MOVIMENTO após penalidades: nunca abaixo de 1 (regra de ferimento), nunca abaixo de 0 (armadura). */
export function effectiveMove(move: number, penalty: number, wounded = false): number {
  const v = move + penalty;
  return Math.max(wounded ? 1 : 0, v);
}

/** Uma Ação de Movimento anda MOVIMENTO × 2 m; correr (2ª ação de movimento) dobra: × 4 por turno. */
export function moveDistance(move: number, running = false): number {
  return move * (running ? 4 : 2);
}

// ─── Armadura e dano ────────────────────────────────────────────────────────

/** Ataque corpo a corpo ignora metade da armadura (arredonda para cima). Briga NÃO tem esse efeito. */
export function effectiveSp(sp: number, melee: boolean): number {
  return melee ? Math.ceil(sp / 2) : sp;
}

export interface DamageInput {
  /** PA atual do local atingido. */
  sp: number;
  /** Dano já rolado (soma dos dados). */
  damage: number;
  /** Arma branca (metade da armadura ignorada). Briga/artes marciais passam false. */
  melee?: boolean;
  /** Tiro mirado na cabeça: dano que atravessa a armadura é multiplicado. */
  headshot?: boolean;
  /** Ferimento Crânio Rachado: multiplicador da cabeça vai de ×2 para ×3. */
  crackedSkull?: boolean;
  /** Dois ou mais 6 nos dados: +5 de dano direto ao HP (não multiplicado, não ablaciona). */
  critical?: boolean;
  /** Veneno, fogo etc. ignoram a armadura. */
  ignoreArmor?: boolean;
}

export interface DamageResult {
  damageTaken: number;
  newSp: number;
  effectiveSp: number;
  throughArmor: number;
  bonusDamage: number;
}

/**
 * Aplica o dano: subtrai a PA efetiva, multiplica na cabeça o que passou, soma o
 * bônus de crítico (+5 direto ao HP, mesmo que nada tenha passado) e ablaciona a
 * armadura em 1 — só se alguma coisa atravessou, e sobre a PA real (não a metade).
 */
export function applyDamage(input: DamageInput): DamageResult {
  const eff = input.ignoreArmor ? 0 : effectiveSp(input.sp, !!input.melee);
  const through = Math.max(0, input.damage - eff);
  const mult = input.headshot ? (input.crackedSkull ? 3 : 2) : 1;
  const bonusDamage = input.critical ? 5 : 0;
  const ablates = through > 0 && !input.ignoreArmor;
  return {
    damageTaken: through * mult + bonusDamage,
    newSp: ablates ? Math.max(0, input.sp - 1) : input.sp,
    effectiveSp: eff,
    throughArmor: through,
    bonusDamage,
  };
}

/** Ferimento Crítico: dois ou mais dados de dano mostrando 6. */
export function isCritical(dice: number[]): boolean {
  return dice.filter((d) => d === 6).length >= 2;
}

/** Dano de Briga por CORPO: ≤4 → 1d6; 5-6 → 2d6; 7-10 → 3d6; 11+ → 4d6. */
export function brawlingDamage(body: number): string {
  if (body <= 4) return "1d6";
  if (body <= 6) return "2d6";
  if (body <= 10) return "3d6";
  return "4d6";
}

// ─── Testes de perícia ──────────────────────────────────────────────────────

export interface CheckResult {
  natural: number;
  /** Segunda rolagem quando o d10 natural foi 10 (soma) ou 1 (subtrai). */
  extra: number | null;
  kind: "explode" | "implode" | null;
  total: number;
}

/**
 * ATRIBUTO + perícia + modificador + 1d10. Um 10 natural "explode" (soma mais um
 * d10, uma vez só); um 1 natural "implode" (subtrai mais um d10, uma vez só).
 */
export function rollCheck(stat: number, skill: number, modifier = 0, rng: Rng = Math.random): CheckResult {
  const base = stat + skill + modifier;
  const natural = rollD(10, rng);
  if (natural === 10) {
    const extra = rollD(10, rng);
    return { natural, extra, kind: "explode", total: base + natural + extra };
  }
  if (natural === 1) {
    const extra = rollD(10, rng);
    return { natural, extra, kind: "implode", total: base + natural - extra };
  }
  return { natural, extra: null, kind: null, total: base + natural };
}

/** O total precisa SUPERAR a DV; empate vai para a DV/defensor. */
export function beatsDv(total: number, dv: number): boolean {
  return total > dv;
}

/** Iniciativa = REF + 1d10. */
export function rollInitiative(ref: number, rng: Rng = Math.random): number {
  return ref + rollD(10, rng);
}

// ─── Pontos de Melhoria (IP) ────────────────────────────────────────────────

/** Custo para chegar ao NOVO nível (não se pula nível): 20 × nível, ou 40 × nível nas perícias ×2. */
export function ipCost(level: number, x2 = false): number {
  return (x2 ? 40 : 20) * level;
}

/** Custo para chegar ao novo Grau do Papel: 60 × grau. */
export function roleRankCost(rank: number): number {
  return 60 * rank;
}

/** IP total para subir de `from` até `to` (soma de cada degrau). */
export function ipCostRange(from: number, to: number, x2 = false): number {
  let sum = 0;
  for (let l = from + 1; l <= to; l++) sum += ipCost(l, x2);
  return sum;
}

// ─── Distância e DV de tiro ─────────────────────────────────────────────────

export type RangedType =
  | "pistol" | "smg" | "shotgun" | "assaultRifle" | "sniperRifle"
  | "bow" | "grenadeLauncher" | "rocketLauncher";

/** Limites superiores das faixas (m): 6, 12, 25, 50, 100, 200, 400, 800. */
export const RANGE_BANDS = [6, 12, 25, 50, 100, 200, 400, 800] as const;

const NA = null;
// Tabela de DV por faixa (livro, p.173). null = fora de alcance.
export const RANGED_DV: Record<RangedType, readonly (number | null)[]> = {
  pistol: [13, 15, 20, 25, 30, 30, NA, NA],
  smg: [15, 13, 15, 20, 25, 25, 30, NA],
  shotgun: [13, 15, 20, 25, 30, 35, NA, NA],
  assaultRifle: [17, 16, 15, 13, 15, 20, 25, 30],
  sniperRifle: [30, 25, 25, 20, 15, 16, 17, 20],
  bow: [15, 13, 15, 17, 20, 22, NA, NA],
  grenadeLauncher: [16, 15, 15, 17, 20, 22, 25, NA],
  rocketLauncher: [17, 16, 15, 15, 20, 20, 25, 30],
};

export type AutofireType = "smg" | "assaultRifle";
// Faixas: 0-6, 7-12, 13-25, 26-50, 51-100 (acima disso, sem fogo automático).
export const AUTOFIRE_DV: Record<AutofireType, readonly number[]> = {
  smg: [20, 17, 20, 25, 30],
  assaultRifle: [22, 20, 17, 20, 25],
};

function bandIndex(distance: number): number {
  for (let i = 0; i < RANGE_BANDS.length; i++) if (distance <= RANGE_BANDS[i]) return i;
  return -1;
}

/** DV para acertar a `distance` metros com tiro simples; null se fora de alcance. */
export function rangedDv(weaponType: RangedType, distance: number): number | null {
  if (distance < 0) return null;
  const i = bandIndex(distance);
  return i < 0 ? null : RANGED_DV[weaponType][i];
}

/** DV do fogo automático; null além de 100 m. */
export function autofireDv(weaponType: AutofireType, distance: number): number | null {
  if (distance < 0) return null;
  const i = bandIndex(distance);
  return i < 0 || i >= 5 ? null : AUTOFIRE_DV[weaponType][i];
}

/**
 * Dano do fogo automático: 2d6 × quanto o ataque superou a DV, limitado ao
 * multiplicador da arma (SMG ×3, fuzil ×4). Errar a DV = nenhum dano.
 */
export function autofireDamage(dice2d6Total: number, beatenBy: number, multiplierCap: number): number {
  if (beatenBy <= 0) return 0;
  return dice2d6Total * Math.min(beatenBy, multiplierCap);
}
