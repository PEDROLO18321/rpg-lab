import { NextRequest, NextResponse } from "next/server";
import { guardSystem } from "@/lib/campaign/routeGuard";
import * as campaigns from "@/lib/campaign/service";

type Params = { params: Promise<{ system: string; id: string; resource: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { system, id, resource } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const body = await req.json().catch(() => ({}));
  const result = await campaigns.createChild(g.system, id, resource, g.userId, body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ item: result.value }, { status: 201 });
}
