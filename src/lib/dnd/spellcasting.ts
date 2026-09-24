// ─── D&D 5e — configuração de conjuração por classe ──────────────────────────
// Separado de `spells.ts` de propósito: aquele arquivo tem ~75 KB, quase tudo em
// `SPELLS`, e quem só precisa saber quantos truques um bardo começa sabendo não
// tem por que carregar as 1300 linhas do grimório inteiro para o navegador.

export interface SpellcastingConfig {
  cantripsKnown: number;
  spellsKnown: number;
  spellSlots1st: number;
  ability: string;
  type: "known" | "prepare";
}

// Classes that are spellcasters at level 1 (Ranger gets spells at level 2, not included)
export const SPELLCASTING: Record<string, SpellcastingConfig> = {
  bardo:      { cantripsKnown: 2, spellsKnown: 4, spellSlots1st: 2, ability: "Carisma",      type: "known"   },
  clerigo:    { cantripsKnown: 3, spellsKnown: 4, spellSlots1st: 2, ability: "Sabedoria",    type: "prepare" },
  druida:     { cantripsKnown: 2, spellsKnown: 4, spellSlots1st: 2, ability: "Sabedoria",    type: "prepare" },
  feiticeiro: { cantripsKnown: 4, spellsKnown: 2, spellSlots1st: 2, ability: "Carisma",      type: "known"   },
  mago:       { cantripsKnown: 3, spellsKnown: 6, spellSlots1st: 2, ability: "Inteligência", type: "known"   },
  bruxo:      { cantripsKnown: 2, spellsKnown: 2, spellSlots1st: 1, ability: "Carisma",      type: "known"   },
  // Paladino: conjuração começa no nível 2, não no nível 1 (PHB p.84)
};
