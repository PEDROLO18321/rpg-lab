// ─── TORMENTA 20 — Poderes de Destino, Magia e Tormenta (Cap. 2, pág. 129-134) ─
import type { Power } from "./types";

export const DESTINY_POWERS: Power[] = [
  {
    id: "acrobatico",
    name: "Acrobático",
    category: "destino",
    prerequisite: "Des 15",
    description:
      "Você pode usar seu modificador de Destreza em vez de Força em testes de Atletismo. Além disso, terreno difícil não reduz seu deslocamento nem o impede de realizar investidas.",
  },
  {
    id: "ao-sabor-do-destino",
    name: "Ao Sabor do Destino",
    category: "destino",
    prerequisite: "5º nível de personagem",
    description:
      'Você recebe diversos benefícios, de acordo com seu nível de personagem e a tabela abaixo: 5º — +2 em uma perícia; 6º — +1 na Defesa; 7º — +1 nas rolagens de dano; 8º — +2 em um atributo; 10º — +2 em uma perícia; 11º — +2 na Defesa; 12º — +2 nas rolagens de dano; 13º — +2 em um atributo; 15º — +2 em uma perícia; 16º — +3 na Defesa; 17º — +3 nas rolagens de dano; 18º — +2 em um atributo; 20º — +2 em uma perícia. Os bônus não são cumulativos (os bônus em atributos e perícias devem ser aplicados num atributo ou perícia diferente a cada vez). Quando você utiliza voluntariamente qualquer item mágico (exceto poções), perde o benefício deste poder até o fim da aventura. Você ainda pode lançar magias, receber magias benéficas ou beneficiar-se de itens usados por outros — por exemplo, pode "ir de carona" em um tapete voador, mas não pode você mesmo conduzi-lo.',
  },
  {
    id: "aparencia-inofensiva",
    name: "Aparência Inofensiva",
    category: "destino",
    prerequisite: "Car 13",
    description:
      "A primeira criatura inteligente (Int 3 ou mais) que atacar você em uma cena deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Este poder só funciona uma vez por cena; independentemente de a criatura falhar ou não no teste, poderá atacá-lo nas rodadas seguintes.",
  },
  {
    id: "atletico",
    name: "Atlético",
    category: "destino",
    prerequisite: "For 15",
    description: "Você recebe +2 em Atletismo e +3m em seu deslocamento.",
  },
  {
    id: "atraente",
    name: "Atraente",
    category: "destino",
    prerequisite: "Car 13",
    description:
      "Você recebe +2 em testes de perícias baseadas em Carisma contra criaturas que possam se sentir fisicamente atraídas por você.",
  },
  {
    id: "comandar",
    name: "Comandar",
    category: "destino",
    prerequisite: "Car 13",
    description:
      "Você pode gastar uma ação de movimento e 1 PM para gritar ordens para seus aliados em alcance médio. Eles recebem +1 em testes de perícia até o fim da cena.",
  },
  {
    id: "foco-em-pericia",
    name: "Foco em Perícia",
    category: "destino",
    prerequisite: "Treinado na perícia escolhida",
    description:
      "Escolha uma perícia. Quando faz um teste dessa perícia, você pode gastar 1 PM para rolar dois dados e usar o melhor resultado. Você pode escolher este poder outras vezes para perícias diferentes. Este poder não pode ser aplicado em Luta e Pontaria (mas veja Foco em Arma).",
  },
  {
    id: "investigador",
    name: "Investigador",
    category: "destino",
    prerequisite: "Int 13",
    description:
      "Você recebe +2 em Investigação e soma seu bônus de Inteligência em Intuição.",
  },
  {
    id: "lobo-solitario",
    name: "Lobo Solitário",
    category: "destino",
    prerequisite: "—",
    description:
      "Você recebe +1 em testes de perícia e Defesa se estiver sem nenhum aliado em alcance curto. Você não sofre penalidade por usar a perícia Cura em si mesmo.",
  },
  {
    id: "medicina",
    name: "Medicina",
    category: "destino",
    prerequisite: "Sab 13, treinado em Cura",
    description:
      "Você pode gastar uma ação completa para fazer um teste de Cura (CD 15) em uma criatura. Se você passar, ela recupera 1d6 PV, mais 1d6 para cada 5 pontos pelos quais o resultado do teste exceder a CD (2d6 com um resultado 20, 3d6 com um resultado 25 e assim por diante). Você só pode usar este poder uma vez por dia numa mesma criatura.",
  },
  {
    id: "parceiro",
    name: "Parceiro",
    category: "destino",
    prerequisite:
      "Treinado em Adestramento (parceiro animal) ou Diplomacia (parceiro humanoide), 6º nível de personagem",
    description:
      "Você possui um parceiro animal ou humanoide que o acompanha em aventuras. Escolha os detalhes dele, como nome, aparência e personalidade. Em termos de jogo, é um aliado iniciante de um tipo a sua escolha (veja a página 246). O parceiro obedece às suas ordens e se arrisca para ajudá-lo. Entretanto, se for maltratado, pode parar de segui-lo (de acordo com o mestre). Se perder seu parceiro, você recebe outro no início da próxima aventura.",
  },
  {
    id: "sentidos-acucados",
    name: "Sentidos Aguçados",
    category: "destino",
    prerequisite: "Sab 13, treinado em Percepção",
    description:
      "Você recebe +2 em Percepção, não fica desprevenido contra inimigos que não possa ver e, sempre que erra um ataque devido a camuflagem ou camuflagem total, pode rolar mais uma vez o dado da chance de falha.",
  },
  {
    id: "sortudo",
    name: "Sortudo",
    category: "destino",
    prerequisite: "—",
    description:
      "Você pode gastar 3 PM para rolar novamente um teste recém realizado (apenas uma vez por teste).",
  },
  {
    id: "surto-heroico",
    name: "Surto Heroico",
    category: "destino",
    prerequisite: "—",
    description:
      "Uma vez por rodada, você pode gastar 5 PM para realizar uma ação padrão ou de movimento adicional.",
  },
  {
    id: "torcida",
    name: "Torcida",
    category: "destino",
    prerequisite: "Car 13",
    description:
      'Você recebe +2 em testes de perícia e Defesa quando tem a torcida a seu favor. Entenda-se por "torcida" qualquer número de criaturas inteligentes em alcance médio que não esteja realizando nenhuma ação além de torcer por você.',
  },
  {
    id: "treinamento-em-pericia",
    name: "Treinamento em Perícia",
    category: "destino",
    prerequisite: "—",
    description:
      "Você se torna treinado em uma perícia a sua escolha. Você pode escolher este poder outras vezes para perícias diferentes.",
  },
  {
    id: "veneficio",
    name: "Venefício",
    category: "destino",
    prerequisite: "Treinado em Ofício (alquimia)",
    description:
      "Quando usa um veneno, você não corre risco de se envenenar acidentalmente. Além disso, a CD para resistir aos seus venenos aumenta em +2.",
  },
  {
    id: "vontade-de-ferro",
    name: "Vontade de Ferro",
    category: "destino",
    prerequisite: "Sab 13",
    description:
      "Você recebe +1 PM para cada dois níveis de personagem e +2 em Vontade.",
  },
];

