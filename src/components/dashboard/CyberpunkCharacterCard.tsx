"use client";

// Os retratos de personagem são data-URLs base64 geradas por upload local
// (FileReader.readAsDataURL). next/image não otimiza data-URLs — usar <img>
// aqui é a escolha correta, não um descuido.
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LinkPending } from "./LinkPending";
import { useEffect, useRef, useState } from "react";

const ACCENT_LIGHT = "#c084fc";
const ACCENT_DIM   = "rgba(168,85,247,0.14)";
const ACCENT_BORD  = "rgba(168,85,247,0.34)";

interface Props {
  id: string;
  name: string;
  /** Papel já traduzido ("Netrunner"); null enquanto a ficha não existe. */
  roleName: string | null;
  roleRank: number;
  hpCurrent: number;
  hpMax: number;
  humanity: number;
  humanityMax: number;
  portraitUrl?: string | null;
}

export function CyberpunkCharacterCard({ id, name, roleName, roleRank, hpCurrent, hpMax, humanity, humanityMax, portraitUrl }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<null | "duplicar" | "excluir">(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = name.split(" ").slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
  const pvPct = Math.max(0, Math.min(100, (hpCurrent / Math.max(1, hpMax)) * 100));
  const pvColor = pvPct > 60 ? ACCENT_LIGHT : pvPct > 30 ? "#f0b429" : "#ef6b6b";
  // Humanidade pode ficar negativa (ciberpsicose); a barra só mostra de 0 a 100%.
  const humPct = Math.max(0, Math.min(100, (humanity / Math.max(1, humanityMax)) * 100));

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setMenuOpen(false); setConfirmDelete(false); }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  // O cartão inteiro já é um link; isto serve só ao item "Visualizar" do menu,
  // que é um botão e não pode virar âncora dentro de outra âncora.
  function openSheet() { router.push(`/dashboard/cyberpunk/${id}`); }

  async function duplicate() {
    if (busy) return;
    setBusy("duplicar");
    try {
      const res = await fetch(`/api/cyberpunk/characters/${id}/duplicate`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally { setBusy(null); setMenuOpen(false); }
  }

  async function remove() {
    if (busy) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setBusy("excluir");
    try {
      const res = await fetch(`/api/cyberpunk/characters/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally { setBusy(null); setMenuOpen(false); setConfirmDelete(false); }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Foco também acende o cartão: o botão de opções fica com opacity 0 fora
      // do hover, e quem navega por teclado o alcançaria invisível.
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false); }}
      style={{
        position: "relative", zIndex: menuOpen ? 20 : hovered ? 2 : 1,
        background: "linear-gradient(180deg, rgba(26,16,44,0.9) 0%, rgba(14,10,24,0.95) 100%)",
        border: `1px solid ${hovered ? ACCENT_BORD : "rgba(255,255,255,0.08)"}`,
        borderRadius: 8,
        padding: "22px 20px", cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 40px rgba(168,85,247,0.22)" : "0 2px 10px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      {/* O link cobre o cartão todo, atrás do conteúdo — é ele que dá o
          prefetch, o foco por teclado e o menu de contexto do navegador. */}
      <Link
        href={`/dashboard/cyberpunk/${id}`}
        aria-label={`Abrir a ficha de ${name}`}
        style={{ position: "absolute", inset: 0, zIndex: 1, borderRadius: 8 }}
      >
        <LinkPending />
      </Link>

      <div ref={menuRef} style={{ position: "absolute", top: 12, right: 12, zIndex: 5 }} role="presentation" onClick={(e) => e.stopPropagation()}>
        <button
          aria-label="Opções do personagem"
          className="card-menu-btn"
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
        <div style={{ width: 44, height: 44, borderRadius: 6, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", fontWeight: 700, color: ACCENT_LIGHT, flexShrink: 0, overflow: "hidden" }}>
          {portraitUrl ? <img src={portraitUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2 }}>{roleName ? `${roleName} · Grau ${roleRank}` : "Sem ficha ainda"}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>HP</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: pvColor }}>{hpCurrent}<span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>/{hpMax}</span></span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pvPct}%`, background: pvColor, borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Humanidade</span>
          <span style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xs)", padding: "1px 8px", fontSize: "0.8rem", fontWeight: 700, color: humPct < 30 ? "#ef6b6b" : ACCENT_LIGHT }}>{humanity}/{humanityMax}</span>
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
