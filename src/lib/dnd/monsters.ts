export type MonsterSize = "Miúdo" | "Pequeno" | "Médio" | "Grande" | "Enorme" | "Imenso";
export type MonsterType =
  | "Aberração" | "Besta" | "Celestial" | "Constructo" | "Corruptor"
  | "Dragão" | "Elemental" | "Fada" | "Gigante" | "Humanoide"
  | "Limo" | "Monstruosidade" | "Morto-vivo" | "Planta";

export interface MonsterTrait {
  name: string;
  description: string;
}

export interface MonsterAction {
  name: string;
  description: string;
}

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  size: MonsterSize;
  alignment: string;
  ac: number;
  hp: number;
  cr: string;
  xp: number;
  speed: string;
  // Atributos (opcionais — preenchidos para os monstros com bloco completo)
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  savingThrows?: string;
  skills?: string;
  damageResistances?: string;
  damageImmunities?: string;
  damageVulnerabilities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  traits?: MonsterTrait[];
  actions?: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: MonsterAction[];
}

export const CR_ORDER: Record<string, number> = {
  "0": 0, "1/8": 0.125, "1/4": 0.25, "1/2": 0.5,
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "10": 10, "11": 11, "12": 12, "13": 13, "14": 14, "15": 15,
  "16": 16, "17": 17, "18": 18, "19": 19, "20": 20, "21": 21, "22": 22,
  "23": 23, "24": 24, "25": 25, "26": 26, "27": 27, "28": 28, "29": 29, "30": 30,
};

