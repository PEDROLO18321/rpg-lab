"use client";

import { useState } from "react";
import Link from "next/link";

const ROLES = [
  {
    id: "jogador",
    label: "Jogador",
    subtitle: "Player Character",
    desc: "Crie e gerencie seus personagens. Preencha fichas interativas, acompanhe atributos, magias e equipamentos em tempo real.",
    href: "/dashboard/dnd/jogador",
    accentColor: "#c9941f",
    accentGlow: "rgba(201,148,31,0.22)",
    borderAccent: "rgba(201,148,31,0.4)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
        <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
        <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
        <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/>
        <path d="M10 9.5C10 8.67 9.33 8 8.5 8H3.5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/>
      </svg>
    ),
    cta: "Entrar como Jogador",
  },
  {
    id: "mestre",
    label: "Mestre",
    subtitle: "Dungeon Master",
    desc: "Comande a aventura. Gerencie campanhas, crie NPCs, organize encontros e conduza histórias épicas.",
    href: "/dashboard/dnd/mestre",
    accentColor: "#a78bfa",
    accentGlow: "rgba(167,139,250,0.22)",
    borderAccent: "rgba(167,139,250,0.4)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    cta: "Entrar como Mestre",
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
                  ? `linear-gradient(135deg, rgba(${role.id === "jogador" ? "201,148,31" : "167,139,250"},0.1) 0%, rgba(${role.id === "jogador" ? "201,148,31" : "167,139,250"},0.03) 100%)`
                  : "var(--surface)",
                border: `1px solid ${isHovered ? role.borderAccent : "rgba(255,255,255,0.07)"}`,
                borderRadius: "var(--radius-xl)",
                boxShadow: isHovered
                  ? `0 20px 56px rgba(0,0,0,0.5), 0 0 32px ${role.accentGlow}`
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
                  background: isHovered ? `${role.accentColor}22` : "var(--surface-2)",
                  border: `1px solid ${isHovered ? role.borderAccent : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isHovered ? role.accentColor : "var(--text-muted)",
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
                  color: isHovered ? role.accentColor : "var(--text-subtle)",
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
                  color: isHovered ? role.accentColor : "var(--text-muted)",
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
