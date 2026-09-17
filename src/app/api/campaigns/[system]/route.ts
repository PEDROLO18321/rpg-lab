import { NextRequest, NextResponse } from "next/server";
import { guardSystem } from "@/lib/campaign/routeGuard";
import * as campaigns from "@/lib/campaign/service";

type Params = { params: Promise<{ system: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { system } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const list = await campaigns.listCampaigns(g.system, g.userId);
  return NextResponse.json({ campaigns: list });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { system } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const body = await req.json().catch(() => ({}));
  const result = await campaigns.createCampaign(g.system, g.userId, body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ id: result.id }, { status: 201 });
}
