import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownedCampaign, pickFields } from "@/lib/campaign/ownership";
import { CTHULHU_RESOURCES } from "@/lib/cthulhu/masterResources";

async function guard(params: Promise<{ id: string; resource: string; itemId: string }>) {
  const session = await auth();
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { id, resource, itemId } = await params;
  const cfg = CTHULHU_RESOURCES[resource];
  if (!cfg) return { error: NextResponse.json({ error: "Recurso inválido." }, { status: 404 }) };
  if (!(await ownedCampaign(id, session.user.id)))
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  return { cfg, id, itemId };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resource: string; itemId: string }> },
) {
  const g = await guard(params);
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  const data = pickFields(body, g.cfg!.fields);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[g.cfg!.delegate];
  const existing = await delegate.findUnique({ where: { id: g.itemId }, select: { campaignId: true } });
  if (!existing || existing.campaignId !== g.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const item = await delegate.update({ where: { id: g.itemId }, data });
  return NextResponse.json({ item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; resource: string; itemId: string }> },
) {
  const g = await guard(params);
  if (g.error) return g.error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[g.cfg!.delegate];
  const existing = await delegate.findUnique({ where: { id: g.itemId }, select: { campaignId: true } });
  if (!existing || existing.campaignId !== g.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await delegate.delete({ where: { id: g.itemId } });
  return NextResponse.json({ ok: true });
}
