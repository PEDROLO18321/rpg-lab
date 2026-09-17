import { describe, it, expect } from "vitest";
import {
  attributeDicePool, finalAttrs, trainedSkillCount, computeVitals,
  effectivePlanetSkill, planetSkillNeedsChoice,
} from "@/lib/starwars/creation";
import { ATTR_KEYS, type StarWarsAttrs } from "@/lib/starwars/data";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { PLANET_BY_ID } from "@/lib/starwars/planets";

const base = (v = 1): StarWarsAttrs =>
  ATTR_KEYS.reduce((a, k) => ({ ...a, [k]: v }), {} as StarWarsAttrs);

describe("Star Wars (autoral) — pool de dados por atributo", () => {
  it("atributo positivo rola N dados pegando o maior", () => {
    expect(attributeDicePool(3)).toEqual({ dice: 3, take: "highest" });
    expect(attributeDicePool(1)).toEqual({ dice: 1, take: "highest" });
  });

  it("atributo zero ou negativo rola com desvantagem", () => {
    expect(attributeDicePool(0)).toEqual({ dice: 2, take: "lowest" });
    expect(attributeDicePool(-2)).toEqual({ dice: 4, take: "lowest" });
  });

  it("quanto pior o atributo, mais dados com desvantagem", () => {
    expect(attributeDicePool(-3).dice).toBeGreaterThan(attributeDicePool(-1).dice);
  });
});

describe("Star Wars (autoral) — atributos finais por espécie", () => {
  it("aplica o modificador fixo da espécie", () => {
    for (const [id, species] of Object.entries(SPECIES_BY_ID)) {
      if (species.attrFreeChoice) continue;
      const result = finalAttrs(base(1), id);
      for (const k of ATTR_KEYS) {
        expect(result[k]).toBe(1 + (species.attrBonus[k] ?? 0));
      }
    }
  });

  it("Humano distribui a escolha livre +2/+1/-1", () => {
    const human = Object.entries(SPECIES_BY_ID).find(([, s]) => s.attrFreeChoice);
    if (!human) return;
    const [id] = human;
    const r = finalAttrs(base(1), id, { plus2: ["agi"], plus1: ["int"], minus1: ["vig"] });
    expect(r.agi).toBe(3);
    expect(r.int).toBe(2);
    expect(r.vig).toBe(0);
  });

  it("espécie desconhecida não altera os atributos", () => {
    expect(finalAttrs(base(2), "ewok-imaginario")).toEqual(base(2));
  });
});

describe("Star Wars (autoral) — perícias treinadas na criação", () => {
  it("cresce com Intelecto", () => {
    const id = Object.keys(CLASS_BY_ID)[0];
    expect(trainedSkillCount(id, 4)).toBeGreaterThan(trainedSkillCount(id, 1));
  });

  it("nunca é negativo", () => {
    for (const id of Object.keys(CLASS_BY_ID)) {
      expect(trainedSkillCount(id, -5)).toBeGreaterThanOrEqual(0);
    }
  });

  it("classe inexistente devolve zero", () => {
    expect(trainedSkillCount("nao-existe", 5)).toBe(0);
  });
});

describe("Star Wars (autoral) — vitais no nível 1", () => {
  it("toda combinação classe × espécie gera PV positivo", () => {
    for (const classId of Object.keys(CLASS_BY_ID)) {
      for (const speciesId of Object.keys(SPECIES_BY_ID)) {
        const v = computeVitals(classId, speciesId, 2, 2, 2);
        expect(v.pvMax).toBeGreaterThan(0);
        expect(v.peMax).toBeGreaterThanOrEqual(0);
        expect(v.ppMax).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("mais Vigor resulta em mais PV", () => {
    const classId = Object.keys(CLASS_BY_ID)[0];
    const speciesId = Object.keys(SPECIES_BY_ID)[0];
    expect(computeVitals(classId, speciesId, 5, 2, 2).pvMax)
      .toBeGreaterThan(computeVitals(classId, speciesId, 1, 2, 2).pvMax);
  });

  it("combinação inválida devolve vitais mínimos em vez de quebrar", () => {
    expect(computeVitals("x", "y", 1, 1, 1)).toEqual({ pvMax: 1, peMax: 0, ppMax: 0 });
  });
});

describe("Star Wars (autoral) — Habilidade Natal do planeta", () => {
  it("planeta com uma única perícia dispensa escolha", () => {
    for (const [id, planet] of Object.entries(PLANET_BY_ID)) {
      if (planet.naturalAbility.skills.length === 1) {
        expect(planetSkillNeedsChoice(id)).toBe(false);
        expect(effectivePlanetSkill(id, null)).toBe(planet.naturalAbility.skills[0]);
      }
    }
  });

  it("planeta com opções exige e respeita a escolha do jogador", () => {
    const entry = Object.entries(PLANET_BY_ID).find(([, p]) => p.naturalAbility.skills.length > 1);
    if (!entry) return;
    const [id, planet] = entry;
    expect(planetSkillNeedsChoice(id)).toBe(true);
    const chosen = planet.naturalAbility.skills[1];
    expect(effectivePlanetSkill(id, chosen)).toBe(chosen);
  });
});
