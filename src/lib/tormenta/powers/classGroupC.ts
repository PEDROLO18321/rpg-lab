// ─── TORMENTA 20 — Poderes e progressão de classe: Ladino, Lutador, Nobre, Paladino ─
import type { Power } from "./types";

export interface ClassLevelRow { level: number; text: string }
export interface ClassFeature { name: string; level: number; description: string }

// ═══ LADINO ═══════════════════════════════════════════════════════════════

export const LADINO_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Ataque furtivo +1d6, especialista" },
  { level: 2, text: "Evasão, poder de ladino" },
  { level: 3, text: "Ataque furtivo +2d6, poder de ladino" },
  { level: 4, text: "Esquiva sobrenatural, poder de ladino" },
  { level: 5, text: "Ataque furtivo +3d6, poder de ladino" },
  { level: 6, text: "Poder de ladino" },
  { level: 7, text: "Ataque furtivo +4d6, poder de ladino" },
  { level: 8, text: "Olhos nas costas, poder de ladino" },
  { level: 9, text: "Ataque furtivo +5d6, poder de ladino" },
  { level: 10, text: "Evasão aprimorada, poder de ladino" },
  { level: 11, text: "Ataque furtivo +6d6, poder de ladino" },
  { level: 12, text: "Poder de ladino" },
  { level: 13, text: "Ataque furtivo +7d6, poder de ladino" },
  { level: 14, text: "Poder de ladino" },
  { level: 15, text: "Ataque furtivo +8d6, poder de ladino" },
  { level: 16, text: "Poder de ladino" },
  { level: 17, text: "Ataque furtivo +9d6, poder de ladino" },
  { level: 18, text: "Poder de ladino" },
  { level: 19, text: "Ataque furtivo +10d6, poder de ladino" },
  { level: 20, text: "A pessoa certa para o trabalho, poder de ladino" },
];

