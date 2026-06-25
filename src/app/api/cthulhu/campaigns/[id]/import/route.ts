import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownedCampaign } from "@/lib/campaign/ownership";

// POST — importa ficha de investigador (Cthulhu). Corpo: { token } (shareToken ou id).
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
    where: { OR: [{ shareToken: token }, { id: token }], system: { slug: "cthulhu" } },
    include: { cthulhuSheet: true },
  });
  if (!character || !character.cthulhuSheet)
    return NextResponse.json({ error: "Ficha de Cthulhu não encontrada para este código." }, { status: 404 });

  const sheet = character.cthulhuSheet;
  const existing = await prisma.campaignCharacter.findUnique({
    where: { campaignId_characterId: { campaignId: id, characterId: character.id } },
  });
  if (existing) return NextResponse.json({ error: "Esta ficha já foi importada." }, { status: 409 });

  await prisma.campaignCharacter.create({ data: { campaignId: id, characterId: character.id } });

  const maxMp = Math.floor(sheet.atribPod / 5);
  const combatant = await prisma.cthulhuCombatant.create({
    data: {
      campaignId: id, characterId: character.id, name: character.name,
      dex: sheet.atribDes, hp: sheet.pvCurrent, maxHp: sheet.pvMax,
      san: sheet.sanCurrent, maxSan: sheet.sanMax, mp: sheet.pmCurrent, maxMp,
      isPlayer: true, order: 0,
    },
  });

  const insanity = await prisma.cthulhuInsanityRecord.create({
    data: {
      campaignId: id, characterId: character.id, investigatorName: character.name,
      currentSan: sheet.sanCurrent, maxSan: sheet.sanMax,
      status: sheet.sanCurrent <= 0 ? "indef_insane" : "normal",
    },
  });

  return NextResponse.json({ combatant, insanity, name: character.name }, { status: 201 });
}
