// ─── Regras de mesa do Tormenta 20 (modo Jogar) ──────────────────────────────
// Fonte: Livro Básico — Capítulo 5 (Combate, pág. 216-217), Recuperando PV e PM
// (pág. 108) e Apêndice (Condições, pág. 392-393).
import { describe, it, expect } from "vitest";
import {
  parseCritical, parseDamageDice, criticalDamageDice, attackSkillId, isRanged,
  damageUsesStrength, restRecovery, deathThreshold, isDead, spendFromPool,
  recoverToMax, spellPmCost,
} from "@/lib/tormenta/play";
import { WEAPON_BY_ID, WEAPONS } from "@/lib/tormenta/items";
import { SKILLS, SPELL_PM_COST } from "@/lib/tormenta/data";
import { CONDITIONS, CONDITION_BY_ID, ALQUEBRADO_ID } from "@/lib/tormenta/conditions";

describe("crítico", () => {
  it("usa margem 20 quando a coluna traz só o multiplicador", () => {
    expect(parseCritical("x3")).toEqual({ threat: 20, multiplier: 3 });
  });

  it("usa multiplicador x2 quando a coluna traz só a margem", () => {
    expect(parseCritical("19")).toEqual({ threat: 19, multiplier: 2 });
  });

  it("lê margem e multiplicador juntos (mosquete: 19/x3)", () => {
    expect(parseCritical("19/x3")).toEqual({ threat: 19, multiplier: 3 });
  });

  it("recusa arma sem dano (rede)", () => {
    expect(parseCritical("—")).toBeNull();
  });

  it("toda arma do catálogo tem margem entre 18 e 20 e multiplicador de x2 a x4", () => {
    for (const w of WEAPONS) {
      const crit = parseCritical(w.critical);
      if (!crit) continue;
      expect(crit.threat).toBeGreaterThanOrEqual(18);
      expect(crit.threat).toBeLessThanOrEqual(20);
      expect(crit.multiplier).toBeGreaterThanOrEqual(2);
      expect(crit.multiplier).toBeLessThanOrEqual(4);
    }
  });

  it("multiplica os dados, não o bônus (montante 2d6 com x2 vira 4d6)", () => {
    const base = parseDamageDice("2d6")!;
    expect(criticalDamageDice(base, 2)).toEqual({ count: 4, sides: 6 });
  });
});

describe("dano da arma", () => {
  it("lê a notação da tabela de armas", () => {
    expect(parseDamageDice("1d8")).toEqual({ count: 1, sides: 8 });
    expect(parseDamageDice("2d4")).toEqual({ count: 2, sides: 4 });
  });

  it("usa a primeira face de arma dupla ou adaptável", () => {
    expect(parseDamageDice("1d6/1d6")).toEqual({ count: 1, sides: 6 });
    expect(parseDamageDice("1d10/1d12")).toEqual({ count: 1, sides: 10 });
  });

  it("devolve nulo para arma que não causa dano", () => {
    expect(parseDamageDice("—")).toBeNull();
  });

  it("soma Força no corpo a corpo e no arremesso, mas não no disparo", () => {
    expect(damageUsesStrength(WEAPON_BY_ID["espada-longa"])).toBe(true);
    expect(damageUsesStrength(WEAPON_BY_ID["azagaia"])).toBe(true);   // arremessável
    expect(damageUsesStrength(WEAPON_BY_ID["funda"])).toBe(true);     // exceção na coluna Especial
    expect(damageUsesStrength(WEAPON_BY_ID["arco-longo"])).toBe(false);
    expect(damageUsesStrength(WEAPON_BY_ID["besta-pesada"])).toBe(false);
    expect(damageUsesStrength(WEAPON_BY_ID["mosquete"])).toBe(false);
  });
});

