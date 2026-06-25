// ─── D&D 5e — Condições (PHB Apêndice A) ─────────────────────────────────────
export interface DndCondition { id: string; name: string; desc: string }

export const DND_CONDITIONS: DndCondition[] = [
  { id: "agarrado",     name: "Agarrado",     desc: "Deslocamento 0. Termina se o agarrador ficar incapacitado ou for afastado." },
  { id: "amedrontado",  name: "Amedrontado",  desc: "Desvantagem em testes e ataques enquanto vê a fonte; não pode se aproximar dela." },
  { id: "atordoado",    name: "Atordoado",    desc: "Incapacitado, não se move, fala vacilante. Falha em FOR/DES. Ataques contra têm vantagem." },
  { id: "caido",        name: "Caído",        desc: "Só rasteja. Desvantagem em ataques. Ataques corpo a corpo contra têm vantagem; à distância, desvantagem." },
  { id: "cego",         name: "Cego",         desc: "Não enxerga, falha testes que exijam visão. Desvantagem ao atacar; ataques contra têm vantagem." },
  { id: "enfeiticado",  name: "Enfeitiçado",  desc: "Não pode atacar o enfeitiçador; este tem vantagem em testes sociais com a criatura." },
  { id: "envenenado",   name: "Envenenado",   desc: "Desvantagem em ataques e testes de habilidade." },
  { id: "incapacitado", name: "Incapacitado", desc: "Não pode realizar ações nem reações." },
  { id: "inconsciente", name: "Inconsciente", desc: "Incapacitado, cai, larga itens. Falha FOR/DES. Ataques têm vantagem; acerto a 1,5m é crítico." },
  { id: "invisivel",    name: "Invisível",    desc: "Impossível de ver sem magia. Vantagem ao atacar; ataques contra têm desvantagem." },
  { id: "paralisado",   name: "Paralisado",   desc: "Incapacitado, não se move nem fala. Falha FOR/DES. Ataques têm vantagem; acerto a 1,5m é crítico." },
  { id: "petrificado",  name: "Petrificado",  desc: "Transformado em sólido. Incapacitado, resistência a todo dano, imune a veneno/doença." },
  { id: "restringido",  name: "Restringido",  desc: "Deslocamento 0. Desvantagem ao atacar e em DES; ataques contra têm vantagem." },
  { id: "surdo",        name: "Surdo",        desc: "Não ouve, falha testes que exijam audição." },
];

export const DND_CONDITION_BY_ID: Record<string, DndCondition> = Object.fromEntries(
  DND_CONDITIONS.map((c) => [c.id, c]),
);

// Exaustão (6 níveis) — rastreada à parte (não é toggle simples).
export const EXHAUSTION_LEVELS = [
  "1 — Desvantagem em testes de habilidade",
  "2 — Deslocamento reduzido à metade",
  "3 — Desvantagem em ataques e salvaguardas",
  "4 — Máximo de PV reduzido à metade",
  "5 — Deslocamento reduzido a 0",
  "6 — Morte",
];
