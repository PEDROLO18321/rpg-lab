/**
 * Regras de avanço de personagem (D&D 5e, Livro do Jogador).
 *
 * Fontes (basement/LivroJogador.md):
 *  - "Além do 1° Nível" + tabela Avanço de Personagem (XP / Bônus de Proficiência)
 *  - Tabelas de classe (características por nível, espaços de magia,
 *    truques/magias conhecidas, melhorias de atributo)
 *
 * Pontos de vida ao subir: rolar o Dado de Vida + mod. CON, OU usar o valor
 * fixo médio (dado/2 + 1, arredondado para cima). Mínimo de 1 PV por nível.
 * Quando o mod. de CON aumenta, o PV máximo sobe retroativamente em +1 por nível.
 */

import type { AbilityKey } from "./races";

// ── Avanço de Personagem ──────────────────────────────────────────────────────

/** XP mínimo para alcançar cada nível (índice = nível; [0] não usado). */
export const XP_THRESHOLDS = [
  0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
] as const;

export const MAX_LEVEL = 20;

/** Bônus de proficiência pelo nível total (tabela Avanço de Personagem). */
export function proficiencyBonus(level: number): number {
  return Math.ceil(Math.max(1, Math.min(level, 20)) / 4) + 1;
}

/** Valor fixo de PV por nível: média do Dado de Vida arredondada para cima. */
export function averageHpGain(hitDie: number): number {
  return Math.floor(hitDie / 2) + 1;
}

// ── Melhoria de Valor de Habilidade (ASI) ─────────────────────────────────────

const ASI_DEFAULT = [4, 8, 12, 16, 19];

/** Níveis em que cada classe recebe Melhoria de Valor de Habilidade. */
export const ASI_LEVELS: Record<string, number[]> = {
  barbaro: ASI_DEFAULT,
  bardo: ASI_DEFAULT,
  bruxo: ASI_DEFAULT,
  clerigo: ASI_DEFAULT,
  druida: ASI_DEFAULT,
  feiticeiro: ASI_DEFAULT,
  guerreiro: [4, 6, 8, 12, 14, 16, 19],
  ladino: [4, 8, 10, 12, 16, 19],
  mago: ASI_DEFAULT,
  monge: ASI_DEFAULT,
  paladino: ASI_DEFAULT,
  patrulheiro: ASI_DEFAULT,
};

export function hasAsiAt(classId: string, level: number): boolean {
  return (ASI_LEVELS[classId] ?? ASI_DEFAULT).includes(level);
}

// ── Espaços de Magia ──────────────────────────────────────────────────────────