// Nota: o livro afirma que "todos os poderes deste grupo possuem como
// pré-requisito lançar magias" — ou seja, a habilidade de classe Magias (ou
// lançar magias por qualquer outro meio) é sempre exigida além do que consta
// no campo `prerequisite` de cada poder abaixo.
export const MAGIC_POWERS: Power[] = [
  {
    id: "celebrar-ritual",
    name: "Celebrar Ritual",
    category: "magia",
    prerequisite: "Treinado em Misticismo ou Religião, 8º nível de personagem",
    description:
      "Você pode lançar magias na forma de rituais. Isso dobra seu limite de PM, mas muda a execução para 1 hora (ou o dobro, o que for maior). Você gasta T$ 10 em incensos, oferendas etc. por PM do custo total. Após esse gasto, paga apenas metade do custo em PM da magia (após aplicar quaisquer outros efeitos de redução). Assim, um arcanista de 8º nível pode lançar uma magia de 16 PM gastando T$ 160 e 8 PM.",
  },
  {
    id: "escrever-pergaminho",
    name: "Escrever Pergaminho",
    category: "magia",
    prerequisite: "Habilidade de classe Magias, treinado em Ofício (escriba)",
    description:
      "Você pode usar a perícia Ofício (escriba) para fabricar pergaminhos com magias que conheça. Veja a página 121 para a regra de fabricar itens e a página 327 para a regra de pergaminhos. De acordo com o mestre, você pode usar outros objetos similares, como runas, tabuletas de argila etc.",
  },
  {
    id: "foco-em-magia",
    name: "Foco em Magia",
    category: "magia",
    prerequisite: "Lançar magias",
    description:
      "Escolha uma magia. Seu custo diminui em –1 PM (cumulativo com outras reduções de custo). Você pode escolher este poder outras vezes para magias diferentes.",
  },
  {
    id: "magia-acelerada",
    name: "Magia Acelerada",
    category: "magia",
    prerequisite: "Lançar magias de 2º círculo",
    description:
      "Muda a execução da magia para ação livre. Você só pode aplicar este aprimoramento em magias com execução de movimento, padrão ou completa e só pode lançar uma magia como ação livre por rodada. Custo: +4 PM.",
  },
  {
    id: "magia-ampliada",
    name: "Magia Ampliada",
    category: "magia",
    prerequisite: "Lançar magias",
    description:
      "Aumenta o alcance da magia em um passo (de curto para médio, de médio para longo) ou dobra a área de efeito da magia. Por exemplo, uma Bola de Fogo ampliada tem seu alcance aumentado para longo ou sua área aumentada para 12m de raio. Custo: +2 PM.",
  },
  {
    id: "magia-discreta",
    name: "Magia Discreta",
    category: "magia",
    prerequisite: "Lançar magias",
    description:
      "Você lança a magia sem gesticular e falar, usando apenas concentração. Isso permite lançar magias com as mãos presas, amordaçado etc. Também permite lançar magias arcanas usando armadura sem teste de Misticismo. Outros personagens só percebem que você lançou uma magia se passarem num teste de Misticismo (CD 20). Custo: +2 PM.",
  },
  {
    id: "magia-ilimitada",
    name: "Magia Ilimitada",
    category: "magia",
    prerequisite: "Lançar magias",
    description:
      "Você soma seu modificador do atributo-chave no limite de PM que pode gastar numa magia. Por exemplo, um mago de 5º nível com Int 18 (+4) e este poder pode gastar até 9 PM em cada magia.",
  },
  {
    id: "preparar-pocao",
    name: "Preparar Poção",
    category: "magia",
    prerequisite: "Habilidade de classe Magias, treinado em Ofício (alquimia)",
    description:
      "Você pode usar a perícia Ofício (alquimia) para fabricar poções com magias que conheça de 1º e 2º círculos. Veja a página 121 para a regra de fabricar itens e a página 327 para a regra de poções.",
  },
];

