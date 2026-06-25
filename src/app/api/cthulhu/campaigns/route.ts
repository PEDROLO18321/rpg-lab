import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemId } from "@/lib/campaign/ownership";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: session.user.id, system: { slug: "cthulhu" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, era: true, nextSessionAt: true, createdAt: true,
      _count: { select: { cthulhuNpcs: true, cthulhuCombatants: true, cthulhuSessions: true } },
    },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const era = ["1920s", "modern", "outro"].includes(body.era) ? body.era : "1920s";
  if (!name) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });

  const systemId = await getSystemId("cthulhu");
  if (!systemId) return NextResponse.json({ error: "Sistema Cthulhu não encontrado." }, { status: 500 });

  const campaign = await prisma.campaign.create({
    data: { ownerId: session.user.id, systemId, name, era, cthulhuStory: { create: {} } },
    select: { id: true },
  });
  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