export const LADINO_POWERS: Power[] = [
  {
    id: "assassinar",
    name: "Assassinar",
    category: "classe",
    classId: "ladino",
    prerequisite: "5º nível de ladino",
    description:
      "Você pode gastar uma ação de movimento e 3 PM para analisar uma criatura em alcance curto. Até o fim de seu próximo turno, seu primeiro Ataque Furtivo que causar dano a ela tem seus dados de dano extras dessa habilidade dobrados.",
  },
  {
    id: "emboscar",
    name: "Emboscar",
    category: "classe",
    classId: "ladino",
    prerequisite: "treinado em Furtividade",
    description:
      "Você pode gastar 2 PM para realizar uma ação padrão adicional em seu turno. Você só pode usar este poder na primeira rodada de um combate.",
  },
  {
    id: "escapista",
    name: "Escapista",
    category: "classe",
    classId: "ladino",
    prerequisite: "—",
    description:
      "Você recebe +5 em testes de Acrobacia para escapar e em testes para resistir a efeitos que restrinjam seu movimento, como a manobra agarrar e a magia Amarras Etéreas.",
  },
  {
    id: "fuga-formidavel",
    name: "Fuga Formidável",
    category: "classe",
    classId: "ladino",
    prerequisite: "Int 13",
    description:
      "Você pode gastar uma ação completa e 1 PM para analisar o lugar no qual está (um castelo, um porto, a praça de uma cidade...). Até o fim da cena, você recebe +3m em seu deslocamento, +5 em testes de Acrobacia e Atletismo e ignora penalidades em movimento por terreno difícil. Porém, para receber esses bônus, todas as suas ações na rodada devem estar diretamente ligadas a fugir. Por exemplo, você só pode atacar um inimigo se ele estiver bloqueando seu caminho, agarrando-o etc. Você pode fazer ações para ajudar seus aliados, mas apenas se eles estiverem tentando escapar.",
  },
  {
    id: "gatuno",
    name: "Gatuno",
    category: "classe",
    classId: "ladino",
    prerequisite: "treinado em Atletismo",
    description:
      "Você recebe +2 em Atletismo. Quando escala, avança seu deslocamento normal, em vez de metade dele.",
  },
  {
    id: "integrante-de-guilda",
    name: "Integrante de Guilda",
    category: "classe",
    classId: "ladino",
    prerequisite: "—",
    description:
      "Você é membro de uma organização criminosa, desde uma pequena guilda de ladrões a uma irmandade de Valkaria. Os efeitos deste poder variam de acordo com a organização e ficam a cargo do mestre. Como regra geral, você recebe +5 em testes de Diplomacia com pessoas ligadas ao submundo e +5 em testes de Intimidação com pessoas comuns que temeriam sua organização. Além disso, tem acesso a itens e serviços roubados ou proibidos (como armas de pólvora e venenos).",
  },
  {
    id: "ladrao-arcano",
    name: "Ladrão Arcano",
    category: "classe",
    classId: "ladino",
    prerequisite: "Roubo de Mana, 13º nível de ladino",
    description:
      "Quando causa dano com um ataque furtivo em uma criatura capaz de lançar magias, você pode \"roubar\" uma magia que já a tenha visto lançar. Você precisa pagar 1 PM por círculo da magia e pode roubar magias de até 4º círculo. Até o final da cena, você pode lançar a magia roubada (atributo-chave Inteligência).",
    magic: true,
  },
  {
    id: "mao-na-boca",
    name: "Mão na Boca",
    category: "classe",
    classId: "ladino",
    prerequisite: "treinado em Luta",
    description:
      "Você recebe +2 em testes de agarrar. Quando faz um ataque furtivo contra uma criatura desprevenida, você pode fazer um teste de agarrar como uma ação livre. Se agarrar a criatura, ela não poderá falar enquanto estiver agarrada.",
  },
  {
    id: "maos-rapidas",
    name: "Mãos Rápidas",
    category: "classe",
    classId: "ladino",
    prerequisite: "Des 15, treinado em Ladinagem",
    description:
      "Ao fazer um teste de Ladinagem para abrir fechaduras, ocultar item, punga ou sabotar, você pode pagar 1 PM para fazê-lo como uma ação livre.",
  },
  {
    id: "mente-criminosa",
    name: "Mente Criminosa",
    category: "classe",
    classId: "ladino",
    prerequisite: "Int 13",
    description: "Você soma seu bônus de Inteligência em Ladinagem e Furtividade.",
  },
  {
    id: "oportunismo",
    name: "Oportunismo",
    category: "classe",
    classId: "ladino",
    prerequisite: "—",
    description:
      "Você recebe +2 em testes de ataque contra inimigos que já sofreram dano desde seu último turno.",
  },
  {
    id: "rolamento-defensivo",
    name: "Rolamento Defensivo",
    category: "classe",
    classId: "ladino",
    prerequisite: "treinado em Reflexos",
    description:
      "Sempre que sofre dano, você pode gastar 2 PM para reduzir esse dano à metade. Após usar este poder, você fica caído.",
  },
  {
    id: "roubo-de-mana",
    name: "Roubo de Mana",
    category: "classe",
    classId: "ladino",
    prerequisite: "Truque Mágico, 7º nível de ladino",
    description:
      "Quando você causa dano com um ataque furtivo em uma criatura, a criatura perde 1 ponto de mana para cada 1d6 de dano de seu ataque furtivo. Você recebe PM temporários iguais aos PM que a criatura perder. Você só pode usar este poder uma vez por cena contra cada criatura específica.",
    magic: true,
  },
  {
    id: "saqueador-de-tumbas",
    name: "Saqueador de Tumbas",
    category: "classe",
    classId: "ladino",
    prerequisite: "—",
    description:
      "Você recebe +5 em testes de Investigação para encontrar armadilhas e em testes de Reflexos para evitá-las. Além disso, gasta uma ação padrão para desabilitar mecanismos, em vez de 1d4 rodadas (veja a perícia Ladinagem).",
  },
  {
    id: "sombra",
    name: "Sombra",
    category: "classe",
    classId: "ladino",
    prerequisite: "treinado em Furtividade",
    description:
      "Você recebe +2 em Furtividade. Além disso, pode se mover com seu deslocamento normal enquanto usa Furtividade sem sofrer penalidades no teste de perícia.",
  },
  {
    id: "truque-magico",
    name: "Truque Mágico",
    category: "classe",
    classId: "ladino",
    prerequisite: "Int 13",
    description:
      "Você aprende e pode lançar uma magia arcana de 1º círculo a sua escolha, pagando seu custo normal em PM. Seu atributo-chave para esta magia é Inteligência. Você pode escolher este poder quantas vezes quiser.",
    magic: true,
  },
  {
    id: "velocidade-ladina",
    name: "Velocidade Ladina",
    category: "classe",
    classId: "ladino",
    prerequisite: "Des 15, treinado em Iniciativa",
    description:
      "Uma vez por rodada, você pode gastar 2 PM para realizar uma ação de movimento adicional em seu turno.",
  },
  {
    id: "veneno-persistente",
    name: "Veneno Persistente",
    category: "classe",
    classId: "ladino",
    prerequisite: "Veneno Potente, 8º nível de ladino",
    description:
      "Quando aplica uma dose de veneno a uma arma, este veneno dura por três ataques (em vez de apenas um).",
  },
  {
    id: "veneno-potente",
    name: "Veneno Potente",
    category: "classe",
    classId: "ladino",
    prerequisite: "treinado em Ofício (alquimia)",
    description:
      "A CD para resistir aos venenos que você usa aumenta em +2 e esses venenos causam +1 ponto de dano por dado de dano.",
  },
];

export const LADINO_FEATURES: ClassFeature[] = [
  {
    name: "Evasão",
    level: 2,
    description:
      "A partir do 2º nível, quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar. Você ainda sofre dano normal se falhar no teste de Reflexos. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.",
  },
  {
    name: "Esquiva Sobrenatural",
    level: 4,
    description:
      "No 4º nível, seus instintos ficam tão apurados que você consegue reagir ao perigo antes que seus sentidos percebam. Você nunca fica surpreendido.",
  },
  {
    name: "Olhos nas Costas",
    level: 8,
    description:
      "A partir do 8º nível, você consegue lutar contra diversos inimigos como se fossem apenas um. Você não pode ser flanqueado.",
  },
  {
    name: "Evasão Aprimorada",
    level: 10,
    description:
      "No 10º nível, quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar e sofre apenas metade do dano se falhar. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.",
  },
  {
    name: "A Pessoa Certa para o Trabalho",
    level: 20,
    description:
      "No 20º nível, você se torna um verdadeiro mestre da ladinagem. Ao fazer um ataque furtivo ou usar uma perícia da lista de ladino, você pode gastar 5 PM para receber +10 no teste.",
  },
];

// ═══ LUTADOR ══════════════════════════════════════════════════════════════