export const MONSTERS: Monster[] = [
  // ── Humanoides ──────────────────────────────────────────────────────────────
  { id: "aarakocra", name: "Aarakocra", type: "Humanoide", size: "Médio", alignment: "Neutro e bom", ac: 12, hp: 13, cr: "1/4", xp: 50, speed: "6 m, voo 15 m" },
  { id: "bugbear", name: "Bugbear", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 16, hp: 27, cr: "1", xp: 200, speed: "9 m",
    str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9,
    skills: "Furtividade +6, Sobrevivência +2", senses: "Visão no escuro 18 m, Percepção passiva 10", languages: "Comum, Goblin",
    traits: [
      { name: "Brutal", description: "Uma arma corpo-a-corpo causa um dado de dano extra quando o bugbear acerta com ela (incluído no ataque)." },
      { name: "Ataque Furtivo", description: "Uma vez por turno, o bugbear causa 7 (2d6) de dano extra a uma criatura que ele atingir com um ataque de arma se tiver vantagem no ataque." },
    ],
    actions: [
      { name: "Maça Estrela", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 11 (2d8+2) de dano perfurante." },
      { name: "Azagaia", description: "Ataque Corpo-a-Corpo ou à Distância com Arma: +4 para acertar, alcance 1,5 m ou distância 9/36 m, um alvo. Acerto: 9 (2d6+2) de dano perfurante corpo-a-corpo, ou 5 (1d6+2) à distância." },
    ] },
  { id: "bugbear-chefe", name: "Bugbear – Chefe", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 17, hp: 65, cr: "3", xp: 700, speed: "9 m" },
  { id: "bullywug", name: "Bullywug", type: "Humanoide", size: "Médio", alignment: "Neutro e mau", ac: 15, hp: 11, cr: "1/4", xp: 50, speed: "6 m, natação 6 m" },
  { id: "duergar", name: "Duergar", type: "Humanoide", size: "Médio", alignment: "Leal e mau", ac: 16, hp: 26, cr: "1", xp: 200, speed: "7,5 m" },
  { id: "drow", name: "Elfo Drow", type: "Humanoide", size: "Médio", alignment: "Neutro e mau", ac: 15, hp: 13, cr: "1/4", xp: 50, speed: "9 m" },
  { id: "drow-sacerdotisa", name: "Drow – Sacerdotisa", type: "Humanoide", size: "Médio", alignment: "Neutro e mau", ac: 16, hp: 71, cr: "8", xp: 3900, speed: "9 m" },
  { id: "githyanki-guerreiro", name: "Githyanki – Guerreiro", type: "Humanoide", size: "Médio", alignment: "Leal e mau", ac: 17, hp: 49, cr: "3", xp: 700, speed: "9 m" },
  { id: "githzerai-monge", name: "Githzerai – Monge", type: "Humanoide", size: "Médio", alignment: "Leal e neutro", ac: 14, hp: 38, cr: "2", xp: 450, speed: "9 m" },
  { id: "gnoll", name: "Gnoll", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 15, hp: 22, cr: "1/2", xp: 100, speed: "9 m",
    str: 14, dex: 12, con: 11, int: 6, wis: 10, cha: 7,
    senses: "Visão no escuro 18 m, Percepção passiva 10", languages: "Gnoll",
    traits: [
      { name: "Frenesi", description: "Como ação bônus, o gnoll pode se mover até seu deslocamento em direção a uma criatura hostil que ele possa ver." },
    ],
    actions: [
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 4 (1d4+2) de dano perfurante." },
      { name: "Lança", description: "Ataque Corpo-a-Corpo ou à Distância com Arma: +4 para acertar, alcance 1,5 m ou distância 6/18 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante, ou 6 (1d8+2) corpo-a-corpo com as duas mãos." },
      { name: "Arco Longo", description: "Ataque à Distância com Arma: +3 para acertar, distância 45/180 m, um alvo. Acerto: 5 (1d8+1) de dano perfurante." },
    ] },
  { id: "gnomo-profundezas", name: "Gnomo das Profundezas", type: "Humanoide", size: "Pequeno", alignment: "Neutro e bom", ac: 15, hp: 16, cr: "1/2", xp: 100, speed: "7,5 m" },
  { id: "goblin", name: "Goblin", type: "Humanoide", size: "Pequeno", alignment: "Neutro e mau", ac: 15, hp: 7, cr: "1/4", xp: 50, speed: "9 m",
    str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8,
    skills: "Furtividade +6", senses: "Visão no escuro 18 m, Percepção passiva 9", languages: "Comum, Goblin",
    traits: [
      { name: "Escapada Ágil", description: "O goblin pode realizar a ação de Desengajar ou Esconder-se como uma ação bônus em cada um de seus turnos." },
    ],
    actions: [
      { name: "Cimitarra", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d6+2) de dano cortante." },
      { name: "Arco Curto", description: "Ataque à Distância com Arma: +4 para acertar, distância 24/96 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante." },
    ] },
  { id: "rei-goblin", name: "Goblin – Rei", type: "Humanoide", size: "Pequeno", alignment: "Neutro e mau", ac: 17, hp: 21, cr: "1", xp: 200, speed: "9 m" },
  { id: "grimlock", name: "Grimlock", type: "Humanoide", size: "Médio", alignment: "Neutro", ac: 11, hp: 11, cr: "1/4", xp: 50, speed: "9 m" },
  { id: "hobgoblin", name: "Hobgoblin", type: "Humanoide", size: "Médio", alignment: "Leal e mau", ac: 18, hp: 11, cr: "1/2", xp: 100, speed: "9 m",
    str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9,
    senses: "Visão no escuro 18 m, Percepção passiva 10", languages: "Comum, Goblin",
    traits: [
      { name: "Vantagem Marcial", description: "Uma vez por turno, o hobgoblin pode causar 7 (2d6) de dano extra a uma criatura que ele atingir com um ataque de arma se aquela criatura estiver a até 1,5 m de um aliado do hobgoblin que não esteja incapacitado." },
    ],
    actions: [
      { name: "Espada Longa", description: "Ataque Corpo-a-Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d8+1) de dano cortante, ou 6 (1d10+1) se usada com as duas mãos." },
      { name: "Arco Longo", description: "Ataque à Distância com Arma: +3 para acertar, distância 45/180 m, um alvo. Acerto: 5 (1d8+1) de dano perfurante." },
    ] },
  { id: "hobgoblin-capitao", name: "Hobgoblin – Capitão", type: "Humanoide", size: "Médio", alignment: "Leal e mau", ac: 17, hp: 52, cr: "3", xp: 700, speed: "9 m" },
  { id: "kenku", name: "Kenku", type: "Humanoide", size: "Médio", alignment: "Caótico e neutro", ac: 13, hp: 13, cr: "1/4", xp: 50, speed: "9 m" },
  { id: "kobold", name: "Kobold", type: "Humanoide", size: "Pequeno", alignment: "Leal e mau", ac: 12, hp: 5, cr: "1/8", xp: 25, speed: "9 m",
    str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8,
    senses: "Visão no escuro 18 m, Percepção passiva 8", languages: "Comum, Dracônico",
    traits: [
      { name: "Sensibilidade à Luz Solar", description: "Sob luz solar, o kobold tem desvantagem em ataques e testes de Sabedoria (Percepção) que dependam da visão." },
      { name: "Táticas de Matilha", description: "O kobold tem vantagem em rolagens de ataque contra uma criatura se ao menos um aliado do kobold estiver a até 1,5 m da criatura e não estiver incapacitado." },
    ],
    actions: [
      { name: "Adaga", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 4 (1d4+2) de dano perfurante." },
      { name: "Funda", description: "Ataque à Distância com Arma: +4 para acertar, distância 9/36 m, um alvo. Acerto: 4 (1d4+2) de dano contundente." },
    ] },
  { id: "kuo-toa", name: "Kuo-toa", type: "Humanoide", size: "Médio", alignment: "Neutro e mau", ac: 13, hp: 18, cr: "1/4", xp: 50, speed: "9 m, natação 9 m" },
  { id: "orc", name: "Orc", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 13, hp: 15, cr: "1/2", xp: 100, speed: "9 m",
    str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10,
    skills: "Intimidação +2", senses: "Visão no escuro 18 m, Percepção passiva 10", languages: "Comum, Orc",
    traits: [
      { name: "Agressivo", description: "Como ação bônus, o orc pode se mover até seu deslocamento em direção a uma criatura hostil que ele possa ver." },
    ],
    actions: [
      { name: "Machado Grande", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 9 (1d12+3) de dano cortante." },
      { name: "Azagaia", description: "Ataque Corpo-a-Corpo ou à Distância com Arma: +5 para acertar, alcance 1,5 m ou distância 9/36 m, um alvo. Acerto: 6 (1d6+3) de dano perfurante." },
    ] },
  { id: "orc-olho-gruumsh", name: "Orc – Olho de Gruumsh", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 16, hp: 45, cr: "2", xp: 450, speed: "9 m" },
  { id: "orc-chefe-guerra", name: "Orc – Chefe de Guerra", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 16, hp: 93, cr: "4", xp: 1100, speed: "9 m" },
  { id: "povo-lagarto", name: "Povo Lagarto", type: "Humanoide", size: "Médio", alignment: "Neutro", ac: 15, hp: 22, cr: "1/2", xp: 100, speed: "9 m, natação 9 m" },
  { id: "quaggoth", name: "Quaggoth", type: "Humanoide", size: "Médio", alignment: "Caótico e neutro", ac: 13, hp: 45, cr: "2", xp: 450, speed: "9 m" },
  { id: "sahuagin", name: "Sahuagin", type: "Humanoide", size: "Médio", alignment: "Leal e mau", ac: 12, hp: 22, cr: "1/2", xp: 100, speed: "9 m, natação 12 m" },
  { id: "thri-kreen", name: "Thri-kreen", type: "Humanoide", size: "Médio", alignment: "Caótico e neutro", ac: 15, hp: 33, cr: "1", xp: 200, speed: "12 m" },
  { id: "troglodita", name: "Troglodita", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 11, hp: 13, cr: "1/4", xp: 50, speed: "9 m" },
  { id: "yuan-ti-sangue-puro", name: "Yuan-ti – Sangue Puro", type: "Humanoide", size: "Médio", alignment: "Neutro e mau", ac: 11, hp: 40, cr: "1", xp: 200, speed: "9 m" },
  { id: "yuan-ti-malison", name: "Yuan-ti – Malison", type: "Monstruosidade", size: "Médio", alignment: "Neutro e mau", ac: 12, hp: 66, cr: "3", xp: 700, speed: "9 m" },
  { id: "yuan-ti-abomination", name: "Yuan-ti – Abominação", type: "Monstruosidade", size: "Grande", alignment: "Neutro e mau", ac: 15, hp: 127, cr: "7", xp: 2900, speed: "9 m" },
  { id: "homem-chacal", name: "Homem Chacal", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 12, hp: 18, cr: "1/2", xp: 100, speed: "9 m" },

  // ── Mortos-vivos ─────────────────────────────────────────────────────────────
  { id: "aparicao", name: "Aparição", type: "Morto-vivo", size: "Médio", alignment: "Neutro e mau", ac: 13, hp: 67, cr: "5", xp: 1800, speed: "0 m, voo 18 m" },
  { id: "banshee", name: "Banshee", type: "Morto-vivo", size: "Médio", alignment: "Caótico e mau", ac: 12, hp: 58, cr: "4", xp: 1100, speed: "0 m, voo 12 m" },
  { id: "cavaleiro-morte", name: "Cavaleiro da Morte", type: "Morto-vivo", size: "Médio", alignment: "Caótico e mau", ac: 20, hp: 229, cr: "17", xp: 18000, speed: "9 m" },
  { id: "caveira-flamejante", name: "Caveira Flamejante", type: "Morto-vivo", size: "Miúdo", alignment: "Neutro e mau", ac: 13, hp: 22, cr: "1", xp: 200, speed: "0 m, voo 18 m" },
  { id: "demilich", name: "Demilich", type: "Morto-vivo", size: "Miúdo", alignment: "Neutro e mau", ac: 20, hp: 80, cr: "18", xp: 20000, speed: "0 m, voo 9 m" },
  { id: "dracolich", name: "Dracolich Adulto", type: "Morto-vivo", size: "Enorme", alignment: "Caótico e mau", ac: 19, hp: 225, cr: "17", xp: 18000, speed: "12 m, voo 24 m" },
  { id: "espectro", name: "Espectro", type: "Morto-vivo", size: "Médio", alignment: "Caótico e mau", ac: 12, hp: 22, cr: "1", xp: 200, speed: "0 m, voo 15 m" },
  { id: "esqueleto", name: "Esqueleto", type: "Morto-vivo", size: "Médio", alignment: "Leal e mau", ac: 13, hp: 13, cr: "1/4", xp: 50, speed: "9 m",
    str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5,
    damageVulnerabilities: "Contundente", damageImmunities: "Veneno",
    conditionImmunities: "Envenenado, Exausto", senses: "Visão no escuro 18 m, Percepção passiva 9",
    languages: "Entende os idiomas que conhecia em vida, mas não pode falar",
    actions: [
      { name: "Espada Curta", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante." },
      { name: "Arco Curto", description: "Ataque à Distância com Arma: +4 para acertar, distância 24/96 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante." },
    ] },
  { id: "fantasma", name: "Fantasma", type: "Morto-vivo", size: "Médio", alignment: "Qualquer tendência", ac: 11, hp: 45, cr: "4", xp: 1100, speed: "0 m, voo 12 m (pairando)",
    str: 7, dex: 13, con: 10, int: 10, wis: 12, cha: 17,
    damageResistances: "Ácido, frio, fogo, elétrico, trovão; contundente, cortante e perfurante de armas não-mágicas",
    damageImmunities: "Necrótico, veneno",
    conditionImmunities: "Enfeitiçado, exausto, amedrontado, agarrado, paralisado, petrificado, envenenado, caído, contido",
    senses: "Visão no escuro 18 m, Percepção passiva 11", languages: "Os idiomas que conhecia em vida",
    traits: [
      { name: "Movimento Etéreo", description: "O fantasma pode se mover do Plano Material para o Plano Etéreo, ou vice-versa, como ação bônus." },
      { name: "Deslocamento Incorpóreo", description: "O fantasma pode se mover através de outras criaturas e objetos como se fossem terreno difícil. Sofre 5 (1d10) de dano de força se terminar o turno dentro de um objeto." },
    ],
    actions: [
      { name: "Toque Aterrorizante", description: "Ataque Corpo-a-Corpo: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 17 (4d6+3) de dano necrótico." },
      { name: "Investida Etérea", description: "Visível apenas no Plano Etéreo, o fantasma fixa o olhar em uma criatura a até 18 m. O alvo faz teste de resistência de Sabedoria CD 13 ou fica amedrontado por 1 minuto." },
      { name: "Possessão (Recarrega 6)", description: "Um humanoide a até 1,5 m faz teste de resistência de Carisma CD 13 ou tem o corpo possuído pelo fantasma. O fantasma controla o corpo até ser expulso." },
    ] },
  { id: "fogo-fatuo", name: "Fogo-Fátuo", type: "Morto-vivo", size: "Miúdo", alignment: "Caótico e mau", ac: 19, hp: 22, cr: "2", xp: 450, speed: "0 m, voo 15 m" },
  { id: "garra-rastejante", name: "Garra Rastejante", type: "Morto-vivo", size: "Miúdo", alignment: "Neutro e mau", ac: 12, hp: 2, cr: "0", xp: 10, speed: "9 m" },
  { id: "inumano", name: "Inumano", type: "Morto-vivo", size: "Médio", alignment: "Neutro e mau", ac: 14, hp: 45, cr: "3", xp: 700, speed: "9 m" },
  { id: "lich", name: "Lich", type: "Morto-vivo", size: "Médio", alignment: "Qualquer mau", ac: 17, hp: 135, cr: "21", xp: 33000, speed: "9 m",
    str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16,
    savingThrows: "Con +10, Int +12, Sab +9",
    skills: "Arcanismo +18, História +12, Intuição +9, Percepção +9",
    damageResistances: "Frio, elétrico, necrótico",
    damageImmunities: "Veneno; contundente, cortante e perfurante de armas não-mágicas",
    conditionImmunities: "Enfeitiçado, exausto, amedrontado, paralisado, envenenado",
    senses: "Visão verdadeira 36 m, Percepção passiva 19", languages: "Comum e até cinco outros idiomas",
    traits: [
      { name: "Recuperação Lendária (3/dia)", description: "Se o lich falhar em um teste de resistência, ele pode escolher passar em vez disso." },
      { name: "Resistência a Magia", description: "O lich tem vantagem em testes de resistência contra magias e outros efeitos mágicos." },
      { name: "Reformação por Filactério", description: "Se o corpo for destruído, um novo corpo se forma em 1d10 dias a partir do filactério, recuperando o lich com todos os PV. Só é permanentemente destruído se o filactério também for destruído." },
      { name: "Conjuração", description: "Conjurador de 18º nível (Inteligência, CD 20, +12 para acertar). Acesso à lista completa de magias de mago, incluindo bola de fogo, contramágica, dedo da morte, parar o tempo." },
    ],
    actions: [
      { name: "Toque Paralisante", description: "Ataque Corpo-a-Corpo: +12 para acertar, alcance 1,5 m, uma criatura. Acerto: 10 (3d6) de dano frio. O alvo faz teste de resistência de Constituição CD 18 ou fica paralisado por 1 minuto (repete ao fim de cada turno)." },
    ],
    legendaryActions: [
      { name: "Truque", description: "O lich conjura um truque." },
      { name: "Toque Paralisante (custa 2 ações)", description: "O lich usa seu Toque Paralisante." },
      { name: "Aterrorizar (custa 2 ações)", description: "O lich fixa o olhar; cada criatura a até 3 m faz teste de Sabedoria CD 18 ou fica amedrontada por 1 minuto." },
      { name: "Romper Vida (custa 3 ações)", description: "Cada criatura não-morta-viva a até 6 m sofre 21 (6d6) de dano necrótico (metade com teste de Constituição CD 18)." },
    ] },
  { id: "mumia", name: "Múmia", type: "Morto-vivo", size: "Médio", alignment: "Leal e mau", ac: 11, hp: 58, cr: "3", xp: 700, speed: "6 m" },
  { id: "lorde-mumia", name: "Lorde Múmia", type: "Morto-vivo", size: "Médio", alignment: "Leal e mau", ac: 17, hp: 97, cr: "15", xp: 13000, speed: "6 m" },
  { id: "ressurgido", name: "Ressurgido", type: "Morto-vivo", size: "Médio", alignment: "Neutro", ac: 13, hp: 136, cr: "13", xp: 10000, speed: "9 m" },
  { id: "sombra", name: "Sombra", type: "Morto-vivo", size: "Médio", alignment: "Caótico e mau", ac: 12, hp: 16, cr: "1/2", xp: 100, speed: "12 m",
    str: 6, dex: 14, con: 13, int: 6, wis: 10, cha: 8,
    skills: "Furtividade +4 (+6 na penumbra ou escuridão)",
    damageVulnerabilities: "Radiante",
    damageResistances: "Ácido, frio, fogo, elétrico, trovão; contundente, cortante e perfurante de armas não-mágicas",
    damageImmunities: "Necrótico, veneno",
    conditionImmunities: "Enfeitiçado, exausto, amedrontado, agarrado, paralisado, petrificado, envenenado, caído, contido",
    senses: "Visão no escuro 18 m, Percepção passiva 10", languages: "—",
    traits: [
      { name: "Movimento Amorfo", description: "A sombra pode se mover através de um espaço tão estreito quanto 2,5 cm sem se espremer." },
      { name: "Furtividade na Penumbra", description: "Enquanto estiver em penumbra ou escuridão, a sombra pode realizar a ação de Esconder-se como ação bônus." },
      { name: "Fraqueza à Luz Solar", description: "Sob luz solar, a sombra tem desvantagem em rolagens de ataque, de habilidade e de resistência." },
    ],
    actions: [
      { name: "Toque Drenante de Força", description: "Ataque Corpo-a-Corpo: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 9 (2d6+2) de dano necrótico, e o valor de Força do alvo reduz em 1d4. O alvo morre se isso reduzir sua Força a 0. A redução dura até a criatura terminar um descanso curto ou longo. Se uma criatura não-maligna morrer por este ataque, uma nova sombra surge do cadáver em 1d4 horas." },
    ] },
  { id: "vampiro", name: "Vampiro", type: "Morto-vivo", size: "Médio", alignment: "Leal e mau", ac: 16, hp: 144, cr: "13", xp: 10000, speed: "9 m",
    str: 18, dex: 18, con: 18, int: 17, wis: 15, cha: 18,
    savingThrows: "Des +9, Sab +7, Car +9",
    skills: "Percepção +7, Furtividade +9",
    damageResistances: "Necrótico; contundente, cortante e perfurante de armas não-mágicas",
    senses: "Visão no escuro 36 m, Percepção passiva 17", languages: "Os idiomas que conhecia em vida",
    traits: [
      { name: "Regeneração", description: "O vampiro recupera 20 pontos de vida no início de seu turno se tiver ao menos 1 PV e não estiver sob luz solar ou água corrente. Se sofrer dano radiante ou de água benta, esse traço não funciona no próximo turno." },
      { name: "Caminhada na Aranha", description: "O vampiro pode escalar superfícies difíceis, incluindo de cabeça para baixo em tetos, sem teste de habilidade." },
      { name: "Fraquezas do Vampiro", description: "Não pode entrar em residência sem convite; sofre 20 de dano ácido ao terminar o turno em água corrente; é destruído por estaca de madeira no coração enquanto incapacitado em seu caixão; sob luz solar fica atordoado se começar o turno nela e sofre 20 de dano radiante." },
      { name: "Maldição", description: "Forma alternativa de morto-vivo; pode regenerar; transformar-se em morcego ou névoa." },
    ],
    actions: [
      { name: "Ataques Múltiplos (Forma de Vampiro)", description: "O vampiro faz dois ataques, apenas um dos quais pode ser uma mordida." },
      { name: "Pancada (Forma de Vampiro)", description: "Ataque Corpo-a-Corpo: +9 para acertar, alcance 1,5 m, um alvo. Acerto: 8 (1d8+4) de dano contundente. Em vez de dano, o vampiro pode agarrar o alvo (fuga CD 18)." },
      { name: "Mordida (Forma de Vampiro/Morcego)", description: "Ataque Corpo-a-Corpo: +9 para acertar, alcance 1,5 m, uma criatura agarrada/incapacitada/disposta. Acerto: 7 (1d6+4) perfurante mais 10 (3d6) necrótico. O PV máximo do alvo reduz nesse valor e o vampiro recupera o mesmo." },
      { name: "Encantar", description: "O vampiro fixa o olhar em uma criatura a até 9 m. Teste de resistência de Sabedoria CD 17 ou fica enfeitiçado por 24 horas, tratando o vampiro como um amigo confiável." },
      { name: "Filhos da Noite (1/dia)", description: "Convoca 2d4 enxames de morcegos ou ratos (ao ar livre, 3d6 lobos) que chegam em 1d4 rodadas e obedecem ao vampiro." },
    ],
    legendaryActions: [
      { name: "Mover-se", description: "O vampiro se move até metade de seu deslocamento sem provocar ataques de oportunidade." },
      { name: "Pancada", description: "O vampiro realiza um ataque de Pancada." },
      { name: "Mordida (custa 2 ações)", description: "O vampiro realiza um ataque de Mordida." },
    ] },
  { id: "espectro-vampiro", name: "Vampiro – Espectro", type: "Morto-vivo", size: "Médio", alignment: "Neutro e mau", ac: 12, hp: 82, cr: "5", xp: 1800, speed: "0 m, voo 12 m" },
  { id: "zumbi", name: "Zumbi", type: "Morto-vivo", size: "Médio", alignment: "Neutro e mau", ac: 8, hp: 22, cr: "1/4", xp: 50, speed: "6 m",
    str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5,
    savingThrows: "Sab +0", damageImmunities: "Veneno",
    conditionImmunities: "Envenenado", senses: "Visão no escuro 18 m, Percepção passiva 8",
    languages: "Entende os idiomas que conhecia em vida, mas não pode falar",
    traits: [
      { name: "Fortitude Morta-Viva", description: "Se um dano reduzir o zumbi a 0 pontos de vida, ele deve fazer um teste de resistência de Constituição com CD 5 + o dano sofrido, a menos que o dano seja radiante ou de um acerto crítico. Se passar, o zumbi cai para 1 ponto de vida em vez disso." },
    ],
    actions: [
      { name: "Pancada", description: "Ataque Corpo-a-Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 4 (1d6+1) de dano contundente." },
    ] },

  // ── Dragões ──────────────────────────────────────────────────────────────────
  { id: "pseudodragao", name: "Pseudodragão", type: "Dragão", size: "Miúdo", alignment: "Neutro e bom", ac: 13, hp: 7, cr: "1/4", xp: 50, speed: "4,5 m, voo 18 m" },
  { id: "dragao-fada-latao", name: "Dragão-Fada – Latão (Jovem)", type: "Dragão", size: "Miúdo", alignment: "Caótico e bom", ac: 13, hp: 3, cr: "1/4", xp: 50, speed: "4,5 m, voo 18 m" },
  { id: "dragao-branco-jovem", name: "Dragão Branco – Jovem", type: "Dragão", size: "Grande", alignment: "Caótico e mau", ac: 17, hp: 133, cr: "6", xp: 2300, speed: "12 m, escavar 9 m, natação 9 m, voo 18 m" },
  { id: "dragao-preto-jovem", name: "Dragão Preto – Jovem", type: "Dragão", size: "Grande", alignment: "Caótico e mau", ac: 18, hp: 127, cr: "7", xp: 2900, speed: "12 m, natação 12 m, voo 24 m",
    str: 19, dex: 14, con: 17, int: 12, wis: 11, cha: 15,
    savingThrows: "Des +5, Con +6, Sab +3, Car +5",
    skills: "Percepção +6, Furtividade +5",
    damageImmunities: "Ácido",
    senses: "Visão cega 9 m, visão no escuro 36 m, Percepção passiva 16", languages: "Comum, Dracônico",
    traits: [
      { name: "Anfíbio", description: "O dragão pode respirar tanto ar quanto água." },
    ],
    actions: [
      { name: "Ataques Múltiplos", description: "O dragão faz três ataques: um com a mordida e dois com as garras." },
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 3 m, um alvo. Acerto: 15 (2d10+4) de dano perfurante mais 4 (1d8) de dano de ácido." },
      { name: "Garra", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 11 (2d6+4) de dano cortante." },
      { name: "Sopro de Ácido (Recarrega 5–6)", description: "O dragão exala ácido numa linha de 9 m por 1,5 m. Cada criatura na linha faz teste de resistência de Destreza CD 14, sofrendo 49 (11d8) de dano de ácido, ou metade se passar." },
    ] },
  { id: "dragao-verde-jovem", name: "Dragão Verde – Jovem", type: "Dragão", size: "Grande", alignment: "Leal e mau", ac: 18, hp: 136, cr: "8", xp: 3900, speed: "12 m, natação 12 m, voo 24 m" },
  { id: "dragao-vermelho-jovem", name: "Dragão Vermelho – Jovem", type: "Dragão", size: "Grande", alignment: "Caótico e mau", ac: 18, hp: 178, cr: "10", xp: 5900, speed: "12 m, escalar 12 m, voo 24 m",
    str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19,
    savingThrows: "Des +4, Con +9, Sab +4, Car +8",
    skills: "Percepção +8, Furtividade +4",
    damageImmunities: "Fogo",
    senses: "Visão cega 9 m, visão no escuro 36 m, Percepção passiva 18", languages: "Comum, Dracônico",
    actions: [
      { name: "Ataques Múltiplos", description: "O dragão faz três ataques: um com a mordida e dois com as garras." },
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +10 para acertar, alcance 3 m, um alvo. Acerto: 17 (2d10+6) de dano perfurante mais 3 (1d6) de dano de fogo." },
      { name: "Garra", description: "Ataque Corpo-a-Corpo com Arma: +10 para acertar, alcance 1,5 m, um alvo. Acerto: 13 (2d6+6) de dano cortante." },
      { name: "Sopro de Fogo (Recarrega 5–6)", description: "O dragão exala fogo num cone de 9 m. Cada criatura na área faz teste de resistência de Destreza CD 17, sofrendo 56 (16d6) de dano de fogo, ou metade se passar." },
    ] },
  { id: "dragao-azul-jovem", name: "Dragão Azul – Jovem", type: "Dragão", size: "Grande", alignment: "Leal e mau", ac: 18, hp: 152, cr: "9", xp: 5000, speed: "12 m, escavar 6 m, voo 24 m" },
  { id: "dragao-bronze-jovem", name: "Dragão de Bronze – Jovem", type: "Dragão", size: "Grande", alignment: "Leal e bom", ac: 18, hp: 142, cr: "8", xp: 3900, speed: "12 m, natação 12 m, voo 24 m" },
  { id: "dragao-ouro-jovem", name: "Dragão de Ouro – Jovem", type: "Dragão", size: "Grande", alignment: "Leal e bom", ac: 18, hp: 178, cr: "10", xp: 5900, speed: "12 m, natação 12 m, voo 24 m" },
  { id: "dragao-sombras", name: "Dragão das Sombras", type: "Dragão", size: "Grande", alignment: "Caótico e mau", ac: 13, hp: 142, cr: "13", xp: 10000, speed: "12 m, voo 24 m" },
  { id: "quimera", name: "Quimera", type: "Dragão", size: "Grande", alignment: "Caótico e mau", ac: 14, hp: 114, cr: "6", xp: 2300, speed: "9 m, voo 18 m" },
  { id: "wyvern", name: "Wyvern", type: "Dragão", size: "Grande", alignment: "Sem tendência", ac: 13, hp: 110, cr: "6", xp: 2300, speed: "6 m, voo 24 m",
    str: 19, dex: 10, con: 16, int: 5, wis: 12, cha: 6,
    skills: "Percepção +4", senses: "Visão no escuro 18 m, Percepção passiva 14", languages: "—",
    actions: [
      { name: "Ataques Múltiplos", description: "A wyvern faz dois ataques: um com a mordida e um com o ferrão. Voando, pode usar as garras no lugar da mordida." },
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 3 m, uma criatura. Acerto: 11 (2d6+4) de dano perfurante." },
      { name: "Garras", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 13 (2d8+4) de dano cortante." },
      { name: "Ferrão", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 3 m, uma criatura. Acerto: 11 (2d6+4) de dano perfurante. O alvo faz teste de resistência de Constituição CD 15, sofrendo 24 (7d6) de dano de veneno ao falhar, ou metade se passar." },
    ] },
  { id: "tartaruga-dragao", name: "Tartaruga Dragão", type: "Dragão", size: "Imenso", alignment: "Neutro", ac: 20, hp: 341, cr: "17", xp: 18000, speed: "6 m, natação 13,5 m" },

  // ── Gigantes ─────────────────────────────────────────────────────────────────
  { id: "ogro", name: "Ogro", type: "Gigante", size: "Grande", alignment: "Caótico e mau", ac: 11, hp: 59, cr: "2", xp: 450, speed: "12 m",
    str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7,
    senses: "Visão no escuro 18 m, Percepção passiva 8", languages: "Comum, Gigante",
    actions: [
      { name: "Clava Grande", description: "Ataque Corpo-a-Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 13 (2d8+4) de dano contundente." },
      { name: "Azagaia", description: "Ataque Corpo-a-Corpo ou à Distância com Arma: +6 para acertar, alcance 1,5 m ou distância 9/36 m, um alvo. Acerto: 11 (2d6+4) de dano perfurante." },
    ] },
  { id: "troll", name: "Troll", type: "Gigante", size: "Grande", alignment: "Caótico e mau", ac: 15, hp: 84, cr: "5", xp: 1800, speed: "9 m",
    str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7,
    skills: "Percepção +2", senses: "Visão no escuro 18 m, Percepção passiva 12", languages: "Gigante",
    traits: [
      { name: "Faro Aguçado", description: "O troll tem vantagem em testes de Sabedoria (Percepção) que dependam do olfato." },
      { name: "Regeneração", description: "O troll recupera 10 pontos de vida no início de seu turno. Se sofrer dano de ácido ou fogo, esse traço não funciona no próximo turno. O troll só morre se começar o turno com 0 PV e não regenerar." },
    ],
    actions: [
      { name: "Ataques Múltiplos", description: "O troll faz três ataques: um com a mordida e dois com as garras." },
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (1d6+4) de dano perfurante." },
      { name: "Garras", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 11 (2d6+4) de dano cortante." },
    ] },
  { id: "ettin", name: "Ettin", type: "Gigante", size: "Grande", alignment: "Caótico e mau", ac: 12, hp: 85, cr: "4", xp: 1100, speed: "12 m" },
  { id: "ciclope", name: "Ciclope", type: "Gigante", size: "Enorme", alignment: "Caótico e neutro", ac: 14, hp: 138, cr: "6", xp: 2300, speed: "9 m" },
  { id: "fomori", name: "Fomori", type: "Gigante", size: "Grande", alignment: "Caótico e mau", ac: 14, hp: 230, cr: "8", xp: 3900, speed: "9 m" },
  { id: "oni", name: "Oni", type: "Gigante", size: "Grande", alignment: "Leal e mau", ac: 16, hp: 110, cr: "7", xp: 2900, speed: "9 m, voo 12 m" },
  { id: "gigante-colina", name: "Gigante da Colina", type: "Gigante", size: "Enorme", alignment: "Caótico e mau", ac: 13, hp: 105, cr: "5", xp: 1800, speed: "12 m",
    str: 21, dex: 8, con: 19, int: 5, wis: 9, cha: 6,
    skills: "Percepção +2", senses: "Percepção passiva 12", languages: "Gigante",
    actions: [
      { name: "Ataques Múltiplos", description: "O gigante faz dois ataques com sua clava grande." },
      { name: "Clava Grande", description: "Ataque Corpo-a-Corpo com Arma: +8 para acertar, alcance 3 m, um alvo. Acerto: 18 (3d8+5) de dano contundente." },
      { name: "Pedregulho", description: "Ataque à Distância com Arma: +8 para acertar, distância 18/72 m, um alvo. Acerto: 21 (3d10+5) de dano contundente." },
    ] },
  { id: "gigante-pedra", name: "Gigante de Pedra", type: "Gigante", size: "Enorme", alignment: "Neutro", ac: 17, hp: 126, cr: "7", xp: 2900, speed: "12 m" },
  { id: "gigante-gelo", name: "Gigante do Gelo", type: "Gigante", size: "Enorme", alignment: "Neutro e mau", ac: 15, hp: 138, cr: "9", xp: 5000, speed: "12 m" },
  { id: "gigante-fogo", name: "Gigante do Fogo", type: "Gigante", size: "Enorme", alignment: "Leal e mau", ac: 18, hp: 162, cr: "9", xp: 5000, speed: "9 m" },
  { id: "gigante-nuvem", name: "Gigante das Nuvens", type: "Gigante", size: "Imenso", alignment: "Neutro e bom ou Neutro e mau", ac: 14, hp: 200, cr: "9", xp: 5000, speed: "12 m" },
  { id: "gigante-tempestade", name: "Gigante da Tempestade", type: "Gigante", size: "Imenso", alignment: "Caótico e bom", ac: 16, hp: 230, cr: "13", xp: 10000, speed: "15 m, natação 15 m" },

  // ── Elementais ───────────────────────────────────────────────────────────────
  { id: "elemental-ar", name: "Elemental do Ar", type: "Elemental", size: "Grande", alignment: "Neutro", ac: 15, hp: 90, cr: "5", xp: 1800, speed: "0 m, voo 27 m" },
  { id: "elemental-terra", name: "Elemental da Terra", type: "Elemental", size: "Grande", alignment: "Neutro", ac: 17, hp: 126, cr: "5", xp: 1800, speed: "9 m, escavar 9 m" },
  { id: "elemental-fogo", name: "Elemental do Fogo", type: "Elemental", size: "Grande", alignment: "Neutro", ac: 13, hp: 102, cr: "5", xp: 1800, speed: "15 m",
    str: 10, dex: 17, con: 16, int: 6, wis: 10, cha: 7,
    damageResistances: "Contundente, cortante e perfurante de armas não-mágicas",
    damageImmunities: "Fogo, veneno",
    conditionImmunities: "Exausto, agarrado, paralisado, petrificado, envenenado, caído, contido, inconsciente",
    senses: "Visão no escuro 18 m, Percepção passiva 10", languages: "Ígneo",
    traits: [
      { name: "Forma de Fogo", description: "O elemental pode se mover através de um espaço tão estreito quanto 2,5 cm sem se espremer. Uma criatura que tocá-lo ou acertá-lo a até 1,5 m com ataque corpo-a-corpo sofre 5 (1d10) de dano de fogo. Pode entrar no espaço de outra criatura. Tudo que ele tocar pega fogo." },
      { name: "Iluminação", description: "O elemental emite luz plena num raio de 9 m e penumbra por mais 9 m." },
      { name: "Suscetibilidade à Água", description: "O elemental sofre 1 de dano de frio para cada 1,5 m que se mover em água, ou para cada 1 litro de água jogado nele." },
    ],
    actions: [
      { name: "Ataques Múltiplos", description: "O elemental faz dois ataques de toque." },
      { name: "Toque", description: "Ataque Corpo-a-Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 10 (2d6+3) de dano de fogo. Se o alvo for criatura ou objeto inflamável, pega fogo (5 (1d10) de dano de fogo no início de cada um de seus turnos)." },
    ] },
  { id: "elemental-agua", name: "Elemental da Água", type: "Elemental", size: "Grande", alignment: "Neutro", ac: 14, hp: 114, cr: "5", xp: 1800, speed: "9 m, natação 27 m" },
  { id: "azer", name: "Azer", type: "Elemental", size: "Médio", alignment: "Leal e neutro", ac: 17, hp: 39, cr: "2", xp: 450, speed: "9 m" },
  { id: "magmin", name: "Magmin", type: "Elemental", size: "Pequeno", alignment: "Caótico e neutro", ac: 14, hp: 9, cr: "1/2", xp: 100, speed: "9 m" },
  { id: "gargula", name: "Gárgula", type: "Elemental", size: "Médio", alignment: "Caótico e mau", ac: 15, hp: 52, cr: "2", xp: 450, speed: "9 m, voo 18 m",
    str: 15, dex: 11, con: 16, int: 6, wis: 11, cha: 7,
    damageResistances: "Contundente, cortante e perfurante de armas não-mágicas que não sejam de adamante",
    damageImmunities: "Veneno",
    conditionImmunities: "Exausto, petrificado, envenenado",
    senses: "Visão no escuro 18 m, Percepção passiva 10", languages: "Terrano",
    traits: [
      { name: "Falso Aspecto", description: "Enquanto a gárgula permanece imóvel, ela é indistinguível de uma estátua inanimada." },
    ],
    actions: [
      { name: "Ataques Múltiplos", description: "A gárgula faz dois ataques: um com a mordida e um com as garras." },
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d6+2) de dano perfurante." },
      { name: "Garras", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d6+2) de dano cortante." },
    ] },
  { id: "galeb-duhr", name: "Galeb Duhr", type: "Elemental", size: "Médio", alignment: "Neutro", ac: 16, hp: 85, cr: "6", xp: 2300, speed: "4,5 m" },
  { id: "anomalia-agua", name: "Anomalia da Água", type: "Elemental", size: "Grande", alignment: "Neutro", ac: 13, hp: 58, cr: "3", xp: 700, speed: "0 m, natação 18 m" },
  { id: "cacador-invisivel", name: "Caçador Invisível", type: "Elemental", size: "Médio", alignment: "Neutro", ac: 14, hp: 104, cr: "6", xp: 2300, speed: "15 m, voo 15 m" },
  { id: "xorn", name: "Xorn", type: "Elemental", size: "Médio", alignment: "Neutro", ac: 19, hp: 73, cr: "5", xp: 1800, speed: "6 m, escavar 6 m" },
  { id: "dao", name: "Dao", type: "Elemental", size: "Grande", alignment: "Neutro e mau", ac: 18, hp: 187, cr: "11", xp: 7200, speed: "9 m, voo 9 m, escavar 9 m" },
  { id: "djinn", name: "Djinn", type: "Elemental", size: "Grande", alignment: "Caótico e bom", ac: 17, hp: 161, cr: "11", xp: 7200, speed: "9 m, voo 27 m" },
  { id: "efreet", name: "Efreet", type: "Elemental", size: "Grande", alignment: "Leal e mau", ac: 17, hp: 200, cr: "11", xp: 7200, speed: "9 m, voo 24 m" },
  { id: "marid", name: "Marid", type: "Elemental", size: "Grande", alignment: "Caótico e neutro", ac: 17, hp: 229, cr: "11", xp: 7200, speed: "9 m, natação 27 m" },

  // ── Corruptores – Demônios ───────────────────────────────────────────────────
  { id: "manes", name: "Manes", type: "Corruptor", size: "Pequeno", alignment: "Caótico e mau", ac: 9, hp: 9, cr: "1/8", xp: 25, speed: "9 m" },
  { id: "dretch", name: "Dretch", type: "Corruptor", size: "Pequeno", alignment: "Caótico e mau", ac: 11, hp: 18, cr: "1/4", xp: 50, speed: "6 m" },
  { id: "quasit", name: "Quasit", type: "Corruptor", size: "Miúdo", alignment: "Caótico e mau", ac: 13, hp: 7, cr: "1", xp: 200, speed: "12 m" },
  { id: "barlgura", name: "Barlgura", type: "Corruptor", size: "Grande", alignment: "Caótico e mau", ac: 15, hp: 68, cr: "5", xp: 1800, speed: "12 m, escalar 12 m" },
  { id: "chasme", name: "Chasme", type: "Corruptor", size: "Grande", alignment: "Caótico e mau", ac: 15, hp: 84, cr: "6", xp: 2300, speed: "9 m, voo 24 m" },
  { id: "vrock", name: "Vrock", type: "Corruptor", size: "Grande", alignment: "Caótico e mau", ac: 15, hp: 104, cr: "6", xp: 2300, speed: "12 m, voo 18 m" },
  { id: "hezrou", name: "Hezrou", type: "Corruptor", size: "Grande", alignment: "Caótico e mau", ac: 16, hp: 136, cr: "8", xp: 3900, speed: "9 m" },
  { id: "glabrezu", name: "Glabrezu", type: "Corruptor", size: "Grande", alignment: "Caótico e mau", ac: 17, hp: 157, cr: "9", xp: 5000, speed: "12 m" },
  { id: "nalfeshnee", name: "Nalfeshnee", type: "Corruptor", size: "Grande", alignment: "Caótico e mau", ac: 15, hp: 184, cr: "13", xp: 10000, speed: "9 m, voo 12 m" },
  { id: "marilith", name: "Marilith", type: "Corruptor", size: "Grande", alignment: "Caótico e mau", ac: 18, hp: 189, cr: "16", xp: 15000, speed: "12 m" },
  { id: "goristro", name: "Goristro", type: "Corruptor", size: "Enorme", alignment: "Caótico e mau", ac: 19, hp: 310, cr: "17", xp: 18000, speed: "15 m" },
  { id: "balor", name: "Balor", type: "Corruptor", size: "Enorme", alignment: "Caótico e mau", ac: 19, hp: 262, cr: "19", xp: 22000, speed: "12 m, voo 24 m" },

  // ── Corruptores – Diabos ─────────────────────────────────────────────────────
  { id: "lemure", name: "Lemure", type: "Corruptor", size: "Médio", alignment: "Leal e mau", ac: 7, hp: 13, cr: "0", xp: 10, speed: "4,5 m" },
  { id: "imp", name: "Imp", type: "Corruptor", size: "Miúdo", alignment: "Leal e mau", ac: 13, hp: 10, cr: "1", xp: 200, speed: "6 m, voo 12 m",
    str: 6, dex: 17, con: 13, int: 11, wis: 12, cha: 14,
    skills: "Enganação +4, Intuição +3, Persuasão +4, Furtividade +5",
    damageResistances: "Frio; contundente, cortante e perfurante de armas não-mágicas que não sejam de prata",
    damageImmunities: "Fogo, veneno", conditionImmunities: "Envenenado",
    senses: "Visão no escuro 36 m, Percepção passiva 11", languages: "Infernal, Comum",
    traits: [
      { name: "Mudança de Forma", description: "O imp pode assumir a forma de um rato, corvo, aranha ou javali, ou retornar à sua forma verdadeira. As estatísticas são as mesmas em cada forma, exceto o deslocamento." },
      { name: "Resistência a Magia do Diabo", description: "O imp tem vantagem em testes de resistência contra magias e outros efeitos mágicos." },
      { name: "Camuflagem por Invisibilidade", description: "O imp pode se tornar invisível como ação até atacar ou se concentrar." },
    ],
    actions: [
      { name: "Ferrão (Forma de Besta)", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 5 (1d4+3) de dano perfurante mais 10 (3d6) de dano de veneno (teste de Constituição CD 11 reduz à metade)." },
    ] },
  { id: "diabo-barbudo", name: "Diabo Barbudo", type: "Corruptor", size: "Médio", alignment: "Leal e mau", ac: 13, hp: 52, cr: "3", xp: 700, speed: "9 m" },
  { id: "diabo-acorrentado", name: "Diabo Acorrentado", type: "Corruptor", size: "Médio", alignment: "Leal e mau", ac: 16, hp: 85, cr: "8", xp: 3900, speed: "9 m" },
  { id: "diabo-osseo", name: "Diabo Ósseo", type: "Corruptor", size: "Grande", alignment: "Leal e mau", ac: 19, hp: 142, cr: "9", xp: 5000, speed: "12 m, voo 18 m" },
  { id: "erinyes", name: "Erinyes", type: "Corruptor", size: "Médio", alignment: "Leal e mau", ac: 18, hp: 153, cr: "12", xp: 8400, speed: "9 m, voo 18 m" },
  { id: "diabo-cornudo", name: "Diabo Cornudo", type: "Corruptor", size: "Grande", alignment: "Leal e mau", ac: 18, hp: 178, cr: "11", xp: 7200, speed: "9 m, voo 18 m" },
  { id: "diabo-gelo", name: "Diabo do Gelo", type: "Corruptor", size: "Grande", alignment: "Leal e mau", ac: 18, hp: 180, cr: "14", xp: 11500, speed: "12 m" },
  { id: "pit-fiend", name: "Pit Fiend", type: "Corruptor", size: "Grande", alignment: "Leal e mau", ac: 19, hp: 300, cr: "20", xp: 25000, speed: "9 m, voo 18 m" },

  // ── Corruptores – Outros ─────────────────────────────────────────────────────
  { id: "cambion", name: "Cambion", type: "Corruptor", size: "Médio", alignment: "Qualquer mau", ac: 19, hp: 82, cr: "5", xp: 1800, speed: "9 m, voo 18 m" },
  { id: "sucubo-incubo", name: "Súcubo / Íncubo", type: "Corruptor", size: "Médio", alignment: "Neutro e mau", ac: 15, hp: 66, cr: "4", xp: 1100, speed: "9 m, voo 18 m",
    str: 8, dex: 17, con: 13, int: 15, wis: 12, cha: 20,
    skills: "Enganação +9, Intuição +5, Percepção +5, Persuasão +9, Furtividade +7",
    damageResistances: "Frio, fogo, elétrico, veneno; contundente, cortante e perfurante de armas não-mágicas",
    senses: "Visão no escuro 18 m, Percepção passiva 15", languages: "Abissal, Comum, Infernal, telepatia 18 m",
    traits: [
      { name: "Telepatia Mística", description: "O súcubo pode se comunicar telepaticamente com qualquer criatura que ele tenha enfeitiçado, mesmo que não compartilhem idioma, em qualquer distância no mesmo plano." },
      { name: "Mudança de Forma", description: "Pode assumir a forma de um humanoide Pequeno ou Médio, ou retornar à forma verdadeira. As estatísticas são as mesmas em cada forma; sem asas, não pode voar." },
    ],
    actions: [
      { name: "Garra (Apenas Forma de Demônio)", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, uma criatura. Acerto: 6 (1d6+3) de dano cortante." },
      { name: "Beijo Drenante", description: "Beija uma criatura enfeitiçada ou disposta. O alvo faz teste de resistência de Constituição CD 15, sofrendo 32 (5d10+5) de dano psíquico, ou metade se passar. O PV máximo do alvo reduz nesse valor (recuperado com descanso longo); chega a 0 PV se reduzir a 0." },
      { name: "Encantar", description: "Um humanoide a até 9 m faz teste de resistência de Sabedoria CD 15 ou fica magicamente enfeitiçado por 1 dia. O alvo obedece a comandos verbais; repete o teste ao sofrer dano." },
      { name: "Sonho (Forma Etérea)", description: "Em forma etérea, entra no espaço de um humanoide adormecido para influenciar seus sonhos. O alvo sofre 32 (5d10+5) de dano psíquico ao acordar (sem descanso útil)." },
    ] },
  { id: "rakshasa", name: "Rakshasa", type: "Corruptor", size: "Médio", alignment: "Leal e mau", ac: 16, hp: 110, cr: "13", xp: 10000, speed: "9 m" },
  { id: "cao-infernal", name: "Cão Infernal", type: "Corruptor", size: "Médio", alignment: "Leal e mau", ac: 14, hp: 45, cr: "3", xp: 700, speed: "15 m",
    str: 17, dex: 12, con: 14, int: 6, wis: 13, cha: 6,
    skills: "Percepção +5", damageImmunities: "Fogo",
    senses: "Visão no escuro 18 m, Percepção passiva 15", languages: "Entende Infernal, mas não pode falar",
    traits: [
      { name: "Audição e Olfato Aguçados", description: "O cão tem vantagem em testes de Sabedoria (Percepção) que dependam da audição ou do olfato." },
      { name: "Táticas de Matilha", description: "O cão tem vantagem em ataques contra uma criatura se ao menos um aliado estiver a até 1,5 m dela e não estiver incapacitado." },
    ],
    actions: [
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (1d8+3) de dano perfurante mais 7 (2d6) de dano de fogo." },
      { name: "Sopro de Fogo (Recarrega 5–6)", description: "O cão exala fogo num cone de 4,5 m. Cada criatura na área faz teste de resistência de Destreza CD 12, sofrendo 21 (6d6) de dano de fogo, ou metade se passar." },
    ] },
  { id: "pesadelo", name: "Pesadelo", type: "Corruptor", size: "Grande", alignment: "Neutro e mau", ac: 13, hp: 68, cr: "3", xp: 700, speed: "18 m, voo 27 m" },
  { id: "mezzoloth", name: "Mezzoloth", type: "Corruptor", size: "Médio", alignment: "Neutro e mau", ac: 18, hp: 75, cr: "5", xp: 1800, speed: "9 m" },
  { id: "nycaloth", name: "Nycaloth", type: "Corruptor", size: "Grande", alignment: "Neutro e mau", ac: 18, hp: 123, cr: "9", xp: 5000, speed: "9 m, voo 12 m" },
  { id: "arcanaloth", name: "Arcanaloth", type: "Corruptor", size: "Médio", alignment: "Neutro e mau", ac: 17, hp: 104, cr: "12", xp: 8400, speed: "9 m, voo 18 m" },
  { id: "ultroloth", name: "Ultroloth", type: "Corruptor", size: "Médio", alignment: "Neutro e mau", ac: 19, hp: 153, cr: "13", xp: 10000, speed: "9 m, voo 18 m" },

  // ── Aberrações ───────────────────────────────────────────────────────────────
  { id: "abolete", name: "Abolete", type: "Aberração", size: "Grande", alignment: "Leal e mau", ac: 17, hp: 135, cr: "10", xp: 5900, speed: "3 m, natação 12 m" },
  { id: "abocanhador", name: "Abocanhador Matraqueante", type: "Aberração", size: "Médio", alignment: "Neutro", ac: 9, hp: 67, cr: "2", xp: 450, speed: "3 m, natação 3 m" },
  { id: "chuul", name: "Chuul", type: "Aberração", size: "Grande", alignment: "Neutro e mau", ac: 16, hp: 93, cr: "4", xp: 1100, speed: "9 m, natação 9 m" },
  { id: "devorador-intelecto", name: "Devorador de Intelecto", type: "Aberração", size: "Miúdo", alignment: "Leal e mau", ac: 12, hp: 21, cr: "2", xp: 450, speed: "4,5 m" },
  { id: "devorador-mentes", name: "Devorador de Mentes", type: "Aberração", size: "Médio", alignment: "Leal e mau", ac: 15, hp: 71, cr: "7", xp: 2900, speed: "9 m",
    str: 11, dex: 12, con: 12, int: 19, wis: 17, cha: 17,
    savingThrows: "Int +7, Sab +6, Car +6",
    skills: "Arcanismo +7, Enganação +6, Intuição +6, Percepção +6, Furtividade +4",
    senses: "Visão no escuro 36 m, Percepção passiva 16", languages: "Linguagem Profunda, Subterrâneo, telepatia 36 m",
    traits: [
      { name: "Resistência a Magia", description: "O devorador de mentes tem vantagem em testes de resistência contra magias e outros efeitos mágicos." },
      { name: "Conjuração Inata (Psiônica)", description: "Atributo de conjuração Inteligência (CD 15). À vontade: detectar pensamentos, levitação. 1/dia cada: dominar monstro, sugestão em massa." },
    ],
    actions: [
      { name: "Tentáculos", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, uma criatura. Acerto: 15 (2d10+4) de dano psíquico. Se o alvo for Médio ou menor, fica agarrado (fuga CD 15) e atordoado enquanto agarrado." },
      { name: "Extrair Cérebro", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, uma criatura agarrada, incapacitada e humanoide. Acerto: 55 (10d10) de dano perfurante. Se reduzir o alvo a 0 PV, o devorador mata-o extraindo e devorando seu cérebro." },
      { name: "Explosão Mental (Recarrega 5–6)", description: "Emite energia psíquica num cone de 18 m. Cada criatura na área faz teste de resistência de Inteligência CD 15, sofrendo 22 (4d8+4) de dano psíquico e ficando atordoada por 1 minuto ao falhar (repete ao fim de cada turno)." },
    ] },
  { id: "flumph", name: "Flumph", type: "Aberração", size: "Pequeno", alignment: "Leal e bom", ac: 12, hp: 7, cr: "1/8", xp: 25, speed: "1,5 m, voo 9 m" },
  { id: "grell", name: "Grell", type: "Aberração", size: "Médio", alignment: "Neutro e mau", ac: 12, hp: 55, cr: "3", xp: 700, speed: "0 m, voo 12 m" },
  { id: "grick", name: "Grick", type: "Aberração", size: "Médio", alignment: "Neutro", ac: 14, hp: 27, cr: "2", xp: 450, speed: "9 m, escalar 9 m" },
  { id: "notico", name: "Nótico", type: "Aberração", size: "Médio", alignment: "Neutro e mau", ac: 15, hp: 45, cr: "2", xp: 450, speed: "9 m" },
  { id: "observador", name: "Observador", type: "Aberração", size: "Grande", alignment: "Leal e mau", ac: 18, hp: 93, cr: "13", xp: 10000, speed: "0 m, voo 9 m" },
  { id: "espectador", name: "Espectador", type: "Aberração", size: "Médio", alignment: "Leal e neutro", ac: 14, hp: 39, cr: "3", xp: 700, speed: "0 m, voo 9 m" },
  { id: "otyugh", name: "Otyugh", type: "Aberração", size: "Grande", alignment: "Neutro", ac: 14, hp: 114, cr: "5", xp: 1800, speed: "9 m" },
  { id: "slaad-vermelho", name: "Slaad Vermelho", type: "Aberração", size: "Grande", alignment: "Caótico e neutro", ac: 14, hp: 93, cr: "5", xp: 1800, speed: "9 m" },
  { id: "slaad-azul", name: "Slaad Azul", type: "Aberração", size: "Grande", alignment: "Caótico e neutro", ac: 15, hp: 123, cr: "7", xp: 2900, speed: "9 m" },
  { id: "slaad-morte", name: "Slaad da Morte", type: "Aberração", size: "Médio", alignment: "Caótico e mau", ac: 18, hp: 170, cr: "10", xp: 5900, speed: "9 m" },

  // ── Monstruosidades ──────────────────────────────────────────────────────────
  { id: "ankheg", name: "Ankheg", type: "Monstruosidade", size: "Grande", alignment: "Sem tendência", ac: 14, hp: 39, cr: "2", xp: 450, speed: "9 m, escavar 3 m" },
  { id: "basilisco", name: "Basilisco", type: "Monstruosidade", size: "Médio", alignment: "Sem tendência", ac: 15, hp: 52, cr: "3", xp: 700, speed: "6 m",
    str: 16, dex: 8, con: 15, int: 2, wis: 8, cha: 7,
    senses: "Visão no escuro 18 m, Percepção passiva 9", languages: "—",
    traits: [
      { name: "Olhar Petrificante", description: "Se uma criatura iniciar seu turno a até 9 m e os dois puderem se ver, o basilisco pode forçar um teste de resistência de Constituição CD 12 se não estiver incapacitado. Ao falhar por 5 ou menos, fica contida e começa a petrificar; ao falhar por mais, fica petrificada instantaneamente. A criatura contida repete no fim do turno seguinte: sucesso encerra, falha petrifica." },
    ],
    actions: [
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 10 (2d6+3) de dano perfurante mais 7 (2d6) de dano de veneno." },
    ] },
  { id: "behir", name: "Behir", type: "Monstruosidade", size: "Enorme", alignment: "Neutro e mau", ac: 17, hp: 168, cr: "11", xp: 7200, speed: "15 m, escalar 12 m" },
  { id: "bulette", name: "Bulette", type: "Monstruosidade", size: "Grande", alignment: "Sem tendência", ac: 17, hp: 94, cr: "5", xp: 1800, speed: "9 m, escavar 9 m" },
  { id: "centauro", name: "Centauro", type: "Monstruosidade", size: "Grande", alignment: "Neutro e bom", ac: 12, hp: 45, cr: "2", xp: 450, speed: "15 m" },
  { id: "cocatriz", name: "Cocatriz", type: "Monstruosidade", size: "Pequeno", alignment: "Sem tendência", ac: 11, hp: 27, cr: "1/2", xp: 100, speed: "6 m, voo 12 m" },
  { id: "drider", name: "Drider", type: "Monstruosidade", size: "Grande", alignment: "Caótico e mau", ac: 19, hp: 123, cr: "6", xp: 2300, speed: "9 m, escalar 9 m" },
  { id: "espantalho", name: "Espantalho", type: "Constructo", size: "Médio", alignment: "Caótico e mau", ac: 11, hp: 36, cr: "1/4", xp: 50, speed: "9 m" },
  { id: "estrangulador", name: "Estrangulador", type: "Monstruosidade", size: "Enorme", alignment: "Sem tendência", ac: 17, hp: 114, cr: "5", xp: 1800, speed: "12 m, escalar 12 m" },
  { id: "ettercap", name: "Ettercap", type: "Monstruosidade", size: "Médio", alignment: "Neutro e mau", ac: 13, hp: 44, cr: "2", xp: 450, speed: "9 m, escalar 9 m" },
  { id: "esfinge-fema", name: "Esfinge Fêmea", type: "Monstruosidade", size: "Grande", alignment: "Leal e neutro", ac: 17, hp: 136, cr: "11", xp: 7200, speed: "12 m, voo 18 m" },
  { id: "esfinge-macho", name: "Esfinge Macho", type: "Monstruosidade", size: "Grande", alignment: "Leal e neutro", ac: 17, hp: 199, cr: "17", xp: 18000, speed: "12 m, voo 18 m" },
  { id: "gorgon", name: "Gorgon", type: "Monstruosidade", size: "Grande", alignment: "Sem tendência", ac: 19, hp: 114, cr: "5", xp: 1800, speed: "12 m" },
  { id: "grifo", name: "Grifo", type: "Monstruosidade", size: "Grande", alignment: "Neutro", ac: 12, hp: 59, cr: "2", xp: 450, speed: "9 m, voo 27 m" },
  { id: "harpia", name: "Harpia", type: "Monstruosidade", size: "Médio", alignment: "Caótico e mau", ac: 11, hp: 38, cr: "1", xp: 200, speed: "6 m, voo 12 m",
    str: 12, dex: 13, con: 12, int: 7, wis: 10, cha: 13,
    senses: "Percepção passiva 10", languages: "Comum",
    actions: [
      { name: "Ataques Múltiplos", description: "A harpia faz dois ataques: um com as garras e um com a clava." },
      { name: "Garras", description: "Ataque Corpo-a-Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 6 (2d4+1) de dano cortante." },
      { name: "Clava", description: "Ataque Corpo-a-Corpo com Arma: +3 para acertar, alcance 1,5 m, um alvo. Acerto: 3 (1d4+1) de dano contundente." },
      { name: "Canção Atrativa", description: "A harpia canta. Cada humanoide e gigante a até 90 m que possa ouvir faz teste de resistência de Sabedoria CD 11 ou fica enfeitiçado até a canção terminar; o alvo move-se em direção à harpia pelo caminho mais curto e seguro. Repete o teste se sofrer dano." },
    ] },
  { id: "hidra", name: "Hidra", type: "Monstruosidade", size: "Enorme", alignment: "Sem tendência", ac: 15, hp: 172, cr: "8", xp: 3900, speed: "9 m, natação 9 m" },
  { id: "hipogrifo", name: "Hipogrifo", type: "Monstruosidade", size: "Grande", alignment: "Sem tendência", ac: 11, hp: 38, cr: "1", xp: 200, speed: "12 m, voo 18 m" },
  { id: "horror-gancho", name: "Horror de Gancho", type: "Monstruosidade", size: "Grande", alignment: "Caótico e mau", ac: 11, hp: 75, cr: "3", xp: 700, speed: "9 m, escalar 9 m" },
  { id: "horror-elmo", name: "Horror de Elmo", type: "Monstruosidade", size: "Médio", alignment: "Neutro e mau", ac: 20, hp: 60, cr: "5", xp: 1800, speed: "9 m" },
  { id: "kraken", name: "Kraken", type: "Monstruosidade", size: "Imenso", alignment: "Caótico e mau", ac: 18, hp: 472, cr: "23", xp: 50000, speed: "6 m, natação 18 m" },
  { id: "lamia", name: "Lâmia", type: "Monstruosidade", size: "Grande", alignment: "Caótico e mau", ac: 13, hp: 97, cr: "4", xp: 1100, speed: "12 m" },
  { id: "manticora", name: "Manticora", type: "Monstruosidade", size: "Grande", alignment: "Leal e mau", ac: 14, hp: 68, cr: "3", xp: 700, speed: "9 m, voo 15 m",
    str: 17, dex: 16, con: 17, int: 7, wis: 12, cha: 8,
    senses: "Visão no escuro 18 m, Percepção passiva 11", languages: "Comum",
    traits: [
      { name: "Cauda de Espinhos", description: "A manticora tem 24 espinhos na cauda. Os espinhos usados se regeneram quando ela termina um descanso longo." },
    ],
    actions: [
      { name: "Ataques Múltiplos", description: "A manticora faz três ataques: um com a mordida e dois com as garras, ou três com espinhos da cauda." },
      { name: "Mordida", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 7 (1d8+3) de dano perfurante." },
      { name: "Garra", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, um alvo. Acerto: 6 (1d6+3) de dano cortante." },
      { name: "Espinho da Cauda", description: "Ataque à Distância com Arma: +5 para acertar, distância 30/60 m, um alvo. Acerto: 7 (1d8+3) de dano perfurante." },
    ] },
  { id: "medusa", name: "Medusa", type: "Monstruosidade", size: "Médio", alignment: "Leal e mau", ac: 15, hp: 127, cr: "6", xp: 2300, speed: "9 m",
    str: 10, dex: 15, con: 16, int: 12, wis: 13, cha: 15,
    skills: "Enganação +5, Intuição +4, Percepção +4, Furtividade +5",
    senses: "Visão no escuro 18 m, Percepção passiva 14", languages: "Comum",
    traits: [
      { name: "Olhar Petrificante", description: "Se uma criatura iniciar seu turno a até 9 m da medusa e os dois puderem se ver, a medusa pode forçar um teste de resistência de Constituição CD 14 se não estiver incapacitada. Ao falhar por 5 ou menos, fica contida e começa a petrificar; ao falhar por mais, fica petrificada instantaneamente. Uma criatura que evita o olhar tem desvantagem no ataque contra a medusa." },
    ],
    actions: [
      { name: "Ataques Múltiplos", description: "A medusa faz um ataque com seu cabelo de serpentes e um com o arco longo, ou dois ataques com o arco longo." },
      { name: "Cabelo de Serpentes", description: "Ataque Corpo-a-Corpo com Arma: +5 para acertar, alcance 1,5 m, uma criatura. Acerto: 5 (1d4+3) de dano perfurante mais 14 (4d6) de dano de veneno." },
      { name: "Arco Longo", description: "Ataque à Distância com Arma: +5 para acertar, distância 45/180 m, um alvo. Acerto: 6 (1d8+2) de dano perfurante mais 7 (2d6) de dano de veneno." },
    ] },
  { id: "mimico", name: "Mímico", type: "Monstruosidade", size: "Médio", alignment: "Neutro", ac: 12, hp: 58, cr: "2", xp: 450, speed: "4,5 m" },
  { id: "minotauro", name: "Minotauro", type: "Monstruosidade", size: "Grande", alignment: "Caótico e mau", ac: 14, hp: 76, cr: "3", xp: 700, speed: "12 m",
    str: 18, dex: 11, con: 16, int: 6, wis: 16, cha: 9,
    skills: "Percepção +7", senses: "Visão no escuro 18 m, Percepção passiva 17", languages: "Abissal",
    traits: [
      { name: "Investida", description: "Se o minotauro se mover ao menos 3 m em linha reta em direção a um alvo e o atingir com uma chifrada no mesmo turno, o alvo sofre 9 (2d8) de dano perfurante extra e deve passar em teste de resistência de Força CD 14 ou ser empurrado 3 m e cair caído." },
      { name: "Memória Labiríntica", description: "O minotauro consegue lembrar perfeitamente qualquer caminho que já tenha percorrido." },
    ],
    actions: [
      { name: "Machado Grande", description: "Ataque Corpo-a-Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 17 (2d12+4) de dano cortante." },
      { name: "Chifrada", description: "Ataque Corpo-a-Corpo com Arma: +6 para acertar, alcance 1,5 m, um alvo. Acerto: 13 (2d8+4) de dano perfurante." },
    ] },
  { id: "monstro-ferrugem", name: "Monstro da Ferrugem", type: "Monstruosidade", size: "Médio", alignment: "Sem tendência", ac: 14, hp: 27, cr: "1/2", xp: 100, speed: "12 m" },
  { id: "naga-guarda", name: "Naga da Guarda", type: "Monstruosidade", size: "Grande", alignment: "Leal e bom", ac: 18, hp: 110, cr: "10", xp: 5900, speed: "12 m" },
  { id: "naga-sombras", name: "Naga das Sombras", type: "Monstruosidade", size: "Grande", alignment: "Caótico e mau", ac: 15, hp: 75, cr: "8", xp: 3900, speed: "12 m" },
  { id: "pantera-deslocadora", name: "Pantera Deslocadora", type: "Monstruosidade", size: "Grande", alignment: "Leal e mau", ac: 13, hp: 85, cr: "3", xp: 700, speed: "12 m" },
  { id: "peryton", name: "Peryton", type: "Monstruosidade", size: "Médio", alignment: "Caótico e mau", ac: 13, hp: 33, cr: "2", xp: 450, speed: "6 m, voo 18 m" },
  { id: "perfurador", name: "Perfurador", type: "Monstruosidade", size: "Pequeno", alignment: "Sem tendência", ac: 15, hp: 22, cr: "1/2", xp: 100, speed: "1,5 m" },
  { id: "remoras", name: "Remorhas", type: "Monstruosidade", size: "Enorme", alignment: "Sem tendência", ac: 17, hp: 197, cr: "11", xp: 7200, speed: "15 m" },
  { id: "roca", name: "Roca", type: "Monstruosidade", size: "Imenso", alignment: "Sem tendência", ac: 15, hp: 248, cr: "11", xp: 7200, speed: "6 m, voo 36 m" },
  { id: "tarrasque", name: "Tarrasque", type: "Monstruosidade", size: "Imenso", alignment: "Sem tendência", ac: 25, hp: 676, cr: "30", xp: 155000, speed: "12 m" },
  { id: "urso-coruja", name: "Urso-Coruja", type: "Monstruosidade", size: "Grande", alignment: "Sem tendência", ac: 13, hp: 59, cr: "3", xp: 700, speed: "12 m",
    str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7,
    skills: "Percepção +3", senses: "Visão no escuro 18 m, Percepção passiva 13", languages: "—",
    traits: [
      { name: "Visão e Olfato Aguçados", description: "O urso-coruja tem vantagem em testes de Sabedoria (Percepção) que dependam da visão ou do olfato." },
    ],
    actions: [
      { name: "Ataques Múltiplos", description: "O urso-coruja faz dois ataques: um com o bico e um com as garras." },
      { name: "Bico", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, uma criatura. Acerto: 10 (1d10+5) de dano perfurante." },
      { name: "Garras", description: "Ataque Corpo-a-Corpo com Arma: +7 para acertar, alcance 1,5 m, um alvo. Acerto: 14 (2d8+5) de dano cortante." },
    ] },
  { id: "verme-carnica", name: "Verme da Carniça", type: "Monstruosidade", size: "Grande", alignment: "Sem tendência", ac: 13, hp: 51, cr: "2", xp: 450, speed: "9 m" },
  { id: "verme-purpura", name: "Verme Púrpura", type: "Monstruosidade", size: "Imenso", alignment: "Sem tendência", ac: 18, hp: 247, cr: "15", xp: 13000, speed: "15 m, escavar 9 m" },
  { id: "manto-negro", name: "Manto Negro", type: "Monstruosidade", size: "Pequeno", alignment: "Sem tendência", ac: 11, hp: 22, cr: "1/2", xp: 100, speed: "3 m, voo 9 m" },
  { id: "yeti", name: "Yeti", type: "Monstruosidade", size: "Grande", alignment: "Caótico e mau", ac: 12, hp: 51, cr: "3", xp: 700, speed: "12 m, escalar 12 m" },
  { id: "yeti-abominavel", name: "Yeti Abominável", type: "Monstruosidade", size: "Enorme", alignment: "Caótico e mau", ac: 15, hp: 137, cr: "9", xp: 5000, speed: "15 m, escalar 15 m" },

  // ── Bestas ───────────────────────────────────────────────────────────────────
  { id: "stirge", name: "Stirge", type: "Besta", size: "Miúdo", alignment: "Sem tendência", ac: 14, hp: 2, cr: "1/8", xp: 25, speed: "3 m, voo 12 m" },
  { id: "aranha-gigante", name: "Aranha Gigante", type: "Besta", size: "Grande", alignment: "Sem tendência", ac: 14, hp: 26, cr: "1", xp: 200, speed: "9 m, escalar 9 m" },
  { id: "urso-pardo", name: "Urso-Pardo", type: "Besta", size: "Grande", alignment: "Sem tendência", ac: 11, hp: 34, cr: "1", xp: 200, speed: "12 m, natação 12 m" },
  { id: "lobo", name: "Lobo", type: "Besta", size: "Médio", alignment: "Sem tendência", ac: 13, hp: 11, cr: "1/4", xp: 50, speed: "12 m" },
  { id: "tubarao-gigante", name: "Tubarão Gigante", type: "Besta", size: "Enorme", alignment: "Sem tendência", ac: 13, hp: 126, cr: "5", xp: 1800, speed: "0 m, natação 15 m" },
  { id: "alossauro", name: "Dinossauro – Alossauro", type: "Besta", size: "Grande", alignment: "Sem tendência", ac: 13, hp: 51, cr: "2", xp: 450, speed: "15 m" },
  { id: "triceratops", name: "Dinossauro – Triceratops", type: "Besta", size: "Enorme", alignment: "Sem tendência", ac: 13, hp: 114, cr: "5", xp: 1800, speed: "15 m" },
  { id: "tiranossauro", name: "Dinossauro – Tiranossauro Rex", type: "Besta", size: "Enorme", alignment: "Sem tendência", ac: 13, hp: 136, cr: "8", xp: 3900, speed: "15 m" },

  // ── Celestiais ───────────────────────────────────────────────────────────────
  { id: "couatl", name: "Couatl", type: "Celestial", size: "Médio", alignment: "Leal e bom", ac: 19, hp: 97, cr: "4", xp: 1100, speed: "9 m, voo 27 m" },
  { id: "deva", name: "Deva", type: "Celestial", size: "Médio", alignment: "Leal e bom", ac: 17, hp: 136, cr: "10", xp: 5900, speed: "9 m, voo 27 m" },
  { id: "pegaso", name: "Pégaso", type: "Celestial", size: "Grande", alignment: "Caótico e bom", ac: 12, hp: 59, cr: "2", xp: 450, speed: "18 m, voo 24 m" },
  { id: "unicornio", name: "Unicórnio", type: "Celestial", size: "Grande", alignment: "Leal e bom", ac: 12, hp: 67, cr: "5", xp: 1800, speed: "15 m" },

  // ── Fadas ────────────────────────────────────────────────────────────────────
  { id: "dríade", name: "Dríade", type: "Fada", size: "Médio", alignment: "Neutro", ac: 11, hp: 22, cr: "1", xp: 200, speed: "9 m" },
  { id: "megera-noturna", name: "Megera Noturna", type: "Fada", size: "Médio", alignment: "Caótico e mau", ac: 17, hp: 82, cr: "3", xp: 700, speed: "9 m" },
  { id: "megera-cinzenta", name: "Megera Cinzenta", type: "Fada", size: "Médio", alignment: "Neutro e mau", ac: 17, hp: 82, cr: "5", xp: 1800, speed: "9 m" },
  { id: "megera-mar", name: "Megera do Mar", type: "Fada", size: "Médio", alignment: "Caótico e mau", ac: 14, hp: 82, cr: "5", xp: 1800, speed: "9 m, natação 9 m" },
  { id: "pixie", name: "Pixie", type: "Fada", size: "Miúdo", alignment: "Neutro e bom", ac: 15, hp: 1, cr: "1/4", xp: 50, speed: "3 m, voo 9 m" },
  { id: "satiro", name: "Sátiro", type: "Fada", size: "Médio", alignment: "Caótico e neutro", ac: 14, hp: 31, cr: "1/2", xp: 100, speed: "12 m" },
  { id: "sprite", name: "Sprite", type: "Fada", size: "Miúdo", alignment: "Neutro e bom", ac: 15, hp: 2, cr: "1/4", xp: 50, speed: "3 m, voo 9 m" },

  // ── Limos ────────────────────────────────────────────────────────────────────
  { id: "cubo-gelatinoso", name: "Cubo Gelatinoso", type: "Limo", size: "Grande", alignment: "Sem tendência", ac: 6, hp: 84, cr: "2", xp: 450, speed: "4,5 m" },
  { id: "limo-cinzento", name: "Limo Cinzento", type: "Limo", size: "Pequeno", alignment: "Sem tendência", ac: 8, hp: 22, cr: "1/2", xp: 100, speed: "3 m" },
  { id: "pudim-negro", name: "Pudim Negro", type: "Limo", size: "Grande", alignment: "Sem tendência", ac: 7, hp: 85, cr: "4", xp: 1100, speed: "6 m, escalar 6 m" },
  { id: "limo-ocre", name: "Limo Ocre", type: "Limo", size: "Grande", alignment: "Sem tendência", ac: 8, hp: 45, cr: "2", xp: 450, speed: "3 m, escalar 3 m" },

  // ── Constructos ──────────────────────────────────────────────────────────────
  { id: "golem-argila", name: "Golem de Argila", type: "Constructo", size: "Grande", alignment: "Sem tendência", ac: 14, hp: 133, cr: "9", xp: 5000, speed: "6 m" },
  { id: "golem-carne", name: "Golem de Carne", type: "Constructo", size: "Grande", alignment: "Sem tendência", ac: 9, hp: 93, cr: "5", xp: 1800, speed: "9 m" },
  { id: "golem-ferro", name: "Golem de Ferro", type: "Constructo", size: "Grande", alignment: "Sem tendência", ac: 20, hp: 210, cr: "16", xp: 15000, speed: "9 m" },
  { id: "golem-pedra", name: "Golem de Pedra", type: "Constructo", size: "Grande", alignment: "Sem tendência", ac: 17, hp: 178, cr: "10", xp: 5900, speed: "9 m" },
  { id: "homúnculo", name: "Homúnculo", type: "Constructo", size: "Miúdo", alignment: "Neutro", ac: 13, hp: 5, cr: "0", xp: 10, speed: "6 m, voo 12 m" },
  { id: "guardiao-escudo", name: "Guardião do Escudo", type: "Constructo", size: "Grande", alignment: "Sem tendência", ac: 17, hp: 142, cr: "7", xp: 2900, speed: "9 m" },
  { id: "monodrone", name: "Modron – Monodrone", type: "Constructo", size: "Miúdo", alignment: "Leal e neutro", ac: 15, hp: 5, cr: "1/8", xp: 25, speed: "9 m, voo 9 m" },
  { id: "quadrone", name: "Modron – Quadrone", type: "Constructo", size: "Médio", alignment: "Leal e neutro", ac: 16, hp: 22, cr: "1", xp: 200, speed: "9 m, voo 9 m" },
  { id: "armadura-animada", name: "Armadura Animada", type: "Constructo", size: "Médio", alignment: "Sem tendência", ac: 18, hp: 33, cr: "1", xp: 200, speed: "9 m" },

  // ── Plantas ──────────────────────────────────────────────────────────────────
  { id: "ente", name: "Ente", type: "Planta", size: "Enorme", alignment: "Caótico e bom", ac: 16, hp: 138, cr: "9", xp: 5000, speed: "9 m" },
  { id: "arbusto-errante", name: "Arbusto Errante", type: "Planta", size: "Médio", alignment: "Sem tendência", ac: 11, hp: 11, cr: "1/4", xp: 50, speed: "9 m" },
  { id: "esporo-gas", name: "Esporo de Gás", type: "Planta", size: "Grande", alignment: "Sem tendência", ac: 8, hp: 17, cr: "1/2", xp: 100, speed: "3 m, voo 3 m" },
  { id: "miconide-adulto", name: "Miconide Adulto", type: "Planta", size: "Pequeno", alignment: "Leal e neutro", ac: 12, hp: 22, cr: "1/2", xp: 100, speed: "4,5 m" },
  { id: "miconide-soberano", name: "Miconide Soberano", type: "Planta", size: "Grande", alignment: "Leal e neutro", ac: 16, hp: 60, cr: "2", xp: 450, speed: "4,5 m" },

  // ── Licantropos ──────────────────────────────────────────────────────────────
  { id: "lobisomem", name: "Lobisomem", type: "Humanoide", size: "Médio", alignment: "Caótico e mau", ac: 11, hp: 58, cr: "3", xp: 700, speed: "9 m (12 m em forma de lobo)",
    str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 10,
    skills: "Percepção +4 (forma híbrida/lobo)",
    damageImmunities: "Contundente, cortante e perfurante de armas não-mágicas que não sejam de prata",
    senses: "Percepção passiva 14", languages: "Comum (não pode falar em forma de lobo)",
    traits: [
      { name: "Mudança de Forma", description: "Como ação, o lobisomem pode assumir forma de lobo (Médio), forma híbrida humanoide-lobo, ou retornar à forma humana verdadeira. O equipamento não se transforma. Ele retorna à forma verdadeira ao morrer." },
      { name: "Audição e Olfato Aguçados", description: "O lobisomem tem vantagem em testes de Sabedoria (Percepção) que dependam da audição ou do olfato." },
    ],
    actions: [
      { name: "Ataques Múltiplos (Forma Humanoide ou Híbrida)", description: "O lobisomem faz dois ataques: dois com a clava (forma humanoide) ou um com a mordida e um com as garras (forma híbrida)." },
      { name: "Mordida (Forma de Lobo ou Híbrida)", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, uma criatura. Acerto: 6 (1d8+2) de dano perfurante. Se o alvo for humanoide, faz teste de resistência de Constituição CD 12 ou é amaldiçoado com licantropia de lobisomem." },
      { name: "Garras (Apenas Forma Híbrida)", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, uma criatura. Acerto: 7 (2d4+2) de dano cortante." },
      { name: "Clava (Apenas Forma Humanoide)", description: "Ataque Corpo-a-Corpo com Arma: +4 para acertar, alcance 1,5 m, uma criatura. Acerto: 4 (1d4+2) de dano contundente." },
    ] },
  { id: "urso-licantropo", name: "Urso-Licantropo", type: "Humanoide", size: "Médio", alignment: "Neutro e bom", ac: 10, hp: 135, cr: "5", xp: 1800, speed: "9 m" },
  { id: "rato-licantropo", name: "Rato-Licantropo", type: "Humanoide", size: "Médio", alignment: "Leal e mau", ac: 10, hp: 33, cr: "2", xp: 450, speed: "9 m" },
  { id: "javali-licantropo", name: "Javali-Licantropo", type: "Humanoide", size: "Médio", alignment: "Neutro", ac: 10, hp: 78, cr: "4", xp: 1100, speed: "9 m" },
];

export const MONSTER_TYPES: MonsterType[] = [
  "Aberração", "Besta", "Celestial", "Constructo", "Corruptor",
  "Dragão", "Elemental", "Fada", "Gigante", "Humanoide",
  "Limo", "Monstruosidade", "Morto-vivo", "Planta",
];
