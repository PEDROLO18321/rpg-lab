import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownedCampaign } from "@/lib/campaign/ownership";

// POST — importa ficha de jogador (D&D) para a campanha. Corpo: { token } (shareToken ou id).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await ownedCampaign(id, session.user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) return NextResponse.json({ error: "Informe o código da ficha." }, { status: 400 });

  const character = await prisma.character.findFirst({
    where: { OR: [{ shareToken: token }, { id: token }], system: { slug: "dnd" } },
    include: { dndSheet: true },
  });
  if (!character || !character.dndSheet)
    return NextResponse.json({ error: "Ficha de D&D não encontrada para este código." }, { status: 404 });

  const sheet = character.dndSheet;
  const existing = await prisma.campaignCharacter.findUnique({
    where: { campaignId_characterId: { campaignId: id, characterId: character.id } },
  });
  if (existing) return NextResponse.json({ error: "Esta ficha já foi importada." }, { status: 409 });

  await prisma.campaignCharacter.create({ data: { campaignId: id, characterId: character.id } });

  const combatant = await prisma.dndCombatant.create({
    data: {
      campaignId: id, characterId: character.id, name: character.name,
      initiative: 0, hp: sheet.hpCurrent, maxHp: sheet.hpMax, tempHp: sheet.hpTemp,
      ac: sheet.armorClass, isPlayer: true, order: 0,
    },
  });

  return NextResponse.json({ combatant, name: character.name }, { status: 201 });
}