export const LUTADOR_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Briga (1d6), golpe relâmpago" },
  { level: 2, text: "Poder de lutador" },
  { level: 3, text: "Casca grossa (Con), poder de lutador" },
  { level: 4, text: "Poder de lutador" },
  { level: 5, text: "Briga (1d8), golpe cruel, poder de lutador" },
  { level: 6, text: "Poder de lutador" },
  { level: 7, text: "Casca grossa (Con+1), poder de lutador" },
  { level: 8, text: "Poder de lutador" },
  { level: 9, text: "Briga (1d10), golpe violento, poder de lutador" },
  { level: 10, text: "Poder de lutador" },
  { level: 11, text: "Casca grossa (Con+2), poder de lutador" },
  { level: 12, text: "Poder de lutador" },
  { level: 13, text: "Briga (2d6), poder de lutador" },
  { level: 14, text: "Poder de lutador" },
  { level: 15, text: "Casca grossa (Con+3), poder de lutador" },
  { level: 16, text: "Poder de lutador" },
  { level: 17, text: "Briga (2d8), poder de lutador" },
  { level: 18, text: "Poder de lutador" },
  { level: 19, text: "Casca grossa (Con+4), poder de lutador" },
  { level: 20, text: "Dono da rua (2d10), poder de lutador" },
];

