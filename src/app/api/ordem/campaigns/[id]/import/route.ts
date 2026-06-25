import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownedCampaign } from "@/lib/ordem/masterServer";

// POST — importa a ficha real de um jogador para a operação.
// Corpo: { token } — shareToken (ou id) do personagem de Ordem do jogador.
// Cria o vínculo CampaignCharacter e semeia combatente + registro de Sanidade.
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
    where: { OR: [{ shareToken: token }, { id: token }], system: { slug: "ordem" } },
    include: { ordemSheet: true },
  });
  if (!character || !character.ordemSheet)
    return NextResponse.json({ error: "Ficha de Ordem não encontrada para este código." }, { status: 404 });

  const sheet = character.ordemSheet;

  // Idempotência: não duplicar o vínculo.
  const existing = await prisma.campaignCharacter.findUnique({
    where: { campaignId_characterId: { campaignId: id, characterId: character.id } },
  });
  if (existing)
    return NextResponse.json({ error: "Esta ficha já foi importada." }, { status: 409 });

  await prisma.campaignCharacter.create({ data: { campaignId: id, characterId: character.id } });

  const combatant = await prisma.ordemCombatant.create({
    data: {
      campaignId: id,
      characterId: character.id,
      name: character.name,
      init: 0,
      pv: sheet.pvCurrent, maxPv: sheet.pvMax,
      pe: sheet.peCurrent, maxPe: sheet.peMax,
      san: sheet.sanCurrent, maxSan: sheet.sanMax,
      rd: 0,
      isPlayer: true,
      order: 0,
    },
  });

  const sanity = await prisma.ordemSanityRecord.create({
    data: {
      campaignId: id,
      characterId: character.id,
      agentName: character.name,
      currentSan: sheet.sanCurrent,
      maxSan: sheet.sanMax,
      status: sheet.sanCurrent <= 0 ? "enlouquecido"
        : sheet.sanCurrent < sheet.sanMax / 2 ? "perturbado" : "normal",
    },
  });

  return NextResponse.json({ combatant, sanity, name: character.name }, { status: 201 });
}
