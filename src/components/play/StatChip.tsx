"use client";

// Chip de valor derivado: Defesa, Deslocamento, NEX, Carga, CA, dinheiro.
// Funde o Badge (Ordem, Star Wars) com o QuickStat (D&D, Tormenta).

export function StatChip({
  label, value, warn, onClick, title,
}: {
  label: string;
  value: string | number;
  /** Destaque laranja: sobrecarregado, sem munição, limite estourado. */
  warn?: boolean;
  /** Quando clicável, o chip vira botão (ex.: Inspiração do D&D). */
  onClick?: () => void;
  title?: string;
}) {
  const body = (
    <>
      <p style={{ fontSize: "0.58rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: warn ? "#e0843c" : "var(--text)", marginTop: 2 }}>
        {value}
      </p>
    </>
  );

  const style: React.CSSProperties = {
    padding: "7px 14px",
    background: "var(--surface-2)",
    border: `1px solid ${warn ? "rgba(224,132,60,0.5)" : "var(--border)"}`,
    borderRadius: "var(--radius)",
    textAlign: "center",
    minWidth: 58,
  };

  if (!onClick) return <div style={style}>{body}</div>;

  return (
    <button onClick={onClick} title={title} style={{ ...style, cursor: "pointer", fontFamily: "inherit" }}>
      {body}
    </button>
  );
}
