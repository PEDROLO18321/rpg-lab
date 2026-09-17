// Helpers compartilhados por export/import de fichas em JSON (todos os sistemas).
// `import type` — apagado na compilação, não puxa o runtime do Prisma para o bundle.
import type { Prisma } from "../../generated/prisma/client";

export interface TransferEnvelope<TSheet> {
  format: string; // "rpglab.<sistema>.v1"
  exportedAt: string;
  character: {
    name: string;
    portraitUrl: string | null;
    notes: string | null;
  };
  sheet: TSheet;
}

/** Tetos de tamanho aplicados a tudo que entra por importação. */
export const LIMITS = {
  name: 80,
  text: 20_000, // notas, histórico, descrições livres
  url: 2_000,
  json: 200_000, // cada campo JSON serializado
  payload: 2_000_000, // corpo inteiro da requisição de import
} as const;

/** Erro de importação com status HTTP — mensagem é exibida ao usuário. */
export class ImportError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ImportError";
    this.status = status;
  }
}

export function makeEnvelope<TSheet>(
  format: string,
  character: { name: string; portraitUrl: string | null; notes: string | null },
  sheet: TSheet
): TransferEnvelope<TSheet> {
  return { format, exportedAt: new Date().toISOString(), character, sheet };
}

/**
 * Lê uma coluna `Json` do Prisma. O valor já vem desserializado; a passagem por
 * `JSON.parse` fica só como compatibilidade com linhas que ainda estejam em
 * texto (bancos anteriores à migração `json_columns`).
 */
export function parseJsonField<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return raw as T;
}

/**
 * Prepara um valor para gravação numa coluna `Json`, recusando conteúdo acima
 * do teto. Retorna `undefined` para ausência — o Prisma então não toca na
 * coluna, que fica NULL (ou mantém o `@default`).
 */
export function toJsonFieldOrNull(
  v: unknown,
  maxBytes: number = LIMITS.json,
): Prisma.InputJsonValue | undefined {
  if (v === undefined || v === null) return undefined;
  const serialized = JSON.stringify(v);
  if (serialized === undefined) return undefined;
  if (serialized.length > maxBytes) {
    throw new ImportError("Arquivo rejeitado: um dos campos excede o tamanho máximo permitido.");
  }
  return v as Prisma.InputJsonValue;
}

/** Repassa um valor lido do banco (`JsonValue`) de volta para uma gravação. */
export function jsonIn(v: unknown): Prisma.InputJsonValue | undefined {
  return v === null || v === undefined ? undefined : (v as Prisma.InputJsonValue);
}

/** Número inteiro preso a um intervalo válido. Valores fora da faixa são recusados. */
export function intIn(v: unknown, min: number, max: number, fallback: number): number {
  if (v === undefined || v === null) return fallback;
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  const n = Math.trunc(v);
  if (n < min || n > max) {
    throw new ImportError(`Arquivo rejeitado: valor ${n} fora do intervalo permitido (${min}–${max}).`);
  }
  return n;
}

export function numOr(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function strOrNull(v: unknown, maxLen: number = LIMITS.text): string | null {
  if (typeof v !== "string") return null;
  if (v.length > maxLen) {
    throw new ImportError("Arquivo rejeitado: um dos textos excede o tamanho máximo permitido.");
  }
  return v;
}

/** String restrita a um conjunto conhecido (slug de raça, classe, era…). */
export function strIn<T extends string>(v: unknown, allowed: readonly T[], fallback: T | null): T | null {
  if (typeof v !== "string") return fallback;
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

export function boolOr(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** Nome de arquivo seguro a partir do nome do personagem. */
export function safeFileName(name: string): string {
  return name.trim().replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 60) || "personagem";
}
