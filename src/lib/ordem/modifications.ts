// ─── ORDEM PARANORMAL — Modificações e Maldições de Itens (Cap. 3 / Cap. Itens
// Amaldiçoados) ──────────────────────────────────────────────────────────────
// Cada modificação aumenta a categoria do item em I. Maldições: a primeira
// aumenta em II, as seguintes em I. Modificações/maldições iguais não se
// acumulam. Bônus de modificações e maldições se somam, assim como os ajustes
// de categoria. Fonte: Livro de Regras (Jambô), Tabelas 3.5–3.9 e cap. de Itens
// Amaldiçoados.

import type { Weapon, Protection, GeneralItem } from "./items";

export type ModElement = "Sangue" | "Morte" | "Conhecimento" | "Energia" | "Medo";

// Em que tipo de item a modificação pode ser aplicada.
export type WeaponScope = "todas" | "fogo" | "municao" | "corpo"; // corpo = só corpo a corpo

export interface WeaponMod {
  id: string;
  name: string;
  effect: string;
  scope: WeaponScope;
}

export interface ProtectionMod {
  id: string;
  name: string;
  effect: string;
  only?: "leve" | "pesada"; // restrição de tipo de proteção
}

export interface AccessoryMod {
  id: string;
  name: string;
  effect: string;
}

export interface Curse {
  id: string;
  name: string;
  element: ModElement;
  effect: string;
}

// ─── Modificações de Armas (Tabela 3.5) ──────────────────────────────────────
export const WEAPON_MODS: WeaponMod[] = [
  // Corpo a corpo e de disparo
  { id: "certeira",  name: "Certeira",  scope: "todas", effect: "+2 em testes de ataque." },
  { id: "cruel",     name: "Cruel",     scope: "todas", effect: "+2 em rolagens de dano." },
  { id: "discreta",  name: "Discreta",  scope: "todas", effect: "+5 em testes para ser ocultada (mesmo destreinado) e −1 espaço." },
  { id: "perigosa",  name: "Perigosa",  scope: "todas", effect: "+2 na margem de ameaça." },
  { id: "tatica",    name: "Tática",    scope: "todas", effect: "Pode sacar a arma como ação livre." },
  // Apenas armas de fogo
  { id: "alongada",       name: "Alongada",          scope: "fogo", effect: "+2 em testes de ataque." },
  { id: "calibre-grosso", name: "Calibre Grosso",    scope: "fogo", effect: "Aumenta o dano em mais um dado do mesmo tipo. Exige munição de calibre grosso." },
  { id: "compensador",    name: "Compensador",       scope: "fogo", effect: "Apenas armas automáticas. Anula a penalidade por disparar rajadas." },
  { id: "ferrolho-automatico", name: "Ferrolho Automático", scope: "fogo", effect: "A arma se torna automática." },
  { id: "mira-laser",     name: "Mira Laser",        scope: "fogo", effect: "+2 na margem de ameaça." },
  { id: "mira-telescopica", name: "Mira Telescópica", scope: "fogo", effect: "Aumenta o alcance em uma categoria e permite Ataque Furtivo em qualquer alcance." },
  { id: "silenciador",    name: "Silenciador",       scope: "fogo", effect: "Reduz em −OO a penalidade em Furtividade para se esconder após atacar." },
  { id: "visao-calor",    name: "Visão de Calor",    scope: "fogo", effect: "Ao disparar, ignora qualquer camuflagem do alvo." },
  // Apenas munição
  { id: "dum-dum",   name: "Dum Dum",   scope: "municao", effect: "Só em balas curtas/longas. +1 no multiplicador de crítico." },
  { id: "explosiva", name: "Explosiva", scope: "municao", effect: "Só em balas curtas/longas. +2d6 de dano." },
];
export const WEAPON_MOD_BY_ID: Record<string, WeaponMod> = Object.fromEntries(WEAPON_MODS.map((m) => [m.id, m]));

// ─── Modificações de Proteções (Tabela 3.7) ──────────────────────────────────
export const PROTECTION_MODS: ProtectionMod[] = [
  { id: "antibombas", name: "Antibombas", only: "pesada", effect: "+5 em resistência contra efeitos de área." },
  { id: "blindada",   name: "Blindada",   only: "pesada", effect: "Aumenta a RD para 5 e o espaço em +1." },
  { id: "discreta",   name: "Discreta",   only: "leve",   effect: "+5 em testes para ser ocultada (mesmo destreinado) e −1 espaço." },
  { id: "reforcada",  name: "Reforçada",  effect: "Aumenta a Defesa em +2 e o espaço em +1. Não acumula com Discreta." },
];
export const PROTECTION_MOD_BY_ID: Record<string, ProtectionMod> = Object.fromEntries(PROTECTION_MODS.map((m) => [m.id, m]));