export const LUTADOR_POWERS: Power[] = [
  {
    id: "arma-improvisada",
    name: "Arma Improvisada",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Ao usar armas improvisadas, você usa as estatísticas de seu ataque desarmado — bônus de ataque, margem de ameaça etc. — mas seu dano aumenta em um passo. Você pode gastar uma ação de movimento para procurar uma pedra, cadeira, garrafa ou qualquer coisa que possa usar como arma. Faça um teste de Percepção (CD 20). Se você passar, encontra uma arma improvisada. Armas improvisadas são frágeis; se você errar um ataque e o resultado do d20 for um número ímpar, a arma quebra.",
  },
  {
    id: "ate-acertar",
    name: "Até Acertar",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Se você errar um ataque desarmado, recebe um bônus cumulativo de +2 em testes de ataque e rolagens de dano desarmado contra o mesmo oponente. Os bônus terminam quando você acertar um ataque ou no fim da cena, o que acontecer primeiro.",
  },
  {
    id: "bracos-calejados",
    name: "Braços Calejados",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Se você não estiver usando armadura, soma seu bônus de Força na Defesa, limitado pelo seu nível.",
  },
  {
    id: "cabecada",
    name: "Cabeçada",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Quando faz um ataque desarmado, você pode gastar 2 PM. Se fizer isso, o oponente fica desprevenido contra este ataque. Você só pode usar este poder uma vez por cena contra uma mesma criatura.",
  },
  {
    id: "chave",
    name: "Chave",
    category: "classe",
    classId: "lutador",
    prerequisite: "Int 13, Lutador de Chão, 4º nível de lutador",
    description:
      "Se estiver agarrando uma criatura e fizer um teste de manobra contra ela para causar dano, o dano desarmado aumenta em um passo.",
  },
  {
    id: "confianca-dos-ringues",
    name: "Confiança dos Ringues",
    category: "classe",
    classId: "lutador",
    prerequisite: "10º nível de lutador",
    description:
      "Quando um oponente erra um ataque corpo a corpo contra você, você recebe 1 PM temporário. PM temporários desaparecem no final da cena.",
  },
  {
    id: "convencido",
    name: "Convencido",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Acostumado a contar apenas com seus músculos, você adquiriu certo desdém por artes mais sofisticadas. Você recebe +5 em testes de resistência contra efeitos de Encantamento.",
  },
  {
    id: "golpe-baixo",
    name: "Golpe Baixo",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Quando faz um ataque desarmado, você pode gastar 2 PM. Se fizer isso e acertar o ataque, o oponente deve fazer um teste de Fortitude (CD For). Se ele falhar, fica atordoado por uma rodada. Você só pode usar este poder uma vez por cena contra uma mesma criatura.",
  },
  {
    id: "golpe-imprudente",
    name: "Golpe Imprudente",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Quando usa Golpe Relâmpago, você pode atacar de forma impulsiva. Se fizer isso, você aumenta seu dano desarmado em mais um dado do mesmo tipo (por exemplo, se o seu dano é 2d6, você causa 3d6), mas sofre –5 em sua Defesa, até o início de seu próximo turno.",
  },
  {
    id: "imobilizacao",
    name: "Imobilização",
    category: "classe",
    classId: "lutador",
    prerequisite: "Chave, 8º nível de lutador",
    description:
      "Se estiver agarrando uma criatura, você pode gastar uma ação completa para imobilizá-la. Faça um teste de manobra contra ela. Se você passar, imobiliza a criatura — ela fica indefesa e não pode realizar nenhuma ação, exceto tentar se soltar (o que exige um teste de manobra). Se a criatura se soltar da imobilização, ainda fica agarrada. Enquanto estiver imobilizando uma criatura, você sofre as penalidades de agarrar.",
  },
  {
    id: "lingua-dos-becos",
    name: "Língua dos Becos",
    category: "classe",
    classId: "lutador",
    prerequisite: "For 13, treinado em Intimidação",
    description:
      "Você pode pagar 1 PM para usar seu bônus de Força no lugar de Carisma em um teste de perícia baseada em Carisma.",
  },
  {
    id: "lutador-de-chao",
    name: "Lutador de Chão",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Você recebe +2 em testes de ataque para agarrar e derrubar. Quando agarra uma criatura, pode gastar 1 PM para fazer uma manobra derrubar contra ela como uma ação livre.",
  },
  {
    id: "nome-na-arena",
    name: "Nome na Arena",
    category: "classe",
    classId: "lutador",
    prerequisite: "12º nível de lutador",
    description:
      "Você construiu uma reputação no circuito de lutas de Arton. Escolha uma perícia que represente a característica pela qual você é conhecido, como Atletismo para uma fama de musculoso ou Intimidação para uma fama de \"malvado\". Uma vez por cena, você pode gastar uma ação de movimento para fazer um teste dessa perícia (CD 10) e impressionar os presentes. Se passar, você recebe +1 em todos os seus testes de perícias baseadas em Carisma até o fim da cena. Esse bônus aumenta em +1 para cada 5 pontos pelos quais o resultado do teste exceder a CD (+2 para um resultado 15, +3 para 20 e assim por diante). Como alternativa, você pode aplicar esse bônus em seu próximo teste de ataque.",
  },
  {
    id: "punhos-de-adamante",
    name: "Punhos de Adamante",
    category: "classe",
    classId: "lutador",
    prerequisite: "8º nível de lutador",
    description: "Seus ataques desarmados ignoram 10 pontos de resistência a dano do alvo, se houver.",
  },
  {
    id: "rasteira",
    name: "Rasteira",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Quando faz um ataque desarmado, você pode gastar 2 PM. Se fizer isso e acertar o ataque, o oponente fica caído.",
  },
  {
    id: "sarado",
    name: "Sarado",
    category: "classe",
    classId: "lutador",
    prerequisite: "For 17",
    description:
      "Você soma seu bônus de Força no seu total de pontos de vida e em testes de Fortitude. A critério do mestre, você pode chamar a atenção de pessoas que se atraiam por físicos bem definidos.",
  },
  {
    id: "sequencia-destruidora",
    name: "Sequência Destruidora",
    category: "classe",
    classId: "lutador",
    prerequisite: "Trocação, 12º nível de lutador",
    description:
      "No início do seu turno, você pode gastar 2 PM para dizer um número (no mínimo 2). Se fizer e acertar uma quantidade de ataques igual ao número dito, o último tem seu dano aumentado um número de passos igual à quantidade de ataques feitos. Por exemplo, se você falar \"três\" e fizer e acertar três ataques, o último ataque (o terceiro) terá seu dano aumentado em três passos.",
  },
  {
    id: "trincado",
    name: "Trincado",
    category: "classe",
    classId: "lutador",
    prerequisite: "Con 17, Sarado, 10º nível de lutador",
    description:
      "Esculpido à exaustão, seu corpo se tornou uma máquina. Você soma seu modificador de Constituição nas suas rolagens de dano desarmado.",
  },
  {
    id: "trocacao",
    name: "Trocação",
    category: "classe",
    classId: "lutador",
    prerequisite: "6º nível de lutador",
    description:
      "Quando você começa a bater, não para mais. Ao acertar um ataque desarmado, pode fazer outro ataque desarmado contra o mesmo alvo, pagando uma quantidade de PM igual à quantidade de ataques já realizados no turno. Ou seja, pode fazer o primeiro ataque extra gastando 1 PM, um segundo ataque extra gastando mais 2 PM e assim por diante, até errar um ataque ou não ter mais pontos de mana.",
  },
  {
    id: "trocacao-tumultuosa",
    name: "Trocação Tumultuosa",
    category: "classe",
    classId: "lutador",
    prerequisite: "Trocação, 8º nível de lutador",
    description:
      "Quando usa a ação atacar para fazer um ataque desarmado, você pode gastar 2 PM para atingir todas as criaturas adjacentes — incluindo aliados! Você deve usar este poder antes de rolar o ataque e compara o resultado de seu teste contra a Defesa de cada criatura.",
  },
  {
    id: "valentao",
    name: "Valentão",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Você recebe +2 em testes de ataque e rolagens de dano contra oponentes caídos, desprevenidos, flanqueados ou indefesos.",
  },
  {
    id: "voadora",
    name: "Voadora",
    category: "classe",
    classId: "lutador",
    prerequisite: "—",
    description:
      "Quando faz uma investida desarmada, você pode gastar 2 PM. Se fizer isso, recebe +1d6 no dano para cada 3m que se deslocar até chegar ao oponente, limitado pelo seu nível.",
  },
];

export const LUTADOR_FEATURES: ClassFeature[] = [
  {
    name: "Casca Grossa",
    level: 3,
    description:
      "No 3º nível, você soma seu bônus de Constituição na Defesa, limitado pelo seu nível e apenas se não estiver usando armadura pesada. Além disso, no 7º nível, e a cada quatro níveis, você recebe +1 na Defesa.",
  },
  {
    name: "Golpe Cruel",
    level: 5,
    description: "No 5º nível, você acerta onde dói. Sua margem de ameaça com ataques desarmados aumenta em +1.",
  },
  {
    name: "Golpe Violento",
    level: 9,
    description: "No 9º nível, você bate com muita força. Seu multiplicador de crítico com ataques desarmados aumenta em +1.",
  },
  {
    name: "Dono da Rua",
    level: 20,
    description:
      "No 20º nível, seu dano desarmado aumenta para 2d10 (para criaturas Médias). Além disso, quando usa a ação atacar para fazer um ataque desarmado, você pode fazer dois ataques, em vez de um (podendo usar Golpe Relâmpago para fazer um terceiro).",
  },
];

