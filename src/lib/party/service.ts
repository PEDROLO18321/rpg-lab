// ─── Vinculação de ficha à campanha, via link ────────────────────────────────
// O jogador liga o compartilhamento da própria ficha e recebe um link. Quem
// abrir o link, estando logado, pode anexar aquela ficha a uma campanha *sua*
// do *mesmo sistema*. A partir daí o mestre só lê: nada neste módulo escreve na
// ficha do jogador, apenas na tabela de vínculo.
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { CAMPAIGNS, type SystemKey } from "@/lib/campaign/registry";
import { ownedCampaign } from "@/lib/campaign/ownership";
import { toPartySheet, partyInclude, type PartySheet } from "@/lib/party/summary";

export const OTHER_SYSTEM_MESSAGE =
  "Esta ficha pertence a outro sistema e não pode ser visualizada aqui.";

/** slug do System no banco → chave usada nas rotas e no registro. */
const KEY_BY_SLUG: Record<string, SystemKey> = Object.fromEntries(
  (Object.keys(CAMPAIGNS) as SystemKey[]).map((key) => [CAMPAIGNS[key].slug, key]),
);

export type PartyResult<T> = { ok: true; value: T } | { ok: false; error: string; status: number };

const fail = (error: string, status: number) => ({ ok: false as const, error, status });

// ── Lado do jogador ──────────────────────────────────────────────────────────

/**
 * Liga o compartilhamento e devolve o token do link. Com `regenerate`, sorteia
 * um token novo — o link anterior deixa de resolver. Os vínculos já criados
 * continuam valendo: o link concede o acesso, não o mantém.
 */
export async function enableShare(characterId: string, regenerate: boolean): Promise<string> {
  const data: { isPublic: boolean; shareToken?: string } = { isPublic: true };
  if (regenerate) data.shareToken = randomUUID();

  const row = await prisma.character.update({
    where: { id: characterId },
    data,
    select: { shareToken: true },
  });
  return row.shareToken;
}

/** Desliga o compartilhamento: o link para de resolver. Vínculos existentes ficam. */
export async function disableShare(characterId: string): Promise<void> {
  await prisma.character.update({ where: { id: characterId }, data: { isPublic: false } });
}

/** Estado do compartilhamento para exibir na ficha do jogador. */
export async function shareState(characterId: string) {
  return prisma.character.findUnique({
    where: { id: characterId },
    select: {
      isPublic: true,
      shareToken: true,
      _count: { select: { campaignCharacters: true } },
    },
  });
}

// ── Lado do mestre ───────────────────────────────────────────────────────────

export interface ShareTarget {
  character: { id: string; name: string; portraitUrl: string | null; ownerName: string };
  system: SystemKey;
  systemLabel: string;
  /** Campanhas do visitante naquele sistema, com o vínculo já existente marcado. */
  campaigns: { id: string; name: string; linked: boolean }[];
}

/**
 * Resolve o link para o visitante logado: qual ficha é, de qual sistema, e em
 * quais campanhas dele ela cabe. Um token que não resolve devolve 404 — não
 * revelamos se a ficha existe e está fechada ou se nunca existiu.
 */
export async function resolveShare(token: string, viewerId: string): Promise<PartyResult<ShareTarget>> {
  const character = await prisma.character.findUnique({
    where: { shareToken: token },
    select: {
      id: true, name: true, portraitUrl: true, isPublic: true, systemId: true,
      system: { select: { slug: true } },
      user: { select: { name: true, email: true } },
    },
  });
  if (!character || !character.isPublic) return fail("Link inválido ou desativado.", 404);

  const system = KEY_BY_SLUG[character.system.slug];
  if (!system) return fail("Sistema não reconhecido.", 500);

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: viewerId, systemId: character.systemId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true,
      characters: { where: { characterId: character.id }, select: { id: true } },
    },
  });

  return {
    ok: true,
    value: {
      character: {
        id: character.id,
        name: character.name,
        portraitUrl: character.portraitUrl,
        ownerName: character.user.name ?? character.user.email,
      },
      system,
      systemLabel: CAMPAIGNS[system].label,
      campaigns: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        linked: c.characters.length > 0,
      })),
    },
  };
}

/**
 * Anexa a ficha à campanha escolhida. Recusa se a campanha não for do visitante
 * ou se for de outro sistema — a checagem de sistema é feita aqui no servidor,
 * não só na tela que lista as campanhas.
 */
export async function linkToCampaign(
  token: string,
  campaignId: string,
  viewerId: string,
): Promise<PartyResult<{ campaignId: string; system: SystemKey }>> {
  const character = await prisma.character.findUnique({
    where: { shareToken: token },
    select: { id: true, isPublic: true, systemId: true, system: { select: { slug: true } } },
  });
  if (!character || !character.isPublic) return fail("Link inválido ou desativado.", 404);

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, ownerId: true, systemId: true },
  });
  if (!campaign || campaign.ownerId !== viewerId) return fail("Campanha não encontrada.", 404);
  if (campaign.systemId !== character.systemId) return fail(OTHER_SYSTEM_MESSAGE, 409);

  const system = KEY_BY_SLUG[character.system.slug];
  if (!system) return fail("Sistema não reconhecido.", 500);

  // Reabrir o mesmo link não duplica a ficha na campanha.
  await prisma.campaignCharacter.upsert({
    where: { campaignId_characterId: { campaignId, characterId: character.id } },
    create: { campaignId, characterId: character.id },
    update: {},
  });

  return { ok: true, value: { campaignId, system } };
}

/** Fichas vinculadas à campanha, já normalizadas para a aba do mestre. */
export async function listParty(
  system: SystemKey,
  campaignId: string,
  userId: string,
): Promise<PartyResult<PartySheet[]>> {
  if (!(await ownedCampaign(campaignId, userId))) return fail("Campanha não encontrada.", 404);

  const links = await prisma.campaignCharacter.findMany({
    where: { campaignId },
    orderBy: { linkedAt: "asc" },
    include: { character: { include: partyInclude(system) as never } },
  });

  const sheets = links
    .map((link) => toPartySheet(system, link.character, link.linkedAt))
    .filter((s): s is PartySheet => s !== null);

  return { ok: true, value: sheets };
}

/**
 * Tira a ficha da lista do mestre. Apaga só o vínculo — a ficha do jogador
 * permanece intacta.
 */
export async function unlinkFromCampaign(
  campaignId: string,
  characterId: string,
  userId: string,
): Promise<PartyResult<null>> {
  if (!(await ownedCampaign(campaignId, userId))) return fail("Campanha não encontrada.", 404);

  const deleted = await prisma.campaignCharacter.deleteMany({ where: { campaignId, characterId } });
  if (deleted.count === 0) return fail("Ficha não vinculada a esta campanha.", 404);

  return { ok: true, value: null };
}
