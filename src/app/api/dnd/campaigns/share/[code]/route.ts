import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — visão pública (somente leitura) da campanha D&D para os jogadores.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { inviteCode: code },
    select: {
      name: true,
      dndStory: { select: { currentArc: true } },
      dndCombatants: {
        orderBy: { order: "asc" },
        select: { id: true, name: true, initiative: true, isPlayer: true, conditions: true },
      },
      dndClocks: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, segments: true, filled: true, kind: true },
      },
      dndClues: {
        where: { discovered: true }, orderBy: { createdAt: "asc" },
        select: { id: true, title: true, content: true, source: true },
      },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  return NextResponse.json({ campaign });
}
