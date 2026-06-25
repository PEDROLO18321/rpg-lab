import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ownedCampaign } from "@/lib/campaign/ownership";
import { CTHULHU_INCLUDE, CTHULHU_STORY_FIELDS } from "@/lib/cthulhu/masterResources";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, include: CTHULHU_INCLUDE });
  if (!campaign || campaign.ownerId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ campaign });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await ownedCampaign(id, session.user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const campaignData: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) campaignData.name = body.name.trim();
  if (["1920s", "modern", "outro"].includes(body.era)) campaignData.era = body.era;
  if (typeof body.notes === "string") campaignData.notes = body.notes;
  if ("nextSessionAt" in body)
    campaignData.nextSessionAt = body.nextSessionAt ? new Date(body.nextSessionAt) : null;

  const storyData: Record<string, unknown> = {};
  if (body.story && typeof body.story === "object") {
    for (const f of CTHULHU_STORY_FIELDS) if (typeof body.story[f] === "string") storyData[f] = body.story[f];
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      ...campaignData,
      ...(Object.keys(storyData).length
        ? { cthulhuStory: { upsert: { create: storyData, update: storyData } } } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await ownedCampaign(id, session.user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
