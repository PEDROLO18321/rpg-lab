// ─── Regras de mesa da Ordem Paranormal (modo Jogar) ──────────────────────────
// Fonte: Livro de Regras (Jambô, v1.2) — Testes de Perícia (Cap. 2), Combate
// (Cap. 3: Defesa, Carga), Sanidade e Insanidade (Cap. 4 e 5).
import { describe, it, expect } from "vitest";
import {
  rollSkill, skillBonus, computeDefense, peLimit, TRAIN_BONUS,
} from "@/lib/ordem/data";
import type { TrainDegree } from "@/lib/ordem/data";
import { sanityStatus, isPerturbado, lifeStatus, rollInsanity, INSANITY_EFFECTS } from "@/lib/ordem/sanity";
import { carryCapacity, loadStatus, armorDefenseBonus, OVERLOAD_DEFENSE_PENALTY, OVERLOAD_MOVE_PENALTY } from "@/lib/ordem/items";

describe("teste de perícia — maior/pior por grau de treinamento (D/T/V/E)", () => {
  it("os quatro graus somam exatamente 0/5/10/15", () => {
    expect(TRAIN_BONUS.destreinado).toBe(0);
    expect(TRAIN_BONUS.treinado).toBe(5);
    expect(TRAIN_BONUS.veterano).toBe(10);
    expect(TRAIN_BONUS.expert).toBe(15);
  });

  it("skillBonus lê a mesma tabela para os quatro graus", () => {
    for (const degree of Object.keys(TRAIN_BONUS) as TrainDegree[]) {
      expect(skillBonus(degree)).toBe(TRAIN_BONUS[degree]);
    }
  });

  it("atributo 0 rola 2d20 e usa o PIOR resultado (regra de risco)", () => {
    for (let i = 0; i < 60; i++) {
      const r = rollSkill(0, "destreinado");
      expect(r.dice).toHaveLength(2);
      expect(r.worstChosen).toBe(true);
      expect(r.chosen).toBe(Math.min(...r.dice));
      expect(r.total).toBe(r.chosen + 0);
    }
  });

  it("atributo 1 rola apenas 1d20 (nada para escolher)", () => {
    for (let i = 0; i < 30; i++) {
      const r = rollSkill(1, "treinado");
      expect(r.dice).toHaveLength(1);
      expect(r.chosen).toBe(r.dice[0]);
      expect(r.worstChosen).toBe(false);
      expect(r.total).toBe(r.chosen + 5);
    }
  });

  it("atributo no teto (5) rola 5d20 e usa o MELHOR resultado", () => {
    for (let i = 0; i < 60; i++) {
      const r = rollSkill(5, "expert");
      expect(r.dice).toHaveLength(5);
      expect(r.worstChosen).toBe(false);
      expect(r.chosen).toBe(Math.max(...r.dice));
      expect(r.total).toBe(r.chosen + 15);
    }
  });

  it("o resultado final está sempre entre 1 e 20 mais o bônus de treino", () => {
    for (let i = 0; i < 60; i++) {
      const r = rollSkill(3, "veterano");
      expect(r.chosen).toBeGreaterThanOrEqual(1);
      expect(r.chosen).toBeLessThanOrEqual(20);
      expect(r.total).toBe(r.chosen + 10);
    }
  });
});

describe("defesa e limite de PE por turno", () => {
  it("Defesa = 10 + Agilidade", () => {
    expect(computeDefense(0)).toBe(10);
    expect(computeDefense(5)).toBe(15);
  });

  it("limite de PE por turno acompanha o nível de NEX, um passo por vez", () => {
    expect(peLimit(5)).toBe(1);
    expect(peLimit(9)).toBe(1);  // ainda não bateu o próximo degrau
    expect(peLimit(10)).toBe(2);
    expect(peLimit(99)).toBe(20);
  });
});

