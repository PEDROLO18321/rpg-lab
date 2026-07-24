"use client";

// Star Wars: Além da Fronteira — kit visual compartilhado (holo-terminal / HUD galáctico)
// Usado no wizard, na ficha e nas ferramentas de mestre pra manter tudo consistente.

import { useEffect, useRef, useState, type ReactNode } from "react";

export const SW = {
  bg: "#05070d",
  panel: "linear-gradient(180deg, rgba(18,26,40,0.92) 0%, rgba(10,14,22,0.96) 100%)",
  panelBorder: "rgba(93,158,214,0.22)",
  panelBorderHover: "rgba(93,158,214,0.5)",
  accent: "#3b82c4",
  accentLight: "#69a8e0",
  accentBright: "#8fc4f5",
  accentDim: "rgba(59,130,196,0.12)",
  accentBord: "rgba(59,130,196,0.35)",
  glow: "rgba(59,130,196,0.28)",
  gold: "#c9941f",
  goldDim: "rgba(201,148,31,0.12)",
  danger: "#e0524c",
  success: "#4ade80",
  textMuted: "var(--text-muted)",
  textSubtle: "var(--text-subtle)",
};

export function Panel({ children, active, style, glow }: { children: ReactNode; active?: boolean; style?: React.CSSProperties; glow?: boolean }) {
  return (
    <div
      style={{
        background: SW.panel,
        border: `1px solid ${active ? SW.panelBorderHover : SW.panelBorder}`,
        borderRadius: 8,
        padding: "22px 24px",
        boxShadow: glow ? `0 0 32px ${SW.glow}, inset 0 1px 0 rgba(255,255,255,0.03)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
        position: "relative",
        transition: "border-color 0.2s, box-shadow 0.2s",
        ...style,
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
        <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.accentLight, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 18, height: 1, background: SW.accentBord, display: "inline-block" }} />
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.35rem", fontWeight: 700, color: "var(--text)", marginBottom: desc ? 8 : 0, letterSpacing: "0.01em" }}>
        {title}
      </h2>
      {desc && <p style={{ fontSize: "0.86rem", color: SW.textMuted, lineHeight: 1.7, maxWidth: 640 }}>{desc}</p>}
    </div>
  );
}

export function Badge({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "gold" | "muted" | "success" | "danger" }) {
  const map = {
    accent: { c: SW.accentLight, b: SW.accentBord, bg: SW.accentDim },
    gold: { c: SW.gold, b: "rgba(201,148,31,0.4)", bg: SW.goldDim },
    muted: { c: SW.textMuted, b: "var(--border)", bg: "var(--surface-2)" },
    success: { c: SW.success, b: "rgba(74,222,128,0.35)", bg: "rgba(74,222,128,0.1)" },
    danger: { c: SW.danger, b: "rgba(224,82,76,0.4)", bg: "rgba(224,82,76,0.1)" },
  }[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em", color: map.c, background: map.bg, border: `1px solid ${map.b}`, borderRadius: 3 }}>
      {children}
    </span>
  );
}

interface SelectCardProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: ReactNode;
}

export function SelectCard({ label, sublabel, selected, onClick, disabled, badge }: SelectCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
        padding: "13px 14px", textAlign: "left",
        background: selected ? "linear-gradient(135deg, rgba(59,130,196,0.16) 0%, rgba(59,130,196,0.04) 100%)" : "rgba(255,255,255,0.015)",
        border: `1px solid ${selected ? SW.accentBord : "rgba(255,255,255,0.08)"}`,
        borderRadius: 6,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.82rem", fontWeight: 700, color: selected ? SW.accentBright : "var(--text)" }}>
        {badge && <span style={{ marginRight: 5 }}>{badge}</span>}
        {label}
      </span>
      {sublabel && <span style={{ fontSize: "0.64rem", color: SW.textSubtle, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>{sublabel}</span>}
      {selected && <span style={{ position: "absolute", top: 8, right: 8, width: 5, height: 5, borderRadius: "50%", background: SW.accentBright, boxShadow: `0 0 6px ${SW.accentBright}` }} />}
    </button>
  );
}

export function Gauge({ label, current, max, color, compact }: { label: string; current: number; max: number; color: string; compact?: boolean }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: compact ? 100 : 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.64rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: "0.86rem", fontWeight: 800, color, fontFamily: "var(--font-cinzel), serif" }}>
          {current}<span style={{ color: SW.textSubtle, fontWeight: 400, fontSize: "0.7rem" }}>/{max}</span>
        </span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, boxShadow: `0 0 8px ${color}77`, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, style }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "11px 26px",
        background: disabled ? "var(--surface-2)" : `linear-gradient(135deg, ${SW.accentLight} 0%, ${SW.accent} 100%)`,
        color: disabled ? SW.textSubtle : "#04070c",
        border: "none",
        borderRadius: 6,
        fontSize: "0.84rem",
        fontWeight: 800,
        letterSpacing: "0.02em",
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : `0 0 22px ${SW.glow}`,
        transition: "all 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled, style }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 22px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        color: disabled ? SW.textSubtle : "var(--text)",
        fontSize: "0.84rem",
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export const gridAutoFill = (min: number): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
  gap: 9,
});

export interface DropdownOption { value: string; label: string; disabled?: boolean; hint?: string }

/** Dropdown customizado — substitui <select> nativo, que renderiza fora do tema (fundo branco do navegador). */
export function Dropdown({ value, onChange, options, placeholder, emptyLabel = "Nenhuma" }: {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%", padding: "9px 13px", background: "rgba(255,255,255,0.03)", border: `1px solid ${open ? SW.accentBord : "var(--border)"}`, borderRadius: 6, color: selected ? "var(--text)" : SW.textSubtle, fontSize: "0.86rem", cursor: "pointer", boxSizing: "border-box", textAlign: "left" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected ? selected.label : (placeholder ?? emptyLabel)}</span>
        <span style={{ color: SW.accentLight, fontSize: "0.7rem", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50, background: "#0b0f18", border: `1px solid ${SW.accentBord}`, borderRadius: 6, maxHeight: 260, overflowY: "auto", boxShadow: `0 12px 32px rgba(0,0,0,0.6), 0 0 20px ${SW.glow}` }}>
          <button type="button" onClick={() => { onChange(""); setOpen(false); }}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 13px", background: value === "" ? SW.accentDim : "transparent", border: "none", color: value === "" ? SW.accentBright : SW.textSubtle, fontSize: "0.84rem", cursor: "pointer" }}>
            {emptyLabel}
          </button>
          {options.map((o) => (
            <button key={o.value} type="button" disabled={o.disabled} onClick={() => { onChange(o.value); setOpen(false); }}
              style={{ display: "flex", justifyContent: "space-between", gap: 10, width: "100%", textAlign: "left", padding: "8px 13px", background: value === o.value ? SW.accentDim : "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,0.04)", color: o.disabled ? SW.textSubtle : value === o.value ? SW.accentBright : "var(--text)", fontSize: "0.84rem", cursor: o.disabled ? "default" : "pointer", opacity: o.disabled ? 0.5 : 1 }}>
              <span>{o.label}</span>
              {o.hint && <span style={{ fontSize: "0.7rem", color: SW.textSubtle, flexShrink: 0 }}>{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
