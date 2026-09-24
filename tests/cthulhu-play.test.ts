// ─── Regras de mesa do Call of Cthulhu 7e (modo Jogar) ───────────────────────
// Fonte: Livro Básico do Guardião — Sistema de Regras (níveis de sucesso,
// pág. 84-85), Dados de Bônus/Penalidade (pág. 91) e Combate/Dano (Cap. Combate).
import { describe, it, expect } from "vitest";
import {
  resolveCheck, rollWeaponDamage, rollImprovement, rollPercentile,
} from "@/lib/cthulhu/data";
import { WEAPONS } from "@/lib/cthulhu/data";
import type { CthulhuAttrs } from "@/lib/cthulhu/data";

const attrs = (o: Partial<CthulhuAttrs> = {}): CthulhuAttrs => ({
  for: 50, con: 50, tam: 65, des: 50, apa: 50, int: 65, pod: 50, edu: 65, ...o,
} as CthulhuAttrs);

describe("teste de perícia — níveis de sucesso (pág. 84-85)", () => {
  it("1 é sempre crítico, mesmo com perícia baixa", () => {
    expect(resolveCheck(5, 1).level).toBe("critico");
    expect(resolveCheck(5, 1).success).toBe(true);
  });

  it("a fronteira exata do sucesso extremo é um quinto do alvo (alvo 50 → 10)", () => {
    expect(resolveCheck(50, 10).level).toBe("extremo");
    expect(resolveCheck(50, 11).level).toBe("dificil");
  });

  it("a fronteira exata do sucesso difícil é metade do alvo (alvo 50 → 25)", () => {
    expect(resolveCheck(50, 25).level).toBe("dificil");
    expect(resolveCheck(50, 26).level).toBe("normal");
  });

  it("a fronteira exata do sucesso normal é o próprio alvo", () => {
    expect(resolveCheck(50, 50).level).toBe("normal");
    expect(resolveCheck(50, 50).success).toBe(true);
  });

  it("100 é sempre desastre, mesmo com perícia alta", () => {
    expect(resolveCheck(90, 100).level).toBe("desastre");
    expect(resolveCheck(90, 100).success).toBe(false);
  });

  it("falha vira desastre entre 96-99 só quando a perícia é menor que 50", () => {
    expect(resolveCheck(49, 96).level).toBe("desastre");
    expect(resolveCheck(49, 99).level).toBe("desastre");
    expect(resolveCheck(50, 96).level).toBe("falha");
    expect(resolveCheck(50, 99).level).toBe("falha");
  });

  it("alvo é limitado a 0-99 antes de resolver (perícia 0 nunca passa de crítico em 1)", () => {
    expect(resolveCheck(0, 1).level).toBe("critico");
    expect(resolveCheck(0, 2).level).toBe("falha");
    expect(resolveCheck(150, 99).level).toBe("normal");
  });
});

