// ─── ORDEM PARANORMAL — Mestre: helpers de servidor ──────────────────────────
import { prisma } from "@/lib/prisma";

/** Resolve o id do System "ordem" (cacheado por processo). */
let ordemSystemId: string | null = null;
export async function getOrdemSystemId(): Promise<string | null> {
  if (ordemSystemId) return ordemSystemId;
  const sys = await prisma.system.findUnique({ where: { slug: "ordem" }, select: { id: true } });
  ordemSystemId = sys?.id ?? null;
  return ordemSystemId;
}

/** Confere se a campanha existe e pertence ao usuário. Retorna a campanha ou null. */
export async function ownedCampaign(campaignId: string, userId: string) {
  const c = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true, ownerId: true } });
  if (!c || c.ownerId !== userId) return null;
  return c;
}

/** Inclui todos os filhos da operação numa busca de campanha. */
export const campaignInclude = {
  ordemStory: true,
  ordemNpcs: { orderBy: { createdAt: "asc" } },
  ordemCombatants: { orderBy: { order: "asc" } },
  ordemSessions: { orderBy: { number: "asc" } },
  ordemItems: true,
  ordemSanity: true,
  ordemClues: { orderBy: { createdAt: "asc" } },
  ordemClocks: { orderBy: { createdAt: "asc" } },
  ordemRewards: { orderBy: { createdAt: "desc" } },
} as const;
