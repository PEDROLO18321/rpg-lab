"use client";

import { useState } from "react";
import Link from "next/link";

const ACCENT       = "#c084fc";
const ACCENT_GLOW  = "rgba(168,85,247,0.22)";
const ACCENT_BORD  = "rgba(168,85,247,0.4)";
const ACCENT_BG    = "rgba(168,85,247,0.1)";

const ROLES = [
  {
    id: "jogador",
    label: "Edgerunner",
    subtitle: "Personagem Jogador",
    desc: "Crie e gerencie seus edgerunners. Acompanhe HP, armadura por local, Humanidade, ciberware e rolagens de d10 em tempo real.",
    href: "/dashboard/cyberpunk/jogador",
    cta: "Entrar como Edgerunner",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    id: "mestre",
    label: "Mestre",
    subtitle: "Game Master",
    desc: "Comande Night City. Gerencie campanhas, crie NPCs, use o bestiário, controle iniciativa e relógios de ameaça.",
    href: "/dashboard/cyberpunk/mestre",
    cta: "Entrar como Mestre",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
];

export function RoleSelectGrid() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
        maxWidth: 680,
        margin: "0 auto",
        alignItems: "stretch",
      }}
    >
      {ROLES.map((role) => {
        const isHovered = hovered === role.id;

        return (
          <Link
            key={role.id}
            href={role.href}
            style={{ textDecoration: "none", display: "flex" }}
            onMouseEnter={() => setHovered(role.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              style={{
                position: "relative",
                padding: "32px 28px 28px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: isHovered
                  ? `linear-gradient(135deg, ${ACCENT_BG} 0%, rgba(168,85,247,0.03) 100%)`
                  : "var(--surface)",
                border: `1px solid ${isHovered ? ACCENT_BORD : "rgba(255,255,255,0.07)"}`,
                borderRadius: "var(--radius-xl)",
                boxShadow: isHovered
                  ? `0 20px 56px rgba(0,0,0,0.5), 0 0 32px ${ACCENT_GLOW}`
                  : "0 4px 20px rgba(0,0,0,0.3)",
                transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "var(--radius-lg)",
                  background: isHovered ? `${ACCENT}22` : "var(--surface-2)",
                  border: `1px solid ${isHovered ? ACCENT_BORD : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isHovered ? ACCENT : "var(--text-muted)",
                  marginBottom: 20,
                  transition: "all 0.22s",
                }}
              >
                {role.icon}
              </div>

              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: isHovered ? ACCENT : "var(--text-subtle)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  transition: "color 0.2s",
                }}
              >
                {role.subtitle}
              </p>

              <h2
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 12,
                  lineHeight: 1.2,
                }}
              >
                {role.label}
              </h2>

              <p
                style={{
                  fontSize: "0.84rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                  flex: 1,
                }}
              >
                {role.desc}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  color: isHovered ? ACCENT : "var(--text-muted)",
                  transition: "color 0.2s",
                }}
              >
                {role.cta}
                <span
                  style={{
                    display: "inline-block",
                    transition: "transform 0.2s",
                    transform: isHovered ? "translateX(5px)" : "translateX(0)",
                  }}
                >
                  →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
