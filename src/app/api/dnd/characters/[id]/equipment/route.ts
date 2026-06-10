import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSheet(charId: string, userId: string) {
  const character = await prisma.character.findUnique({
    where: { id: charId },
    select: { userId: true, dndSheet: { select: { id: true } } },
  });
  if (!character || character.userId !== userId || !character.dndSheet) return null;
  return character.dndSheet.id;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sheetId = await getSheet(id, session.user.id);
  if (!sheetId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { itemName, quantity = 1, equipped = false } = await req.json();
  if (!itemName?.trim()) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });

  const item = await prisma.dndEquipment.create({
    data: { sheetId, itemName: itemName.trim(), quantity, equipped },
  });
  return NextResponse.json(item, { status: 201 });
}
