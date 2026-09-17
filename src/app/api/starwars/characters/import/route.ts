import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readImportRequest, handleImportError } from "@/lib/characterImport";
import { LIMITS, intIn, strOrNull, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { MAX_LEVEL } from "@/lib/starwars/leveling";
import { FORMAT } from "../[id]/export/route";

export async function POST(req: NextRequest) {
  try {
    const { userId, systemId, character: char, sheet: s } = await readImportRequest(req, {
      slug: "starwars",
      format: FORMAT,
      label: "Star Wars",
    });

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: (char.name as string).trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl, LIMITS.url),
        starWarsSheet: {
          create: {
            species: strOrNull(s.species, LIMITS.name),
            planet: strOrNull(s.planet, LIMITS.name),
            planetSkillChoice: strOrNull(s.planetSkillChoice, LIMITS.name),
            path: strOrNull(s.path, LIMITS.name),
            classes: toJsonFieldOrNull(s.classes ?? {}) ?? "{}",
            level: intIn(s.level, 1, MAX_LEVEL, 1),
            xp: intIn(s.xp, 0, 100_000_000, 0),
            humanAttrChoice: toJsonFieldOrNull(s.humanAttrChoice ?? null),
            agi: intIn(s.agi, 0, 10_000, 1), int: intIn(s.int, 0, 10_000, 1),
            forca: intIn(s.forca, 0, 10_000, 1), vig: intIn(s.vig, 0, 10_000, 1),
            pre: intIn(s.pre, 0, 10_000, 1), sen: intIn(s.sen, 0, 10_000, 1),
            pvMax: intIn(s.pvMax, 0, 10_000_000, 10),
            pvClassSum: intIn(s.pvClassSum, 0, 10_000_000, 0),
            pvLevelGain: intIn(s.pvLevelGain, 0, 10_000_000, 0),
            pvCurrent: intIn(s.pvCurrent, -100_000, 10_000_000, 10),
            pvTemp: intIn(s.pvTemp, 0, 10_000_000, 0),
            peMax: intIn(s.peMax, 0, 10_000_000, 0),
            peCurrent: intIn(s.peCurrent, 0, 10_000_000, 0),
            peTemp: intIn(s.peTemp, 0, 10_000_000, 0),
            ppMax: intIn(s.ppMax, 0, 10_000_000, 0),
            ppCurrent: intIn(s.ppCurrent, 0, 10_000_000, 0),
            ppTemp: intIn(s.ppTemp, 0, 10_000_000, 0),
            sabreForm: strOrNull(s.sabreForm, LIMITS.name),
            unlockedProphecies: toJsonFieldOrNull(s.unlockedProphecies ?? []) ?? "[]",
            skills: toJsonFieldOrNull(s.skills ?? {}),
            classPowers: toJsonFieldOrNull(s.classPowers ?? []),
            generalPowers: toJsonFieldOrNull(s.generalPowers ?? []),
            equipment: toJsonFieldOrNull(s.equipment ?? []),
            weapons: toJsonFieldOrNull(s.weapons ?? []),
            conditions: toJsonFieldOrNull(s.conditions ?? []),
            background: toJsonFieldOrNull(s.background ?? {}),
            notes: strOrNull(s.notes),
          },
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    return handleImportError(err, "[POST /api/starwars/characters/import]");
  }
}
