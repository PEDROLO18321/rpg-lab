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
  const character = await prisma.character.findUnique({
    where: { id },
    select: { userId: true, dndSheet: { select: { id: true } } },
  });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!character.dndSheet) return NextResponse.json({ error: "No sheet" }, { status: 404 });

  const body = await req.json();

  const allowed = [
    "hpCurrent", "hpTemp", "hitDiceUsed", "deathSavesSuccess", "deathSavesFailure",
    "inspiration", "conditions", "spellSlotsUsed",
    "gp", "cp", "sp", "ep", "pp",
    "str", "dex", "con", "int", "wis", "cha",
    "armorClass", "speed", "hpMax", "xp", "level",
    "spellAbility",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "Nenhum campo válido." }, { status: 400 });

  await prisma.dndSheet.update({ where: { id: character.dndSheet.id }, data });
  return NextResponse.json({ ok: true });
}
