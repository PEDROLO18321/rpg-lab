// ─── TORMENTA 20 — Classes (Capítulo 1) ──────────────────────────────────────
// Conteúdo mecânico restrito ao 1º nível (a ficha não implementa subida de
// nível — mesmo padrão do D&D/Cthulhu deste projeto: personagens são criados
// e jogados no nível/NEX inicial). PV/PM por nível ficam disponíveis como
// fórmula para referência futura, mas só o valor no 1º nível é usado na criação.

import type { AttrKey } from "./data";

export interface ClassFeature {
  name: string;
  description: string;
}

export interface ClassPath {
  id: string;
  name: string;
  keyAttribute: AttrKey;
  description: string;
}

export interface SpellcastingInfo {
  tradition: "arcana" | "divina";
  keyAttribute: AttrKey | null; // null quando depende do Caminho (Arcanista)
  startingSpells: number;
  schoolChoiceCount?: number; // Bardo/Druida: escolhem N escolas de magia (permanente)
}

export interface GodChoice {
  allowedGodIds: string[]; // vazio = qualquer deus com clericAllowed/paladinAllowed
  allowNone: boolean;      // Paladino: "paladino do bem", sem deus
}

export interface TormentaClass {
  id: string;
  name: string;
  icon: string;
  description: string;
  flavor: string;
  pvBase: number;     // PV no 1º nível, antes do mod. de Constituição
  pvPerLevel: number; // referência (não usado além do 1º nível)
  pmPerLevel: number; // PM por nível (soma-se o mod. do atributo-chave, se conjurador)
  skillsFixed: string[];   // ids de perícia; "a|b" = escolher uma entre as duas
  skillChoices: string[];  // pool de perícias à escolha
  skillChoiceCount: number;
  proficiencies: string[];
  level1Features: ClassFeature[];
  paths?: ClassPath[];        // Arcanista: Bruxo / Feiticeiro / Mago
  spellcasting: SpellcastingInfo | null;
  godChoice?: GodChoice;      // Clérigo / Druida / Paladino
}

