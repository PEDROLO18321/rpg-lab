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
    pvCurrent, pvTemp, pmCurrent, pmTemp, money, notes,
    skills, spellsKnown, schoolsChosen, weapons, equipment, conditions, background,
    name, portraitUrl,
    forca, des, con, int, sab, car, level, xp, pvMax, pmMax, defense, movement,
  } = body;

  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

  const sheetData = {
    ...(num(pvCurrent) !== undefined ? { pvCurrent } : {}),
    ...(num(pvTemp)    !== undefined ? { pvTemp }    : {}),
    ...(num(pmCurrent) !== undefined ? { pmCurrent } : {}),
    ...(num(pmTemp)    !== undefined ? { pmTemp }    : {}),
    ...(num(money)     !== undefined ? { money }     : {}),
    ...(num(forca)     !== undefined ? { forca }     : {}),
    ...(num(des)       !== undefined ? { des }       : {}),
    ...(num(con)       !== undefined ? { con }       : {}),
    ...(num(int)       !== undefined ? { int }       : {}),
    ...(num(sab)       !== undefined ? { sab }       : {}),
    ...(num(car)       !== undefined ? { car }       : {}),
    ...(num(level)     !== undefined ? { level }     : {}),
    ...(num(xp)        !== undefined ? { xp }        : {}),
    ...(num(pvMax)     !== undefined ? { pvMax }     : {}),
    ...(num(pmMax)     !== undefined ? { pmMax }     : {}),
    ...(num(defense)   !== undefined ? { defense }   : {}),
    ...(num(movement)  !== undefined ? { movement }  : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(skills        !== undefined ? { skills: skills ? JSON.stringify(skills) : null } : {}),
    ...(spellsKnown   !== undefined ? { spellsKnown: spellsKnown ? JSON.stringify(spellsKnown) : null } : {}),
    ...(schoolsChosen !== undefined ? { schoolsChosen: schoolsChosen ? JSON.stringify(schoolsChosen) : null } : {}),
    ...(weapons       !== undefined ? { weapons: weapons ? JSON.stringify(weapons) : null } : {}),
    ...(equipment     !== undefined ? { equipment: equipment ? JSON.stringify(equipment) : null } : {}),
    ...(conditions    !== undefined ? { conditions: conditions ? JSON.stringify(conditions) : null } : {}),
    ...(background    !== undefined ? { background: background ? JSON.stringify(background) : null } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) charUpdates.name = name.trim();
  if (portraitUrl !== undefined) charUpdates.portraitUrl = portraitUrl;

  await prisma.$transaction([
    prisma.tormentaSheet.update({ where: { id }, data: sheetData }),
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
