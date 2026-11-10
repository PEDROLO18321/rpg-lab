import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readImportRequest, handleImportError } from "@/lib/characterImport";
import { LIMITS, intIn, strOrNull, strIn, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { ROLE_KEYS } from "@/lib/cyberpunk/data";
import { CREATION_METHODS, RANGES, shapeIn, skillsIn } from "@/lib/cyberpunk/sheetInput";
import { FORMAT } from "../[id]/export/route";

export async function POST(req: NextRequest) {
  try {
    const { userId, systemId, character: char, sheet: s } = await readImportRequest(req, {
      slug: "cyberpunk",
      format: FORMAT,
      label: "Cyberpunk RED",
      subject: "edgerunner",
    });

    const stat = (v: unknown) => intIn(v, ...RANGES.stat, 5);

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: (char.name as string).trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl, LIMITS.url),
        cyberpunkSheet: {
          create: {
            role: strIn(s.role, ROLE_KEYS, "solo")!,
            roleRank: intIn(s.roleRank, ...RANGES.roleRank, 4),
            creationMethod: strIn(s.creationMethod, CREATION_METHODS, "streetrat")!,
            int: stat(s.int), ref: stat(s.ref), dex: stat(s.dex), tech: stat(s.tech), cool: stat(s.cool),
            will: stat(s.will), luck: stat(s.luck), move: stat(s.move), body: stat(s.body), emp: stat(s.emp),
            luckCurrent: intIn(s.luckCurrent, ...RANGES.luckCurrent, 5),
            hpMax: intIn(s.hpMax, ...RANGES.hpMax, 35),
            hpCurrent: intIn(s.hpCurrent, ...RANGES.hpCurrent, 35),
            humanityMax: intIn(s.humanityMax, ...RANGES.humanityMax, 50),
            humanity: intIn(s.humanity, ...RANGES.humanity, 50),
            deathSavePenalty: intIn(s.deathSavePenalty, ...RANGES.deathSavePenalty, 0),
            improvementPoints: intIn(s.improvementPoints, ...RANGES.improvementPoints, 0),
            eurobucks: intIn(s.eurobucks, ...RANGES.eurobucks, 0),
            reputation: intIn(s.reputation, ...RANGES.reputation, 0),
            skills: toJsonFieldOrNull(skillsIn(s.skills) ?? {}),
            armor: toJsonFieldOrNull(shapeIn(s.armor, "object", "armor") ?? {}),
            weapons: toJsonFieldOrNull(shapeIn(s.weapons, "array", "weapons") ?? []),
            cyberware: toJsonFieldOrNull(shapeIn(s.cyberware, "array", "cyberware") ?? []),
            gear: toJsonFieldOrNull(shapeIn(s.gear, "array", "gear") ?? []),
            criticalInjuries: toJsonFieldOrNull(shapeIn(s.criticalInjuries, "array", "criticalInjuries") ?? []),
            lifepath: toJsonFieldOrNull(shapeIn(s.lifepath, "object", "lifepath") ?? {}),
            background: toJsonFieldOrNull(shapeIn(s.background, "object", "background") ?? {}),
            notes: strOrNull(s.notes),
          },
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    return handleImportError(err, "[POST /api/cyberpunk/characters/import]");
  }
}
