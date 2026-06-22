// ─── ORDEM PARANORMAL — Habilidades de Classe, Trilhas e Poderes ─────────────
// Fonte: Livro de Regras v1.3

import type { ClassId } from "./data";

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface NexAbility {
  nex: number;
  description: string;
}

export interface TrailPower {
  nex: number;
  name: string;
  description: string;
}

export interface Trail {
  id: string;
  classId: ClassId;
  name: string;
  description: string;
  powers: TrailPower[];
}

export interface ClassPower {
  id: string;
  classId: ClassId;
  name: string;
  description: string;
  prerequisite?: string;
}

// ─── HABILIDADES PROGRESSIVAS POR CLASSE ─────────────────────────────────────

export const CLASS_NEX_TABLE: Record<ClassId, NexAbility[]> = {
  combatente: [
    { nex: 5,  description: "Ataque especial (2 PE, +5 em ataque ou dano)" },
    { nex: 10, description: "Habilidade de trilha (escolha uma trilha de combatente)" },
    { nex: 15, description: "Poder de combatente (escolha da lista)" },
    { nex: 20, description: "Aumento de atributo (+1 em um atributo, máx. 5)" },
    { nex: 25, description: "Ataque especial (3 PE, +10)" },
    { nex: 30, description: "Poder de combatente" },
    { nex: 35, description: "Grau de treinamento (2+INT perícias treinadas → veterano/expert)" },
    { nex: 40, description: "Habilidade de trilha (próximo poder da trilha)" },
    { nex: 45, description: "Poder de combatente" },
    { nex: 50, description: "Aumento de atributo; Versatilidade (poder extra ou 1ª habilidade de outra trilha)" },
    { nex: 55, description: "Ataque especial (4 PE, +15)" },
    { nex: 60, description: "Poder de combatente" },
    { nex: 65, description: "Habilidade de trilha" },
    { nex: 70, description: "Grau de treinamento" },
    { nex: 75, description: "Poder de combatente" },
    { nex: 80, description: "Aumento de atributo" },
    { nex: 85, description: "Ataque especial (5 PE, +20)" },
    { nex: 90, description: "Poder de combatente" },
    { nex: 95, description: "Aumento de atributo" },
    { nex: 99, description: "Habilidade de trilha (poder final)" },
  ],
  especialista: [
    { nex: 5,  description: "Eclético (2 PE para usar perícia como treinado); Perito (2 PE, +1d6 em duas perícias escolhidas)" },
    { nex: 10, description: "Habilidade de trilha (escolha uma trilha de especialista)" },
    { nex: 15, description: "Poder de especialista (escolha da lista)" },
    { nex: 20, description: "Aumento de atributo" },
    { nex: 25, description: "Perito (3 PE, +1d8)" },
    { nex: 30, description: "Poder de especialista" },
    { nex: 35, description: "Grau de treinamento (5+INT perícias treinadas → veterano/expert)" },
    { nex: 40, description: "Engenhosidade (Eclético como veterano por +2 PE); Habilidade de trilha" },
    { nex: 45, description: "Poder de especialista" },
    { nex: 50, description: "Aumento de atributo; Versatilidade" },
    { nex: 55, description: "Perito (4 PE, +1d10)" },
    { nex: 60, description: "Poder de especialista" },
    { nex: 65, description: "Habilidade de trilha" },
    { nex: 70, description: "Grau de treinamento" },
    { nex: 75, description: "Engenhosidade (Eclético como expert por +4 PE); Poder de especialista" },
    { nex: 80, description: "Aumento de atributo" },
    { nex: 85, description: "Perito (5 PE, +1d12)" },
    { nex: 90, description: "Poder de especialista" },
    { nex: 95, description: "Aumento de atributo" },
    { nex: 99, description: "Habilidade de trilha (poder final)" },
  ],
  ocultista: [
    { nex: 5,  description: "Escolhido pelo Outro Lado: pode lançar rituais de 1º círculo; começa com 3 rituais" },
    { nex: 10, description: "Habilidade de trilha (escolha uma trilha de ocultista)" },
    { nex: 15, description: "Poder de ocultista (escolha da lista)" },
    { nex: 20, description: "Aumento de atributo" },
    { nex: 25, description: "Escolhido pelo Outro Lado: rituais de 2º círculo desbloqueados" },
    { nex: 30, description: "Poder de ocultista" },
    { nex: 35, description: "Grau de treinamento (3+INT perícias treinadas → veterano/expert)" },
    { nex: 40, description: "Habilidade de trilha" },
    { nex: 45, description: "Poder de ocultista" },
    { nex: 50, description: "Aumento de atributo; Versatilidade" },
    { nex: 55, description: "Escolhido pelo Outro Lado: rituais de 3º círculo desbloqueados" },
    { nex: 60, description: "Poder de ocultista" },
    { nex: 65, description: "Habilidade de trilha" },
    { nex: 70, description: "Grau de treinamento" },
    { nex: 75, description: "Poder de ocultista" },
    { nex: 80, description: "Aumento de atributo" },
    { nex: 85, description: "Escolhido pelo Outro Lado: rituais de 4º círculo desbloqueados" },
    { nex: 90, description: "Poder de ocultista" },
    { nex: 95, description: "Aumento de atributo" },
    { nex: 99, description: "Habilidade de trilha (poder final)" },
  ],
};

