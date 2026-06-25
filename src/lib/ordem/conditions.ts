// ─── ORDEM PARANORMAL — Condições (Apêndice, p. 310-312) ─────────────────────
// Lista fiel ao Livro de Regras. Usada no rastreador de combate.

export type ConditionCategory = "geral" | "mental" | "medo" | "paralisia" | "sentidos" | "fadiga";

export interface Condition {
  id: string;
  name: string;
  category: ConditionCategory;
  desc: string;
}

export const CONDITIONS: Condition[] = [
  { id: "abalado",       name: "Abalado",       category: "medo",      desc: "–1d20 em testes. Se ficar abalado de novo, fica apavorado." },
  { id: "agarrado",      name: "Agarrado",      category: "paralisia", desc: "Desprevenido e imóvel; –1d20 em ataque e só ataca com armas leves." },
  { id: "alquebrado",    name: "Alquebrado",    category: "mental",    desc: "Custo em PE de habilidades e rituais aumenta em +1." },
  { id: "apavorado",     name: "Apavorado",     category: "medo",      desc: "–2d20 em perícia; deve fugir da fonte do medo. Não pode se aproximar dela." },
  { id: "asfixiado",     name: "Asfixiado",     category: "geral",     desc: "Não respira. Prende a respiração por Vigor rodadas; depois Fortitude (DT 5 +5)." },
  { id: "atordoado",     name: "Atordoado",     category: "mental",    desc: "Desprevenido e não pode fazer ações." },
  { id: "caido",         name: "Caído",         category: "geral",     desc: "–2d20 corpo a corpo, desloc. 1,5m, –5 Defesa CaC / +5 vs à distância." },
  { id: "cego",          name: "Cego",          category: "sentidos",  desc: "Desprevenido e lento; sem Percepção visual; –2d20 AGI/FOR. Alvos têm camuflagem total." },
  { id: "confuso",       name: "Confuso",       category: "mental",    desc: "Age aleatoriamente (1d6 no início do turno)." },
  { id: "debilitado",    name: "Debilitado",    category: "geral",     desc: "–2d20 em AGI/FOR/VIG. De novo → inconsciente." },
  { id: "desprevenido",  name: "Desprevenido",  category: "geral",     desc: "–5 Defesa e –1d20 Reflexos." },
  { id: "doente",        name: "Doente",        category: "geral",     desc: "Sob efeito de uma doença." },
  { id: "em-chamas",     name: "Em Chamas",     category: "geral",     desc: "1d6 de dano de fogo no início do turno. Ação padrão para apagar." },
  { id: "enjoado",       name: "Enjoado",       category: "geral",     desc: "Só uma ação padrão OU de movimento por rodada (não ambas)." },
  { id: "enredado",      name: "Enredado",      category: "paralisia", desc: "Lento, vulnerável e –1d20 em ataque." },
  { id: "envenenado",    name: "Envenenado",    category: "geral",     desc: "Efeito varia conforme o veneno (condição ou dano recorrente)." },
  { id: "esmorecido",    name: "Esmorecido",    category: "mental",    desc: "–2d20 em testes de INT e PRE." },
  { id: "exausto",       name: "Exausto",       category: "fadiga",    desc: "Debilitado, lento e vulnerável. De novo → inconsciente." },
  { id: "fascinado",     name: "Fascinado",     category: "mental",    desc: "–2d20 Percepção; só observa o que o fascinou. Ação hostil anula." },
  { id: "fatigado",      name: "Fatigado",      category: "fadiga",    desc: "Fraco e vulnerável. De novo → exausto." },
  { id: "fraco",         name: "Fraco",         category: "geral",     desc: "–1d20 em AGI/FOR/VIG. De novo → debilitado." },
  { id: "frustrado",     name: "Frustrado",     category: "mental",    desc: "–1d20 em INT e PRE. De novo → esmorecido." },
  { id: "imovel",        name: "Imóvel",        category: "paralisia", desc: "Todo deslocamento reduzido a 0m." },
  { id: "inconsciente",  name: "Inconsciente",  category: "geral",     desc: "Indefeso e sem ações (nem reações)." },
  { id: "indefeso",      name: "Indefeso",      category: "geral",     desc: "Desprevenido, –10 Defesa, falha Reflexos, sujeito a golpe de misericórdia." },
  { id: "lento",         name: "Lento",         category: "paralisia", desc: "Deslocamento pela metade; não corre nem investe." },
  { id: "machucado",     name: "Machucado",     category: "geral",     desc: "Menos da metade dos PV totais." },
  { id: "morrendo",      name: "Morrendo",      category: "geral",     desc: "0 PV. 3 turnos morrendo na cena = morte. Encerra com Medicina (DT 20)." },
  { id: "ofuscado",      name: "Ofuscado",      category: "sentidos",  desc: "–1d20 em ataque e Percepção." },
  { id: "paralisado",    name: "Paralisado",    category: "paralisia", desc: "Imóvel e indefeso; só ações mentais." },
  { id: "pasmo",         name: "Pasmo",         category: "mental",    desc: "Não pode fazer ações." },
  { id: "petrificado",   name: "Petrificado",   category: "geral",     desc: "Inconsciente e recebe resistência a dano 10." },
  { id: "sangrando",     name: "Sangrando",     category: "geral",     desc: "Início do turno: Vigor (DT 20) ou perde 1d6 PV e continua." },
  { id: "surdo",         name: "Surdo",         category: "sentidos",  desc: "Sem Percepção auditiva; –2d20 Iniciativa; condição ruim p/ rituais." },
  { id: "surpreendido",  name: "Surpreendido",  category: "geral",     desc: "Desprevenido e não pode fazer ações." },
  { id: "vulneravel",    name: "Vulnerável",    category: "geral",     desc: "–2 na Defesa." },
];

export const CONDITION_BY_ID: Record<string, Condition> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c]),
);

export const CATEGORY_COLOR: Record<ConditionCategory, string> = {
  geral:     "#9aa0a6",
  mental:    "#a78bfa",
  medo:      "#f5c451",
  paralisia: "#60a5fa",
  sentidos:  "#7dd3a8",
  fadiga:    "#e0524c",
};

// ─── Tipos de dano (para RD e resistências) ──────────────────────────────────
export const DAMAGE_TYPES = [
  "Balístico", "Corte", "Impacto", "Perfuração",
  "Fogo", "Frio", "Elétrico", "Químico", "Mental",
  "Conhecimento", "Energia", "Morte", "Sangue", "Medo",
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];
