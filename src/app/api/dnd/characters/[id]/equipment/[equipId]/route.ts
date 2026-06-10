import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize(charId: string, equipId: string, userId: string) {
  const item = await prisma.dndEquipment.findUnique({
    where: { id: equipId },
    include: { sheet: { include: { character: { select: { userId: true, id: true } } } } },
  });
  if (!item) return null;
  if (item.sheet.character.id !== charId) return null;
  if (item.sheet.character.userId !== userId) return null;
  return item;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; equipId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, equipId } = await params;
  const item = await authorize(id, equipId, session.user.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { quantity, equipped, itemName } = await req.json();
  const data: Record<string, unknown> = {};
  if (quantity !== undefined) data.quantity = quantity;
  if (equipped !== undefined) data.equipped = equipped;
  if (itemName !== undefined) data.itemName = itemName;

  const updated = await prisma.dndEquipment.update({ where: { id: equipId }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; equipId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, equipId } = await params;
  const item = await authorize(id, equipId, session.user.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.dndEquipment.delete({ where: { id: equipId } });
  return NextResponse.json({ ok: true });
}
