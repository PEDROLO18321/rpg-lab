"use client";

// Cyberpunk RED — kit visual das telas de jogador e de Mestre.
// A paleta vem de PLAY_THEME.cyberpunk (fonte de verdade das cores) para que o
// roxo da ficha, do dado 3D e das ferramentas do Mestre nunca divirjam.

import type { CSSProperties, ReactNode } from "react";
import { PLAY_THEME } from "@/components/play/theme";

const T = PLAY_THEME.cyberpunk;

export const CP = {
  accent: T.accent,
  accentLight: T.accentLight,
  accentDim: T.accentDim,
  accentBord: T.accentBorder,
  glow: T.glow,
  // Magenta do particle palette: serve de segundo tom para o que é "da NET".
  neon: "#e879f9",
  danger: "#ef6b6b",
  warn: "#f0b429",
  success: "#4ade80",
  panel: "linear-gradient(180deg, rgba(26,16,44,0.92) 0%, rgba(14,10,24,0.96) 100%)",
  panelBorder: "rgba(168,85,247,0.22)",
  textMuted: "var(--text-muted)",
  textSubtle: "var(--text-subtle)",
} as const;

/** Estilos de campo repetidos em todas as ferramentas — um lugar só. */
export const inputStyle: CSSProperties = {
  width: "100%", padding: "9px 12px", minHeight: 36,
  background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem",
  boxSizing: "border-box", fontFamily: "inherit",
};

export const areaStyle: CSSProperties = {
  ...inputStyle, lineHeight: 1.6, resize: "vertical", minHeight: 80,
};

export const labelStyle: CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)",
  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block",
};

/** Botão pequeno de ação em linha (rolar, remover, +). Mínimo 28px de altura para toque. */
export const pillBtn: CSSProperties = {
  flexShrink: 0, padding: "4px 12px", minHeight: 28, borderRadius: "var(--radius-full)",
  background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)",
  cursor: "pointer", fontSize: "0.76rem", fontWeight: 700, whiteSpace: "nowrap", fontFamily: "inherit",
};

export const dangerBtn: CSSProperties = {
  ...pillBtn, color: "#f08080", borderColor: "rgba(220,60,60,0.35)", background: "rgba(220,60,60,0.08)",
};

export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: CP.panel, border: `1px solid ${CP.panelBorder}`, borderRadius: 8,
        padding: "22px 24px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        position: "relative", minWidth: 0, ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {eyebrow && (
        <p style={{ fontSize: "0.68rem", fontWeight: 800, color: CP.accentLight, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 18, height: 1, background: CP.accentBord, display: "inline-block" }} />
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.35rem", fontWeight: 700, color: "var(--text)", marginBottom: desc ? 8 : 0 }}>
        {title}
      </h2>
      {desc && <p style={{ fontSize: "0.86rem", color: CP.textMuted, lineHeight: 1.7, maxWidth: 640 }}>{desc}</p>}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, style, type = "button" }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties; type?: "button" | "submit";
}) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        padding: "11px 26px", minHeight: 40,
        background: disabled ? "var(--surface-2)" : `linear-gradient(135deg, ${CP.accentLight} 0%, ${CP.accent} 100%)`,
        color: disabled ? CP.textSubtle : "#0b0614", border: "none", borderRadius: 6,
        fontSize: "0.84rem", fontWeight: 800, cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : `0 0 22px ${CP.glow}`, fontFamily: "inherit", ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled, style }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      style={{
        padding: "10px 22px", minHeight: 40, background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)", borderRadius: 6,
        color: disabled ? CP.textSubtle : "var(--text)", fontSize: "0.84rem", fontWeight: 600,
        cursor: disabled ? "default" : "pointer", fontFamily: "inherit", ...style,
      }}
    >
      {children}
    </button>
  );
}

export const gridAutoFill = (min: number): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`,
  gap: 9,
});

/** Cartão selecionável (papéis, métodos, kits). */
export function SelectCard({ label, sublabel, selected, onClick, children }: {
  label: string; sublabel?: string; selected: boolean; onClick: () => void; children?: ReactNode;
}) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={selected}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
        padding: "13px 14px", textAlign: "left", minHeight: 44, fontFamily: "inherit",
        background: selected ? `linear-gradient(135deg, ${CP.accentDim} 0%, rgba(168,85,247,0.04) 100%)` : "rgba(255,255,255,0.015)",
        border: `1px solid ${selected ? CP.accentBord : "rgba(255,255,255,0.08)"}`,
        borderRadius: 6, cursor: "pointer", position: "relative", minWidth: 0,
      }}
    >
      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.86rem", fontWeight: 700, color: selected ? CP.accentLight : "var(--text)" }}>{label}</span>
      {sublabel && <span style={{ fontSize: "0.64rem", color: CP.textSubtle, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>{sublabel}</span>}
      {children}
    </button>
  );
}
