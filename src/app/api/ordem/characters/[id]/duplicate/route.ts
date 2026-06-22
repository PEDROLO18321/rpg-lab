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
  const original = await prisma.character.findUnique({
    where: { id },
    include: { ordemSheet: true },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (original.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s = original.ordemSheet;

  const copy = await prisma.character.create({
    data: {
      userId: original.userId,
      systemId: original.systemId,
      name: `${original.name} (cópia)`,
      portraitUrl: original.portraitUrl,
      notes: original.notes,
      ...(s
        ? {
            ordemSheet: {
              create: {
                origin: s.origin,
                className: s.className,
                trail: s.trail,
                nex: s.nex,
                patente: s.patente,
                agi: s.agi, forca: s.forca, int: s.int, pre: s.pre, vig: s.vig,
                pvMax: s.pvMax, pvCurrent: s.pvCurrent, pvTemp: s.pvTemp,
                peMax: s.peMax, peCurrent: s.peCurrent, peTemp: s.peTemp,
                sanMax: s.sanMax, sanCurrent: s.sanCurrent, sanTemp: s.sanTemp,
                defense: s.defense, movement: s.movement,
                prestige: s.prestige, affinity: s.affinity,
                skills: s.skills, abilities: s.abilities, rituals: s.rituals,
                inventory: s.inventory, weapons: s.weapons, background: s.background,
                conditions: s.conditions, insanity: s.insanity, notes: s.notes,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, id: copy.id });
}