// ═══ NOBRE ════════════════════════════════════════════════════════════════

export const NOBRE_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Autoconfiança, espólio, orgulho" },
  { level: 2, text: "Poder de nobre, riqueza" },
  { level: 3, text: "Gritar ordens, poder de nobre" },
  { level: 4, text: "Poder de nobre" },
  { level: 5, text: "Poder de nobre" },
  { level: 6, text: "Poder de nobre" },
  { level: 7, text: "Poder de nobre" },
  { level: 8, text: "Poder de nobre" },
  { level: 9, text: "Poder de nobre" },
  { level: 10, text: "Poder de nobre" },
  { level: 11, text: "Poder de nobre" },
  { level: 12, text: "Poder de nobre" },
  { level: 13, text: "Poder de nobre" },
  { level: 14, text: "Poder de nobre" },
  { level: 15, text: "Poder de nobre" },
  { level: 16, text: "Poder de nobre" },
  { level: 17, text: "Poder de nobre" },
  { level: 18, text: "Poder de nobre" },
  { level: 19, text: "Poder de nobre" },
  { level: 20, text: "Realeza, poder de nobre" },
];

export const NOBRE_POWERS: Power[] = [
  {
    id: "armadura-brilhante",
    name: "Armadura Brilhante",
    category: "classe",
    classId: "nobre",
    prerequisite: "8º nível de nobre",
    description:
      "Você pode somar o modificador de Carisma na Defesa quando usa armadura pesada. Se fizer isso, não pode somar o modificador de Destreza, mesmo que outras habilidades ou efeitos permitam isso.",
  },
  {
    id: "autoridade-feudal",
    name: "Autoridade Feudal",
    category: "classe",
    classId: "nobre",
    prerequisite: "6º nível de nobre",
    description:
      "Você pode gastar 2 PM para conclamar o povo a realizar uma tarefa para você. Em termos de jogo, passa automaticamente em um teste de perícia com CD máxima igual ao seu nível +5. O tempo necessário para conclamar o povo é o tempo do uso da perícia em questão. Esta habilidade só pode ser usada em locais onde sua posição carregue alguma influência (a critério do mestre).",
  },
  {
    id: "educacao-privilegiada",
    name: "Educação Privilegiada",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description: "Você se torna treinado em duas perícias de nobre a sua escolha.",
  },
  {
    id: "estrategista",
    name: "Estrategista",
    category: "classe",
    classId: "nobre",
    prerequisite: "Int 13, treinado em Guerra, 6º nível de nobre",
    description:
      "Você pode direcionar aliados em alcance curto. Gaste uma ação padrão e 1 PM por aliado que quiser direcionar (limitado pelo seu modificador de Carisma). No próximo turno do aliado, ele ganha uma ação de movimento.",
  },
  {
    id: "favor",
    name: "Favor",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Você pode usar sua influência para pedir favores a pessoas poderosas. Pedir favores gasta 5 PM e exige pelo menos uma hora de conversa e bajulação — ou mais, de acordo com o mestre. Faça um teste de Diplomacia. A CD do teste depende do que você está pedindo: 10 para algo simples (como um convite para uma festa particular), 20 para algo caro ou complicado (como uma carona de barco até Galrasia) e 30 para algo perigoso ou ilegal (como acesso aos planos militares do reino).",
  },
  {
    id: "general",
    name: "General",
    category: "classe",
    classId: "nobre",
    prerequisite: "Estrategista, 12º nível de nobre",
    description:
      "Quando você usa o poder Estrategista, os aliados direcionados recebem 1d4 pontos de mana temporários. Esses PM duram até o fim do turno do aliado e não podem ser usados em efeitos que concedam PM.",
  },
  {
    id: "grito-tiranico",
    name: "Grito Tirânico",
    category: "classe",
    classId: "nobre",
    prerequisite: "Palavras Afiadas, 8º nível de nobre",
    description:
      "Quando usa a habilidade Palavras Afiadas, você pode gastar +2 PM. Se fizer isso, seus dados de dano aumentam para d8 e você atinge todos os inimigos em alcance curto.",
  },
  {
    id: "inspirar-confianca",
    name: "Inspirar Confiança",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Sua presença faz as pessoas darem o melhor de si. Você pode gastar 2 PM para fazer um aliado em alcance curto rolar novamente um teste recém realizado.",
  },
  {
    id: "inspirar-gloria",
    name: "Inspirar Glória",
    category: "classe",
    classId: "nobre",
    prerequisite: "Inspirar Confiança, 8º nível de nobre",
    description:
      "A presença de um nobre motiva as pessoas a realizarem façanhas impressionantes. Você pode gastar 5 PM para fazer um aliado em alcance curto ganhar uma ação padrão adicional no próximo turno dele. Você só pode usar esta habilidade uma vez por cena em cada aliado.",
  },
  {
    id: "jogo-da-corte",
    name: "Jogo da Corte",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Você pode gastar 1 PM para rolar novamente um teste recém realizado de Diplomacia, Intuição ou Nobreza.",
  },
  {
    id: "liderar-pelo-exemplo",
    name: "Liderar pelo Exemplo",
    category: "classe",
    classId: "nobre",
    prerequisite: "6º nível de nobre",
    description:
      "Você pode pagar 2 PM para servir de inspiração. Até o início de seu próximo turno, sempre que você passar em um teste de perícia, aliados em alcance curto que fizerem um teste da mesma perícia podem usar o resultado total do seu teste em vez de rolar o dado.",
  },
  {
    id: "lingua-de-ouro",
    name: "Língua de Ouro",
    category: "classe",
    classId: "nobre",
    prerequisite: "Língua de Prata, 8º nível de nobre",
    description:
      "Você pode gastar uma ação padrão e 6 PM para gerar o efeito da magia Enfeitiçar com os aprimoramentos de sugerir ação e afetar todas as criaturas dentro do alcance (CD Car). Esta não é uma habilidade mágica e provém de sua capacidade de influenciar outras pessoas.",
  },
  {
    id: "lingua-de-prata",
    name: "Língua de Prata",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Quando faz um teste de perícia baseada em Carisma, você pode gastar 2 PM para receber um bônus no teste igual a metade do seu nível.",
  },
  {
    id: "lingua-rapida",
    name: "Língua Rápida",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Quando faz um teste de Diplomacia para mudar atitude como uma ação completa, você sofre uma penalidade de –5, em vez de –10.",
  },
  {
    id: "palavras-afiadas",
    name: "Palavras Afiadas",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Você pode gastar uma ação padrão e 1 PM para submeter a sua vontade uma criatura inteligente (Int 3 ou mais) em alcance curto. Faça um teste de Diplomacia ou Intimidação (a sua escolha) oposto ao teste de Vontade da criatura. Se vencer, você causa 2d6 pontos de dano mental não letal à criatura. Se perder, causa metade deste dano. Para cada PM extra que você gastar quando ativar o poder, o dano aumenta em +1d6. Caso a criatura seja reduzida a 0 ou menos PV, rende-se (caso você tenha usado Diplomacia) ou fica apavorada (caso tenha usado Intimidação), em vez de cair inconsciente.",
  },
  {
    id: "presenca-aristocratica",
    name: "Presença Aristocrática",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Sempre que uma criatura inteligente (Int 3 ou mais) tentar machucá-lo (causar dano com um ataque, magia ou habilidade) você pode gastar 2 PM. Se fizer isso, a criatura deve fazer um teste de Vontade (CD Car). Se falhar, não conseguirá machucá-lo e perderá a ação. Você só pode usar esta habilidade uma vez por cena contra cada criatura.",
  },
  {
    id: "presenca-majestosa",
    name: "Presença Majestosa",
    category: "classe",
    classId: "nobre",
    prerequisite: "Presença Aristocrática, 16º nível de nobre",
    description:
      "Você impõe respeito a todos. A habilidade Presença Aristocrática passa a funcionar contra criaturas com Int 1 ou mais (passa a afetar até mesmo animais, embora continue não funcionando contra criaturas sem valor de Inteligência). Além disso, você pode usá-la mais de uma vez contra uma mesma criatura na mesma cena.",
  },
  {
    id: "titulo",
    name: "Título",
    category: "classe",
    classId: "nobre",
    prerequisite: "Autoridade Feudal, 10º nível de nobre",
    description:
      "Você adquire um título de nobreza. Converse com o mestre para definir os benefícios exatos de seu título. Como regra geral, você recebe 10 TO por nível de nobre no início de cada aventura (rendimentos dos impostos) ou a ajuda de um aliado veterano (um membro de sua corte).",
  },
  {
    id: "voz-poderosa",
    name: "Voz Poderosa",
    category: "classe",
    classId: "nobre",
    prerequisite: "—",
    description:
      "Você recebe +2 em Diplomacia e Intimidação. Suas habilidades de nobre com alcance curto passam para alcance médio.",
  },
];

