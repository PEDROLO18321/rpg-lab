// ─── Entrada comum das rotas de importação de ficha ──────────────────────────
// Sessão, sistema, tamanho do corpo e formato do envelope são validados uma vez
// só, aqui — cada rota de sistema cuida apenas dos campos da própria ficha.
import { NextRequest, NextResponse } from "next/server";
import { authedSystemContext, type SystemSlug } from "@/lib/apiAuth";
import { ImportError, LIMITS } from "@/lib/characterTransfer";

interface ImportOptions {
  slug: SystemSlug;
  /** Identificador do formato esperado, ex.: "rpglab.dnd.v1". */
  format: string;
  /** Nome do sistema exibido em mensagens de erro, ex.: "D&D 5e". */
  label: string;
  /** Como o personagem se chama neste sistema: "personagem", "agente", "investigador". */
  subject?: string;
}

export interface ImportRequest {
  userId: string;
  systemId: string;
  character: Record<string, unknown>;
  sheet: Record<string, unknown>;
}

export async function readImportRequest(
  req: NextRequest,
  { slug, format, label, subject = "personagem" }: ImportOptions,
): Promise<ImportRequest> {
  const ctx = await authedSystemContext(slug);
  if (!ctx.ok) throw new ImportError(ctx.error, ctx.status);

  const raw = await req.text();
  if (raw.length > LIMITS.payload) {
    throw new ImportError("Arquivo grande demais para importação.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new ImportError("Arquivo inválido — não é um JSON legível.");
  }

  const payload = (body as { payload?: unknown } | null)?.payload;
  if (!payload || typeof payload !== "object") {
    throw new ImportError(`Arquivo inválido para ${label}.`);
  }

  const envelope = payload as Record<string, unknown>;
  if (envelope.format !== format) {
    throw new ImportError(`Arquivo inválido para ${label}.`);
  }

  const character = asRecord(envelope.character);
  const sheet = asRecord(envelope.sheet);

  if (typeof character.name !== "string" || !character.name.trim()) {
    throw new ImportError(`Nome do ${subject} ausente.`);
  }
  if (character.name.length > LIMITS.name) {
    throw new ImportError(`Nome do ${subject} excede ${LIMITS.name} caracteres.`);
  }

  return { userId: ctx.userId, systemId: ctx.systemId, character, sheet };
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/** Converte ImportError em resposta; qualquer outro erro vira 500 genérico. */
export function handleImportError(err: unknown, tag: string): NextResponse {
  if (err instanceof ImportError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(tag, err);
  return NextResponse.json({ error: "Erro ao importar personagem." }, { status: 500 });
}
