"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ACCENT       = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM   = "rgba(160,24,24,0.12)";
const ACCENT_BORD  = "rgba(160,24,24,0.32)";

interface Props {
  id: string;
  name: string;
  race: string | null;
  className: string | null;
  level: number;
  pvCurrent: number;
  pvMax: number;
  portraitUrl?: string | null;
}

export function TormentaCharacterCard({ id, name, race, className, level, pvCurrent, pvMax, portraitUrl }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<null | "duplicar" | "excluir">(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = name.split(" ").slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
  const pvPct = Math.max(0, Math.min(100, (pvCurrent / Math.max(1, pvMax)) * 100));
  const pvColor = pvPct > 60 ? ACCENT_LIGHT : pvPct > 30 ? "#c9941f" : "#8b0000";

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setMenuOpen(false); setConfirmDelete(false); }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  function openSheet() { router.push(`/dashboard/tormenta/${id}`); }

  async function duplicate() {
    if (busy) return;
    setBusy("duplicar");
    try {
      const res = await fetch(`/api/tormenta/characters/${id}/duplicate`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally { setBusy(null); setMenuOpen(false); }
  }

  async function remove() {
    if (busy) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy("excluir");
    try {
      const res = await fetch(`/api/tormenta/characters/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally { setBusy(null); setMenuOpen(false); setConfirmDelete(false); }
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
        position: "relative", zIndex: menuOpen ? 20 : hovered ? 2 : 1,
        background: "var(--surface)", border: `1px solid ${hovered ? ACCENT_BORD : "rgba(255,255,255,0.07)"}`,
        borderRadius: "var(--radius-xl)", padding: "22px 20px", cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 40px rgba(160,24,24,0.15)" : "0 2px 10px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      <div ref={menuRef} style={{ position: "absolute", top: 12, right: 12, zIndex: 5 }} onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="Opções do personagem"
          onClick={() => { setMenuOpen((o) => !o); setConfirmDelete(false); }}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background: menuOpen ? ACCENT_DIM : "var(--surface-2)",
            border: `1px solid ${menuOpen ? ACCENT_BORD : "var(--border)"}`,
            color: menuOpen ? ACCENT_LIGHT : "var(--text-muted)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5,
            opacity: hovered || menuOpen ? 1 : 0, transition: "opacity 0.15s, background 0.15s, border-color 0.15s",
          }}
        >
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "currentColor" }} />)}
        </button>

        {menuOpen && (
          <div style={{ position: "absolute", top: 36, right: 0, minWidth: 150, background: "var(--surface-2)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-lg)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <MenuItem label="Visualizar" onClick={openSheet} />
            <MenuItem label={busy === "duplicar" ? "Duplicando…" : "Duplicar"} onClick={duplicate} disabled={busy !== null} />
            <MenuItem label={busy === "excluir" ? "Excluindo…" : confirmDelete ? "Confirmar exclusão?" : "Excluir"} onClick={remove} disabled={busy !== null} danger />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: "var(--radius)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", fontWeight: 700, color: ACCENT_LIGHT, flexShrink: 0, overflow: "hidden" }}>
          {portraitUrl ? <img src={portraitUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2 }}>{[race, className].filter(Boolean).join(" · ") || "Sem ficha ainda"}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>PV</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: pvColor }}>{pvCurrent}<span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>/{pvMax}</span></span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pvPct}%`, background: pvColor, borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Nível</span>
          <span style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xs)", padding: "1px 8px", fontSize: "0.8rem", fontWeight: 700, color: ACCENT_LIGHT }}>{level}</span>
        </div>
        <span style={{ fontSize: "0.82rem", color: hovered ? ACCENT_LIGHT : "var(--text-subtle)", transition: "color 0.2s, transform 0.2s", display: "inline-block", transform: hovered ? "translateX(3px)" : "translateX(0)" }}>→</span>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, disabled, danger }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ padding: "9px 14px", background: hover && !disabled ? (danger ? "rgba(220,60,60,0.12)" : ACCENT_DIM) : "transparent", border: "none", textAlign: "left", fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit", color: danger ? "#e06c6c" : hover ? ACCENT_LIGHT : "var(--text)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, transition: "background 0.12s, color 0.12s" }}
    >
      {label}
    </button>
  );
}
