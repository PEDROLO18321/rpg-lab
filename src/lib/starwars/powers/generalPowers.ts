// Star Wars: Além da Fronteira — os 50 Poderes Gerais (18 básicos + 32 avançados)
// Usáveis por qualquer classe/espécie, custeados em Pontos de Poder (PP)

import type { GeneralPower } from "./types";

export const GENERAL_POWERS_BASIC: GeneralPower[] = [
  { id: "folego_extra", name: "Fôlego Extra", cost: 1, sustain: "instantaneo", tier: "basico", description: "Recupera uma quantidade pequena de PV numa pausa curta, mesmo em cena de tensão." },
  { id: "reflexos_rapidos", name: "Reflexos Rápidos", cost: 1, sustain: "instantaneo", tier: "basico", description: "Age antes de todos na ordem de iniciativa da cena atual." },
  { id: "instinto_sobrevivencia", name: "Instinto de Sobrevivência", cost: 2, sustain: "instantaneo", tier: "basico", description: "Evita completamente um ataque ou perigo iminente, sem precisar de teste." },
  { id: "foco_absoluto", name: "Foco Absoluto", cost: 1, sustain: "instantaneo", tier: "basico", description: "Bônus grande num único teste de perícia antes de rolar." },
  { id: "segunda_chance", name: "Segunda Chance", cost: 2, sustain: "instantaneo", tier: "basico", description: "Rerola um teste que acabou de falhar." },
  { id: "adaptacao_rapida", name: "Adaptação Rápida", cost: 1, sustain: "sustentado", tier: "basico", description: "Ganha treino temporário numa perícia não treinada, enquanto mantido." },
  { id: "vontade_inabalavel", name: "Vontade Inabalável", cost: 2, sustain: "instantaneo", tier: "basico", description: "Resiste automaticamente a um efeito de medo, coerção ou controle mental." },
  { id: "acao_extra", name: "Ação Extra", cost: 3, sustain: "instantaneo", tier: "basico", description: "Ganha uma ação adicional no turno atual." },
  { id: "golpe_certeiro", name: "Golpe Certeiro", cost: 2, sustain: "instantaneo", tier: "basico", description: "O próximo ataque não pode errar." },
  { id: "resistencia_subita", name: "Resistência Súbita", cost: 2, sustain: "instantaneo", tier: "basico", description: "Reduz drasticamente o dano de um único ataque recebido, antes de aplicado." },
  { id: "tolerancia", name: "Tolerância", cost: 1, sustain: "sustentado", tier: "basico", description: "Ignora uma penalidade de condição (ferido, fatigado, intoxicado etc.) enquanto mantido." },
  { id: "camaleao_social", name: "Camaleão Social", cost: 1, sustain: "sustentado", tier: "basico", description: "Passa despercebido ou comum numa situação social, enquanto mantido." },
  { id: "faro_acucado", name: "Faro Aguçado", cost: 1, sustain: "instantaneo", tier: "basico", description: "Detecta algo escondido ou um perigo próximo automaticamente." },
  { id: "improviso", name: "Improviso", cost: 2, sustain: "instantaneo", tier: "basico", description: "Transforma qualquer objeto comum em ferramenta ou arma eficaz temporária." },
  { id: "recuperacao_rapida", name: "Recuperação Rápida", cost: 3, sustain: "instantaneo", tier: "basico", description: "Recupera uma quantidade considerável de PV instantaneamente em pleno combate." },
  { id: "presenca_marcante", name: "Presença Marcante", cost: 1, sustain: "instantaneo", tier: "basico", description: "Vantagem imediata e garantida numa interação social importante." },
  { id: "ultima_reserva", name: "Última Reserva", cost: 3, sustain: "instantaneo", tier: "basico", description: "Quando cairia a 0 PV, se mantém de pé com 1 PV em vez disso." },
  { id: "leitura_combate", name: "Leitura de Combate", cost: 1, sustain: "instantaneo", tier: "basico", description: "Prevê a próxima ação de um inimigo antes que ela aconteça." },
];