// ─── Modificações de Acessórios (Tabela 3.9) ─────────────────────────────────
export const ACCESSORY_MODS: AccessoryMod[] = [
  { id: "aprimorado",        name: "Aprimorado",        effect: "Aumenta um dos bônus em perícia para +5." },
  { id: "discreto",          name: "Discreto",          effect: "+5 em testes para ser ocultado (mesmo destreinado) e −1 espaço." },
  { id: "funcao-adicional",  name: "Função Adicional",  effect: "Concede +2 a uma perícia adicional à escolha." },
  { id: "instrumental",      name: "Instrumental",      effect: "O acessório funciona como um kit de perícia específico." },
];
export const ACCESSORY_MOD_BY_ID: Record<string, AccessoryMod> = Object.fromEntries(ACCESSORY_MODS.map((m) => [m.id, m]));

// ─── Maldições para Armas ─────────────────────────────────────────────────────
export const WEAPON_CURSES: Curse[] = [
  { id: "antielemento", name: "Antielemento", element: "Conhecimento", effect: "Gaste 2 PE ao atacar criatura de um elemento; se acertar, +4d8 de dano." },
  { id: "ritualistica", name: "Ritualística", element: "Conhecimento", effect: "Armazena um ritual na arma e o descarrega ao acertar um ataque (ação livre)." },
  { id: "senciente",    name: "Senciente",    element: "Conhecimento", effect: "Gaste ação de movimento e 2 PE: a arma flutua e ataca sozinha 1×/rodada (1 PE/turno)." },
  { id: "empuxo",       name: "Empuxo",       element: "Energia", effect: "Só corpo a corpo. Pode ser arremessada (alcance curto, +1 dado) e retorna voando." },
  { id: "energetica",   name: "Energética",   element: "Energia", effect: "Gaste 2 PE/ataque: +5 em ataque, ignora RD e converte o dano para Energia." },
  { id: "vibrante",     name: "Vibrante",     element: "Energia", effect: "Recebe Ataque Extra (operações especiais); se já possui, custa −1 PE." },
  { id: "consumidora",  name: "Consumidora",  element: "Morte", effect: "Gaste 2 PE ao atacar; se acertar, o alvo fica imóvel por 1 rodada." },
  { id: "erosiva",      name: "Erosiva",      element: "Morte", effect: "+1d8 de dano de Morte; gaste 2 PE para 2d4 de Morte/turno por 2 rodadas." },
  { id: "repulsora",    name: "Repulsora",    element: "Morte", effect: "+2 de Defesa enquanto empunhada; ao bloquear, gaste 2 PE para +5 de Defesa." },
  { id: "lancinante",   name: "Lancinante",   element: "Sangue", effect: "+1d8 de dano de Sangue, multiplicado em crítico." },
  { id: "predadora",    name: "Predadora",    element: "Sangue", effect: "Anula camuflagem/cobertura; à distância +1 alcance; margem de ameaça duplicada." },
  { id: "sanguinaria",  name: "Sanguinária",  element: "Sangue", effect: "Alvo fica sangrando (cumulativo); crítico drena e dá 2d10 PV temporários." },
];
export const WEAPON_CURSE_BY_ID: Record<string, Curse> = Object.fromEntries(WEAPON_CURSES.map((c) => [c.id, c]));

// ─── Maldições para Proteções ─────────────────────────────────────────────────
export const PROTECTION_CURSES: Curse[] = [
  { id: "abascanta", name: "Abascanta", element: "Conhecimento", effect: "+5 em resistência a rituais; 1×/cena reflete um ritual (reação + PE do custo)." },
  { id: "profetica", name: "Profética", element: "Conhecimento", effect: "Resistência a Conhecimento 10; gaste 2 PE para rolar de novo um teste de resistência." },
  { id: "sombria",   name: "Sombria",   element: "Conhecimento", effect: "+5 em Furtividade (ignora penalidade de carga); disfarça-se como roupa comum (mov + 1 PE)." },
  { id: "cinetica",  name: "Cinética",  element: "Energia", effect: "+2 de Defesa e RD 2 (leve/escudo) ou 5 (pesada)." },
  { id: "lepida",    name: "Lépida",    element: "Energia", effect: "+10 em Atletismo e +3m de deslocamento; gaste 2 PE para movimento sobrenatural." },
  { id: "voltaica",  name: "Voltaica",  element: "Energia", effect: "Resistência a Energia 10; mov + 2 PE: arcos causam 2d6 de Energia em adjacentes/turno." },
  { id: "letargica", name: "Letárgica", element: "Morte", effect: "+2 de Defesa; 25% (leve/escudo) ou 50% (pesada) de ignorar dano extra de crítico/furtivo." },
  { id: "repulsiva", name: "Repulsiva", element: "Morte", effect: "Resistência a Morte 10; mov + 2 PE: cobre-se de Lodo, atacantes corpo a corpo sofrem 2d8 de Morte." },
  { id: "regenerativa", name: "Regenerativa", element: "Sangue", effect: "Resistência a Sangue 10; mov + 1 PE para recuperar 1d12 PV." },
  { id: "sadica",    name: "Sádica",    element: "Sangue", effect: "No início do turno, +1 em ataque e dano para cada 10 de dano sofrido desde o último turno." },
];
export const PROTECTION_CURSE_BY_ID: Record<string, Curse> = Object.fromEntries(PROTECTION_CURSES.map((c) => [c.id, c]));