describe("teste de ataque", () => {
  it("é Luta no corpo a corpo e Pontaria à distância", () => {
    expect(attackSkillId(WEAPON_BY_ID["maca"])).toBe("luta");
    expect(attackSkillId(WEAPON_BY_ID["arco-curto"])).toBe("pontaria");
    expect(isRanged(WEAPON_BY_ID["arco-curto"])).toBe(true);
  });

  it("as duas perícias de ataque existem e usam Força e Destreza", () => {
    expect(SKILLS.find((s) => s.id === "luta")?.attr).toBe("for");
    expect(SKILLS.find((s) => s.id === "pontaria")?.attr).toBe("des");
  });
});

describe("descanso (pág. 108)", () => {
  it("recupera o nível em condição normal", () => {
    expect(restRecovery(5, "normal")).toBe(5);
  });

  it("recupera metade do nível em condição ruim — o exemplo do livro (bardo de 5º: 2)", () => {
    expect(restRecovery(5, "ruim")).toBe(2);
  });

  it("dobra em condição confortável e triplica na luxuosa", () => {
    expect(restRecovery(5, "confortavel")).toBe(10);
    expect(restRecovery(5, "luxuosa")).toBe(15);
  });

  it("nunca recupera acima do máximo", () => {
    expect(recoverToMax(28, 10, 30)).toBe(30);
  });
});

describe("ferimentos e morte (pág. 217)", () => {
  it("morre em –10 quando metade dos PV é menor que 10 (Oberon, 12 PV)", () => {
    expect(deathThreshold(12)).toBe(-10);
    expect(isDead(-10, 12)).toBe(true);
    expect(isDead(-9, 12)).toBe(false);
  });

  it("morre em –15 quando os PV sobem para 30", () => {
    expect(deathThreshold(30)).toBe(-15);
    expect(isDead(-14, 30)).toBe(false);
    expect(isDead(-15, 30)).toBe(true);
  });
});

describe("pontos temporários (pág. 108)", () => {
  it("gasta os temporários antes dos atuais", () => {
    expect(spendFromPool({ current: 20, temp: 5 }, 3, 0)).toEqual({ current: 20, temp: 2 });
  });

  it("transborda para os pontos atuais quando os temporários acabam", () => {
    expect(spendFromPool({ current: 20, temp: 5 }, 8, 0)).toEqual({ current: 17, temp: 0 });
  });

  it("PM não fica negativo, mas PV desce até o limiar de morte", () => {
    expect(spendFromPool({ current: 2, temp: 0 }, 10, 0)).toEqual({ current: 0, temp: 0 });
    expect(spendFromPool({ current: 2, temp: 0 }, 30, deathThreshold(12))).toEqual({ current: -10, temp: 0 });
  });
});

describe("custo de magia", () => {
  it("segue a tabela de custo por círculo", () => {
    expect(spellPmCost(1, false)).toBe(SPELL_PM_COST[1]);
    expect(spellPmCost(5, false)).toBe(SPELL_PM_COST[5]);
  });

  it("alquebrado aumenta o custo em +1", () => {
    expect(spellPmCost(1, true)).toBe(SPELL_PM_COST[1] + 1);
    expect(spellPmCost(3, true)).toBe(SPELL_PM_COST[3] + 1);
  });
});

describe("condições (Apêndice)", () => {
  it("traz as 33 condições do livro, sem id repetido", () => {
    expect(CONDITIONS).toHaveLength(33);
    expect(new Set(CONDITIONS.map((c) => c.id)).size).toBe(33);
  });

  it("indexa por id e classifica as condições de categoria", () => {
    expect(CONDITION_BY_ID[ALQUEBRADO_ID].name).toBe("Alquebrado");
    expect(CONDITION_BY_ID["abalado"].category).toBe("medo");
    expect(CONDITION_BY_ID["atordoado"].category).toBe("mental");
    expect(CONDITION_BY_ID["imovel"].category).toBe("paralisia");
    expect(CONDITION_BY_ID["cego"].category).toBe("sentidos");
    expect(CONDITION_BY_ID["exausto"].category).toBe("fadiga");
  });

  it("toda condição tem descrição", () => {
    for (const c of CONDITIONS) expect(c.desc.length).toBeGreaterThan(10);
  });
});