// Retorna apenas as habilidades de NEX ≤ nexAtual
export function getUnlockedAbilities(classId: ClassId, nex: number): NexAbility[] {
  return CLASS_NEX_TABLE[classId].filter((a) => a.nex <= nex);
}

// ─── TRILHAS ──────────────────────────────────────────────────────────────────

export const TRAILS: Trail[] = [
  // ── COMBATENTE ──────────────────────────────────────────────────────────────
  {
    id: "aniquilador",
    classId: "combatente",
    name: "Aniquilador",
    description: "Especializado em abater alvos com eficiência. Escolhe uma arma favorita e a domina até a perfeição.",
    powers: [
      { nex: 10, name: "A Favorita", description: "Escolha uma arma favorita. Sua categoria é reduzida em I." },
      { nex: 40, name: "Técnica Secreta", description: "Categoria da favorita reduzida em II. Ao atacar com ela, gaste 2 PE para aplicar: Amplo (atinge alvo adicional adjacente) ou Destruidor (+1 no multiplicador de crítico). +2 PE por efeito adicional." },
      { nex: 65, name: "Técnica Sublime", description: "Adiciona à Técnica Secreta: Letal (+2 à margem de ameaça, pode escolher duas vezes para +5) e Perfurante (ignora até 5 de RD)." },
      { nex: 99, name: "Máquina de Matar", description: "Categoria da favorita reduzida em III, recebe +2 na margem de ameaça e +1 dado de dano do mesmo tipo." },
    ],
  },
  {
    id: "comandante",
    classId: "combatente",
    name: "Comandante de Campo",
    description: "Treinado para coordenar e auxiliar companheiros em combate, tomando decisões rápidas.",
    powers: [
      { nex: 10, name: "Inspirar Confiança", description: "Gaste uma reação e 2 PE para fazer um aliado em alcance curto rolar novamente um teste recém realizado." },
      { nex: 40, name: "Estrategista", description: "Gaste ação padrão e 1 PE por aliado (limite: INT) em alcance curto. No próximo turno deles, ganham uma ação de movimento adicional." },
      { nex: 65, name: "Brecha na Guarda", description: "Uma vez/rodada, quando aliado causar dano, gaste reação e 2 PE para que você ou outro aliado em alcance curto faça um ataque adicional. Alcance de Inspirar e Estrategista aumenta para médio." },
      { nex: 99, name: "Oficial Comandante", description: "Ação padrão e 5 PE: cada aliado visível em alcance médio recebe ação padrão adicional no próximo turno." },
    ],
  },
  {
    id: "guerreiro",
    classId: "combatente",
    name: "Guerreiro",
    description: "Transformou o corpo em arma. Golpes corpo a corpo tão poderosos quanto uma bala.",
    powers: [
      { nex: 10, name: "Técnica Letal", description: "+2 na margem de ameaça com todos os ataques corpo a corpo." },
      { nex: 40, name: "Revidar", description: "Sempre que bloquear um ataque, gaste reação e 2 PE para fazer um ataque corpo a corpo no inimigo." },
      { nex: 65, name: "Força Opressora", description: "Ao acertar ataque corpo a corpo, gaste 1 PE para realizar manobra derrubar ou empurrar como ação livre. Se derrubar, gaste 1 PE adicional para ataque extra no alvo caído." },
      { nex: 99, name: "Potência Máxima", description: "Com Ataque Especial corpo a corpo, todos os bônus numéricos são dobrados." },
    ],
  },
  {
    id: "operacoes_especiais",
    classId: "combatente",
    name: "Operações Especiais",
    description: "Ações calculadas e otimizadas, antevendo movimentos inimigos e se posicionando de forma inteligente.",
    powers: [
      { nex: 10, name: "Iniciativa Aprimorada", description: "+5 em Iniciativa e uma ação de movimento adicional na primeira rodada." },
      { nex: 40, name: "Ataque Extra", description: "Uma vez/rodada, ao fazer um ataque, gaste 2 PE para fazer um ataque adicional." },
      { nex: 65, name: "Surto de Adrenalina", description: "Uma vez/rodada, gaste 5 PE para realizar uma ação padrão ou de movimento adicional." },
      { nex: 99, name: "Sempre Alerta", description: "Recebe ação padrão adicional no início de cada cena de combate." },
    ],
  },
  {
    id: "tropa_choque",
    classId: "combatente",
    name: "Tropa de Choque",
    description: "Duro na queda, resiste a traumas físicos e se coloca entre os aliados e o perigo.",
    powers: [
      { nex: 10, name: "Casca Grossa", description: "+1 PV para cada 5% de NEX. Ao bloquear, soma Vigor na resistência a dano." },
      { nex: 40, name: "Cai Dentro", description: "Gaste reação e 1 PE: oponente em alcance curto que atacar aliado deve fazer Vontade (DT VIG) ou atacar você em vez disso." },
      { nex: 65, name: "Duro de Matar", description: "Reação e 2 PE: reduz dano não paranormal à metade. Em NEX 85%, funciona também contra dano paranormal." },
      { nex: 99, name: "Inquebrável", description: "Machucado: +5 Defesa e RD 5. Morrendo: não fica indefeso e ainda pode realizar ações." },
    ],
  },

  // ── ESPECIALISTA ─────────────────────────────────────────────────────────────
  {
    id: "atirador_elite",
    classId: "especialista",
    name: "Atirador de Elite",
    description: "Um tiro, uma morte. Neutraliza ameaças de longe com precisão cirúrgica.",
    powers: [
      { nex: 10, name: "Mira de Elite", description: "Proficiência com armas de fogo de bala longa. Soma INT em rolagens de dano com essas armas." },
      { nex: 40, name: "Disparo Letal", description: "Ao usar ação mirar, gaste 1 PE para +2 na margem de ameaça do próximo ataque até o fim do próximo turno." },
      { nex: 65, name: "Disparo Impactante", description: "Com arma de fogo de calibre grosso, gaste 2 PE para fazer manobras derrubar/desarmar/empurrar/quebrar à distância." },
      { nex: 99, name: "Atirar para Matar", description: "Crítico com arma de fogo: dano máximo, sem rolar dados." },
    ],
  },
  {
    id: "infiltrador",
    classId: "especialista",
    name: "Infiltrador",
    description: "Perito em infiltração e neutralização de alvos desprevenidos sem causar alarde.",
    powers: [
      { nex: 10, name: "Ataque Furtivo", description: "Uma vez/rodada, ao atingir alvo desprevenido ou flanqueado (corpo a corpo ou alcance curto), gaste 1 PE para +1d6 dano. NEX 40%: +2d6, NEX 65%: +3d6, NEX 99%: +4d6." },
      { nex: 40, name: "Gatuno", description: "+5 em Atletismo e Crime. Pode percorrer deslocamento normal ao se esconder sem penalidade." },
      { nex: 65, name: "Assassinar", description: "Ação de movimento e 3 PE: analise alvo em alcance curto. Até fim do próximo turno, primeiro Ataque Furtivo tem dados extras dobrados. Se acertar, alvo fica inconsciente ou morrendo (Fortitude DT AGI evita)." },
      { nex: 99, name: "Sombra Fugaz", description: "Gaste 3 PE para não sofrer penalidade de –15 em Furtividade após atacar ou fazer ação chamativa." },
    ],
  },
  {
    id: "medico_campo",
    classId: "especialista",
    name: "Médico de Campo",
    description: "Treinado em primeiros socorros e tratamento de emergência. Requer treinamento em Medicina e kit de medicina.",
    powers: [
      { nex: 10, name: "Paramédico", description: "Ação padrão e 2 PE: cura 2d10 PV em si ou aliado adjacente. +1d10 PV por PE adicional em NEX 40%, 65% e 99%." },
      { nex: 40, name: "Equipe de Trauma", description: "Ação padrão e 2 PE: remove condição negativa (exceto morrendo) de aliado adjacente." },
      { nex: 65, name: "Resgate", description: "Uma vez/rodada: aproxime-se de aliado machucado/morrendo com ação livre. Ao curar ou remover condição: você e aliado recebem +5 Defesa até próximo turno." },
      { nex: 99, name: "Reanimação", description: "Uma vez/cena: ação completa e 10 PE — traz de volta personagem que morreu na mesma cena (exceto morte por dano massivo)." },
    ],
  },
  {
    id: "negociador",
    classId: "especialista",
    name: "Negociador",
    description: "Diplomata habilidoso que resolve problemas com palavras e influência social.",
    powers: [
      { nex: 10, name: "Eloquência", description: "Ação completa e 1 PE/alvo em alcance curto: teste de Diplomacia/Enganação/Intimidação vs. Vontade. Vencendo, alvos ficam fascinados enquanto você se concentrar." },
      { nex: 40, name: "Discurso Motivador", description: "Ação padrão e 4 PE: você e aliados em alcance curto recebem +5 em perícias até fim da cena. Em NEX 65%: 8 PE para +10." },
      { nex: 65, name: "Eu Conheço um Cara", description: "Uma vez/missão: ative rede de contatos para pedir um favor (trocar equipamento, descanso, resgate…). Mestre tem palavra final." },
      { nex: 99, name: "Truque de Mestre", description: "Gaste 5 PE para simular qualquer habilidade de aliado vista na cena, usando seus próprios parâmetros e pagando todos os custos." },
    ],
  },
  {
    id: "tecnico",
    classId: "especialista",
    name: "Técnico",
    description: "Especialista em manutenção e improvisação de equipamentos. Conhecimento técnico avançado.",
    powers: [
      { nex: 10, name: "Inventário Otimizado", description: "Soma Intelecto à Força para calcular capacidade de carga. Ex: FOR 1 + INT 3 = 20 espaços." },
      { nex: 40, name: "Remendão", description: "Ação completa e 1 PE: remove condição quebrado de equipamento adjacente até fim da cena. Qualquer equipamento geral tem categoria reduzida em I para você." },
      { nex: 65, name: "Improvisar", description: "Ação completa e 2 PE (+2 PE/categoria): cria versão funcional de qualquer equipamento geral. Torna-se inútil no final da cena." },
      { nex: 99, name: "Preparado para Tudo", description: "Ação de movimento e 3 PE/categoria: lembre que guardou qualquer item (exceto armas) no fundo da bolsa!" },
    ],
  },

  // ── OCULTISTA ─────────────────────────────────────────────────────────────────
  {
    id: "conduíte",
    classId: "ocultista",
    name: "Conduíte",
    description: "Domina aspectos fundamentais da conjuração — alcance, velocidade e interferência em rituais alheios.",
    powers: [
      { nex: 10, name: "Ampliar Ritual", description: "Ao lançar ritual, gaste +2 PE para aumentar alcance em um passo (curto→médio→longo→extremo) ou dobrar área de efeito." },
      { nex: 40, name: "Acelerar Ritual", description: "Uma vez/rodada: aumente o custo de um ritual em 4 PE para lançá-lo como ação livre." },
      { nex: 65, name: "Anular Ritual", description: "Quando for alvo de ritual, gaste PE igual ao custo dele e faça teste oposto de Ocultismo. Se vencer, o ritual é anulado." },
      { nex: 99, name: "Canalizar o Medo", description: "Você aprende o ritual Canalizar o Medo." },
    ],
  },
  {
    id: "flagelador",
    classId: "ocultista",
    name: "Flagelador",
    description: "Transforma dor e sofrimento em poder paranormal para seus rituais.",
    powers: [
      { nex: 10, name: "Poder do Flagelo", description: "Ao conjurar ritual, gaste PV próprios para pagar PE (taxa 2 PV por 1 PE). PV gastos só recuperam com descanso." },
      { nex: 40, name: "Abraçar a Dor", description: "Reação e 2 PE: ao sofrer dano não paranormal, reduza à metade." },
      { nex: 65, name: "Absorver Agonia", description: "Ao reduzir inimigos a 0 PV com ritual, receba PE temporários iguais ao círculo do ritual." },
      { nex: 99, name: "Medo Tangível", description: "Você aprende o ritual Medo Tangível." },
    ],
  },
  {
    id: "graduado",
    classId: "ocultista",
    name: "Graduado",
    description: "Conjurador versátil que conhece mais rituais e os torna mais difíceis de resistir.",
    powers: [
      { nex: 10, name: "Saber Ampliado", description: "Aprende ritual de 1º círculo extra. A cada novo círculo desbloqueado, aprende um ritual adicional daquele círculo (não contam no limite)." },
      { nex: 40, name: "Grimório Ritualístico", description: "Cria grimório que armazena rituais extras (1 espaço). Aprende INT rituais de 1º/2º círculo. Para conjurar, gaste ação completa o folheando." },
      { nex: 65, name: "Rituais Eficientes", description: "A DT para resistir a todos os seus rituais aumenta em +5." },
      { nex: 99, name: "Conhecendo o Medo", description: "Você aprende o ritual Conhecendo o Medo." },
    ],
  },
  {
    id: "intuitivo",
    classId: "ocultista",
    name: "Intuitivo",
    description: "Preparou a mente para resistir ao Outro Lado, expandindo limites paranormais.",
    powers: [
      { nex: 10, name: "Mente Sã", description: "Resistência paranormal +5 (bônus em testes de resistência contra efeitos paranormais)." },
      { nex: 40, name: "Presença Poderosa", description: "Adicione Presença ao limite de PE por turno, mas apenas para conjurar rituais." },
      { nex: 65, name: "Inabalável", description: "Resistência a dano mental e paranormal 10. Se passar em teste de Vontade contra efeito paranormal que reduziria dano à metade, não sofre dano." },
      { nex: 99, name: "Presença do Medo", description: "Você aprende o ritual Presença do Medo." },
    ],
  },
  {
    id: "lamina_paranormal",
    classId: "ocultista",
    name: "Lâmina Paranormal",
    description: "Mescla habilidades de conjuração com combate corpo a corpo.",
    powers: [
      { nex: 10, name: "Lâmina Maldita", description: "Aprende Amaldiçoar Arma (–1 PE se já conhece). Pode usar Ocultismo em vez de Luta/Pontaria com a arma amaldiçoada." },
      { nex: 40, name: "Gladiador Paranormal", description: "Ao acertar ataque corpo a corpo: receba 2 PE temporários (máximo por cena = limite de PE). PE temporários desaparecem no fim da cena." },
      { nex: 65, name: "Conjuração Marcial", description: "Uma vez/rodada: ao lançar ritual de ação padrão, gaste 2 PE para fazer ataque corpo a corpo como ação livre." },
      { nex: 99, name: "Lâmina do Medo", description: "Você aprende o ritual Lâmina do Medo." },
    ],
  },
];

