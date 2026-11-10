// ─── CYBERPUNK RED — Caminho de Vida (lifepath) ──────────────────────────────
// Todas as tabelas são de 1d10 (índice 0 = resultado 1). Rolar é opcional: o
// jogador pode escolher. Os textos são paráfrases curtas em pt-BR. O
// "caminho de vida de papel" (mini-tabelas por papel) não foi extraído da
// fonte e fica como trabalho futuro. Sem I/O.

import type { Rng } from "./rules";
import { rollD } from "./rules";

export interface CulturalOrigin {
  region: string;
  regionEn: string;
  languages: string[];
}

/** Origem cultural: dá +4 níveis em um dos idiomas da região. */
export const CULTURAL_ORIGINS: CulturalOrigin[] = [
  { region: "Norte-americana", regionEn: "North American", languages: ["Chinese", "Cree", "Creole", "English", "French", "Navajo", "Spanish"] },
  { region: "Sul/Centro-americana", regionEn: "South/Central American", languages: ["Creole", "English", "German", "Guarani", "Mayan", "Portuguese", "Quechua", "Spanish"] },
  { region: "Europa Ocidental", regionEn: "Western European", languages: ["Dutch", "English", "French", "German", "Italian", "Norwegian", "Portuguese", "Spanish"] },
  { region: "Europa Oriental", regionEn: "Eastern European", languages: ["English", "Finnish", "Polish", "Romanian", "Russian", "Ukrainian"] },
  { region: "Oriente Médio/Norte da África", regionEn: "Middle Eastern/North African", languages: ["Arabic", "Berber", "English", "Farsi", "French", "Hebrew", "Turkish"] },
  { region: "África Subsaariana", regionEn: "Sub-Saharan African", languages: ["Arabic", "English", "French", "Hausa", "Lingala", "Oromo", "Portuguese", "Swahili", "Twi", "Yoruba"] },
  { region: "Sul da Ásia", regionEn: "South Asian", languages: ["Bengali", "Dari", "English", "Hindi", "Nepali", "Sinhalese", "Tamil", "Urdu"] },
  { region: "Sudeste Asiático", regionEn: "South East Asian", languages: ["Arabic", "Burmese", "English", "Filipino", "Hindi", "Indonesian", "Khmer", "Malayan", "Vietnamese"] },
  { region: "Leste Asiático", regionEn: "East Asian", languages: ["Cantonese Chinese", "English", "Japanese", "Korean", "Mandarin Chinese", "Mongolian"] },
  { region: "Oceania/Ilhas do Pacífico", regionEn: "Oceania/Pacific Islander", languages: ["English", "French", "Hawaiian", "Maori", "Pama-Nyungan", "Tahitian"] },
];

export const PERSONALITIES = [
  "Tímido e reservado", "Rebelde, antissocial e violento", "Arrogante, orgulhoso e distante",
  "Temperamental, impulsivo e teimoso", "Exigente, meticuloso e nervoso", "Estável e sério",
  "Bobo e avoado", "Sorrateiro e enganador", "Intelectual e desapegado", "Amigável e extrovertido",
];

export const CLOTHING_STYLES = [
  "Chique Genérico", "Casual/Esportivo", "Urbano Chamativo", "Roupa Social", "Alta-Costura",
  "Boêmio", "Mendigo Chique", "Cores de Gangue", "Couro Nômade", "Pop Asiático",
];

export const HAIRSTYLES = [
  "Moicano", "Longo e desgrenhado", "Curto e espetado", "Rebelde e bagunçado", "Careca",
  "Listrado", "Cores berrantes", "Curto e arrumado", "Curto e cacheado", "Longo e liso",
];

export const AFFECTATIONS = [
  "Tatuagens", "Óculos espelhados", "Cicatrizes rituais", "Luvas com espinhos", "Argolas no nariz",
  "Piercings (língua e outros)", "Implantes de unha estranhos", "Botas ou saltos com espinhos",
  "Luvas sem dedos", "Lentes de contato estranhas",
];

