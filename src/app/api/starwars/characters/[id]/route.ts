import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    pvCurrent, pvTemp, peCurrent, peTemp, ppCurrent, ppTemp, notes,
    skills, classPowers, generalPowers, equipment, weapons, conditions, background, sabreForm,
    name, portraitUrl, planetSkillChoice,
    agi, int, forca, vig, pre, sen, level, xp, pvMax, peMax, ppMax, classes,
  } = body;

  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

  const sheetData = {
    ...(num(pvCurrent) !== undefined ? { pvCurrent } : {}),
    ...(num(pvTemp)    !== undefined ? { pvTemp }    : {}),
    ...(num(peCurrent) !== undefined ? { peCurrent } : {}),
    ...(num(peTemp)    !== undefined ? { peTemp }    : {}),
    ...(num(ppCurrent) !== undefined ? { ppCurrent } : {}),
    ...(num(ppTemp)    !== undefined ? { ppTemp }    : {}),
    ...(num(agi)       !== undefined ? { agi }       : {}),
    ...(num(int)       !== undefined ? { int }       : {}),
    ...(num(forca)     !== undefined ? { forca }     : {}),
    ...(num(vig)       !== undefined ? { vig }       : {}),
    ...(num(pre)       !== undefined ? { pre }       : {}),
    ...(num(sen)       !== undefined ? { sen }       : {}),
    ...(num(level)     !== undefined ? { level }     : {}),
    ...(num(xp)        !== undefined ? { xp }        : {}),
    ...(num(pvMax)     !== undefined ? { pvMax }     : {}),
    ...(num(peMax)     !== undefined ? { peMax }     : {}),
    ...(num(ppMax)     !== undefined ? { ppMax }     : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(sabreForm !== undefined ? { sabreForm } : {}),
    ...(planetSkillChoice !== undefined ? { planetSkillChoice } : {}),
    ...(classes       !== undefined ? { classes: classes ? JSON.stringify(classes) : "{}" } : {}),
    ...(skills        !== undefined ? { skills: skills ? JSON.stringify(skills) : null } : {}),
    ...(classPowers   !== undefined ? { classPowers: classPowers ? JSON.stringify(classPowers) : null } : {}),
    ...(generalPowers !== undefined ? { generalPowers: generalPowers ? JSON.stringify(generalPowers) : null } : {}),
    ...(weapons       !== undefined ? { weapons: weapons ? JSON.stringify(weapons) : null } : {}),
    ...(equipment     !== undefined ? { equipment: equipment ? JSON.stringify(equipment) : null } : {}),
    ...(conditions    !== undefined ? { conditions: conditions ? JSON.stringify(conditions) : null } : {}),
    ...(background    !== undefined ? { background: background ? JSON.stringify(background) : null } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) charUpdates.name = name.trim();
  if (portraitUrl !== undefined) charUpdates.portraitUrl = portraitUrl;

  await prisma.$transaction([
    prisma.starWarsSheet.update({ where: { id }, data: sheetData }),
    ...(Object.keys(charUpdates).length > 0 ? [prisma.character.update({ where: { id }, data: charUpdates })] : []),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (character.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
