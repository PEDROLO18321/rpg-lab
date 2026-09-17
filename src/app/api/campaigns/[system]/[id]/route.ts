import { NextRequest, NextResponse } from "next/server";
import { guardSystem, notFound } from "@/lib/campaign/routeGuard";
import * as campaigns from "@/lib/campaign/service";

type Params = { params: Promise<{ system: string; id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { system, id } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const campaign = await campaigns.getCampaign(g.system, id, g.userId);
  if (!campaign) return notFound();
  return NextResponse.json({ campaign });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { system, id } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const body = await req.json().catch(() => ({}));
  const ok = await campaigns.patchCampaign(g.system, id, g.userId, body);
  if (!ok) return notFound();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { system, id } = await params;
  const g = await guardSystem(system);
  if (!g.ok) return g.response;

  const ok = await campaigns.deleteCampaign(id, g.userId);
  if (!ok) return notFound();
  return NextResponse.json({ ok: true });
}
