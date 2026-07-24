"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import dndImg           from "@/assets/systems/D&D.png";
import tormentaImg      from "@/assets/systems/Tormenta.png";
import cthulhuImg       from "@/assets/systems/CallofCthulhu.png";
import ordemImg         from "@/assets/systems/OrdemParanormal.png";
import starWarsImg      from "@/assets/systems/StarWars.png";

const SYSTEMS = [
  {
    id: "dnd",
    name: "Dungeons & Dragons",
    edition: "5ª Edição",
    description:
      "O RPG de fantasia mais icônico do mundo. Crie heróis, explore masmorras e enfrente dragões com o clássico sistema d20.",
    image: dndImg,
    status: "available" as const,
    href: "/dashboard/dnd",
    accentColor: "#c9941f",
    accentGlow: "rgba(201,148,31,0.2)",
    borderAccent: "rgba(201,148,31,0.38)",
    badgeCls: "badge badge-available",
    badgeLabel: "Disponível",
  },
  {
    id: "cthulhu",
    name: "Call of Cthulhu",
    edition: "7ª Edição",
    description:
      "Horror cósmico e investigação. Enfrente criaturas além da compreensão humana e preserve — ou perca — sua sanidade.",
    image: cthulhuImg,
    status: "available" as const,
    href: "/dashboard/cthulhu",
    accentColor: "#6b7a3a",
    accentGlow: "rgba(107,122,58,0.2)",
    borderAccent: "rgba(107,122,58,0.38)",
    badgeCls: "badge badge-available",
    badgeLabel: "Disponível",
  },
  {
    id: "ordem",
    name: "Ordem Paranormal",
    edition: "Versão 1.3",
    description:
      "Agentes enfrentam o Outro Lado numa narrativa de horror e mistério. Sistema de sanidade, traumas e poderes paranormais.",
    image: ordemImg,
    status: "available" as const,
    href: "/dashboard/ordem",
    accentColor: "#ffffff",
    accentGlow: "rgba(255,255,255,0.2)",
    borderAccent: "rgba(255,255,255,0.38)",
    badgeCls: "badge badge-available",
    badgeLabel: "Disponível",
  },
  {
    id: "tormenta",
    name: "Tormenta 20",
    edition: "Edição 2020",
    description:
      "O RPG nacional de maior sucesso. Fantasia épica com sabor brasileiro, magia, deuses e o caos da Tormenta.",
    image: tormentaImg,
    status: "available" as const,
    href: "/dashboard/tormenta",
    accentColor: "#a01818",
    accentGlow: "rgba(160,24,24,0.2)",
    borderAccent: "rgba(160,24,24,0.38)",
    badgeCls: "badge badge-available",
    badgeLabel: "Disponível",
  },
  {
    id: "starwars",
    name: "Star Wars: Além da Fronteira",
    edition: "Sistema Autoral",
    description:
      "Sistema de RPG autoral numa linha do tempo alternativa, focado na exploração das Regiões Desconhecidas. 35 espécies, 23 classes e progressão até o nível 99.",
    image: starWarsImg,
    status: "available" as const,
    href: "/dashboard/starwars",
    accentColor: "#3b82c4",
    accentGlow: "rgba(59,130,196,0.2)",
    borderAccent: "rgba(59,130,196,0.38)",
    badgeCls: "badge badge-available",
    badgeLabel: "Disponível",
  },
];

export default function SystemSelectPage() {
  const router  = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  function handleSelect(sys: (typeof SYSTEMS)[number]) {
    if (sys.status !== "available" || !sys.href) return;
    router.push(sys.href);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Home button */}
      <div style={{ position: "absolute", top: 20, left: 24, zIndex: 10 }}>
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            padding: "6px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
          }}
        >
          ← Início
        </a>
      </div>

      {/* ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 65% 45% at 50% 15%, rgba(201,148,31,0.055) 0%, transparent 65%)",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 52, position: "relative", zIndex: 1 }}>
        <span className="section-label" style={{ display: "block", marginBottom: 12 }}>
          RPG Lab
        </span>
        <h1
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          Escolha o <span className="text-gold">sistema</span>
        </h1>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--text-muted)",
            maxWidth: 400,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          Selecione o sistema de RPG que deseja utilizar. Novos sistemas serão adicionados em breve.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: 780,
          position: "relative",
          zIndex: 1,
        }}
      >
        {SYSTEMS.map((sys) => {
          const isActive  = sys.status === "available";
          const isHovered = hovered === sys.id && isActive;

          return (
            <div
              key={sys.id}
              role={isActive ? "button" : undefined}
              tabIndex={isActive ? 0 : undefined}
              onClick={() => handleSelect(sys)}
              onKeyDown={(e) => e.key === "Enter" && handleSelect(sys)}
              onMouseEnter={() => setHovered(sys.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "stretch",
                gap: 20,
                background: "var(--surface)",
                border: `1px solid ${isHovered ? sys.borderAccent : "rgba(255,255,255,0.07)"}`,
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                cursor: isActive ? "pointer" : "default",
                transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
                transform: isHovered ? "translateX(4px)" : "translateX(0)",
                boxShadow: isHovered
                  ? `0 14px 40px ${sys.accentGlow}, 0 0 0 1px ${sys.borderAccent}`
                  : "0 2px 16px rgba(0,0,0,0.25)",
                opacity: isActive ? 1 : 0.6,
                userSelect: "none",
              }}
            >
              {/* Image (square) */}
              <div style={{ position: "relative", width: 128, height: 128, flexShrink: 0 }}>
                <Image
                  src={sys.image}
                  alt={sys.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="128px"
                />

                {/* gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(7,9,15,0.05) 0%, rgba(7,9,15,0.55) 100%)",
                  }}
                />

                {/* locked overlay */}
                {!isActive && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(7,9,15,0.55)",
                      backdropFilter: "blur(3px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                  </div>
                )}

                {/* badge over image */}
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <span className={sys.badgeCls} style={{ fontSize: "0.6rem", padding: "3px 8px" }}>{sys.badgeLabel}</span>
                </div>
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "14px 20px 14px 0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-cinzel), serif",
                      fontSize: "1.02rem",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {sys.name}
                  </h2>

                  {isActive && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: isHovered ? sys.accentColor : "var(--text-muted)",
                        transition: "color 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Selecionar
                      <span
                        style={{
                          display: "inline-block",
                          transition: "transform 0.2s",
                          transform: isHovered ? "translateX(4px)" : "translateX(0)",
                        }}
                      >
                        →
                      </span>
                    </div>
                  )}
                </div>

                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: sys.accentColor,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {sys.edition}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {sys.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          marginTop: 40,
          fontSize: "0.76rem",
          color: "var(--text-subtle)",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        Mais sistemas em desenvolvimento. Fique atento às atualizações.
      </p>
    </div>
  );
}
