import Link from "next/link";
import { notFound } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────── */

interface WikiSection {
  title: string;
  body: string;
  highlight?: string; // pull-quote / callout text
}

interface SystemData {
  name: string;
  tagline: string;
  orbColor: string;
  accentColor: string;
  lore: string;           // short teaser (used on placeholder pages)
  ctaHref: string;
  wiki?: {                // full wiki content (D&D has this; others → placeholder)
    intro: string;
    sections: WikiSection[];
    quickFacts: { label: string; value: string }[];
  };
}

/* ─── Content ────────────────────────────────────────────── */

const SYSTEMS: Record<string, SystemData> = {
  dnd: {
    name: "Dungeons & Dragons",
    tagline: "O RPG de fantasia mais influente da história",
    orbColor: "rgba(201,148,31,0.22)",
    accentColor: "#c9941f",
    ctaHref: "/dashboard/dnd",
    lore: "Em terras onde dragões voam sobre montanhas nevadas e magos travam batalhas cósmicas, heróis comuns forjam lendas com aço, magia e coragem.",
    wiki: {
      intro:
        "Dungeons & Dragons — ou simplesmente D&D — é o jogo de RPG de mesa mais famoso e influente do mundo. Criado em 1974 por Gary Gygax e Dave Arneson, ele estabeleceu as bases de praticamente todo jogo de fantasia que veio depois: videogames, filmes, séries, romances. Mais de 50 anos depois, D&D continua vivo, reinventado e jogado por milhões de pessoas ao redor do planeta.",
      quickFacts: [
        { label: "Criado por",       value: "Gary Gygax & Dave Arneson" },
        { label: "Ano de criação",   value: "1974" },
        { label: "Edição atual",     value: "5ª Edição (2014 / revisada 2024)" },
        { label: "Publicado por",    value: "Wizards of the Coast" },
        { label: "Gênero",          value: "Fantasia épica" },
        { label: "Dado principal",   value: "d20 (icosaedro de 20 faces)" },
        { label: "Jogadores",        value: "3 a 6 + Mestre (DM)" },
      ],
      sections: [
        {
          title: "O que é um RPG de mesa?",
          body:
            "Em D&D, um grupo de jogadores — geralmente de 3 a 6 pessoas — cria personagens e vive aventuras em um mundo de fantasia narrado pelo Dungeon Master (DM). O DM é o árbitro e narrador da história: descreve o ambiente, controla os vilões, decide o que acontece. Os jogadores decidem o que seus personagens fazem, e os dados determinam o sucesso ou fracasso das ações.\n\nNão há tabuleiro fixo, não há regras rígidas de \"vencer\". O objetivo é contar uma história juntos — e se divertir no caminho.",
          highlight:
            "\"Você não joga para ganhar. Você joga para descobrir o que acontece com o seu personagem.\"",
        },
        {
          title: "O Universo: Mundos Infinitos",
          body:
            "D&D não tem um único universo. Ao longo das décadas, Wizards of the Coast e a comunidade criaram dezenas de cenários (settings), cada um com sua própria história, geografias e regras temáticas:\n\n• Forgotten Realms — O cenário mais popular. Lar de Baldur's Gate, Neverwinter e do famoso ranger Drizzt Do'Urden. Um mundo medieval de fantasia clássica, cheio de magia, impérios em conflito e masmorras antigas.\n\n• Eberron — Fantasia noir com elementos steampunk. Magia industrializada, trens movidos por encantamentos, agências de detetives e uma guerra continental recém-encerrada.\n\n• Ravenloft — Horror gótico. Lordes das trevas govem domínios isolados por névoa. Vampiros, lichs e monstros clássicos num cenário inspirado em Drácula e Frankenstein.\n\n• Spelljammer — Ficção científica + fantasia. Naves movidas a magia navegam o espaço entre os planos. Piratas espaciais e lulas gigantes.\n\n• Critical Role: Exandria — Cenário criado pelo famoso podcast/stream de D&D, hoje um dos mais jogados do mundo.\n\nAlém disso, qualquer Mestre pode criar seu próprio mundo do zero — e muitos o fazem.",
        },
        {
          title: "Temática: Heróis, Vilões e Escolhas Morais",
          body:
            "No núcleo de D&D está a ideia de heroísmo — mas não ingênuo. Personagens começam fracos, crescem ao longo de campanhas (histórias longas divididas em sessões) e enfrentam desafios crescentes: ladrões locais, cultos sombrios, dragões ancientes, entidades divinas.\n\nO sistema de Alinhamento classifica personagens em um eixo moral (Bem / Neutro / Mal) e um eixo ético (Leal / Neutro / Caótico), gerando 9 combinações. Um paladino Leal e Bom age diferente de um ladino Caótico e Neutro — e isso cria conflito interessante dentro do próprio grupo.\n\nCampanhas famosas como Curse of Strahd, Descent into Avernus e Baldur's Gate 3 exploram dilemas morais genuínos: salvar um vilão que foi uma vítima? Destruir um artefato que poderia salvar a cidade mas corromper o usuário? Essas escolhas definem D&D como narrativa, não só como combate.",
          highlight:
            "D&D é o único jogo onde o 'lado do mal' pode ser o seu grupo — e ainda assim a campanha é épica.",
        },
        {
          title: "Como Funciona: Mecânicas Básicas",
          body:
            "O sistema gira em torno do d20 — um dado de 20 faces. Quando um personagem tenta algo com risco de falha, o jogador rola o d20, adiciona modificadores (força, destreza, magia etc.) e compara ao número-alvo definido pelo DM.\n\n• Classes — Definem o papel do personagem: Guerreiro (combate direto), Mago (magia arcana), Ladino (furtividade e golpes), Clérigo (cura e magia divina), Druida, Bárbaro, Paladino, Ranger, Bardo, Feiticeiro, Bruxo, Monge e Artífice, entre outros. Cada classe tem subclasses que especializam ainda mais o estilo.\n\n• Raças — Elfos, Anões, Humanos, Halflings, Meio-Orcs, Tieflings, Draconatos e dezenas de outras raças, cada uma com traços únicos.\n\n• Nível — Personagens sobem de nível 1 a 20. Cada nível traz novas habilidades, pontos de vida e poder. Uma campanha típica vai do nível 1 ao 10-15.\n\n• Pontos de Vida & Morte — Quando os PV chegam a zero, o personagem cai inconsciente. Se cair três vezes em falhas de \"morte\", morre permanentemente.\n\n• Combate por turnos — Em batalha, cada criatura age uma vez por rodada. O DM gerencia posicionamento, iniciativa e consequências.",
        },
        {
          title: "A 5ª Edição: Por que é tão popular?",
          body:
            "Lançada em 2014, a 5ª Edição (5e) simplificou décadas de regras acumuladas sem perder profundidade. O resultado foi uma explosão de popularidade impulsionada pelo podcast Critical Role — onde atores dubladores jogam D&D ao vivo e geram milhões de visualizações — e pelo isolamento social de 2020, que levou milhões de novos jogadores ao RPG de mesa online.\n\nEm 2024, a Wizards lançou o D&D 2024 (\"One D&D\"), uma revisão retrocompatível com a 5e que atualiza classes, raças e regras de magia — mantendo a acessibilidade que tornou a edição famosa.\n\nO jogo hoje tem apps, plataformas digitais (D&D Beyond, Roll20, Foundry VTT), jogos eletrônicos (Baldur's Gate 3, ganhou Game of the Year 2023) e uma série de animação (Honor Among Thieves, 2023).",
          highlight:
            "Baldur's Gate 3 (2023), diretamente baseado em D&D 5e, vendeu mais de 10 milhões de cópias e ganhou o GOTY.",
        },
        {
          title: "Por que jogar D&D?",
          body:
            "D&D desenvolve criatividade, trabalho em equipe, improvisação e raciocínio estratégico — tudo disfarçado de diversão. É um hobby social que funciona tanto para grupos de amigos quanto para famílias.\n\nPara iniciantes: a 5e tem o D&D Starter Set e o pacote gratuito Básico, além da aventura online gratuita \"Lost Mine of Phandelver\" — considerada a melhor entrada no sistema. Em 30 minutos dá para criar um personagem e começar a jogar.\n\nNo RPG Lab, a ficha digital de D&D 5e cuida dos cálculos chatos — modificadores, proficiências, espaços de magia — para você focar no que importa: a história.",
        },
      ],
    },
  },
  cthulhu: {
    name: "Call of Cthulhu",
    tagline: "Horror cósmico, investigação e a beira da loucura",
    orbColor: "rgba(107,122,58,0.22)",
    accentColor: "#6b7a3a",
    ctaHref: "/dashboard/cthulhu",
    lore: "Os livros proibidos sussurram verdades que a mente humana não foi feita para suportar. Nas cidades costeiras, pescadores desaparecem. Nos manicômios, os sobreviventes desenham os mesmos símbolos.",
    wiki: {
      intro:
        "Call of Cthulhu é o RPG de horror e investigação mais aclamado da história. Publicado pela Chaosium desde 1981 e baseado nas obras de H.P. Lovecraft, o jogo coloca os jogadores no papel de investigadores comuns que descobrem — sempre a um custo terrível — que o universo é habitado por entidades antigas, indiferentes e imensamente mais poderosas do que a humanidade jamais imaginou. Não é um jogo sobre heróis. É sobre mortais tentando sobreviver ao contato com o inominável.",
      quickFacts: [
        { label: "Criado por",      value: "Sandy Petersen" },
        { label: "Baseado em",      value: "H.P. Lovecraft (Mythos)" },
        { label: "Ano de criação",  value: "1981" },
        { label: "Edição atual",    value: "7ª Edição (2014)" },
        { label: "Publicado por",   value: "Chaosium" },
        { label: "Gênero",         value: "Horror cósmico / investigação" },
        { label: "Dado principal",  value: "d100 (percentual)" },
        { label: "Jogadores",       value: "2 a 5 + Guardião" },
      ],
      sections: [
        {
          title: "O que é um RPG de mesa?",
          body:
            "Em Call of Cthulhu, um grupo de jogadores — geralmente de 2 a 5 pessoas — interpreta investigadores que enfrentam mistérios sobrenaturais narrados pelo Guardião (Keeper of Arcane Lore). O Guardião descreve cenas, controla NPCs e árbitro das regras. Os jogadores decidem como seus personagens investigam, interagem e reagem ao horror que encontram.\n\nDiferente de outros RPGs, aqui não há \"vencer\" no sentido tradicional. O sucesso é sobreviver, preservar a sanidade e, talvez, impedir que algo terrível aconteça — sabendo que, no fim, as forças em jogo são incompreensivelmente maiores do que qualquer investigador.",
          highlight:
            "\"Os personagens mais poderosos de Call of Cthulhu ainda são apenas humanos. E humanos quebram.\"",
        },
        {
          title: "O Universo: Os Mitos de Cthulhu",
          body:
            "O cenário de Call of Cthulhu é baseado nos Mitos de Cthulhu — o conjunto de histórias de horror cósmico escrito por H.P. Lovecraft entre os anos 1920 e 1930, expandido por autores como August Derleth, Clark Ashton Smith e Robert E. Howard.\n\nNo centro dos Mitos está uma ideia perturbadora: a humanidade não é especial. O universo é vasto, indiferente e habitado por entidades tão antigas e poderosas que sequer percebem nossa existência. Alguns exemplos:\n\n• Cthulhu — Uma entidade dormente nas profundezas do oceano Pacífico, na cidade submersa de R'lyeh. Seus sonhos influenciam mentes sensíveis ao redor do mundo. Sua forma: humanoide colossal com tentáculos no rosto e asas de morcego. Sua escala: maior que arranha-céus.\n\n• Nyarlathotep — O Mensageiro dos Deuses Exteriores. Diferente dos outros, ele interage com humanos — mas apenas para corromper, manipular e destruir. Assume mil formas.\n\n• Azathoth — O Caos Cego e Idiota. O deus supremo dos Mitos. Uma massa borbulhante no centro do universo, sem consciência ou propósito. A existência inteira é apenas um sonho de algo que não sabe que sonha.\n\n• Shub-Niggurath — A Cabra Negra dos Bosques com Mil Filhotes. Fertilidade e horror biológico. Seus cultistas praticam rituais que produzem criaturas chamadas Filhos Negros.\n\nAlém dessas entidades, os Mitos incluem raças alienígenas que habitaram a Terra muito antes dos humanos: os Mi-Go (fungos inteligentes de Plutão), os Profundos (seres aquáticos semi-humanos que não morrem de velhice) e os Grandes Antigos adormecidos em cidades subterrâneas e submarinas.",
        },
        {
          title: "Ambientação: Os Anos 1920 e Além",
          body:
            "A ambientação padrão de Call of Cthulhu são os anos 1920 — a Era do Jazz nos Estados Unidos. É um período de contradições perfeito para horror: prosperidade superficial e tensão social profunda, ciência avançando mas superstição ainda presente, comunicação lenta o suficiente para que segredos se mantenham por décadas.\n\nOs investigadores típicos são jornalistas, professores, médicos, detetives particulares, antiquários e escritores — pessoas com acesso a informações e recursos, mas sem poder sobrenatural. Eles investigam casos que a polícia descarta: desaparecimentos em cidades costeiras, cultos em mansões antigas, artefatos que enlouquecem quem os toca.\n\nMas o sistema suporta outras épocas:\n\n• Gaslight (Era Vitoriana, 1890s) — Londres nebulosa, Jack o Estripador, espíritas e ocultistas de verdade.\n\n• Segunda Guerra Mundial (Achtung! Cthulhu) — Agentes aliados descobrem que o projeto secreto de Hitler envolve entidades que não deveriam existir.\n\n• Moderno (Delta Green) — Agentes governamentais contemporâneos combatem ameaças paranormais e tentam esconder a verdade do público.\n\n• Masks of Nyarlathotep — A campanha mais famosa de qualquer RPG: uma investigação global nos anos 1920 que leva do Peru ao Egito, da Inglaterra à China e à Austrália.",
          highlight:
            "Masks of Nyarlathotep, publicada em 1984, é frequentemente citada como a melhor campanha já escrita para qualquer sistema de RPG.",
        },
        {
          title: "Temática: O Horror que Está Além da Compreensão",
          body:
            "Call of Cthulhu não é sobre monstros que você mata. É sobre o momento em que você percebe que o monstro nem sabe que você existe — e isso, de alguma forma, é mais aterrorizante.\n\nO horror lovecraftiano tem características específicas que o diferenciam do horror convencional:\n\n• Indiferença cósmica — As entidades não são malignas da forma que entendemos. Elas simplesmente existem em uma escala onde humanos não são relevantes. Não há negociação, não há apelo à misericórdia.\n\n• Conhecimento como maldição — Aprender sobre os Mitos aumenta o poder do personagem, mas corrói sua sanidade. Quanto mais você sabe, mais perigoso você é — e mais próximo do colapso mental.\n\n• Cultos humanos — Muitas vezes, o verdadeiro vilão é um ser humano que escolheu servir às entidades em troca de poder. Pessoas comuns que cruzaram uma linha e não voltaram.\n\n• A investigação como tragédia — Mesmo quando os investigadores \"vencem\" — fecham o portal, destroem o culto, sobrevivem — o mundo continua igual. Os Grandes Antigos ainda existem. A próxima abertura está apenas adiada.",
        },
        {
          title: "Como Funciona: Mecânicas da 7ª Edição",
          body:
            "Call of Cthulhu usa um sistema percentual (d100): cada perícia tem um valor de 0 a 100, e o jogador precisa rolar igual ou abaixo desse valor para ter sucesso. Simples, intuitivo e brutal na hora em que importa.\n\n• Perícias — São o coração do jogo. Biblioteca (pesquisa), Medicina, Psicologia, Furtividade, Tiro, Mito de Cthulhu, Artes Marciais, Direção, Percepção e dezenas de outras. Definir bem as perícias do seu investigador define como ele aborda os problemas.\n\n• Sanidade — O recurso mais precioso. Investigadores começam com Sanidade entre 40 e 99. Cada encontro com o sobrenatural causa perda de SAN. Quando chega a zero, o personagem enlouquece permanentemente. Traumas temporários (fobia, delírio) ocorrem ao longo do caminho.\n\n• Rolagens com Sucesso Extremo/Difícil — A 7ª edição introduziu graus de sucesso: uma rolagem em metade do valor da perícia é Difícil; em um quinto, é Extremo. Esses graus determinam a qualidade do resultado.\n\n• Empurrar Rolagens — Se falhar numa rolagem, pode tentar de novo — mas as consequências de uma segunda falha são piores.\n\n• Combate como último recurso — Lutar contra cultistas é perigoso. Lutar contra criaturas dos Mitos é suicida. A maioria dos encontros com entidades termina em fuga, loucura ou morte.",
        },
        {
          title: "Por que jogar Call of Cthulhu?",
          body:
            "Call of Cthulhu oferece algo raro em jogos: consequências reais. Personagens morrem. Personagens enlouquecem. Vitórias são parciais e têm custo. Isso cria tensão genuína que outros sistemas raramente alcançam.\n\nPara grupos que gostam de narrativa, investigação e roleplay — mais do que combate e progressão de poder — CoC é insubstituível. Não há nível 20. Não há poderes que transformem seu investigador em um semideus. Há apenas pessoas tentando entender um mundo que não foi feito para ser entendido.\n\nA 7ª Edição é considerada a mais acessível da história do sistema, com regras simplificadas e apoio visual extenso. E o catálogo de aventuras publicadas é imenso: desde mistérios em uma sessão até campanhas de um ano como Horror em Dunwich ou Masks of Nyarlathotep.\n\nNo RPG Lab, a ficha digital de Call of Cthulhu cuida das perícias percentuais, cálculos de Sanidade, Sorte e Pontos de Vida — para que você pense apenas em como seu investigador vai sobreviver à próxima sessão.",
          highlight:
            "Call of Cthulhu é o segundo RPG de mesa mais vendido da história, atrás apenas de Dungeons & Dragons.",
        },
      ],
    },
  },
  ordem: {
    name: "Ordem Paranormal",
    tagline: "Agentes contra o que não pode ser explicado",
    orbColor: "rgba(255,255,255,0.16)",
    accentColor: "#ffffff",
    ctaHref: "/dashboard/ordem",
    lore: "Por trás do véu do cotidiano, criaturas do Outro Lado observam, aguardam e infiltram. A Ordem existe para conter o que não pode ser explicado.",
    wiki: {
      intro:
        "Ordem Paranormal é um sistema de RPG brasileiro de horror contemporâneo criado por Rafael Lange — conhecido como Cellbit — em parceria com a Combustível Criativo. Nasceu em 2020 de uma campanha de RPG transmitida ao vivo no Twitch que conquistou milhões de espectadores, e em 2022 ganhou seu próprio livro de regras completo. É investigação, horror psicológico e ação em um Brasil moderno onde o sobrenatural está sempre um passo atrás da realidade.",
      quickFacts: [
        { label: "Criado por",      value: "Rafael Lange (Cellbit)" },
        { label: "Estúdio",         value: "Combustível Criativo" },
        { label: "Ano",             value: "2020 (stream) / 2022 (livro)" },
        { label: "Versão atual",    value: "1.3" },
        { label: "Gênero",         value: "Horror contemporâneo / investigação" },
        { label: "Ambientação",     value: "Brasil contemporâneo" },
        { label: "Dado principal",  value: "d20" },
        { label: "Jogadores",       value: "2 a 5 + Mestre" },
        { label: "Idioma original", value: "Português (BR)" },
      ],
      sections: [
        {
          title: "O que é um RPG de mesa?",
          body:
            "Em Ordem Paranormal, um grupo de jogadores — geralmente de 2 a 5 pessoas — interpreta agentes de uma organização secreta que investiga e combate ameaças do Outro Lado, narradas pelo Mestre. O Mestre descreve cenas, controla NPCs e arbitra as regras. Os jogadores decidem como seus agentes investigam, confrontam e sobrevivem ao que encontram.\n\nO sistema equilibra investigação, roleplay e combate — mas o horror psicológico está sempre presente. Personagens não são super-heróis: são pessoas com traumas, limites e uma Sanidade que vai sendo corroída a cada missão.",
          highlight:
            "\"Ordem Paranormal nasceu numa live de RPG e virou um fenômeno. Hoje é um dos sistemas mais jogados do Brasil, com uma comunidade enorme de fãs e narradores.\"",
        },
        {
          title: "O Mundo: O Brasil por Trás do Véu",
          body:
            "A ambientação de Ordem Paranormal é o Brasil contemporâneo — mas com uma camada escondida. Por trás do cotidiano normal, existe o Outro Lado: uma dimensão paralela habitada por entidades, criaturas e forças que vazam para o mundo real em locais de fraqueza conhecidos como Brechas.\n\nEssas Brechas podem abrir em qualquer lugar: uma escola abandonada no interior, uma mansão histórica em São Paulo, um hospital psiquiátrico no Rio de Janeiro, uma floresta na Amazônia. O Outro Lado não escolhe lugares dramáticos por estética — ele aparece onde a realidade ficou fina.\n\nA maioria das pessoas não sabe que o Outro Lado existe. Quem testemunha algo sobrenatural ou é descreditado ou desaparece. A Ordem Paranormal existe exatamente para manter esse véu intacto: investigar incidentes, neutralizar ameaças e garantir que nenhuma evidência chegue ao público.",
        },
        {
          title: "A Ordem Paranormal: A Organização",
          body:
            "A Ordem Paranormal é uma organização secreta de alcance global, com raízes no Brasil. Fundada décadas atrás após um incidente catastrófico que quase expôs o Outro Lado ao mundo, ela recruta pessoas que já tiveram contato com o sobrenatural — porque essas pessoas são as únicas que acreditam no que enfrentam.\n\nA estrutura interna da Ordem é compartimentada: agentes de campo raramente sabem o que acontece nos níveis acima deles. Há laboratórios de pesquisa, arquivos de ocorrências, especialistas em rituais antigos e uma burocracia que às vezes parece mais preocupada com relatórios do que com salvar vidas.\n\nEsses conflitos internos são intencionais no design do sistema: nem todos dentro da Ordem têm boas intenções. Alguns acreditam que certas entidades podem ser controladas. Outros querem poder para si. A linha entre proteger a humanidade e explorar o Outro Lado é mais tênue do que parece.",
          highlight:
            "Agentes da Ordem sabem mais do que qualquer humano deveria saber. Esse conhecimento tem um preço — e ele é pago em Sanidade.",
        },
        {
          title: "Temática: Horror, Trauma e Humanidade",
          body:
            "Ordem Paranormal trabalha com horror psicológico mais do que com monstros físicos. As ameaças mais perturbadoras não são as criaturas do Outro Lado — são as consequências de conviver com elas.\n\nO sistema tem um foco explícito em trauma: personagens carregam Cicatrizes Psicológicas acumuladas ao longo das missões. Testemunhar algo impossível, perder um colega, ser possuído por um instante — tudo isso deixa marcas que afetam o personagem mecanicamente e narrativamente.\n\nAo mesmo tempo, Ordem Paranormal celebra laços humanos. A relação entre os membros do grupo — chamados de Equipe — é central. O sistema incentiva histórias de personagem, vínculos entre agentes e momentos de alívio entre o horror. É um jogo sobre o que nos mantém humanos quando o mundo ao redor deixa de fazer sentido.\n\nA ambientação brasileira também é usada intencionalmente: folclore nacional, lendas urbanas locais, desigualdade social como pano de fundo, e locais reais ou inspirados em reais criam uma proximidade que cenários genéricos de fantasia não alcançam.",
        },
        {
          title: "Como Funciona: Mecânicas do Sistema",
          body:
            "Ordem Paranormal usa d20 como dado principal, com um sistema próprio desenvolvido pela Combustível Criativo — distinto de D&D, apesar do dado compartilhado.\n\n• Atributos — Seis atributos base: Força, Agilidade, Intelecto, Presença, Vigor e Poder Paranormal. Cada um alimenta perícias e ações específicas.\n\n• Perícias — Divididas por atributo. Investigação, Medicina, Tecnologia, Furtividade, Combate, Ocultismo entre outras. Personagens escolhem especializações que definem seu papel na equipe.\n\n• Poder Paranormal — Agentes que tiveram contato profundo com o Outro Lado podem desenvolver habilidades sobrenaturais — mas usá-las tem custo em Sanidade. Poder paranormal e estabilidade mental são inversamente proporcionais.\n\n• Sanidade — Recurso central. Cai ao enfrentar o sobrenatural, ao usar poderes e ao sofrer traumas. Quando chega a zero, o personagem desenvolve uma Cicatriz Permanente ou, em casos extremos, é retirado de campo.\n\n• NEX (Nível de Exposição ao Outro Lado) — O equivalente ao nível de personagem. Quanto maior o NEX, mais poderes disponíveis — e mais o Outro Lado conhece e tem interesse no agente.\n\n• Rituais — Magias e rituais do Outro Lado que podem ser aprendidos e usados, com custos variados em Esforço e Sanidade.",
        },
        {
          title: "Por que jogar Ordem Paranormal?",
          body:
            "Ordem Paranormal é uma das experiências mais únicas do RPG nacional: horror contemporâneo em português, ambientado no Brasil, com mecânicas desenvolvidas especificamente para suportar narrativas de investigação e trauma.\n\nA comunidade em torno do sistema é enorme — impulsionada pelas campanhas transmitidas ao vivo por Cellbit e outros criadores — e isso significa abundância de material de referência, aventuras criadas por fãs, podcasts de mesa e grupos de jogo por todo o país.\n\nPara grupos que preferem investigação e horror a combate e progressão de poder épico, que querem uma ambientação reconhecível (o Brasil) em vez de um mundo genérico de fantasia, e que gostam de personagens com profundidade psicológica, Ordem Paranormal é a escolha certa.\n\nNo RPG Lab, a ficha digital de Ordem Paranormal gerencia atributos, perícias, NEX, Sanidade e poderes paranormais — para que a equipe foque no que importa: descobrir o que está por trás da Brecha antes que seja tarde demais.",
          highlight:
            "A campanha original de Ordem Paranormal no Twitch acumulou mais de 100 milhões de visualizações — um dos maiores fenômenos de RPG ao vivo do mundo.",
        },
      ],
    },
  },
  tormenta: {
    name: "Tormenta 20",
    tagline: "A fantasia épica brasileira — heróis contra o apocalipse",
    orbColor: "rgba(160,24,24,0.22)",
    accentColor: "#a01818",
    ctaHref: "/dashboard",
    lore: "Uma tempestade de energia caótica avança sobre Arton, devorando terras, transformando bestas e corrompendo almas. Heróis de todas as raças unem forças contra o inevitável.",
    wiki: {
      intro:
        "Tormenta 20 é o maior e mais querido sistema de RPG criado no Brasil. Publicado pela Jambô Editora, o universo de Arton existe desde 1999 — nasceu como cenário oficial do RPG, cresceu em romances, HQs e suplementos, e em 2020 ganhou sua edição definitiva: o T20, desenvolvido para comemorar duas décadas de aventuras. É fantasia épica com alma brasileira: deuses mesquinhos, heróis improváveis e uma tempestade que quer engolir o mundo.",
      quickFacts: [
        { label: "Criado por",      value: "Marcelo Cassaro, Rogério Saladino, J.M. Trevisan" },
        { label: "Universo desde",  value: "1999" },
        { label: "Edição T20",      value: "2020 (20º aniversário)" },
        { label: "Publicado por",   value: "Jambô Editora" },
        { label: "Gênero",         value: "Fantasia épica brasileira" },
        { label: "Dado principal",  value: "d20" },
        { label: "Jogadores",       value: "3 a 6 + Narrador" },
        { label: "Mundo",           value: "Arton" },
      ],
      sections: [
        {
          title: "O que é um RPG de mesa?",
          body:
            "Em Tormenta 20, um grupo de jogadores — geralmente de 3 a 6 pessoas — cria personagens e vive aventuras no mundo de Arton, narradas pelo Narrador (equivalente ao Mestre em outros sistemas). O Narrador descreve o cenário, controla os inimigos e árbitro das regras. Os jogadores decidem o que seus personagens fazem, e os dados determinam o sucesso ou fracasso.\n\nNão há tabuleiro fixo nem objetivo de \"vencer\". O propósito é construir uma história coletiva — épica, tensa, engraçada ou trágica, dependendo do grupo.",
          highlight:
            "\"Arton não é um cenário de fantasia europeia traduzida. É um mundo criado por brasileiros, para brasileiros — com toda a criatividade e irreverência que isso implica.\"",
        },
        {
          title: "O Mundo: Arton",
          body:
            "Arton é um continente de fantasia épica com séculos de história detalhada. Não é uma cópia da Europa medieval — é um mundo próprio, com nações únicas, culturas distintas e uma geografia que mistura florestas sombrias, desertos amaldiçoados, cidades-estado em conflito e ruínas de civilizações extintas.\n\nAlgumas das nações mais icônicas:\n\n• Reinado — A grande federação humana no centro do continente. Politicamente fragmentada, culturalmente rica. Lar da maioria dos aventureiros iniciantes.\n\n• Vectora — Estado teocrático governado por clérigos de Valkaria, deusa da batalha. Militarista, disciplinado e poderoso.\n\n• Aslothia — Terra dos elfos das sombras. Misteriosa, isolada e com segredos que remontam à fundação do mundo.\n\n• Tapista — Pântanos governados por uma poderosa feiticeira. Magia proibida, mortos-vivos e acordos perigosos.\n\n• Lamnor — Reino dos anões nas montanhas. Forjas eternas, rancores geracionais e ouro suficiente para comprar um reino.\n\nAlém disso, Arton tem planos de existência próprios: o Limbo caótico, o Paraíso dos deuses bondosos, o Inferno e os domínios de entidades que desafiam qualquer categorização simples.",
        },
        {
          title: "A Tormenta: O Apocalipse que Nunca Para",
          body:
            "No horizonte de Arton existe algo que nenhum exército conseguiu deter: a Tormenta. Uma massa de energia caótica de cor escarlate que avança lentamente pelo continente, devorando territórios, corrompendo criaturas e transformando tudo que toca em algo irreconhecível — e letal.\n\nA Tormenta não é controlada por nenhum vilão com plano maquiavélico. Ela simplesmente existe, cresce e consome. Criaturas tocadas por ela — os Tormenta-kin — são bestas transformadas, mais ferozes e poderosas que suas versões originais. Heróis que se aventuram nas bordas da Tormenta correm risco não apenas de morte, mas de corrupção.\n\nEssa ameaça constante e sem solução simples define o tom de Arton: é um mundo em estado permanente de crise existencial. As pessoas ainda vivem, amam, brigam por poder e contam piadas — mas todos sabem que, em algum lugar, a Tormenta avança.",
          highlight:
            "A Tormenta não tem um rei. Não tem uma fraqueza oculta. Ela é simplesmente o fim, chegando devagar — e cabe aos heróis decidirem o que fazer diante disso.",
        },
        {
          title: "Temática: Deuses Mesquinhos, Heróis Improváveis",
          body:
            "Tormenta 20 tem um humor característico que o diferencia de outros sistemas. Os deuses de Arton são poderosos — e completamente disfuncionais. Valkaria quer guerra constante. Thyatis, deusa do amor, é mais caprichosa que bondosa. Megalokk, deus dos orcs, cobra lealdade absoluta. Eles interferem ativamente no mundo, brigam entre si e usam os mortais como peões.\n\nOs heróis, por sua vez, raramente são escolhidos pelo destino. Na maioria das campanhas, são pessoas comuns — aventureiros por necessidade, acidente ou tédio — que se veem envolvidas em conflitos maiores do que esperavam. O sistema encoraja personagens com falhas reais, motivações pessoais e arcos de crescimento.\n\nO tom pode variar enormemente: campanhas de intriga política em Vectora, exploração de masmorras no Reinado, horror cósmico nas bordas da Tormenta, ou comédia de equívocos em Tapista. Arton suporta tudo isso simultaneamente.",
        },
        {
          title: "Como Funciona: Mecânicas do T20",
          body:
            "O sistema T20 usa o d20 como dado principal — lança-se o dado, adicionam-se bônus e compara-se a uma Dificuldade determinada pelo Narrador. Simples na base, profundo nas combinações.\n\n• Classes — T20 tem 20 classes jogáveis, incluindo Guerreiro, Mago, Clérigo, Ladino, Druida, Paladino, Bárbaro, Bardo, Arcanista, Inventor, Nobre e mais. Cada uma com poderes únicos e caminhos de especialização.\n\n• Raças — Humanos, Elfos, Anões, Halflings, Meio-Elfos, Meio-Orcs, Goblinoides, Qareen (genies humanoides), Minotauros, Sereias e dezenas de outras opções — muitas únicas de Arton.\n\n• Atributos — Os 6 atributos clássicos (Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma) funcionam como bônus que se somam às rolagens.\n\n• Pontos de Magia — Em vez de espaços de magia fixos, conjuradores gastam Pontos de Magia (PM) para lançar magias, criando gestão de recursos mais fluida.\n\n• Divindades — Personagens clérigos e paladinos escolhem uma divindade de Arton, que concede poderes e impõe obrigações. A relação com o deus importa mecanicamente.\n\n• Progressão — Personagens sobem de nível 1 a 20. Cada nível traz novos poderes, atributos e opções. Uma campanha típica vai do nível 1 ao 10.",
        },
        {
          title: "Por que jogar Tormenta 20?",
          body:
            "Tormenta 20 é a escolha natural para quem quer um RPG completo em português, com suporte nativo e uma comunidade brasileira enorme. Não é uma tradução — é um sistema construído do zero para o público nacional, com suplementos, aventuras, podcasts e eventos no Brasil.\n\nO universo de Arton tem décadas de história acumulada em romances, HQs e campanhas publicadas — mas é completamente acessível para novos jogadores, pois o livro-base é autossuficiente.\n\nPara grupos que preferem humor junto com épica, personagens com personalidade forte e um mundo que parece vivo e imperfeito (não um cenário genérico de fantasia), Tormenta 20 é a melhor opção disponível.\n\nNo RPG Lab, a ficha digital de T20 (em desenvolvimento) vai automatizar modificadores, poderes de classe, pontos de magia e divindades — deixando o grupo livre para se concentrar em salvar — ou destruir — Arton.",
          highlight:
            "Tormenta 20 vendeu mais de 30 mil cópias no lançamento de 2020, quebrando recordes de crowdfunding de RPG no Brasil.",
        },
      ],
    },
  },
  starwars: {
    name: "Star Wars: Além da Fronteira",
    tagline: "Uma galáxia onde Anakin nunca existiu, nas Regiões Desconhecidas",
    orbColor: "rgba(59,130,196,0.22)",
    accentColor: "#3b82c4",
    ctaHref: "/dashboard/starwars",
    lore: "Numa linha do tempo alternativa, sem a Guerra dos Clones que conhecemos, um grupo de exploradores parte rumo às Regiões Desconhecidas — território não mapeado, perigoso e cheio de possibilidades.",
    wiki: {
      intro:
        "Star Wars: Além da Fronteira é um sistema de RPG de mesa autoral, criado do zero para esta plataforma. Não é um produto oficial da Lucasfilm — é uma reinterpretação mecânica e narrativa do universo Star Wars, inspirada na estrutura de Ordem Paranormal, ambientada numa linha do tempo alternativa onde Anakin Skywalker nunca existiu e o foco narrativo é a exploração das Regiões Desconhecidas, com uma pegada estilo Star Trek.",
      quickFacts: [
        { label: "Tipo",              value: "Sistema autoral, criado nesta plataforma" },
        { label: "Inspiração",        value: "Ordem Paranormal (estrutura) + universo Star Wars" },
        { label: "Ambientação",       value: "Linha do tempo alternativa — Regiões Desconhecidas" },
        { label: "Atributos",         value: "6 — Agilidade, Inteligência, Força, Vigor, Presença, Sensitividade" },
        { label: "Perícias",          value: "25, cada uma ligada a 1-2 atributos" },
        { label: "Espécies",          value: "35 jogáveis" },
        { label: "Planetas",          value: "28 planetas de origem" },
        { label: "Classes",           value: "25 (20 comuns + 3 de Caminho + 2 de Profecia)" },
        { label: "Progressão",        value: "Nível 1 a 99" },
      ],
      sections: [
        {
          title: "O que é este sistema?",
          body:
            "Diferente dos outros sistemas do laboratório, Star Wars: Além da Fronteira não é baseado em um livro publicado — foi desenhado peça por peça: atributos, perícias, espécies, planetas, classes, habilidades de combate, Formas de Sabre de Luz, Pontos de Poder e regras de progressão. Tudo pensado para funcionar como um sistema jogável de verdade, com números que se sustentam entre si e uma identidade própria dentro do universo Star Wars.",
          highlight:
            "Nenhuma classe, forma de combate ou espécie foi copiada de outro sistema — tudo aqui foi balanceado do zero.",
        },
        {
          title: "A Premissa: Anakin nunca existiu",
          body:
            "A campanha padrão para este sistema parte de uma pergunta simples: e se Anakin Skywalker nunca tivesse nascido? Sem ele, não há Darth Vader, a Guerra dos Clones se desenrola de forma diferente, e o equilíbrio de poder na galáxia muda de maneiras imprevisíveis.\n\nCom esse ponto de divergência estabelecido, o foco da campanha se volta pra fora do conflito Jedi/Sith que domina a mídia oficial: um grupo de exploradores parte rumo às Regiões Desconhecidas — a fronteira não mapeada da galáxia — numa jornada de descoberta que lembra mais Star Trek do que uma guerra de sabres de luz.",
        },
        {
          title: "Atributos e Perícias",
          body:
            "O sistema usa 6 atributos: Agilidade, Inteligência, Força, Vigor, Presença e Sensitividade (afinidade com a Força). Na criação, o jogador distribui 7 pontos livremente entre eles.\n\nAs 25 perícias cobrem tudo, de combate (Pontaria, Sabres de Luz, Combate Corpo a Corpo) a exploração (Astrogação, Sobrevivência Espacial, Pilotagem) e interação social (Diplomacia, Persuasão, Enganação). Cada perícia evolui por 6 graus de treinamento — de Inexperiente (+0) a Mestre (+25).",
        },
        {
          title: "Espécies e Planetas",
          body:
            "35 espécies jogáveis — de Humanos e Wookiees a Miraluka e Cerean — cada uma com perícias iniciais, modificadores de atributo e um perfil de vida/energia próprio. O Humano é a única exceção às regras: em vez de um modificador fixo, escolhe livremente onde aplicar seus bônus, pagando em identidade o que ganha em flexibilidade.\n\n28 planetas de origem completam a criação, cada um concedendo uma Habilidade Natal — um bônus fixo em perícias ligadas à cultura ou ambiente do mundo natal do personagem.",
        },
        {
          title: "23 Classes e as Formas de Sabre de Luz",
          body:
            "As classes vão de combatentes marciais (Mandaloriano, Soldado da República, Mercenário) a especialistas versáteis (Engenheiro, Espião, Diplomata) e sensíveis à Força (Padawan Jedi, Acólito Sith, Andarilho da Força — este último um caminho neutro, fora das ordens Jedi e Sith).\n\nAs 3 classes ligadas à Força aprendem as 7 Formas de Sabre clássicas (Shii-Cho, Makashi, Soresu, Ataru, Djem So, Niman, Vaapad) através de um sistema circular de vantagem: cada forma vence exatamente 3 outras e perde para exatamente 3 — nenhuma é objetivamente superior, só situacionalmente.\n\nAo atingir o nível 30, essas 3 classes podem evoluir para versões avançadas — O Lado da Luz, O Lado Negro e Xamã da Força — que abandonam parte do combate físico em favor de poderes da Força quase puros.",
          highlight:
            "Progressão até o nível 99 — muito além dos 20 níveis comuns em outros sistemas d20.",
        },
        {
          title: "Poderes Gerais e Multiclasse",
          body:
            "Além das habilidades de classe, todo personagem tem acesso a 50 Poderes Gerais (18 básicos + 32 avançados com pré-requisito), pagos com Pontos de Poder (PP) — um recurso próprio, separado de Vida (PV) e Energia da Força (PE). Poderes podem ser instantâneos (efeito único) ou sustentados (custam PP a cada turno mantido).\n\nO sistema também permite multiclasse: todo personagem pode escolher uma segunda classe de graça no nível 2; depois disso, cada nova multiclasse exige 2 perícias em grau Expert. As 3 classes ligadas à Força não podem ser combinadas entre si — só um caminho de Força por personagem.",
        },
      ],
    },
  },
};

