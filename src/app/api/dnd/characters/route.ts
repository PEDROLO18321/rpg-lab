import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RACES } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { resolveEquipment, extractStartingCurrency } from "@/lib/dnd/equipmentParser";
import { SPELLS } from "@/lib/dnd/spells";
import type { AbilityKey } from "@/lib/dnd/races";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userId,
      systemId,
      charName,
      raceId,
      subraceId,
      classId,
      subclassId,
      backgroundId,
      abilityBases,
      selectedSkills,
      desc,
      equipmentChoices,
      selectedCantrips,
      selectedSpells,
      selectedLanguages,
      racialAbilityBonuses,
      selectedRacialSkills,
    } = body;

    // Validate required fields
    if (!userId || !systemId || !charName?.trim() || !raceId || !classId || !backgroundId) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    if (!abilityBases || Object.keys(abilityBases).length !== 6) {
      return NextResponse.json({ error: "Atributos incompletos." }, { status: 400 });
    }

    // Resolve race/subrace for bonuses and speed
    const race    = RACES.find((r) => r.id === raceId);
    const subrace = race?.subraces.find((s) => s.id === subraceId);
    const cls     = CLASSES.find((c) => c.id === classId);

    if (!race || !cls) {
      return NextResponse.json({ error: "Raça ou classe inválida." }, { status: 400 });
    }

    // Compute racial bonuses
    const racialBonus: Partial<Record<AbilityKey, number>> = {};
    for (const [k, v] of Object.entries(race.baseBonus) as [AbilityKey, number][]) {
      racialBonus[k] = (racialBonus[k] ?? 0) + v;
    }
    if (subrace) {
      for (const [k, v] of Object.entries(subrace.bonus) as [AbilityKey, number][]) {
        racialBonus[k] = (racialBonus[k] ?? 0) + v;
      }
    }
    if (racialAbilityBonuses) {
      for (const [k, v] of Object.entries(racialAbilityBonuses) as [AbilityKey, number][]) {
        racialBonus[k] = (racialBonus[k] ?? 0) + v;
      }
    }

    // Final ability scores
    const finalScores = ABILITIES.reduce((acc, k) => ({
      ...acc,
      [k]: (abilityBases[k] ?? 8) + (racialBonus[k] ?? 0),
    }), {} as Record<AbilityKey, number>);

    const conMod = mod(finalScores.con);
    const dexMod = mod(finalScores.dex);
    const wisMod = mod(finalScores.wis);

    const isAnaoDaColina = subraceId === "anao-colina";
    const hpMax = cls.hitDie + conMod + (isAnaoDaColina ? 1 : 0);

    // Base unarmored AC: class unarmored defense overrides standard base
    const baseAC           = 10 + dexMod;
    const unarmoredDefense = classId === "barbaro"  ? 10 + dexMod + conMod
                           : classId === "monge"    ? 10 + dexMod + wisMod
                           : 10 + dexMod;
    const ac = Math.max(baseAC, unarmoredDefense);

    // Serialize description + languages into Character.notes
    const notesData = {
      ...(desc ?? {}),
      languages: selectedLanguages ?? [],
    };
    const notes = JSON.stringify(notesData);

    const subclassObj = subclassId
      ? cls.subclasses?.find((s: { id: string }) => s.id === subclassId)
      : null;

    // Resolve selected spells to their data
    const allSelectedSpellIds = [...(selectedCantrips ?? []), ...(selectedSpells ?? [])];
    const resolvedSpells = allSelectedSpellIds
      .map((id: string) => SPELLS.find((s) => s.id === id))
      .filter(Boolean);

    // Resolve equipment list
    const bg = BACKGROUNDS.find((b) => b.id === backgroundId);
    const ec: Record<string, string> = equipmentChoices ?? {};
    const resolvedItems = resolveEquipment(cls.startingEquipment, bg?.startingEquipment ?? [], ec);
    const startingCurrency = extractStartingCurrency(cls.startingEquipment, bg?.startingEquipment ?? []);

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: charName.trim(),
        notes,
        dndSheet: {
          create: {
            race:       subraceId ? `${raceId}/${subraceId}` : raceId,
            background: backgroundId,
            alignment:  desc?.alignment ?? null,
            level:      1,
            str: finalScores.str,
            dex: finalScores.dex,
            con: finalScores.con,
            int: finalScores.int,
            wis: finalScores.wis,
            cha: finalScores.cha,
            hpMax,
            hpCurrent: hpMax,
            hitDice:   `D${cls.hitDie}`,
            speed:     subrace?.speed ?? race.speed,
            armorClass:   ac,
            initiative:   dexMod,
            spellAbility: cls.spellcastingAbility ?? null,
            gp: startingCurrency.gp ?? 0,
            sp: startingCurrency.sp ?? 0,
            cp: startingCurrency.cp ?? 0,
            ep: startingCurrency.ep ?? 0,
            pp: startingCurrency.pp ?? 0,
            classes: {
              create: {
                className: classId,
                subclass:  subclassObj?.name ?? null,
                level:     1,
              },
            },
            skills: {
              create: Array.from(new Set([
                ...(selectedSkills ?? []),
                ...(selectedRacialSkills ?? []),
                ...(raceId === "meio-orc" ? ["Intimidação"] : []),
              ])).map((skillName: string) => ({
                skillName,
                proficient: true,
              })),
            },
            equipment: resolvedItems.length > 0 ? {
              create: resolvedItems.map((itemName: string) => ({
                itemName,
                quantity: 1,
              })),
            } : undefined,
            spells: resolvedSpells.length > 0 ? {
              create: resolvedSpells.map((spell) => ({
                spellName:   spell!.name,
                level:       spell!.level,
                school:      spell!.school,
                prepared:    spell!.level === 0,
                castingTime: spell!.castingTime,
                range:       spell!.range,
                duration:    spell!.duration,
                components:  "",
              })),
            } : undefined,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/dnd/characters]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
