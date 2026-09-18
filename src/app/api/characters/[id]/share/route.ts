// Compartilhamento da ficha pelo jogador: ligar, desligar e regerar o link.
// Só o dono da ficha chega aqui — a identidade vem da sessão, nunca do corpo.
import { NextRequest, NextResponse } from "next/server";
import { authedCharacter } from "@/lib/apiAuth";
import { enableShare, disableShare, shareState } from "@/lib/party/service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authedCharacter(id);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const state = await shareState(id);
  if (!state) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    enabled: state.isPublic,
    token: state.isPublic ? state.shareToken : null,
    linkedCampaigns: state._count.campaignCharacters,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authedCharacter(id);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const token = await enableShare(id, body.regenerate === true);

  return NextResponse.json({ enabled: true, token });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authedCharacter(id);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await disableShare(id);
  return NextResponse.json({ enabled: false, token: null });
}
