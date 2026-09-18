// A aba "Fichas de Jogadores" mostra fichas dos cinco sistemas com uma UI só.
// Isso depende do normalizador traduzir cada ficha para a mesma forma sem
// perder o que o mestre precisa na mesa: vitais, atributos e condições.
import { describe, it, expect } from "vitest";
import { toPartySheet, partyInclude } from "@/lib/party/summary";

const LINKED = new Date("2026-09-17T12:00:00.000Z");

/** Character mínimo — o normalizador só lê nome, retrato, dono e a ficha. */
const character = (relation: string, sheet: unknown) => ({
  id: "char-1",
  name: "Thorin",
  portraitUrl: null,
  user: { name: "Pedro", email: "pedro@example.com" },
  [relation]: sheet,
});

const dndSheet = {
  race: "anao", background: "Soldado", alignment: "Leal e Bom", level: 3, xp: 900,
  str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 13,
  hpMax: 28, hpCurrent: 22, hpTemp: 4, hitDice: "3d10", hitDiceUsed: 1,
  armorClass: 18, initiative: 1, speed: 25, inspiration: true,
  conditions: ["Envenenado"],
  classes: [{ className: "guerreiro", level: 3 }],
  skills: [
    { skillName: "Atletismo", proficient: true, expertise: false },
    { skillName: "Furtividade", proficient: false, expertise: true },
    { skillName: "Arcanismo", proficient: false, expertise: false },
  ],
};

describe("D&D 5e — ficha na visão do mestre", () => {
  const sheet = toPartySheet("dnd", character("dndSheet", dndSheet), LINKED)!;

  it("identifica raça, classe e nível em texto legível", () => {
    expect(sheet.subtitle).toContain("Anão");
    expect(sheet.subtitle).toContain("Guerreiro 3");
    expect(sheet.subtitle).toContain("Nível 3");
  });

  it("traz PV com temporários preservados", () => {
    expect(sheet.vitals).toHaveLength(1);
    expect(sheet.vitals[0]).toEqual({ label: "PV", current: 22, max: 28, temp: 4 });
  });

  it("calcula o modificador de cada atributo", () => {
    const forca = sheet.attrs.find((a) => a.value === 16)!;
    expect(forca.detail).toBe("+3");
    const inteligencia = sheet.attrs.find((a) => a.value === 8)!;
    expect(inteligencia.detail).toBe("-1");
  });

  it("lista só perícias proficientes ou com especialização", () => {
    expect(sheet.skills.map((s) => s.name).sort()).toEqual(["Atletismo", "Furtividade"]);
    expect(sheet.skills.find((s) => s.name === "Furtividade")!.detail).toBe("Especialista");
  });

  it("repassa as condições ativas", () => {
    expect(sheet.conditions).toEqual(["Envenenado"]);
  });
});

describe("Tormenta 20 — ficha na visão do mestre", () => {
  const sheet = toPartySheet("tormenta", character("tormentaSheet", {
    race: "humano", className: "guerreiro", origin: "batedor", level: 2, xp: 100,
    forca: 16, des: 14, con: 13, int: 10, sab: 12, car: 8,
    pvMax: 24, pvCurrent: 24, pvTemp: 0, pmMax: 6, pmCurrent: 4, pmTemp: 0,
    defense: 17, movement: 9, money: 50,
    skills: { atletismo: true, furtividade: false },
    conditions: [], background: { objective: "Vingança" }, notes: null,
  }), LINKED)!;

  it("traz PV e PM como vitais separados", () => {
    expect(sheet.vitals.map((v) => v.label)).toEqual(["PV", "PM"]);
    expect(sheet.vitals[1].current).toBe(4);
  });

  it("mapeia a coluna forca para o atributo Força", () => {
    const forca = sheet.attrs.find((a) => a.label === "Força")!;
    expect(forca.value).toBe(16);
    expect(forca.detail).toBe("+3");
  });

  it("lista só as perícias marcadas como treinadas", () => {
    expect(sheet.skills.map((s) => s.name)).toEqual(["Atletismo"]);
  });

  it("leva o objetivo do personagem para as anotações", () => {
    expect(sheet.notes).toContain("Vingança");
  });
});

describe("Call of Cthulhu 7e — ficha na visão do mestre", () => {
  const sheet = toPartySheet("cthulhu", character("cthulhuSheet", {
    occupation: "antiquario", era: "1920s", age: 42,
    atribFor: 55, atribCon: 60, atribTam: 65, atribDes: 50,
    atribApa: 45, atribInt: 70, atribPod: 55, atribEdu: 80,
    pvMax: 12, pvCurrent: 9, pvTemp: 0,
    sanMax: 99, sanCurrent: 48, sanTemp: 0,
    luck: 55, mov: 8, pmCurrent: 11,
    skills: { avaliacao: 60, antropologia: 1 },
    insanityData: { status: "Loucura temporária", phobias: ["Nictofobia"], manias: [] },
    notes: "Chegou tarde à sessão.",
  }), LINKED)!;

  it("traz PV e Sanidade", () => {
    expect(sheet.vitals.map((v) => v.label)).toEqual(["PV", "Sanidade"]);
    expect(sheet.vitals[1].current).toBe(48);
  });

  it("mostra metade e um quinto do atributo, que é como se rola", () => {
    const edu = sheet.attrs.find((a) => a.value === 80)!;
    expect(edu.detail).toBe("40/16");
  });

  it("lista só perícias acima do valor base", () => {
    // Avaliação tem base 5 e está em 60; Antropologia está no próprio base.
    expect(sheet.skills.map((s) => s.name)).toEqual(["Avaliação"]);
    expect(sheet.skills[0].detail).toBe("60%");
  });

  it("traz fobias e manias como condições, e o estado mental", () => {
    expect(sheet.conditions).toEqual(["Nictofobia"]);
    expect(sheet.stats.find((s) => s.label === "Estado mental")!.value).toBe("Loucura temporária");
  });
});

