import { NextRequest, NextResponse } from "next/server";
import { createCharacter } from "@/lib/dnd/characterService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createCharacter(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/dnd/characters]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