/* ─── Page ───────────────────────────────────────────────── */

export default async function SystemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sys = SYSTEMS[id];
  if (!sys) notFound();

  return sys.wiki ? (
    <WikiPage sys={sys} />
  ) : (
    <PlaceholderPage sys={sys} />
  );
}

/* ─── Wiki Page (D&D and future full systems) ────────────── */

function WikiPage({ sys }: { sys: SystemData }) {
  const w = sys.wiki!;
  const accent = sys.accentColor;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>

      {/* Orbs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", width: "55%", height: "55%", top: "-5%", left: "-8%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${sys.orbColor} 0%, transparent 70%)`,
          animation: "orb-a 22s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: "45%", height: "45%", top: "30%", right: "-10%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${sys.orbColor} 0%, transparent 65%)`,
          animation: "orb-b 28s ease-in-out infinite",
        }} />
      </div>

      {/* Grid overlay */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.014,
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
        backgroundSize: "72px 72px",
      }} />

      {/* Back */}
      <div style={{ position: "fixed", top: 24, left: 28, zIndex: 20 }}>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: "0.82rem", color: "var(--text-muted)", textDecoration: "none",
          padding: "6px 14px", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", background: "var(--surface)",
        }}>
          ← Início
        </Link>
      </div>

      {/* ── Hero ── */}
      <header style={{
        position: "relative", zIndex: 1,
        padding: "120px 28px 72px",
        textAlign: "center",
        borderBottom: `1px solid ${accent}22`,
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 16px",
            background: `${accent}18`,
            border: `1px solid ${accent}44`,
            borderRadius: "var(--radius-full)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Guia do sistema
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
            fontWeight: 700, color: "var(--text)", lineHeight: 1.05, margin: 0,
          }}>
            {sys.name}
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
            {sys.tagline}
          </p>

          <div style={{
            width: 56, height: 2,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            borderRadius: 2,
          }} />

          <p style={{ fontSize: "0.975rem", color: "var(--text-muted)", lineHeight: 1.85, maxWidth: 580, margin: 0 }}>
            {w.intro}
          </p>
        </div>
      </header>

      {/* ── Body ── */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "64px 28px 100px" }}>

        {/* First section + sidebar: 2 columns */}
        <div className="sys-sidebar-grid" style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 48, alignItems: "start", marginBottom: 56 }}>
          <article>
            <h2 style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1.15rem", fontWeight: 700, color: "var(--text)",
              marginBottom: 20, paddingBottom: 12,
              borderBottom: `1px solid ${accent}33`,
            }}>
              {w.sections[0].title}
            </h2>
            <div style={{ fontSize: "0.93rem", color: "var(--text-muted)", lineHeight: 1.9 }}>
              {w.sections[0].body.split("\n\n").map((para, i) => (
                <p key={i} style={{ marginBottom: 16, whiteSpace: "pre-line" }}>{para}</p>
              ))}
            </div>
            {w.sections[0].highlight && (
              <blockquote style={{
                margin: "24px 0 0", padding: "14px 20px",
                borderLeft: `3px solid ${accent}`, background: `${accent}0d`,
                borderRadius: "0 var(--radius) var(--radius) 0",
                fontSize: "0.88rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.75,
              }}>
                {w.sections[0].highlight}
              </blockquote>
            )}
          </article>

          {/* Sidebar */}
          <aside className="sys-sidebar-aside" style={{ position: "sticky", top: 100 }}>
            <div style={{ background: "var(--surface)", border: `1px solid ${accent}33`, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ padding: "12px 18px", background: `${accent}18`, borderBottom: `1px solid ${accent}22` }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Ficha rápida
                </span>
              </div>
              <div style={{ padding: "6px 0" }}>
                {w.quickFacts.map((f) => (
                  <div key={f.label} style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: 8, padding: "10px 18px",
                    borderBottom: "1px solid var(--border)", fontSize: "0.8rem",
                  }}>
                    <span style={{ color: "var(--text-subtle)", fontWeight: 500 }}>{f.label}</span>
                    <span style={{ color: "var(--text)", fontWeight: 600, textAlign: "right" }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/dashboard" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              marginTop: 16, padding: "10px 18px",
              fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)",
              textDecoration: "none",
              border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--surface)",
            }}>
              Ver todos os sistemas
            </Link>
          </aside>
        </div>

        {/* Remaining sections: full width */}
        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          {w.sections.slice(1).map((sec) => (
            <article key={sec.title}>
              <h2 style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "1.15rem", fontWeight: 700, color: "var(--text)",
                marginBottom: 20, paddingBottom: 12,
                borderBottom: `1px solid ${accent}33`,
              }}>
                {sec.title}
              </h2>
              <div style={{ fontSize: "0.93rem", color: "var(--text-muted)", lineHeight: 1.9 }}>
                {sec.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ marginBottom: 16, whiteSpace: "pre-line" }}>{para}</p>
                ))}
              </div>
              {sec.highlight && (
                <blockquote style={{
                  margin: "24px 0 0", padding: "14px 20px",
                  borderLeft: `3px solid ${accent}`, background: `${accent}0d`,
                  borderRadius: "0 var(--radius) var(--radius) 0",
                  fontSize: "0.88rem", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.75,
                }}>
                  {sec.highlight}
                </blockquote>
              )}
            </article>
          ))}

          {/* CTA */}
          <div style={{
            marginTop: 8, padding: "32px 28px",
            background: `${accent}0d`, border: `1px solid ${accent}33`,
            borderRadius: "var(--radius-xl)", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>
              Pronto para criar seu personagem?
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              A ficha digital cuida dos cálculos. Você cuida da história.
            </p>
            <Link href={sys.ctaHref} style={{
              padding: "11px 32px", fontSize: "0.9rem", fontWeight: 600,
              color: "#06090f",
              background: `linear-gradient(135deg, ${accent}ee 0%, ${accent} 100%)`,
              textDecoration: "none", borderRadius: "var(--radius)",
            }}>
              Criar personagem →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Placeholder (sistemas sem wiki ainda) ──────────────── */

function PlaceholderPage({ sys }: { sys: SystemData }) {
  const accent = sys.accentColor;
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", position: "relative",
      overflow: "hidden", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "80px 28px",
    }}>
      {/* Orbs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position:"absolute", width:"70%", height:"70%", top:"5%", left:"-10%", borderRadius:"50%", background:`radial-gradient(ellipse, ${sys.orbColor} 0%, transparent 70%)`, animation:"orb-a 22s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:"60%", height:"60%", top:"20%", right:"-15%", borderRadius:"50%", background:`radial-gradient(ellipse, ${sys.orbColor} 0%, transparent 65%)`, animation:"orb-b 28s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:"50%", height:"50%", bottom:"5%", left:"30%", borderRadius:"50%", background:`radial-gradient(ellipse, ${sys.orbColor} 0%, transparent 60%)`, animation:"orb-c 19s ease-in-out infinite" }} />
      </div>

      {/* Grid */}
      <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:0.016, backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"72px 72px" }} />

      {/* Back */}
      <div style={{ position:"absolute", top:24, left:28, zIndex:10 }}>
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:"0.82rem", color:"var(--text-muted)", textDecoration:"none", padding:"6px 14px", border:"1px solid var(--border)", borderRadius:"var(--radius)", background:"var(--surface)" }}>
          ← Início
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth:560, textAlign:"center", position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>
        <div style={{ display:"inline-flex", alignItems:"center", padding:"5px 16px", background:`${accent}18`, border:`1px solid ${accent}44`, borderRadius:"var(--radius-full)" }}>
          <span style={{ fontSize:"0.7rem", fontWeight:700, color:accent, letterSpacing:"0.1em", textTransform:"uppercase" }}>Em breve</span>
        </div>

        <h1 style={{ fontFamily:"var(--font-cinzel), serif", fontSize:"clamp(2rem, 5vw, 3.2rem)", fontWeight:700, color:"var(--text)", lineHeight:1.1, margin:0 }}>
          {sys.name}
        </h1>

        <div style={{ width:48, height:2, background:`linear-gradient(90deg, transparent, ${accent}, transparent)`, borderRadius:2 }} />

        <p style={{ fontSize:"1rem", color:"var(--text-muted)", lineHeight:1.85, fontStyle:"italic", borderLeft:`2px solid ${accent}66`, paddingLeft:20, textAlign:"left", margin:0 }}>
          {sys.lore}
        </p>

        <p style={{ fontSize:"0.78rem", color:"var(--text-subtle)", marginTop:8 }}>
          Suporte completo chegando em breve. Fique de olho nas atualizações.
        </p>

        <Link href="/dashboard" style={{ marginTop:8, padding:"11px 28px", fontSize:"0.9rem", fontWeight:600, color:"#06090f", background:`linear-gradient(135deg, ${accent}ee 0%, ${accent} 100%)`, textDecoration:"none", borderRadius:"var(--radius)", display:"inline-block" }}>
          Ver sistemas disponíveis
        </Link>
      </div>
    </div>
  );
}
