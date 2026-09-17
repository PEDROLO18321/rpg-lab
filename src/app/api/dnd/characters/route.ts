import { NextRequest, NextResponse } from "next/server";
import { authedSystemContext } from "@/lib/apiAuth";
import { createCharacter } from "@/lib/dnd/characterService";

export async function POST(req: NextRequest) {
  const ctx = await authedSystemContext("dnd");
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  try {
    const body = await req.json();
    const result = await createCharacter({ ...body, userId: ctx.userId, systemId: ctx.systemId });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/dnd/characters]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
