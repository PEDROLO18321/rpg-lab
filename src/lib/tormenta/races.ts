// ─── TORMENTA 20 — Raças (Capítulo 1) ─────────────────────────────────────────
// 17 raças: 8 comuns (Humano, Anão, Dahllan, Elfo, Goblin, Lefou, Minotauro,
// Qareen) + 9 raras (Golem, Hynne, Kliren, Medusa, Osteon, Sereia/Tritão,
// Sílfide, Suraggel, Trog). Fonte: Tormenta 20 (Jambô), Cap. 1.

import type { AttrKey, CreatureSize } from "./data";

export interface RaceTrait {
  name: string;
  description: string;
}

// Algumas raças (Humano, Lefou, Osteon, Sereia/Tritão) recebem "+2 em três
// atributos diferentes" à escolha do jogador, em vez de bônus fixos.
export interface AttrChoiceBonus {
  count: number;       // quantos atributos recebem o bônus
  amount: number;       // valor do bônus por atributo escolhido
  exclude?: AttrKey[];  // atributos que não podem ser escolhidos
}

export interface RaceVariant {
  id: string;
  name: string;
  attrBonus: Partial<Record<AttrKey, number>>;
  traits: RaceTrait[];
}

export interface Race {
  id: string;
  name: string;
  icon: string;
  rarity: "comum" | "rara";
  description: string;
  attrBonus: Partial<Record<AttrKey, number>>;
  attrChoiceBonus?: AttrChoiceBonus;
  size: CreatureSize;
  speed: number; // metros
  traits: RaceTrait[];
  noOrigin?: boolean; // Golem: criatura artificial, não recebe origem
  variants?: RaceVariant[]; // Suraggel: Aggelus / Sulfure
}

