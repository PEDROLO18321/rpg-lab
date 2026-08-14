import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeEnvelope, parseJsonField } from "@/lib/characterTransfer";

export const FORMAT = "rpglab.cthulhu.v1";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    include: { cthulhuSheet: true },
  });
  if (!character || !character.cthulhuSheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const s = character.cthulhuSheet;
  const envelope = makeEnvelope(
    FORMAT,
    { name: character.name, portraitUrl: character.portraitUrl, notes: character.notes },
    {
      occupation: s.occupation, era: s.era, age: s.age,
      atribFor: s.atribFor, atribCon: s.atribCon, atribTam: s.atribTam, atribDes: s.atribDes,
      atribApa: s.atribApa, atribInt: s.atribInt, atribPod: s.atribPod, atribEdu: s.atribEdu,
      sanCurrent: s.sanCurrent, sanMax: s.sanMax, pvMax: s.pvMax, pvCurrent: s.pvCurrent,
      luck: s.luck, mov: s.mov, pmCurrent: s.pmCurrent,
      pvTemp: s.pvTemp, sanTemp: s.sanTemp, pmTemp: s.pmTemp,
      skillChecks: parseJsonField<string[]>(s.skillChecks, []),
      skills: parseJsonField<Record<string, number>>(s.skills, {}),
      background: parseJsonField<Record<string, unknown>>(s.background, {}),
      weapons: parseJsonField<unknown[]>(s.weapons, []),
      equipment: s.equipment,
      notes: s.notes,
      insanityData: parseJsonField<Record<string, unknown> | null>(s.insanityData, null),
      spellsData: parseJsonField<unknown[]>(s.spellsData, []),
    }
  );

  return NextResponse.json(envelope);
}