describe("sanidade — estados (Cap. 5)", () => {
  it("perturbado exatamente quando SAN < metade da máxima", () => {
    expect(sanityStatus(10, 20)).toBe("estavel");   // metade exata: ainda estável
    expect(sanityStatus(9, 20)).toBe("perturbado"); // um abaixo da metade
  });

  it("enlouquecendo em SAN 0 (e não antes)", () => {
    expect(sanityStatus(1, 20)).toBe("perturbado");
    expect(sanityStatus(0, 20)).toBe("enlouquecendo");
  });

  it("isPerturbado concorda com sanityStatus nos mesmos limites", () => {
    expect(isPerturbado(10, 20)).toBe(false);
    expect(isPerturbado(9, 20)).toBe(true);
    expect(isPerturbado(0, 20)).toBe(false); // SAN 0 é enlouquecendo, não perturbado
  });

  it("rola 1d20 e devolve um dos 20 efeitos catalogados, sem furar o índice", () => {
    for (let i = 0; i < 60; i++) {
      const r = rollInsanity();
      expect(r.roll).toBeGreaterThanOrEqual(1);
      expect(r.roll).toBeLessThanOrEqual(20);
      expect(r.effect).toBe(INSANITY_EFFECTS[r.roll - 1]);
    }
  });
});

describe("PV — estados de vida", () => {
  it("machucado exatamente quando PV <= metade do máximo", () => {
    expect(lifeStatus(11, 20)).toBe("saudavel");
    expect(lifeStatus(10, 20)).toBe("machucado"); // metade exata já conta
  });

  it("morrendo em PV 0 ou negativo", () => {
    expect(lifeStatus(1, 20)).toBe("machucado");
    expect(lifeStatus(0, 20)).toBe("morrendo");
    expect(lifeStatus(-5, 20)).toBe("morrendo");
  });
});

describe("carga e sobrecarga", () => {
  it("capacidade é 5 espaços por ponto de Força, com piso de 2 em Força 0", () => {
    expect(carryCapacity(0)).toBe(2);
    expect(carryCapacity(1)).toBe(5);
    expect(carryCapacity(3)).toBe(15);
  });

  it("bônus de espaço soma por cima da capacidade base", () => {
    expect(carryCapacity(1, 3)).toBe(8);
  });

  it("sobrecarga começa exatamente 1 espaço acima da capacidade", () => {
    expect(loadStatus(15, 3).overloaded).toBe(false); // no limite exato: ok
    expect(loadStatus(16, 3).overloaded).toBe(true);
  });

  it("teto absoluto é o dobro da capacidade", () => {
    const cap = carryCapacity(3); // 15
    expect(loadStatus(cap * 2, 3).overCap).toBe(false);     // no teto exato: ainda válido
    expect(loadStatus(cap * 2 + 1, 3).overCap).toBe(true);  // passou do teto
    expect(loadStatus(cap * 2, 3).hardCap).toBe(cap * 2);
  });

  it("as penalidades de sobrecarga são as fixas do livro (-5 Defesa, -3m)", () => {
    expect(OVERLOAD_DEFENSE_PENALTY).toBe(5);
    expect(OVERLOAD_MOVE_PENALTY).toBe(3);
  });
});

describe("bônus de Defesa por proteção equipada", () => {
  it("corpo (leve/pesada) não acumula — usa a maior", () => {
    expect(armorDefenseBonus(["leve", "pesada"])).toBe(10);
    expect(armorDefenseBonus(["pesada", "leve"])).toBe(10);
  });

  it("escudo acumula com a proteção de corpo", () => {
    expect(armorDefenseBonus(["leve", "escudo"])).toBe(7);
  });

  it("sem proteção equipada, bônus é zero", () => {
    expect(armorDefenseBonus([])).toBe(0);
  });

  it("ignora ids desconhecidos em vez de quebrar", () => {
    expect(armorDefenseBonus(["nao-existe", "leve"])).toBe(5);
  });
});
