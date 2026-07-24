import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.character.findUnique({ where: { id }, include: { starWarsSheet: true } });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (original.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s = original.starWarsSheet;

  const copy = await prisma.character.create({
    data: {
      userId: original.userId,
      systemId: original.systemId,
      name: `${original.name} (cópia)`,
      portraitUrl: original.portraitUrl,
      notes: original.notes,
      ...(s
        ? {
            starWarsSheet: {
              create: {
                species: s.species, planet: s.planet, planetSkillChoice: s.planetSkillChoice, path: s.path, classes: s.classes,
                level: s.level, xp: s.xp, humanAttrChoice: s.humanAttrChoice,
                agi: s.agi, int: s.int, forca: s.forca, vig: s.vig, pre: s.pre, sen: s.sen,
                pvMax: s.pvMax, pvCurrent: s.pvCurrent, pvTemp: s.pvTemp,
                peMax: s.peMax, peCurrent: s.peCurrent, peTemp: s.peTemp,
                ppMax: s.ppMax, ppCurrent: s.ppCurrent, ppTemp: s.ppTemp,
                sabreForm: s.sabreForm,
                skills: s.skills, classPowers: s.classPowers, generalPowers: s.generalPowers,
                weapons: s.weapons, equipment: s.equipment, conditions: s.conditions,
                background: s.background, notes: s.notes,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, id: copy.id });
}
