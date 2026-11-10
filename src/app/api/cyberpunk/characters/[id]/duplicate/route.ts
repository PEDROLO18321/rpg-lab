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
  const original = await prisma.character.findUnique({
    where: { id },
    include: { cyberpunkSheet: true },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (original.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s = original.cyberpunkSheet;

  const copy = await prisma.character.create({
    data: {
      userId: original.userId,
      systemId: original.systemId,
      name: `${original.name} (cópia)`,
      portraitUrl: original.portraitUrl,
      notes: original.notes,
      ...(s
        ? {
            cyberpunkSheet: {
              create: {
                role: s.role,
                roleRank: s.roleRank,
                creationMethod: s.creationMethod,
                int: s.int, ref: s.ref, dex: s.dex, tech: s.tech, cool: s.cool,
                will: s.will, luck: s.luck, move: s.move, body: s.body, emp: s.emp,
                luckCurrent: s.luckCurrent,
                hpMax: s.hpMax,
                hpCurrent: s.hpCurrent,
                humanityMax: s.humanityMax,
                humanity: s.humanity,
                deathSavePenalty: s.deathSavePenalty,
                improvementPoints: s.improvementPoints,
                eurobucks: s.eurobucks,
                reputation: s.reputation,
                skills: jsonIn(s.skills),
                armor: jsonIn(s.armor),
                weapons: jsonIn(s.weapons),
                cyberware: jsonIn(s.cyberware),
                gear: jsonIn(s.gear),
                criticalInjuries: jsonIn(s.criticalInjuries),
                lifepath: jsonIn(s.lifepath),
                background: jsonIn(s.background),
                notes: s.notes,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, id: copy.id });
}
