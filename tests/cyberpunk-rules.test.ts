import { describe, it, expect } from "vitest";
import {
  hpMax, seriousThreshold, deathSave, deathSaveSucceeds, nextDeathSavePenalty, humanityMax, currentEmp,
  isCyberpsycho, skillBase, woundState, effectiveMove, moveDistance, effectiveSp, applyDamage, isCritical,
  brawlingDamage, rollCheck, beatsDv, rollInitiative, ipCost, roleRankCost, ipCostRange, rangedDv, autofireDv,
  autofireDamage, parseDice, rollDice, rollD, RANGED_DV, AUTOFIRE_DV, type Rng, type RangedType,
} from "@/lib/cyberpunk/rules";
import {
  ROLES, ROLE_KEYS, SKILLS, SKILLS_MAP, STATS, STAT_KEYS, STREETRAT_STATS, ROLE_SKILL_PACKAGES, ROLE_SKILL_CHOICES,
  ROLE_KITS, BASIC_SKILL_KEYS, getSkillDef, skillPointCost, statsFromRow, skillBaseKey, SKILL_CATEGORIES,
  STARTING_ROLE_RANK, type Stats, type RoleKey,
} from "@/lib/cyberpunk/data";
import { WEAPONS, WEAPONS_MAP, rollWeaponDamage } from "@/lib/cyberpunk/weapons";
import { ARMORS, ARMORS_MAP, highestSp, worstPenalty } from "@/lib/cyberpunk/armor";
import { CYBERWARE, CYBERWARE_MAP, chargenHumanityLoss, rollHumanityLoss, slotsFree } from "@/lib/cyberpunk/cyberware";
import { ALL_GEAR, GEAR_MAP, DRUGS, HOUSING, LIFESTYLES, PRICE_CATEGORIES } from "@/lib/cyberpunk/gear";
import {
  BODY_CRITICALS, HEAD_CRITICALS, rollCriticalInjury, baseDeathSavePenalty, getCriticalByKey,
} from "@/lib/cyberpunk/criticalInjuries";
import {
  CULTURAL_ORIGINS, PERSONALITIES, CLOTHING_STYLES, HAIRSTYLES, AFFECTATIONS, VALUES, FEELINGS_ABOUT_PEOPLE,
  VALUED_PERSON, VALUED_POSSESSION, FAMILY_BACKGROUNDS, CHILDHOOD_ENVIRONMENTS, FAMILY_CRISES, FRIEND_KINDS,
  ENEMY_WHO, ENEMY_CAUSE, ENEMY_THREAT, REVENGE_RESPONSES, TRAGIC_LOVES, LIFE_GOALS, rollLifepath, rollRelationshipCount,
} from "@/lib/cyberpunk/lifepath";
import { PROGRAMS, BLACK_ICE, INTERFACE_ABILITIES, netActionsForRank } from "@/lib/cyberpunk/netrunning";
import { BESTIARY } from "@/lib/cyberpunk/bestiary";
import { randomCyberpunkName, randomHandle } from "@/lib/cyberpunk/names";
import { generateEdgerunner } from "@/lib/cyberpunk/autoGenerate";
import { validateCompletePackage } from "@/lib/cyberpunk/creation";

/** rng que devolve, em ordem, os resultados de dado pedidos (todos com o mesmo número de lados). */
const rigged = (sides: number, ...values: number[]): Rng => {
  let i = 0;
  return () => (values[i++ % values.length] - 0.5) / sides;
};

/** PRNG determinístico (mulberry32) para os geradores. */
const seeded = (seed: number): Rng => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

describe("Cyberpunk RED — dados e rolagens", () => {
  it("rollD mapeia o rng em 1..lados", () => {
    expect(rollD(10, () => 0)).toBe(1);
    expect(rollD(10, () => 0.999)).toBe(10);
    expect(rollD(6, () => 0.5)).toBe(4);
  });

  it("parseDice e rollDice", () => {
    expect(parseDice("3d6")).toEqual({ count: 3, sides: 6 });
    expect(() => parseDice("xyz")).toThrow();
    expect(rollDice("2d6", rigged(6, 3, 5))).toEqual({ dice: [3, 5], total: 8 });
  });
});