// Poderes da Tormenta (pág. 134): concedem habilidades ligadas à tempestade
// rubra. Regra do grupo: para cada poder da Tormenta escolhido, o personagem
// perde 1 ponto de Carisma (deformidades físicas + perda gradual da própria
// identidade); um personagem reduzido a Car 0 vira NPC sob controle do mestre.
//
// No livro, esta lista de 15 poderes aparece sob um único título ("Poderes da
// Tormenta") e um único parágrafo introdutório — não há uma categoria
// "Poderes Aberrantes" separada. Na diagramação original em duas colunas, o
// bloco de referência rápida foi apenas dividido visualmente em duas partes
// (uma com os poderes de mutação insetoide/aberrante — Anatomia Insana,
// Antenas, Armamento Aberrante, Articulações Flexíveis, Asas Insetoides,
// Carapaça, Corpo Aberrante, Dentes Afiados — e outra com os poderes de
// mutação "rubra" — Empunhadura Rubra, Mãos Membranosas, Membros Extras,
// Olhos Vermelhos, Pele Corrompida, Sangue Ácido, Visco Rubro), mas todos são
// tratados como intercambiáveis nos pré-requisitos uns dos outros ("outro
// poder da Tormenta", "quatro outros poderes da Tormenta"). Por isso, ambos
// os grupos foram unificados aqui em TORMENTA_POWERS, category: "tormenta".
export const TORMENTA_POWERS: Power[] = [
  {
    id: "anatomia-insana",
    name: "Anatomia Insana",
    category: "tormenta",
    prerequisite: "—",
    description:
      'Você tem 25% de chance (resultado "1" em 1d4) de ignorar o dano adicional de um acerto crítico ou ataque furtivo. A chance aumenta em +25% para cada dois outros poderes da Tormenta que você possui.',
  },
  {
    id: "antenas",
    name: "Antenas",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Você recebe +1 em Iniciativa, Percepção e Vontade. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.",
  },
  {
    id: "armamento-aberrante",
    name: "Armamento Aberrante",
    category: "tormenta",
    prerequisite: "Outro poder da Tormenta",
    description:
      "Você pode gastar uma ação de movimento e 1 PM para produzir uma arma orgânica macabra — ela brota do seu braço, ombro ou costas como uma planta grotesca e então se desprende. Você pode produzir qualquer arma corpo a corpo ou de arremesso com a qual seja proficiente. O dano da arma aumenta em um passo para cada dois outros poderes da Tormenta que você possui. A arma dura pela cena, então se desfaz numa poça de gosma.",
  },
  {
    id: "articulacoes-flexiveis",
    name: "Articulações Flexíveis",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Você recebe +1 em Acrobacia, Furtividade e Reflexos. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.",
  },
  {
    id: "asas-insetoides",
    name: "Asas Insetoides",
    category: "tormenta",
    prerequisite: "Quatro outros poderes da Tormenta",
    description:
      "Você pode gastar 1 PM para receber deslocamento de voo 9m até o fim da rodada. O deslocamento aumenta em 1,5m para cada outro poder da Tormenta que você possui.",
  },
  {
    id: "carapaca",
    name: "Carapaça",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Sua pele é recoberta por placas quitinosas. Você recebe +1 na Defesa. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.",
  },
  {
    id: "corpo-aberrante",
    name: "Corpo Aberrante",
    category: "tormenta",
    prerequisite: "Outro poder da Tormenta",
    description:
      "Crostas vermelhas em várias partes de seu corpo tornam seus ataques mais perigosos. Seu dano desarmado aumenta em um passo, mais um passo para cada quatro outros poderes da Tormenta que você possui.",
  },
  {
    id: "dentes-afiados",
    name: "Dentes Afiados",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Você recebe uma arma natural de mordida (dano 1d4, crítico x2, corte). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.",
  },
  {
    id: "empunhadura-rubra",
    name: "Empunhadura Rubra",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Você pode gastar 1 PM para cobrir suas mãos com uma carapaça rubra. Até o final da cena, você recebe +1 em Luta. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.",
  },
  {
    id: "maos-membranosas",
    name: "Mãos Membranosas",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Você recebe +1 em Atletismo, Fortitude e testes de agarrar. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.",
  },
  {
    id: "membros-extras",
    name: "Membros Extras",
    category: "tormenta",
    prerequisite: "Quatro outros poderes da Tormenta",
    description:
      "Você possui um par de patas insetoides que saem de suas costas, ombros ou flancos. Quando usa a ação atacar, pode gastar 2 PM para fazer um ataque corpo a corpo extra com cada um (dano 1d4, crítico x2, corte). Se possuir Ambidestria ou Estilo de Duas Armas, pode empunhar armas leves em suas patas insetoides (mas ainda precisa pagar 2 PM para atacar com elas e sofre a penalidade de –2 em todos os ataques).",
  },
  {
    id: "olhos-vermelhos",
    name: "Olhos Vermelhos",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Você recebe visão no escuro e +1 em Intimidação. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.",
  },
  {
    id: "pele-corrompida",
    name: "Pele Corrompida",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Sua carne foi mesclada à matéria vermelha. Você recebe resistência a ácido, eletricidade, fogo, frio, luz e trevas 2. Esta RD aumenta em +2 para cada dois outros poderes da Tormenta que você possui.",
  },
  {
    id: "sangue-acido",
    name: "Sangue Ácido",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Quando você sofre dano por um ataque corpo a corpo, o atacante sofre 1 ponto de dano de ácido. Este dano aumenta em +1 para cada outro poder da Tormenta que você possui.",
  },
  {
    id: "visco-rubro",
    name: "Visco Rubro",
    category: "tormenta",
    prerequisite: "—",
    description:
      "Você pode gastar 1 PM para expelir um líquido escuro, grosso e corrosivo. Até o final da cena, você recebe +1 nas rolagens de dano corpo a corpo. Este bônus aumenta em +1 para cada dois outros poderes da Tormenta que você possui.",
  },
];
