import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LIMITS } from "@/lib/characterTransfer";
import { textIn, nameIn, portraitIn, comGuardas } from "@/lib/sheetPatch";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const character = await prisma.character.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return comGuardas(async () => {
  const body = await req.json();
  const data: Record<string, unknown> = {};

  const nome = nameIn(body.name);
  if (nome !== undefined) data.name = nome;
  // Só texto é aceito (como antes); outros tipos continuam ignorados.
  if (typeof body.notes === "string") data.notes = textIn(body.notes, LIMITS.text, "notes");
  if (typeof body.portraitUrl === "string" || body.portraitUrl === null) {
    data.portraitUrl = portraitIn(body.portraitUrl) || null;
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "Nenhum campo válido." }, { status: 400 });

  await prisma.character.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