describe("Cyberpunk RED — HP, ferimentos e salvaguarda", () => {
  it("HP = 10 + 5 × ceil((CORPO + VONTADE) / 2): linhas da tabela do livro", () => {
    expect(hpMax(6, 8)).toBe(45); // (6+8)/2 = 7 → 10 + 35
    expect(hpMax(2, 2)).toBe(20);
    expect(hpMax(15, 10)).toBe(75);
    expect(hpMax(5, 4)).toBe(35); // 9/2 = 4,5 → arredonda para cima: 5
    expect(hpMax(8, 8)).toBe(50);
    expect(hpMax(3, 3)).toBe(25);
  });

  it("limiar de Gravemente Ferido é metade do HP arredondada para cima", () => {
    expect(seriousThreshold(45)).toBe(23);
    expect(seriousThreshold(20)).toBe(10);
    expect(seriousThreshold(35)).toBe(18);
  });

  it("Salvaguarda contra a Morte = CORPO", () => {
    expect(deathSave(7)).toBe(7);
  });

  it("salvaguarda passa só ESTRITAMENTE abaixo do CORPO", () => {
    expect(deathSaveSucceeds(6, 0, 5)).toBe(true);
    expect(deathSaveSucceeds(6, 0, 6)).toBe(false); // igual ao CORPO falha
    expect(deathSaveSucceeds(6, 0, 1)).toBe(true);
  });

  it("10 natural sempre falha, mesmo com CORPO alto", () => {
    expect(deathSaveSucceeds(10, 0, 10)).toBe(false);
    expect(deathSaveSucceeds(15, 0, 10)).toBe(false);
    expect(deathSaveSucceeds(10, 0, 9)).toBe(true);
  });

  it("penalidade acumulada de +1 por salvaguarda entra na comparação", () => {
    expect(deathSaveSucceeds(6, 1, 4)).toBe(true); // 5 < 6
    expect(deathSaveSucceeds(6, 2, 4)).toBe(false); // 6 não é < 6
    expect(nextDeathSavePenalty(0)).toBe(1);
    expect(nextDeathSavePenalty(3)).toBe(4);
  });

  it("estados de ferimento e penalidades (HP máx. 45, limiar 23)", () => {
    expect(woundState(45, 45)).toMatchObject({ state: "ok", actionPenalty: 0, stabilizeDv: null });
    expect(woundState(44, 45)).toMatchObject({ state: "leve", actionPenalty: 0, stabilizeDv: 10 });
    expect(woundState(23, 45)).toMatchObject({ state: "leve" }); // no limiar ainda é leve
    expect(woundState(22, 45)).toMatchObject({ state: "grave", actionPenalty: -2, movePenalty: 0, stabilizeDv: 13 });
    expect(woundState(1, 45)).toMatchObject({ state: "grave" });
    expect(woundState(0, 45)).toMatchObject({ state: "mortal", actionPenalty: -4, movePenalty: -6, stabilizeDv: 15 });
    expect(woundState(-7, 45)).toMatchObject({ state: "mortal" });
  });

  it("MOVIMENTO nunca cai abaixo de 1 quando ferido, nem abaixo de 0 por armadura", () => {
    expect(effectiveMove(5, -6, true)).toBe(1);
    expect(effectiveMove(2, -4, false)).toBe(0);
    expect(effectiveMove(6, -2)).toBe(4);
  });

  it("distância de movimento: MOV × 2, correndo × 4", () => {
    expect(moveDistance(6)).toBe(12);
    expect(moveDistance(6, true)).toBe(24);
  });
});

describe("Cyberpunk RED — Humanidade", () => {
  it("Humanidade máxima = EMP × 10 menos perda permanente", () => {
    expect(humanityMax(5)).toBe(50);
    expect(humanityMax(8, 6)).toBe(74);
    expect(humanityMax(1, 20)).toBe(0);
  });

  it("EMP atual é a dezena da Humanidade (44 → 4, 39 → 3)", () => {
    expect(currentEmp(44)).toBe(4);
    expect(currentEmp(40)).toBe(4);
    expect(currentEmp(39)).toBe(3);
    expect(currentEmp(0)).toBe(0);
    expect(currentEmp(-5)).toBe(0);
  });

  it("ciberpsicose só com Humanidade abaixo de zero", () => {
    expect(isCyberpsycho(0)).toBe(false);
    expect(isCyberpsycho(-1)).toBe(true);
  });
});

