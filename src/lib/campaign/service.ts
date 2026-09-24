// ─── Camada de servidor da área do Mestre ────────────────────────────────────
// Um único conjunto de operações serve os cinco sistemas, guiado pelo registro.
// A resposta é *normalizada*: o front recebe sempre `story`, `npcs`,
// `combatants`… em vez dos nomes de relação do Prisma (`dndNpcs`, `ordemStory`).
import { prisma } from "@/lib/prisma";
import { getSystemId, ownedCampaign, pickFields } from "@/lib/campaign/ownership";
import { CAMPAIGNS, type CampaignConfig, type SystemKey } from "@/lib/campaign/registry";

// O acesso dinâmico a delegates/relações do Prisma é intrinsecamente dinâmico:
// o nome vem do registro. As whitelists do registro garantem a segurança.
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyRecord = Record<string, any>;

function delegateFor(name: string): AnyRecord {
  return (prisma as unknown as AnyRecord)[name];
}

/** Monta o `include` do Prisma a partir do registro. */
function buildInclude(cfg: CampaignConfig): AnyRecord {
  const include: AnyRecord = { [cfg.storyRelation]: true };
  for (const res of Object.values(cfg.resources)) {
    include[res.relation] = res.orderBy ? { orderBy: res.orderBy } : true;
  }
  return include;
}

/** Troca nomes de relação do Prisma pelas chaves genéricas do front. */
function normalize(cfg: CampaignConfig, row: AnyRecord): AnyRecord {
  const out: AnyRecord = {
    id: row.id,
    name: row.name,
    inviteCode: row.inviteCode,
    notes: row.notes,
    nextSessionAt: row.nextSessionAt,
    createdAt: row.createdAt,
    story: row[cfg.storyRelation] ?? null,
  };
  for (const [key, res] of Object.entries(cfg.resources)) {
    out[key] = row[res.relation] ?? [];
  }
  for (const field of Object.keys(cfg.enumFields ?? {})) {
    out[field] = row[field];
  }
  return out;
}

export function configFor(system: SystemKey): CampaignConfig {
  return CAMPAIGNS[system];
}

// ── Campanhas ────────────────────────────────────────────────────────────────

export async function listCampaigns(system: SystemKey, userId: string) {
  const cfg = CAMPAIGNS[system];
  const countSelect: AnyRecord = {};
  for (const key of cfg.counts) countSelect[cfg.resources[key].relation] = true;

  const rows = await prisma.campaign.findMany({
    where: { ownerId: userId, system: { slug: cfg.slug } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, nextSessionAt: true, createdAt: true,
      ...Object.fromEntries(Object.keys(cfg.enumFields ?? {}).map((f) => [f, true])),
      _count: { select: countSelect },
    },
  });

  // Conta normalizada: { npcs, combatants, sessions }.
  return rows.map((row) => {
    const r = row as AnyRecord;
    const counts: AnyRecord = {};
    for (const key of cfg.counts) counts[key] = r._count[cfg.resources[key].relation] ?? 0;
    const { _count, ...rest } = r;
    void _count;
    return { ...rest, counts };
  });
}

export async function createCampaign(
  system: SystemKey,
  userId: string,
  body: AnyRecord,
): Promise<{ ok: true; id: string } | { ok: false; error: string; status: number }> {
  const cfg = CAMPAIGNS[system];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { ok: false, error: "Nome obrigatório.", status: 400 };

  const systemId = await getSystemId(cfg.slug);
  if (!systemId) return { ok: false, error: `Sistema ${cfg.label} não encontrado.`, status: 500 };

  const extra: AnyRecord = {};
  for (const [field, allowed] of Object.entries(cfg.enumFields ?? {})) {
    extra[field] = allowed.includes(body[field]) ? body[field] : allowed[0];
  }

  const campaign = await prisma.campaign.create({
    data: {
      ownerId: userId, systemId, name, ...extra,
      [cfg.storyRelation]: { create: {} },
    } as never,
    select: { id: true },
  });
  return { ok: true, id: campaign.id };
}