describe("Ordem Paranormal — ficha na visão do mestre", () => {
  const sheet = toPartySheet("ordem", character("ordemSheet", {
    origin: "academico", className: "ocultista", trail: null, nex: 25, patente: "operador",
    agi: 2, forca: 1, int: 3, pre: 2, vig: 1,
    pvMax: 18, pvCurrent: 12, pvTemp: 0,
    peMax: 8, peCurrent: 5, peTemp: 0,
    sanMax: 20, sanCurrent: 14, sanTemp: 0,
    defense: 12, movement: 9, prestige: 3, affinity: null,
    skills: { ocultismo: "veterano", atletismo: "" },
    conditions: ["Sangrando"],
    insanity: { traumas: ["Pesadelos"] },
    background: { objective: null }, notes: null,
  }), LINKED)!;

  it("traz os três vitais do sistema", () => {
    expect(sheet.vitals.map((v) => v.label)).toEqual(["PV", "PE", "Sanidade"]);
  });

  it("mostra os cinco atributos, com forca mapeada para Força", () => {
    expect(sheet.attrs).toHaveLength(5);
    expect(sheet.attrs.find((a) => a.label === "Força")!.value).toBe(1);
  });

  it("traduz o grau de treino da perícia", () => {
    expect(sheet.skills).toHaveLength(1);
    expect(sheet.skills[0].name).toBe("Ocultismo");
    expect(sheet.skills[0].detail).toBe("Veterano");
  });

  it("soma condições e traumas", () => {
    expect(sheet.conditions).toEqual(["Sangrando", "Pesadelos"]);
  });
});

describe("Star Wars (autoral) — ficha na visão do mestre", () => {
  const sheet = toPartySheet("starwars", character("starWarsSheet", {
    species: "cathar", planet: "tatooine", path: "luz", level: 3, xp: 200,
    classes: { soldado: 3 },
    agi: 3, int: 1, forca: 2, vig: 2, pre: 1, sen: 1,
    pvMax: 30, pvCurrent: 30, pvTemp: 0,
    peMax: 4, peCurrent: 4, peTemp: 0,
    ppMax: 2, ppCurrent: 1, ppTemp: 0,
    sabreForm: null,
    skills: { atletismo: "treinado", pilotagem: "inexperiente" },
    conditions: [],
    background: { organization: "Rebelião", objective: "Libertar Tatooine" },
    notes: null,
  }), LINKED)!;

  it("traz os três vitais e a espécie na identidade", () => {
    expect(sheet.vitals.map((v) => v.label)).toEqual(["PV", "PE", "PP"]);
    expect(sheet.subtitle).toContain("Cathar");
    expect(sheet.subtitle).toContain("Nível 3");
  });

  it("ignora perícias no grau inexperiente", () => {
    expect(sheet.skills.map((s) => s.name)).toEqual(["Atletismo"]);
    expect(sheet.skills[0].detail).toBe("Treinado");
  });

  it("mostra a organização do personagem", () => {
    expect(sheet.stats.find((s) => s.label === "Organização")!.value).toBe("Rebelião");
  });
});

describe("normalizador — casos de borda", () => {
  it("personagem sem a ficha do sistema devolve null em vez de quebrar a aba", () => {
    expect(toPartySheet("dnd", character("dndSheet", null), LINKED)).toBeNull();
  });

  it("ainda lê condições gravadas como texto em linhas antigas", () => {
    const sheet = toPartySheet("dnd", character("dndSheet", {
      ...dndSheet, conditions: '["Caído"]',
    }), LINKED)!;
    expect(sheet.conditions).toEqual(["Caído"]);
  });

  it("condição corrompida não derruba a ficha", () => {
    const sheet = toPartySheet("dnd", character("dndSheet", {
      ...dndSheet, conditions: "{quebrado",
    }), LINKED)!;
    expect(sheet.conditions).toEqual([]);
  });

  it("usa o e-mail quando o jogador não tem nome", () => {
    const sheet = toPartySheet("dnd", {
      ...character("dndSheet", dndSheet),
      user: { name: null, email: "jogador@example.com" },
    }, LINKED)!;
    expect(sheet.ownerName).toBe("jogador@example.com");
  });

  it("registra quando a ficha foi vinculada", () => {
    const sheet = toPartySheet("dnd", character("dndSheet", dndSheet), LINKED)!;
    expect(sheet.linkedAt).toBe(LINKED.toISOString());
  });
});

describe("include do Prisma por sistema", () => {
  it("sempre traz o dono da ficha", () => {
    for (const s of ["dnd", "tormenta", "cthulhu", "ordem", "starwars"] as const) {
      expect(partyInclude(s).user).toBeDefined();
    }
  });

  it("só D&D precisa de sub-relações, porque guarda classes e perícias em tabela", () => {
    expect(partyInclude("dnd").dndSheet.include).toHaveProperty("classes");
    expect(partyInclude("dnd").dndSheet.include).toHaveProperty("skills");
    expect(partyInclude("tormenta").tormentaSheet).toBe(true);
  });
});