describe("Cyberpunk RED — armadura e dano", () => {
  it("arma branca ignora metade da PA, arredondando para cima", () => {
    expect(effectiveSp(11, true)).toBe(6);
    expect(effectiveSp(7, true)).toBe(4);
    expect(effectiveSp(4, true)).toBe(2);
    expect(effectiveSp(0, true)).toBe(0);
    expect(effectiveSp(11, false)).toBe(11);
  });

  it("tiro: dano acima da PA passa e a armadura ablaciona 1", () => {
    expect(applyDamage({ sp: 11, damage: 15 })).toMatchObject({ damageTaken: 4, newSp: 10, throughArmor: 4 });
  });

  it("dano que não passa da PA não fere nem ablaciona", () => {
    expect(applyDamage({ sp: 11, damage: 11 })).toMatchObject({ damageTaken: 0, newSp: 11 });
    expect(applyDamage({ sp: 11, damage: 3 })).toMatchObject({ damageTaken: 0, newSp: 11 });
  });

  it("corpo a corpo usa a metade da PA, mas ablaciona a PA real", () => {
    expect(applyDamage({ sp: 11, damage: 15, melee: true })).toMatchObject({ damageTaken: 9, newSp: 10, effectiveSp: 6 });
  });

  it("PA nunca fica negativa na ablação", () => {
    expect(applyDamage({ sp: 0, damage: 5 })).toMatchObject({ damageTaken: 5, newSp: 0 });
  });

  it("tiro na cabeça: o que atravessa é ×2, ×3 com Crânio Rachado", () => {
    expect(applyDamage({ sp: 7, damage: 15, headshot: true }).damageTaken).toBe(16);
    expect(applyDamage({ sp: 7, damage: 15, headshot: true, crackedSkull: true }).damageTaken).toBe(24);
    expect(applyDamage({ sp: 7, damage: 7, headshot: true }).damageTaken).toBe(0);
  });

  it("crítico dá +5 direto ao HP, mesmo sem atravessar e sem multiplicar", () => {
    expect(applyDamage({ sp: 11, damage: 8, critical: true })).toMatchObject({ damageTaken: 5, newSp: 11, bonusDamage: 5 });
    expect(applyDamage({ sp: 7, damage: 15, critical: true })).toMatchObject({ damageTaken: 13, newSp: 6 });
    expect(applyDamage({ sp: 7, damage: 15, headshot: true, critical: true }).damageTaken).toBe(21); // 8×2 + 5
  });

  it("dano que ignora armadura (veneno/fogo) não ablaciona", () => {
    expect(applyDamage({ sp: 11, damage: 4, ignoreArmor: true })).toMatchObject({ damageTaken: 4, newSp: 11 });
  });

  it("crítico exige dois ou mais 6 entre os dados de dano", () => {
    expect(isCritical([6, 6])).toBe(true);
    expect(isCritical([6, 3, 6, 1])).toBe(true);
    expect(isCritical([6, 5])).toBe(false);
    expect(isCritical([6])).toBe(false);
    expect(isCritical([1, 2, 3])).toBe(false);
  });

  it("dano de briga por CORPO", () => {
    expect(brawlingDamage(4)).toBe("1d6");
    expect(brawlingDamage(5)).toBe("2d6");
    expect(brawlingDamage(6)).toBe("2d6");
    expect(brawlingDamage(7)).toBe("3d6");
    expect(brawlingDamage(10)).toBe("3d6");
    expect(brawlingDamage(11)).toBe("4d6");
  });

  it("PA não soma e a penalidade da pior peça vale uma vez", () => {
    expect(highestSp([{ sp: 7 }, { sp: 11 }, { sp: 4 }])).toBe(11);
    expect(highestSp([])).toBe(0);
    expect(worstPenalty([{ penalty: 0 }, { penalty: -2 }, { penalty: -4 }])).toBe(-4);
    expect(worstPenalty([{ penalty: 0 }])).toBe(0);
  });
});

describe("Cyberpunk RED — testes de perícia (d10 que explode e implode)", () => {
  it("base = atributo + nível", () => {
    expect(skillBase(7, 6)).toBe(13);
  });

  it("rolagem comum soma o d10", () => {
    expect(rollCheck(7, 6, 0, rigged(10, 5))).toEqual({ natural: 5, extra: null, kind: null, total: 18 });
  });

  it("10 natural soma outro d10 (uma vez só)", () => {
    expect(rollCheck(7, 6, 0, rigged(10, 10, 4))).toEqual({ natural: 10, extra: 4, kind: "explode", total: 27 });
    // Mesmo se o d10 extra for 10, não explode de novo.
    expect(rollCheck(7, 6, 0, rigged(10, 10, 10)).total).toBe(13 + 10 + 10);
  });

  it("1 natural subtrai outro d10 (uma vez só)", () => {
    expect(rollCheck(7, 6, 0, rigged(10, 1, 6))).toEqual({ natural: 1, extra: 6, kind: "implode", total: 13 + 1 - 6 });
    expect(rollCheck(7, 6, 0, rigged(10, 1, 1)).total).toBe(13);
  });

  it("modificador entra na base", () => {
    expect(rollCheck(5, 2, -2, rigged(10, 5)).total).toBe(10);
  });

  it("DV precisa ser superada; empate vai para a DV", () => {
    expect(beatsDv(15, 15)).toBe(false);
    expect(beatsDv(16, 15)).toBe(true);
  });

  it("iniciativa = REF + 1d10", () => {
    expect(rollInitiative(8, rigged(10, 7))).toBe(15);
  });
});

describe("Cyberpunk RED — Pontos de Melhoria", () => {
  it("custo do novo nível: 20 × nível, ×2 custa 40 × nível", () => {
    expect(ipCost(1)).toBe(20);
    expect(ipCost(5)).toBe(100);
    expect(ipCost(10)).toBe(200);
    expect(ipCost(3, true)).toBe(120);
    expect(ipCost(10, true)).toBe(400);
  });

  it("Grau do Papel: 60 × grau", () => {
    expect(roleRankCost(5)).toBe(300);
    expect(roleRankCost(10)).toBe(600);
  });

  it("custo acumulado de vários níveis", () => {
    expect(ipCostRange(4, 6)).toBe(100 + 120);
    expect(ipCostRange(0, 3, true)).toBe(40 + 80 + 120);
    expect(ipCostRange(6, 6)).toBe(0);
  });
});

