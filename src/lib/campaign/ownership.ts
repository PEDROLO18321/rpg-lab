// ─── Helpers compartilhados de campanha (mestre) ─────────────────────────────
import { prisma } from "@/lib/prisma";
import { LIMITS } from "@/lib/characterTransfer";

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

/** Teto por campo, o mesmo que a importação de ficha já aplica. */
function limiteDe(campo: string): number {
  if (campo === "name" || campo === "title") return LIMITS.name;
  if (campo.endsWith("Url") || campo === "url") return LIMITS.url;
  return LIMITS.text;
}

export type PickResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; field: string };

/**
 * Mantém só as chaves permitidas de um corpo de requisição, recusando valor
 * acima do teto. A lista de permissão sozinha diz *quais* campos entram, não
 * *quanto* cabe neles — sem o teto, um NPC com 5 MB de nome é gravado. O
 * caminho de importação de ficha já tinha esse limite; este é o mesmo rigor
 * para a área do Mestre.
 */
export function pickFields(body: Record<string, unknown>, fields: string[]): PickResult {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = body[f];
    if (v === undefined) continue;
    if (typeof v === "string") {
      if (v.length > limiteDe(f)) return { ok: false, field: f };
    } else if (v !== null && typeof v === "object") {
      // Campo Json: mede o serializado, que é o que de fato vai para a coluna.
      const serializado = JSON.stringify(v);
      if (serializado !== undefined && serializado.length > LIMITS.json) return { ok: false, field: f };
    }
    out[f] = v;
  }
  return { ok: true, data: out };
}
