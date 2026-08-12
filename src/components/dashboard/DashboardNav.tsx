"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  userName: string;
  systemName: string;
  systemHref: string;
  backLabel?: string;
  /** Cor de destaque do sistema atual (hex) — tinge o avatar do usuário. Sem isso, usa o dourado padrão. */
  accentColor?: string;
  /** Quando definido, mostra um botão "Exportar PDF" que aciona esta função (ex: `() => window.print()`). */
  onExportPdf?: () => void;
}

export function DashboardNav({ userName, systemName, systemHref, backLabel, accentColor, onExportPdf }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "rgba(7,9,15,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        className="dashboard-nav-bar"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left — breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
          <Link
            href={systemHref}
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ← {backLabel ?? "Sistemas"}
          </Link>
          <span style={{ color: "var(--text-subtle)", fontSize: "0.8rem", flexShrink: 0 }}>/</span>
          <span
            className="dashboard-nav-crumb"
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text)",
              fontFamily: "var(--font-cinzel), serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {systemName}
          </span>
        </div>

        {/* Right — export + user menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {onExportPdf && (
            <button
              className="no-print"
              onClick={onExportPdf}
              aria-label="Exportar ficha em PDF"
              title="Exportar ficha em PDF"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
                padding: "6px 12px",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                fontWeight: 500,
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              🖨️ PDF
            </button>
          )}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu do usuário"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-full)",
              padding: "5px 12px 5px 8px",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: "0.82rem",
              fontWeight: 500,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: accentColor ? `${accentColor}22` : "var(--accent-dim)",
                border: `1px solid ${accentColor ? `${accentColor}55` : "var(--border-accent)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: accentColor ?? "var(--accent-light)",
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            {userName.split(" ")[0]}
            <span style={{ color: "var(--text-subtle)", fontSize: "0.7rem" }}>▾</span>
          </button>

          {menuOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 10 }}
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: 180,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Conectado como</p>
                  <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)", marginTop: 1 }}>
                    {userName}
                  </p>
                </div>

                <button
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    color: "#f87171",
                    fontSize: "0.84rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
