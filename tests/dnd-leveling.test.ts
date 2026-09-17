import { describe, it, expect } from "vitest";
import {
  MAX_LEVEL, XP_THRESHOLDS, proficiencyBonus, averageHpGain,
  hasAsiAt, validateAsi, maxSpellLevelAt, getMaxSlots, ABILITY_MAX,
} from "@/lib/dnd/leveling";
import type { AbilityKey } from "@/lib/dnd/races";

const scores = (o: Partial<Record<AbilityKey, number>> = {}): Record<AbilityKey, number> =>
  ({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...o });

describe("D&D 5e — bônus de proficiência (tabela Avanço de Personagem)", () => {
  // Livro do Jogador: +2 (níveis 1-4), +3 (5-8), +4 (9-12), +5 (13-16), +6 (17-20)
  it.each([
    [1, 2], [4, 2], [5, 3], [8, 3], [9, 4], [12, 4], [13, 5], [16, 5], [17, 6], [20, 6],
  ])("nível %i → +%i", (level, expected) => {
    expect(proficiencyBonus(level)).toBe(expected);
  });

  it("satura nos extremos em vez de extrapolar", () => {
    expect(proficiencyBonus(0)).toBe(proficiencyBonus(1));
    expect(proficiencyBonus(99)).toBe(proficiencyBonus(MAX_LEVEL));
  });
});

describe("D&D 5e — PV fixo por nível (média do Dado de Vida)", () => {
  // Regra: metade do dado, arredondada para cima → d6:4, d8:5, d10:6, d12:7
  it.each([[6, 4], [8, 5], [10, 6], [12, 7]])("d%i → %i PV", (die, expected) => {
    expect(averageHpGain(die)).toBe(expected);
  });
});

describe("D&D 5e — limiares de XP", () => {
  it("cobre os 20 níveis e é monotônico", () => {
    expect(XP_THRESHOLDS.length).toBe(MAX_LEVEL + 1);
    for (let l = 3; l <= MAX_LEVEL; l++) {
      expect(XP_THRESHOLDS[l]).toBeGreaterThan(XP_THRESHOLDS[l - 1]);
    }
  });

  it("usa os valores oficiais nos marcos conhecidos", () => {
    expect(XP_THRESHOLDS[2]).toBe(300);
    expect(XP_THRESHOLDS[5]).toBe(6500);
    expect(XP_THRESHOLDS[11]).toBe(85000);
    expect(XP_THRESHOLDS[20]).toBe(355000);
  });
});

describe("D&D 5e — Melhoria de Valor de Habilidade", () => {
  it("guerreiro ganha ASI extra nos níveis 6 e 14", () => {
    expect(hasAsiAt("guerreiro", 6)).toBe(true);
    expect(hasAsiAt("guerreiro", 14)).toBe(true);
    expect(hasAsiAt("mago", 6)).toBe(false);
  });

  it("ladino ganha ASI extra no nível 10", () => {
    expect(hasAsiAt("ladino", 10)).toBe(true);
    expect(hasAsiAt("mago", 10)).toBe(false);
  });

  it("todas as classes recebem ASI nos níveis padrão", () => {
    for (const level of [4, 8, 12, 16, 19]) {
      expect(hasAsiAt("mago", level)).toBe(true);
    }
  });

  it("aceita +2 num atributo ou +1/+1 em dois", () => {
    expect(validateAsi({ str: 2 }, scores())).toBeNull();
    expect(validateAsi({ str: 1, dex: 1 }, scores())).toBeNull();
  });

  it("recusa distribuições que não somam +2", () => {
    expect(validateAsi({ str: 1 }, scores())).not.toBeNull();
    expect(validateAsi({ str: 3 }, scores())).not.toBeNull();
    expect(validateAsi({ str: 1, dex: 1, con: 1 }, scores())).not.toBeNull();
  });

  it("impede ultrapassar o teto de 20", () => {
    expect(validateAsi({ str: 2 }, scores({ str: 19 }))).not.toBeNull();
    expect(validateAsi({ str: 2 }, scores({ str: 18 }))).toBeNull();
    expect(ABILITY_MAX).toBe(20);
  });
});

describe("D&D 5e — progressão de conjuração", () => {
  it("conjurador pleno alcança magias de 9º círculo no nível 17", () => {
    expect(maxSpellLevelAt("mago", 1)).toBe(1);
    expect(maxSpellLevelAt("mago", 5)).toBe(3);
    expect(maxSpellLevelAt("mago", 17)).toBe(9);
  });

  it("mago de nível 1 tem exatamente dois espaços de 1º círculo", () => {
    expect(getMaxSlots("mago", 1)).toMatchObject({ "1": 2 });
  });

  it("classe sem conjuração não recebe espaços", () => {
    expect(Object.keys(getMaxSlots("barbaro", 20))).toHaveLength(0);
  });
});
