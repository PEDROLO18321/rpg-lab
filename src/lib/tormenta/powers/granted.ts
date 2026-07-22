// ─── TORMENTA 20 — Poderes Concedidos (Capítulo 2, pág. 133-136) ─────────────
// Concedidos por devoção a um deus específico (ver gods.ts grantedPowers).
import type { Power } from "./types";

export const GRANTED_POWERS: Power[] = [
  {
    id: "afinidade-com-a-tormenta",
    name: "Afinidade com a Tormenta",
    category: "concedido",
    prerequisite: "Devoto de Aharadak",
    description:
      "Você recebe +10 em testes de resistência contra efeitos da Tormenta e de suas criaturas.",
  },
  {
    id: "anfibio",
    name: "Anfíbio",
    category: "concedido",
    prerequisite: "Devoto do Oceano",
    description:
      "Você pode respirar embaixo d’água e adquire deslocamento de natação igual a seu deslocamento terrestre.",
  },
  {
    id: "armas-da-ambicao",
    name: "Armas da Ambição",
    category: "concedido",
    prerequisite: "Devoto de Valkaria",
    description:
      "Você recebe +1 em testes de ataque com armas nas quais é proficiente.",
  },
  {
    id: "arsenal-das-profundezas",
    name: "Arsenal das Profundezas",
    category: "concedido",
    prerequisite: "Devoto do Oceano",
    description:
      "Você recebe +2 nas rolagens de dano com azagaias, lanças e tridentes.",
  },
  {
    id: "astucia-da-serpente",
    name: "Astúcia da Serpente",
    category: "concedido",
    prerequisite: "Devoto de Sszzaas",
    description: "Você recebe +2 em Enganação e Intuição.",
  },
  {
    id: "ataque-piedoso",
    name: "Ataque Piedoso",
    category: "concedido",
    prerequisite: "Devoto de Lena ou Thyatis",
    description:
      "Você pode usar armas de corpo a corpo para causar dano não letal sem sofrer a penalidade de –5 no teste de ataque.",
  },
  {
    id: "aura-de-medo",
    name: "Aura de Medo",
    category: "concedido",
    prerequisite: "Devoto de Kallyadranoch",
    description:
      "Você pode gastar 2 PM para gerar uma aura de medo com alcance curto e duração até o fim da cena. Todos os inimigos que entrem na aura devem fazer um teste de Vontade (CD Car) ou ficam abalados até o fim da cena. Uma criatura que passe no teste de Vontade fica imune a esta habilidade por um dia.",
  },
  {
    id: "aura-de-paz",
    name: "Aura de Paz",
    category: "concedido",
    prerequisite: "Devoto de Marah",
    description:
      "Você pode gastar 2 PM para gerar uma aura de paz com alcance curto e duração de uma cena. Qualquer inimigo dentro da aura que tente fazer uma ação hostil contra você deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Se passar, fica imune a esta habilidade por um dia.",
  },
  {
    id: "aura-restauradora",
    name: "Aura Restauradora",
    category: "concedido",
    prerequisite: "Devoto de Lena",
    description:
      "Você e seus aliados em alcance curto recuperam duas vezes mais pontos de vida por descanso.",
  },
  {
    id: "bencao-do-mana",
    name: "Bênção do Mana",
    category: "concedido",
    prerequisite: "Devoto de Wynna",
    description: "Você recebe +3 pontos de mana.",
  },
  {
    id: "caricia-sombria",
    name: "Carícia Sombria",
    category: "concedido",
    prerequisite: "Devoto de Tenebra",
    description:
      "Você pode gastar 1 PM e uma ação padrão para cobrir sua mão com energia negativa e tocar uma criatura em alcance corpo a corpo. A criatura sofre 2d6 pontos de dano de trevas (Fortitude CD Sab reduz à metade) e você recupera PV iguais à metade do dano causado. Você pode aprender Toque Vampírico como uma magia divina. Se fizer isso, o custo dela diminui em –1 PM.",
  },
  {
    id: "centelha-magica",
    name: "Centelha Mágica",
    category: "concedido",
    prerequisite: "Devoto de Wynna, não conjurador",
    description:
      "Escolha uma magia arcana ou divina de 1º círculo. Você aprende e pode lançar essa magia. Pré-requisito: não possuir a habilidade de classe Magias.",
  },
  {
    id: "conhecimento-enciclopedico",
    name: "Conhecimento Enciclopédico",
    category: "concedido",
    prerequisite: "Devoto de Tanna-Toh",
    description:
      "Você se torna treinado em duas perícias baseadas em Inteligência a sua escolha.",
  },
  {
    id: "conjurar-arma",
    name: "Conjurar Arma",
    category: "concedido",
    prerequisite: "Devoto de Arsenal",
    description:
      "Você pode gastar 1 PM para invocar uma arma corpo a corpo ou de arremesso com a qual seja proficiente. A arma surge em sua mão, recebe um bônus de +1 em testes de ataque e rolagens de dano e dura pela cena. Você não pode criar armas de disparo, mas pode criar 20 projéteis (flechas, virotes etc.).",
  },
  {
    id: "coragem-total",
    name: "Coragem Total",
    category: "concedido",
    prerequisite: "Devoto de Arsenal, Khalmyr, Lin-Wu ou Valkaria",
    description:
      "Você é imune a efeitos de medo, mágicos ou não. Este poder não elimina fobias raciais (como o medo de altura dos minotauros).",
  },
  {
    id: "cura-gentil",
    name: "Cura Gentil",
    category: "concedido",
    prerequisite: "Devoto de Lena",
    description:
      "Você adiciona seu bônus de Carisma (mínimo +1) aos PV restaurados por suas magias de cura.",
  },
  {
    id: "curandeira-perfeita",
    name: "Curandeira Perfeita",
    category: "concedido",
    prerequisite: "Devoto de Lena",
    description:
      "Você sempre pode escolher 10 em testes de Cura. Além disso, pode usar essa perícia mesmo sem um kit de medicamentos. Se usar o kit, recebe +2 no teste de Cura.",
  },
  {
    id: "dedo-verde",
    name: "Dedo Verde",
    category: "concedido",
    prerequisite: "Devoto de Allihanna",
    description: "Você aprende e pode lançar Controlar Plantas.",
  },
  {
    id: "descanso-natural",
    name: "Descanso Natural",
    category: "concedido",
    prerequisite: "Devoto de Allihanna",
    description:
      "Para você, dormir ao relento conta como uma estalagem confortável.",
  },
  {
    id: "dom-da-imortalidade",
    name: "Dom da Imortalidade",
    category: "concedido",
    prerequisite: "Devoto de Thyatis, paladino",
    description:
      "Você é imortal. Sempre que morre, não importando o motivo, volta à vida após 3d6 dias. Você não perde níveis de experiência. Apenas paladinos podem escolher este poder. Um personagem pode ter Dom da Imortalidade ou Dom da Ressurreição, mas não ambos.",
  },
  {
    id: "dom-da-profecia",
    name: "Dom da Profecia",
    category: "concedido",
    prerequisite: "Devoto de Thyatis",
    description:
      "Você pode lançar Augúrio. Você também pode gastar 2 PM para receber +2 em um teste.",
  },
  {
    id: "dom-da-ressurreicao",
    name: "Dom da Ressurreição",
    category: "concedido",
    prerequisite: "Devoto de Thyatis, clérigo",
    description:
      "Você pode gastar uma ação completa e todos os PM que possui (mínimo 1 PM) para tocar o corpo de uma criatura morta há menos de um ano e ressuscitá-la. A criatura volta à vida com 1 PV e 0 PM, e perde 2 pontos de Constituição permanentemente. Este poder só pode ser usado uma vez em cada criatura. Apenas clérigos podem escolher este poder. Um personagem pode ter Dom da Imortalidade ou Dom da Ressurreição, mas não ambos.",
  },
  {
    id: "dom-da-verdade",
    name: "Dom da Verdade",
    category: "concedido",
    prerequisite: "Devoto de Khalmyr",
    description:
      "Você pode pagar 1 PM para receber +5 em testes de Intuição até o fim da cena.",
  },
  {
    id: "escamas-draconicas",
    name: "Escamas Dracônicas",
    category: "concedido",
    prerequisite: "Devoto de Kallyadranoch",
    description: "Você recebe +1 na Defesa.",
  },
  {
    id: "escudo-magico",
    name: "Escudo Mágico",
    category: "concedido",
    prerequisite: "Devoto de Wynna",
    description:
      "Quando lança uma magia, você recebe +2 na Defesa até o início do seu próximo turno.",
  },
  {
    id: "espada-justiceira",
    name: "Espada Justiceira",
    category: "concedido",
    prerequisite: "Devoto de Khalmyr",
    description:
      "Você pode gastar 1 PM para encantar sua espada (ou outra arma corpo a corpo de corte que esteja empunhando). Ela recebe +1 em testes de ataque e rolagens de dano até o fim da cena.",
  },
  {
    id: "espada-solar",
    name: "Espada Solar",
    category: "concedido",
    prerequisite: "Devoto de Azgher",
    description:
      "Você pode gastar 1 PM para fazer uma arma corpo a corpo de corte que esteja empunhando causar +1d6 de dano por fogo até o fim da cena.",
  },
  {
    id: "farsa-do-fingidor",
    name: "Farsa do Fingidor",
    category: "concedido",
    prerequisite: "Devoto de Hyninn",
    description: "Você aprende e pode lançar Criar Ilusão.",
  },
  {
    id: "forma-de-macaco",
    name: "Forma de Macaco",
    category: "concedido",
    prerequisite: "Devoto de Hyninn",
    description:
      "Você pode gastar uma ação completa e 2 PM para se transformar em um macaco. Você adquire tamanho Minúsculo (o que fornece +5 em Furtividade e –5 em testes de manobra) e recebe deslocamento de escalar 9m. Seu equipamento desaparece (e você perde seus benefícios) até você voltar ao normal, mas suas outras estatísticas não são alteradas. A transformação dura indefinidamente, mas termina caso você faça um ataque, lance uma magia ou sofra dano.",
  },
  {
    id: "furia-divina",
    name: "Fúria Divina",
    category: "concedido",
    prerequisite: "Devoto de Thwor",
    description:
      "Você pode gastar 2 PM para invocar uma fúria selvagem, tornando-se temível em combate. Você recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode executar nenhuma ação que exija paciência ou concentração (como usar a perícia Furtividade ou lançar magias). A Fúria Divina termina se, ao fim da rodada, você não tiver atacado nem sido alvo de um efeito hostil.",
  },
  {
    id: "golpista-divino",
    name: "Golpista Divino",
    category: "concedido",
    prerequisite: "Devoto de Hyninn",
    description: "Você recebe +2 em Enganação e Ladinagem.",
  },
  {
    id: "habitante-do-deserto",
    name: "Habitante do Deserto",
    category: "concedido",
    prerequisite: "Devoto de Azgher",
    description:
      "Você recebe resistência a fogo 5 e pode pagar 1 PM para criar água pura e potável suficiente para um odre (ou outro recipiente pequeno).",
  },
  {
    id: "inimigo-de-tenebra",
    name: "Inimigo de Tenebra",
    category: "concedido",
    prerequisite: "Devoto de Azgher",
    description:
      "Seus ataques e habilidades causam +1d6 pontos de dano contra mortos-vivos.",
  },
  {
    id: "kiai-divino",
    name: "Kiai Divino",
    category: "concedido",
    prerequisite: "Devoto de Lin-Wu",
    description:
      "Quando faz um ataque corpo a corpo, você pode pagar 2 PM. Se acertar o ataque, causa dano máximo.",
  },
  {
    id: "liberdade-divina",
    name: "Liberdade Divina",
    category: "concedido",
    prerequisite: "Devoto de Valkaria",
    description:
      "Você pode gastar 2 PM e uma reação para lançar Libertação com alcance pessoal e duração de 1 rodada.",
  },
  {
    id: "manto-da-penumbra",
    name: "Manto da Penumbra",
    category: "concedido",
    prerequisite: "Devoto de Tenebra",
    description: "Você aprende e pode lançar Escuridão.",
  },
  {
    id: "mente-analitica",
    name: "Mente Analítica",
    category: "concedido",
    prerequisite: "Devoto de Tanna-Toh",
    description: "Você recebe +2 em Intuição e Vontade.",
  },
  {
    id: "mente-vazia",
    name: "Mente Vazia",
    category: "concedido",
    prerequisite: "Devoto de Lin-Wu",
    description: "Você recebe +2 em Iniciativa e Vontade.",
  },
  {
    id: "mestre-dos-mares",
    name: "Mestre dos Mares",
    category: "concedido",
    prerequisite: "Devoto do Oceano",
    description:
      "Você pode falar com animais aquáticos (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra criaturas aquáticas.",
  },
  {
    id: "olhar-amedrontador",
    name: "Olhar Amedrontador",
    category: "concedido",
    prerequisite: "Devoto de Megalokk ou Thwor",
    description: "Você aprende e pode lançar Amedrontar.",
  },
  {
    id: "palavras-de-bondade",
    name: "Palavras de Bondade",
    category: "concedido",
    prerequisite: "Devoto de Marah",
    description: "Você aprende e pode lançar Enfeitiçar.",
  },
  {
    id: "percepcao-temporal",
    name: "Percepção Temporal",
    category: "concedido",
    prerequisite: "Devoto de Aharadak",
    description:
      "Você pode gastar 3 PM para adicionar seu bônus de Sabedoria (mínimo +1, limitado por seu nível) a seus ataques, Defesa e testes de Reflexos até o fim da cena.",
  },
  {
    id: "poder-oculto",
    name: "Poder Oculto",
    category: "concedido",
    prerequisite: "Devoto de Nimb",
    description:
      "Você pode gastar uma ação de movimento e 2 PM para invocar a força, a rapidez ou o vigor dos loucos. Role 1d6 para receber +4 em Força (1 ou 2), Destreza (3 ou 4) ou Constituição (5 ou 6) até o fim da cena. Você pode usar este poder várias vezes, cada vez gastando uma ação de movimento e 2 PM.",
  },
  {
    id: "presas-venenosas",
    name: "Presas Venenosas",
    category: "concedido",
    prerequisite: "Devoto de Sszzaas",
    description:
      "Você pode gastar uma ação de movimento e 1 PM para envenenar uma arma corpo a corpo que esteja empunhando. Em caso de acerto, a arma causa 1d12 pontos de dano de veneno. A arma permanece envenenada até atingir uma criatura ou até o fim da cena, o que acontecer primeiro.",
  },
  {
    id: "rejeicao-divina",
    name: "Rejeição Divina",
    category: "concedido",
    prerequisite: "Devoto de Aharadak",
    description:
      "Você recebe +5 em testes de resistência contra magias divinas.",
  },
  {
    id: "sangue-de-ferro",
    name: "Sangue de Ferro",
    category: "concedido",
    prerequisite: "Devoto de Arsenal",
    description:
      "Você pode pagar 2 PM para receber +2 em rolagens de dano e resistência a dano 5 até o fim da cena.",
  },
  {
    id: "sangue-ofidico",
    name: "Sangue Ofídico",
    category: "concedido",
    prerequisite: "Devoto de Sszzaas",
    description:
      "Você recebe resistência a veneno 5 e a CD para resistir aos seus venenos aumenta em +2.",
  },
  {
    id: "servos-do-dragao",
    name: "Servos do Dragão",
    category: "concedido",
    prerequisite: "Devoto de Kallyadranoch",
    description:
      "Você pode gastar uma ação completa e 2 PM para invocar 2d4+1 kobolds em espaços desocupados em alcance curto. Você pode usar uma ação de movimento para fazer os kobolds andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6–1 pontos de dano de perfuração cada). Os kobolds têm For 8, Des 14, 1 PV, não têm valor de Defesa ou testes de resistência e falham automaticamente em qualquer teste oposto. Eles desaparecem quando morrem ou no fim da cena. Os kobolds não agem sem receber uma ordem. Usos criativos para criaturas invocadas fora de combate ficam a critério do mestre.",
  },
  {
    id: "sorte-dos-loucos",
    name: "Sorte dos Loucos",
    category: "concedido",
    prerequisite: "Devoto de Nimb",
    description:
      "Você pode pagar 1 PM para rolar novamente um teste recém realizado. Se ainda assim falhar no teste, você perde 1d6 PM.",
  },
  {
    id: "talento-artistico",
    name: "Talento Artístico",
    category: "concedido",
    prerequisite: "Devoto de Marah",
    description: "Você recebe +2 em Atuação e Diplomacia.",
  },
  {
    id: "teurgista-mistico",
    name: "Teurgista Místico",
    category: "concedido",
    prerequisite: "Devoto de Wynna, conjurador",
    description:
      "Até uma magia de cada círculo que você aprender poderá ser escolhida entre magias divinas (se você for um conjurador arcano) ou entre magias arcanas (se for um conjurador divino). Pré-requisito: habilidade de classe Magias.",
  },
  {
    id: "transmissao-da-loucura",
    name: "Transmissão da Loucura",
    category: "concedido",
    prerequisite: "Devoto de Nimb",
    description: "Você pode lançar Sussurros Insanos (CD Car).",
  },
  {
    id: "tropas-duyshidakk",
    name: "Tropas Duyshidakk",
    category: "concedido",
    prerequisite: "Devoto de Thwor",
    description:
      "Você pode gastar uma ação completa e 2 PM para invocar 1d4+1 goblinoides em espaços desocupados em alcance curto. Você pode usar uma ação de movimento para fazer os goblinoides andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6+1 pontos de dano de corte cada). Os goblinoides têm For 14, Des 14, 1 PV, não têm valor de Defesa ou testes de resistência e falham automaticamente em qualquer teste oposto. Eles desaparecem quando morrem ou no fim da cena. Os goblinoides não agem sem receber uma ordem. Usos criativos para criaturas invocadas fora de combate ficam a critério do mestre.",
  },
  {
    id: "urro-divino",
    name: "Urro Divino",
    category: "concedido",
    prerequisite: "Devoto de Megalokk",
    description:
      "Quando faz um ataque ou lança uma magia, você pode pagar 1 PM para somar seu modificador de Constituição (mínimo +1) à rolagem de dano desse ataque ou magia.",
  },
  {
    id: "visao-nas-trevas",
    name: "Visão nas Trevas",
    category: "concedido",
    prerequisite: "Devoto de Tenebra",
    description:
      "Você enxerga perfeitamente no escuro, incluindo em magias de escuridão.",
  },
  {
    id: "voz-da-civilizacao",
    name: "Voz da Civilização",
    category: "concedido",
    prerequisite: "Devoto de Tanna-Toh",
    description: "Você está sempre sob efeito de Compreensão.",
  },
  {
    id: "voz-da-natureza",
    name: "Voz da Natureza",
    category: "concedido",
    prerequisite: "Devoto de Allihanna",
    description:
      "Você pode falar com animais (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra animais.",
  },
  {
    id: "voz-dos-monstros",
    name: "Voz dos Monstros",
    category: "concedido",
    prerequisite: "Devoto de Megalokk",
    description:
      "Você conhece os idiomas de todos os monstros inteligentes (criaturas do tipo monstro com Int 3 ou mais) e pode se comunicar livremente com monstros não inteligentes (Int 1 ou 2), como se estivesse sob efeito da magia Voz Divina.",
  },
];
