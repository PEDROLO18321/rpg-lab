// ─── TORMENTA 20 — Poderes e progressão de classe: Cavaleiro, Clérigo, Druida, Guerreiro, Inventor ─
import type { Power } from "./types";

export interface ClassLevelRow { level: number; text: string }
export interface ClassFeature { name: string; level: number; description: string }

// ════════════════════════════════════════════════════════════════════════════
// CAVALEIRO
// ════════════════════════════════════════════════════════════════════════════

export const CAVALEIRO_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Baluarte +2, código de honra" },
  { level: 2, text: "Duelo, poder de cavaleiro" },
  { level: 3, text: "Poder de cavaleiro" },
  { level: 4, text: "Poder de cavaleiro" },
  { level: 5, text: "Caminho do cavaleiro, baluarte +4, poder de cavaleiro" },
  { level: 6, text: "Poder de cavaleiro" },
  { level: 7, text: "Baluarte (aliados adjacentes), poder de cavaleiro" },
  { level: 8, text: "Poder de cavaleiro" },
  { level: 9, text: "Baluarte +6, poder de cavaleiro" },
  { level: 10, text: "Poder de cavaleiro" },
  { level: 11, text: "Poder de cavaleiro, resoluto" },
  { level: 12, text: "Poder de cavaleiro" },
  { level: 13, text: "Baluarte +8, poder de cavaleiro" },
  { level: 14, text: "Poder de cavaleiro" },
  { level: 15, text: "Baluarte (aliados em alcance curto), poder de cavaleiro" },
  { level: 16, text: "Poder de cavaleiro" },
  { level: 17, text: "Baluarte +10, poder de cavaleiro" },
  { level: 18, text: "Poder de cavaleiro" },
  { level: 19, text: "Poder de cavaleiro" },
  { level: 20, text: "Bravura final, poder de cavaleiro" },
];

export const CAVALEIRO_POWERS: Power[] = [
  {
    id: "cavaleiro-armadura-da-honra",
    name: "Armadura da Honra",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "No início de cada cena, você recebe uma quantidade de pontos de vida temporários igual a 5 + seu bônus de Carisma. Os PV temporários duram até o final da cena.",
  },
  {
    id: "cavaleiro-autoridade-feudal",
    name: "Autoridade Feudal",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "6º nível de cavaleiro",
    description:
      "Você possui autoridade sobre pessoas comuns (qualquer pessoa sem um título de nobreza ou uma posição numa igreja reconhecida pelo Reinado). Você pode gastar 2 PM para conclamar o povo a realizar uma tarefa para você. Em termos de jogo, passa automaticamente em um teste de perícia com CD máxima igual ao seu nível +5. O tempo necessário para conclamar o povo é o tempo do uso da perícia em questão. Esta habilidade só pode ser usada em locais onde sua posição carregue alguma influência (a critério do mestre).",
  },
  {
    id: "cavaleiro-desprezar-os-covardes",
    name: "Desprezar os Covardes",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Você recebe resistência a dano 5 se estiver caído, desprevenido ou flanqueado.",
  },
  {
    id: "cavaleiro-escudeiro",
    name: "Escudeiro",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Você recebe os serviços de um escudeiro, um aliado especial que cuida de seu equipamento. Suas armas recebem um bônus de +1 em rolagens de dano e sua armadura concede +1 em Defesa. Além disso, você pode pagar 1 PM para receber ajuda do escudeiro em combate. Você recebe uma ação de movimento que pode usar para se levantar, sacar um item ou trazer sua montaria. O escudeiro não conta em seu limite de aliados. Caso ele morra, você pode treinar outro com um mês de trabalho.",
  },
  {
    id: "cavaleiro-especializacao-em-armadura",
    name: "Especialização em Armadura",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "12º nível de cavaleiro",
    description:
      "Se estiver usando armadura pesada, você recebe resistência a dano 5 (cumulativa com a RD fornecida por Bastião).",
  },
  {
    id: "cavaleiro-estandarte",
    name: "Estandarte",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "Título, 14º nível de cavaleiro",
    description:
      "Sua flâmula torna-se célebre, um símbolo de inspiração para seus aliados. No início de cada cena, você e todos os aliados que possam ver seu estandarte recebem um número de PM temporários igual ao seu bônus de Carisma (mínimo 1). PM temporários desaparecem no final da cena.",
  },
  {
    id: "cavaleiro-etiqueta",
    name: "Etiqueta",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Você pode gastar 1 PM para rolar novamente um teste recém realizado de Diplomacia ou Nobreza.",
  },
  {
    id: "cavaleiro-investida-destruidora",
    name: "Investida Destruidora",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Quando faz a ação investida, você pode gastar 2 PM. Se fizer isso, causa +2d8 pontos de dano. Você deve usar esta habilidade antes de rolar o ataque.",
  },
  {
    id: "cavaleiro-montaria-corajosa",
    name: "Montaria Corajosa",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "Montaria",
    description:
      "Sua montaria concede +1d6 em rolagens de dano corpo a corpo (cumulativo com qualquer bônus que ela já forneça como aliado).",
  },
  {
    id: "cavaleiro-pajem",
    name: "Pajem",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Você recebe os serviços de um pajem, um aliado especial que o auxilia em pequenos afazeres. Você recebe +2 em Diplomacia, por estar sempre aprumado, e sua recuperação de PV e PM aumenta em +1 por nível, por estar sempre confortável. O pajem pode executar pequenas tarefas, como entregar mensagens e comprar itens, e não conta em seu limite de aliados. Caso ele morra, você pode treinar outro com uma semana de trabalho.",
  },
  {
    id: "cavaleiro-postura-de-combate-ariete-implacavel",
    name: "Postura de Combate: Aríete Implacável",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Ao assumir esta postura, você aumenta o bônus de ataque em investidas em +2. Para cada 2 PM adicionais que gastar quando assumir a postura, aumenta o bônus de ataque em +1. Além disso, se fizer uma investida contra um objeto, causa +2d8 de dano. Você precisa se deslocar todos os turnos para manter esta postura ativa.",
  },
  {
    id: "cavaleiro-postura-de-combate-castigo-de-ferro",
    name: "Postura de Combate: Castigo de Ferro",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Sempre que um aliado adjacente sofrer um ataque corpo a corpo, você pode gastar 1 PM para fazer um ataque na criatura que o atacou como uma reação.",
  },
  {
    id: "cavaleiro-postura-de-combate-foco-de-batalha",
    name: "Postura de Combate: Foco de Batalha",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Sempre que um inimigo atacá-lo, você recebe 1 PM temporário. Pontos de mana temporários desaparecem no final da cena.",
  },
  {
    id: "cavaleiro-postura-de-combate-muralha-intransponivel",
    name: "Postura de Combate: Muralha Intransponível",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Para assumir esta postura você precisa estar empunhando um escudo. Você recebe +1 na Defesa e em Reflexos. Além disso, quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, não sofre nenhum dano se passar. Para cada 2 PM adicionais que gastar quando assumir a postura, aumenta esse bônus em +1. Por fim, enquanto mantiver esta postura, seu deslocamento é reduzido para 3m.",
  },
  {
    id: "cavaleiro-postura-de-combate-provocacao-petulante",
    name: "Postura de Combate: Provocação Petulante",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Enquanto esta postura estiver ativa, todos os inimigos que iniciarem seus turnos dentro de seu alcance curto devem fazer um teste de Vontade (CD Car). Se falharem, devem atacar você nessa rodada.",
  },
  {
    id: "cavaleiro-postura-de-combate-torre-inabalavel",
    name: "Postura de Combate: Torre Inabalável",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Você assume uma postura defensiva que o torna imune a qualquer tentativa de tirá-lo do lugar, de forma mundana ou mágica. Enquanto mantiver a postura, você não pode se deslocar, mas recebe um bônus na Defesa igual a seu bônus de Constituição e pode substituir testes de Reflexos e Vontade por testes de Fortitude.",
  },
  {
    id: "cavaleiro-solidez",
    name: "Solidez",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Se estiver usando um escudo, você aplica o bônus na Defesa recebido pelo escudo em testes de resistência.",
  },
  {
    id: "cavaleiro-titulo",
    name: "Título",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "Autoridade Feudal, 10º nível de cavaleiro",
    description:
      "Você adquire um título de nobreza. Converse com o mestre para definir os benefícios exatos de seu título. Como regra geral, você recebe 10 TO por nível de cavaleiro no início de cada aventura (rendimentos dos impostos) ou a ajuda de um aliado veterano (um membro de sua corte).",
  },
  {
    id: "cavaleiro-torre-armada",
    name: "Torre Armada",
    category: "classe",
    classId: "cavaleiro",
    prerequisite: "—",
    description:
      "Quando um inimigo erra um ataque contra você, você pode gastar 1 PM. Se fizer isso, recebe +5 em rolagens de dano contra esse inimigo até o fim de seu próximo turno.",
  },
];

