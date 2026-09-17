// ─── Contexto autenticado das rotas de personagem ────────────────────────────
// Toda criação/importação de ficha resolve `userId` pela sessão e `systemId`
// pelo slug do sistema. O corpo da requisição nunca é fonte de identidade.
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemId } from "@/lib/campaign/ownership";

export type SystemSlug = "dnd" | "tormenta20" | "ordem" | "cthulhu" | "starwars";

export type AuthedContext =
  | { ok: true; userId: string; systemId: string }
  | { ok: false; error: string; status: number };

/** Sessão + id do sistema, ambos resolvidos no servidor. */
export async function authedSystemContext(slug: SystemSlug): Promise<AuthedContext> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized", status: 401 };

  const systemId = await getSystemId(slug);
  if (!systemId) return { ok: false, error: "Sistema não encontrado.", status: 500 };

  return { ok: true, userId: session.user.id, systemId };
}

export type OwnedCharacter =
  | { ok: true; userId: string }
  | { ok: false; error: string; status: number };

/** Confere que o personagem existe e pertence ao usuário da sessão. */
export async function authedCharacter(characterId: string): Promise<OwnedCharacter> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized", status: 401 };

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { userId: true },
  });
  if (!character) return { ok: false, error: "Not found", status: 404 };
  if (character.userId !== session.user.id) return { ok: false, error: "Forbidden", status: 403 };

  return { ok: true, userId: session.user.id };
}