/** Conjurador completo (bardo, clérigo, druida, feiticeiro, mago): slots 1º–9º. */
const FULL_CASTER_SLOTS: number[][] = [
  /* 1*/ [2],
  /* 2*/ [3],
  /* 3*/ [4, 2],
  /* 4*/ [4, 3],
  /* 5*/ [4, 3, 2],
  /* 6*/ [4, 3, 3],
  /* 7*/ [4, 3, 3, 1],
  /* 8*/ [4, 3, 3, 2],
  /* 9*/ [4, 3, 3, 3, 1],
  /*10*/ [4, 3, 3, 3, 2],
  /*11*/ [4, 3, 3, 3, 2, 1],
  /*12*/ [4, 3, 3, 3, 2, 1],
  /*13*/ [4, 3, 3, 3, 2, 1, 1],
  /*14*/ [4, 3, 3, 3, 2, 1, 1],
  /*15*/ [4, 3, 3, 3, 2, 1, 1, 1],
  /*16*/ [4, 3, 3, 3, 2, 1, 1, 1],
  /*17*/ [4, 3, 3, 3, 2, 1, 1, 1, 1],
  /*18*/ [4, 3, 3, 3, 3, 1, 1, 1, 1],
  /*19*/ [4, 3, 3, 3, 3, 2, 1, 1, 1],
  /*20*/ [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/** Meio-conjurador (paladino, patrulheiro): conjuração começa no 2° nível. */
const HALF_CASTER_SLOTS: number[][] = [
  /* 1*/ [],
  /* 2*/ [2],
  /* 3*/ [3],
  /* 4*/ [3],
  /* 5*/ [4, 2],
  /* 6*/ [4, 2],
  /* 7*/ [4, 3],
  /* 8*/ [4, 3],
  /* 9*/ [4, 3, 2],
  /*10*/ [4, 3, 2],
  /*11*/ [4, 3, 3],
  /*12*/ [4, 3, 3],
  /*13*/ [4, 3, 3, 1],
  /*14*/ [4, 3, 3, 1],
  /*15*/ [4, 3, 3, 2],
  /*16*/ [4, 3, 3, 2],
  /*17*/ [4, 3, 3, 3, 1],
  /*18*/ [4, 3, 3, 3, 1],
  /*19*/ [4, 3, 3, 3, 2],
  /*20*/ [4, 3, 3, 3, 2],
];

/** Magia de Pacto do bruxo: { quantidade de espaços, nível dos espaços }. */
const WARLOCK_SLOTS: { count: number; slotLevel: number }[] = [
  /* 1*/ { count: 1, slotLevel: 1 },
  /* 2*/ { count: 2, slotLevel: 1 },
  /* 3*/ { count: 2, slotLevel: 2 },
  /* 4*/ { count: 2, slotLevel: 2 },
  /* 5*/ { count: 2, slotLevel: 3 },
  /* 6*/ { count: 2, slotLevel: 3 },
  /* 7*/ { count: 2, slotLevel: 4 },
  /* 8*/ { count: 2, slotLevel: 4 },
  /* 9*/ { count: 2, slotLevel: 5 },
  /*10*/ { count: 2, slotLevel: 5 },
  /*11*/ { count: 3, slotLevel: 5 },
  /*12*/ { count: 3, slotLevel: 5 },
  /*13*/ { count: 3, slotLevel: 5 },
  /*14*/ { count: 3, slotLevel: 5 },
  /*15*/ { count: 3, slotLevel: 5 },
  /*16*/ { count: 3, slotLevel: 5 },
  /*17*/ { count: 4, slotLevel: 5 },
  /*18*/ { count: 4, slotLevel: 5 },
  /*19*/ { count: 4, slotLevel: 5 },
  /*20*/ { count: 4, slotLevel: 5 },
];

const FULL_CASTERS = new Set(["bardo", "clerigo", "druida", "feiticeiro", "mago"]);
const HALF_CASTERS = new Set(["paladino", "patrulheiro"]);

/**
 * Espaços de magia máximos por nível de magia ("1".."9") para a classe no
 * nível dado. Vazio para não-conjuradores ou meio-conjuradores no 1° nível.
 */
export function getMaxSlots(classId: string, level: number): Record<string, number> {
  const lv = Math.max(1, Math.min(level, 20));
  let table: number[] | undefined;
  if (FULL_CASTERS.has(classId)) table = FULL_CASTER_SLOTS[lv - 1];
  else if (HALF_CASTERS.has(classId)) table = HALF_CASTER_SLOTS[lv - 1];
  else if (classId === "bruxo") {
    const w = WARLOCK_SLOTS[lv - 1];
    return { [String(w.slotLevel)]: w.count };
  }
  if (!table) return {};
  const out: Record<string, number> = {};
  table.forEach((n, i) => { if (n > 0) out[String(i + 1)] = n; });
  return out;
}

// ── Truques e Magias Conhecidas ───────────────────────────────────────────────

/** Truques conhecidos por nível (classes com progressão de truques). */
const CANTRIPS_KNOWN: Record<string, [number, number, number]> = {
  // [no 1°, a partir do 4°, a partir do 10°]
  bardo:      [2, 3, 4],
  clerigo:    [3, 4, 5],
  druida:     [2, 3, 4],
  feiticeiro: [4, 5, 6],
  mago:       [3, 4, 5],
  bruxo:      [2, 3, 4],
};

export function cantripsKnownAt(classId: string, level: number): number {
  const p = CANTRIPS_KNOWN[classId];
  if (!p) return 0;
  return level >= 10 ? p[2] : level >= 4 ? p[1] : p[0];
}

/** Magias conhecidas por nível (classes "known"; índice 0 = nível 1). */
const SPELLS_KNOWN: Record<string, number[]> = {
  bardo:        [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  feiticeiro:   [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  bruxo:        [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  patrulheiro:  [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
};

export function spellsKnownAt(classId: string, level: number): number {
  const p = SPELLS_KNOWN[classId];
  if (!p) return 0;
  return p[Math.max(1, Math.min(level, 20)) - 1];
}

/** Maior nível de magia conjurável pela classe no nível dado (0 = nenhum). */
export function maxSpellLevelAt(classId: string, level: number): number {
  const slots = getMaxSlots(classId, level);
  const lvls = Object.keys(slots).map(Number);
  return lvls.length > 0 ? Math.max(...lvls) : 0;
}

/**
 * Quantas magias/truques NOVOS o personagem escolhe ao subir para `newLevel`
 * (Livro do Jogador, seção "Conjuração" de cada classe):
 *  - Truques: quando a tabela de truques conhecidos aumenta (4° e 10°).
 *  - Bardo/Feiticeiro/Bruxo/Patrulheiro: diferença de "magias conhecidas".
 *  - Mago: adiciona 2 magias ao grimório a cada nível.
 *  - Clérigo/Druida/Paladino: preparam da lista inteira — nada a escolher.
 */
export function spellChoicesOnLevelUp(
  classId: string,
  newLevel: number
): { cantrips: number; spells: number } {
  const cantrips = Math.max(0, cantripsKnownAt(classId, newLevel) - cantripsKnownAt(classId, newLevel - 1));
  let spells = 0;
  if (classId === "mago") {
    spells = 2; // Grimório: duas magias novas por nível de mago
  } else if (SPELLS_KNOWN[classId]) {
    spells = Math.max(0, spellsKnownAt(classId, newLevel) - spellsKnownAt(classId, newLevel - 1));
  }
  return { cantrips, spells };
}

// ── Características de Classe por Nível ───────────────────────────────────────

export interface LevelFeature {
  name: string;
  description: string;
}

/**
 * Características adquiridas a CADA nível (2–20) por classe, conforme as
 * tabelas do Livro do Jogador. Nível 1 não consta (aplicado na criação).
 * "Característica do <subclasse>" indica benefício concedido pela subclasse.
 */
export const CLASS_FEATURES: Record<string, Record<number, LevelFeature[]>> = {
  barbaro: {
    2: [
      { name: "Ataque Descuidado", description: "Vantagem em ataques corpo-a-corpo com Força no turno; ataques contra você têm vantagem até seu próximo turno." },
      { name: "Sentido de Perigo", description: "Vantagem em testes de resistência de Destreza contra efeitos que você possa ver." },
    ],
    3: [{ name: "Característica do Caminho Primitivo", description: "Você ganha a característica de 3° nível do seu Caminho Primitivo (e agora possui 3 fúrias por descanso)." }],
    5: [
      { name: "Ataque Extra", description: "Você pode atacar duas vezes ao realizar a ação de Ataque." },
      { name: "Movimento Rápido", description: "+3 m de deslocamento quando não estiver usando armadura pesada." },
    ],
    6: [{ name: "Característica do Caminho Primitivo", description: "Você ganha a característica de 6° nível do seu Caminho Primitivo (4 fúrias por descanso)." }],
    7: [{ name: "Instinto Selvagem", description: "Vantagem nas rolagens de iniciativa; surpreso, ainda pode agir no 1° turno se entrar em fúria." }],
    9: [{ name: "Crítico Brutal (1 dado)", description: "Role um dado de dano de arma adicional em acertos críticos corpo-a-corpo (dano de fúria +3)." }],
    10: [{ name: "Característica do Caminho Primitivo", description: "Você ganha a característica de 10° nível do seu Caminho Primitivo." }],
    11: [{ name: "Fúria Implacável", description: "Em fúria, ao cair a 0 PV, teste de CON (CD 10, +5 por uso) para ficar com 1 PV." }],
    12: [{ name: "Fúria adicional", description: "5 fúrias por descanso longo." }],
    13: [{ name: "Crítico Brutal (2 dados)", description: "Dois dados de dano adicionais em acertos críticos corpo-a-corpo." }],
    14: [{ name: "Característica do Caminho Primitivo", description: "Você ganha a característica de 14° nível do seu Caminho Primitivo." }],
    15: [{ name: "Fúria Persistente", description: "Sua fúria só termina mais cedo se você ficar inconsciente ou encerrá-la voluntariamente." }],
    16: [{ name: "Dano de Fúria +4", description: "O bônus de dano da fúria sobe para +4." }],
    17: [{ name: "Crítico Brutal (3 dados)", description: "Três dados de dano adicionais em acertos críticos corpo-a-corpo (6 fúrias por descanso)." }],
    18: [{ name: "Força Indomável", description: "Em testes de Força com resultado menor que seu valor de Força, use o valor de Força." }],
    20: [{ name: "Campeão Primitivo", description: "Força e Constituição +4 (máximo 24). Fúrias ilimitadas." }],
  },

  bardo: {
    2: [
      { name: "Versatilidade", description: "Adicione metade do bônus de proficiência a testes de habilidade sem proficiência." },
      { name: "Canção do Descanso (d6)", description: "Aliados que gastarem Dado de Vida em descanso curto recuperam +1d6 PV ouvindo sua canção." },
    ],
    3: [
      { name: "Característica do Colégio de Bardo", description: "Você ganha a característica de 3° nível do seu Colégio." },
      { name: "Aptidão", description: "Dobre o bônus de proficiência em duas perícias escolhidas." },
    ],
    5: [
      { name: "Inspiração de Bardo (d8)", description: "Seu dado de Inspiração de Bardo torna-se um d8." },
      { name: "Fonte de Inspiração", description: "Recupere os usos de Inspiração de Bardo em descanso curto ou longo." },
    ],
    6: [
      { name: "Canção de Proteção", description: "Você e aliados a até 9 m têm vantagem contra ser amedrontado ou enfeitiçado enquanto você canta." },
      { name: "Característica do Colégio de Bardo", description: "Você ganha a característica de 6° nível do seu Colégio." },
    ],
    9: [{ name: "Canção do Descanso (d8)", description: "A cura extra da Canção do Descanso sobe para 1d8." }],
    10: [
      { name: "Inspiração de Bardo (d10)", description: "Seu dado de Inspiração de Bardo torna-se um d10." },
      { name: "Aptidão adicional", description: "Dobre o bônus de proficiência em mais duas perícias." },
      { name: "Segredos Mágicos", description: "Aprenda duas magias de qualquer classe (contam como magias de bardo)." },
    ],
    13: [{ name: "Canção do Descanso (d10)", description: "A cura extra da Canção do Descanso sobe para 1d10." }],
    14: [
      { name: "Segredos Mágicos adicionais", description: "Aprenda mais duas magias de qualquer classe." },
      { name: "Característica do Colégio de Bardo", description: "Você ganha a característica de 14° nível do seu Colégio." },
    ],
    15: [{ name: "Inspiração de Bardo (d12)", description: "Seu dado de Inspiração de Bardo torna-se um d12." }],
    17: [{ name: "Canção do Descanso (d12)", description: "A cura extra da Canção do Descanso sobe para 1d12." }],
    18: [{ name: "Segredos Mágicos adicionais", description: "Aprenda mais duas magias de qualquer classe." }],
    20: [{ name: "Inspiração Superior", description: "Ao rolar iniciativa sem usos de Inspiração de Bardo, recupere 1 uso." }],
  },

  bruxo: {
    2: [{ name: "Invocações Místicas", description: "Aprenda duas Invocações Místicas; pode trocar uma ao subir de nível." }],
    3: [{ name: "Dádiva do Pacto", description: "Escolha: Pacto da Corrente (familiar), Pacto da Lâmina (arma) ou Pacto do Tomo (grimório)." }],
    5: [{ name: "Invocação Mística adicional", description: "Você conhece 3 invocações místicas." }],
    6: [{ name: "Característica do Patrono", description: "Você ganha a característica de 6° nível do seu Patrono Transcendental." }],
    7: [{ name: "Invocação Mística adicional", description: "Você conhece 4 invocações místicas." }],
    9: [{ name: "Invocação Mística adicional", description: "Você conhece 5 invocações místicas." }],
    10: [{ name: "Característica do Patrono", description: "Você ganha a característica de 10° nível do seu Patrono Transcendental." }],
    11: [{ name: "Arcana Mística (6° nível)", description: "Uma magia de 6° nível conjurável 1×/descanso longo sem gastar espaço." }],
    12: [{ name: "Invocação Mística adicional", description: "Você conhece 6 invocações místicas." }],
    13: [{ name: "Arcana Mística (7° nível)", description: "Uma magia de 7° nível conjurável 1×/descanso longo." }],
    14: [{ name: "Característica do Patrono", description: "Você ganha a característica de 14° nível do seu Patrono Transcendental." }],
    15: [
      { name: "Arcana Mística (8° nível)", description: "Uma magia de 8° nível conjurável 1×/descanso longo." },
      { name: "Invocação Mística adicional", description: "Você conhece 7 invocações místicas." },
    ],
    17: [{ name: "Arcana Mística (9° nível)", description: "Uma magia de 9° nível conjurável 1×/descanso longo." }],
    18: [{ name: "Invocação Mística adicional", description: "Você conhece 8 invocações místicas." }],
    20: [{ name: "Mestre Místico", description: "Rogue ao patrono para recuperar todos os espaços de Magia de Pacto, 1×/descanso longo." }],
  },

  clerigo: {
    2: [
      { name: "Canalizar Divindade (1×)", description: "Expulsar Mortos-Vivos + efeito do domínio; 1 uso por descanso." },
      { name: "Característica do Domínio Divino", description: "Você ganha a característica de 2° nível do seu Domínio." },
    ],
    5: [{ name: "Destruir Mortos-Vivos (ND 1/2)", description: "Mortos-vivos de ND 1/2 ou menor que falhem contra Expulsar são destruídos." }],
    6: [
      { name: "Canalizar Divindade (2×)", description: "Dois usos de Canalizar Divindade por descanso." },
      { name: "Característica do Domínio Divino", description: "Você ganha a característica de 6° nível do seu Domínio." },
    ],
    8: [
      { name: "Destruir Mortos-Vivos (ND 1)", description: "Destrói mortos-vivos de ND 1 ou menor ao expulsar." },
      { name: "Característica do Domínio Divino", description: "Você ganha a característica de 8° nível do seu Domínio." },
    ],
    10: [{ name: "Intervenção Divina", description: "Ação: role d% ≤ seu nível de clérigo para seu deus intervir. Sucesso: 7 dias de recarga." }],
    11: [{ name: "Destruir Mortos-Vivos (ND 2)", description: "Destrói mortos-vivos de ND 2 ou menor ao expulsar." }],
    14: [{ name: "Destruir Mortos-Vivos (ND 3)", description: "Destrói mortos-vivos de ND 3 ou menor ao expulsar." }],
    17: [
      { name: "Destruir Mortos-Vivos (ND 4)", description: "Destrói mortos-vivos de ND 4 ou menor ao expulsar." },
      { name: "Característica do Domínio Divino", description: "Você ganha a característica de 17° nível do seu Domínio." },
    ],
    18: [{ name: "Canalizar Divindade (3×)", description: "Três usos de Canalizar Divindade por descanso." }],
    20: [{ name: "Intervenção Divina Aprimorada", description: "Intervenção Divina funciona automaticamente, sem rolagem." }],
  },

  druida: {
    2: [
      { name: "Forma Selvagem", description: "Ação: transforme-se em besta já vista (ND 1/4, sem deslocamento de voo/natação); 2 usos por descanso." },
      { name: "Característica do Círculo Druídico", description: "Você ganha a característica de 2° nível do seu Círculo." },
    ],
    4: [{ name: "Forma Selvagem aprimorada", description: "Bestas de ND 1/2 ou menor (sem deslocamento de voo)." }],
    6: [{ name: "Característica do Círculo Druídico", description: "Você ganha a característica de 6° nível do seu Círculo." }],
    8: [{ name: "Forma Selvagem aprimorada", description: "Bestas de ND 1 ou menor, sem restrição de deslocamento." }],
    10: [{ name: "Característica do Círculo Druídico", description: "Você ganha a característica de 10° nível do seu Círculo." }],
    14: [{ name: "Característica do Círculo Druídico", description: "Você ganha a característica de 14° nível do seu Círculo." }],
    18: [
      { name: "Corpo Atemporal", description: "Você envelhece 10× mais devagar." },
      { name: "Magias da Besta", description: "Conjure magias de druida em Forma Selvagem (sem componentes materiais)." },
    ],
    20: [{ name: "Arquidruida", description: "Forma Selvagem ilimitada; ignore componentes verbais/somáticos e materiais sem custo." }],
  },

  feiticeiro: {
    2: [{ name: "Fonte de Magia", description: "Pontos de Feitiçaria (= nível); converta pontos em espaços de magia e vice-versa." }],
    3: [{ name: "Metamágica (2 opções)", description: "Escolha 2 opções de Metamágica para distorcer suas magias." }],
    6: [{ name: "Característica da Origem", description: "Você ganha a característica de 6° nível da sua Origem de Feitiçaria." }],
    10: [{ name: "Metamágica adicional", description: "Escolha uma 3ª opção de Metamágica." }],
    14: [{ name: "Característica da Origem", description: "Você ganha a característica de 14° nível da sua Origem de Feitiçaria." }],
    17: [{ name: "Metamágica adicional", description: "Escolha uma 4ª opção de Metamágica." }],
    18: [{ name: "Característica da Origem", description: "Você ganha a característica de 18° nível da sua Origem de Feitiçaria." }],
    20: [{ name: "Restauração Mística", description: "Recupere 4 Pontos de Feitiçaria ao terminar um descanso curto, 1×/descanso longo." }],
  },

  guerreiro: {
    2: [{ name: "Surto de Ação", description: "Uma ação adicional no seu turno; 1 uso por descanso curto ou longo." }],
    3: [{ name: "Característica do Arquétipo Marcial", description: "Você ganha a característica de 3° nível do seu Arquétipo." }],
    5: [{ name: "Ataque Extra", description: "Você pode atacar duas vezes ao realizar a ação de Ataque." }],
    7: [{ name: "Característica do Arquétipo Marcial", description: "Você ganha a característica de 7° nível do seu Arquétipo." }],
    9: [{ name: "Indomável (1 uso)", description: "Refaça um teste de resistência que falhou; 1 uso por descanso longo." }],
    10: [{ name: "Característica do Arquétipo Marcial", description: "Você ganha a característica de 10° nível do seu Arquétipo." }],
    11: [{ name: "Ataque Extra (2)", description: "Você pode atacar três vezes ao realizar a ação de Ataque." }],
    13: [{ name: "Indomável (2 usos)", description: "Dois usos de Indomável por descanso longo." }],
    15: [{ name: "Característica do Arquétipo Marcial", description: "Você ganha a característica de 15° nível do seu Arquétipo." }],
    17: [
      { name: "Surto de Ação (2 usos)", description: "Dois usos de Surto de Ação por descanso (1 por turno)." },
      { name: "Indomável (3 usos)", description: "Três usos de Indomável por descanso longo." },
    ],
    18: [{ name: "Característica do Arquétipo Marcial", description: "Você ganha a característica de 18° nível do seu Arquétipo." }],
    20: [{ name: "Ataque Extra (3)", description: "Você pode atacar quatro vezes ao realizar a ação de Ataque." }],
  },

  ladino: {
    2: [{ name: "Ação Ardilosa", description: "Ação bônus para Disparada, Desengajar ou Esconder." }],
    3: [{ name: "Característica do Arquétipo de Ladino", description: "Você ganha a característica de 3° nível do seu Arquétipo (Ataque Furtivo 2d6)." }],
    5: [{ name: "Esquiva Sobrenatural", description: "Reação para reduzir à metade o dano de um ataque que você possa ver (Ataque Furtivo 3d6)." }],
    6: [{ name: "Especialização adicional", description: "Dobre o bônus de proficiência em mais duas perícias." }],
    7: [{ name: "Evasão", description: "Resistência de Destreza para metade do dano: sucesso = nenhum dano (Ataque Furtivo 4d6)." }],
    9: [{ name: "Característica do Arquétipo de Ladino", description: "Você ganha a característica de 9° nível do seu Arquétipo (Ataque Furtivo 5d6)." }],
    11: [{ name: "Talento Confiável", description: "Em testes com proficiência, trate resultados 9 ou menores no d20 como 10 (Ataque Furtivo 6d6)." }],
    13: [{ name: "Característica do Arquétipo de Ladino", description: "Você ganha a característica de 13° nível do seu Arquétipo (Ataque Furtivo 7d6)." }],
    14: [{ name: "Sentido Cego", description: "Se puder ouvir, você percebe criaturas escondidas ou invisíveis a até 3 m." }],
    15: [{ name: "Mente Escorregadia", description: "Proficiência em testes de resistência de Sabedoria (Ataque Furtivo 8d6)." }],
    17: [{ name: "Característica do Arquétipo de Ladino", description: "Você ganha a característica de 17° nível do seu Arquétipo (Ataque Furtivo 9d6)." }],
    18: [{ name: "Elusivo", description: "Nenhuma jogada de ataque tem vantagem contra você enquanto não estiver incapacitado." }],
    20: [{ name: "Golpe de Sorte", description: "Transforme um ataque errado em acerto, ou uma falha em teste de habilidade em 20 natural; 1×/descanso (Ataque Furtivo 10d6)." }],
  },

  mago: {
    2: [{ name: "Característica da Tradição Arcana", description: "Você ganha a característica de 2° nível da sua Tradição Arcana." }],
    6: [{ name: "Característica da Tradição Arcana", description: "Você ganha a característica de 6° nível da sua Tradição Arcana." }],
    10: [{ name: "Característica da Tradição Arcana", description: "Você ganha a característica de 10° nível da sua Tradição Arcana." }],
    14: [{ name: "Característica da Tradição Arcana", description: "Você ganha a característica de 14° nível da sua Tradição Arcana." }],
    18: [{ name: "Dominar Magia", description: "Escolha uma magia de 1° e uma de 2° nível do grimório: conjure-as no nível mínimo sem gastar espaços." }],
    20: [{ name: "Assinatura Mágica", description: "Duas magias de 3° nível do grimório sempre preparadas; conjure cada uma 1×/descanso curto sem espaço." }],
  },

  monge: {
    2: [
      { name: "Chi (2 pontos)", description: "Pontos de chi (= nível de monge) para Rajada de Golpes, Defesa Paciente e Passo do Vento." },
      { name: "Movimento sem Armadura (+3 m)", description: "+3 m de deslocamento sem armadura nem escudo." },
    ],
    3: [
      { name: "Característica da Tradição Monástica", description: "Você ganha a característica de 3° nível da sua Tradição." },
      { name: "Defletir Projéteis", description: "Reação: reduza dano de projétil em 1d10 + Des + nível de monge; a 0, pode devolver o projétil." },
    ],
    4: [{ name: "Queda Lenta", description: "Reação ao cair: reduza o dano de queda em 5× seu nível de monge." }],
    5: [
      { name: "Ataque Extra", description: "Você pode atacar duas vezes ao realizar a ação de Ataque." },
      { name: "Ataque Atordoante", description: "Gaste 1 chi ao acertar: o alvo resiste (CON) ou fica atordoado até o fim do seu próximo turno (Artes Marciais 1d6)." },
    ],
    6: [
      { name: "Golpes de Chi", description: "Seus ataques desarmados contam como mágicos contra resistências e imunidades." },
      { name: "Característica da Tradição Monástica", description: "Você ganha a característica de 6° nível da sua Tradição (+4,5 m de movimento)." },
    ],
    7: [
      { name: "Evasão", description: "Resistência de Destreza para metade do dano: sucesso = nenhum dano." },
      { name: "Tranquilidade", description: "Ação para encerrar um efeito de enfeitiçado ou amedrontado em você." },
    ],
    9: [{ name: "Movimento sem Armadura aprimorado", description: "Mova-se por superfícies verticais e líquidos sem cair durante o movimento." }],
    10: [{ name: "Pureza Corporal", description: "Imunidade a doenças e venenos (+6 m de movimento)." }],
    11: [{ name: "Característica da Tradição Monástica", description: "Você ganha a característica de 11° nível da sua Tradição (Artes Marciais 1d8)." }],
    13: [{ name: "Idiomas do Sol e da Lua", description: "Você entende todos os idiomas falados e é entendido por qualquer criatura que fale." }],
    14: [{ name: "Alma de Diamante", description: "Proficiência em todos os testes de resistência; gaste 1 chi para refazer uma falha (+7,5 m de movimento)." }],
    15: [{ name: "Corpo Atemporal", description: "Você não sofre da fragilidade da velhice e não pode envelhecer magicamente; sem comida e água." }],
    17: [{ name: "Característica da Tradição Monástica", description: "Você ganha a característica de 17° nível da sua Tradição (Artes Marciais 1d10)." }],
    18: [{ name: "Corpo Vazio", description: "Gaste 4 chi: invisível por 1 min com resistência a dano (exceto energético); 8 chi: projeção astral (+9 m de movimento)." }],
    20: [{ name: "Auto Aperfeiçoamento", description: "Ao rolar iniciativa sem pontos de chi, recupere 4 pontos." }],
  },

  paladino: {
    2: [
      { name: "Estilo de Luta", description: "Escolha: Combate com Armas Grandes, Defesa, Duelismo ou Proteção." },
      { name: "Conjuração", description: "Prepara magias de paladino (Carisma); espaços de meio-conjurador." },
      { name: "Destruição Divina", description: "Ao acertar ataque corpo-a-corpo, gaste um espaço de magia: +2d8 radiante (+1d8 por nível do espaço acima do 1°, máx. 5d8; +1d8 vs mortos-vivos/corruptores)." },
    ],
    3: [
      { name: "Saúde Divina", description: "Imunidade a doenças." },
      { name: "Característica do Juramento Sagrado", description: "Você ganha as características de 3° nível do seu Juramento (incl. Canalizar Divindade)." },
    ],
    5: [{ name: "Ataque Extra", description: "Você pode atacar duas vezes ao realizar a ação de Ataque." }],
    6: [{ name: "Aura de Proteção", description: "Você e aliados a até 3 m somam seu mod. de Carisma aos testes de resistência." }],
    7: [{ name: "Característica do Juramento Sagrado", description: "Você ganha a característica de 7° nível do seu Juramento." }],
    10: [{ name: "Aura da Coragem", description: "Você e aliados a até 3 m não podem ser amedrontados enquanto você estiver consciente." }],
    11: [{ name: "Destruição Divina Aprimorada", description: "Todos os seus ataques corpo-a-corpo com arma causam +1d8 de dano radiante." }],
    14: [{ name: "Toque Purificador", description: "Ação: encerre uma magia em você ou em criatura voluntária tocada; usos = mod. de Carisma por descanso longo." }],
    15: [{ name: "Característica do Juramento Sagrado", description: "Você ganha a característica de 15° nível do seu Juramento." }],
    18: [{ name: "Melhorias de Aura", description: "Suas Auras de Proteção e Coragem alcançam 9 m." }],
    20: [{ name: "Característica do Juramento Sagrado", description: "Você ganha a característica de 20° nível do seu Juramento." }],
  },

  patrulheiro: {
    2: [
      { name: "Estilo de Luta", description: "Escolha: Arquearia, Combate com Duas Armas, Defesa ou Duelismo." },
      { name: "Conjuração", description: "Magias conhecidas de patrulheiro (Sabedoria); espaços de meio-conjurador." },
    ],
    3: [
      { name: "Característica do Conclave", description: "Você ganha a característica de 3° nível do seu Conclave de Patrulheiro." },
      { name: "Consciência Primitiva", description: "Gaste um espaço de magia: detecte tipos de criatura a até 1,5 km (8 km em terreno favorito) por 1 min." },
    ],
    5: [{ name: "Ataque Extra", description: "Você pode atacar duas vezes ao realizar a ação de Ataque." }],
    6: [{ name: "Inimigo Favorito e Explorador Natural aprimorados", description: "Escolha um segundo inimigo favorito e um segundo terreno favorito." }],
    7: [{ name: "Característica do Conclave", description: "Você ganha a característica de 7° nível do seu Conclave." }],
    8: [{ name: "Pés Rápidos", description: "Disparada como ação bônus." }],
    10: [
      { name: "Mimetismo", description: "Camuflagem: +10 em Furtividade quando imóvel contra terreno." },
      { name: "Explorador Natural aprimorado", description: "Escolha um terceiro terreno favorito." },
    ],
    11: [{ name: "Característica do Conclave", description: "Você ganha a característica de 11° nível do seu Conclave." }],
    14: [
      { name: "Desaparecer", description: "Esconder como ação bônus; você não pode ser rastreado por meios não-mágicos." },
      { name: "Inimigo Favorito aprimorado", description: "Escolha um terceiro inimigo favorito." },
    ],
    15: [{ name: "Característica do Conclave", description: "Você ganha a característica de 15° nível do seu Conclave." }],
    18: [{ name: "Sentidos Selvagens", description: "Sem desvantagem ao atacar criaturas que não vê; percebe invisíveis a até 9 m." }],
    20: [{ name: "Matador de Inimigos", description: "1× por turno, some seu mod. de Sabedoria a uma jogada de ataque ou dano contra inimigo favorito." }],
  },
};

// ── Características Raciais por Nível ─────────────────────────────────────────

/**
 * Benefícios raciais que entram (ou escalam) em níveis específicos.
 * Chave: raceId ou "raceId/subraceId".
 */
export const RACE_LEVEL_FEATURES: Record<string, Record<number, LevelFeature[]>> = {
  tiefling: {
    3: [{ name: "Legado Infernal — Repreensão Infernal", description: "Conjure repreensão infernal (2° nível) 1×/descanso longo, usando Carisma." }],
    5: [{ name: "Legado Infernal — Escuridão", description: "Conjure escuridão 1×/descanso longo, usando Carisma." }],
  },
  "elfo/drow": {
    3: [{ name: "Magia Drow — Fogo das Fadas", description: "Conjure fogo das fadas 1×/descanso longo, usando Carisma." }],
    5: [{ name: "Magia Drow — Escuridão", description: "Conjure escuridão 1×/descanso longo, usando Carisma." }],
  },
  draconato: {
    6: [{ name: "Arma de Sopro (3d6)", description: "O dano da sua Arma de Sopro sobe para 3d6." }],
    11: [{ name: "Arma de Sopro (4d6)", description: "O dano da sua Arma de Sopro sobe para 4d6." }],
    16: [{ name: "Arma de Sopro (5d6)", description: "O dano da sua Arma de Sopro sobe para 5d6." }],
  },
};

// ── Plano de Subida de Nível ──────────────────────────────────────────────────

export interface LevelUpPlan {
  fromLevel: number;
  newLevel: number;
  hitDie: number;
  /** PV fixo (média do dado arredondada para cima), sem mod. CON. */
  averageRoll: number;
  profBonusBefore: number;
  profBonusAfter: number;
  asi: boolean;
  classFeatures: LevelFeature[];
  raceFeatures: LevelFeature[];
  /** Slots máximos no nível novo (por nível de magia). */
  newMaxSlots: Record<string, number>;
  /** Diferença de slots em relação ao nível anterior. */
  slotsGained: Record<string, number>;
  cantripsBefore: number;
  cantripsAfter: number;
  spellsKnownBefore: number;
  spellsKnownAfter: number;
  /** XP mínimo do novo nível (tabela Avanço de Personagem). */
  xpThreshold: number;
}

export function buildLevelUpPlan(
  classId: string,
  raceKey: string,
  currentLevel: number,
  hitDie: number
): LevelUpPlan | null {
  if (currentLevel >= MAX_LEVEL) return null;
  const newLevel = currentLevel + 1;

  const prevSlots = getMaxSlots(classId, currentLevel);
  const newSlots = getMaxSlots(classId, newLevel);
  const slotsGained: Record<string, number> = {};
  for (const [lvl, n] of Object.entries(newSlots)) {
    const gain = n - (prevSlots[lvl] ?? 0);
    if (gain > 0) slotsGained[lvl] = gain;
  }
  const raceFeatures: LevelFeature[] = [
    ...(RACE_LEVEL_FEATURES[raceKey]?.[newLevel] ?? []),
    ...(raceKey.includes("/") ? RACE_LEVEL_FEATURES[raceKey.split("/")[0]]?.[newLevel] ?? [] : []),
  ];

  return {
    fromLevel: currentLevel,
    newLevel,
    hitDie,
    averageRoll: averageHpGain(hitDie),
    profBonusBefore: proficiencyBonus(currentLevel),
    profBonusAfter: proficiencyBonus(newLevel),
    asi: hasAsiAt(classId, newLevel),
    classFeatures: CLASS_FEATURES[classId]?.[newLevel] ?? [],
    raceFeatures,
    newMaxSlots: newSlots,
    slotsGained,
    cantripsBefore: cantripsKnownAt(classId, currentLevel),
    cantripsAfter: cantripsKnownAt(classId, newLevel),
    spellsKnownBefore: spellsKnownAt(classId, currentLevel),
    spellsKnownAfter: spellsKnownAt(classId, newLevel),
    xpThreshold: XP_THRESHOLDS[newLevel],
  };
}

// ── Validação de ASI ──────────────────────────────────────────────────────────

export const ABILITY_MAX = 20;

/**
 * Valida uma Melhoria de Valor de Habilidade: +2 em um atributo OU +1 em dois,
 * sem ultrapassar 20.
 */
export function validateAsi(
  increases: Partial<Record<AbilityKey, number>>,
  currentScores: Record<AbilityKey, number>
): string | null {
  const entries = Object.entries(increases).filter(([, v]) => (v ?? 0) > 0) as [AbilityKey, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total !== 2) return "A melhoria deve totalizar +2 (em um atributo) ou +1/+1 (em dois).";
  if (entries.length === 1 && entries[0][1] !== 2) return "Melhoria inválida.";
  if (entries.length === 2 && entries.some(([, v]) => v !== 1)) return "Melhoria inválida.";
  if (entries.length > 2) return "No máximo dois atributos.";
  for (const [k, v] of entries) {
    if (currentScores[k] + v > ABILITY_MAX) return `${k.toUpperCase()} não pode passar de 20.`;
  }
  return null;
}
