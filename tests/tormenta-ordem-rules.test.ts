import { describe, it, expect } from "vitest";
import { attrMod } from "@/lib/tormenta/data";
import { computeVitals, resolveKeyAttribute, racialAttrBonus, resolveClassFixedSkills } from "@/lib/tormenta/creation";
import { MAX_LEVEL, XP_THRESHOLDS as T20_XP } from "@/lib/tormenta/leveling";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { RACE_BY_ID } from "@/lib/tormenta/races";
import { MAX_NEX, nextNexValue, buildNexPlan, emptyProgression, normalizeProgression } from "@/lib/ordem/leveling";

describe("Tormenta 20 — modificador de atributo", () => {
  // ATENÇÃO — divergência consciente do livro: o Tormenta 20 oficial usa o
  // valor do atributo já como modificador (faixa curta, -1 a +4). Esta
  // implementação adota a escala 3–20 com modificador derivado, como em D&D.
  // A adaptação é internamente consistente (criação, evolução e exibição usam
  // a mesma convenção) e está documentada aqui para não se perder de vista.
  it("deriva o modificador da escala 3–20, no formato floor((valor - 10) / 2)", () => {
    expect(attrMod(10)).toBe(0);
    expect(attrMod(11)).toBe(0);
    expect(attrMod(12)).toBe(1);
    expect(attrMod(18)).toBe(4);
    expect(attrMod(8)).toBe(-1);
  });

  it("é monotônico", () => {
    for (let v = 3; v < 20; v++) {
      expect(attrMod(v + 1)).toBeGreaterThanOrEqual(attrMod(v));
    }
  });
});

describe("Tormenta 20 — vitais no 1º nível", () => {
  it("PV = base da classe + mod. Constituição", () => {
    const guerreiro = CLASS_BY_ID["guerreiro"];
    expect(computeVitals("guerreiro", 2, 0).pvMax).toBe(guerreiro.pvBase + 2);
  });

  it("PV nunca fica abaixo de 1, mesmo com Constituição negativa", () => {
    expect(computeVitals("guerreiro", -99, 0).pvMax).toBe(1);
  });

  it("PM nunca fica negativo", () => {
    expect(computeVitals("arcanista", 0, -99).pmMax).toBe(0);
  });

  it("classe desconhecida devolve vitais mínimos em vez de quebrar", () => {
    expect(computeVitals("inexistente", 3, 3)).toEqual({ pvMax: 1, pmMax: 0 });
  });
});

describe("Tormenta 20 — atributo-chave de conjuração", () => {
  it("segue o caminho escolhido pelo Arcanista", () => {
    expect(resolveKeyAttribute("arcanista", "feiticeiro")).toBe("car");
    expect(resolveKeyAttribute("arcanista", "mago")).toBe("int");
    expect(resolveKeyAttribute("arcanista", "bruxo")).toBe("int");
  });

  it("Paladino usa Carisma (poder Abençoado, sem ser conjurador pleno)", () => {
    expect(resolveKeyAttribute("paladino")).toBe("car");
  });

  it("classe sem conjuração não tem atributo-chave", () => {
    expect(resolveKeyAttribute("guerreiro")).toBeNull();
  });
});

describe("Tormenta 20 — bônus racial de atributo", () => {
  it("soma as escolhas do jogador quando a raça permite", () => {
    const humano = RACE_BY_ID["humano"];
    if (humano?.attrChoiceBonus) {
      const bonus = racialAttrBonus("humano", null, ["for", "des", "con"]);
      const total = Object.values(bonus).reduce<number>((s, v) => s + (v ?? 0), 0);
      expect(total).toBe(humano.attrChoiceBonus.count * humano.attrChoiceBonus.amount);
    }
  });

  it("respeita o limite de escolhas da raça", () => {
    const humano = RACE_BY_ID["humano"];
    if (humano?.attrChoiceBonus) {
      const excesso = racialAttrBonus("humano", null, ["for", "des", "con", "int", "sab", "car"]);
      const total = Object.values(excesso).reduce<number>((s, v) => s + (v ?? 0), 0);
      expect(total).toBe(humano.attrChoiceBonus.count * humano.attrChoiceBonus.amount);
    }
  });

  it("raça inexistente devolve objeto vazio", () => {
    expect(racialAttrBonus("dragao", null, [])).toEqual({});
  });
});

describe("Tormenta 20 — perícias fixas de classe", () => {
  it("não devolve duplicatas", () => {
    for (const id of Object.keys(CLASS_BY_ID)) {
      const skills = resolveClassFixedSkills(id, {});
      expect(new Set(skills).size).toBe(skills.length);
    }
  });
});

describe("Tormenta 20 — XP", () => {
  it("é monotônico até o nível máximo", () => {
    expect(MAX_LEVEL).toBe(20);
    for (let l = 3; l <= MAX_LEVEL; l++) {
      expect(T20_XP[l]).toBeGreaterThan(T20_XP[l - 1]);
    }
  });
});

describe("Ordem Paranormal — progressão de NEX", () => {
  it("avança pelos valores oficiais e para em 99%", () => {
    expect(nextNexValue(5)).toBe(10);
    expect(nextNexValue(95)).toBe(MAX_NEX);
    expect(nextNexValue(MAX_NEX)).toBeNull();
  });

  it("nunca retrocede", () => {
    let nex = 5;
    for (let i = 0; i < 50; i++) {
      const next = nextNexValue(nex);
      if (next === null) break;
      expect(next).toBeGreaterThan(nex);
      nex = next;
    }
    expect(nex).toBe(MAX_NEX);
  });

  it("NEX 10% exige escolher a trilha", () => {
    expect(buildNexPlan("combatente", 5, 1)?.needsTrail).toBe(true);
  });

  it("NEX 20% concede aumento de atributo", () => {
    expect(buildNexPlan("combatente", 15, 1)?.attrIncreases).toBeGreaterThan(0);
  });

  it("NEX 35% melhora perícias para veterano", () => {
    const plan = buildNexPlan("especialista", 30, 1);
    expect(plan?.trainingTarget).toBe("veterano");
    expect(plan?.trainingCount).toBeGreaterThan(0);
  });

  it("Intelecto aumenta o número de perícias melhoradas", () => {
    const semInt = buildNexPlan("especialista", 30, 0)!.trainingCount;
    const comInt = buildNexPlan("especialista", 30, 3)!.trainingCount;
    expect(comInt).toBeGreaterThan(semInt);
  });

  it("não há plano além do NEX máximo", () => {
    expect(buildNexPlan("ocultista", MAX_NEX, 1)).toBeNull();
  });
});

describe("Ordem Paranormal — progressão persistida", () => {
  it("normaliza entrada inválida para o estado vazio", () => {
    expect(normalizeProgression(null)).toEqual(emptyProgression());
    expect(normalizeProgression("lixo")).toEqual(emptyProgression());
    expect(normalizeProgression(42)).toEqual(emptyProgression());
  });

  it("preserva uma progressão já no formato correto", () => {
    const p = { trailId: "aniquilador", classPowers: ["x"], paranormalPowers: [], features: [] };
    expect(normalizeProgression(p)).toMatchObject({ trailId: "aniquilador", classPowers: ["x"] });
  });
});
