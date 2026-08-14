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
    return NextResponse.json({ error: "Arquivo inválido para Ordem Paranormal." }, { status: 400 });
  }

  const char = payload.character ?? {};
  const s = payload.sheet ?? {};
  if (typeof char.name !== "string" || !char.name.trim()) {
    return NextResponse.json({ error: "Nome do agente ausente." }, { status: 400 });
  }

  try {
    const character = await prisma.character.create({
      data: {
        userId: session.user.id,
        systemId,
        name: char.name.trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl),
        ordemSheet: {
          create: {
            origin: strOrNull(s.origin), className: strOrNull(s.className) ?? "combatente",
            trail: strOrNull(s.trail), nex: numOr(s.nex, 5), patente: strOrNull(s.patente) ?? "recruta",
            agi: numOr(s.agi, 1), forca: numOr(s.forca, 1), int: numOr(s.int, 1),
            pre: numOr(s.pre, 1), vig: numOr(s.vig, 1),
            pvMax: numOr(s.pvMax, 0), pvCurrent: numOr(s.pvCurrent, 0), pvTemp: numOr(s.pvTemp, 0),
            peMax: numOr(s.peMax, 0), peCurrent: numOr(s.peCurrent, 0), peTemp: numOr(s.peTemp, 0),
            sanMax: numOr(s.sanMax, 0), sanCurrent: numOr(s.sanCurrent, 0), sanTemp: numOr(s.sanTemp, 0),
            defense: numOr(s.defense, 10), movement: numOr(s.movement, 9),
            prestige: numOr(s.prestige, 0), affinity: strOrNull(s.affinity),
            skills: toJsonFieldOrNull(s.skills ?? {}),
            abilities: toJsonFieldOrNull(s.abilities ?? []),
            rituals: toJsonFieldOrNull(s.rituals ?? []),
            inventory: toJsonFieldOrNull(s.inventory ?? []),
            weapons: toJsonFieldOrNull(s.weapons ?? []),
            background: toJsonFieldOrNull(s.background ?? {}),
            conditions: toJsonFieldOrNull(s.conditions ?? []),
            insanity: toJsonFieldOrNull(s.insanity ?? null),
            notes: strOrNull(s.notes),
          },
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/ordem/characters/import]", err);
    return NextResponse.json({ error: "Erro ao importar personagem." }, { status: 500 });
  }
}