export const CLASSES: TormentaClass[] = [
  {
    id: "arcanista", name: "Arcanista", icon: "🧙", description: "Um conjurador de magias arcanas, por meio de estudo, um foco ou dom natural.",
    flavor: "O arcanista é o grande mestre da magia, capaz de dobrar a própria realidade — fraco no início da carreira, mas um oponente formidável conforme ganha experiência.",
    pvBase: 8, pvPerLevel: 2, pmPerLevel: 6,
    skillsFixed: ["misticismo", "vontade"], skillChoices: ["conhecimento", "iniciativa", "oficio", "percepcao"], skillChoiceCount: 1,
    proficiencies: [],
    level1Features: [
      { name: "Magias", description: "Você pode lançar magias arcanas de 1º círculo. Começa com três magias de 1º círculo. Seu atributo-chave para lançar magias é definido pelo Caminho escolhido, e você soma o bônus desse atributo ao seu total de PM." },
    ],
    paths: [
      { id: "bruxo", name: "Bruxo", keyAttribute: "int", description: "Lança magias através de um foco (varinha, cajado...). Precisa segurar o foco com uma mão ou fazer um teste de Misticismo (CD 20 + custo em PM da magia) para lançar sem ele. O foco tem RD 10 e PV iguais à metade dos seus." },
      { id: "feiticeiro", name: "Feiticeiro", keyAttribute: "car", description: "Lança magias através de um poder inato que corre no sangue (uma linhagem). Não depende de item ou estudo, mas aprende uma magia nova a cada nível ímpar (3º, 5º, 7º...), em vez de a cada nível." },
      { id: "mago", name: "Mago", keyAttribute: "int", description: "Lança magias através de estudo e memorização em um grimório. Só pode lançar magias memorizadas (metade das que conhece, escolhidas após 1h de estudo diário). Começa com uma magia adicional (4 no total) e aprende uma magia extra a cada novo círculo alcançado." },
    ],
    spellcasting: { tradition: "arcana", keyAttribute: null, startingSpells: 3 },
  },
  {
    id: "barbaro", name: "Bárbaro", icon: "🪓", description: "Um combatente primitivo, que usa fúria e instintos para destruir seus inimigos.",
    flavor: "Um guerreiro selvagem movido por fúria incontrolável, que troca calma e concentração por força bruta em combate.",
    pvBase: 24, pvPerLevel: 6, pmPerLevel: 3,
    skillsFixed: ["fortitude", "luta"], skillChoices: ["adestramento", "atletismo", "cavalgar", "iniciativa", "intimidacao", "oficio", "percepcao", "pontaria", "sobrevivencia", "vontade"], skillChoiceCount: 4,
    proficiencies: ["Armas marciais", "Escudos"],
    level1Features: [
      { name: "Fúria", description: "Você pode gastar 2 PM para invocar uma fúria selvagem: +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode fazer nenhuma ação que exija calma e concentração (como Furtividade ou lançar magias). A Fúria termina se, ao fim da rodada, você não tiver atacado nem sido alvo de um efeito hostil." },
    ],
    spellcasting: null,
  },
  {
    id: "bardo", name: "Bardo", icon: "🎻", description: "Um artista errante e faz-tudo versátil, sempre com a solução certa para cada ocasião.",
    flavor: "Um artista que canaliza magia arcana através de música, dança ou outra performance, inspirando aliados com sua arte.",
    pvBase: 12, pvPerLevel: 3, pmPerLevel: 4,
    skillsFixed: ["atuacao", "reflexos"], skillChoices: ["acrobacia", "cavalgar", "conhecimento", "diplomacia", "enganacao", "furtividade", "iniciativa", "intuicao", "investigacao", "jogatina", "ladinagem", "luta", "misticismo", "nobreza", "percepcao", "pontaria", "religiao", "vontade"], skillChoiceCount: 6,
    proficiencies: ["Armas marciais"],
    level1Features: [
      { name: "Inspiração", description: "Você pode gastar uma ação padrão e 2 PM para inspirar as pessoas com sua arte. Você e todos os aliados em alcance curto ganham +1 em testes de perícia até o fim da cena." },
      { name: "Magias", description: "Escolha três escolas de magia (escolha permanente). Pode lançar magias arcanas de 1º círculo dessas escolas, vestindo armaduras leves sem precisar de testes de Misticismo. Começa com duas magias de 1º círculo. Atributo-chave Carisma, somado ao total de PM." },
    ],
    spellcasting: { tradition: "arcana", keyAttribute: "car", startingSpells: 2, schoolChoiceCount: 3 },
  },
  {
    id: "bucaneiro", name: "Bucaneiro", icon: "🏴‍☠️", description: "Um navegador inconsequente e galante, sempre em busca de ouro ou emoção.",
    flavor: "Um aventureiro dos mares, ágil e carismático, que confia na audácia para sair de qualquer enrascada.",
    pvBase: 16, pvPerLevel: 4, pmPerLevel: 3,
    skillsFixed: ["luta|pontaria", "reflexos"], skillChoices: ["acrobacia", "atletismo", "atuacao", "enganacao", "fortitude", "furtividade", "iniciativa", "intimidacao", "jogatina", "oficio", "percepcao", "pilotagem"], skillChoiceCount: 4,
    proficiencies: ["Armas marciais"],
    level1Features: [
      { name: "Audácia", description: "Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Carisma no teste. Não pode ser usada em testes de ataque." },
      { name: "Insolência", description: "Você soma seu bônus de Carisma na Defesa, limitado pelo seu nível. Exige liberdade de movimentos; não pode ser usada em armadura pesada ou na condição imóvel." },
    ],
    spellcasting: null,
  },
  {
    id: "cacador", name: "Caçador", icon: "🏹", description: "Um exterminador de monstros e mestre da sobrevivência em áreas selvagens.",
    flavor: "Um especialista em rastrear e abater presas, à vontade tanto em florestas selvagens quanto caçando monstros.",
    pvBase: 16, pvPerLevel: 4, pmPerLevel: 4,
    skillsFixed: ["luta|pontaria", "sobrevivencia"], skillChoices: ["adestramento", "atletismo", "cavalgar", "cura", "fortitude", "furtividade", "iniciativa", "investigacao", "oficio", "percepcao", "reflexos"], skillChoiceCount: 6,
    proficiencies: ["Armas marciais", "Escudos"],
    level1Features: [
      { name: "Marca da Presa", description: "Você pode gastar uma ação de movimento e 1 PM para analisar uma criatura em alcance curto. Até o fim da cena, recebe +1d4 nas rolagens de dano contra essa criatura." },
      { name: "Rastreador", description: "Você recebe +2 em Sobrevivência. Além disso, pode se mover com seu deslocamento normal enquanto rastreia, sem sofrer penalidades no teste." },
    ],
    spellcasting: null,
  },
  {
    id: "cavaleiro", name: "Cavaleiro", icon: "🛡️", description: "Um combatente honrado, especializado em suportar dano e proteger os outros.",
    flavor: "Um guerreiro disciplinado e honrado, que suporta os golpes do inimigo para proteger seus aliados.",
    pvBase: 20, pvPerLevel: 5, pmPerLevel: 3,
    skillsFixed: ["fortitude", "luta"], skillChoices: ["adestramento", "atletismo", "cavalgar", "diplomacia", "guerra", "iniciativa", "intimidacao", "nobreza", "percepcao", "vontade"], skillChoiceCount: 2,
    proficiencies: ["Armas marciais", "Armaduras pesadas", "Escudos"],
    level1Features: [
      { name: "Código de Honra", description: "Você não pode atacar um oponente pelas costas (flanquear), caído, desprevenido ou incapaz de lutar. Se violar o código, perde todos os seus PM e só pode recuperá-los a partir do próximo dia." },
      { name: "Baluarte", description: "Você pode gastar 1 PM para receber +2 na Defesa e nos testes de resistência até o início do seu próximo turno." },
    ],
    spellcasting: null,
  },
  {
    id: "clerigo", name: "Clérigo", icon: "⚕️", description: "Servo de um dos deuses de Arton, usa poderes divinos para defender seus ideais.",
    flavor: "Um devoto que canaliza o poder de seu deus maior em magia divina, obedecendo suas obrigações em troca de poderes concedidos.",
    pvBase: 16, pvPerLevel: 4, pmPerLevel: 5,
    skillsFixed: ["religiao", "vontade"], skillChoices: ["conhecimento", "cura", "diplomacia", "fortitude", "iniciativa", "intuicao", "luta", "misticismo", "nobreza", "oficio", "percepcao"], skillChoiceCount: 2,
    proficiencies: ["Armaduras pesadas", "Escudos"],
    level1Features: [
      { name: "Devoto", description: "Você se torna devoto de um deus maior. Deve obedecer às Obrigações & Restrições de seu deus, mas em troca ganha os Poderes Concedidos dele. Como alternativa, pode cultuar o Panteão como um todo — sem Poder Concedido, mas com a única restrição de não usar armas cortantes ou perfurantes." },
      { name: "Magias", description: "Você pode lançar magias divinas de 1º círculo. Começa com três magias de 1º círculo. Atributo-chave Sabedoria, somado ao total de PM." },
    ],
    spellcasting: { tradition: "divina", keyAttribute: "sab", startingSpells: 3 },
    godChoice: { allowedGodIds: [], allowNone: true },
  },
  {
    id: "druida", name: "Druida", icon: "🌿", description: "Guardião do mundo natural e devoto das forças selvagens, naturais ou monstruosas.",
    flavor: "Um devoto das forças da natureza que canaliza magia divina através de Allihanna, Megalokk ou Oceano.",
    pvBase: 16, pvPerLevel: 4, pmPerLevel: 4,
    skillsFixed: ["sobrevivencia", "vontade"], skillChoices: ["adestramento", "atletismo", "cavalgar", "conhecimento", "cura", "fortitude", "iniciativa", "intuicao", "luta", "misticismo", "oficio", "percepcao", "religiao"], skillChoiceCount: 4,
    proficiencies: ["Escudos"],
    level1Features: [
      { name: "Devoto", description: "Você se torna devoto de uma divindade disponível para druidas (Allihanna, Megalokk ou Oceano), obedecendo suas Obrigações & Restrições em troca dos Poderes Concedidos." },
      { name: "Empatia Selvagem", description: "Você pode se comunicar com animais por meio de linguagem corporal e vocalizações, usando Adestramento para mudar atitude e pedir favores." },
      { name: "Magias", description: "Escolha três escolas de magia (escolha permanente). Pode lançar magias divinas de 1º círculo dessas escolas. Começa com duas magias de 1º círculo. Atributo-chave Sabedoria, somado ao total de PM." },
    ],
    spellcasting: { tradition: "divina", keyAttribute: "sab", startingSpells: 2, schoolChoiceCount: 3 },
    godChoice: { allowedGodIds: ["allihanna", "megalokk", "oceano"], allowNone: false },
  },
  {
    id: "guerreiro", name: "Guerreiro", icon: "⚔️", description: "O especialista supremo em técnicas de combate com armas.",
    flavor: "Um mestre absoluto das armas, capaz de golpes devastadores através de puro treino marcial.",
    pvBase: 20, pvPerLevel: 5, pmPerLevel: 3,
    skillsFixed: ["luta|pontaria", "fortitude"], skillChoices: ["adestramento", "atletismo", "cavalgar", "guerra", "iniciativa", "intimidacao", "oficio", "percepcao", "reflexos"], skillChoiceCount: 2,
    proficiencies: ["Armas marciais", "Armaduras pesadas", "Escudos"],
    level1Features: [
      { name: "Ataque Especial", description: "Quando faz um ataque, pode gastar 1 PM para receber +4 no teste de ataque ou na rolagem de dano (pode dividir o bônus igualmente entre ataque e dano)." },
    ],
    spellcasting: null,
  },
  {
    id: "inventor", name: "Inventor", icon: "⚙️", description: "Um ferreiro, alquimista ou engenhoqueiro, especializado em fabricar e usar itens.",
    flavor: "Um gênio criativo que transforma engenhocas e alquimia em soluções para qualquer problema.",
    pvBase: 12, pvPerLevel: 3, pmPerLevel: 4,
    skillsFixed: ["oficio", "vontade"], skillChoices: ["conhecimento", "cura", "diplomacia", "fortitude", "iniciativa", "investigacao", "luta", "misticismo", "pilotagem", "pontaria", "percepcao"], skillChoiceCount: 4,
    proficiencies: [],
    level1Features: [
      { name: "Engenhosidade", description: "Quando faz um teste de perícia, pode gastar 2 PM para receber um bônus igual ao seu modificador de Inteligência no teste. Não pode ser usada em testes de ataque." },
      { name: "Protótipo", description: "Você começa o jogo com um item superior com uma modificação, ou 10 itens alquímicos, com preço total de até T$ 500." },
    ],
    spellcasting: null,
  },
  {
    id: "ladino", name: "Ladino", icon: "🗡️", description: "Aventureiro cheio de truques, confiando mais em agilidade e esperteza que em força bruta.",
    flavor: "Um especialista em explorar pontos fracos, ágil e versátil, que prospera na velocidade e na esperteza.",
    pvBase: 12, pvPerLevel: 3, pmPerLevel: 4,
    skillsFixed: ["ladinagem", "reflexos"], skillChoices: ["acrobacia", "atletismo", "atuacao", "cavalgar", "conhecimento", "diplomacia", "enganacao", "furtividade", "iniciativa", "intimidacao", "intuicao", "investigacao", "jogatina", "luta", "oficio", "percepcao", "pilotagem", "pontaria"], skillChoiceCount: 8,
    proficiencies: [],
    level1Features: [
      { name: "Ataque Furtivo", description: "Uma vez por rodada, quando atinge um alvo desprevenido com ataque corpo a corpo ou em alcance curto, ou um alvo flanqueando, causa 1d6 pontos de dano adicional. Criaturas imunes a acertos críticos são imunes a ataques furtivos." },
      { name: "Especialista", description: "Escolha um número de perícias treinadas igual ao seu bônus de Inteligência (mínimo 1). Ao testar uma dessas perícias, pode gastar 1 PM para dobrar seu bônus de treinamento (não em testes de ataque)." },
    ],
    spellcasting: null,
  },
  {
    id: "lutador", name: "Lutador", icon: "🥊", description: "Um especialista em combate desarmado rústico e durão.",
    flavor: "Um combatente que dispensa armas, confiando nos próprios punhos e na resistência do corpo.",
    pvBase: 20, pvPerLevel: 5, pmPerLevel: 3,
    skillsFixed: ["fortitude", "luta"], skillChoices: ["acrobacia", "adestramento", "atletismo", "enganacao", "furtividade", "iniciativa", "intimidacao", "oficio", "percepcao", "pontaria", "reflexos"], skillChoiceCount: 4,
    proficiencies: [],
    level1Features: [
      { name: "Briga", description: "Ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal sem penalidade (dano para criaturas Pequenas/Médias; ajusta um passo por categoria de tamanho diferente)." },
      { name: "Golpe Relâmpago", description: "Quando usa a ação atacar para um ataque desarmado, pode gastar 1 PM para realizar um ataque desarmado adicional." },
    ],
    spellcasting: null,
  },
  {
    id: "nobre", name: "Nobre", icon: "👑", description: "Um membro da alta sociedade cujas principais armas são as palavras e o orgulho.",
    flavor: "Um aristocrata que usa influência, carisma e recursos para se impor tanto na corte quanto no campo de batalha.",
    pvBase: 16, pvPerLevel: 4, pmPerLevel: 4,
    skillsFixed: ["diplomacia|intimidacao", "vontade"], skillChoices: ["adestramento", "atuacao", "cavalgar", "conhecimento", "enganacao", "fortitude", "guerra", "iniciativa", "intuicao", "investigacao", "jogatina", "luta", "nobreza", "oficio", "percepcao", "pontaria"], skillChoiceCount: 4,
    proficiencies: ["Armas marciais", "Armaduras pesadas", "Escudos"],
    level1Features: [
      { name: "Autoconfiança", description: "Pode somar seu bônus de Carisma em vez de Destreza na Defesa (mas continua sem poder somar bônus de atributo na Defesa quando usa armadura pesada)." },
      { name: "Espólio", description: "Você recebe um item à escolha com preço de até T$ 2.000." },
      { name: "Orgulho", description: "Quando faz um teste de perícia, pode gastar PM (limitado pelo mod. de Carisma) para receber +2 no teste por PM gasto." },
    ],
    spellcasting: null,
  },
  {
    id: "paladino", name: "Paladino", icon: "🕊️", description: "Um campeão do bem e da ordem, o perfeito soldado dos deuses.",
    flavor: "Um guerreiro sagrado que segue um rígido código de honra, abençoado por Carisma e devoção divina.",
    pvBase: 20, pvPerLevel: 5, pmPerLevel: 3,
    skillsFixed: ["luta", "vontade"], skillChoices: ["adestramento", "atletismo", "cavalgar", "cura", "diplomacia", "fortitude", "guerra", "iniciativa", "intuicao", "nobreza", "percepcao", "religiao"], skillChoiceCount: 2,
    proficiencies: ["Armas marciais", "Armaduras pesadas", "Escudos"],
    level1Features: [
      { name: "Abençoado", description: "Soma seu bônus de Carisma ao seu total de pontos de mana no 1º nível. Torna-se devoto de uma divindade disponível para paladinos, obedecendo suas Obrigações & Restrições em troca dos Poderes Concedidos. Alternativa: \"paladino do bem\", sem deus e sem Poder Concedido, seguindo apenas o Código do Herói." },
      { name: "Código do Herói", description: "Deve sempre manter sua palavra e nunca recusar um pedido de ajuda de alguém inocente. Nunca pode mentir, trapacear ou roubar. Se violar o código, perde todos os seus PM até o próximo dia." },
      { name: "Golpe Divino", description: "Ao fazer um ataque corpo a corpo, pode gastar 2 PM para somar o bônus de Carisma no teste de ataque e causar +1d8 na rolagem de dano." },
    ],
    spellcasting: null,
    godChoice: { allowedGodIds: [], allowNone: true },
  },
];

export const CLASS_BY_ID: Record<string, TormentaClass> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
);
