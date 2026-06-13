import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SPELLS } from "@/lib/dnd/spells";

/** Adiciona uma magia do catálogo à ficha. Body: { spellId: string } */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({
    where: { id },
    select: {
      userId: true,
      dndSheet: { select: { id: true, spells: { select: { spellName: true } } } },
    },
  });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!character.dndSheet) return NextResponse.json({ error: "No sheet" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const spell = SPELLS.find((s) => s.id === body.spellId);
  if (!spell) return NextResponse.json({ error: "Magia não encontrada." }, { status: 400 });

  const known = new Set(character.dndSheet.spells.map((s) => s.spellName.toLowerCase()));
  if (known.has(spell.name.toLowerCase()))
    return NextResponse.json({ error: "Magia já conhecida." }, { status: 400 });

  const row = await prisma.dndSpell.create({
    data: {
      sheetId: character.dndSheet.id,
      spellName: spell.name,
      level: spell.level,
      school: spell.school,
      prepared: spell.level === 0,
      description: spell.description,
      castingTime: spell.castingTime,
      range: spell.range,
      duration: spell.duration,
    },
  });

  return NextResponse.json({
    ok: true,
    spell: {
      id: row.id,
      spellName: row.spellName,
      level: row.level,
      school: row.school,
      prepared: row.prepared,
      castingTime: row.castingTime,
      range: row.range,
      duration: row.duration,
    },
  });
}
