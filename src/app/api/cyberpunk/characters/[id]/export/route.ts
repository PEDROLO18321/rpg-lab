import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeEnvelope, parseJsonField } from "@/lib/characterTransfer";

export const FORMAT = "rpglab.cyberpunk.v1";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Filtrar por dono na própria consulta: ficha alheia e inexistente dão o mesmo 404.
  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    include: { cyberpunkSheet: true },
  });
  if (!character || !character.cyberpunkSheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const s = character.cyberpunkSheet;
  const envelope = makeEnvelope(
    FORMAT,
    { name: character.name, portraitUrl: character.portraitUrl, notes: character.notes },
    {
      role: s.role, roleRank: s.roleRank, creationMethod: s.creationMethod,
      int: s.int, ref: s.ref, dex: s.dex, tech: s.tech, cool: s.cool,
      will: s.will, luck: s.luck, move: s.move, body: s.body, emp: s.emp,
      luckCurrent: s.luckCurrent,
      hpMax: s.hpMax, hpCurrent: s.hpCurrent,
      humanityMax: s.humanityMax, humanity: s.humanity,
      deathSavePenalty: s.deathSavePenalty,
      improvementPoints: s.improvementPoints, eurobucks: s.eurobucks, reputation: s.reputation,
      skills: parseJsonField<Record<string, number>>(s.skills, {}),
      armor: parseJsonField<Record<string, unknown>>(s.armor, {}),
      weapons: parseJsonField<unknown[]>(s.weapons, []),
      cyberware: parseJsonField<unknown[]>(s.cyberware, []),
      gear: parseJsonField<unknown[]>(s.gear, []),
      criticalInjuries: parseJsonField<unknown[]>(s.criticalInjuries, []),
      lifepath: parseJsonField<Record<string, unknown>>(s.lifepath, {}),
      background: parseJsonField<Record<string, unknown>>(s.background, {}),
      notes: s.notes,
    }
  );

  return NextResponse.json(envelope);
}
