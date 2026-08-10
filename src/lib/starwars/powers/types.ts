// Star Wars: Além da Fronteira — tipos compartilhados de habilidades de classe e Poderes Gerais

export interface ClassAbility {
  level: number;
  name: string;
  combat: boolean;
  description: string;
  /** Só nas 3 classes-base ligadas à Força: marca a habilidade de domínio/especialização de forma. */
  formTag?: "primeiras_formas" | "segundas_formas" | "formas_completas" | "dominio" | "especializacao";
  /** Custo em Pontos de Energia (PE) pra usar a habilidade — ver PODEEEER.md. */
  peCost: number;
  /** Dano rolado (combate) — ex. "2d6". Ausente quando a habilidade é `dt`-based ou `weaponDamage`-based. */
  damageDice?: string;
  /**
   * Golpe de sabre de luz: dano NÃO segue a escala por círculo/marco — é sempre
   * 6d6 × atributo base usado (AGI, FOR ou SEN — o maior) + valor total da perícia
   * Sabres de Luz. Substitui `damageDice` quando presente.
   */
  weaponDamage?: "sabre";
  /** DT fixa que o teste de perícia relevante precisa bater (habilidades não-combate). */
  dt?: number;
  /** Perícia (id de skills.ts) rolada contra `dt`, nas classes que usam o sistema de Pools. */
  skillId?: string;
  /** Cura em vez de dano (raras: ex. Cura da Força, Cura Instintiva). */
  heal?: boolean;
  /** Cura OU dano à escolha do jogador (Médico nível 30/40). */
  healOrDamage?: boolean;
}

export interface ClassMilestone {
  level: number;
  name: string;
  description: string;
  /** Marcos das 17 classes sem ligação à Força são sempre combate; nas 3 ligadas à Força,
   *  cada marco/grau tem 1 combate + 1 utilitário. */
  combat: boolean;
  peCost: number;
  damageDice?: string;
  weaponDamage?: "sabre";
  /** Só nas 3 classes-base ligadas à Força, se um marco raro vier a marcar domínio/especialização de forma. */
  formTag?: "primeiras_formas" | "segundas_formas" | "formas_completas" | "dominio" | "especializacao";
  dt?: number;
  /** Perícia (id de skills.ts) rolada contra `dt`, nas classes que usam o sistema de Pools. */
  skillId?: string;
  heal?: boolean;
  healOrDamage?: boolean;
}

export interface ClassAbilityTable {
  classId: string;
  /** Habilidades dos 5 círculos (níveis 1-20), visíveis desde a criação. */
  abilities: ClassAbility[];
  /** Marcos nos níveis 25/30/35/40 — ocultos até completar o 5º círculo. Nas 3 classes ligadas à
   *  Força, os níveis 25 e 40 acumulam mais de um marco (efeito da progressão 30→25 e 99→40). */
  milestones: ClassMilestone[];
}

export type PowerCost = 1 | 2 | 3 | 4 | 5;
export type PowerSustain = "instantaneo" | "sustentado";

export interface GeneralPower {
  id: string;
  name: string;
  cost: PowerCost;
  sustain: PowerSustain;
  description: string;
  tier: "basico" | "avancado";
  /** Pré-requisito textual (nível mínimo, atributo mínimo ou perícia treinada) — só nos avançados. */
  prerequisite?: string;
}

/** Poder de classe (ou Poder Geral) escolhido pelo personagem ao subir de nível — persistido em StarWarsSheet.classPowers. */
export interface ChosenPower {
  level: number;
  id: string;
  name: string;
  source: "classe" | "geral";
  classId?: string;
}