export const GENERAL_POWERS_ADVANCED: GeneralPower[] = [
  { id: "fantasma_furtivo", name: "Fantasma Furtivo", cost: 3, sustain: "sustentado", tier: "avancado", prerequisite: "Furtividade treinada", description: "Invisibilidade parcial a sensores e olhos." },
  { id: "mente_eidetica", name: "Mente Eidética", cost: 3, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 5", description: "Reconstrói perfeitamente uma cena ou memória inteira." },
  { id: "precisao_absoluta", name: "Precisão Absoluta", cost: 3, sustain: "instantaneo", tier: "avancado", prerequisite: "AGI ou INT mín. 3", description: "Próximo teste manual não pode resultar abaixo do quase-máximo." },
  { id: "presciencia_combate", name: "Presciência de Combate", cost: 4, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 10", description: "Prevê as próximas 2 ações do inimigo antes de acontecerem." },
  { id: "fortaleza_mental", name: "Fortaleza Mental", cost: 4, sustain: "sustentado", tier: "avancado", prerequisite: "PRE mín. 3", description: "Imunidade total a efeitos mentais e da Força." },
  { id: "salto_perfeito", name: "Salto Perfeito", cost: 3, sustain: "instantaneo", tier: "avancado", description: "Realiza acrobacia ou salto extremo impossível normalmente, sem risco." },
  { id: "mestre_barganha", name: "Mestre da Barganha", cost: 3, sustain: "instantaneo", tier: "avancado", prerequisite: "Diplomacia ou Persuasão treinada", description: "Vira completamente a posição de um NPC importante a seu favor." },
  { id: "transcender_corpo", name: "Transcender o Corpo", cost: 4, sustain: "sustentado", tier: "avancado", description: "Ignora qualquer penalidade física (fadiga, dor, ferimento)." },
  { id: "retribuicao_instantanea", name: "Retribuição Instantânea", cost: 4, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 8", description: "Revida com dano dobrado assim que é atingido." },
  { id: "tiro_impossivel", name: "Tiro Impossível", cost: 4, sustain: "instantaneo", tier: "avancado", prerequisite: "Pontaria treinada", description: "Acerta um alvo mesmo sem linha de visão direta." },
  { id: "mascara_completa", name: "Máscara Completa", cost: 4, sustain: "sustentado", tier: "avancado", prerequisite: "Enganação treinada", description: "Engana até sensores biométricos." },
  { id: "improviso_blindado", name: "Improviso Blindado", cost: 3, sustain: "instantaneo", tier: "avancado", description: "Cria proteção equivalente a armadura pesada com qualquer objeto." },
  { id: "golpe_perfurante_absoluto", name: "Golpe Perfurante Absoluto", cost: 4, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 10", description: "Ignora toda armadura, resistência ou escudo do alvo num único ataque." },
  { id: "serenidade_total", name: "Serenidade Total", cost: 3, sustain: "sustentado", tier: "avancado", description: "Imune a pânico, medo e efeitos de moral." },
  { id: "instinto_predatorio", name: "Instinto Predatório", cost: 3, sustain: "instantaneo", tier: "avancado", description: "Evita e revida automaticamente um ataque de oportunidade." },
  { id: "sincronia_grupo", name: "Sincronia de Grupo", cost: 4, sustain: "sustentado", tier: "avancado", prerequisite: "Nível 8", description: "Compartilha um bônus de teste com todos os aliados próximos." },
  { id: "compreensao_total", name: "Compreensão Total", cost: 3, sustain: "instantaneo", tier: "avancado", prerequisite: "INT mín. 3", description: "Entende sistema, idioma ou tecnologia desconhecida instantaneamente." },
  { id: "dominio_terreno", name: "Domínio de Terreno", cost: 3, sustain: "sustentado", tier: "avancado", description: "Ignora qualquer penalidade de terreno, gravidade ou ambiente." },
  { id: "furia_multiplicada", name: "Fúria Multiplicada", cost: 5, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 12", description: "Realiza três ataques no mesmo turno." },
  { id: "precognicao_perigo", name: "Precognição de Perigo", cost: 4, sustain: "instantaneo", tier: "avancado", prerequisite: "Percepção treinada", description: "Detecta e neutraliza automaticamente uma armadilha ou emboscada antes de ativar." },
  { id: "cura_mente", name: "Cura da Mente", cost: 3, sustain: "instantaneo", tier: "avancado", description: "Remove todos os efeitos mentais negativos ativos de si ou de um aliado." },
  { id: "resistencia_absoluta", name: "Resistência Absoluta", cost: 3, sustain: "sustentado", tier: "avancado", description: "Ignora fome, sede, exaustão e clima extremo enquanto mantido." },
  { id: "leitura_alma", name: "Leitura de Alma", cost: 3, sustain: "instantaneo", tier: "avancado", prerequisite: "SEN ou PRE mín. 3", description: "Sente a intenção verdadeira e o histórico emocional de um alvo." },
  { id: "esquiva_impossivel", name: "Esquiva Impossível", cost: 4, sustain: "instantaneo", tier: "avancado", prerequisite: "AGI mín. 3", description: "Evita completamente qualquer ataque à distância num turno, mesmo múltiplos." },
  { id: "controle_cena", name: "Controle de Cena", cost: 4, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 10", description: "Altera um elemento importante do ambiente a seu favor." },
  { id: "vantagem_absoluta", name: "Vantagem Absoluta", cost: 4, sustain: "instantaneo", tier: "avancado", description: "Cria uma vantagem tática decisiva usando qualquer elemento do cenário." },
  { id: "imunidade_momentanea", name: "Imunidade Momentânea", cost: 4, sustain: "sustentado", tier: "avancado", description: "Imune a veneno, doença e toxinas." },
  { id: "investida_fatal", name: "Investida Fatal", cost: 5, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 12", description: "Ataque surpresa com dano crítico automático." },
  { id: "escudo_absoluto", name: "Escudo Absoluto", cost: 4, sustain: "sustentado", tier: "avancado", description: "Reduz drasticamente todo dano recebido." },
  { id: "destino_reescrito", name: "Destino Reescrito", cost: 5, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 15", description: "Transforma qualquer falha, mesmo crítica, em sucesso total." },
  { id: "inquebravel", name: "Inquebrável", cost: 4, sustain: "sustentado", tier: "avancado", description: "Imune a intimidação, coação e manipulação social." },
  { id: "desafiar_morte", name: "Desafiar a Morte", cost: 5, sustain: "instantaneo", tier: "avancado", prerequisite: "Nível 15", description: "Ignora completamente estar a 0 PV, age normalmente por uma cena inteira." },
];

export const GENERAL_POWERS: GeneralPower[] = [...GENERAL_POWERS_BASIC, ...GENERAL_POWERS_ADVANCED];

export const GENERAL_POWER_BY_ID: Record<string, GeneralPower> = Object.fromEntries(
  GENERAL_POWERS.map((p) => [p.id, p])
);

/** Limite de PP gasto por turno: 3 + ceil(nível / 2). */
export function ppMaxPerTurn(level: number): number {
  return 3 + Math.ceil(level / 2);
}