export const RACES: Race[] = [
  {
    id: "humano",
    name: "Humano",
    icon: "🧑",
    rarity: "comum",
    description: "O povo mais numeroso de Arton, versátil e ambicioso, filhos de Valkaria.",
    attrBonus: {},
    attrChoiceBonus: { count: 3, amount: 2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Versátil", description: "Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha." },
    ],
  },
  {
    id: "anao",
    name: "Anão",
    icon: "⛏️",
    rarity: "comum",
    description: "Resiliente e tradicional, forjado nas cavernas de Doherimm, apaixonado por forja e cerveja.",
    attrBonus: { con: 4, sab: 2, des: -2 },
    size: "Médio",
    speed: 6,
    traits: [
      { name: "Conhecimento das Rochas", description: "Você recebe visão no escuro e +2 em testes de Percepção e Sobrevivência realizados no subterrâneo." },
      { name: "Devagar e Sempre", description: "Seu deslocamento é 6m (em vez de 9m). Porém, seu deslocamento não é reduzido por uso de armadura ou excesso de carga." },
      { name: "Duro como Pedra", description: "Você recebe +3 pontos de vida no 1º nível e +1 por nível seguinte." },
      { name: "Tradição de Heredrimm", description: "Para você, todos os machados, martelos, marretas e picaretas são armas simples. Você recebe +2 em ataques com essas armas." },
    ],
  },
  {
    id: "dahllan",
    name: "Dahllan",
    icon: "🌱",
    rarity: "comum",
    description: "Meia-dríade nascida da ligação entre humanos e a natureza feérica, devota de Allihanna.",
    attrBonus: { sab: 4, des: 2, int: -2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Amiga das Plantas", description: "Você pode lançar a magia Controlar Plantas (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM. (mágica)" },
      { name: "Armadura de Allihanna", description: "Você pode gastar uma ação de movimento e 1 PM para transformar sua pele em casca de árvore, recebendo +2 na Defesa até o fim da cena." },
      { name: "Empatia Selvagem", description: "Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Pode usar Adestramento para mudar atitude e pedir favores de animais. Caso receba esta habilidade novamente, recebe +2 em Adestramento." },
    ],
  },
  {
    id: "elfo",
    name: "Elfo",
    icon: "🍃",
    rarity: "comum",
    description: "Belo e ágil, herdeiro de um reino caído, com afinidade natural para a magia arcana.",
    attrBonus: { int: 4, des: 2, con: -2 },
    size: "Médio",
    speed: 12,
    traits: [
      { name: "Graça de Glórienn", description: "Seu deslocamento é 12m (em vez de 9m)." },
      { name: "Herança Feérica", description: "Você recebe +1 ponto de mana por nível." },
      { name: "Sentidos Élficos", description: "Você recebe visão na penumbra e +2 em Misticismo e Percepção." },
    ],
  },
  {
    id: "goblin",
    name: "Goblin",
    icon: "👹",
    rarity: "comum",
    description: "Pequeno, engenhoso e sobrevivente nato, encontrado nas frestas do mundo civilizado.",
    attrBonus: { des: 4, int: 2, car: -2 },
    size: "Pequeno",
    speed: 9,
    traits: [
      { name: "Engenhoso", description: "Você não sofre penalidades em testes de perícia por não usar kits. Se usar o kit, recebe +2 no teste de perícia." },
      { name: "Espelunqueiro", description: "Você recebe visão no escuro e deslocamento de escalada igual ao seu deslocamento terrestre." },
      { name: "Peste Esguia", description: "Seu tamanho é Pequeno, mas seu deslocamento se mantém 9m." },
      { name: "Rato das Ruas", description: "Você recebe +2 em Fortitude e sua recuperação de PV e PM nunca é inferior ao seu nível." },
    ],
  },
  {
    id: "lefou",
    name: "Lefou",
    icon: "😈",
    rarity: "comum",
    description: "Meio-demônio nascido da mácula da Tormenta, temido em todos os reinos.",
    attrBonus: { car: -2 },
    attrChoiceBonus: { count: 3, amount: 2, exclude: ["car"] },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Cria da Tormenta", description: "Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados por lefou e pela Tormenta." },
      { name: "Deformidade", description: "Você recebe +2 em duas perícias a sua escolha. Cada um desses bônus conta como um poder da Tormenta. Você pode trocar um desses bônus por um poder da Tormenta a sua escolha. Esta habilidade não causa perda de Carisma." },
    ],
  },
  {
    id: "minotauro",
    name: "Minotauro",
    icon: "🐂",
    rarity: "comum",
    description: "Guerreiro disciplinado do Império fragmentado de Tauron, orgulhoso e sisudo.",
    attrBonus: { for: 4, con: 2, sab: -2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Chifres", description: "Você possui uma arma natural de chifres (dano 1d6, crítico x2, perfuração). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os chifres." },
      { name: "Couro Rígido", description: "Sua pele é dura como a de um touro. Você recebe +1 na Defesa." },
      { name: "Faro", description: "Você não fica desprevenido e sofre apenas camuflagem (em vez de camuflagem total) contra inimigos em alcance curto que não possa ver." },
      { name: "Medo de Altura", description: "Se estiver adjacente a uma queda de 3m ou mais de altura, você fica abalado." },
    ],
  },
  {
    id: "qareen",
    name: "Qareen",
    icon: "🧞",
    rarity: "comum",
    description: "Descendente de gênios, otimista e generoso, marcado pela Deusa da Magia.",
    attrBonus: { car: 4, int: 2, sab: -2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Desejos", description: "Se lançar uma magia que alguém tenha pedido desde seu último turno, o custo da magia diminui em –1 PM. Fazer um desejo ao qareen é uma ação livre." },
      { name: "Resistência Elemental", description: "Conforme sua ascendência, você recebe resistência 10 a um tipo de dano. Escolha uma: frio (água), eletricidade (ar), fogo (fogo), ácido (terra), luz (luz) ou trevas (trevas)." },
      { name: "Tatuagem Mística", description: "Você pode lançar uma magia de 1º círculo a sua escolha (atributo-chave Carisma). Caso aprenda novamente essa magia, seu custo diminui em –1 PM. (mágica)" },
    ],
  },
  {
    id: "golem",
    name: "Golem",
    icon: "🗿",
    rarity: "rara",
    description: "Construto movido por um espírito elemental capturado em um corpo de pedra e metal.",
    attrBonus: { for: 4, con: 2, car: -2 },
    size: "Médio",
    speed: 6,
    noOrigin: true,
    traits: [
      { name: "Canalizar Reparos", description: "Como uma ação completa, você pode gastar pontos de mana para recuperar pontos de vida, à taxa de 5 PV por PM." },
      { name: "Chassi", description: "Você recebe +2 na Defesa, mas possui penalidade de armadura –2 e seu deslocamento é 6m. Você leva um dia para vestir ou remover uma armadura." },
      { name: "Criatura Artificial", description: "Você é uma criatura do tipo construto. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Não precisa respirar, alimentar-se ou dormir. Não recupera PV por descanso e não se beneficia de curas mágicas ou itens ingeríveis. Precisa ficar inerte por oito horas por dia para recarregar e recuperar PM por descanso." },
      { name: "Espírito Elemental", description: "Escolha entre água (frio), ar (eletricidade), fogo (fogo) e terra (ácido). Você é imune a dano causado por essa energia. Se fosse sofrer dano mágico dessa energia, em vez disso cura PV em quantidade igual à metade do dano." },
      { name: "Sem Origem", description: "Como uma criatura artificial, você já foi construído \"pronto\". Não tem direito a escolher uma origem e receber benefícios por ela." },
    ],
  },
  {
    id: "hynne",
    name: "Hynne",
    icon: "🍄",
    rarity: "rara",
    description: "Halfling apreciador de boa comida e casas aconchegantes, ágil e encantador quando precisa.",
    attrBonus: { des: 4, car: 2, for: -2 },
    size: "Pequeno",
    speed: 6,
    traits: [
      { name: "Arremessador", description: "Quando faz um ataque à distância com uma funda ou uma arma de arremesso, seu dano aumenta em um passo." },
      { name: "Pequeno e Rechonchudo", description: "Seu tamanho é Pequeno e seu deslocamento é 6m. Você recebe +2 em Enganação e usa o modificador de Destreza para Atletismo (em vez de Força)." },
      { name: "Sorte Salvadora", description: "Quando faz um teste de resistência, você pode gastar 1 PM para rolar este teste novamente." },
    ],
  },
  {
    id: "kliren",
    name: "Kliren",
    icon: "🔧",
    rarity: "rara",
    description: "Mestiço de humano e gnomo, extremamente engenhoso, criativo e talentoso com aparatos mecânicos.",
    attrBonus: { int: 4, car: 2, for: -2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Híbrido", description: "Você se torna treinado em uma perícia a sua escolha (não precisa ser da sua classe)." },
      { name: "Lógica Gnômica", description: "Quando faz um teste de atributo ou perícia, você pode gastar 2 PM para substituir o modificador de atributo utilizado por Inteligência." },
      { name: "Ossos Frágeis", description: "Você sofre 1 ponto de dano adicional por dado de dano de impacto." },
      { name: "Vanguardista", description: "Você recebe proficiência em armas de fogo e +2 em testes de Ofício (um qualquer, a sua escolha)." },
    ],
  },
  {
    id: "medusa",
    name: "Medusa",
    icon: "🐍",
    rarity: "rara",
    description: "Criatura reclusa de cabelos de serpente, famosa (nas mais antigas) pelo olhar petrificante.",
    attrBonus: { des: 4, car: 2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Cria de Megalokk", description: "Você é uma criatura do tipo monstro e recebe visão no escuro." },
      { name: "Natureza Venenosa", description: "Você recebe resistência a veneno 5 e pode gastar uma ação de movimento e 1 PM para envenenar uma arma que esteja empunhando, causando +1d12 de dano de veneno até acertar um ataque ou o fim da cena." },
      { name: "Olhar Atordoante", description: "Você pode gastar uma ação de movimento e 1 PM para forçar uma criatura em alcance curto a fazer um teste de Fortitude (CD Car). Se falhar, fica atordoada por 1 rodada. Se passar, fica imune a esta habilidade por um dia." },
    ],
  },
  {
    id: "osteon",
    name: "Osteon",
    icon: "💀",
    rarity: "rara",
    description: "Esqueleto consciente, capaz de adotar qualquer profissão e devoção das raças vivas.",
    attrBonus: { con: -2 },
    attrChoiceBonus: { count: 3, amount: 2, exclude: ["con"] },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Armadura Óssea", description: "Você recebe resistência a corte, frio e perfuração 5." },
      { name: "Memória Póstuma", description: "Você se torna treinado em uma perícia (não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um osteon de outra raça humanoide que não humano, ganhando uma habilidade dessa raça a sua escolha (e sua categoria de tamanho, se diferente de Médio)." },
      { name: "Natureza Esquelética", description: "Você é uma criatura do tipo morto-vivo. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Não precisa respirar, alimentar-se ou dormir. Curas mágicas causam dano a você e você não se beneficia de itens ingeríveis, mas dano de trevas recupera seus PV." },
      { name: "Preço da Não Vida", description: "Você precisa passar oito horas sob a luz de estrelas ou no subterrâneo para recuperar PV e PM por descanso em condições normais. Caso contrário, sofre os efeitos de fome." },
    ],
  },
  {
    id: "sereia",
    name: "Sereia/Tritão",
    icon: "🧜",
    rarity: "rara",
    description: "Ser de torso humanoide e corpo de peixe, cada vez mais frequente em terras emersas.",
    attrBonus: {},
    attrChoiceBonus: { count: 3, amount: 2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Canção dos Mares", description: "Você pode lançar duas das magias a seguir: Amedrontar, Comando, Despedaçar, Enfeitiçar, Hipnotismo ou Sono (atributo-chave Carisma). Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM. (mágica)" },
      { name: "Mestre do Tridente", description: "Para você, o tridente é uma arma simples. Além disso, você recebe +2 em rolagens de dano com azagaias, lanças e tridentes." },
      { name: "Transformação Anfíbia", description: "Você pode respirar debaixo d'água e possui uma cauda que fornece deslocamento de natação 12m. Fora d'água, sua cauda dá lugar a pernas (deslocamento 9m). Se permanecer mais de um dia sem contato com água, você não recupera PM com descanso até voltar para a água." },
    ],
  },
  {
    id: "silfide",
    name: "Sílfide",
    icon: "🧚",
    rarity: "rara",
    description: "A mais numerosa das fadas de Arton, curiosa, brincalhona e sempre em busca de diversão.",
    attrBonus: { car: 4, des: 2, for: -4 },
    size: "Minúsculo",
    speed: 9,
    traits: [
      { name: "Asas de Borboleta", description: "Seu tamanho é Minúsculo. Você pode pairar a 1,5m do chão com deslocamento 9m, ignorando terreno difícil e imune a dano por queda. Você pode gastar 1 PM por rodada para voar com deslocamento de 12m." },
      { name: "Espírito da Natureza", description: "Você é uma criatura do tipo espírito, recebe visão na penumbra e pode falar com animais livremente." },
      { name: "Magia das Fadas", description: "Você pode lançar duas das magias a seguir (todas atributo-chave Carisma): Criar Ilusão, Enfeitiçar, Luz (como uma magia arcana) e Sono. Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM. (mágica)" },
    ],
  },
  {
    id: "suraggel",
    name: "Suraggel",
    icon: "👼",
    rarity: "rara",
    description: "Descendente de extraplanares divinos, com traços angelicais (aggelus) ou demoníacos (sulfure).",
    attrBonus: {},
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Herança Divina", description: "Você é uma criatura do tipo espírito e recebe visão no escuro." },
    ],
    variants: [
      {
        id: "aggelus",
        name: "Aggelus (celestial)",
        attrBonus: { sab: 4, car: 2 },
        traits: [
          { name: "Luz Sagrada", description: "Você recebe +2 em Diplomacia e Intuição. Além disso, pode lançar Luz (como uma magia divina; atributo-chave Carisma). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM. (mágica)" },
        ],
      },
      {
        id: "sulfure",
        name: "Sulfure (abissal)",
        attrBonus: { des: 4, int: 2 },
        traits: [
          { name: "Sombras Profanas", description: "Você recebe +2 em Enganação e Furtividade. Além disso, pode lançar Escuridão (como uma magia divina; atributo-chave Inteligência). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM. (mágica)" },
        ],
      },
    ],
  },
  {
    id: "trog",
    name: "Trog",
    icon: "🦎",
    rarity: "rara",
    description: "Homem-lagarto primitivo e subterrâneo, geralmente hostil, mas ocasionalmente aventureiro.",
    attrBonus: { con: 4, for: 2, int: -2 },
    size: "Médio",
    speed: 9,
    traits: [
      { name: "Mau Cheiro", description: "Você pode gastar uma ação padrão e 2 PM para expelir um gás fétido. Criaturas em alcance curto (exceto trogs) devem passar em um teste de Fortitude (CD Con) ou ficam enjoadas por 1d6 rodadas." },
      { name: "Mordida", description: "Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida." },
      { name: "Reptiliano", description: "Você é uma criatura do tipo monstro e recebe visão no escuro, +1 na Defesa e, se estiver sem armadura ou roupas pesadas, +5 em Furtividade." },
      { name: "Sangue Frio", description: "Você sofre 1 ponto de dano adicional por dado de dano de frio." },
    ],
  },
];

export const RACE_BY_ID: Record<string, Race> = Object.fromEntries(
  RACES.map((r) => [r.id, r]),
);
