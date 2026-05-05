import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RACES } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
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

    // Final ability scores
    const finalScores = ABILITIES.reduce((acc, k) => ({
      ...acc,
      [k]: (abilityBases[k] ?? 8) + (racialBonus[k] ?? 0),
    }), {} as Record<AbilityKey, number>);

    const conMod = mod(finalScores.con);
    const dexMod = mod(finalScores.dex);

    const hpMax = cls.hitDie + conMod;
    const ac    = 10 + dexMod;

    // Serialize description extras into Character.notes
    const notes = desc && Object.keys(desc).length > 0 ? JSON.stringify(desc) : null;

    const subclassObj = cls.subclasses?.find((s: { id: string }) => s.id === subclassId);

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
            hitDice:   `1d${cls.hitDie}`,
            speed:     race.speed,
            armorClass: ac,
            initiative: dexMod,
            classes: {
              create: {
                className: classId,
                subclass:  subclassObj?.name ?? null,
                level:     1,
              },
            },
            skills: {
              create: (selectedSkills ?? []).map((skillName: string) => ({
                skillName,
                proficient: true,
              })),
            },
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
