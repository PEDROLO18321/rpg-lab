// ─── Regras de mesa do Star Wars: Além da Fronteira (modo Jogar) ─────────────
// Sistema autoral do projeto (não é o d6/d20 oficial da Lucasfilm/FFG) — a
// fonte é o próprio código-fonte de `src/lib/starwars/`, documentado no
// RulesManual da ficha. Ver Área de Danos (escala por nível) e Limite de PP
// por turno.
import { describe, it, expect } from "vitest";
import { damageLevelMultiplier, diceAverage, baseDamageValue, scaledDamage } from "@/lib/starwars/damage";
import { ppMaxPerTurn, ppLevelUpGain } from "@/lib/starwars/leveling";
import { SKILL_GRADE_BONUS, SKILL_GRADE_ORDER } from "@/lib/starwars/data";

describe("Área de Danos — escala por nível (Dano Final = Base × (1 + Nível/5))", () => {
  it("nível 0 não altera o dano base (multiplicador 1)", () => {
    expect(damageLevelMultiplier(0)).toBe(1);
    expect(scaledDamage(10, 0)).toBe(10);
  });

  it("nível 5 dobra o dano base — o marco redondo da fórmula", () => {
    expect(damageLevelMultiplier(5)).toBe(2);
    expect(scaledDamage(10, 5)).toBe(20);
  });

  it("nível alto continua escalando sem teto (nível 20 → 5x)", () => {
    expect(damageLevelMultiplier(20)).toBe(5);
    expect(scaledDamage(10, 20)).toBe(50);
  });

  it("arredonda o resultado escalado (base 7, nível 1 → 8.4 vira 8)", () => {
    expect(scaledDamage(7, 1)).toBe(8);
  });

  it("lê a média de uma notação de dado pura", () => {
    expect(diceAverage("4d6")).toBe(14);
    expect(diceAverage("1d20")).toBe(10.5);
  });

  it("devolve nulo para notação que não é dado puro", () => {
    expect(diceAverage("4d6+2")).toBeNull();
    expect(diceAverage("texto")).toBeNull();
  });

  it("baseDamageValue aceita dado puro OU número puro, mas não formato misto", () => {
    expect(baseDamageValue("4d6")).toBe(14);
    expect(baseDamageValue("10")).toBe(10);
    expect(baseDamageValue("4d6+2")).toBeNull();
  });
});

describe("limite de PP gasto por turno (3 + arredondar para cima o nível/2)", () => {
  it("nível 1 (ímpar) arredonda para cima: 3 + 1 = 4", () => {
    expect(ppMaxPerTurn(1)).toBe(4);
  });

  it("nível 2 (par) não arredonda: 3 + 1 = 4", () => {
    expect(ppMaxPerTurn(2)).toBe(4);
  });

  it("nível 0 é o piso: 3 PP", () => {
    expect(ppMaxPerTurn(0)).toBe(3);
  });

  it("cresce em degraus a cada 2 níveis", () => {
    expect(ppMaxPerTurn(3)).toBe(5);
    expect(ppMaxPerTurn(4)).toBe(5);
    expect(ppMaxPerTurn(40)).toBe(23);
  });

  it("ganho de PP ao subir de nível é 1 + Presença", () => {
    expect(ppLevelUpGain(0)).toBe(1);
    expect(ppLevelUpGain(4)).toBe(5);
  });
});

describe("bônus de teste por grau de perícia", () => {
  it("os seis graus formam uma tabela crescente de 5 em 5, começando em zero", () => {
    expect(SKILL_GRADE_BONUS.inexperiente).toBe(0);
    expect(SKILL_GRADE_BONUS.mestre).toBe(25);
    for (let i = 1; i < SKILL_GRADE_ORDER.length; i++) {
      const prev = SKILL_GRADE_BONUS[SKILL_GRADE_ORDER[i - 1]];
      const cur = SKILL_GRADE_BONUS[SKILL_GRADE_ORDER[i]];
      expect(cur - prev).toBe(5);
    }
  });
});