export const TRAIL_BY_ID: Record<string, Trail> = Object.fromEntries(
  TRAILS.map((t) => [t.id, t]),
);

export const TRAILS_BY_CLASS: Record<ClassId, Trail[]> = {
  combatente: TRAILS.filter((t) => t.classId === "combatente"),
  especialista: TRAILS.filter((t) => t.classId === "especialista"),
  ocultista: TRAILS.filter((t) => t.classId === "ocultista"),
};

// ─── PODERES DE CLASSE (escolhíveis) ─────────────────────────────────────────

export const CLASS_POWERS: ClassPower[] = [
  // ── Combatente ──────────────────────────────────────────────────────────────
  { id: "c_armamento_pesado",   classId: "combatente", name: "Armamento Pesado",      description: "Proficiência com armas pesadas.", prerequisite: "FOR 2" },
  { id: "c_artista_marcial",    classId: "combatente", name: "Artista Marcial",        description: "Ataques desarmados: 1d6 letal, contam como armas ágeis. NEX 35%: 1d8. NEX 70%: 1d10." },
  { id: "c_ataque_oportunidade",classId: "combatente", name: "Ataque de Oportunidade",description: "Ao sair voluntariamente de adjacência, gaste reação e 1 PE para ataque corpo a corpo." },
  { id: "c_duas_armas",         classId: "combatente", name: "Combater com Duas Armas",description: "Com duas armas (ao menos uma leve) na ação agredir: dois ataques (–5 em todos até próximo turno).", prerequisite: "AGI 3, treinado em Luta ou Pontaria" },
  { id: "c_defensivo",          classId: "combatente", name: "Combate Defensivo",      description: "Ao agredir, combata defensivamente: –5 em ataques, mas +5 em Defesa até próximo turno.", prerequisite: "INT 2" },
  { id: "c_golpe_demolidor",    classId: "combatente", name: "Golpe Demolidor",        description: "Manobra quebrar ou ataque em objeto: gaste 1 PE para +2 dados de dano do mesmo tipo.", prerequisite: "FOR 2, treinado em Luta" },
  { id: "c_golpe_pesado",       classId: "combatente", name: "Golpe Pesado",           description: "Dano de armas corpo a corpo +1 dado do mesmo tipo." },
  { id: "c_incansavel",         classId: "combatente", name: "Incansável",             description: "Uma vez/cena: gaste 2 PE para ação de investigação adicional usando Força ou Agilidade." },
  { id: "c_protecao_pesada",    classId: "combatente", name: "Proteção Pesada",        description: "Proficiência com proteções pesadas.", prerequisite: "NEX 30%" },
  { id: "c_reflexos_def",       classId: "combatente", name: "Reflexos Defensivos",    description: "+2 em Defesa e testes de resistência.", prerequisite: "AGI 2" },
  { id: "c_saque_rapido",       classId: "combatente", name: "Saque Rápido",           description: "Sacar/guardar itens como ação livre. Uma vez/rodada: recarregar arma de disparo como ação livre.", prerequisite: "treinado em Iniciativa" },
  { id: "c_segurar_gatilho",    classId: "combatente", name: "Segurar o Gatilho",      description: "Ao acertar com arma de fogo, faça ataque adicional gastando 2 PE (e mais 2 PE por ataque subsequente até errar).", prerequisite: "NEX 60%" },
  { id: "c_sentido_tatico",     classId: "combatente", name: "Sentido Tático",         description: "Ação de movimento e 2 PE: analise ambiente, receba INT em Defesa e testes de resistência até fim da cena.", prerequisite: "INT 2, treinado em Percepção e Tática" },
  { id: "c_tanque",             classId: "combatente", name: "Tanque de Guerra",       description: "Com proteção pesada: Defesa e RD aumentam em +2.", prerequisite: "Proteção Pesada" },
  { id: "c_tiro_certeiro",      classId: "combatente", name: "Tiro Certeiro",          description: "Some AGI no dano com armas de disparo e ignore penalidade contra alvo em corpo a corpo.", prerequisite: "treinado em Pontaria" },
  { id: "c_tiro_cobertura",     classId: "combatente", name: "Tiro de Cobertura",      description: "Ação padrão e 1 PE: Pontaria vs. Vontade — alvo não pode sair do lugar e –5 em ataques até próximo turno." },
  { id: "c_transcender",        classId: "combatente", name: "Transcender",            description: "Escolha um poder paranormal. Você o recebe, mas não ganha Sanidade neste NEX. Pode escolher várias vezes." },
  { id: "c_trein_pericia",      classId: "combatente", name: "Treinamento em Perícia", description: "Torne-se treinado em duas perícias. NEX 35%+: pode escolher veterano. NEX 70%+: pode escolher expert. Pode escolher várias vezes." },
  { id: "c_presteza",           classId: "combatente", name: "Presteza Atlética",      description: "Ao facilitar investigação, gaste 1 PE para usar Força ou Agilidade. Se passar, aliado que usar o bônus também recebe +5." },

  // ── Especialista ─────────────────────────────────────────────────────────────
  { id: "e_artista_marcial",  classId: "especialista", name: "Artista Marcial",          description: "Ataques desarmados: 1d6 letal, armas ágeis. NEX 35%: 1d8. NEX 70%: 1d10." },
  { id: "e_balistica",        classId: "especialista", name: "Balística Avançada",        description: "Proficiência com armas táticas de fogo. +2 em dano com armas de fogo." },
  { id: "e_conhec_aplicado",  classId: "especialista", name: "Conhecimento Aplicado",     description: "Ao fazer teste de perícia (exceto Luta e Pontaria), gaste 2 PE para usar INT como atributo-base.", prerequisite: "INT 2" },
  { id: "e_hacker",           classId: "especialista", name: "Hacker",                    description: "+5 em Tecnologia para invadir sistemas. Hackear qualquer sistema leva apenas uma ação completa.", prerequisite: "treinado em Tecnologia" },
  { id: "e_maos_rapidas",     classId: "especialista", name: "Mãos Rápidas",              description: "Gaste 1 PE para fazer teste de Crime como ação livre.", prerequisite: "AGI 3, treinado em Crime" },
  { id: "e_mochila",          classId: "especialista", name: "Mochila de Utilidades",     description: "Um item (exceto armas) à sua escolha conta como categoria abaixo e ocupa 1 espaço a menos." },
  { id: "e_mov_tatico",       classId: "especialista", name: "Movimento Tático",          description: "Gaste 1 PE para ignorar penalidade em terreno difícil e ao escalar até fim do turno.", prerequisite: "treinado em Atletismo" },
  { id: "e_na_trilha",        classId: "especialista", name: "Na Trilha Certa",           description: "Ao ter sucesso em procurar pistas, gaste 1 PE (+1 PE por uso anterior) para +5 (+10, +15…) no próximo teste." },
  { id: "e_nerd",             classId: "especialista", name: "Nerd",                      description: "Uma vez/cena: Atualidades DT 20 (2 PE) — receba informação útil para a cena atual." },
  { id: "e_ninja_urbano",     classId: "especialista", name: "Ninja Urbano",              description: "Proficiência com armas táticas corpo a corpo e de disparo (exceto fogo). +2 em dano nessas armas." },
  { id: "e_pensamento_agil",  classId: "especialista", name: "Pensamento Ágil",           description: "Uma vez/rodada em cena de investigação: gaste 2 PE para ação de procurar pistas adicional." },
  { id: "e_perito_explod",    classId: "especialista", name: "Perito em Explosivos",      description: "Some INT na DT de seus explosivos. Pode excluir INT alvos dos efeitos da explosão." },
  { id: "e_primeira_impress", classId: "especialista", name: "Primeira Impressão",        description: "+10 no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição por cena." },
  { id: "e_transcender",      classId: "especialista", name: "Transcender",               description: "Escolha um poder paranormal. Não ganha Sanidade neste NEX. Pode escolher várias vezes." },
  { id: "e_trein_pericia",    classId: "especialista", name: "Treinamento em Perícia",    description: "Torne-se treinado em duas perícias. NEX 35%+: veterano. NEX 70%+: expert. Pode escolher várias vezes." },

  // ── Ocultista ─────────────────────────────────────────────────────────────────
  { id: "o_camuflar",         classId: "ocultista", name: "Camuflar Ocultismo",       description: "Esconda símbolos ritualísticos. +2 PE ao lançar ritual sem componentes/gestos (DT 25 para perceber)." },
  { id: "o_criar_selo",       classId: "ocultista", name: "Criar Selo",               description: "Faça selos paranormais de rituais conhecidos (ação de interlúdio + custo em PE). Máximo de selos simultâneos = Presença." },
  { id: "o_envolto",          classId: "ocultista", name: "Envolto em Mistério",      description: "+5 em Enganação e Intimidação contra pessoas não treinadas em Ocultismo." },
  { id: "o_especialista_el",  classId: "ocultista", name: "Especialista em Elemento", description: "Escolha um elemento. DT para resistir a seus rituais desse elemento +2." },
  { id: "o_ferramentas",      classId: "ocultista", name: "Ferramentas Paranormais",  description: "Reduz categoria de item paranormal em I. Ativa itens paranormais sem custo em PE." },
  { id: "o_fluxo",            classId: "ocultista", name: "Fluxo de Poder",           description: "Mantenha dois efeitos sustentados simultaneamente com uma ação livre (pagando custo de cada).", prerequisite: "NEX 60%" },
  { id: "o_guiado",           classId: "ocultista", name: "Guiado pelo Paranormal",   description: "Uma vez/cena: gaste 2 PE para ação de investigação adicional." },
  { id: "o_identificacao",    classId: "ocultista", name: "Identificação Paranormal", description: "+10 em Ocultismo para identificar criaturas, objetos ou rituais." },
  { id: "o_improvisar_comp",  classId: "ocultista", name: "Improvisar Componentes",   description: "Uma vez/cena: ação completa, Investigação DT 15 para encontrar componentes de um elemento à escolha." },
  { id: "o_intuicao",         classId: "ocultista", name: "Intuição Paranormal",      description: "Ao facilitar investigação, some INT ou PRE (à escolha) no teste." },
  { id: "o_mestre_elemento",  classId: "ocultista", name: "Mestre em Elemento",       description: "Escolha um elemento. –1 PE no custo de rituais desse elemento.", prerequisite: "Especialista em Elemento, NEX 45%" },
  { id: "o_ritual_potente",   classId: "ocultista", name: "Ritual Potente",           description: "Some INT nas rolagens de dano ou efeitos de cura de seus rituais.", prerequisite: "INT 2" },
  { id: "o_ritual_predileto", classId: "ocultista", name: "Ritual Predileto",         description: "Escolha um ritual que conhece. –1 PE no custo (cumulativo)." },
  { id: "o_tatuagem",         classId: "ocultista", name: "Tatuagem Ritualística",    description: "Símbolos na pele: –1 PE em rituais de alcance pessoal que tenham você como alvo." },
  { id: "o_transcender",      classId: "ocultista", name: "Transcender",              description: "Escolha um poder paranormal. Não ganha Sanidade neste NEX. Pode escolher várias vezes." },
  { id: "o_trein_pericia",    classId: "ocultista", name: "Treinamento em Perícia",   description: "Torne-se treinado em duas perícias. NEX 35%+: veterano. NEX 70%+: expert. Pode escolher várias vezes." },
];

