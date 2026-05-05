export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type AbilityBonus = Partial<Record<AbilityKey, number>>;

export interface Subrace {
  id: string;
  name: string;
  description: string;
  bonus: AbilityBonus;
  traits: string[];
}

export interface RaceNames {
  male: string[];
  female: string[];
  family?: string[];
  childhood?: string[];
  honorific?: string[];
  nickname?: string[];
}

export interface Race {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseBonus: AbilityBonus;
  speed: number;
  size: "Pequeno" | "Médio";
  rarity: "comum" | "incomum";
  traits: string[];
  languages: string[];
  subraces: Subrace[];
  names: RaceNames;
}

export const RACES: Race[] = [
  {
    id: "anao",
    name: "Anão",
    icon: "⛏️",
    description: "Guerreiros resistentes e habilidosos, forjados nas montanhas. Leais ao clã acima de tudo.",
    baseBonus: { con: 2 },
    speed: 7.5,
    size: "Médio",
    rarity: "comum",
    traits: ["Visão no Escuro", "Resiliência Anã", "Treinamento em Combate", "Especialização em Rochas"],
    languages: ["Comum", "Anão"],
    subraces: [
      {
        id: "anao-colina",
        name: "Anão da Colina",
        description: "Sentidos aguçados, maior intuição e notável resiliência.",
        bonus: { wis: 1 },
        traits: ["Tenacidade Anã (+1 PV por nível)"],
      },
      {
        id: "anao-montanha",
        name: "Anão da Montanha",
        description: "Forte e resistente, acostumado a terrenos difíceis.",
        bonus: { str: 2 },
        traits: ["Proficiência em armaduras leves e médias"],
      },
    ],
    names: {
      male: ["Adrik","Alberich","Baern","Barendd","Brottor","Bruenor","Dain","Darrak","Delg","Eberk","Einkil","Fargrim","Flint","Gardain","Harbek","Kildrak","Morgran","Orsik","Oskar","Rangrim","Rurik","Taklinn","Thoradin","Thorin","Tordek","Traubon","Travok","Ulfgar","Veit","Vondal"],
      female: ["Amber","Artin","Audhild","Bardryn","Dagnal","Diesa","Eldeth","Falkrunn","Gunnloda","Gurdis","Helja","Hlin","Kathra","Kristryd","Ilde","Liftrasa","Mardred","Riswynn","Sannl","Torbera","Torgga","Vistra"],
      family: ["Balderk","Battlehammer","Brawnanvil","Dankil","Fireforge","Frostbeard","Gorunn","Holderhek","Ironfist","Loderr","Lutgehr","Rumnaheim","Strakeln","Torunn","Ungart"],
    },
  },
  {
    id: "elfo",
    name: "Elfo",
    icon: "🌿",
    description: "Um povo mágico de graça sobrenatural. Vivem séculos e possuem afinidade com a natureza e a magia.",
    baseBonus: { dex: 2 },
    speed: 9,
    size: "Médio",
    rarity: "comum",
    traits: ["Visão no Escuro", "Sentidos Aguçados", "Ancestral Feérico", "Transe (meditação 4h)"],
    languages: ["Comum", "Élfico"],
    subraces: [
      {
        id: "alto-elfo",
        name: "Alto Elfo",
        description: "Mente afiada e domínio básico da magia arcana.",
        bonus: { int: 1 },
        traits: ["Conhece 1 truque de mago", "Idioma adicional", "Treinamento com armas élficas"],
      },
      {
        id: "elfo-floresta",
        name: "Elfo da Floresta",
        description: "Sentidos aguçados, pés ágeis e furtividade natural.",
        bonus: { wis: 1 },
        traits: ["Deslocamento 10,5m", "Máscara da Natureza", "Treinamento com armas élficas"],
      },
      {
        id: "drow",
        name: "Elfo Negro (Drow)",
        description: "Descendentes de elfos banidos para o Subterrâneo. Magia inata das trevas.",
        bonus: { cha: 1 },
        traits: ["Visão no Escuro Superior (36m)", "Magia Drow (globos de luz)", "Treinamento Drow com Armas"],
      },
    ],
    names: {
      male: ["Adran","Aelar","Aramil","Arannis","Aust","Beiro","Berrian","Carric","Enialis","Erdan","Erevan","Galinndan","Hadarai","Heian","Himo","Immeral","Ivellios","Laucian","Mindartis","Paelias","Peren","Quarion","Riardon","Rolen","Soveliss","Thamior","Tharivol","Theren","Varis"],
      female: ["Adrie","Althaea","Anastrianna","Andraste","Antinua","Bethrynna","Birel","Caelynn","Drusilia","Enna","Felosial","Ielenia","Jelenneth","Keyleth","Leshanna","Lia","Meriele","Mialee","Naivara","Quelenna","Quillathe","Sariel","Shanairra","Shava","Silaqui","Theirastra","Thia","Vadania","Valanthe","Xanaphia"],
      childhood: ["Ara","Bryn","Del","Eryn","Faen","Innil","Lael","Mella","Naill","Naeris","Phann","Rael","Rinn","Sai","Syllin","Thia","Vall"],
      family: ["Amakiir","Amastacia","Galanodel","Holimion","Ilphelkiir","Liadon","Meliamne","Nailo","Siannodel","Xiloscient"],
    },
  },
  {
    id: "halfling",
    name: "Halfling",
    icon: "🍀",
    description: "Pequenos e práticos, os halflings são resilientes, corajosos e cheios de boa sorte.",
    baseBonus: { dex: 2 },
    speed: 7.5,
    size: "Pequeno",
    rarity: "comum",
    traits: ["Sortudo", "Bravura", "Agilidade Halfling"],
    languages: ["Comum", "Halfling"],
    subraces: [
      {
        id: "halfling-pes-leves",
        name: "Pés Leves",
        description: "Furtivo e afável, pode se esconder atrás de criaturas maiores.",
        bonus: { cha: 1 },
        traits: ["Furtividade Natural"],
      },
      {
        id: "halfling-robusto",
        name: "Robusto",
        description: "Mais resistente que a média, com resistência a venenos.",
        bonus: { con: 1 },
        traits: ["Resiliência dos Robustos (resistência a veneno)"],
      },
    ],
    names: {
      male: ["Alton","Ander","Cade","Corrin","Eldon","Errich","Finnan","Garret","Lindal","Lyle","Merric","Milo","Osborn","Perrin","Reed","Roscoe","Wellby"],
      female: ["Andry","Bree","Callie","Cora","Euphemia","Jillian","Kithri","Lavinia","Lidda","Merla","Nedda","Paela","Portia","Seraphina","Shaena","Trym","Vani","Verna"],
      family: ["Cata-Escovas","Bom-Barril","Garrafa Verde","Alta Colina","Baixa Colina","Prato Cheio","Folha de Chá","Espinhudo","Cinto Frouxo","Galho Caído"],
    },
  },
  {
    id: "humano",
    name: "Humano",
    icon: "🧑",
    description: "A raça mais jovem e adaptável. Ambiciosos, inovadores e presentes em todo o mundo.",
    baseBonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    speed: 9,
    size: "Médio",
    rarity: "comum",
    traits: ["Versatilidade (+1 em todos os atributos)", "Idioma adicional"],
    languages: ["Comum", "+ 1 idioma à escolha"],
    subraces: [],
    names: {
      male: ["Darvin","Dorn","Evendur","Gorstag","Helm","Malark","Morn","Randal","Stedd","Ander","Blath","Bran","Lander","Stor","Taman","Anton","Diero","Marcon","Pieron","Romero","Aoth","Ramas","Urhur","Borivik","Jandar","Shaumar"],
      female: ["Arveene","Esvele","Jhessail","Kerri","Lureene","Miri","Rowan","Shandri","Tessele","Amafrey","Betha","Kethra","Olga","Westra","Balama","Dona","Faila","Marta","Selise","Fyevarra","Hulmarra","Navarra","Tammith"],
      family: ["Amblecrown","Buckman","Dundragon","Evenwood","Greycastle","Brightwood","Helder","Hornraven","Stormwind","Agosto","Astorio","Calabra","Pisacar"],
    },
  },
  {
    id: "draconato",
    name: "Draconato",
    icon: "🐉",
    description: "Descendentes de dragões. Orgulhosos, honrados e portadores de um sopro dracônico.",
    baseBonus: { str: 2, cha: 1 },
    speed: 9,
    size: "Médio",
    rarity: "incomum",
    traits: ["Ancestral Dracônico", "Arma de Sopro (2d6)", "Resistência a Dano", "Idioma: Dracônico"],
    languages: ["Comum", "Dracônico"],
    subraces: [],
    names: {
      male: ["Arjhan","Balasar","Bharash","Donaar","Ghesh","Heskan","Kriv","Medrash","Mehen","Nadarr","Pandjed","Patrin","Rhogar","Shamash","Shedinn","Tarhun","Torinn"],
      female: ["Akra","Biri","Daar","Farideh","Harann","Flavilar","Jheri","Kava","Korinn","Mishann","Nala","Perra","Raiann","Sora","Surina","Thava","Uadjit"],
      childhood: ["Climber","Earbender","Leaper","Pious","Shieldbiter","Zealous"],
      family: ["Clethtinthiallor","Daardendrian","Delmirev","Drachedandion","Fenkenkabradon","Kepeshkmolik","Kerrhylon","Kimbatuul","Linxakasendalor","Myastan","Nemmonis","Norixius","Ophinshtalajiir","Shestendeliath","Turnuroth","Verthisathurgiesh","Yarjerit"],
    },
  },
  {
    id: "gnomo",
    name: "Gnomo",
    icon: "⚙️",
    description: "Curiosos e inventivos, os gnomos dedicam séculos à exploração e à criação com entusiasmo incessante.",
    baseBonus: { int: 2 },
    speed: 7.5,
    size: "Pequeno",
    rarity: "incomum",
    traits: ["Visão no Escuro", "Esperteza Gnômica (vantagem em resistências mágicas de INT/SAB/CAR)"],
    languages: ["Comum", "Gnômico"],
    subraces: [
      {
        id: "gnomo-floresta",
        name: "Gnomo da Floresta",
        description: "Trato natural com ilusões, velocidade e furtividade.",
        bonus: { dex: 1 },
        traits: ["Ilusionista Nato (ilusão menor)", "Falar com Bestas Pequenas"],
      },
      {
        id: "gnomo-rochas",
        name: "Gnomo das Rochas",
        description: "Inventividade e resistência naturais. Especialista em artefatos.",
        bonus: { con: 1 },
        traits: ["Conhecimento de Artífice", "Engenhoqueiro (constrói mecanismos)"],
      },
    ],
    names: {
      male: ["Alston","Alvyn","Boddynock","Brocc","Burgell","Dimble","Eldon","Erky","Fonkin","Frug","Gerbo","Gimble","Glim","Jebeddo","Kellen","Namfoodle","Orryn","Roondar","Seebo","Sindri","Warryn","Wrenn","Zook"],
      female: ["Bimpnottin","Breena","Caramip","Carlin","Donella","Duvamil","Ella","Ellyjobell","Ellywick","Lilli","Loopmottin","Lorilla","Mardnab","Nissa","Nyx","Oda","Orla","Roywyn","Shamil","Tana","Waywocket","Zanna"],
      family: ["Beren","Daergel","Folkor","Garrick","Nackle","Murnig","Ningel","Raulnor","Scheppen","Timbers","Turen"],
      nickname: ["Beberrão","Pó de Coração","Texugo","Manto","Tranca-Dupla","Bate-Carteira","Fnipper","Ku","Nim","Um Sapato","Gema Faiscante","Pato Desajeitado"],
    },
  },
  {
    id: "meio-elfo",
    name: "Meio-Elfo",
    icon: "✨",
    description: "Entre dois mundos, os meio-elfos combinam a ambição humana com a graça élfica. Carismáticos e versáteis.",
    baseBonus: { cha: 2 },
    speed: 9,
    size: "Médio",
    rarity: "incomum",
    traits: ["CAR+2, +1 em dois atributos à escolha", "Visão no Escuro", "Ancestral Feérico", "Versatilidade em Perícia (+2 perícias)"],
    languages: ["Comum", "Élfico", "+ 1 idioma"],
    subraces: [],
    names: {
      male: ["Adran","Aelar","Aramil","Darvin","Dorn","Evendur","Berrian","Carric","Helm","Rolen","Theren","Stedd","Morn","Randal"],
      female: ["Adrie","Althaea","Caelynn","Arveene","Esvele","Lia","Mialee","Naivara","Rowan","Shandri","Sariel"],
      family: ["Amakiir","Galanodel","Amblecrown","Greycastle","Siannodel","Evenwood"],
    },
  },
  {
    id: "meio-orc",
    name: "Meio-Orc",
    icon: "⚔️",
    description: "Fortes e resilientes, os meio-orcs carregam a ferocidade orc temperada pela determinação humana.",
    baseBonus: { str: 2, con: 1 },
    speed: 9,
    size: "Médio",
    rarity: "incomum",
    traits: ["Visão no Escuro", "Ameaçador (proficiência Intimidação)", "Resistência Implacável (volta a 1 PV)", "Ataques Selvagens (dado extra em crítico)"],
    languages: ["Comum", "Orc"],
    subraces: [],
    names: {
      male: ["Dench","Feng","Gell","Henk","Holg","Imsh","Keth","Krusk","Mhurren","Ront","Shump","Thokk"],
      female: ["Baggi","Emen","Engong","Kansif","Myev","Neega","Ovak","Ownka","Shautha","Sutha","Vola","Volen","Yevelda"],
    },
  },
  {
    id: "tiefling",
    name: "Tiefling",
    icon: "😈",
    description: "Marcados por herança infernal, os tieflings carregam o estigma dos Nove Infernos. Independentes e resilientes.",
    baseBonus: { int: 1, cha: 2 },
    speed: 9,
    size: "Médio",
    rarity: "incomum",
    traits: ["Visão no Escuro", "Resistência Infernal (resistência a fogo)", "Legado Infernal (taumaturgia + magias)"],
    languages: ["Comum", "Infernal"],
    subraces: [],
    names: {
      male: ["Akmenos","Amnon","Barakas","Damakos","Ekemon","Iados","Kairon","Leucis","Melech","Mordai","Morthos","Pelaios","Skamos","Therai"],
      female: ["Akta","Anakis","Bryseis","Criella","Damaia","Ea","Kallista","Lerissa","Makaria","Nemeia","Orianna","Phelaia","Rieta"],
      honorific: ["Abertura","Arte","Canção","Crença","Desespero","Excelência","Esperança","Glória","Ideal","Ímpeto","Música","Poesia","Missão","Tormenta"],
    },
  },
];

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

export function formatBonuses(bonus: AbilityBonus): string {
  return Object.entries(bonus)
    .filter(([, v]) => v && v !== 0)
    .map(([k, v]) => `${ABILITY_LABELS[k as AbilityKey]} ${v! > 0 ? "+" : ""}${v}`)
    .join(", ");
}
