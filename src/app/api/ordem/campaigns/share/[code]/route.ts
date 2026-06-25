import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — visão pública (somente leitura) da operação para os jogadores.
// Acesso pelo inviteCode da campanha. Expõe apenas o que o mestre revela.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { inviteCode: code },
    select: {
      name: true,
      tier: true,
      ordemStory: { select: { membrana: true, currentArc: true } },
      ordemCombatants: {
        orderBy: { order: "asc" },
        select: { id: true, name: true, init: true, isPlayer: true, conditions: true },
      },
      ordemClocks: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, segments: true, filled: true, kind: true },
      },
      ordemClues: {
        where: { discovered: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, content: true, source: true },
      },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Operação não encontrada." }, { status: 404 });

  return NextResponse.json({ campaign });
}
