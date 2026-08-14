import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { numOr, strOrNull, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { FORMAT } from "../[id]/export/route";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { systemId, payload } = body ?? {};
  if (!systemId || payload?.format !== FORMAT) {
    return NextResponse.json({ error: "Arquivo inválido para Call of Cthulhu." }, { status: 400 });
  }

  const char = payload.character ?? {};
  const s = payload.sheet ?? {};
  if (typeof char.name !== "string" || !char.name.trim()) {
    return NextResponse.json({ error: "Nome do investigador ausente." }, { status: 400 });
  }

  try {
    const character = await prisma.character.create({
      data: {
        userId: session.user.id,
        systemId,
        name: char.name.trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl),
        cthulhuSheet: {
          create: {
            occupation: strOrNull(s.occupation), era: strOrNull(s.era) ?? "1920s",
            age: numOr(s.age, 25),
            atribFor: numOr(s.atribFor, 50), atribCon: numOr(s.atribCon, 50), atribTam: numOr(s.atribTam, 65),
            atribDes: numOr(s.atribDes, 50), atribApa: numOr(s.atribApa, 50), atribInt: numOr(s.atribInt, 65),
            atribPod: numOr(s.atribPod, 50), atribEdu: numOr(s.atribEdu, 65),
            sanCurrent: numOr(s.sanCurrent, 50), sanMax: numOr(s.sanMax, 99),
            pvMax: numOr(s.pvMax, 12), pvCurrent: numOr(s.pvCurrent, 12),
            luck: numOr(s.luck, 50), mov: numOr(s.mov, 8), pmCurrent: numOr(s.pmCurrent, 10),
            pvTemp: numOr(s.pvTemp, 0), sanTemp: numOr(s.sanTemp, 0), pmTemp: numOr(s.pmTemp, 0),
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
    console.error("[POST /api/cthulhu/characters/import]", err);
    return NextResponse.json({ error: "Erro ao importar personagem." }, { status: 500 });
  }
}