export const NOBRE_FEATURES: ClassFeature[] = [
  {
    name: "Riqueza",
    level: 2,
    description:
      "No 2º nível, você passa a receber dinheiro de sua família, patrono ou negócios. Uma vez por aventura, você pode fazer um teste de Carisma com um bônus igual ao seu nível de nobre. Você recebe um número de Tibares de ouro igual ao resultado do teste. Por exemplo, um nobre de 5º nível com Carisma 18 (+4) que role um 13 no dado recebe 22 TO. O uso desta habilidade é condicionado a onde e quando você faz o teste, assim como a relação com sua família, patrono ou negócios. Por exemplo, um nobre viajando pelos ermos, isolado da civilização, dificilmente teria como receber dinheiro.",
  },
  {
    name: "Gritar Ordens",
    level: 3,
    description:
      "A partir do 3º nível, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu bônus de Carisma). Até o início de seu próximo turno, todos os seus aliados em alcance curto recebem um bônus nos testes de perícia igual à quantidade de PM que você gastou.",
  },
  {
    name: "Realeza",
    level: 20,
    description:
      "No 20º nível, sua presença impõe mais do que respeito — impõe veneração. Uma criatura que seja alvo de sua Presença Aristocrática e falhe no teste de Vontade por 10 ou mais se arrepende tanto de ter tentado machucá-lo que passa a lutar ao seu lado (e seguir suas ordens, se puder entendê-lo) pelo resto da cena. Uma criatura que seja reduzida a 0 PV por Palavras Afiadas não sofre este dano; em vez disso, passa a lutar ao seu lado pelo resto da cena.",
  },
];

// ═══ PALADINO ═════════════════════════════════════════════════════════════

