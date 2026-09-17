import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readImportRequest, handleImportError } from "@/lib/characterImport";
import { LIMITS, intIn, strOrNull, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { FORMAT } from "../[id]/export/route";

export async function POST(req: NextRequest) {
  try {
    const { userId, systemId, character: char, sheet: s } = await readImportRequest(req, {
      slug: "cthulhu",
      format: FORMAT,
      label: "Call of Cthulhu",
      subject: "investigador",
    });

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: (char.name as string).trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl, LIMITS.url),
        cthulhuSheet: {
          create: {
            occupation: strOrNull(s.occupation, LIMITS.name),
            era: strOrNull(s.era, LIMITS.name) ?? "1920s",
            age: intIn(s.age, 1, 120, 25),
            // Atributos de CoC são percentuais (0–99 na criação); teto folgado
            // para acomodar bônus de regra da casa sem aceitar lixo.
            atribFor: intIn(s.atribFor, 0, 200, 50), atribCon: intIn(s.atribCon, 0, 200, 50),
            atribTam: intIn(s.atribTam, 0, 200, 65), atribDes: intIn(s.atribDes, 0, 200, 50),
            atribApa: intIn(s.atribApa, 0, 200, 50), atribInt: intIn(s.atribInt, 0, 200, 65),
            atribPod: intIn(s.atribPod, 0, 200, 50), atribEdu: intIn(s.atribEdu, 0, 200, 65),
            sanCurrent: intIn(s.sanCurrent, 0, 200, 50), sanMax: intIn(s.sanMax, 0, 200, 99),
            pvMax: intIn(s.pvMax, 0, 500, 12), pvCurrent: intIn(s.pvCurrent, -100, 500, 12),
            luck: intIn(s.luck, 0, 200, 50),
            mov: intIn(s.mov, 0, 100, 8),
            pmCurrent: intIn(s.pmCurrent, 0, 200, 10),
            pvTemp: intIn(s.pvTemp, 0, 500, 0),
            sanTemp: intIn(s.sanTemp, 0, 200, 0),
            pmTemp: intIn(s.pmTemp, 0, 200, 0),
            skillChecks: toJsonFieldOrNull(s.skillChecks ?? []),
            skills: toJsonFieldOrNull(s.skills ?? {}),
            background: toJsonFieldOrNull(s.background ?? {}),
            weapons: toJsonFieldOrNull(s.weapons ?? []),
            equipment: strOrNull(s.equipment),
            notes: strOrNull(s.notes),
            insanityData: toJsonFieldOrNull(s.insanityData ?? null),
            spellsData: toJsonFieldOrNull(s.spellsData ?? []),
          },
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    return handleImportError(err, "[POST /api/cthulhu/characters/import]");
  }
}
