import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeEnvelope, parseJsonField } from "@/lib/characterTransfer";

export const FORMAT = "rpglab.ordem.v1";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    include: { ordemSheet: true },
  });
  if (!character || !character.ordemSheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const s = character.ordemSheet;
  const envelope = makeEnvelope(
    FORMAT,
    { name: character.name, portraitUrl: character.portraitUrl, notes: character.notes },
    {
      origin: s.origin, className: s.className, trail: s.trail, nex: s.nex, patente: s.patente,
      agi: s.agi, forca: s.forca, int: s.int, pre: s.pre, vig: s.vig,
      pvMax: s.pvMax, pvCurrent: s.pvCurrent, pvTemp: s.pvTemp,
      peMax: s.peMax, peCurrent: s.peCurrent, peTemp: s.peTemp,
      sanMax: s.sanMax, sanCurrent: s.sanCurrent, sanTemp: s.sanTemp,
      defense: s.defense, movement: s.movement, prestige: s.prestige, affinity: s.affinity,
      skills: parseJsonField<Record<string, string>>(s.skills, {}),
      abilities: parseJsonField<unknown>(s.abilities, []),
      rituals: parseJsonField<unknown[]>(s.rituals, []),
      inventory: parseJsonField<unknown[]>(s.inventory, []),
      weapons: parseJsonField<unknown[]>(s.weapons, []),
      background: parseJsonField<Record<string, unknown>>(s.background, {}),
      conditions: parseJsonField<string[]>(s.conditions, []),
      insanity: parseJsonField<Record<string, unknown> | null>(s.insanity, null),
      notes: s.notes,
    }
  );

  return NextResponse.json(envelope);
}