export const CAVALEIRO_FEATURES: ClassFeature[] = [
  {
    name: "Código de Honra",
    level: 1,
    description:
      "Cavaleiros distinguem-se de meros combatentes por seguir um código de conduta. Fazem isto para mostrar que estão acima dos mercenários e bandoleiros que infestam os campos de batalha. Você não pode atacar um oponente pelas costas (em termos de jogo, não pode se beneficiar do bônus de flanquear), caído, desprevenido ou incapaz de lutar. Se violar o código, você perde todos os seus PM e só pode recuperá-los a partir do próximo dia. Rebaixar-se ao nível dos covardes e desesperados abala a autoconfiança que eleva o cavaleiro.",
  },
  {
    name: "Baluarte",
    level: 1,
    description:
      "Você pode gastar 1 PM para receber +2 na Defesa e nos testes de resistência até o início do seu próximo turno. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +2. A partir do 7º nível, quando usa esta habilidade, você pode gastar 2 PM adicionais para fornecer o mesmo bônus a todos os aliados adjacentes. Por exemplo, pode gastar 4 PM ao todo para receber +4 na Defesa e nos testes de resistência e fornecer este mesmo bônus aos outros. A partir do 15º nível, você pode gastar 5 PM adicionais para fornecer o mesmo bônus a todos os aliados em alcance curto.",
  },
  {
    name: "Duelo",
    level: 2,
    description:
      "A partir do 2º nível, você pode gastar 2 PM para escolher um inimigo em alcance curto e receber +1 em testes de ataque e rolagens de dano contra ele até o fim da cena. Se atacar outro inimigo, o bônus termina. Para cada 2 PM extras que você gastar, o bônus aumenta em +1.",
  },
  {
    name: "Caminho do Cavaleiro",
    level: 5,
    description:
      "No 5º nível, escolha entre Bastião ou Montaria. Bastião. Se estiver usando armadura pesada, você recebe resistência a dano 5 (cumulativa com a RD fornecida por Especialização em Armadura). Montaria. Você recebe um cavalo de guerra com o qual possui +5 em testes de Adestramento e Cavalgar. Ele fornece os benefícios de um aliado iniciante de seu tipo. No 11º nível, passa a fornecer os benefícios de um aliado veterano e, no 17º nível, de um aliado mestre. De acordo com o mestre, você pode receber outro tipo de montaria. Veja a lista de aliados no Capítulo 6: O Mestre. Caso a montaria morra, você pode comprar outra pelo preço normal e treiná-la para receber os benefícios deste poder com uma semana de trabalho.",
  },
  {
    name: "Resoluto",
    level: 11,
    description:
      "A partir do 11º nível, você pode gastar 1 PM para refazer um teste de resistência contra uma condição (como abalado, paralisado etc.) que esteja o afetando. O segundo teste recebe um bônus de +5 e, se você passar, cancela o efeito. Você só pode usar esta habilidade uma vez por efeito.",
  },
  {
    name: "Bravura Final",
    level: 20,
    description:
      "No 20º nível, sua virtude vence a morte. Se for reduzido a 0 ou menos PV, você pode continuar consciente e agindo normalmente. Se fizer isso, deve gastar 5 PM no início de cada um de seus turnos. Caso contrário, cai inconsciente ou morto, conforme seus PV atuais.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// CLÉRIGO
// ════════════════════════════════════════════════════════════════════════════

export const CLERIGO_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Devoto, magias (1º círculo)" },
  { level: 2, text: "Poder de clérigo" },
  { level: 3, text: "Poder de clérigo" },
  { level: 4, text: "Poder de clérigo" },
  { level: 5, text: "Magias (2º círculo), poder de clérigo" },
  { level: 6, text: "Poder de clérigo" },
  { level: 7, text: "Poder de clérigo" },
  { level: 8, text: "Poder de clérigo" },
  { level: 9, text: "Magias (3º círculo), poder de clérigo" },
  { level: 10, text: "Poder de clérigo" },
  { level: 11, text: "Poder de clérigo" },
  { level: 12, text: "Poder de clérigo" },
  { level: 13, text: "Magias (4º círculo), poder de clérigo" },
  { level: 14, text: "Poder de clérigo" },
  { level: 15, text: "Poder de clérigo" },
  { level: 16, text: "Poder de clérigo" },
  { level: 17, text: "Magias (5º círculo), poder de clérigo" },
  { level: 18, text: "Poder de clérigo" },
  { level: 19, text: "Poder de clérigo" },
  { level: 20, text: "Mão da divindade, poder de clérigo" },
];

export const CLERIGO_POWERS: Power[] = [
  {
    id: "clerigo-abencoar-arma",
    name: "Abençoar Arma",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    magic: true,
    description:
      "Você se torna proficiente na arma preferida de sua divindade. Se estiver empunhando essa arma, pode gastar uma ação de movimento e 3 PM para infundi-la com poder divino. Até o final da cena, a arma emite luz dourada ou púrpura (como uma tocha) e você pode usar seu modificador de Sabedoria em testes de ataque e rolagens de dano com ela (em vez do modificador padrão). Além disso, o dano da arma aumenta em um passo e ela é considerada mágica para propósitos de resistência a dano.",
  },
  {
    id: "clerigo-autoridade-eclesiastica",
    name: "Autoridade Eclesiástica",
    category: "classe",
    classId: "clerigo",
    prerequisite: "5º nível de clérigo, devoto de um deus maior",
    description:
      "Você possui uma posição formal em uma igreja reconhecida pelos outros membros de sua fé. Os efeitos deste poder variam de acordo com a igreja e o deus — clérigos de Khalmyr, por exemplo, possuem autoridade como juízes no Reinado — e ficam a cargo do mestre. Como regra geral, você recebe +5 em testes de Diplomacia ou Intimidação ao lidar com devotos de sua divindade e paga metade do preço de itens alquímicos, poções e serviços em templos de sua divindade.",
  },
  {
    id: "clerigo-canalizar-energia-positiva-negativa",
    name: "Canalizar Energia Positiva/Negativa",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    magic: true,
    description:
      "Você pode gastar uma ação padrão e 1 PM para liberar uma onda de energia positiva ou negativa (de acordo com sua divindade) que afeta todas as criaturas em alcance curto. Energia positiva cura 1d6 pontos de dano em criaturas vivas a sua escolha e causa 1d6 pontos de dano de luz em mortos-vivos. Energia negativa tem o efeito inverso — causa dano de trevas em criaturas vivas a sua escolha e cura mortos-vivos. Uma criatura que sofra dano tem direito a um teste de Vontade (CD Car) para reduzi-lo à metade. Para cada 2 PM extras que você gastar, a cura ou dano aumenta em +1d6 PV (ou seja, pode gastar 3 PM para curar 2d6 PV, 5 PM para curar 3d6 PV e assim por diante).",
  },
  {
    id: "clerigo-canalizar-amplo",
    name: "Canalizar Amplo",
    category: "classe",
    classId: "clerigo",
    prerequisite: "Canalizar Energia Positiva ou Negativa",
    description:
      "Quando você usa a habilidade Canalizar Energia, pode gastar +2 PM para aumentar o alcance dela para médio.",
  },
  {
    id: "clerigo-comunhao-vital",
    name: "Comunhão Vital",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    magic: true,
    description:
      "Quando lança uma magia que cure uma criatura, você pode pagar +2 PM para que outra criatura em alcance curto (incluindo você mesmo) recupere uma quantidade de pontos de vida igual à metade dos PV da cura original.",
  },
  {
    id: "clerigo-conhecimento-magico",
    name: "Conhecimento Mágico",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Você aprende duas magias divinas de qualquer círculo que possa lançar. Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "clerigo-expulsar-comandar-mortos-vivos",
    name: "Expulsar/Comandar Mortos-Vivos",
    category: "classe",
    classId: "clerigo",
    prerequisite: "Canalizar Energia Positiva ou Negativa",
    magic: true,
    description:
      "Você pode usar uma ação padrão e 3 PM para expulsar (se sua divindade canaliza energia positiva) ou comandar (se canaliza energia negativa) todos os mortos-vivos em alcance curto. Mortos-vivos expulsos ficam apavorados por 1d6 rodadas. Mortos-vivos comandados ficam sob suas ordens; entretanto, o nível somado de mortos-vivos sob seu comando ao mesmo tempo não pode exceder o seu próprio nível +3. Dar uma ordem a mortos-vivos é uma ação de movimento. Mortos-vivos têm direito a um teste de Vontade (CD Car) para evitar qualquer destes efeitos.",
  },
  {
    id: "clerigo-liturgia-magica",
    name: "Liturgia Mágica",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Você pode gastar uma ação de movimento para executar uma breve liturgia de sua fé. Se fizer isso, a CD para resistir à sua próxima magia divina (desde que lançada até o final de seu próximo turno) aumenta em +2.",
  },
  {
    id: "clerigo-magia-sagrada-profana",
    name: "Magia Sagrada/Profana",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Quando lança uma magia divina que causa dano, você pode gastar +1 PM. Se fizer isso, muda o tipo de dano da magia para luz ou trevas (de acordo com a sua divindade).",
  },
  {
    id: "clerigo-mestre-celebrante",
    name: "Mestre Celebrante",
    category: "classe",
    classId: "clerigo",
    prerequisite: "qualquer poder de Missa, 12º nível de clérigo",
    description:
      "O número de pessoas que você afeta com uma missa aumenta em dez vezes e os benefícios que elas recebem dobram.",
  },
  {
    id: "clerigo-missa-bencao-da-vida",
    name: "Missa: Bênção da Vida",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Você abençoa os presentes com energia positiva. Os participantes recebem pontos de vida temporários em um valor igual ao seu nível + seu bônus de Sabedoria.",
  },
  {
    id: "clerigo-missa-chamado-as-armas",
    name: "Missa: Chamado às Armas",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Sua prece fortalece o espírito de luta. Os participantes recebem +1 em testes de ataque e rolagens de dano.",
  },
  {
    id: "clerigo-missa-elevacao-do-espirito",
    name: "Missa: Elevação do Espírito",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Você inflama a determinação dos ouvintes. Os participantes recebem pontos de mana temporários em um valor igual ao seu bônus de Sabedoria.",
  },
  {
    id: "clerigo-missa-escudo-divino",
    name: "Missa: Escudo Divino",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Sua fé protege os ouvintes. Os participantes recebem +1 em Defesa e testes de resistência.",
  },
  {
    id: "clerigo-missa-superar-as-limitacoes",
    name: "Missa: Superar as Limitações",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Você encoraja os ouvintes a superar suas próprias habilidades. Cada participante recebe +1d6 num único teste a sua escolha.",
  },
  {
    id: "clerigo-prece-de-combate",
    name: "Prece de Combate",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    description:
      "Quando lança uma magia divina com tempo de conjuração de uma ação padrão em si mesmo, você pode gastar +2 PM para lançá-la como uma ação de movimento.",
  },
  {
    id: "clerigo-simbolo-sagrado-abencoado",
    name: "Símbolo Sagrado Abençoado",
    category: "classe",
    classId: "clerigo",
    prerequisite: "—",
    magic: true,
    description:
      "Você pode gastar uma ação de movimento e 1 PM para fazer uma prece e energizar seu símbolo sagrado até o fim da cena. Um símbolo sagrado energizado emite uma luz dourada ou prateada (se sua divindade canaliza energia positiva) ou púrpura ou avermelhada (se canaliza energia negativa) que ilumina como uma tocha. Enquanto você estiver empunhando um símbolo sagrado energizado, o custo em PM para lançar suas magias divinas diminui em 1.",
  },
];

export const CLERIGO_FEATURES: ClassFeature[] = [
  {
    name: "Mão da Divindade",
    level: 20,
    description:
      "No 20º nível, você pode gastar uma ação completa e 15 PM para canalizar a energia de seu deus. Ao fazer isso, você lança três magias divinas quaisquer (de qualquer círculo, incluindo magias que você não conhece), como uma ação livre e sem gastar PM (mas ainda precisa pagar outros custos). Você pode aplicar aprimoramentos, mas precisa pagar por eles. Após usar esta habilidade, você fica atordoado por 1d4 rodadas. Corpos mortais não foram feitos para lidar com tanto poder.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// DRUIDA
// ════════════════════════════════════════════════════════════════════════════

export const DRUIDA_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Devoto, empatia selvagem, magias (1º círculo)" },
  { level: 2, text: "Caminho dos ermos, poder de druida" },
  { level: 3, text: "Poder de druida" },
  { level: 4, text: "Poder de druida" },
  { level: 5, text: "Poder de druida" },
  { level: 6, text: "Magias (2º círculo), poder de druida" },
  { level: 7, text: "Poder de druida" },
  { level: 8, text: "Poder de druida" },
  { level: 9, text: "Poder de druida" },
  { level: 10, text: "Magias (3º círculo), poder de druida" },
  { level: 11, text: "Poder de druida" },
  { level: 12, text: "Poder de druida" },
  { level: 13, text: "Poder de druida" },
  { level: 14, text: "Magias (4º círculo), poder de druida" },
  { level: 15, text: "Poder de druida" },
  { level: 16, text: "Poder de druida" },
  { level: 17, text: "Poder de druida" },
  { level: 18, text: "Poder de druida" },
  { level: 19, text: "Poder de druida" },
  { level: 20, text: "Força da natureza, poder de druida" },
];

export const DRUIDA_POWERS: Power[] = [
  {
    id: "druida-aspecto-do-inverno",
    name: "Aspecto do Inverno",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você recebe resistência a frio 5 e suas magias que causam dano de frio causam +1 ponto de dano por dado. Durante o inverno, suas magias de druida custam −1 PM.",
  },
  {
    id: "druida-aspecto-do-outono",
    name: "Aspecto do Outono",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você aprende uma magia de necromancia, arcana ou divina, de qualquer círculo que possa lançar. Você pode gastar 1 PM para impor uma penalidade de –2 nos testes de resistência de todos os inimigos em alcance médio até o início do seu próximo turno. Durante o outono, suas magias de druida custam −1 PM.",
  },
  {
    id: "druida-aspecto-da-primavera",
    name: "Aspecto da Primavera",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você recebe +1 em Carisma e suas magias de cura curam +1 PV por dado. Durante a primavera, suas magias de druida custam −1 PM.",
  },
  {
    id: "druida-aspecto-do-verao",
    name: "Aspecto do Verão",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você recebe +2 em Iniciativa e pode gastar 1 PM para cobrir suas armas ou armas naturais com chamas, causando +1d6 pontos de dano de fogo até o fim da cena. Durante o verão, suas magias de druida custam −1 PM.",
  },
  {
    id: "druida-companheiro-animal",
    name: "Companheiro Animal",
    category: "classe",
    classId: "druida",
    prerequisite: "treinado em Adestramento",
    description:
      "Você recebe um companheiro animal. Veja o quadro a seguir para detalhes.",
  },
  {
    id: "druida-companheiro-animal-adicional",
    name: "Companheiro Animal Adicional",
    category: "classe",
    classId: "druida",
    prerequisite: "Car 15, Companheiro Animal, 7º nível de druida",
    description:
      "Você recebe um companheiro animal adicional, de um tipo diferente dos que já tenha. Você pode escolher este poder quantas vezes quiser, mas ainda está sujeito ao limite de aliados que pode ter (veja a página 246).",
  },
  {
    id: "druida-companheiro-animal-aprimorado",
    name: "Companheiro Animal Aprimorado",
    category: "classe",
    classId: "druida",
    prerequisite: "Companheiro Animal, 8º nível de druida",
    description:
      "Escolha um de seus companheiros animais. Esse animal recebe um segundo tipo diferente, ganhando os bônus equivalentes. Por exemplo, se você tiver um companheiro guardião, pode adicionar o tipo fortão a ele, tornando-o um guardião fortão que concede +2 na Defesa e +1d8 nas rolagens de dano corpo a corpo.",
  },
  {
    id: "druida-companheiro-animal-lendario",
    name: "Companheiro Animal Lendário",
    category: "classe",
    classId: "druida",
    prerequisite: "Companheiro Animal, 18º nível de druida",
    description:
      "Escolha um de seus companheiros animais. Esse animal passa a dobrar seus bônus concedidos. No caso de companheiros que concedem dados de bônus, o número de dados aumenta em 1.",
  },
  {
    id: "druida-companheiro-animal-magico",
    name: "Companheiro Animal Mágico",
    category: "classe",
    classId: "druida",
    prerequisite: "Companheiro Animal, 8º nível de druida",
    description:
      "Escolha um de seus companheiros animais. Esse animal recebe um segundo tipo diferente, entre destruidor ou médico, ganhando os bônus equivalentes.",
  },
  {
    id: "druida-coracao-da-selva",
    name: "Coração da Selva",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você recebe +2 em Fortitude e se torna imune a venenos.",
  },
  {
    id: "druida-espirito-dos-equinocios",
    name: "Espírito dos Equinócios",
    category: "classe",
    classId: "druida",
    prerequisite: "Aspecto da Primavera, Aspecto do Outono, 10º nível de druida",
    description:
      "Sua alma e corpo estão em equilíbrio. Você pode gastar 1 PM para escolher 10 em um teste de resistência.",
  },
  {
    id: "druida-espirito-dos-solsticios",
    name: "Espírito dos Solstícios",
    category: "classe",
    classId: "druida",
    prerequisite: "Aspecto do Inverno, Aspecto do Verão, 10º nível de druida",
    description:
      "Você transita entre os extremos do mundo natural. Quando lança uma magia, pode gastar +4 PM para maximizar os efeitos numéricos variáveis dela. Por exemplo, uma magia Curar Ferimentos aprimorada para curar 5d8+5 PV irá curar automaticamente 45 PV, sem a necessidade de rolar dados. Uma magia sem efeitos variáveis não pode ser afetada por este poder.",
  },
  {
    id: "druida-forca-dos-penhascos",
    name: "Força dos Penhascos",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você recebe +2 em Fortitude. Se estiver pisando em rocha sólida, pode gastar 1 PM e uma reação para receber RD 10 contra um ataque.",
  },
  {
    id: "druida-forma-primal",
    name: "Forma Primal",
    category: "classe",
    classId: "druida",
    prerequisite: "Forma Selvagem duas vezes, 18º nível de druida",
    description:
      "Quando usa Forma Selvagem, você pode se transformar em uma fera primal. Você recebe os benefícios de dois tipos de animais (bônus iguais não se acumulam; use o que você quiser de cada tipo).",
  },
  {
    id: "druida-forma-selvagem",
    name: "Forma Selvagem",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    magic: true,
    description:
      "Você pode se transformar em um tipo de animal. Veja a seguir. Você pode escolher este poder diversas vezes. A cada vez, aprende uma forma selvagem diferente.",
  },
  {
    id: "druida-liberdade-da-pradaria",
    name: "Liberdade da Pradaria",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você recebe +2 em Reflexos. Se estiver ao ar livre, você pode gastar 1 PM sempre que lançar uma magia para aumentar o alcance dela em um passo (de toque para curto, de curto para médio etc.).",
  },
  {
    id: "druida-magia-natural",
    name: "Magia Natural",
    category: "classe",
    classId: "druida",
    prerequisite: "Forma Selvagem, 8º nível de druida",
    description:
      "Você pode lançar magias em forma selvagem.",
  },
  {
    id: "druida-presas-afiadas",
    name: "Presas Afiadas",
    category: "classe",
    classId: "druida",
    prerequisite: "Forma Selvagem",
    description:
      "A margem de ameaça de suas armas naturais em forma selvagem aumenta em +2.",
  },
  {
    id: "druida-segredos-da-natureza",
    name: "Segredos da Natureza",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você aprende duas magias de qualquer círculo que possa lançar. Elas devem pertencer às escolas que você sabe usar, mas podem ser arcanas ou divinas. Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "druida-tranquilidade-dos-lagos",
    name: "Tranquilidade dos Lagos",
    category: "classe",
    classId: "druida",
    prerequisite: "—",
    description:
      "Você recebe +2 em Vontade. Se estiver em alcance médio de um lago, rio ou equivalente, pode gastar 1 PM uma vez por rodada para repetir um teste de resistência recém realizado.",
  },
];

export const DRUIDA_FEATURES: ClassFeature[] = [
  {
    name: "Empatia Selvagem",
    level: 1,
    description:
      "Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e pedir favores (veja Diplomacia, na página 117).",
  },
  {
    name: "Caminho dos Ermos",
    level: 2,
    description:
      "No 2º nível, você pode atravessar terrenos difíceis sem sofrer redução em seu deslocamento e a CD para rastreá-lo aumenta em +10. Esta habilidade só funciona em terrenos naturais.",
  },
  {
    name: "Força da Natureza",
    level: 20,
    description:
      "No 20º nível, você diminui o custo de todas as suas magias em –2 PM e aumenta a CD delas em +2. Os bônus dobram (–4 PM e +4 na CD) se você estiver em terrenos naturais.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// GUERREIRO
// ════════════════════════════════════════════════════════════════════════════

export const GUERREIRO_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Ataque especial +4" },
  { level: 2, text: "Poder de guerreiro" },
  { level: 3, text: "Durão, poder de guerreiro" },
  { level: 4, text: "Poder de guerreiro" },
  { level: 5, text: "Ataque especial +8, poder de guerreiro" },
  { level: 6, text: "Ataque extra, poder de guerreiro" },
  { level: 7, text: "Poder de guerreiro" },
  { level: 8, text: "Poder de guerreiro" },
  { level: 9, text: "Ataque especial +12, poder de guerreiro" },
  { level: 10, text: "Poder de guerreiro" },
  { level: 11, text: "Poder de guerreiro" },
  { level: 12, text: "Poder de guerreiro" },
  { level: 13, text: "Ataque especial +16, poder de guerreiro" },
  { level: 14, text: "Poder de guerreiro" },
  { level: 15, text: "Poder de guerreiro" },
  { level: 16, text: "Poder de guerreiro" },
  { level: 17, text: "Ataque especial +20, poder de guerreiro" },
  { level: 18, text: "Poder de guerreiro" },
  { level: 19, text: "Poder de guerreiro" },
  { level: 20, text: "Campeão, poder de guerreiro" },
];

export const GUERREIRO_POWERS: Power[] = [
  {
    id: "guerreiro-ambidestria",
    name: "Ambidestria",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "Des 15",
    description:
      "Se estiver usando duas armas (e pelo menos uma delas for leve) e fizer a ação atacar, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno.",
  },
  {
    id: "guerreiro-arqueiro",
    name: "Arqueiro",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "Sab 13",
    description:
      "Se estiver usando uma arma de ataque à distância, você soma seu bônus de Sabedoria em rolagens de dano (limitado pelo seu nível).",
  },
  {
    id: "guerreiro-ataque-reflexo",
    name: "Ataque Reflexo",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "Des 13",
    description:
      "Se um alvo em alcance de seus ataques corpo a corpo ficar desprevenido ou se mover voluntariamente para fora do seu alcance, você pode gastar 1 PM para fazer um ataque corpo a corpo contra esse alvo como uma reação.",
  },
  {
    id: "guerreiro-bater-e-correr",
    name: "Bater e Correr",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Quando faz uma investida, você pode continuar se movendo após o ataque, até o limite de seu deslocamento. Se gastar 2 PM, pode fazer uma investida sobre terreno difícil e sem sofrer a penalidade de Defesa.",
  },
  {
    id: "guerreiro-destruidor",
    name: "Destruidor",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "For 13",
    description:
      "Quando causa dano com uma arma corpo a corpo de duas mãos, você pode rolar novamente qualquer resultado 1 ou 2 das rolagens de dano da arma.",
  },
  {
    id: "guerreiro-esgrimista",
    name: "Esgrimista",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "Int 13",
    description:
      "Quando usa uma arma leve ou ágil, você soma seu bônus de Inteligência nas rolagens de dano (limitado pelo seu nível).",
  },
  {
    id: "guerreiro-especializacao-em-arma",
    name: "Especialização em Arma",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Escolha uma arma. Você recebe +2 em rolagens de dano com a arma escolhida. Você pode escolher este poder outras vezes para armas diferentes.",
  },
  {
    id: "guerreiro-especializacao-em-armadura",
    name: "Especialização em Armadura",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "12º nível de guerreiro",
    description:
      "Você recebe resistência a dano 5 se estiver usando uma armadura pesada.",
  },
  {
    id: "guerreiro-golpe-de-raspao",
    name: "Golpe de Raspão",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Quando erra um ataque, você pode gastar 1 PM. Se fizer isso, causa 1d8 pontos de dano (do tipo da arma) no alvo do ataque.",
  },
  {
    id: "guerreiro-golpe-demolidor",
    name: "Golpe Demolidor",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Quando usa a manobra quebrar ou ataca um objeto, você pode gastar 2 PM para ignorar a RD dele.",
  },
  {
    id: "guerreiro-golpe-pessoal",
    name: "Golpe Pessoal",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "5º nível de guerreiro",
    description:
      "Quando faz um ataque, você pode desferir seu Golpe Pessoal, uma manobra única, com efeitos determinados por você. Você constrói o seu Golpe Pessoal escolhendo efeitos da lista a seguir. Cada efeito possui um custo; a soma deles será o custo do Golpe Pessoal (mínimo 1 PM e máximo igual ao seu nível). O Golpe Pessoal só pode ser usado com um tipo de arma específico (por exemplo, apenas espadas longas). Quando sobe de nível, você pode reconstruir seu Golpe Pessoal e alterar a arma que ele usa. Você pode escolher este poder outras vezes para golpes diferentes.",
  },
  {
    id: "guerreiro-impeto",
    name: "Ímpeto",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Você pode gastar 1 PM para aumentar seu deslocamento em +6m por uma rodada.",
  },
  {
    id: "guerreiro-mestre-em-arma",
    name: "Mestre em Arma",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "Especialização em Arma com a arma escolhida, 12º nível de guerreiro",
    description:
      "Escolha uma arma. Com esta arma, seu dano aumenta em um passo e você pode gastar 2 PM para rolar novamente um teste de ataque recém realizado.",
  },
  {
    id: "guerreiro-planejamento-marcial",
    name: "Planejamento Marcial",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "treinado em Guerra, 10º nível de guerreiro",
    description:
      "Uma vez por dia, você pode gastar uma hora e 3 PM para escolher um poder de guerreiro ou de combate cujos pré-requisitos cumpra. Você recebe os benefícios desse poder até o próximo dia.",
  },
  {
    id: "guerreiro-romper-resistencias",
    name: "Romper Resistências",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Quando faz um Ataque Especial, você pode gastar 2 PM adicionais para ignorar qualquer resistência a dano de uma criatura.",
  },
  {
    id: "guerreiro-solidez",
    name: "Solidez",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Se estiver usando um escudo, você aplica o bônus na Defesa recebido pelo escudo em testes de resistência.",
  },
  {
    id: "guerreiro-tornado-de-dor",
    name: "Tornado de Dor",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "6º nível de guerreiro",
    description:
      "Você pode gastar uma ação padrão e 2 PM para desferir uma série de golpes giratórios. Faça um ataque corpo a corpo e compare-o com a Defesa de cada inimigo adjacente. Então faça uma rolagem de dano com um bônus cumulativo de +2 para cada acerto e aplique-a em cada inimigo atingido.",
  },
  {
    id: "guerreiro-valentao",
    name: "Valentão",
    category: "classe",
    classId: "guerreiro",
    prerequisite: "—",
    description:
      "Você recebe +2 em testes de ataque e rolagens de dano contra oponentes caídos, desprevenidos, flanqueados ou indefesos.",
  },
];

export const GUERREIRO_FEATURES: ClassFeature[] = [
  {
    name: "Ataque Especial",
    level: 1,
    description:
      "Quando faz um ataque, você pode gastar 1 PM para receber +4 no teste de ataque ou na rolagem de dano. A cada quatro níveis, pode gastar +1 PM para aumentar o bônus em +4. Você pode dividir os bônus igualmente. Por exemplo, no 17º nível, pode gastar 5 PM para receber +20 no ataque, +20 no dano ou +10 no ataque e +10 no dano.",
  },
  {
    name: "Durão",
    level: 3,
    description:
      "A partir do 3º nível, sua rijeza muscular permite que você absorva ferimentos. Sempre que sofre dano, você pode gastar 2 PM para reduzir esse dano à metade.",
  },
  {
    name: "Ataque Extra",
    level: 6,
    description:
      "A partir do 6º nível, quando usa a ação atacar, você pode gastar 2 PM para realizar um ataque adicional com a mesma arma.",
  },
  {
    name: "Campeão",
    level: 20,
    description:
      "No 20º nível, o dano de todos os seus ataques aumenta em um passo. Além disso, sempre que você faz um Ataque Especial ou um Golpe Pessoal e acerta o ataque, recupera metade dos PM gastos nele. Por exemplo, se fizer um Ataque Especial gastando 5 PM para ganhar +20 nas rolagens de dano e acertar o ataque, recupera 2 PM.",
  },
];

// ════════════════════════════════════════════════════════════════════════════
// INVENTOR
// ════════════════════════════════════════════════════════════════════════════

export const INVENTOR_LEVELS: ClassLevelRow[] = [
  { level: 1, text: "Engenhosidade, protótipo" },
  { level: 2, text: "Fabricar item superior (1 modificação), poder de inventor" },
  { level: 3, text: "Comerciante, poder de inventor" },
  { level: 4, text: "Fabricar item superior (2 modificações), poder de inventor" },
  { level: 5, text: "Poder de inventor" },
  { level: 6, text: "Fabricar item superior (3 modificações), poder de inventor" },
  { level: 7, text: "Encontrar fraqueza, poder de inventor" },
  { level: 8, text: "Fabricar item superior (4 modificações), poder de inventor" },
  { level: 9, text: "Fabricar item mágico (menor), poder de inventor" },
  { level: 10, text: "Fabricar item superior (5 modificações), poder de inventor" },
  { level: 11, text: "Olho do dragão, poder de inventor" },
  { level: 12, text: "Fabricar item superior (6 modificações), poder de inventor" },
  { level: 13, text: "Fabricar item mágico (médio), poder de inventor" },
  { level: 14, text: "Poder de inventor" },
  { level: 15, text: "Poder de inventor" },
  { level: 16, text: "Poder de inventor" },
  { level: 17, text: "Fabricar item mágico (maior), poder de inventor" },
  { level: 18, text: "Poder de inventor" },
  { level: 19, text: "Poder de inventor" },
  { level: 20, text: "Obra-prima, poder de inventor" },
];

export const INVENTOR_POWERS: Power[] = [
  {
    id: "inventor-agite-antes-de-usar",
    name: "Agite Antes de Usar",
    category: "classe",
    classId: "inventor",
    prerequisite: "treinado em Ofício (alquimia)",
    description:
      "Quando usa um item alquímico que cause dano, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência). Para cada PM que gastar, o item causa um dado extra de dano do mesmo tipo.",
  },
  {
    id: "inventor-ajuste-de-mira",
    name: "Ajuste de Mira",
    category: "classe",
    classId: "inventor",
    prerequisite: "Balística",
    description:
      "Você pode gastar uma ação de movimento e uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência) para aprimorar uma arma de ataque à distância que esteja usando. Para cada PM que gastar, você recebe +1 em rolagens de dano com a arma até o final da cena.",
  },
  {
    id: "inventor-alquimista-de-batalha",
    name: "Alquimista de Batalha",
    category: "classe",
    classId: "inventor",
    prerequisite: "Alquimista Iniciado",
    description:
      "Quando usa um item alquímico ou poção que cause dano, você soma seu modificador de Inteligência na rolagem de dano.",
  },
  {
    id: "inventor-alquimista-iniciado",
    name: "Alquimista Iniciado",
    category: "classe",
    classId: "inventor",
    prerequisite: "Int 13, Sab 13, treinado em Ofício (alquimia)",
    description:
      "Você recebe um livro de fórmulas e pode fabricar poções com fórmulas que conheça de 1º e 2º círculos. Veja a página 327 para as regras de poções.",
  },
  {
    id: "inventor-armeiro",
    name: "Armeiro",
    category: "classe",
    classId: "inventor",
    prerequisite: "treinado em Luta e Ofício (armeiro)",
    description:
      "Você recebe proficiência com armas marciais corpo a corpo. Quando usa uma arma corpo a corpo, pode usar seu modificador de Inteligência em vez de Força nos testes de ataque e rolagens de dano.",
  },
  {
    id: "inventor-ativacao-rapida",
    name: "Ativação Rápida",
    category: "classe",
    classId: "inventor",
    prerequisite: "Engenhoqueiro, 7º nível de inventor",
    description:
      "Ao ativar uma engenhoca com ação padrão, você pode pagar 2 PM para ativá-la com uma ação de movimento, ao invés disto.",
  },
  {
    id: "inventor-automato",
    name: "Autômato",
    category: "classe",
    classId: "inventor",
    prerequisite: "—",
    description:
      "Você fabrica um autômato, uma criatura mecânica que obedece a seus comandos. Ele é um aliado Iniciante de um tipo a sua escolha entre ajudante, assassino, atirador, combatente, guardião, montaria ou vigilante. No 7º nível, ele muda para Veterano e, no 15º nível, para Mestre. Se o autômato for destruído, você pode fabricar um novo com uma semana de trabalho e T$ 100.",
  },
  {
    id: "inventor-automato-prototipado",
    name: "Autômato Prototipado",
    category: "classe",
    classId: "inventor",
    prerequisite: "Autômato, Engenhoqueiro",
    description:
      "Você pode gastar uma ação padrão e 2 PM para ativar uma modificação experimental em seu autômato. Role 1d6. Em um resultado 2 a 6, você aumenta o nível de aliado do autômato em um passo (até Mestre), ou concede a ele a habilidade Iniciante de outro tipo de aliado, até o fim da cena. Em um resultado 1, o autômato enguiça como uma engenhoca.",
  },
  {
    id: "inventor-balistica",
    name: "Balística",
    category: "classe",
    classId: "inventor",
    prerequisite: "treinado em Pontaria e Ofício (armeiro)",
    description:
      "Você recebe proficiência com armas marciais de ataque à distância ou com armas de fogo. Quando usa uma arma de ataque à distância, pode usar seu modificador de Inteligência em vez de Destreza nos testes de ataque (e, caso possua o poder Estilo de Disparo, nas rolagens de dano).",
  },
  {
    id: "inventor-blindagem",
    name: "Blindagem",
    category: "classe",
    classId: "inventor",
    prerequisite: "Couraceiro, 8º nível de inventor",
    description:
      "Você pode somar o modificador de Inteligência na Defesa quando usa armadura pesada. Se fizer isso, não pode somar o modificador de Destreza, mesmo que outras habilidades ou efeitos permitam isso (como a modificação Delicada, por exemplo).",
  },
  {
    id: "inventor-cano-raiado",
    name: "Cano Raiado",
    category: "classe",
    classId: "inventor",
    prerequisite: "Balística, 5º nível de inventor",
    description:
      "Quando usa uma arma de disparo feita por você mesmo, ela recebe +1 na margem de ameaça.",
  },
  {
    id: "inventor-catalisador-instavel",
    name: "Catalisador Instável",
    category: "classe",
    classId: "inventor",
    prerequisite: "Alquimista Iniciado",
    description:
      "Você pode gastar uma ação completa e 3 PM para fabricar um item alquímico ou poção cuja fórmula conheça instantaneamente. O custo do item é reduzido à metade e você não precisa fazer o teste de Ofício (alquimia). Contudo, ele só dura até o fim da cena.",
  },
  {
    id: "inventor-chutes-e-palavroes",
    name: "Chutes e Palavrões",
    category: "classe",
    classId: "inventor",
    prerequisite: "Engenhoqueiro",
    description:
      "Uma vez por rodada, você pode pagar 1 PM para repetir um teste falho de Ofício (engenhoqueiro) recém realizado para ativar uma engenhoca.",
  },
  {
    id: "inventor-conhecimento-de-formulas",
    name: "Conhecimento de Fórmulas",
    category: "classe",
    classId: "inventor",
    prerequisite: "Alquimista Iniciado",
    description:
      "Você aprende três fórmulas de quaisquer círculos que possa aprender. Você pode escolher este poder quantas vezes quiser.",
  },
  {
    id: "inventor-couraceiro",
    name: "Couraceiro",
    category: "classe",
    classId: "inventor",
    prerequisite: "treinado em Ofício (armeiro)",
    description:
      "Você recebe proficiência com armaduras pesadas e escudos. Quando usa armadura, pode somar seu bônus de Inteligência em vez de Destreza na Defesa (mas continua não podendo somar um bônus de atributo na Defesa quando usa armadura pesada).",
  },
  {
    id: "inventor-engenhoqueiro",
    name: "Engenhoqueiro",
    category: "classe",
    classId: "inventor",
    prerequisite: "Int 17, treinado em Ofício (engenhoqueiro)",
    description:
      "Você pode fabricar engenhocas. Veja as regras para isso na página 70.",
  },
  {
    id: "inventor-farmaceutico",
    name: "Farmacêutico",
    category: "classe",
    classId: "inventor",
    prerequisite: "Sab 13, treinado em Ofício (alquimia)",
    description:
      "Quando usa um item alquímico que cure pontos de vida, você pode gastar uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência). Para cada PM que gastar, o item cura um dado extra do mesmo tipo.",
  },
  {
    id: "inventor-ferreiro",
    name: "Ferreiro",
    category: "classe",
    classId: "inventor",
    prerequisite: "Armeiro, 5º nível de inventor",
    description:
      "Quando usa uma arma corpo a corpo feita por você mesmo, o dano dela aumenta em um passo.",
  },
  {
    id: "inventor-granadeiro",
    name: "Granadeiro",
    category: "classe",
    classId: "inventor",
    prerequisite: "Alquimista de Batalha",
    description:
      "Você pode arremessar itens alquímicos e poções em alcance médio. Você pode usar seu modificador de Inteligência em vez de Destreza para calcular a CD do teste de resistência desses itens.",
  },
  {
    id: "inventor-homunculo",
    name: "Homúnculo",
    category: "classe",
    classId: "inventor",
    prerequisite: "Alquimista Iniciado",
    description:
      "Você possui um homúnculo, uma criatura Minúscula feita de alquimia. Vocês podem se comunicar telepaticamente em alcance médio e ele obedece a suas ordens, mas ainda está limitado ao que uma criatura de seu tamanho e forma pode fazer. Um homúnculo funciona como um aliado que fornece +2 em testes de uma perícia a sua escolha. Você pode sofrer 1d6 pontos de dano para seu homúnculo assumir uma forma capaz de protegê-lo. Se fizer isso, ele fornece +2 de Defesa até o fim da cena.",
  },
  {
    id: "inventor-invencao-potente",
    name: "Invenção Potente",
    category: "classe",
    classId: "inventor",
    prerequisite: "—",
    description:
      "Quando usa um item fabricado por você mesmo, você pode pagar 1 PM para aumentar em +2 a CD para resistir a ele.",
  },
  {
    id: "inventor-maestria-em-pericia",
    name: "Maestria em Perícia",
    category: "classe",
    classId: "inventor",
    prerequisite: "—",
    description:
      "Escolha um número de perícias treinadas igual ao seu bônus de Inteligência. Com essas perícias, você pode gastar 1 PM para escolher 10 em qualquer situação, exceto testes de ataque.",
  },
  {
    id: "inventor-manutencao-eficiente",
    name: "Manutenção Eficiente",
    category: "classe",
    classId: "inventor",
    prerequisite: "Engenhoqueiro, 5º nível de inventor",
    description:
      "A quantidade de engenhocas que você pode manter aumenta em +3.",
  },
  {
    id: "inventor-mestre-alquimista",
    name: "Mestre Alquimista",
    category: "classe",
    classId: "inventor",
    prerequisite: "Int 17, Sab 17, Alquimista Iniciado, 10º nível de inventor",
    description:
      "Você pode fabricar poções com fórmulas que conheça de qualquer círculo.",
  },
  {
    id: "inventor-mestre-cuca",
    name: "Mestre Cuca",
    category: "classe",
    classId: "inventor",
    prerequisite: "treinado em Ofício (culinária)",
    description:
      "Todas as comidas que você cozinha têm seu bônus numérico aumentado em +1.",
  },
  {
    id: "inventor-mistura-fervilhante",
    name: "Mistura Fervilhante",
    category: "classe",
    classId: "inventor",
    prerequisite: "Alquimista Iniciado, 5º nível de inventor",
    description:
      "Quando usa um item alquímico ou poção, você pode gastar 2 PM para dobrar a área de efeito dele.",
  },
  {
    id: "inventor-oficina-de-campo",
    name: "Oficina de Campo",
    category: "classe",
    classId: "inventor",
    prerequisite: "treinado em Ofício (armeiro)",
    description:
      "Você pode gastar uma hora e 2 PM para fazer a manutenção do equipamento de seu grupo. Cada membro do grupo escolhe uma arma, armadura ou escudo para manutenção. Armas recebem +1 em testes de ataque, armaduras e escudos têm sua penalidade de armadura reduzida em 1. Os benefícios duram um dia.",
  },
  {
    id: "inventor-pedra-de-amolar",
    name: "Pedra de Amolar",
    category: "classe",
    classId: "inventor",
    prerequisite: "Armeiro",
    description:
      "Você pode gastar uma ação de movimento e uma quantidade de PM a sua escolha (limitado pelo seu bônus de Inteligência) para aprimorar uma arma corpo a corpo que esteja usando. Para cada PM que gastar, você recebe +1 em rolagens de dano com a arma até o final da cena.",
  },
  {
    id: "inventor-sintese-rapida",
    name: "Síntese Rápida",
    category: "classe",
    classId: "inventor",
    prerequisite: "Alquimista Iniciado",
    description:
      "Você fabrica itens alquímicos e poções em uma categoria de tempo menor. Três meses viram um mês, um mês vira uma semana, uma semana vira um dia e um dia vira uma hora (o tempo mínimo).",
  },
];

export const INVENTOR_FEATURES: ClassFeature[] = [
  {
    name: "Engenhosidade",
    level: 1,
    description:
      "Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Inteligência no teste. Você não pode usar esta habilidade em testes de ataque.",
  },
  {
    name: "Protótipo",
    level: 1,
    description:
      "Você começa o jogo com um item superior com uma modificação ou 10 itens alquímicos, com preço total de até T$ 500. Veja o Capítulo 3: Equipamento para a lista de itens.",
  },
  {
    name: "Fabricar Item Superior",
    level: 2,
    description:
      "No 2º nível, você recebe um item superior com preço de até T$ 2.000 e passa a poder fabricar itens superiores com uma modificação. Veja o Capítulo 3: Equipamento para a lista de modificações. Nos níveis 4, 6, 8, 10 e 12, você pode substituir esse item por um item superior com duas, três, quatro, cinco e seis modificações, respectivamente, e passa a poder fabricar itens superiores com essa quantidade de modificações. O item do 4º nível tem limite de preço de T$ 5.000. Os demais itens não possuem limitação de preço. Considera-se que você estava trabalhando nos itens e você não gasta dinheiro ou tempo neles (mas gasta em itens que fabricar futuramente).",
  },
  {
    name: "Comerciante",
    level: 3,
    description:
      "No 3º nível, você pode vender itens 10% mais caro (não cumulativo com barganha).",
  },
  {
    name: "Encontrar Fraqueza",
    level: 7,
    description:
      "A partir do 7º nível, você pode gastar uma ação de movimento e 2 PM para analisar um objeto em alcance curto. Se fizer isso, ignora a resistência a dano dele. Você também pode usar esta habilidade para encontrar uma fraqueza em um inimigo. Se ele estiver de armadura ou for um construto, você recebe +2 em seus testes de ataque contra ele. Os benefícios desta habilidade duram até o fim da cena.",
  },
  {
    name: "Fabricar Item Mágico",
    level: 9,
    description:
      "No 9º nível, você recebe um item mágico menor e passa a poder fabricar itens mágicos menores. Veja o Capítulo 8: Recompensas para as regras de itens mágicos. Nos níveis 13 e 17, você pode substituir esse item por um item mágico médio e maior, respectivamente, e passa a poder fabricar itens mágicos dessas categorias. Considera-se que você estava trabalhando nos itens que recebe e você não gasta dinheiro, tempo ou pontos de mana neles (mas gasta em itens que fabricar futuramente).",
  },
  {
    name: "Olho do Dragão",
    level: 11,
    description:
      "A partir do 11º nível, você pode gastar uma ação completa para analisar um item. Você automaticamente descobre se o item é mágico, suas propriedades e como utilizá-las.",
  },
  {
    name: "Obra-Prima",
    level: 20,
    description:
      "No 20º nível, você fabrica sua obra-prima, aquela pela qual seu nome será lembrado em eras futuras. Você é livre para criar as regras do item, mas ele deve ser aprovado pelo mestre. Como linha geral, ele pode ter os benefícios de um item superior com seis modificações e de um item mágico maior. Considera-se que você estava trabalhando no item e você não gasta dinheiro, tempo ou PM nele.",
  },
];
