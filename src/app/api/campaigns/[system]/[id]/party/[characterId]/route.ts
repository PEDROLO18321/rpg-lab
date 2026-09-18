// Remover uma ficha da lista do mestre. Apaga o vínculo, nunca a ficha.
import { NextRequest, NextResponse } from "next/server";
import { guardSystem } from "@/lib/campaign/routeGuard";
import { unlinkFromCampaign } from "@/lib/party/service";

type Params = { params: Promise<{ system: string; id: string; characterId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { system, id, characterId } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const result = await unlinkFromCampaign(id, characterId, g.userId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true });
}
