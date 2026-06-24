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

export type ParanormalElement = "conhecimento" | "energia" | "morte" | "sangue";

export interface ParanormalPower {
  id: string;
  name: string;
  element: ParanormalElement;
  description: string;
  prerequisite?: string;
  affinity: string;
}

// Poderes paranormais (Livro de Regras, Cap. 5 — Transcender). Organizados por
// elemento, cada um com pré-requisito de afinidade elemental e bônus de Afinidade.
export const PARANORMAL_POWERS: ParanormalPower[] = [
  // ── CONHECIMENTO ──
  {
    id: "expansao_conhecimento", name: "Expansão de Conhecimento", element: "conhecimento",
    description: "Você aprende um poder de classe que não pertença à sua classe (se tiver pré-requisitos, precisa preenchê-los).",
    prerequisite: "Conhecimento 1",
    affinity: "Você aprende um segundo poder de classe que não pertença à sua classe.",
  },
  {
    id: "percepcao_paranormal", name: "Percepção Paranormal", element: "conhecimento",
    description: "Em cenas de investigação, ao procurar pistas você pode rolar novamente um dado com resultado menor que 10 (deve aceitar a segunda rolagem).",
    affinity: "Você pode rolar novamente até dois dados com resultado menor que 10.",
  },
  {
    id: "precognicao", name: "Precognição", element: "conhecimento",
    description: "Um “sexto sentido” o avisa do perigo. Você recebe +2 em Defesa e em testes de resistência.",
    prerequisite: "Conhecimento 1",
    affinity: "Você fica imune à condição desprevenido.",
  },
  {
    id: "sensitivo", name: "Sensitivo", element: "conhecimento",
    description: "Você sente emoções e intenções alheias, recebendo +5 em Diplomacia, Intimidação e Intuição.",
    affinity: "Em testes opostos com uma dessas perícias, o oponente sofre –1d20 (pega o pior).",
  },
  {
    id: "visao_oculto", name: "Visão do Oculto", element: "conhecimento",
    description: "Você enxerga pela percepção do Conhecimento: +5 em Percepção e enxerga no escuro.",
    affinity: "Você ignora camuflagem.",
  },
  // ── ENERGIA ──
  {
    id: "afortunado", name: "Afortunado", element: "energia",
    description: "Uma vez por rolagem, você pode rolar novamente um resultado 1 em qualquer dado que não seja d20.",
    affinity: "Além disso, uma vez por teste, pode rolar novamente um resultado 1 em d20.",
  },
  {
    id: "campo_protetor", name: "Campo Protetor", element: "energia",
    description: "Ao usar a ação esquiva, gaste 1 PE para receber +5 em Defesa.",
    prerequisite: "Energia 1",
    affinity: "Também recebe +5 em Reflexos e, até seu próximo turno, se passar num Reflexos que reduziria dano à metade, não sofre dano nenhum.",
  },
  {
    id: "causalidade_fortuita", name: "Causalidade Fortuita", element: "energia",
    description: "Em cenas de investigação, a DT para procurar pistas diminui em –5 até você encontrar uma pista.",
    affinity: "A DT para procurar pistas sempre diminui em –5 para você.",
  },
  {
    id: "golpe_sorte", name: "Golpe de Sorte", element: "energia",
    description: "Seus ataques recebem +1 na margem de ameaça.",
    prerequisite: "Energia 1",
    affinity: "Seus ataques recebem +1 no multiplicador de crítico.",
  },
  {
    id: "manipular_entropia", name: "Manipular Entropia", element: "energia",
    description: "Gaste 2 PE para fazer um alvo em alcance curto (exceto você) rolar novamente um dos dados em um teste de perícia.",
    prerequisite: "Energia 1",
    affinity: "O alvo rola novamente todos os dados que você escolher.",
  },
  // ── MORTE ──
  {
    id: "encarar_morte", name: "Encarar a Morte", element: "morte",
    description: "Durante cenas de ação, seu limite de gasto de PE por turno aumenta em +1 (não afeta a DT dos seus efeitos).",
    affinity: "O aumento passa a ser +2 (total +3).",
  },
  {
    id: "escapar_morte", name: "Escapar da Morte", element: "morte",
    description: "Uma vez por cena, ao receber dano que o deixaria com 0 PV, você fica com 1 PV. Não funciona contra dano massivo.",
    prerequisite: "Morte 1",
    affinity: "Em vez disso, evita completamente o dano (no dano massivo, fica com 1 PV).",
  },
  {
    id: "potencial_aprimorado", name: "Potencial Aprimorado", element: "morte",
    description: "Você recebe +1 PE por NEX. Os PE recebidos aumentam conforme sobe de NEX.",
    affinity: "Recebe +1 PE adicional por NEX (total +2 PE por NEX).",
  },
  {
    id: "potencial_reaproveitado", name: "Potencial Reaproveitado", element: "morte",
    description: "Uma vez por rodada, ao passar num teste de resistência, ganha 2 PE temporários cumulativos (somem no fim da cena).",
    affinity: "Ganha 3 PE temporários em vez de 2.",
  },
  {
    id: "surto_temporal", name: "Surto Temporal", element: "morte",
    description: "Uma vez por cena, em seu turno, gaste 3 PE para realizar uma ação padrão adicional.",
    prerequisite: "Morte 2",
    affinity: "Pode usar uma vez por turno em vez de uma vez por cena.",
  },
  // ── SANGUE ──
  {
    id: "anatomia_insana", name: "Anatomia Insana", element: "sangue",
    description: "50% de chance (resultado par em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo.",
    prerequisite: "Sangue 2",
    affinity: "Você fica imune aos efeitos de acertos críticos e ataques furtivos.",
  },
  {
    id: "arma_sangue", name: "Arma de Sangue", element: "sangue",
    description: "Ação de movimento e 2 PE: produz uma arma simples corpo a corpo leve (1d6 de Sangue) que não precisa empunhar. Uma vez/turno, na ação agredir, gaste 1 PE para um ataque adicional. Dura até o fim da cena.",
    affinity: "A arma se torna permanente e causa 1d10 de dano de Sangue.",
  },
  {
    id: "sangue_ferro", name: "Sangue de Ferro", element: "sangue",
    description: "Você recebe +2 PV por NEX. Os PV recebidos aumentam conforme sobe de NEX (ex.: NEX 50% = 20 PV).",
    prerequisite: "Sangue 1",
    affinity: "Recebe +5 em Fortitude e fica imune a venenos e doenças.",
  },
  {
    id: "sangue_fervente", name: "Sangue Fervente", element: "sangue",
    description: "Enquanto estiver machucado, recebe +1 em Agilidade ou Força (à escolha, sempre que ativar).",
    prerequisite: "Sangue 2",
    affinity: "O bônus aumenta para +2.",
  },
  {
    id: "sangue_vivo", name: "Sangue Vivo", element: "sangue",
    description: "Na primeira vez que ficar machucado numa cena, recebe cura acelerada 2 (nunca cura acima da metade dos PV; termina no fim da cena ou ao deixar de estar machucado).",
    prerequisite: "Sangue 1",
    affinity: "A cura acelerada aumenta para 5.",
  },
];

export const PARANORMAL_POWER_BY_ID: Record<string, ParanormalPower> = Object.fromEntries(
  PARANORMAL_POWERS.map((p) => [p.id, p]),
);
