import { NextRequest, NextResponse } from "next/server";
import { guardSystem } from "@/lib/campaign/routeGuard";
import * as campaigns from "@/lib/campaign/service";

type Params = { params: Promise<{ system: string; id: string; resource: string; itemId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { system, id, resource, itemId } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const body = await req.json().catch(() => ({}));
  const result = await campaigns.updateChild(g.system, id, resource, itemId, g.userId, body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ item: result.value });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { system, id, resource, itemId } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const result = await campaigns.deleteChild(g.system, id, resource, itemId, g.userId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true });
}