describe("Cyberpunk RED — DV de tiro por distância", () => {
  it("exemplos do livro: fuzil de assalto a 24 m = DV15; fogo automático a 14 m = DV17", () => {
    expect(rangedDv("assaultRifle", 24)).toBe(15);
    expect(autofireDv("assaultRifle", 14)).toBe(17);
  });

  it("exemplo do livro: 21 contra DV17 supera por 4 → 10 × 4 = 40 de dano", () => {
    expect(21 - (autofireDv("assaultRifle", 14) as number)).toBe(4);
    expect(autofireDamage(10, 4, 4)).toBe(40);
  });

  it("multiplicador do fogo automático é limitado pela arma (SMG ×3)", () => {
    expect(autofireDamage(8, 5, 3)).toBe(24);
    expect(autofireDamage(8, 0, 3)).toBe(0);
  });

  it("fronteiras das faixas: 6/7, 12/13, 25/26, 50/51, 100/101", () => {
    expect(rangedDv("pistol", 6)).toBe(13);
    expect(rangedDv("pistol", 7)).toBe(15);
    expect(rangedDv("pistol", 12)).toBe(15);
    expect(rangedDv("pistol", 13)).toBe(20);
    expect(rangedDv("pistol", 25)).toBe(20);
    expect(rangedDv("pistol", 26)).toBe(25);
    expect(rangedDv("pistol", 100)).toBe(30);
    expect(rangedDv("pistol", 101)).toBe(30);
  });

  it("fora de alcance devolve null", () => {
    expect(rangedDv("pistol", 201)).toBeNull();
    expect(rangedDv("assaultRifle", 800)).toBe(30);
    expect(rangedDv("assaultRifle", 801)).toBeNull();
    expect(rangedDv("bow", 300)).toBeNull();
    expect(rangedDv("pistol", -1)).toBeNull();
    expect(autofireDv("assaultRifle", 101)).toBeNull();
  });

  it("outras linhas da tabela", () => {
    expect(rangedDv("sniperRifle", 3)).toBe(30);
    expect(rangedDv("sniperRifle", 60)).toBe(15);
    expect(rangedDv("smg", 10)).toBe(13);
    expect(rangedDv("shotgun", 150)).toBe(35);
    expect(rangedDv("rocketLauncher", 500)).toBe(30);
    expect(rangedDv("grenadeLauncher", 300)).toBe(25);
    expect(rangedDv("bow", 30)).toBe(17);
  });

  it("fogo automático por faixa", () => {
    expect(autofireDv("smg", 5)).toBe(20);
    expect(autofireDv("smg", 10)).toBe(17);
    expect(autofireDv("smg", 100)).toBe(30);
    expect(autofireDv("assaultRifle", 3)).toBe(22);
    expect(autofireDv("assaultRifle", 30)).toBe(20);
  });

  it("tabelas têm 8 faixas (tiro) e 5 (fogo automático)", () => {
    for (const row of Object.values(RANGED_DV)) expect(row).toHaveLength(8);
    for (const row of Object.values(AUTOFIRE_DV)) expect(row).toHaveLength(5);
  });
});

