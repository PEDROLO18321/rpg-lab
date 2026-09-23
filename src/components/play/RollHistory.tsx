"use client";

// Histórico de rolagens, igual nos cinco sistemas. O que cada regra tem de
// próprio chega pronto em `detail` e `badge` — ver types.ts.

import type { PlayRollEntry, RollTone } from "./types";

const TONE_COLOR: Record<RollTone, string> = {
  crit: "var(--accent-light)",
  fumble: "#ff6b6b",
  success: "#7dc864",
  fail: "var(--text-muted)",
};

export function RollHistory({
  log, max = 6, onClear,
}: {
  log: PlayRollEntry[];
  max?: number;
  onClear?: () => void;
}) {
  if (log.length === 0) {
    return <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)" }}>Nenhuma rolagem ainda.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {log.slice(0, max).map((e, i) => {
        const color = e.tone ? TONE_COLOR[e.tone] : "var(--text)";
        const latest = i === 0;
        return (
          <div
            key={e.id}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 9px", borderRadius: "var(--radius-xs)",
              background: latest ? "var(--accent-dim)" : "var(--surface-2)",
              border: `1px solid ${latest ? "var(--border-accent)" : "transparent"}`,
            }}
          >
            <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 800, color, minWidth: 28, textAlign: "center" }}>
              {e.total}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.72rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.label}
              </p>
              {e.detail && (
                <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>{e.detail}</p>
              )}
            </div>
            {e.badge && (
              <span style={{ fontSize: "0.6rem", fontWeight: 700, color, letterSpacing: "0.04em", flexShrink: 0 }}>
                {e.badge}
              </span>
            )}
          </div>
        );
      })}
      {onClear && (
        <button
          onClick={onClear}
          style={{ alignSelf: "flex-end", background: "none", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: "0.68rem", fontFamily: "inherit", padding: "2px 4px" }}
        >
          limpar
        </button>
      )}
    </div>
  );
}