describe("rolagem de dano de arma (Tabela de Armas)", () => {
  const facaGrande = WEAPONS.find((w) => w.id === "faca_gra")!; // 1D8, soma Dano Extra inteiro
  const pedra = WEAPONS.find((w) => w.id === "pedra")!;         // 1D4, soma metade do Dano Extra
  const pistola = WEAPONS.find((w) => w.id === "rev38")!;       // 1D10, não soma Dano Extra
  const espingarda = WEAPONS.find((w) => w.id === "esp12")!;    // 4D6/2D6/1D6, três faixas de alcance

  it("soma o Dano Extra inteiro quando addDB é verdadeiro (FOR+TAM alto → +1D6)", () => {
    const a = attrs({ for: 90, tam: 90 }); // calcDamageBonus → "+1D6"
    for (let i = 0; i < 60; i++) {
      const [seg] = rollWeaponDamage(facaGrande, a);
      // 1D8 (1-8) + 1D6 (1-6)
      expect(seg.result.total).toBeGreaterThanOrEqual(2);
      expect(seg.result.total).toBeLessThanOrEqual(14);
      expect(seg.result.rolls).toHaveLength(2); // 1 dado base + 1 dado de bônus
    }
  });

  it("soma metade do Dano Extra, arredondada para baixo, quando halfDB é verdadeiro (FOR+TAM alto → +2D6)", () => {
    const a = attrs({ for: 110, tam: 110 }); // calcDamageBonus → "+2D6" (total 2-12, metade 1-6)
    for (let i = 0; i < 60; i++) {
      const [seg] = rollWeaponDamage(pedra, a);
      // 1D4 (1-4) + metade de 2D6 (1-6)
      expect(seg.result.total).toBeGreaterThanOrEqual(2);
      expect(seg.result.total).toBeLessThanOrEqual(10);
    }
  });

  it("não soma Dano Extra quando a arma não usa (pistola)", () => {
    const a = attrs({ for: 110, tam: 110 }); // Dano Extra alto, mas addDB e halfDB ambos falsos
    for (let i = 0; i < 60; i++) {
      const [seg] = rollWeaponDamage(pistola, a);
      expect(seg.result.total).toBeGreaterThanOrEqual(1);
      expect(seg.result.total).toBeLessThanOrEqual(10);
      expect(seg.result.rolls).toHaveLength(1); // só o dado base, sem dado de Dano Extra
    }
  });

  it("não soma nada quando o Dano Extra é 'Nenhum' (FOR+TAM médio)", () => {
    const a = attrs(); // for:50, tam:65 → soma 115 → calcDamageBonus "Nenhum"
    for (let i = 0; i < 30; i++) {
      const [seg] = rollWeaponDamage(facaGrande, a);
      expect(seg.result.total).toBeGreaterThanOrEqual(1);
      expect(seg.result.total).toBeLessThanOrEqual(8);
      expect(seg.result.rolls).toHaveLength(1); // só o dado base, nenhum dado de Dano Extra
    }
  });

  it("um Dano Extra negativo é subtraído do dano, sem virar dado (FOR+TAM baixo)", () => {
    const a = attrs({ for: 30, tam: 30 }); // soma 60 → calcDamageBonus "-2"
    for (let i = 0; i < 30; i++) {
      const [seg] = rollWeaponDamage(facaGrande, a);
      // 1D8 (1-8) - 2, nunca abaixo de zero
      expect(seg.result.total).toBeGreaterThanOrEqual(0);
      expect(seg.result.total).toBeLessThanOrEqual(6);
    }
  });

  it("espingarda devolve uma faixa Perto/Médio/Longe por segmento de dano", () => {
    const [perto, medio, longe] = rollWeaponDamage(espingarda, attrs());
    expect(perto.label).toBe("Perto");
    expect(medio.label).toBe("Médio");
    expect(longe.label).toBe("Longe");
    expect(perto.result.total).toBeGreaterThanOrEqual(4);
    expect(perto.result.total).toBeLessThanOrEqual(24);
  });

  it("nunca devolve dano negativo (o mínimo é zero)", () => {
    for (let i = 0; i < 60; i++) {
      const [seg] = rollWeaponDamage(pistola, attrs());
      expect(seg.result.total).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("aprimoramento de perícia (Improvement Check)", () => {
  it("só melhora quando a rolagem supera o valor atual", () => {
    for (let i = 0; i < 300; i++) {
      const current = 40;
      const r = rollImprovement(current);
      expect(r.improved).toBe(r.roll > current);
      if (!r.improved) {
        expect(r.gain).toBe(0);
        expect(r.newValue).toBe(current);
      }
    }
  });

  it("o ganho, quando há melhoria, é 1D10", () => {
    for (let i = 0; i < 300; i++) {
      const r = rollImprovement(10); // quase sempre melhora (roll > 10 na maioria das rolagens)
      if (r.improved) {
        expect(r.gain).toBeGreaterThanOrEqual(1);
        expect(r.gain).toBeLessThanOrEqual(10);
      }
    }
  });

  it("nunca ultrapassa 99, mesmo perto do teto", () => {
    for (let i = 0; i < 300; i++) {
      const r = rollImprovement(95);
      expect(r.newValue).toBeLessThanOrEqual(99);
    }
  });

  it("perícia em 0 sempre melhora (rollPercentile nunca sorteia 0)", () => {
    for (let i = 0; i < 100; i++) {
      const r = rollImprovement(0);
      expect(r.improved).toBe(true);
    }
  });
});

describe("percentual base (1D100)", () => {
  it("sempre devolve um valor entre 1 e 100", () => {
    for (let i = 0; i < 300; i++) {
      const v = rollPercentile();
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});
