// ─── Cyberpunk RED — o que a rota depende e a lib sozinha consegue provar ────
// Guardas de entrada (faixas, forma do Json, perícia desconhecida), a ficha na
// visão do mestre e o registro de campanha. Sem banco e sem servidor.
import { describe, it, expect } from "vitest";
import { ImportError } from "@/lib/characterTransfer";
import { numIn } from "@/lib/sheetPatch";
import {
  RANGES, enumIn, humanityLossOf, roleIn, shapeIn, skillsIn,
} from "@/lib/cyberpunk/sheetInput";
import { STREETRAT_STATS, STAT_MIN, STAT_MAX } from "@/lib/cyberpunk/data";
import { CAMPAIGNS } from "@/lib/campaign/registry";
import { toPartySheet, partyInclude } from "@/lib/party/summary";

describe("faixas de número", () => {
  it("atributo 9999 é recusado, 10 passa", () => {
    expect(() => numIn(9999, ...RANGES.stat, "body")).toThrow(ImportError);
    expect(numIn(10, ...RANGES.stat, "body")).toBe(10);
    expect(() => numIn(0, ...RANGES.stat, "body")).toThrow(ImportError);
  });

  it("Humanidade aceita negativo até -100 (ciberpsicose), não além", () => {
    expect(numIn(-100, ...RANGES.humanity, "humanity")).toBe(-100);
    expect(() => numIn(-101, ...RANGES.humanity, "humanity")).toThrow(ImportError);
  });

  it("HP atual não aceita negativo; Sorte atual para em 10", () => {
    expect(() => numIn(-1, ...RANGES.hpCurrent, "hpCurrent")).toThrow(ImportError);
    expect(() => numIn(11, ...RANGES.luckCurrent, "luckCurrent")).toThrow(ImportError);
  });

  it("campo ausente continua undefined — não vira zero no banco", () => {
    expect(numIn(undefined, ...RANGES.eurobucks, "eurobucks")).toBeUndefined();
  });

  it("toda linha das tabelas Streetrat cabe na faixa de criação (2 a 8)", () => {
    for (const rows of Object.values(STREETRAT_STATS)) {
      for (const row of rows) {
        for (const v of row) {
          expect(v).toBeGreaterThanOrEqual(STAT_MIN);
          expect(v).toBeLessThanOrEqual(STAT_MAX);
        }
      }
    }
  });
});

describe("conjuntos fechados e forma do Json", () => {
  it("papel desconhecido é recusado", () => {
    expect(roleIn("solo")).toBe("solo");
    expect(() => roleIn("bardo")).toThrow(ImportError);
    expect(roleIn(undefined)).toBeUndefined();
    expect(() => enumIn(3, ["a"], "x")).toThrow(ImportError);
  });

  it("lista no lugar de objeto (e o contrário) é recusada", () => {
    expect(() => shapeIn("abc", "array", "weapons")).toThrow(ImportError);
    expect(() => shapeIn([], "object", "armor")).toThrow(ImportError);
    expect(shapeIn([], "array", "weapons")).toEqual([]);
    expect(shapeIn(undefined, "array", "weapons")).toBeUndefined();
  });

  it("perícias: chave inventada e nível fora de 0..10 são recusados", () => {
    expect(skillsIn({ athletics: 6, "language:streetslang": 4 })).toEqual({ athletics: 6, "language:streetslang": 4 });
    expect(() => skillsIn({ inventada: 2 })).toThrow(ImportError);
    expect(() => skillsIn({ athletics: 11 })).toThrow(ImportError);
    expect(() => skillsIn({ athletics: -1 })).toThrow(ImportError);
    expect(() => skillsIn({ athletics: "6" })).toThrow(ImportError);
  });

  it("perda de Humanidade soma só implante bem formado", () => {
    expect(humanityLossOf([{ humanityLoss: 7 }, { humanityLoss: 2 }, { humanityLoss: "x" }, null, {}])).toBe(9);
    expect(humanityLossOf("nada")).toBe(0);
  });
});

describe("registro de campanha", () => {
  it("o Cyberpunk usa o slug do banco e as seis relações esperadas", () => {
    const c = CAMPAIGNS.cyberpunk;
    expect(c.slug).toBe("cyberpunk");
    expect(c.storyRelation).toBe("cyberpunkStory");
    expect(Object.keys(c.resources).sort()).toEqual(["clocks", "clues", "combatants", "items", "npcs", "sessions"]);
  });

  it("o combatente guarda PA e penalidade de morte; o NPC guarda os 10 atributos", () => {
    const { combatants, npcs } = CAMPAIGNS.cyberpunk.resources;
    expect(combatants.fields).toEqual(expect.arrayContaining(["spHead", "spBody", "deathSavePenalty"]));
    expect(npcs.fields).toEqual(expect.arrayContaining(["int", "ref", "dex", "tech", "cool", "will", "luck", "move", "body", "emp", "threat"]));
  });
});

describe("Cyberpunk RED — ficha na visão do mestre", () => {
  const sheet = toPartySheet("cyberpunk", {
    id: "c1", name: "Johnny", portraitUrl: null, user: { name: "Pedro", email: "p@example.com" },
    cyberpunkSheet: {
      role: "solo", roleRank: 4,
      int: 5, ref: 8, dex: 7, tech: 3, cool: 6, will: 6, luck: 5, move: 6, body: 7, emp: 4,
      luckCurrent: 3, hpMax: 45, hpCurrent: 20, humanityMax: 40, humanity: 32, eurobucks: 500,
      armor: { head: { sp: 11 }, body: { sp: 7 } },
      skills: { athletics: 4, perception: 2, "language:streetslang": 4, handgun: 0 },
      criticalInjuries: [{ name: "Costelas quebradas" }],
      notes: "Anotação",
    },
  }, new Date("2026-11-10T12:00:00Z"))!;

  it("traz PV e Humanidade, e identifica papel e grau", () => {
    expect(sheet.vitals.map((v) => v.label)).toEqual(["PV", "Humanidade"]);
    expect(sheet.vitals[1]).toMatchObject({ current: 32, max: 40 });
    expect(sheet.subtitle).toBe("Solo · Grau 4");
  });

  it("lista os dez atributos", () => {
    expect(sheet.attrs).toHaveLength(10);
  });

  it("PA de cabeça e corpo, e o estado de ferimento (20/45 está grave)", () => {
    expect(sheet.stats.find((s) => s.label === "PA cabeça")!.value).toBe("11");
    expect(sheet.stats.find((s) => s.label === "PA corpo")!.value).toBe("7");
    expect(sheet.stats.find((s) => s.label === "Estado")!.value).toBe("Gravemente ferido");
  });

  it("perícia básica no nível 2 e perícia zerada não aparecem; especialidade aparece", () => {
    const nomes = sheet.skills.map((s) => s.name);
    expect(nomes).toContain("Atletismo");
    expect(nomes).not.toContain("Percepção");
    expect(nomes.some((n) => n.includes("streetslang"))).toBe(true);
    expect(nomes).not.toContain("Arma Curta");
  });

  it("os ferimentos críticos viram condições", () => {
    expect(sheet.conditions).toEqual(["Costelas quebradas"]);
  });

  it("o include do Prisma pede a relação certa", () => {
    expect(partyInclude("cyberpunk").cyberpunkSheet).toBe(true);
  });
});