// ─── Maldições para Acessórios (utensílios e vestuários) ──────────────────────
export const ACCESSORY_CURSES: Curse[] = [
  { id: "carisma",       name: "Carisma",       element: "Conhecimento", effect: "+1 em Presença (não fornece PE adicionais)." },
  { id: "conjuracao",    name: "Conjuração",    element: "Conhecimento", effect: "Possui um ritual de 1º círculo; pode conjurá-lo (ou −1 PE se já o conhece)." },
  { id: "escudo-mental", name: "Escudo Mental", element: "Conhecimento", effect: "Resistência mental 10." },
  { id: "reflexao",      name: "Reflexão",      element: "Conhecimento", effect: "1×/rodada, reflete um ritual de volta ao conjurador (PE do custo)." },
  { id: "sagacidade",    name: "Sagacidade",    element: "Conhecimento", effect: "+1 em Intelecto (não fornece perícias)." },
  { id: "defesa",        name: "Defesa",        element: "Energia", effect: "+5 de Defesa." },
  { id: "destreza",      name: "Destreza",      element: "Energia", effect: "+1 em Agilidade." },
  { id: "potencia",      name: "Potência",      element: "Energia", effect: "+1 na DT contra suas habilidades, poderes e rituais." },
  { id: "esforco-adicional", name: "Esforço Adicional", element: "Morte", effect: "+5 PE (ativa após um dia de uso)." },
  { id: "disposicao",    name: "Disposição",    element: "Sangue", effect: "+1 em Vigor." },
  { id: "pujanca",       name: "Pujança",       element: "Sangue", effect: "+1 em Força." },
  { id: "vitalidade",    name: "Vitalidade",    element: "Sangue", effect: "+15 PV (ativa após um dia de uso)." },
  { id: "protecao-elemental", name: "Proteção Elemental", element: "Energia", effect: "Resistência 10 contra um elemento à escolha." },
];
export const ACCESSORY_CURSE_BY_ID: Record<string, Curse> = Object.fromEntries(ACCESSORY_CURSES.map((c) => [c.id, c]));

// ─── Representação de item configurado ────────────────────────────────────────
export interface ConfiguredItem {
  id: string;
  mods: string[];
  curses: string[];
}

// Aceita string (formato antigo, sem mods) ou objeto e normaliza.
export function normalizeItem(raw: unknown): ConfiguredItem {
  if (typeof raw === "string") return { id: raw, mods: [], curses: [] };
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return {
      id: typeof o.id === "string" ? o.id : "",
      mods: Array.isArray(o.mods) ? (o.mods as unknown[]).filter((x): x is string => typeof x === "string") : [],
      curses: Array.isArray(o.curses) ? (o.curses as unknown[]).filter((x): x is string => typeof x === "string") : [],
    };
  }
  return { id: "", mods: [], curses: [] };
}

export function normalizeItems(raw: unknown): ConfiguredItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeItem).filter((c) => c.id);
}

// ─── Cálculo de categoria efetiva ─────────────────────────────────────────────
// Cada modificação: +1. Maldições: primeira +2, demais +1.
export function curseCategoryIncrease(curseCount: number): number {
  if (curseCount <= 0) return 0;
  return 2 + (curseCount - 1);
}

export function effectiveCategory(baseCategory: number, modCount: number, curseCount: number): number {
  return baseCategory + modCount + curseCategoryIncrease(curseCount);
}

export function configuredCategory(base: number, item: ConfiguredItem): number {
  return effectiveCategory(base, item.mods.length, item.curses.length);
}

// Soma de espaços alterada por modificações (Discreta/Discreto: −1; Blindada/
// Reforçada: +1). Resultado mínimo de 0 espaços é tratado por quem consome.
export function weaponSpaceDelta(mods: string[]): number {
  return mods.includes("discreta") ? -1 : 0;
}
export function protectionSpaceDelta(mods: string[]): number {
  let d = 0;
  if (mods.includes("discreta")) d -= 1;
  if (mods.includes("blindada")) d += 1;
  if (mods.includes("reforcada")) d += 1;
  return d;
}
export function accessorySpaceDelta(mods: string[]): number {
  return mods.includes("discreto") ? -1 : 0;
}

