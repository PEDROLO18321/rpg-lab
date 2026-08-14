// Helpers compartilhados por export/import de fichas em JSON (todos os sistemas).

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

export function makeEnvelope<TSheet>(
  format: string,
  character: { name: string; portraitUrl: string | null; notes: string | null },
  sheet: TSheet
): TransferEnvelope<TSheet> {
  return { format, exportedAt: new Date().toISOString(), character, sheet };
}

export function parseJsonField<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toJsonFieldOrNull(v: unknown): string | null {
  return v === undefined || v === null ? null : JSON.stringify(v);
}

export function numOr(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function strOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function boolOr(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** Nome de arquivo seguro a partir do nome do personagem. */
export function safeFileName(name: string): string {
  return name.trim().replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 60) || "personagem";
}
