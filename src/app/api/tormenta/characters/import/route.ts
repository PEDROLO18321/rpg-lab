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
    return NextResponse.json({ error: "Arquivo inválido para Tormenta 20." }, { status: 400 });
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
        tormentaSheet: {
          create: {
            race: strOrNull(s.race), raceVariant: strOrNull(s.raceVariant),
            className: strOrNull(s.className), path: strOrNull(s.path),
            origin: strOrNull(s.origin), godId: strOrNull(s.godId),
            level: numOr(s.level, 1), xp: numOr(s.xp, 0),
            forca: numOr(s.forca, 10), des: numOr(s.des, 10), con: numOr(s.con, 10),
            int: numOr(s.int, 10), sab: numOr(s.sab, 10), car: numOr(s.car, 10),
            pvMax: numOr(s.pvMax, 10), pvCurrent: numOr(s.pvCurrent, 10), pvTemp: numOr(s.pvTemp, 0),
            pmMax: numOr(s.pmMax, 10), pmCurrent: numOr(s.pmCurrent, 10), pmTemp: numOr(s.pmTemp, 0),
            defense: numOr(s.defense, 10), movement: numOr(s.movement, 9), money: numOr(s.money, 0),
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
    console.error("[POST /api/tormenta/characters/import]", err);
    return NextResponse.json({ error: "Erro ao importar personagem." }, { status: 500 });
  }
}