export const PALADINO_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Abençoado, código do herói, golpe divino (+1d8)" },
  { level: 2, text: "Cura pelas mãos (1d8+1 PV), poder de paladino" },
  { level: 3, text: "Aura sagrada, poder de paladino" },
  { level: 4, text: "Poder de paladino" },
  { level: 5, text: "Bênção da justiça, golpe divino (+2d8), poder de paladino" },
  { level: 6, text: "Cura pelas mãos (2d8+2 PV), poder de paladino" },
  { level: 7, text: "Poder de paladino" },
  { level: 8, text: "Poder de paladino" },
  { level: 9, text: "Golpe divino (+3d8), poder de paladino" },
  { level: 10, text: "Cura pelas mãos (3d8+3 PV), poder de paladino" },
  { level: 11, text: "Poder de paladino" },
  { level: 12, text: "Poder de paladino" },
  { level: 13, text: "Golpe divino (+4d8), poder de paladino" },
  { level: 14, text: "Cura pelas mãos (4d8+4 PV), poder de paladino" },
  { level: 15, text: "Poder de paladino" },
  { level: 16, text: "Poder de paladino" },
  { level: 17, text: "Golpe divino (+5d8), poder de paladino" },
  { level: 18, text: "Cura pelas mãos (5d8+5 PV), poder de paladino" },
  { level: 19, text: "Poder de paladino" },
  { level: 20, text: "Poder de paladino, vingador sagrado" },
];

export const PALADINO_POWERS: Power[] = [
  {
    id: "arma-sagrada",
    name: "Arma Sagrada",
    category: "classe",
    classId: "paladino",
    prerequisite: "devoto de uma divindade (exceto Lena e Marah)",
    description:
      "Se estiver empunhando a arma preferida de seu deus, o dado de dano que você rola por Golpe Divino aumenta para d12.",
    magic: true,
  },
  {
    id: "aura-antimagia",
    name: "Aura Antimagia",
    category: "classe",
    classId: "paladino",
    prerequisite: "14° nível de paladino",
    description:
      "Enquanto sua aura estiver ativa, você e os aliados dentro da aura podem rolar novamente qualquer teste de resistência contra magia recém realizado.",
    magic: true,
  },
  {
    id: "aura-ardente",
    name: "Aura Ardente",
    category: "classe",
    classId: "paladino",
    prerequisite: "10° nível de paladino",
    description:
      "Enquanto sua aura estiver ativa, no início de cada um de seus turnos, espíritos e mortos-vivos a sua escolha dentro dela sofrem dano de luz igual a 5 + seu bônus de Carisma.",
    magic: true,
  },
  {
    id: "aura-de-cura",
    name: "Aura de Cura",
    category: "classe",
    classId: "paladino",
    prerequisite: "6° nível de paladino",
    description:
      "Enquanto sua aura estiver ativa, no início de seus turnos, você e os aliados a sua escolha dentro dela curam um número de PV igual a 5 + seu bônus de Carisma.",
    magic: true,
  },
  {
    id: "aura-de-invencibilidade",
    name: "Aura de Invencibilidade",
    category: "classe",
    classId: "paladino",
    prerequisite: "18° nível de paladino",
    description:
      "Enquanto sua aura estiver ativa, você ignora o primeiro dano que sofrer na cena. O mesmo se aplica a seus aliados dentro da aura.",
    magic: true,
  },
  {
    id: "aura-poderosa",
    name: "Aura Poderosa",
    category: "classe",
    classId: "paladino",
    prerequisite: "6° nível de paladino",
    description: "O alcance da sua aura aumenta para médio.",
    magic: true,
  },
  {
    id: "fulgor-divino",
    name: "Fulgor Divino",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Quando usa Golpe Divino, todos os inimigos em alcance curto ficam ofuscados até o início do seu próximo turno.",
    magic: true,
  },
  {
    id: "julgamento-divino-arrependimento",
    name: "Julgamento Divino: Arrependimento",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 2 PM para marcar um inimigo em alcance curto. Na próxima vez que esse inimigo acertar um ataque em você ou em um de seus aliados, deve fazer um teste de Vontade (CD Car). Se falhar, fica atordoado no próximo turno dele. Você só pode proferir este julgamento uma vez por cena contra cada criatura.",
  },
  {
    id: "julgamento-divino-autoridade",
    name: "Julgamento Divino: Autoridade",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 1 PM para comandar uma criatura em alcance curto. Faça um teste de Diplomacia oposto pelo teste de Vontade da criatura. Se você passar, ela obedece a um comando simples como \"pare\" ou \"largue a arma\". Se a criatura passar, fica imune a esse efeito por um dia.",
  },
  {
    id: "julgamento-divino-coragem",
    name: "Julgamento Divino: Coragem",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 2 PM para inspirar coragem em uma criatura em alcance curto, incluindo você mesmo. A criatura fica imune a efeitos de medo e recebe +2 em testes de ataque contra alvos de ND maior que o nível dela.",
  },
  {
    id: "julgamento-divino-iluminacao",
    name: "Julgamento Divino: Iluminação",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode marcar um inimigo em alcance curto. Quando acerta um ataque corpo a corpo nesse inimigo, você recebe 2 PM temporários. Você só pode proferir este julgamento uma vez por cena.",
  },
  {
    id: "julgamento-divino-justica",
    name: "Julgamento Divino: Justiça",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 2 PM para marcar um inimigo em alcance curto. A próxima vez que esse inimigo causar dano em você ou em um de seus aliados, deve fazer um teste de Vontade (CD Car). Se falhar, sofre dano de luz igual à metade do dano que causou.",
  },
  {
    id: "julgamento-divino-libertacao",
    name: "Julgamento Divino: Libertação",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 5 PM para cancelar uma condição negativa qualquer (como abalado, paralisado etc.) que esteja afetando uma criatura em alcance curto.",
  },
  {
    id: "julgamento-divino-salvacao",
    name: "Julgamento Divino: Salvação",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 2 PM para marcar um inimigo em alcance curto. Até o fim da cena, quando você acerta um ataque corpo a corpo nesse inimigo, recupera 5 pontos de vida.",
  },
  {
    id: "julgamento-divino-vindicacao",
    name: "Julgamento Divino: Vindicação",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 2 PM para marcar um inimigo que tenha causado dano a você ou a seus aliados na cena. Você recebe +1 em testes de ataque e +1d8 em rolagens de dano contra o inimigo escolhido, mas sofre –5 em testes de ataque contra quaisquer outros alvos. No 5º nível, e a cada cinco níveis seguintes, você pode pagar +1 PM para aumentar o bônus de ataque em +1 e o bônus de dano em +1d8. O efeito termina caso o alvo fique inconsciente.",
  },
  {
    id: "julgamento-divino-zelo",
    name: "Julgamento Divino: Zelo",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode gastar 1 PM para marcar um alvo em alcance longo. Pelo restante da cena, sempre que se mover na direção desse alvo, você se move com o dobro de seu deslocamento.",
  },
  {
    id: "orar",
    name: "Orar",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você aprende e pode lançar uma magia divina de 1º círculo a sua escolha. Seu atributo-chave para esta magia é Sabedoria. Você pode escolher este poder quantas vezes quiser.",
    magic: true,
  },
  {
    id: "virtude-paladinesca-caridade",
    name: "Virtude Paladinesca: Caridade",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description: "O custo de suas habilidades de paladino que tenham um aliado como alvo é reduzido em 1 PM.",
  },
  {
    id: "virtude-paladinesca-castidade",
    name: "Virtude Paladinesca: Castidade",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você se torna imune a efeitos de encantamento e recebe +5 em testes de Intuição para perceber blefes.",
  },
  {
    id: "virtude-paladinesca-compaixao",
    name: "Virtude Paladinesca: Compaixão",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Você pode usar Cura pelas Mãos em alcance curto e, para cada PM que gastar, cura 2d6+1 (em vez de 1d8+1).",
  },
  {
    id: "virtude-paladinesca-humildade",
    name: "Virtude Paladinesca: Humildade",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Na primeira rodada de um combate, você pode gastar uma ação completa para rezar e pedir orientação. Você recebe uma quantidade de PM temporários igual ao seu bônus de Carisma.",
  },
  {
    id: "virtude-paladinesca-temperanca",
    name: "Virtude Paladinesca: Temperança",
    category: "classe",
    classId: "paladino",
    prerequisite: "—",
    description:
      "Quando ingere um alimento, item alquímico ou poção, você consome apenas metade do item. Na prática, cada item desses rende duas \"doses\" para você.",
  },
];

