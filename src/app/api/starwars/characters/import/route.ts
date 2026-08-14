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
    return NextResponse.json({ error: "Arquivo inválido para Star Wars." }, { status: 400 });
  }

  const char = payload.character ?? {};
  const s = payload.sheet ?? {};
  if (typeof char.name !== "string" || !char.name.trim()) {
    return NextResponse.json({ error: "Nome do personagem ausente." }, { status: 400 });
  }

  try {
    const character = await prisma.character.create({
      data: {
        userId: session.user.id,
        systemId,
        name: char.name.trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl),
        starWarsSheet: {
          create: {
            species: strOrNull(s.species), planet: strOrNull(s.planet),
            planetSkillChoice: strOrNull(s.planetSkillChoice), path: strOrNull(s.path),
            classes: toJsonFieldOrNull(s.classes ?? {}) ?? "{}",
            level: numOr(s.level, 1), xp: numOr(s.xp, 0),
            humanAttrChoice: toJsonFieldOrNull(s.humanAttrChoice ?? null),
            agi: numOr(s.agi, 1), int: numOr(s.int, 1), forca: numOr(s.forca, 1),
            vig: numOr(s.vig, 1), pre: numOr(s.pre, 1), sen: numOr(s.sen, 1),
            pvMax: numOr(s.pvMax, 10), pvClassSum: numOr(s.pvClassSum, 0), pvLevelGain: numOr(s.pvLevelGain, 0),
            pvCurrent: numOr(s.pvCurrent, 10), pvTemp: numOr(s.pvTemp, 0),
            peMax: numOr(s.peMax, 0), peCurrent: numOr(s.peCurrent, 0), peTemp: numOr(s.peTemp, 0),
            ppMax: numOr(s.ppMax, 0), ppCurrent: numOr(s.ppCurrent, 0), ppTemp: numOr(s.ppTemp, 0),
            sabreForm: strOrNull(s.sabreForm),
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
    console.error("[POST /api/starwars/characters/import]", err);
    return NextResponse.json({ error: "Erro ao importar personagem." }, { status: 500 });
  }
}