export const VALUES = [
  "Dinheiro", "Honra", "A própria palavra", "Honestidade", "Conhecimento",
  "Vingança", "Amor", "Poder", "Família", "Amizade",
];

export const FEELINGS_ABOUT_PEOPLE = [
  "Neutro", "Neutro", "Gosta de quase todos", "Odeia quase todos",
  "Pessoas são ferramentas para usar e descartar", "Toda pessoa tem valor",
  "Pessoas são obstáculos a destruir", "Não confia em ninguém e não depende de ninguém",
  "Que todos se exterminem", "Pessoas são maravilhosas",
];

export const VALUED_PERSON = [
  "Um dos pais", "Irmão ou irmã", "Um amante", "Um amigo", "Você mesmo",
  "Um animal de estimação", "Um mentor", "Uma figura pública", "Um herói pessoal", "Ninguém",
];

export const VALUED_POSSESSION = [
  "Uma arma", "Uma ferramenta", "Uma peça de roupa", "Uma fotografia", "Um livro ou diário",
  "Uma gravação", "Um instrumento musical", "Uma joia", "Um brinquedo", "Uma carta",
];

export const FAMILY_BACKGROUNDS = [
  "Executivos corporativos (ricos, segurança e escola privadas)",
  "Gerentes corporativos (bem de vida, escola variada)",
  "Técnicos corporativos (classe média, escolas técnicas da corp)",
  "Bando nômade (veículos, ensino em casa)",
  "\"Família\" de gangue (violenta, passando fome)",
  "Zona de combate (ruína fortificada)",
  "Sem-teto urbanos",
  "Ratos de megaestrutura",
  "Recuperadores (reconstruindo cidades-fantasma)",
  "Mercenários (a casa mudava com o trabalho dos pais)",
];

export const CHILDHOOD_ENVIRONMENTS = [
  "Na rua, sem supervisão", "Zona corporativa murada e segura", "Bando nômade em movimento",
  "Bando nômade em transporte (navios, aviões, caravanas)", "Bairro decadente que já foi nobre",
  "Coração da Zona de Combate", "Megaestrutura corporativa ou da cidade", "Ruínas tomadas por Recuperadores",
  "Nação à Deriva (cidade flutuante)", "\"Arranha-estrelas\" corporativo de luxo",
];

export const FAMILY_CRISES = [
  "Perdeu tudo por traição", "Perdeu tudo por má gestão", "Exilado ou expulso de casa, nação ou corp",
  "Prisão da família, só você escapou", "Família desapareceu, só restou você",
  "Família morta, você é o único sobrevivente", "Parte de uma conspiração, família criminosa ou grupo revolucionário",
  "Família dispersada pelo azar", "Rixa hereditária de gerações", "Herdou uma dívida familiar a honrar",
];

export const FRIEND_KINDS = [
  "Como um irmão mais velho", "Como um irmão mais novo", "Professor ou mentor", "Parceiro ou colega de trabalho",
  "Ex-amante", "Velho inimigo", "Como um pai", "Amigo de infância", "Alguém da Rua", "Alguém com interesse ou objetivo em comum",
];

export const ENEMY_WHO = [
  "Ex-amigo", "Ex-amante", "Parente afastado", "Inimigo de infância", "Alguém que trabalhava para você",
  "Alguém para quem você trabalhava", "Parceiro ou colega", "Executivo corporativo", "Autoridade do governo", "Boosterganger",
];
export const ENEMY_CAUSE = [
  "Fez você perder prestígio ou status", "Causou a perda de um amante, amigo ou parente", "Grande humilhação pública",
  "Acusou você de covardia ou de uma falha grave", "Foi abandonado ou traído por você", "Você recusou um trabalho ou convite romântico",
  "Simplesmente não se gostam", "Rival amoroso", "Rival de negócios", "Um incriminou o outro por um crime",
];
export const ENEMY_THREAT = [
  "Só ele mesmo, sem esforço extra", "Só ele mesmo", "Ele e um amigo próximo", "Ele e 1d6/2 amigos",
  "Ele e 1d10/2 amigos", "Uma gangue inteira (1d10+5 pessoas)", "A polícia local",
  "Um chefão de gangue ou pequena corporação", "Uma corporação poderosa", "Uma cidade, governo ou agência inteira",
];
export const REVENGE_RESPONSES = [
  "Evitar", "Evitar", "Fúria assassina, ataque físico", "Fúria assassina, ataque físico",
  "Apunhalar pelas costas, indiretamente", "Apunhalar pelas costas, indiretamente",
  "Ataque verbal", "Ataque verbal", "Incriminar por um crime", "Partir para matar ou mutilar",
];