export const CLASS_POWERS_BY_CLASS: Record<ClassId, ClassPower[]> = {
  combatente: CLASS_POWERS.filter((p) => p.classId === "combatente"),
  especialista: CLASS_POWERS.filter((p) => p.classId === "especialista"),
  ocultista: CLASS_POWERS.filter((p) => p.classId === "ocultista"),
};

// ─── PODERES PARANORMAIS (Transcender / Cultista Arrependido) ─────────────────
// Disponíveis via poder "Transcender" de qualquer classe, ou para Cultista
// Arrependido na criação (substituindo ganho de SAN pela metade).

export interface ParanormalPower {
  id: string;
  name: string;
  description: string;
}

export const PARANORMAL_POWERS: ParanormalPower[] = [
  {
    id: "ampliar_sentidos",
    name: "Ampliar Sentidos",
    description: "+5 em Percepção e Investigação. Você enxerga no escuro até 18m e detecta seres pelo olfato/audição até 9m, mesmo sem visão.",
  },
  {
    id: "aura_vitalizante",
    name: "Aura Vitalizante",
    description: "Aliados adjacentes a você no início do turno recuperam 1 PV. O efeito se aplica uma vez por turno por personagem.",
  },
  {
    id: "corpo_paranormal",
    name: "Corpo Paranormal",
    description: "Imunidade a veneno e doenças naturais. +5 em testes de Fortitude contra efeitos ambientais e condições físicas.",
  },
  {
    id: "escudo_paranormal",
    name: "Escudo Paranormal",
    description: "Você possui Redução de Dano paranormal 5. Dano de rituais e criaturas do Outro Lado é reduzido em 5 pontos.",
  },
  {
    id: "forca_sobre_humana",
    name: "Força Sobre-Humana",
    description: "+2 em Força (não aumenta PV retroativos). Ataques desarmados causam 1d6 de dano de impacto.",
  },
  {
    id: "manto_sombrio",
    name: "Manto Sombrio",
    description: "Em ambientes com pouca luz ou escuridão, você possui camuflagem (50% de chance de falha em ataques contra você). +5 em Furtividade.",
  },
  {
    id: "olhos_alem",
    name: "Olhos do Além",
    description: "Você enxerga manifestações paranormais, criaturas incorpóreas e itens amaldiçoados automaticamente. Equivale ao ritual Terceiro Olho passivo.",
  },
  {
    id: "presenca_apavorante",
    name: "Presença Apavorante",
    description: "Uma vez por cena, ação de movimento: teste de Presença vs. Vontade contra todos inimigos que possam ver você em alcance curto. Se falhar, ficam apavorados por 1d4 rodadas.",
  },
  {
    id: "pulso_paranormal",
    name: "Pulso Paranormal",
    description: "Ação padrão: projete pulso de energia do Outro Lado (alcance curto, 1d6+PRE de dano paranormal). Não exige proficiência e não pode ser bloqueado por proteção comum.",
  },
  {
    id: "sentido_perigo",
    name: "Sentido do Perigo",
    description: "Você nunca é surpreendido. Se outro efeito causaria surpresa, você ainda age no primeiro turno. +5 em Iniciativa.",
  },
  {
    id: "toque_anestesiante",
    name: "Toque Anestesiante",
    description: "Ação padrão e toque: alvo deve fazer Fortitude (DT = 10 + PRE) ou fica inconsciente até o fim da cena. Funciona apenas contra humanos e humanoides.",
  },
  {
    id: "velocidade_sobre_humana",
    name: "Velocidade Sobre-Humana",
    description: "+2 em Agilidade (não aumenta PE ou Defesa retroativamente). Seu deslocamento aumenta em +3m.",
  },
  {
    id: "voo",
    name: "Voo",
    description: "Você pode voar com velocidade igual ao seu deslocamento. Manter o voo exige uma ação livre por rodada; se não puder agir, você cai.",
  },
];

export const PARANORMAL_POWER_BY_ID: Record<string, ParanormalPower> = Object.fromEntries(
  PARANORMAL_POWERS.map((p) => [p.id, p]),
);
