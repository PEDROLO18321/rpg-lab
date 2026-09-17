// Guardas de importação de ficha: o arquivo JSON vem do usuário, então nada
// que entre por ali pode gravar valor fora das regras nem inflar o banco.
import { describe, it, expect } from "vitest";
import {
  ImportError, LIMITS, intIn, strOrNull, strIn, boolOr, numOr,
  parseJsonField, toJsonFieldOrNull, jsonIn, safeFileName, makeEnvelope,
} from "@/lib/characterTransfer";

describe("importação — inteiros presos ao intervalo válido", () => {
  it("aceita valor dentro da faixa", () => {
    expect(intIn(5, 1, 20, 1)).toBe(5);
    expect(intIn(1, 1, 20, 1)).toBe(1);
    expect(intIn(20, 1, 20, 1)).toBe(20);
  });

  it("recusa valor fora da faixa em vez de gravar lixo", () => {
    expect(() => intIn(99999, 1, 20, 1)).toThrow(ImportError);
    expect(() => intIn(-5, 1, 20, 1)).toThrow(ImportError);
  });

  it("usa o padrão para ausente ou não-numérico", () => {
    expect(intIn(undefined, 1, 20, 7)).toBe(7);
    expect(intIn(null, 1, 20, 7)).toBe(7);
    expect(intIn("12", 1, 20, 7)).toBe(7);
    expect(intIn(NaN, 1, 20, 7)).toBe(7);
    expect(intIn(Infinity, 1, 20, 7)).toBe(7);
  });

  it("trunca fracionários dentro da faixa", () => {
    expect(intIn(5.9, 1, 20, 1)).toBe(5);
  });
});

describe("importação — textos com teto de tamanho", () => {
  it("passa texto normal", () => {
    expect(strOrNull("Aragorn", LIMITS.name)).toBe("Aragorn");
  });

  it("recusa texto acima do teto", () => {
    expect(() => strOrNull("x".repeat(LIMITS.name + 1), LIMITS.name)).toThrow(ImportError);
  });

  it("devolve null para não-string", () => {
    expect(strOrNull(42)).toBeNull();
    expect(strOrNull(undefined)).toBeNull();
    expect(strOrNull({})).toBeNull();
  });
});

describe("importação — campos JSON", () => {
  it("recusa payload acima do teto", () => {
    const grande = Array.from({ length: 50_000 }, (_, i) => `item-${i}`);
    expect(() => toJsonFieldOrNull(grande)).toThrow(ImportError);
  });

  it("aceita estrutura pequena e devolve o próprio valor", () => {
    expect(toJsonFieldOrNull({ a: 1 })).toEqual({ a: 1 });
    expect(toJsonFieldOrNull(["x"])).toEqual(["x"]);
  });

  it("ausência vira undefined — o Prisma deixa a coluna nula", () => {
    expect(toJsonFieldOrNull(null)).toBeUndefined();
    expect(toJsonFieldOrNull(undefined)).toBeUndefined();
  });
});

describe("leitura de coluna Json", () => {
  it("devolve o objeto já desserializado pelo Prisma", () => {
    expect(parseJsonField({ a: 1 }, {})).toEqual({ a: 1 });
    expect(parseJsonField([1, 2], [])).toEqual([1, 2]);
  });

  it("ainda lê linhas antigas gravadas como texto", () => {
    expect(parseJsonField('{"a":1}', {})).toEqual({ a: 1 });
    expect(parseJsonField("[1,2]", [])).toEqual([1, 2]);
  });

  it("cai no padrão em vez de estourar com texto corrompido", () => {
    expect(parseJsonField("{quebrado", { ok: true })).toEqual({ ok: true });
    expect(parseJsonField(null, [])).toEqual([]);
    expect(parseJsonField(undefined, "x")).toBe("x");
  });

  it("jsonIn repassa valor lido e converte nulo em undefined", () => {
    expect(jsonIn({ a: 1 })).toEqual({ a: 1 });
    expect(jsonIn(null)).toBeUndefined();
  });
});

describe("importação — demais coerções", () => {
  it("strIn só aceita valores da lista", () => {
    expect(strIn("1920s", ["1920s", "modern"] as const, "1920s")).toBe("1920s");
    expect(strIn("jurassico", ["1920s", "modern"] as const, "1920s")).toBe("1920s");
  });

  it("boolOr e numOr respeitam o tipo", () => {
    expect(boolOr(true, false)).toBe(true);
    expect(boolOr("true", false)).toBe(false);
    expect(numOr(3.5, 0)).toBe(3.5);
    expect(numOr("3.5", 0)).toBe(0);
  });
});

describe("exportação", () => {
  it("gera nome de arquivo seguro preservando acentos", () => {
    expect(safeFileName("Thorin Escudo-de-Carvalho")).toBe("Thorin_Escudo-de-Carvalho");
    expect(safeFileName("../../etc/passwd")).not.toContain("/");
    expect(safeFileName("   ")).toBe("personagem");
    expect(safeFileName("Aragorn").length).toBeLessThanOrEqual(60);
  });

  it("o envelope carrega formato e data", () => {
    const env = makeEnvelope("rpglab.dnd.v1", { name: "X", portraitUrl: null, notes: null }, { level: 1 });
    expect(env.format).toBe("rpglab.dnd.v1");
    expect(env.character.name).toBe("X");
    expect(Number.isNaN(Date.parse(env.exportedAt))).toBe(false);
  });
});
