import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemId } from "@/lib/campaign/ownership";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: session.user.id, system: { slug: "dnd" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, nextSessionAt: true, createdAt: true,
      _count: { select: { dndNpcs: true, dndCombatants: true, dndSessions: true } },
    },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });

  const systemId = await getSystemId("dnd");
  if (!systemId) return NextResponse.json({ error: "Sistema D&D não encontrado." }, { status: 500 });

  const campaign = await prisma.campaign.create({
    data: { ownerId: session.user.id, systemId, name, dndStory: { create: {} } },
    select: { id: true },
  });
  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
