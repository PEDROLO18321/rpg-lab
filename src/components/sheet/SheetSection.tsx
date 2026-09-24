"use client";

// ─── Primitivos de conteúdo da ficha ─────────────────────────────────────────
// Um cartão só, no lugar dos quatro que existiam: `ViewSection` (D&D),
// `Section` (Tormenta), `Panel` (Ordem e Star Wars, duplicado byte a byte) e
// `Section` do Cthulhu, que tinha faixa de cabeçalho e não parecia com nenhum
// dos outros.
//
// O visual é o do D&D, que é a base pedida: superfície com borda discreta e
// rótulo em versalete. A cor do rótulo sai de `var(--accent-light)`, que o
// SheetHeader já projeta — cada sistema se colore sozinho.

interface SectionProps {
  title: string;
  /** Botão ou contador à direita do título. */
  action?: React.ReactNode;
  /** Realce da borda: usado no bloco principal de cada ficha. */
  accent?: boolean;
  children: React.ReactNode;
}

export function SheetSection({ title, action, accent, children }: SectionProps) {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <h2 style={sheetLabelStyle}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Rótulo de seção. Exportado porque sub-blocos internos repetem o mesmo tom. */
export const sheetLabelStyle: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

/**
 * Cartão de valor derivado — CA, Iniciativa, Deslocamento, Bônus de Proficiência.
 * É o `StatBox` do D&D, agora disponível aos cinco.
 */
export function SheetStat({
  label, value, accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? "var(--accent-dim)" : "var(--surface)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "12px 10px",
        textAlign: "center",
        minWidth: 0,
      }}
    >
      <p style={{ ...sheetLabelStyle, fontSize: "0.62rem", marginBottom: 4 }}>{label}</p>
      <p
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "1.15rem",
          fontWeight: 700,
          color: accent ? "var(--accent-light)" : "var(--text)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/** Chip compacto da faixa: rótulo pequeno e valor na mesma linha. */
export function SheetChip({
  label, value, warn,
}: {
  label: string;
  value: React.ReactNode;
  /** Destaque laranja: sobrecarregado, sem munição, limite estourado — mesmo
   *  contrato do `warn` do `StatChip` (áreas de Jogar), para a Ordem migrar
   *  o `Badge` (Defesa/Deslocamento/Carga) sem perder o aviso visual. */
  warn?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        padding: "7px 14px",
        background: "var(--surface-2)",
        border: `1px solid ${warn ? "rgba(224,132,60,0.5)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        fontSize: "0.78rem",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ ...sheetLabelStyle, fontSize: "0.62rem" }}>{label}</span>
      <strong style={{ color: warn ? "#e0843c" : "var(--text)", fontWeight: 700 }}>{value}</strong>
    </span>
  );
}