describe("Cyberpunk RED — integridade dos dados", () => {
  it("10 atributos e 10 papéis, chaves únicas", () => {
    expect(STATS).toHaveLength(10);
    expect(new Set(STATS.map((s) => s.key)).size).toBe(10);
    expect(STATS.map((s) => s.key)).toEqual([...STAT_KEYS]);
    expect(ROLES).toHaveLength(10);
    expect(new Set(ROLES.map((r) => r.key)).size).toBe(10);
    for (const r of ROLES) expect(r.abilityName.length).toBeGreaterThan(0);
  });

  it("66 perícias de chaves únicas, atributo e categoria válidos", () => {
    expect(SKILLS).toHaveLength(66);
    expect(new Set(SKILLS.map((s) => s.key)).size).toBe(66);
    for (const s of SKILLS) {
      expect(STAT_KEYS).toContain(s.stat);
      expect(Object.keys(SKILL_CATEGORIES)).toContain(s.category);
    }
  });

  it("13 perícias básicas e as ×2 do livro", () => {
    expect(BASIC_SKILL_KEYS).toHaveLength(13);
    const x2 = SKILLS.filter((s) => s.x2).map((s) => s.key).sort();
    expect(x2).toEqual(["autofire", "demolitions", "electronicsSecurity", "heavyWeapons", "martialArts", "paramedic", "pilotAir"]);
  });

  it("perícias especializadas aceitam chave base:especialidade", () => {
    expect(getSkillDef("language:streetslang")?.key).toBe("language");
    expect(skillBaseKey("martialArts:judo")).toBe("martialArts");
    expect(skillBaseKey("handgun")).toBe("handgun");
    expect(getSkillDef("nao-existe")).toBeUndefined();
    expect(skillPointCost("autofire", 6)).toBe(12);
    expect(skillPointCost("handgun", 6)).toBe(6);
  });

  it("toda perícia dos pacotes de papel existe em SKILLS", () => {
    for (const role of ROLE_KEYS) {
      for (const key of Object.keys(ROLE_SKILL_PACKAGES[role])) {
        expect(SKILLS_MAP[skillBaseKey(key)], `${role}: ${key}`).toBeDefined();
      }
      for (const c of ROLE_SKILL_CHOICES[role]) expect(SKILLS_MAP[c.skill], `${role}: ${c.skill}`).toBeDefined();
    }
  });

  it("cada pacote de perícias gasta exatamente 86 pontos (×2 em dobro), nível entre 2 e 6", () => {
    for (const role of ROLE_KEYS) {
      let total = 0;
      for (const [key, level] of Object.entries(ROLE_SKILL_PACKAGES[role])) {
        total += skillPointCost(key, level);
        expect(level, `${role}: ${key}`).toBeGreaterThanOrEqual(2);
        expect(level, `${role}: ${key}`).toBeLessThanOrEqual(6);
      }
      for (const c of ROLE_SKILL_CHOICES[role]) total += skillPointCost(c.skill, c.level);
      expect(total, role).toBe(86);
    }
  });

  it("todo pacote cobre as 13 perícias básicas", () => {
    for (const role of ROLE_KEYS) {
      const bases = new Set(Object.keys(ROLE_SKILL_PACKAGES[role]).map(skillBaseKey));
      for (const b of BASIC_SKILL_KEYS) expect(bases.has(b), `${role}: ${b}`).toBe(true);
    }
  });

  it("tabelas Streetrat: 10 linhas × 10 colunas por papel, valores entre 2 e 8", () => {
    for (const role of ROLE_KEYS) {
      const table = STREETRAT_STATS[role];
      expect(table, role).toHaveLength(10);
      for (const row of table) {
        expect(row).toHaveLength(10);
        for (const v of row) {
          expect(v).toBeGreaterThanOrEqual(2);
          expect(v).toBeLessThanOrEqual(8);
        }
      }
    }
  });

  it("linhas Streetrat somam um total coerente (no máximo 70 pontos, mínimo 50)", () => {
    for (const role of ROLE_KEYS) {
      for (const row of STREETRAT_STATS[role]) {
        const sum = row.reduce((a, b) => a + b, 0);
        expect(sum, `${role}: ${row.join(",")}`).toBeGreaterThanOrEqual(50);
        expect(sum, `${role}: ${row.join(",")}`).toBeLessThanOrEqual(70);
      }
    }
  });

  it("statsFromRow segue a ordem INT REF DES TEC AUT VON SOR MOV COR EMP", () => {
    const s = statsFromRow(STREETRAT_STATS.rockerboy[0]);
    expect(s).toMatchObject({ int: 7, ref: 6, dex: 6, tech: 5, cool: 6, will: 8, luck: 7, move: 7, body: 3, emp: 8 });
  });

  it("kits iniciais só citam chaves que existem nos catálogos", () => {
    for (const role of ROLE_KEYS) {
      const kit = ROLE_KITS[role];
      const check = (entries: { key: string; alt?: string[] }[], where: (k: string) => boolean, label: string) => {
        for (const e of entries) for (const k of [e.key, ...(e.alt ?? [])]) expect(where(k), `${role} ${label}: ${k}`).toBe(true);
      };
      check(kit.weapons, (k) => !!WEAPONS_MAP[k] || !!GEAR_MAP[k], "weapons");
      check(kit.armor, (k) => !!ARMORS_MAP[k] || !!GEAR_MAP[k], "armor");
      check(kit.gear, (k) => !!GEAR_MAP[k], "gear");
      check(kit.cyberware, (k) => !!CYBERWARE_MAP[k], "cyberware");
    }
  });

  it("HL fixa do ciberware inicial bate com o total impresso por papel", () => {
    const expected: Record<RoleKey, number> = {
      rockerboy: 9, solo: 14, netrunner: 14, tech: 12, medtech: 12, media: 10, lawman: 10, exec: 12, fixer: 16, nomad: 14,
    };
    for (const role of ROLE_KEYS) {
      const keys = ROLE_KITS[role].cyberware.map((e) => e.key);
      expect(chargenHumanityLoss(keys), role).toBe(expected[role]);
    }
  });
});

