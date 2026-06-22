"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ACCENT      = "#ffffff";
const ACCENT_LIGHT = "#ffffff";
const ACCENT_DIM  = "rgba(255,255,255,0.14)";
const ACCENT_BORD = "rgba(255,255,255,0.32)";

interface Props {
  id: string;
  name: string;
  className: string | null;
  origin: string | null;
  nex: number;
  sanCurrent: number;
  sanMax: number;
  portraitUrl?: string | null;
}

const CLASS_LABEL: Record<string, string> = {
  combatente: "Combatente",
  especialista: "Especialista",
  ocultista: "Ocultista",
};

export function AgentCard({ id, name, className, origin, nex, sanCurrent, sanMax, portraitUrl }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<null | "duplicar" | "excluir">(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const sanPct = Math.max(0, Math.min(100, (sanCurrent / Math.max(1, sanMax)) * 100));
  const sanColor =
    sanPct > 60 ? ACCENT :
    sanPct > 30 ? "#c9941f" :
    "#c03030";

  const classLabel = className ? CLASS_LABEL[className] ?? className : null;

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  function openSheet() {
    router.push(`/dashboard/ordem/${id}`);
  }

  async function duplicate() {
    if (busy) return;
    setBusy("duplicar");
    try {
      const res = await fetch(`/api/ordem/characters/${id}/duplicate`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
      setMenuOpen(false);
    }
  }

  async function remove() {
    if (busy) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy("excluir");
    try {
      const res = await fetch(`/api/ordem/characters/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
      setMenuOpen(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={openSheet}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") openSheet(); }}
      style={{
        position: "relative",
        zIndex: menuOpen ? 20 : hovered ? 2 : 1,
        background: "var(--surface)",
        border: `1px solid ${hovered ? ACCENT_BORD : "rgba(255,255,255,0.07)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "22px 20px",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 12px 40px rgba(255,255,255,0.12)`
          : "0 2px 10px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* 3-dot menu */}
      <div
        ref={menuRef}
        style={{ position: "absolute", top: 12, right: 12, zIndex: 5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Opções do agente"
          onClick={() => { setMenuOpen((o) => !o); setConfirmDelete(false); }}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: menuOpen ? ACCENT_DIM : "var(--surface-2)",
            border: `1px solid ${menuOpen ? ACCENT_BORD : "var(--border)"}`,
            color: menuOpen ? ACCENT_LIGHT : "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2.5,
            opacity: hovered || menuOpen ? 1 : 0,
            transition: "opacity 0.15s, background 0.15s, border-color 0.15s",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "currentColor" }} />
          ))}
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 36,
              right: 0,
              minWidth: 150,
              background: "var(--surface-2)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <MenuItem label="Visualizar" onClick={openSheet} accentLight={ACCENT_LIGHT} accentDim={ACCENT_DIM} />
            <MenuItem
              label={busy === "duplicar" ? "Duplicando…" : "Duplicar"}
              onClick={duplicate}
              disabled={busy !== null}
              accentLight={ACCENT_LIGHT}
              accentDim={ACCENT_DIM}
            />
            <MenuItem
              label={busy === "excluir" ? "Excluindo…" : confirmDelete ? "Confirmar exclusão?" : "Excluir"}
              onClick={remove}
              disabled={busy !== null}
              danger
              accentLight={ACCENT_LIGHT}
              accentDim={ACCENT_DIM}
            />
          </div>
        )}
      </div>

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius)",
            background: ACCENT_DIM,
            border: `1px solid ${ACCENT_BORD}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: ACCENT_LIGHT,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {portraitUrl ? (
            <img src={portraitUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2 }}>
            {[classLabel, origin].filter(Boolean).join(" · ") || "Sem classe ainda"}
          </p>
          <span style={{ display: "inline-block", marginTop: 5, fontSize: "0.64rem", fontWeight: 700, color: ACCENT_LIGHT, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xs)", padding: "1px 7px", letterSpacing: "0.04em" }}>
            NEX {nex}%
          </span>
        </div>
      </div>

      {/* Sanity bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Sanidade
          </span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: sanColor }}>
            {sanCurrent}<span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>/{sanMax}</span>
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${sanPct}%`, background: sanColor, borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border)",
          paddingTop: 12,
        }}
      >
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Ver ficha
        </span>
        <span
          style={{
            fontSize: "0.82rem",
            color: hovered ? ACCENT_LIGHT : "var(--text-subtle)",
            transition: "color 0.2s, transform 0.2s",
            display: "inline-block",
            transform: hovered ? "translateX(3px)" : "translateX(0)",
          }}
        >
          →
        </span>
      </div>
    </div>
  );
}

function MenuItem({
  label, onClick, disabled, danger, accentLight, accentDim,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  accentLight: string;
  accentDim: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "9px 14px",
        background: hover && !disabled ? (danger ? "rgba(220,60,60,0.12)" : accentDim) : "transparent",
        border: "none",
        textAlign: "left",
        fontSize: "0.8rem",
        fontWeight: 600,
        fontFamily: "inherit",
        color: danger ? "#e06c6c" : hover ? accentLight : "var(--text)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "background 0.12s, color 0.12s",
      }}
    >
      {label}
    </button>
  );
}
