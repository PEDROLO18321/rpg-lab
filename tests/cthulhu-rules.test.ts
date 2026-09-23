import { describe, it, expect } from "vitest";
import {
  calcPV, calcPM, calcMOV, calcDamageBonus, calcCorpo, half, fifth,
  applyAgeModifiers, rollAll, rollPercentileDice, resolveCheck,
} from "@/lib/cthulhu/data";
import type { CthulhuAttrs } from "@/lib/cthulhu/data";

const attrs = (o: Partial<CthulhuAttrs> = {}): CthulhuAttrs => ({
  for: 50, con: 50, tam: 65, des: 50, apa: 50, int: 65, pod: 50, edu: 65, ...o,
} as CthulhuAttrs);

describe("Call of Cthulhu 7e — derivados da ficha", () => {
  it("PV = (CON + TAM) / 10, arredondado para baixo", () => {
    expect(calcPV(attrs({ con: 50, tam: 65 }))).toBe(11);
    expect(calcPV(attrs({ con: 40, tam: 40 }))).toBe(8);
  });

  it("PM = POD / 5, arredondado para baixo", () => {
    expect(calcPM(attrs({ pod: 50 }))).toBe(10);
    expect(calcPM(attrs({ pod: 74 }))).toBe(14);
  });

  it("perícias derivam em metade e um quinto", () => {
    expect(half(75)).toBe(37);
    expect(fifth(75)).toBe(15);
  });
});

describe("Call of Cthulhu 7e — bônus de dano e corpo (tabela FOR+TAM)", () => {
  it.each([
    [30, 30, "-2", -2],
    [40, 40, "-1", -1],
    [50, 60, "Nenhum", 0],
    [70, 70, "+1D4", 1],
    [90, 90, "+1D6", 2],
    [110, 110, "+2D6", 3],
  ])("FOR %i + TAM %i → %s", (f, t, dano, corpo) => {
    const a = attrs({ for: f, tam: t });
    expect(calcDamageBonus(a)).toBe(dano);
    expect(calcCorpo(a)).toBe(corpo);
  });
});

describe("Call of Cthulhu 7e — movimento", () => {
  it("compara FOR e DES contra TAM", () => {
    expect(calcMOV(attrs({ for: 40, des: 40, tam: 80 }), 30)).toBe(7);
    expect(calcMOV(attrs({ for: 80, des: 80, tam: 40 }), 30)).toBe(9);
    expect(calcMOV(attrs({ for: 50, des: 50, tam: 50 }), 30)).toBe(8);
  });

  it("aplica a penalidade por idade a partir dos 40", () => {
    const a = attrs({ for: 50, des: 50, tam: 50 }); // MOV base 8
    expect(calcMOV(a, 39)).toBe(8);
    expect(calcMOV(a, 40)).toBe(7);
    expect(calcMOV(a, 60)).toBe(5);
    expect(calcMOV(a, 80)).toBe(3);
  });

  it("nunca desce abaixo de 1", () => {
    expect(calcMOV(attrs({ for: 10, des: 10, tam: 90 }), 99)).toBeGreaterThanOrEqual(1);
  });
});

describe("Call of Cthulhu 7e — modificadores de idade", () => {
  it("investigador jovem (15-19) sofre redução física", () => {
    const base = attrs();
    const young = applyAgeModifiers(base, 17);
    expect(young.for + young.tam).toBeLessThan(base.for + base.tam);
  });

  it("idades avançadas reduzem atributos físicos e aumentam EDU", () => {
    const base = attrs();
    const old = applyAgeModifiers(base, 75);
    expect(old.for).toBeLessThan(base.for);
    expect(old.edu).toBeGreaterThanOrEqual(base.edu);
  });

  it("nenhum atributo fica negativo em nenhuma idade", () => {
    for (const age of [15, 20, 40, 50, 60, 70, 80, 89]) {
      const a = applyAgeModifiers(attrs({ for: 15, con: 15, des: 15, tam: 15 }), age);
      for (const v of Object.values(a)) expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("Call of Cthulhu 7e — rolagem de atributos", () => {
  it("gera valores dentro da faixa possível dos dados", () => {
    for (let i = 0; i < 200; i++) {
      const a = rollAll();
      // 3d6×5 → 15..90 ; (2d6+6)×5 → 40..90
      expect(a.for).toBeGreaterThanOrEqual(15);
      expect(a.for).toBeLessThanOrEqual(90);
      expect(a.tam).toBeGreaterThanOrEqual(40);
      expect(a.tam).toBeLessThanOrEqual(90);
      expect(a.edu).toBeGreaterThanOrEqual(40);
      expect(a.edu).toBeLessThanOrEqual(90);
    }
  });
});

describe("Call of Cthulhu 7e — dados de bônus e de penalidade (pág. 91)", () => {
  it("rola um dado de dezenas a mais por dado de bônus, com um único dado de unidades", () => {
    for (let i = 0; i < 200; i++) {
      expect(rollPercentileDice(1, 0).tens).toHaveLength(2);
      expect(rollPercentileDice(2, 0).tens).toHaveLength(3);
      expect(rollPercentileDice(0, 1).tens).toHaveLength(2);
    }
  });

  it("bônus fica com a menor leitura e penalidade com a maior", () => {
    for (let i = 0; i < 300; i++) {
      const b = rollPercentileDice(1, 0);
      expect(b.result).toBe(Math.min(...b.readings));
      const p = rollPercentileDice(0, 1);
      expect(p.result).toBe(Math.max(...p.readings));
    }
  });

  it("um dado de bônus e um de penalidade se anulam", () => {
    for (let i = 0; i < 100; i++) {
      const r = rollPercentileDice(1, 1);
      expect(r.tens).toHaveLength(1);
      expect(r.result).toBe(r.readings[0]);
    }
  });

  it("limita o saldo a dois dados extras", () => {
    expect(rollPercentileDice(5, 0).tens).toHaveLength(3);
    expect(rollPercentileDice(0, 5).tens).toHaveLength(3);
  });

  it("lê 00 com 0 como 100, e 00 com outro valor como unidade (pág. 85)", () => {
    for (let i = 0; i < 500; i++) {
      const r = rollPercentileDice();
      for (const [idx, t] of r.tens.entries()) {
        const esperado = t === 0 && r.units === 0 ? 100 : t + r.units;
        expect(r.readings[idx]).toBe(esperado);
      }
      expect(r.result).toBeGreaterThanOrEqual(1);
      expect(r.result).toBeLessThanOrEqual(100);
    }
  });

  it("alimenta os níveis de sucesso sem mudar a resolução", () => {
    // Exemplo do livro: Charme 55 com dado de bônus, unidades 4, dezenas 40 e 20
    // → leituras 44 e 24; o jogador usa 24, um sucesso difícil (metade de 55).
    expect(resolveCheck(55, 24).level).toBe("dificil");
    expect(resolveCheck(55, 44).level).toBe("normal");
  });
});
