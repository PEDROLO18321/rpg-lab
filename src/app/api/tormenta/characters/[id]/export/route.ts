import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeEnvelope, parseJsonField } from "@/lib/characterTransfer";

export const FORMAT = "rpglab.tormenta.v1";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    include: { tormentaSheet: true },
  });
  if (!character || !character.tormentaSheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const s = character.tormentaSheet;
  const envelope = makeEnvelope(
    FORMAT,
    { name: character.name, portraitUrl: character.portraitUrl, notes: character.notes },
    {
      race: s.race, raceVariant: s.raceVariant, className: s.className, path: s.path,
      origin: s.origin, godId: s.godId, level: s.level, xp: s.xp,
      forca: s.forca, des: s.des, con: s.con, int: s.int, sab: s.sab, car: s.car,
      pvMax: s.pvMax, pvCurrent: s.pvCurrent, pvTemp: s.pvTemp,
      pmMax: s.pmMax, pmCurrent: s.pmCurrent, pmTemp: s.pmTemp,
      defense: s.defense, movement: s.movement, money: s.money,
      skills: parseJsonField<Record<string, boolean>>(s.skills, {}),
      schoolsChosen: parseJsonField<string[]>(s.schoolsChosen, []),
      spellsKnown: parseJsonField<string[]>(s.spellsKnown, []),
      powers: parseJsonField<unknown[]>(s.powers, []),
      weapons: parseJsonField<unknown[]>(s.weapons, []),
      equipment: parseJsonField<unknown[]>(s.equipment, []),
      conditions: parseJsonField<string[]>(s.conditions, []),
      background: parseJsonField<Record<string, unknown>>(s.background, {}),
      notes: s.notes,
    }
  );

  return NextResponse.json(envelope);
}
