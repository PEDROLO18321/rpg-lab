// A geração automática ("Crie Para Mim") é a promessa central do trabalho: o
// usuário recebe um personagem jogável sem conhecer o sistema. Estes testes
// rodam a geração muitas vezes e conferem que o resultado é sempre válido pelas
// regras — nenhuma escolha sorteada pode produzir uma ficha impossível.
import { describe, it, expect } from "vitest";

import { generateLevel1Build as dndBuild } from "@/lib/dnd/autoGenerate";
import { CLASSES } from "@/lib/dnd/classes";
import { RACES } from "@/lib/dnd/races";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";

import { generateLevel1Build as t20Build } from "@/lib/tormenta/autoGenerate";
import { CLASS_BY_ID as T20_CLASS } from "@/lib/tormenta/classes";
import { RACE_BY_ID as T20_RACE } from "@/lib/tormenta/races";
import { ORIGIN_BY_ID as T20_ORIGIN } from "@/lib/tormenta/origins";

import { generateInvestigator } from "@/lib/cthulhu/autoGenerate";
import { generateLevel1Build as ordemBuild } from "@/lib/ordem/autoGenerate";
import { ORIGINS as ORDEM_ORIGINS } from "@/lib/ordem/origins";
import { generateLevel1Build as swBuild } from "@/lib/starwars/autoGenerate";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { CLASS_BY_ID as SW_CLASS } from "@/lib/starwars/classes";
import { PLANET_BY_ID } from "@/lib/starwars/planets";

/** Quantas gerações por asserção — cobre o sorteio, não um caso isolado. */
const RUNS = 60;
const times = (n: number) => Array.from({ length: n }, (_, i) => i);
const ORDEM_ORIGIN_IDS = ORDEM_ORIGINS.map((o) => o.id);

describe("D&D 5e — geração automática", () => {
  it("sempre escolhe raça, classe e antecedente existentes", () => {
    for (const _ of times(RUNS)) {
      const b = dndBuild({ level: 1 });
      expect(RACES.some((r) => r.id === b.raceId)).toBe(true);
      expect(CLASSES.some((c) => c.id === b.classId)).toBe(true);
      expect(BACKGROUNDS.some((x) => x.id === b.backgroundId)).toBe(true);
    }
  });

  it("distribui os seis atributos dentro do array padrão", () => {
    const STANDARD = [15, 14, 13, 12, 10, 8];
    for (const _ of times(RUNS)) {
      const b = dndBuild({ level: 1 });
      const values = Object.values(b.abilityBases).sort((x, y) => y - x);
      expect(values).toEqual(STANDARD);
    }
  });

  it("escolhe exatamente a quantidade de perícias que a classe concede", () => {
    for (const _ of times(RUNS)) {
      const b = dndBuild({ level: 1 });
      const cls = CLASSES.find((c) => c.id === b.classId)!;
      expect(b.selectedSkills).toHaveLength(cls.skillCount);
      expect(new Set(b.selectedSkills).size).toBe(b.selectedSkills.length);
      for (const s of b.selectedSkills) expect(cls.skillChoices).toContain(s);
    }
  });

  it("respeita a classe pedida pelo usuário", () => {
    for (const cls of CLASSES) {
      expect(dndBuild({ level: 1, classId: cls.id }).classId).toBe(cls.id);
    }
  });

  it("só gera subraça pertencente à raça sorteada", () => {
    for (const _ of times(RUNS)) {
      const b = dndBuild({ level: 1 });
      if (!b.subraceId) continue;
      const race = RACES.find((r) => r.id === b.raceId)!;
      expect(race.subraces.some((s) => s.id === b.subraceId)).toBe(true);
    }
  });

  it("dá nome ao personagem", () => {
    for (const _ of times(RUNS)) {
      expect(dndBuild({ level: 1 }).charName.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("Tormenta 20 — geração automática", () => {
  it("sempre produz raça, classe e origem válidas", () => {
    for (const _ of times(RUNS)) {
      const b = t20Build();
      expect(T20_RACE[b.raceId]).toBeDefined();
      expect(T20_CLASS[b.classId]).toBeDefined();
      expect(T20_ORIGIN[b.originId]).toBeDefined();
    }
  });

  it("não repete perícias entre origem, classe e bônus de Intelecto", () => {
    for (const _ of times(RUNS)) {
      const b = t20Build();
      const all = [
        ...(b.originSkillChoices ?? []),
        ...(b.classSkillChoices ?? []),
        ...(b.intBonusSkillChoices ?? []),
      ];
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it("escolhe o caminho do Arcanista quando essa é a classe", () => {
    for (const _ of times(RUNS)) {
      const b = t20Build({ classId: "arcanista" });
      expect(["mago", "bruxo", "feiticeiro"]).toContain(b.pathId);
    }
  });
});

describe("Call of Cthulhu 7e — geração automática", () => {
  it("gera investigador com ocupação e atributos plausíveis", () => {
    for (const _ of times(RUNS)) {
      const inv = generateInvestigator();
      expect(inv.name.trim().length).toBeGreaterThan(0);
      expect(inv.age).toBeGreaterThanOrEqual(20);
      expect(inv.age).toBeLessThanOrEqual(50);
      expect(inv.pvMax).toBeGreaterThan(0);
      expect(inv.sanMax).toBeGreaterThan(0);
      expect(inv.sanCurrent).toBeLessThanOrEqual(inv.sanMax);
    }
  });

  it("nunca deixa perícia fora da faixa percentual", () => {
    for (const _ of times(RUNS)) {
      const inv = generateInvestigator();
      for (const v of Object.values(inv.skills as Record<string, number>)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(99);
      }
    }
  });
});

describe("Ordem Paranormal — geração automática", () => {
  it("gera agente com classe, origem e NEX inicial válidos", () => {
    for (const _ of times(RUNS)) {
      const b = ordemBuild();
      expect(["combatente", "especialista", "ocultista"]).toContain(b.className);
      expect(ORDEM_ORIGIN_IDS).toContain(b.origin);
      expect(b.nex).toBe(5);
      expect(b.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("só dá rituais iniciais ao Ocultista", () => {
    for (const _ of times(RUNS)) {
      const b = ordemBuild();
      if (b.className !== "ocultista") expect(b.rituals).toBeNull();
    }
  });

  it("os cinco atributos ficam na faixa da criação", () => {
    for (const _ of times(RUNS)) {
      const attrs = ordemBuild().attrs as unknown as Record<string, number>;
      expect(Object.keys(attrs).sort()).toEqual(["agi", "for", "int", "pre", "vig"]);
      for (const v of Object.values(attrs)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe("Star Wars (autoral) — geração automática", () => {
  it("sempre produz espécie, planeta e classe existentes", () => {
    for (const _ of times(RUNS)) {
      const b = swBuild();
      const p = b.payload as Record<string, string>;
      expect(SPECIES_BY_ID[p.speciesId]).toBeDefined();
      expect(PLANET_BY_ID[p.planetId]).toBeDefined();
      expect(SW_CLASS[p.classId]).toBeDefined();
      expect(["luz", "neutro", "sombrio"]).toContain(p.pathId);
    }
  });

  it("escolhe perícia natal válida quando o planeta oferece opções", () => {
    for (const _ of times(RUNS)) {
      const p = swBuild().payload as Record<string, string>;
      const planet = PLANET_BY_ID[p.planetId];
      if (planet.naturalAbility.skills.length > 1) {
        expect(planet.naturalAbility.skills).toContain(p.planetSkillChoice);
      }
    }
  });
});
