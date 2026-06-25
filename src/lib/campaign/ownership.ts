// ─── Helpers compartilhados de campanha (mestre) ─────────────────────────────
import { prisma } from "@/lib/prisma";

const systemIdCache = new Map<string, string>();

/** Resolve o id de um System pelo slug (cacheado por processo). */
export async function getSystemId(slug: string): Promise<string | null> {
  const cached = systemIdCache.get(slug);
  if (cached) return cached;
  const sys = await prisma.system.findUnique({ where: { slug }, select: { id: true } });
  if (sys) systemIdCache.set(slug, sys.id);
  return sys?.id ?? null;
}

/** Confere se a campanha existe e pertence ao usuário. */
export async function ownedCampaign(campaignId: string, userId: string) {
  const c = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true, ownerId: true } });
  if (!c || c.ownerId !== userId) return null;
  return c;
}

/** Mantém só as chaves permitidas de um corpo de requisição. */
export function pickFields(body: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  return out;
}
