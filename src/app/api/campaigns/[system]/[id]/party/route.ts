// Fichas de jogadores vinculadas à campanha, na visão do mestre (somente leitura).
// Segmento estático: tem precedência sobre [resource], que é o CRUD genérico.
import { NextRequest, NextResponse } from "next/server";
import { guardSystem } from "@/lib/campaign/routeGuard";
import { listParty } from "@/lib/party/service";

type Params = { params: Promise<{ system: string; id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { system, id } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const result = await listParty(g.system, id, g.userId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ party: result.value });
}
