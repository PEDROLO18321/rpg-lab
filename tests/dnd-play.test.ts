// ─── Regras de mesa do D&D 5e (modo Jogar) ────────────────────────────────────
// Fonte: Livro do Jogador — Equipamento (Classe de Armadura, Cap. 5), Magia
// (Espaços de Magia e Magia de Pacto, Cap. 10) e multiclasse (Cap. Regras de
// Multiclasse, p.165).
import { describe, it, expect } from "vitest";
import { computeArmorAC } from "@/lib/dnd/items";
import { getMaxSlots, getMulticlassSlots, cantripsKnownAt, spellsKnownAt } from "@/lib/dnd/leveling";
import { DND_CONDITIONS, DND_CONDITION_BY_ID, EXHAUSTION_LEVELS } from "@/lib/dnd/conditions";

describe("Classe de Armadura — equipamento em jogo", () => {
  it("sem armadura, usa a CA desarmada + Destreza já embutida em unarmoredBase", () => {
    expect(computeArmorAC([], 3, 10)).toBe(10);
  });

  it("armadura leve soma Destreza sem limite", () => {
    expect(computeArmorAC(["Couro Batido"], 5, 10)).toBe(17); // 12 + 5
  });

  it("armadura média trava a Destreza no teto de +2", () => {
    expect(computeArmorAC(["Brunea"], 1, 10)).toBe(15); // abaixo do teto: soma tudo (14+1)
    expect(computeArmorAC(["Brunea"], 5, 10)).toBe(16); // acima do teto: trava em +2 (14+2)
  });

  it("armadura pesada não soma Destreza, nem abaixo nem acima do teto", () => {
    expect(computeArmorAC(["Cota de Malha"], 0, 10)).toBe(16);
    expect(computeArmorAC(["Cota de Malha"], 5, 10)).toBe(16);
  });

  it("escudo soma +2 fixo por cima de qualquer configuração", () => {
    expect(computeArmorAC(["Couro", "Escudo"], 2, 10)).toBe(15); // 11 + 2 + 2
    expect(computeArmorAC(["Escudo"], 0, 10)).toBe(12); // sem armadura + escudo
  });

  it("o nome do item é lido sem diferenciar maiúsculas/minúsculas", () => {
    expect(computeArmorAC(["escudo"], 0, 10)).toBe(12);
  });

  it("item desconhecido é ignorado, cai para a CA desarmada (que já embute a Destreza)", () => {
    expect(computeArmorAC(["Roupas Comuns"], 3, 10)).toBe(10);
  });
});

describe("espaços de magia — fronteiras entre conjurador pleno, meio e Magia de Pacto", () => {
  it("conjurador pleno tem espaços já no 1º nível", () => {
    expect(getMaxSlots("mago", 1)).toEqual({ "1": 2 });
  });

  it("meio-conjurador não tem NENHUM espaço no 1º nível (começa no 2º)", () => {
    expect(getMaxSlots("paladino", 1)).toEqual({});
    expect(getMaxSlots("paladino", 2)).toEqual({ "1": 2 });
  });

  it("classe sem conjuração não tem espaços em nível nenhum", () => {
    expect(getMaxSlots("barbaro", 20)).toEqual({});
  });

  it("Magia de Pacto (bruxo) usa um único nível de espaço, não a tabela normal", () => {
    expect(getMaxSlots("bruxo", 1)).toEqual({ "1": 1 });
    expect(getMaxSlots("bruxo", 5)).toEqual({ "3": 2 }); // 2 espaços, todos de 3º círculo
  });

  it("nível fora da faixa 1-20 é grampeado, não quebra", () => {
    expect(getMaxSlots("mago", 0)).toEqual(getMaxSlots("mago", 1));
    expect(getMaxSlots("mago", 99)).toEqual(getMaxSlots("mago", 20));
  });
});

describe("espaços de magia multiclasse (PHB p.165)", () => {
  it("classe única delega direto para getMaxSlots", () => {
    expect(getMulticlassSlots([{ classId: "mago", level: 3 }])).toEqual(getMaxSlots("mago", 3));
  });

  it("dois conjuradores plenos somam o nível cheio de cada um", () => {
    // mago 2 + bardo 1 = nível efetivo 3 → tabela de conjurador pleno nível 3
    const r = getMulticlassSlots([{ classId: "mago", level: 2 }, { classId: "bardo", level: 1 }]);
    expect(r).toEqual(getMaxSlots("mago", 3));
  });

  it("meio-conjurador soma metade do nível, arredondada para baixo", () => {
    // mago 3 (pleno) + paladino 3 (meio → 1) = nível efetivo 4
    const r = getMulticlassSlots([{ classId: "mago", level: 3 }, { classId: "paladino", level: 3 }]);
    expect(r).toEqual(getMaxSlots("mago", 4));
  });

  it("nenhuma classe conjuradora resulta em nenhum espaço", () => {
    expect(getMulticlassSlots([{ classId: "guerreiro", level: 5 }, { classId: "monge", level: 5 }])).toEqual({});
  });

  it("um único nível de meio-conjurador não gera espaço (floor(1/2) = 0)", () => {
    expect(getMulticlassSlots([{ classId: "guerreiro", level: 5 }, { classId: "paladino", level: 1 }])).toEqual({});
  });
});

describe("truques e magias conhecidas — degraus fixos (4º e 10º nível)", () => {
  it("truques do mago sobem exatamente no 4º e no 10º nível, não antes", () => {
    expect(cantripsKnownAt("mago", 3)).toBe(3);
    expect(cantripsKnownAt("mago", 4)).toBe(4);
    expect(cantripsKnownAt("mago", 9)).toBe(4);
    expect(cantripsKnownAt("mago", 10)).toBe(5);
  });

  it("classe sem progressão de truques devolve zero", () => {
    expect(cantripsKnownAt("guerreiro", 20)).toBe(0);
  });

  it("magias conhecidas do bardo seguem a tabela ponto a ponto no início e no topo", () => {
    expect(spellsKnownAt("bardo", 1)).toBe(4);
    expect(spellsKnownAt("bardo", 20)).toBe(22);
  });

  it("classe 'preparada' (clérigo) não tem tabela de magias conhecidas", () => {
    expect(spellsKnownAt("clerigo", 10)).toBe(0);
  });
});

describe("condições (PHB Apêndice A) e exaustão", () => {
  it("toda condição tem descrição e id único", () => {
    expect(new Set(DND_CONDITIONS.map((c) => c.id)).size).toBe(DND_CONDITIONS.length);
    for (const c of DND_CONDITIONS) expect(c.desc.length).toBeGreaterThan(5);
  });

  it("indexa por id corretamente", () => {
    expect(DND_CONDITION_BY_ID["paralisado"].name).toBe("Paralisado");
    expect(DND_CONDITION_BY_ID["invisivel"].desc).toContain("Vantagem");
  });

  it("exaustão tem exatamente 6 níveis, o 6º é morte", () => {
    expect(EXHAUSTION_LEVELS).toHaveLength(6);
    expect(EXHAUSTION_LEVELS[5]).toContain("Morte");
  });
});
