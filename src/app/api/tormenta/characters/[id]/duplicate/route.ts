import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonIn } from "@/lib/characterTransfer";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.character.findUnique({ where: { id }, include: { tormentaSheet: true } });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (original.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s = original.tormentaSheet;

  const copy = await prisma.character.create({
    data: {
      userId: original.userId,
      systemId: original.systemId,
      name: `${original.name} (cópia)`,
      portraitUrl: original.portraitUrl,
      notes: original.notes,
      ...(s
        ? {
            tormentaSheet: {
              create: {
                race: s.race, raceVariant: s.raceVariant, className: s.className, path: s.path,
                origin: s.origin, godId: s.godId, level: s.level, xp: s.xp,
                forca: s.forca, des: s.des, con: s.con, int: s.int, sab: s.sab, car: s.car,
                pvMax: s.pvMax, pvCurrent: s.pvCurrent, pvTemp: s.pvTemp,
                pmMax: s.pmMax, pmCurrent: s.pmCurrent, pmTemp: s.pmTemp,
                defense: s.defense, movement: s.movement, money: s.money,
                skills: jsonIn(s.skills), schoolsChosen: jsonIn(s.schoolsChosen), spellsKnown: jsonIn(s.spellsKnown),
                weapons: jsonIn(s.weapons), equipment: jsonIn(s.equipment), conditions: jsonIn(s.conditions),
                background: jsonIn(s.background), notes: s.notes,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, id: copy.id });
}
