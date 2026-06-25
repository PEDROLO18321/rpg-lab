// ─── Call of Cthulhu 7e — Estados de investigador/criatura ───────────────────
export interface CthulhuState { id: string; name: string; desc: string }

export const CTHULHU_STATES: CthulhuState[] = [
  { id: "ferimento_grave", name: "Ferimento Grave", desc: "Dano de uma só vez ≥ metade dos PV. Testar Sorte ou cair; jogadas de recuperação." },
  { id: "morrendo",        name: "Morrendo",        desc: "PV 0 após ferimento grave. Primeiros socorros (DT padrão) estabilizam, senão Constituição por rodada." },
  { id: "inconsciente",    name: "Inconsciente",    desc: "PV 0 (sem ferimento grave) ou nocaute. Sem ações até recuperar." },
  { id: "loucura_temp",    name: "Loucura Temporária", desc: "Perdeu 5+ SAN de uma vez ou falhou no teste. Dura 1d10 rodadas (combate) ou 1d10 horas." },
  { id: "loucura_indef",   name: "Loucura Indefinida", desc: "Perdeu ≥1/5 da SAN máxima em um dia. Sintomas duram até recuperação prolongada." },
  { id: "delirio",         name: "Delírio / Surto",  desc: "Episódio psicótico: fuga, paralisia, histeria, fobia ou mania manifestada." },
  { id: "sangrando",       name: "Sangrando",        desc: "Perde 1 PV por rodada até receber primeiros socorros." },
  { id: "atordoado",       name: "Atordoado",        desc: "Sem ações até o próximo turno." },
  { id: "cego",            name: "Cego",             desc: "Não enxerga; penalidade severa em ações que exijam visão." },
  { id: "envenenado",      name: "Envenenado/Doente", desc: "Sob efeito de veneno ou doença, conforme a fonte." },
  { id: "amordacado",      name: "Imobilizado",      desc: "Preso ou agarrado; não pode se mover livremente." },
];

export const CTHULHU_STATE_BY_ID: Record<string, CthulhuState> = Object.fromEntries(
  CTHULHU_STATES.map((s) => [s.id, s]),
);