describe("Cyberpunk RED — armas, armaduras e ciberware", () => {
  it("armas: chaves únicas, perícia existente, dano válido, tabela de alcance válida", () => {
    expect(new Set(WEAPONS.map((w) => w.key)).size).toBe(WEAPONS.length);
    for (const w of WEAPONS) {
      expect(SKILLS_MAP[w.skill], w.key).toBeDefined();
      expect(() => parseDice(w.damage), w.key).not.toThrow();
      if (w.rangeClass) expect(RANGED_DV[w.rangeClass as RangedType], w.key).toBeDefined();
      expect(w.cost, w.key).toBeGreaterThan(0);
    }
  });

  it("valores do livro: pistola pesada 3d6/8/ROF2, fuzil 5d6/25, lança-foguetes 8d6", () => {
    expect(WEAPONS_MAP.hPistol).toMatchObject({ damage: "3d6", mag: 8, rof: 2, hands: 1, concealable: true, cost: 100 });
    expect(WEAPONS_MAP.assaultRifle).toMatchObject({ damage: "5d6", mag: 25, rof: 1, hands: 2, autofire: 4 });
    expect(WEAPONS_MAP.smg.autofire).toBe(3);
    expect(WEAPONS_MAP.rocketLauncher.damage).toBe("8d6");
    expect(WEAPONS_MAP.veryHeavyMelee).toMatchObject({ damage: "4d6", rof: 1 });
  });

  it("rollWeaponDamage detecta crítico com dois 6", () => {
    expect(rollWeaponDamage("3d6", rigged(6, 6, 6, 2))).toMatchObject({ total: 14, critical: true });
    expect(rollWeaponDamage("3d6", rigged(6, 6, 2, 3))).toMatchObject({ total: 11, critical: false });
  });

  it("armaduras do livro (PA e penalidade)", () => {
    expect(ARMORS_MAP.leathers).toMatchObject({ sp: 4, penalty: 0 });
    expect(ARMORS_MAP.kevlar).toMatchObject({ sp: 7, penalty: 0 });
    expect(ARMORS_MAP.lightArmorjack).toMatchObject({ sp: 11, penalty: 0, cost: 100 });
    expect(ARMORS_MAP.mediumArmorjack).toMatchObject({ sp: 12, penalty: -2 });
    expect(ARMORS_MAP.heavyArmorjack).toMatchObject({ sp: 13, penalty: -2 });
    expect(ARMORS_MAP.flak).toMatchObject({ sp: 15, penalty: -4 });
    expect(ARMORS_MAP.metalgear).toMatchObject({ sp: 18, penalty: -4 });
    expect(new Set(ARMORS.map((a) => a.key)).size).toBe(ARMORS.length);
  });

  it("ciberware: chaves únicas, requisitos existem, HL de moda é zero", () => {
    expect(new Set(CYBERWARE.map((c) => c.key)).size).toBe(CYBERWARE.length);
    for (const c of CYBERWARE) {
      if (c.requires) expect(CYBERWARE_MAP[c.requires], c.key).toBeDefined();
      if (c.category === "fashionware") expect(c.hl, c.key).toBe(0);
    }
    expect(CYBERWARE_MAP.neuralLink).toMatchObject({ hl: 7, hlDice: "2d6", cost: 500, provides: 5 });
    expect(CYBERWARE_MAP.cybereye.provides).toBe(3);
    expect(CYBERWARE_MAP.cyberarm.provides).toBe(4);
  });

  it("HL fixa de criação corresponde ao dado impresso (2d6 → 7, 1d6 → 3, 1d6/2 → 2, 4d6 → 14)", () => {
    const fixed: Record<string, number> = { "": 0, "1d6/2": 2, "1d6": 3, "2d6": 7, "4d6": 14 };
    for (const c of CYBERWARE) expect(c.hl, c.key).toBe(fixed[c.hlDice]);
  });

  it("HL rolada depois da criação (1d6/2 arredonda para cima)", () => {
    expect(rollHumanityLoss(CYBERWARE_MAP.neuralLink, rigged(6, 3, 4))).toBe(7);
    expect(rollHumanityLoss(CYBERWARE_MAP.audioRecorder, rigged(6, 5))).toBe(3);
    expect(rollHumanityLoss(CYBERWARE_MAP.audioRecorder, rigged(6, 4))).toBe(2);
    expect(rollHumanityLoss(CYBERWARE_MAP.biomonitor)).toBe(0);
  });

  it("espaços livres da fundação", () => {
    expect(slotsFree("neuralLink", ["interfacePlugs", "sandevistan"])).toBe(3);
    expect(slotsFree("cybereye", ["microOptics", "teleOptics", "targetingScope"])).toBe(0);
    expect(slotsFree("cyberarm", ["popupShield"])).toBe(1); // escudo ocupa 3
  });

  it("equipamento: chaves únicas e preços das categorias", () => {
    expect(new Set(ALL_GEAR.map((g) => g.key)).size).toBe(ALL_GEAR.length);
    expect(GEAR_MAP.agent.cost).toBe(100);
    expect(GEAR_MAP.cyberdeck.cost).toBe(500);
    expect(PRICE_CATEGORIES.map((p) => p.cost)).toEqual([10, 20, 50, 100, 500, 1000, 5000, 10000]);
    expect(DRUGS).toHaveLength(5);
    expect(LIFESTYLES.map((l) => l.cost)).toEqual([100, 300, 600, 1500]);
    expect(HOUSING.find((h) => h.key === "cargoContainer")).toMatchObject({ rent: 1000, buy: 15000 });
  });
});

