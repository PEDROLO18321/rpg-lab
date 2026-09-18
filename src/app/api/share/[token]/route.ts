// Lado de quem recebe o link: descobre de qual ficha e sistema ele é (GET) e
// anexa a ficha a uma campanha própria do mesmo sistema (POST).
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resolveShare, linkToCampaign } from "@/lib/party/service";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const result = await resolveShare(token, session.user.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json(result.value);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.campaignId !== "string" || !body.campaignId) {
    return NextResponse.json({ error: "Escolha uma campanha." }, { status: 400 });
  }

  const result = await linkToCampaign(token, body.campaignId, session.user.id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true, ...result.value });
}
