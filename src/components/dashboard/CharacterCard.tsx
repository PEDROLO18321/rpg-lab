"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  id: string;
  name: string;
  race: string | null;
  className: string | null;
  level: number;
}

export function CharacterCard({ id, name, race, className, level }: Props) {
  const [hovered, setHovered] = useState(false);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return (
    <Link
      href={`/dashboard/dnd/${id}`}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: "var(--surface)",
          border: `1px solid ${hovered ? "rgba(201,148,31,0.35)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: "var(--radius-xl)",
          padding: "22px 20px",
          cursor: "pointer",
          transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered
            ? "0 12px 40px rgba(201,148,31,0.12)"
            : "0 2px 10px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Avatar + nome */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius)",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--accent-light)",
              flexShrink: 0,
            }}
          >
            {initials}
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
              {[race, className].filter(Boolean).join(" · ") || "Sem ficha ainda"}
            </p>
          </div>
        </div>

        {/* Nível + seta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--border)",
            paddingTop: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Nível
            </span>
            <span
              style={{
                background: "var(--accent-dim)",
                border: "1px solid var(--border-accent)",
                borderRadius: "var(--radius-xs)",
                padding: "1px 8px",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--accent-light)",
              }}
            >
              {level}
            </span>
          </div>
          <span
            style={{
              fontSize: "0.82rem",
              color: hovered ? "var(--accent-light)" : "var(--text-subtle)",
              transition: "color 0.2s, transform 0.2s",
              display: "inline-block",
              transform: hovered ? "translateX(3px)" : "translateX(0)",
            }}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