export async function getCampaign(system: SystemKey, campaignId: string, userId: string) {
  const cfg = CAMPAIGNS[system];
  const row = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: buildInclude(cfg) as never,
  });
  if (!row || row.ownerId !== userId) return null;
  return normalize(cfg, row as AnyRecord);
}

export async function patchCampaign(
  system: SystemKey,
  campaignId: string,
  userId: string,
  body: AnyRecord,
): Promise<boolean> {
  const cfg = CAMPAIGNS[system];
  if (!(await ownedCampaign(campaignId, userId))) return false;

  const data: AnyRecord = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.notes === "string") data.notes = body.notes;
  if ("nextSessionAt" in body) {
    data.nextSessionAt = body.nextSessionAt ? new Date(body.nextSessionAt) : null;
  }
  for (const [field, allowed] of Object.entries(cfg.enumFields ?? {})) {
    if (allowed.includes(body[field])) data[field] = body[field];
  }

  const storyData: AnyRecord = {};
  if (body.story && typeof body.story === "object") {
    for (const f of cfg.storyFields) {
      if (typeof body.story[f] === "string") storyData[f] = body.story[f];
    }
  }
  if (Object.keys(storyData).length) {
    data[cfg.storyRelation] = { upsert: { create: storyData, update: storyData } };
  }

  await prisma.campaign.update({ where: { id: campaignId }, data });
  return true;
}

export async function deleteCampaign(campaignId: string, userId: string): Promise<boolean> {
  if (!(await ownedCampaign(campaignId, userId))) return false;
  await prisma.campaign.delete({ where: { id: campaignId } });
  return true;
}

// ── Sub-recursos ─────────────────────────────────────────────────────────────

export type ChildResult<T> = { ok: true; value: T } | { ok: false; error: string; status: number };

async function resolveChild(system: SystemKey, campaignId: string, resource: string, userId: string) {
  const cfg = CAMPAIGNS[system];
  const res = cfg.resources[resource];
  if (!res) return { ok: false as const, error: "Recurso inválido.", status: 404 };
  if (!(await ownedCampaign(campaignId, userId))) {
    return { ok: false as const, error: "Not found", status: 404 };
  }
  return { ok: true as const, res };
}

export async function createChild(
  system: SystemKey, campaignId: string, resource: string, userId: string, body: AnyRecord,
): Promise<ChildResult<unknown>> {
  const r = await resolveChild(system, campaignId, resource, userId);
  if (!r.ok) return r;
  const picked = pickFields(body, r.res.fields);
  if (!picked.ok) return { ok: false, error: `Campo "${picked.field}" excede o tamanho máximo permitido.`, status: 400 };
  const item = await delegateFor(r.res.delegate).create({ data: { ...picked.data, campaignId } });
  return { ok: true, value: item };
}

export async function updateChild(
  system: SystemKey, campaignId: string, resource: string, itemId: string,
  userId: string, body: AnyRecord,
): Promise<ChildResult<unknown>> {
  const r = await resolveChild(system, campaignId, resource, userId);
  if (!r.ok) return r;

  const delegate = delegateFor(r.res.delegate);
  const existing = await delegate.findUnique({ where: { id: itemId }, select: { campaignId: true } });
  if (!existing || existing.campaignId !== campaignId) {
    return { ok: false, error: "Not found", status: 404 };
  }
  const picked = pickFields(body, r.res.fields);
  if (!picked.ok) return { ok: false, error: `Campo "${picked.field}" excede o tamanho máximo permitido.`, status: 400 };
  const item = await delegate.update({ where: { id: itemId }, data: picked.data });
  return { ok: true, value: item };
}

export async function deleteChild(
  system: SystemKey, campaignId: string, resource: string, itemId: string, userId: string,
): Promise<ChildResult<null>> {
  const r = await resolveChild(system, campaignId, resource, userId);
  if (!r.ok) return r;

  const delegate = delegateFor(r.res.delegate);
  const existing = await delegate.findUnique({ where: { id: itemId }, select: { campaignId: true } });
  if (!existing || existing.campaignId !== campaignId) {
    return { ok: false, error: "Not found", status: 404 };
  }
  await delegate.delete({ where: { id: itemId } });
  return { ok: true, value: null };
}