export const TRAGIC_LOVES = [
  "O amante morreu em um acidente", "O amante desapareceu misteriosamente", "Simplesmente não deu certo",
  "Um objetivo ou vingança se interpôs", "O amante foi sequestrado", "O amante enlouqueceu ou virou ciberpsicopata",
  "O amante se suicidou", "O amante morreu em uma briga", "Um rival tomou o seu lugar", "O amante foi preso ou exilado",
];

export const LIFE_GOALS = [
  "Livrar-se de uma má reputação", "Ganhar poder e controle", "Sair da Rua a qualquer custo",
  "Fazer sofrer quem cruzar seu caminho", "Superar e esquecer o passado", "Caçar os responsáveis pela sua miséria",
  "Conseguir o que é seu por direito", "Salvar alguém do seu passado", "Alcançar fama e reconhecimento", "Ser temido e respeitado",
];

// ─── Rolagem ────────────────────────────────────────────────────────────────

export interface LifepathEnemy { who: string; cause: string; threat: string; revenge: string }

export interface Lifepath {
  origin: string;
  language: string;
  personality: string;
  clothing: string;
  hairstyle: string;
  affectation: string;
  value: string;
  feelings: string;
  person: string;
  possession: string;
  family: string;
  childhood: string;
  crisis: string;
  friends: string[];
  enemies: LifepathEnemy[];
  loves: string[];
  goal: string;
}

/** Quantidade de amigos/inimigos/amores: max(0, 1d10 − 7). */
export function rollRelationshipCount(rng?: Rng): number {
  return Math.max(0, rollD(10, rng) - 7);
}

function pickRoll<T>(table: readonly T[], rng?: Rng): T {
  return table[rollD(10, rng) - 1];
}

/** Rola o caminho de vida completo. */
export function rollLifepath(rng: Rng = Math.random): Lifepath {
  const origin = pickRoll(CULTURAL_ORIGINS, rng);
  const language = origin.languages[Math.floor(rng() * origin.languages.length)];
  return {
    origin: origin.region,
    language,
    personality: pickRoll(PERSONALITIES, rng),
    clothing: pickRoll(CLOTHING_STYLES, rng),
    hairstyle: pickRoll(HAIRSTYLES, rng),
    affectation: pickRoll(AFFECTATIONS, rng),
    value: pickRoll(VALUES, rng),
    feelings: pickRoll(FEELINGS_ABOUT_PEOPLE, rng),
    person: pickRoll(VALUED_PERSON, rng),
    possession: pickRoll(VALUED_POSSESSION, rng),
    family: pickRoll(FAMILY_BACKGROUNDS, rng),
    childhood: pickRoll(CHILDHOOD_ENVIRONMENTS, rng),
    crisis: pickRoll(FAMILY_CRISES, rng),
    friends: Array.from({ length: rollRelationshipCount(rng) }, () => pickRoll(FRIEND_KINDS, rng)),
    enemies: Array.from({ length: rollRelationshipCount(rng) }, () => ({
      who: pickRoll(ENEMY_WHO, rng),
      cause: pickRoll(ENEMY_CAUSE, rng),
      threat: pickRoll(ENEMY_THREAT, rng),
      revenge: pickRoll(REVENGE_RESPONSES, rng),
    })),
    loves: Array.from({ length: rollRelationshipCount(rng) }, () => pickRoll(TRAGIC_LOVES, rng)),
    goal: pickRoll(LIFE_GOALS, rng),
  };
}
