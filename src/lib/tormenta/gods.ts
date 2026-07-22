// ─── TORMENTA 20 — Deuses de Arton (Capítulo 9 / Panteão) ────────────────────
// Usado pela escolha "Devoto" de Clérigos e Paladinos. Cada deus lista seu
// edito/restrição principal (Obrigações & Restrições) e os nomes dos Poderes
// Concedidos (o texto mecânico completo de cada poder concedido individual
// fica fora do escopo desta ficha — funciona como referência de regra para o
// mestre, no mesmo espírito do Guia do Mestre dos demais sistemas).

export interface God {
  id: string;
  name: string;
  title: string;
  symbol: string;
  edict: string;       // Obrigações & Restrições
  grantedPowers: string[]; // nomes dos Poderes Concedidos
  energyChannel: "Positiva" | "Negativa" | "Qualquer";
  favoredWeapon: string;
  description: string;
  paladinAllowed: boolean;
  clericAllowed: boolean;
}

export const GODS: God[] = [
  { id: "aharadak", name: "Aharadak", title: "Deus da Tormenta", symbol: "Um olho macabro de pupila vertical cercado de espinhos",
    edict: "Reverenciar a Tormenta e praticar devassidão, crueldade e loucura. Devotos abstêmios de crimes rolam 1d6 no início de cada cena de ação — em resultado ímpar, ficam fascinados na 1ª rodada.",
    grantedPowers: ["Afinidade com a Tormenta", "Percepção Temporal", "Rejeição Divina"], energyChannel: "Negativa", favoredWeapon: "Corrente de espinhos",
    description: "Deus macabro da Tormenta, cultuado pelos devotos mais depravados de Arton.", paladinAllowed: false, clericAllowed: true },
  { id: "allihanna", name: "Allihanna", title: "Deusa da Natureza", symbol: "Uma pequena árvore (ou o animal totêmico do devoto)",
    edict: "Proibida armadura ou escudo de metal (só acolchoada, couro, gibão de peles, escudo leve). Não pode descansar em comunidade maior que uma aldeia.",
    grantedPowers: ["Dedo Verde", "Descanso Natural", "Voz da Natureza"], energyChannel: "Positiva", favoredWeapon: "Bordão",
    description: "Deusa da natureza, divindade principal dos druidas, venerada também por bárbaros.", paladinAllowed: true, clericAllowed: true },
  { id: "arsenal", name: "Arsenal", title: "Deus da Guerra", symbol: "Um martelo de guerra e uma espada longa cruzados sobre um escudo",
    edict: "Proibido ser derrotado em qualquer combate ou disputa (incl. teste oposto); a derrota do próprio grupo também conta como violação.",
    grantedPowers: ["Conjurar Arma", "Coragem Total", "Sangue de Ferro"], energyChannel: "Negativa", favoredWeapon: "Martelo de guerra",
    description: "Ex-mortal que ascendeu a Deus da Guerra ao derrotar seu patrono Keenn em combate.", paladinAllowed: true, clericAllowed: true },
  { id: "azgher", name: "Azgher", title: "Deus-Sol", symbol: "Um sol dourado",
    edict: "Deve manter o rosto sempre coberto (máscara, capuz ou trapos). Deve doar 20% de qualquer tesouro obtido à igreja.",
    grantedPowers: ["Espada Solar", "Habitante do Deserto", "Inimigo de Tenebra"], energyChannel: "Positiva", favoredWeapon: "Cimitarra",
    description: "Deus-Sol venerado pelos povos do deserto, viajantes e inimigos das trevas.", paladinAllowed: true, clericAllowed: true },
  { id: "hyninn", name: "Hyninn", title: "Deus da Trapaça", symbol: "Uma adaga atravessando uma máscara, ou uma raposa",
    edict: "Não pode recusar participação em golpe/trapaça/artimanha (exceto se prejudicar companheiros); deve cometer um ato furtivo ou proibido por sessão (Enganação ou Ladinagem, CD 15 + metade do nível).",
    grantedPowers: ["Farsa do Fingidor", "Forma de Macaco", "Golpista Divino"], energyChannel: "Qualquer", favoredWeapon: "Adaga",
    description: "Deus ardiloso da trapaça, patrono de ladrões, piratas e golpistas.", paladinAllowed: false, clericAllowed: true },
  { id: "kallyadranoch", name: "Kallyadranoch", title: "Deus dos Dragões", symbol: "Escamas de cinco cores diferentes",
    edict: "Para subir de nível deve fazer oferenda em tesouro igual à metade da diferença do dinheiro inicial entre o nível atual e o próximo.",
    grantedPowers: ["Aura de Medo", "Escamas Dracônicas", "Servos do Dragão"], energyChannel: "Negativa", favoredWeapon: "Lança",
    description: "Deus dos dragões, restaurado ao Panteão após derrotar invasores aberrantes.", paladinAllowed: false, clericAllowed: true },
  { id: "khalmyr", name: "Khalmyr", title: "Deus da Justiça", symbol: "Espada sobreposta a uma balança",
    edict: "Não pode recusar pedidos de ajuda de inocentes. Deve cumprir ordens de superiores da igreja. Só pode usar itens mágicos criados por devotos do mesmo deus.",
    grantedPowers: ["Coragem Total", "Dom da Verdade", "Espada Justiceira"], energyChannel: "Positiva", favoredWeapon: "Espada longa",
    description: "Antigo líder do Panteão e Deus da Justiça, padroeiro da Ordem da Luz.", paladinAllowed: true, clericAllowed: true },
  { id: "lena", name: "Lena", title: "Deusa da Vida", symbol: "Lua crescente prateada",
    edict: "Não pode causar dano letal a criaturas vivas. Apenas mulheres podem ser clérigas de Lena (precisam ter dado à luz); paladinos podem ser de qualquer gênero.",
    grantedPowers: ["Ataque Piedoso", "Aura Restauradora", "Cura Gentil", "Curandeira Perfeita"], energyChannel: "Positiva", favoredWeapon: "Nenhuma (devotos não lançam Arma Espiritual)",
    description: "Deusa da vida e da fertilidade, servida quase só por mulheres, mas respeitada por todos.", paladinAllowed: true, clericAllowed: true },
  { id: "lin-wu", name: "Lin-Wu", title: "Deus Samurai (Deus da Honra)", symbol: "Placa de metal com a silhueta de um dragão-serpente celestial",
    edict: "Deve demonstrar comportamento honrado, jamais recorrendo a mentiras ou subterfúgios; proibido de qualquer ação que exigiria teste de Enganação, Furtividade ou Ladinagem.",
    grantedPowers: ["Coragem Total", "Kiai Divino", "Mente Vazia"], energyChannel: "Qualquer", favoredWeapon: "Katana",
    description: "Deus samurai da honra, que nunca fraquejou mesmo com a quase extinção de seu povo.", paladinAllowed: true, clericAllowed: true },
  { id: "marah", name: "Marah", title: "Deusa da Paz", symbol: "Um coração vermelho",
    edict: "Não pode causar dano nem impor condições a criaturas (exceto fascinado e pasmo). Em combate só pode proteger, curar, fugir ou se render — nunca causar violência.",
    grantedPowers: ["Aura de Paz", "Palavras de Bondade", "Talento Artístico"], energyChannel: "Positiva", favoredWeapon: "Nenhuma (devotos não lançam Arma Espiritual)",
    description: "Deusa da paz cujos devotos protegem Arton sem recorrer à violência.", paladinAllowed: true, clericAllowed: true },
  { id: "megalokk", name: "Megalokk", title: "Deus dos Monstros", symbol: "A garra de um monstro",
    edict: "Deve entregar-se à ferocidade e impaciência; proibido de ações que exijam calma/foco (preparar ação, escolher 10/20, magia sustentada) e testes de Inteligência ou Carisma (exceto Intimidação).",
    grantedPowers: ["Olhar Amedrontador", "Urro Divino", "Voz dos Monstros"], energyChannel: "Negativa", favoredWeapon: "Maça",
    description: "Deus dos monstros, irmão sanguinário de Allihanna, cujos devotos buscam o extermínio dos inimigos.", paladinAllowed: false, clericAllowed: true },
  { id: "nimb", name: "Nimb", title: "Deus do Caos", symbol: "Um dado de seis faces",
    edict: "Sem obrigações verdadeiras, mas sofre –5 em testes de perícias baseadas em Carisma e, no início de cada cena de ação, rola 1d6 — em 1, fica confuso até o fim da cena.",
    grantedPowers: ["Poder Oculto", "Sorte dos Loucos", "Transmissão da Loucura"], energyChannel: "Qualquer", favoredWeapon: "Nenhuma e todas (qualquer objeto serve)",
    description: "Insano Deus do Caos, rival eterno de Khalmyr, mais temido do que venerado.", paladinAllowed: false, clericAllowed: true },
  { id: "oceano", name: "Oceano", title: "Deus dos Mares", symbol: "Uma concha",
    edict: "Só pode usar azagaia, lança, tridente ou rede como armas; só armaduras de couro. Não pode ficar afastado do oceano por mais de uma semana.",
    grantedPowers: ["Anfíbio", "Arsenal das Profundezas", "Mestre dos Mares"], energyChannel: "Qualquer", favoredWeapon: "Tridente",
    description: "Deus sereno dos mares, hoje alienado dos conflitos do Panteão, cultuado por marinheiros.", paladinAllowed: false, clericAllowed: true },
  { id: "sszzaas", name: "Sszzaas", title: "Deus da Traição", symbol: "Uma naja vertendo veneno pelas presas",
    edict: "Deve cometer um ato de traição, intriga ou corrupção por sessão (contra aliado ou inimigo) — teste de Enganação CD 15 + metade do nível.",
    grantedPowers: ["Astúcia da Serpente", "Presas Venenosas", "Sangue Ofídico"], energyChannel: "Negativa", favoredWeapon: "Adaga",
    description: "Sibilante Deus da Traição, o mais inteligente e perigoso dos deuses.", paladinAllowed: false, clericAllowed: true },
  { id: "tanna-toh", name: "Tanna-Toh", title: "Deusa do Conhecimento", symbol: "Rolo de pergaminho e pena",
    edict: "Não pode recusar missão envolvendo busca de conhecimento; deve sempre dizer a verdade e nunca recusar responder pergunta direta; proibido esconder conhecimento.",
    grantedPowers: ["Conhecimento Enciclopédico", "Mente Analítica", "Voz da Civilização"], energyChannel: "Qualquer", favoredWeapon: "Bordão",
    description: "Deusa do conhecimento, responsável por levar educação e cultura ao Reinado.", paladinAllowed: false, clericAllowed: true },
  { id: "tenebra", name: "Tenebra", title: "Deusa das Trevas", symbol: "Estrela negra de cinco pontas",
    edict: "Proíbe que seus devotos sejam tocados por Azgher. Deve se cobrir inteiramente durante o dia, sem expor pele ao sol.",
    grantedPowers: ["Carícia Sombria", "Manto da Penumbra", "Visão nas Trevas"], energyChannel: "Negativa", favoredWeapon: "Adaga",
    description: "Deusa das trevas e mãe de criaturas noturnas e subterrâneas, rival de Azgher.", paladinAllowed: false, clericAllowed: true },
  { id: "thwor", name: "Thwor", title: "Deus dos Goblinoides", symbol: "Um grande punho fechado",
    edict: "Deve buscar expandir o modo de vida duyshidakk (goblinoide); deve buscar alianças com goblinoides e só lutar contra eles em último caso.",
    grantedPowers: ["Fúria Divina", "Olhar Amedrontador", "Tropas Duyshidakk"], energyChannel: "Qualquer", favoredWeapon: "Machado de guerra",
    description: "Ex-imperador bugbear que derrotou Ragnar e ascendeu a Deus dos Goblinoides.", paladinAllowed: false, clericAllowed: true },
  { id: "thyatis", name: "Thyatis", title: "Deus da Ressurreição e Profecia", symbol: "Uma ave fênix",
    edict: "Proibido matar seres inteligentes (Int 3+); prefere ataques ou armas não letais, jamais levando à morte.",
    grantedPowers: ["Ataque Piedoso", "Dom da Imortalidade", "Dom da Profecia", "Dom da Ressurreição"], energyChannel: "Positiva", favoredWeapon: "Espada longa",
    description: "Deus generoso do perdão e das segundas chances; concede dons de profecia e ressurreição.", paladinAllowed: true, clericAllowed: true },
  { id: "valkaria", name: "Valkaria", title: "Deusa da Ambição", symbol: "A Estátua de Valkaria ou seis faixas entrelaçadas",
    edict: "Proibido fixar moradia por mais de 2d10+10 dias na mesma cidade ou 1d4+2 meses no mesmo reino. Proibido se casar ou formar união estável.",
    grantedPowers: ["Armas da Ambição", "Coragem Total", "Liberdade Divina"], energyChannel: "Positiva", favoredWeapon: "Mangual",
    description: "Deusa da ambição, atual líder do Panteão após a ascensão de Arsenal.", paladinAllowed: true, clericAllowed: true },
  { id: "wynna", name: "Wynna", title: "Deusa da Magia", symbol: "Um anel metálico",
    edict: "Deve praticar bondade e generosidade, jamais recusando pedido de ajuda. Proibida de matar seres mágicos e conjuradores arcanos.",
    grantedPowers: ["Bênção do Mana", "Centelha Mágica", "Escudo Mágico", "Teurgista Místico"], energyChannel: "Qualquer", favoredWeapon: "Adaga",
    description: "Generosa Deusa da Magia, que nunca nega poder arcano a quem o busca.", paladinAllowed: false, clericAllowed: true },
];

export const GOD_BY_ID: Record<string, God> = Object.fromEntries(
  GODS.map((g) => [g.id, g]),
);