// ─── Modificações aplicáveis a uma arma específica ───────────────────────────
export function applicableWeaponMods(w: Weapon): WeaponMod[] {
  return WEAPON_MODS.filter((m) => {
    if (m.scope === "todas") return true;
    if (m.scope === "fogo") return w.kind === "fogo";
    if (m.scope === "corpo") return w.kind === "corpo";
    if (m.scope === "municao") return false; // munição é item separado
    return false;
  });
}

export function applicableProtectionMods(p: Protection): ProtectionMod[] {
  const kind: "leve" | "pesada" = p.id === "leve" ? "leve" : "pesada"; // escudo conta como pesada p/ prof.
  return PROTECTION_MODS.filter((m) => !m.only || m.only === kind);
}

// Acessórios = grupo "acessorio" dos itens gerais (utensílio, vestimenta, kit…).
export function isAccessory(g: GeneralItem): boolean {
  return g.group === "acessorio";
}

// ─── Resumo de efeitos de uma arma modificada (para exibição na ficha) ───────
export interface WeaponEffectSummary {
  attackBonus: number;       // certeira + alongada
  damageBonus: number;       // cruel
  extraDamage: string[];     // explosiva (+2d6), calibre grosso (+1 dado), curses (lancinante +1d8…)
  threatBonus: number;       // perigosa + mira-laser (reduz o nº da margem de ameaça)
  critMultBonus: number;     // dum-dum (+1 no multiplicador)
  notes: string[];           // efeitos textuais
}

export function weaponEffectSummary(w: Weapon, mods: string[], curses: string[]): WeaponEffectSummary {
  let attackBonus = 0;
  let damageBonus = 0;
  let threatBonus = 0;
  let critMultBonus = 0;
  const extraDamage: string[] = [];
  const notes: string[] = [];

  for (const id of mods) {
    const m = WEAPON_MOD_BY_ID[id];
    if (!m) continue;
    switch (id) {
      case "certeira":
      case "alongada": attackBonus += 2; break;
      case "cruel": damageBonus += 2; break;
      case "perigosa":
      case "mira-laser": threatBonus += 2; break;
      case "dum-dum": critMultBonus += 1; break;
      case "explosiva": extraDamage.push("+2d6"); break;
      case "calibre-grosso": extraDamage.push("+1 dado (calibre grosso)"); break;
      default: notes.push(`${m.name}: ${m.effect}`);
    }
  }
  for (const id of curses) {
    const c = WEAPON_CURSE_BY_ID[id];
    if (!c) continue;
    if (id === "lancinante") extraDamage.push("+1d8 Sangue (×crít)");
    else if (id === "erosiva") extraDamage.push("+1d8 Morte");
    else if (id === "predadora") { threatBonus += 0; notes.push("Predadora: margem de ameaça duplicada."); }
    else notes.push(`${c.name} (${c.element}): ${c.effect}`);
  }
  return { attackBonus, damageBonus, extraDamage, threatBonus, critMultBonus, notes };
}

// Margem de ameaça efetiva a partir do campo `crit` da arma (ex.: "19", "x2",
// "19/x3"). threatBonus reduz o número (19 → 17). critMultBonus aumenta o
// multiplicador (x2 → x3). Retorna string para exibição.
export function effectiveCrit(crit: string, threatBonus: number, critMultBonus: number): string {
  // separa parte de margem ("19") e multiplicador ("x3")
  const parts = crit.split("/");
  const out = parts.map((part) => {
    const t = part.trim();
    if (t.startsWith("x") || t.startsWith("×")) {
      const n = parseInt(t.slice(1), 10);
      if (!isNaN(n)) return `x${n + critMultBonus}`;
      return t;
    }
    const n = parseInt(t, 10);
    if (!isNaN(n)) return `${Math.max(2, n - threatBonus)}`;
    return t;
  });
  // se só havia margem e há critMultBonus, anexa multiplicador
  if (critMultBonus > 0 && !crit.includes("x") && !crit.includes("×")) {
    out.push(`x${2 + critMultBonus}`);
  }
  return out.join("/");
}

// Preços da maldição por elemento (texto curto para a ficha).
export const CURSE_PRICE: Record<ModElement, string> = {
  Conhecimento: "Ao falhar em teste de Intelecto: −2 SAN por maldição de Conhecimento.",
  Energia: "Ao falhar em teste de Agilidade: −2 SAN por maldição de Energia.",
  Morte: "Ao falhar em teste de Presença: −2 SAN por maldição de Morte.",
  Sangue: "Ao falhar em teste de Força ou Vigor: −2 SAN por maldição de Sangue.",
  Medo: "Preço específico definido pelo mestre.",
};
