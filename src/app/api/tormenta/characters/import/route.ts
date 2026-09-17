import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readImportRequest, handleImportError } from "@/lib/characterImport";
import { LIMITS, intIn, strOrNull, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { MAX_LEVEL } from "@/lib/tormenta/leveling";
import { FORMAT } from "../[id]/export/route";

export async function POST(req: NextRequest) {
  try {
    const { userId, systemId, character: char, sheet: s } = await readImportRequest(req, {
      slug: "tormenta20",
      format: FORMAT,
      label: "Tormenta 20",
    });

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: (char.name as string).trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl, LIMITS.url),
        tormentaSheet: {
          create: {
            race: strOrNull(s.race, LIMITS.name),
            raceVariant: strOrNull(s.raceVariant, LIMITS.name),
            className: strOrNull(s.className, LIMITS.name),
            path: strOrNull(s.path, LIMITS.name),
            origin: strOrNull(s.origin, LIMITS.name),
            godId: strOrNull(s.godId, LIMITS.name),
            level: intIn(s.level, 1, MAX_LEVEL, 1),
            xp: intIn(s.xp, 0, 1_000_000, 0),
            forca: intIn(s.forca, -10, 50, 10), des: intIn(s.des, -10, 50, 10),
            con: intIn(s.con, -10, 50, 10), int: intIn(s.int, -10, 50, 10),
            sab: intIn(s.sab, -10, 50, 10), car: intIn(s.car, -10, 50, 10),
            pvMax: intIn(s.pvMax, 0, 100_000, 10),
            pvCurrent: intIn(s.pvCurrent, -1_000, 100_000, 10),
            pvTemp: intIn(s.pvTemp, 0, 100_000, 0),
            pmMax: intIn(s.pmMax, 0, 100_000, 10),
            pmCurrent: intIn(s.pmCurrent, 0, 100_000, 10),
            pmTemp: intIn(s.pmTemp, 0, 100_000, 0),
            defense: intIn(s.defense, 0, 200, 10),
            movement: intIn(s.movement, 0, 1_000, 9),
            money: intIn(s.money, 0, 100_000_000, 0),
            skills: toJsonFieldOrNull(s.skills ?? {}),
            schoolsChosen: toJsonFieldOrNull(s.schoolsChosen ?? []),
            spellsKnown: toJsonFieldOrNull(s.spellsKnown ?? []),
            powers: toJsonFieldOrNull(s.powers ?? []),
            weapons: toJsonFieldOrNull(s.weapons ?? []),
            equipment: toJsonFieldOrNull(s.equipment ?? []),
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
    return handleImportError(err, "[POST /api/tormenta/characters/import]");
  }
}
