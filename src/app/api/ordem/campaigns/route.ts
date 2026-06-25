import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrdemSystemId } from "@/lib/ordem/masterServer";

// GET — lista operações do mestre (com contadores).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: session.user.id, system: { slug: "ordem" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, tier: true, nextSessionAt: true, createdAt: true,
      _count: { select: { ordemNpcs: true, ordemCombatants: true, ordemSessions: true } },
    },
  });

  return NextResponse.json({ campaigns });
}

// POST — cria operação.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const tier = ["1", "2", "3", "4"].includes(body.tier) ? body.tier : "1";
  if (!name) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });

  const systemId = await getOrdemSystemId();
  if (!systemId) return NextResponse.json({ error: "Sistema Ordem não encontrado." }, { status: 500 });

  const campaign = await prisma.campaign.create({
    data: {
      ownerId: session.user.id,
      systemId,
      name,
      tier,
      ordemStory: { create: {} },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