describe("Cyberpunk RED — ferimentos críticos", () => {
  it("tabelas de corpo e cabeça cobrem 2..12 uma vez cada", () => {
    for (const table of [BODY_CRITICALS, HEAD_CRITICALS]) {
      expect(table.map((c) => c.roll)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      expect(new Set(table.map((c) => c.key)).size).toBe(11);
    }
  });

  it("2d6 sorteia a linha certa de cada tabela", () => {
    expect(rollCriticalInjury("body", [], rigged(6, 1, 1)).key).toBe("dismemberedArm"); // 2
    expect(rollCriticalInjury("body", [], rigged(6, 6, 6)).key).toBe("dismemberedLeg"); // 12
    expect(rollCriticalInjury("head", [], rigged(6, 3, 4)).key).toBe("foreignObjectHead"); // 7
    expect(rollCriticalInjury("head", [], rigged(6, 1, 2)).key).toBe("brainInjury"); // 3
  });

  it("repete a rolagem enquanto cair num ferimento que o alvo já tem", () => {
    // 1+1 = Braço Decepado (já tem) → depois 6+6 = Perna Decepada
    expect(rollCriticalInjury("body", ["dismemberedArm"], rigged(6, 1, 1, 6, 6)).key).toBe("dismemberedLeg");
  });

  it("alguns ferimentos aumentam a penalidade-base de salvaguarda em +1", () => {
    expect(getCriticalByKey("dismemberedArm")?.dsPenalty).toBe(true);
    expect(getCriticalByKey("brokenArm")?.dsPenalty).toBe(false);
    expect(baseDeathSavePenalty(["dismemberedArm", "brokenArm", "crackedSkull"])).toBe(2);
    expect(baseDeathSavePenalty([])).toBe(0);
  });
});

describe("Cyberpunk RED — Caminho de Vida", () => {
  it("todas as tabelas de 1d10 têm 10 entradas", () => {
    for (const t of [
      CULTURAL_ORIGINS, PERSONALITIES, CLOTHING_STYLES, HAIRSTYLES, AFFECTATIONS, VALUES, FEELINGS_ABOUT_PEOPLE,
      VALUED_PERSON, VALUED_POSSESSION, FAMILY_BACKGROUNDS, CHILDHOOD_ENVIRONMENTS, FAMILY_CRISES, FRIEND_KINDS,
      ENEMY_WHO, ENEMY_CAUSE, ENEMY_THREAT, REVENGE_RESPONSES, TRAGIC_LOVES, LIFE_GOALS,
    ]) expect(t).toHaveLength(10);
  });

  it("quantidade de amigos/inimigos/amores = max(0, 1d10 − 7)", () => {
    expect(rollRelationshipCount(rigged(10, 7))).toBe(0);
    expect(rollRelationshipCount(rigged(10, 1))).toBe(0);
    expect(rollRelationshipCount(rigged(10, 8))).toBe(1);
    expect(rollRelationshipCount(rigged(10, 10))).toBe(3);
  });

  it("rollLifepath monta o objeto completo e o idioma pertence à região", () => {
    const lp = rollLifepath(seeded(7));
    const origin = CULTURAL_ORIGINS.find((o) => o.region === lp.origin)!;
    expect(origin.languages).toContain(lp.language);
    expect(lp.friends.length).toBeLessThanOrEqual(3);
    expect(lp.goal.length).toBeGreaterThan(0);
  });
});

describe("Cyberpunk RED — netrunning", () => {
  it("Ações de NET por Grau: 1-3 → 2, 4-6 → 3, 7-9 → 4, 10 → 5", () => {
    expect([1, 3, 4, 6, 7, 9, 10].map(netActionsForRank)).toEqual([2, 2, 3, 3, 4, 4, 5]);
  });

  it("15 programas e 12 Black ICE, chaves únicas", () => {
    expect(PROGRAMS).toHaveLength(15);
    expect(BLACK_ICE).toHaveLength(12);
    expect(new Set(PROGRAMS.map((p) => p.key)).size).toBe(15);
    expect(new Set(BLACK_ICE.map((b) => b.key)).size).toBe(12);
    expect(INTERFACE_ABILITIES).toHaveLength(9);
  });

  it("valores do livro: Hellhound e Sword", () => {
    expect(BLACK_ICE.find((b) => b.key === "hellhound")).toMatchObject({ per: 6, spd: 6, atk: 6, def: 2, rez: 20 });
    expect(PROGRAMS.find((p) => p.key === "sword")).toMatchObject({ atk: 1, rez: 0, cost: 50 });
  });
});

describe("Cyberpunk RED — bestiário", () => {
  it("10 fichas com chaves únicas", () => {
    expect(BESTIARY).toHaveLength(10);
    expect(new Set(BESTIARY.map((b) => b.key)).size).toBe(10);
  });

  it("limiar de Gravemente Ferido = metade do HP impresso e salvaguarda = CORPO", () => {
    for (const b of BESTIARY) {
      expect(b.seriousThreshold, b.key).toBe(seriousThreshold(b.hp));
      expect(b.deathSave, b.key).toBe(b.stats.body);
    }
  });

  it("perícias do bestiário existem em SKILLS e o netrunner só leva programas conhecidos", () => {
    for (const b of BESTIARY) {
      for (const k of Object.keys(b.skillBases)) expect(SKILLS_MAP[skillBaseKey(k)], `${b.key}: ${k}`).toBeDefined();
    }
    const nr = BESTIARY.find((b) => b.key === "netrunnerNpc")!;
    for (const p of nr.programs!) expect(PROGRAMS.some((x) => x.key === p), p).toBe(true);
  });

  it("base de perícia impressa = atributo + nível plausível (Guarda-costas: Pistola 10 = REF 6 + 4)", () => {
    const g = BESTIARY.find((b) => b.key === "bodyguard")!;
    expect(g.skillBases.handgun - g.stats.ref).toBe(4);
  });
});

describe("Cyberpunk RED — nomes", () => {
  it("nome de rua traz nome, alcunha entre aspas e sobrenome", () => {
    expect(randomCyberpunkName(seeded(1))).toMatch(/^\S+ "[^"]+" \S+$/);
    expect(randomHandle(seeded(2)).length).toBeGreaterThan(0);
  });
});

describe("Cyberpunk RED — Pacote Completo (62 atributos / 86 perícias)", () => {
  const stats62: Stats = { int: 6, ref: 6, dex: 6, tech: 6, cool: 6, will: 6, luck: 6, move: 6, body: 6, emp: 8 };
  const solo = ROLE_SKILL_PACKAGES.solo;

  it("62 pontos de atributo e 86 de perícia gastos = pacote completo", () => {
    const r = validateCompletePackage({ stats: stats62, skills: solo });
    expect(r).toMatchObject({ valid: true, complete: true, statPointsUsed: 62, skillPointsUsed: 86, statPointsLeft: 0, skillPointsLeft: 0 });
  });

  it("63 pontos de atributo estoura", () => {
    const r = validateCompletePackage({ stats: { ...stats62, emp: 8, will: 7 }, skills: solo });
    expect(r.valid).toBe(false);
    expect(r.statPointsUsed).toBe(63);
  });

  it("atributo fora de 2..8 é rejeitado", () => {
    expect(validateCompletePackage({ stats: { ...stats62, emp: 9, will: 5 }, skills: solo }).valid).toBe(false);
    expect(validateCompletePackage({ stats: { ...stats62, emp: 1, will: 6, luck: 7, body: 7 }, skills: solo }).valid).toBe(false);
  });

  it("87 pontos de perícia estoura; ×2 conta em dobro", () => {
    expect(validateCompletePackage({ stats: stats62, skills: { ...solo, handgun: 6, athletics: 3 } }).skillPointsUsed).toBe(87);
    expect(validateCompletePackage({ stats: stats62, skills: { ...solo, athletics: 3 } }).valid).toBe(false);
    // Fogo Automático (×2) a 6 = 12 pontos
    expect(validateCompletePackage({ stats: stats62, skills: { ...solo, autofire: 5 } }).skillPointsUsed).toBe(86 - 2);
  });

  it("nível acima de 6 e perícia desconhecida são rejeitados", () => {
    expect(validateCompletePackage({ stats: stats62, skills: { ...solo, handgun: 7 } }).errors.some((e) => e.includes("máximo"))).toBe(true);
    expect(validateCompletePackage({ stats: stats62, skills: { ...solo, inventada: 2 } }).errors.some((e) => e.includes("desconhecida"))).toBe(true);
  });

  it("perícia básica abaixo de 2 é rejeitada", () => {
    const sk = { ...solo, athletics: 1 };
    const r = validateCompletePackage({ stats: stats62, skills: sk });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("athletics"))).toBe(true);
  });

  it("idioma cultural (+4) é grátis e não entra na conta", () => {
    const sk = { ...solo, "language:portuguese": 4 };
    expect(validateCompletePackage({ stats: stats62, skills: sk, freeLanguageKey: "language:portuguese" }).skillPointsUsed).toBe(86);
    expect(validateCompletePackage({ stats: stats62, skills: sk }).skillPointsUsed).toBe(90);
  });

  it("sobrar pontos é válido, mas não completo", () => {
    const r = validateCompletePackage({ stats: { ...stats62, emp: 7 }, skills: solo });
    expect(r.valid).toBe(true);
    expect(r.complete).toBe(false);
    expect(r.statPointsLeft).toBe(1);
  });
});

