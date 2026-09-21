// ─── TORMENTA 20 — Condições (Apêndice, pág. 392-393) ────────────────────────
// Lista fiel ao Livro Básico, usada no modo Jogar da ficha. "A menos que
// especificado o contrário, condições terminam no fim da cena."

export type ConditionCategory = "geral" | "mental" | "medo" | "paralisia" | "sentidos" | "fadiga";

export interface TormentaCondition {
  id: string;
  name: string;
  category: ConditionCategory;
  desc: string;
}

export const CONDITIONS: TormentaCondition[] = [
  { id: "abalado", name: "Abalado", category: "medo", desc: "–2 em testes de perícia. Ficar abalado de novo torna você apavorado." },
  { id: "agarrado", name: "Agarrado", category: "paralisia", desc: "Fica desprevenido e imóvel, sofre –2 em ataques e só pode atacar com armas leves. Ataque à distância contra o alvo agarrado tem 50% de acertar o alvo errado." },
  { id: "alquebrado", name: "Alquebrado", category: "mental", desc: "O custo em PM de suas habilidades e magias aumenta em +1." },
  { id: "apavorado", name: "Apavorado", category: "medo", desc: "–5 em testes de perícia e deve fugir da fonte do medo. Se não puder fugir, age normalmente mas não pode se aproximar dela." },
  { id: "atordoado", name: "Atordoado", category: "mental", desc: "Fica desprevenido e não pode fazer ações." },
  { id: "caido", name: "Caído", category: "geral", desc: "–5 em ataques corpo a corpo, deslocamento reduzido a 1,5m, –5 de Defesa contra corpo a corpo e +5 de Defesa contra ataques à distância." },
  { id: "cego", name: "Cego", category: "sentidos", desc: "Fica desprevenido e lento, não pode fazer testes de Percepção para observar e sofre –5 em perícias de Força ou Destreza. Todos os seus alvos recebem camuflagem total." },
  { id: "confuso", name: "Confuso", category: "mental", desc: "Comporta-se de modo aleatório: role 1d6 no início do turno — 1) move-se em direção aleatória; 2-3) só reações; 4-5) ataca a criatura mais próxima; 6) a condição termina." },
  { id: "debilitado", name: "Debilitado", category: "geral", desc: "–5 em testes de atributos físicos (For, Des, Con) e perícias baseadas neles. Ficar debilitado de novo torna você inconsciente." },
  { id: "desprevenido", name: "Desprevenido", category: "geral", desc: "–5 na Defesa e em Reflexos. Você fica desprevenido contra inimigos que não possa ver." },
  { id: "doente", name: "Doente", category: "geral", desc: "Sob efeito de uma doença." },
  { id: "em-chamas", name: "Em Chamas", category: "geral", desc: "1d6 de dano de fogo no início de cada turno. Apagar exige uma ação padrão (ou imersão em água)." },
  { id: "enjoado", name: "Enjoado", category: "geral", desc: "Só pode realizar uma ação padrão ou de movimento por rodada (não ambas)." },
  { id: "enredado", name: "Enredado", category: "paralisia", desc: "Fica lento e vulnerável e sofre –2 em testes de ataque." },
  { id: "envenenado", name: "Envenenado", category: "geral", desc: "O efeito varia conforme o veneno: outra condição (fraco, enjoado…) ou dano recorrente. A descrição do veneno define a duração." },
  { id: "esmorecido", name: "Esmorecido", category: "mental", desc: "–5 em testes de atributos mentais (Int, Sab, Car) e perícias baseadas neles." },
  { id: "exausto", name: "Exausto", category: "fadiga", desc: "Fica debilitado, lento e vulnerável. Ficar exausto de novo torna você inconsciente." },
  { id: "fascinado", name: "Fascinado", category: "mental", desc: "–5 em Percepção e não pode agir, exceto observar o que o fascinou. Qualquer ação hostil contra você anula a condição." },
  { id: "fatigado", name: "Fatigado", category: "fadiga", desc: "Fica fraco e vulnerável. Ficar fatigado de novo torna você exausto." },
  { id: "fraco", name: "Fraco", category: "geral", desc: "–2 em testes de atributos físicos (For, Des, Con) e perícias baseadas neles. Ficar fraco de novo torna você debilitado." },
  { id: "frustrado", name: "Frustrado", category: "mental", desc: "–2 em testes de atributos mentais (Int, Sab, Car) e perícias baseadas neles. Ficar frustrado de novo torna você esmorecido." },
  { id: "imovel", name: "Imóvel", category: "paralisia", desc: "Todas as formas de deslocamento são reduzidas a 0m." },
  { id: "inconsciente", name: "Inconsciente", category: "geral", desc: "Fica indefeso e não pode fazer ações. Acordar a criatura gasta uma ação padrão." },
  { id: "indefeso", name: "Indefeso", category: "geral", desc: "Considerado desprevenido, mas sofre –10 na Defesa, falha automaticamente em Reflexos e pode sofrer golpe de misericórdia." },
  { id: "lento", name: "Lento", category: "paralisia", desc: "Deslocamentos reduzidos à metade (arredonde para baixo em incrementos de 1,5m) e não pode correr nem investir." },
  { id: "ofuscado", name: "Ofuscado", category: "sentidos", desc: "–2 em testes de ataque e de Percepção." },
  { id: "paralisado", name: "Paralisado", category: "paralisia", desc: "Fica imóvel e indefeso e só pode realizar ações puramente mentais." },
  { id: "pasmo", name: "Pasmo", category: "mental", desc: "Não pode fazer ações, exceto reações." },
  { id: "petrificado", name: "Petrificado", category: "geral", desc: "Fica inconsciente e recebe resistência a dano 8." },
  { id: "sangrando", name: "Sangrando", category: "geral", desc: "No início de cada turno, teste de Constituição (CD 15): passando, estabiliza; falhando, perde 1d6 PV e continua sangrando." },
  { id: "surdo", name: "Surdo", category: "sentidos", desc: "Não pode fazer testes de Percepção para ouvir, sofre –5 em Iniciativa e está em condição ruim para lançar magias." },
  { id: "surpreendido", name: "Surpreendido", category: "geral", desc: "Fica desprevenido e não pode fazer ações, exceto reações." },
  { id: "vulneravel", name: "Vulnerável", category: "geral", desc: "–2 na Defesa." },
];

export const CONDITION_BY_ID: Record<string, TormentaCondition> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c]),
);

export const CATEGORY_COLOR: Record<ConditionCategory, string> = {
  geral: "#8a8f98",
  mental: "#7e6cc4",
  medo: "#b0562c",
  paralisia: "#4b86b4",
  sentidos: "#3f8f7a",
  fadiga: "#9c7b3b",
};

/** Alquebrado: "o custo em pontos de mana das habilidades e magias aumenta em +1". */
export const ALQUEBRADO_ID = "alquebrado";
