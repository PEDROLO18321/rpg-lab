import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    nex, patente, prestige, affinity, trail, origin, className,
    agi, forca, int, pre, vig,
    pvMax, pvCurrent, pvTemp, peMax, peCurrent, peTemp, sanMax, sanCurrent, sanTemp,
    defense, movement,
    skills, abilities, rituals, inventory, weapons, background, conditions, insanity,
    notes, name, portraitUrl,
  } = body;

  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

  const sheetData = {
    ...(num(nex)        !== undefined ? { nex }        : {}),
    ...(num(prestige)   !== undefined ? { prestige }   : {}),
    ...(num(agi)        !== undefined ? { agi }        : {}),
    ...(num(forca)      !== undefined ? { forca }      : {}),
    ...(num(int)        !== undefined ? { int }        : {}),
    ...(num(pre)        !== undefined ? { pre }        : {}),
    ...(num(vig)        !== undefined ? { vig }        : {}),
    ...(num(pvMax)      !== undefined ? { pvMax }      : {}),
    ...(num(pvCurrent)  !== undefined ? { pvCurrent }  : {}),
    ...(num(pvTemp)     !== undefined ? { pvTemp }     : {}),
    ...(num(peMax)      !== undefined ? { peMax }      : {}),
    ...(num(peCurrent)  !== undefined ? { peCurrent }  : {}),
    ...(num(peTemp)     !== undefined ? { peTemp }     : {}),
    ...(num(sanMax)     !== undefined ? { sanMax }     : {}),
    ...(num(sanCurrent) !== undefined ? { sanCurrent } : {}),
    ...(num(sanTemp)    !== undefined ? { sanTemp }    : {}),
    ...(num(defense)    !== undefined ? { defense }    : {}),
    ...(num(movement)   !== undefined ? { movement }   : {}),
    ...(patente   !== undefined ? { patente }   : {}),
    ...(affinity  !== undefined ? { affinity }  : {}),
    ...(trail     !== undefined ? { trail }     : {}),
    ...(origin    !== undefined ? { origin }    : {}),
    ...(className !== undefined ? { className } : {}),
    ...(notes     !== undefined ? { notes }     : {}),
    ...(skills     !== undefined ? { skills:     skills     ? JSON.stringify(skills)     : null } : {}),
    ...(abilities  !== undefined ? { abilities:  abilities  ? JSON.stringify(abilities)  : null } : {}),
    ...(rituals    !== undefined ? { rituals:    rituals    ? JSON.stringify(rituals)    : null } : {}),
    ...(inventory  !== undefined ? { inventory:  inventory  ? JSON.stringify(inventory)  : null } : {}),
    ...(weapons    !== undefined ? { weapons:    weapons    ? JSON.stringify(weapons)    : null } : {}),
    ...(background !== undefined ? { background: background ? JSON.stringify(background) : null } : {}),
    ...(conditions !== undefined ? { conditions: conditions ? JSON.stringify(conditions) : null } : {}),
    ...(insanity   !== undefined ? { insanity:   insanity   ? JSON.stringify(insanity)   : null } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) charUpdates.name = name.trim();
  if (portraitUrl !== undefined) charUpdates.portraitUrl = portraitUrl;

  await prisma.$transaction([
    prisma.ordemSheet.update({ where: { id }, data: sheetData }),
    ...(Object.keys(charUpdates).length > 0
      ? [prisma.character.update({ where: { id }, data: charUpdates })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