describe("Cyberpunk RED — geração automática", () => {
  it.each(ROLE_KEYS)("%s: ficha coerente (HP, Humanidade, perícias e kit)", (role) => {
    for (const method of ["streetrat", "edgerunner"] as const) {
      const c = generateEdgerunner({ role, method, rng: seeded(role.length * 31 + method.length) });
      expect(c.role).toBe(role);
      expect(c.roleRank).toBe(STARTING_ROLE_RANK);
      expect(c.eurobucks).toBe(500);

      // Atributos vêm da tabela do papel (cada valor existe na coluna).
      STAT_KEYS.forEach((k, col) => {
        expect(STREETRAT_STATS[role].some((row) => row[col] === c[k]), `${role} ${k}`).toBe(true);
      });
      if (method === "streetrat") {
        expect(STREETRAT_STATS[role].some((row) => STAT_KEYS.every((k, i) => row[i] === c[k]))).toBe(true);
      }

      expect(c.hpMax).toBe(hpMax(c.body, c.will));
      expect(c.hpCurrent).toBe(c.hpMax);
      expect(c.luckCurrent).toBe(c.luck);
      expect(c.humanityMax).toBe(c.emp * 10);
      const hl = c.cyberware.reduce((n, i) => n + i.humanityLoss, 0);
      expect(c.humanity).toBe(c.humanityMax - hl);

      // As perícias formam um Pacote Completo válido (idioma cultural grátis).
      const free = Object.keys(c.skills).find((k) => k.startsWith("language:") && k !== "language:streetslang")!;
      expect(c.skills[free]).toBe(4);
      const v = validateCompletePackage({ stats: statsFromRow(STAT_KEYS.map((k) => c[k])), skills: c.skills, freeLanguageKey: free });
      expect(v.errors.filter((e) => !e.includes("atributo") && !e.includes("Atributo")), `${role} ${method}`).toEqual([]);
      expect(v.skillPointsUsed).toBe(86);

      expect(c.armor.body).toMatchObject({ sp: 11, spMax: 11 });
      expect(c.armor.head).toMatchObject({ sp: 11 });
      expect(c.weapons.length).toBeGreaterThan(0);
      expect(c.cyberware.length).toBeGreaterThan(0);
      expect(c.name).toMatch(/"/);
    }
  });

  it("sem papel informado sorteia um papel válido", () => {
    expect(ROLE_KEYS).toContain(generateEdgerunner({ rng: seeded(99) }).role);
  });
});
