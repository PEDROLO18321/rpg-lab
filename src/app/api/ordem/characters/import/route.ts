import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readImportRequest, handleImportError } from "@/lib/characterImport";
import { LIMITS, intIn, strOrNull, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { MAX_NEX } from "@/lib/ordem/leveling";
import { FORMAT } from "../[id]/export/route";

export async function POST(req: NextRequest) {
  try {
    const { userId, systemId, character: char, sheet: s } = await readImportRequest(req, {
      slug: "ordem",
      format: FORMAT,
      label: "Ordem Paranormal",
      subject: "agente",
    });

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: (char.name as string).trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl, LIMITS.url),
        ordemSheet: {
          create: {
            origin: strOrNull(s.origin, LIMITS.name),
            className: strOrNull(s.className, LIMITS.name) ?? "combatente",
            trail: strOrNull(s.trail, LIMITS.name),
            nex: intIn(s.nex, 0, MAX_NEX, 5),
            patente: strOrNull(s.patente, LIMITS.name) ?? "recruta",
            agi: intIn(s.agi, 0, 20, 1), forca: intIn(s.forca, 0, 20, 1),
            int: intIn(s.int, 0, 20, 1), pre: intIn(s.pre, 0, 20, 1),
            vig: intIn(s.vig, 0, 20, 1),
            pvMax: intIn(s.pvMax, 0, 100_000, 0),
            pvCurrent: intIn(s.pvCurrent, -1_000, 100_000, 0),
            pvTemp: intIn(s.pvTemp, 0, 100_000, 0),
            peMax: intIn(s.peMax, 0, 100_000, 0),
            peCurrent: intIn(s.peCurrent, 0, 100_000, 0),
            peTemp: intIn(s.peTemp, 0, 100_000, 0),
            sanMax: intIn(s.sanMax, 0, 100_000, 0),
            sanCurrent: intIn(s.sanCurrent, 0, 100_000, 0),
            sanTemp: intIn(s.sanTemp, 0, 100_000, 0),
            defense: intIn(s.defense, 0, 200, 10),
            movement: intIn(s.movement, 0, 1_000, 9),
            prestige: intIn(s.prestige, 0, 100_000, 0),
            affinity: strOrNull(s.affinity, LIMITS.name),
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
    return handleImportError(err, "[POST /api/ordem/characters/import]");
  }
}