export const PALADINO_FEATURES: ClassFeature[] = [
  {
    name: "Cura pelas Mãos",
    level: 2,
    description:
      "A partir do 2º nível, você pode gastar uma ação de movimento e 1 PM para curar 1d8+1 pontos de vida de um alvo em alcance corpo a corpo (incluindo você). A cada quatro níveis, você pode gastar +1 PM para aumentar os PV curados em +1d8+1.\nA partir do 6º nível, você pode gastar +1 PM quando usa Cura pelas Mãos para anular uma condição afetando o alvo, entre abalado, apavorado, atordoado, cego, doente, exausto, fatigado ou surdo. Esta habilidade também pode causar dano de luz a mortos-vivos, exigindo um ataque desarmado.",
  },
  {
    name: "Aura Sagrada",
    level: 3,
    description:
      "No 3º nível, você pode gastar 1 PM para gerar uma aura com alcance curto a partir de você. A aura emite uma luz dourada e agradável, que ilumina como uma tocha. Além disso, você e os aliados dentro da aura recebem um bônus igual ao seu bônus de Carisma nos testes de resistência. Manter a aura custa 1 PM por turno.",
  },
  {
    name: "Bênção da Justiça",
    level: 5,
    description:
      "No 5º nível, escolha entre égide sagrada e montaria sagrada. Uma vez feita, esta escolha não pode ser mudada.\n• Égide Sagrada. Você pode gastar uma ação de movimento e 2 PM para recobrir de energia seu escudo ou símbolo sagrado. Até o fim da cena, você e todos os aliados adjacentes recebem um bônus na Defesa igual ao seu bônus de Carisma. A partir do 11º nível, você pode gastar 5 PM para receber o mesmo bônus num teste de resistência contra uma magia recém lançada contra você. Se você passar no teste de resistência e a magia tiver você como único alvo, ela é revertida de volta ao conjurador (que se torna o novo alvo da magia; todas as demais características da magia, incluindo CD do teste de resistência, se mantêm).\n• Montaria Sagrada. Você pode gastar uma ação de movimento e 2 PM para invocar uma montaria sagrada. Veja o quadro para mais detalhes.",
  },
  {
    name: "Vingador Sagrado",
    level: 20,
    description:
      "No 20º nível, você pode gastar uma ação completa e 10 PM para se cobrir de energia divina, assumindo a forma de um vingador sagrado até o fim da cena. Nesta forma, você recebe deslocamento de voo 18m, resistência a dano 20 e soma seu modificador de Carisma em seus testes de ataque e rolagens de dano corpo a corpo.",
  },
];
