import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownedCampaign, pickFields } from "@/lib/campaign/ownership";
import { CTHULHU_RESOURCES } from "@/lib/cthulhu/masterResources";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resource: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, resource } = await params;

  const cfg = CTHULHU_RESOURCES[resource];
  if (!cfg) return NextResponse.json({ error: "Recurso inválido." }, { status: 404 });
  if (!(await ownedCampaign(id, session.user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data = pickFields(body, cfg.fields);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await (prisma as any)[cfg.delegate].create({ data: { ...data, campaignId: id } });
  return NextResponse.json({ item: created }, { status: 201 });
}
