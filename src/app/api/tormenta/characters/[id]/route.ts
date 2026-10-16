import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toJsonFieldOrNull, LIMITS } from "@/lib/characterTransfer";
import { MAX_LEVEL } from "@/lib/tormenta/leveling";
import { numIn, textIn, nameIn, portraitIn, comGuardas } from "@/lib/sheetPatch";

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

  return comGuardas(async () => {
  const body = await req.json();
  const {
    pvCurrent, pvTemp, pmCurrent, pmTemp, money, notes,
    skills, spellsKnown, schoolsChosen, weapons, equipment, conditions, background,
    name, portraitUrl,
    forca, des, con, int, sab, car, level, xp, pvMax, pmMax, defense, movement,
  } = body;

  // Faixas do sistema. Vitais aceitam negativo porque o personagem pode estar
  // com PV abaixo de zero (morrendo); máximos e atributos, não.
  const campos = {
    pvCurrent: numIn(pvCurrent, -999, 9_999, "pvCurrent"),
    pvTemp:    numIn(pvTemp,       0, 9_999, "pvTemp"),
    pmCurrent: numIn(pmCurrent, -999, 9_999, "pmCurrent"),
    pmTemp:    numIn(pmTemp,       0, 9_999, "pmTemp"),
    money:     numIn(money,        0, 1_000_000_000, "money"),
    forca:     numIn(forca,        0, 99, "forca"),
    des:       numIn(des,          0, 99, "des"),
    con:       numIn(con,          0, 99, "con"),
    int:       numIn(int,          0, 99, "int"),
    sab:       numIn(sab,          0, 99, "sab"),
    car:       numIn(car,          0, 99, "car"),
    level:     numIn(level,        1, MAX_LEVEL, "level"),
    xp:        numIn(xp,           0, 1_000_000, "xp"),
    pvMax:     numIn(pvMax,        1, 9_999, "pvMax"),
    pmMax:     numIn(pmMax,        0, 9_999, "pmMax"),
    defense:   numIn(defense,      0, 999, "defense"),
    movement:  numIn(movement,     0, 999, "movement"),
  };

  const sheetData = {
    ...Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== undefined)),
    ...(notes !== undefined ? { notes: textIn(notes, LIMITS.text, "notes") } : {}),
    ...(skills        !== undefined ? { skills: toJsonFieldOrNull(skills) } : {}),
    ...(spellsKnown   !== undefined ? { spellsKnown: toJsonFieldOrNull(spellsKnown) } : {}),
    ...(schoolsChosen !== undefined ? { schoolsChosen: toJsonFieldOrNull(schoolsChosen) } : {}),
    ...(weapons       !== undefined ? { weapons: toJsonFieldOrNull(weapons) } : {}),
    ...(equipment     !== undefined ? { equipment: toJsonFieldOrNull(equipment) } : {}),
    ...(conditions    !== undefined ? { conditions: toJsonFieldOrNull(conditions) } : {}),
    ...(background    !== undefined ? { background: toJsonFieldOrNull(background) } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  const nome = nameIn(name);
  if (nome !== undefined) charUpdates.name = nome;
  const retrato = portraitIn(portraitUrl);
  if (retrato !== undefined) charUpdates.portraitUrl = retrato;

  await prisma.$transaction([
    prisma.tormentaSheet.update({ where: { id }, data: sheetData }),
    ...(Object.keys(charUpdates).length > 0 ? [prisma.character.update({ where: { id }, data: charUpdates })] : []),
  ]);

  return NextResponse.json({ ok: true });
  });
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
