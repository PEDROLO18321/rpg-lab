import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeEnvelope, parseJsonField } from "@/lib/characterTransfer";

export const FORMAT = "rpglab.starwars.v1";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    include: { starWarsSheet: true },
  });
  if (!character || !character.starWarsSheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const s = character.starWarsSheet;
  const envelope = makeEnvelope(
    FORMAT,
    { name: character.name, portraitUrl: character.portraitUrl, notes: character.notes },
    {
      species: s.species, planet: s.planet, planetSkillChoice: s.planetSkillChoice, path: s.path,
      classes: parseJsonField<Record<string, number>>(s.classes, {}),
      level: s.level, xp: s.xp,
      humanAttrChoice: parseJsonField<Record<string, unknown> | null>(s.humanAttrChoice, null),
      agi: s.agi, int: s.int, forca: s.forca, vig: s.vig, pre: s.pre, sen: s.sen,
      pvMax: s.pvMax, pvClassSum: s.pvClassSum, pvLevelGain: s.pvLevelGain, pvCurrent: s.pvCurrent, pvTemp: s.pvTemp,
      peMax: s.peMax, peCurrent: s.peCurrent, peTemp: s.peTemp,
      ppMax: s.ppMax, ppCurrent: s.ppCurrent, ppTemp: s.ppTemp,
      sabreForm: s.sabreForm,
      unlockedProphecies: parseJsonField<string[]>(s.unlockedProphecies, []),
      skills: parseJsonField<Record<string, string>>(s.skills, {}),
      classPowers: parseJsonField<unknown[]>(s.classPowers, []),
      generalPowers: parseJsonField<string[]>(s.generalPowers, []),
      equipment: parseJsonField<unknown[]>(s.equipment, []),
      weapons: parseJsonField<unknown[]>(s.weapons, []),
      conditions: parseJsonField<string[]>(s.conditions, []),
      background: parseJsonField<Record<string, unknown>>(s.background, {}),
      notes: s.notes,
    }
  );

  return NextResponse.json(envelope);
}
