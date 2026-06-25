import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — visão pública (somente leitura) do cenário Cthulhu para os investigadores.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { inviteCode: code },
    select: {
      name: true,
      cthulhuStory: { select: { currentArc: true } },
      cthulhuCombatants: {
        orderBy: { order: "asc" },
        select: { id: true, name: true, dex: true, isPlayer: true, conditions: true },
      },
      cthulhuClocks: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, segments: true, filled: true, kind: true },
      },
      cthulhuClues: {
        where: { discovered: true }, orderBy: { createdAt: "asc" },
        select: { id: true, title: true, content: true, source: true },
      },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Cenário não encontrado." }, { status: 404 });
  return NextResponse.json({ campaign });
}
