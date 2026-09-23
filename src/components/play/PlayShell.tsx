"use client";

// ─── Moldura comum das áreas de Jogar ────────────────────────────────────────
// Faixa full-width no topo (vitais, chips, alertas, condições ativas) e duas
// colunas: a larga é o que o personagem FAZ, a estreita é a mesa.
//
// O tema entra como custom property na própria subárvore, então qualquer
// `style={{ color: "var(--accent-light)" }}` lá no fundo da ficha pega a cor
// do sistema sem prop nem contexto — e o D&D, que já usava o dourado global,
// não muda em nada.

import { PLAY_THEME, type PlaySystem } from "./theme";
import "./play.css";

interface Props {
  system: PlaySystem;
  /** Vitais, chips derivados, alertas e condições ativas. */
  band?: React.ReactNode;
  /** Coluna larga: atributos, perícias, ações, recursos, inventário. */
  left: React.ReactNode;
  /** Coluna estreita: dados, histórico, condições, descanso, notas. */
  right: React.ReactNode;
}

export function PlayShell({ system, band, left, right }: Props) {
  const t = PLAY_THEME[system];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        // Projeção do tema: os mesmos valores que vão para o three.js como
        // literais, aqui na forma que o CSS inline já consome.
        "--accent": t.accent,
        "--accent-light": t.accentLight,
        "--accent-dim": t.accentDim,
        "--border-accent": t.accentBorder,
        "--accent-glow": t.glow,
        "--play-temp": t.temp,
      } as React.CSSProperties}
    >
      {band}

      <div
        className="play-two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>{left}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>{right}</div>
      </div>
    </div>
  );
}

/** Faixa de vitais: os cartões de recurso, lado a lado. */
export function PlayVitals({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="play-vitals"
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}
    >
      {children}
    </div>
  );
}

/** Linha de chips derivados (Defesa, Deslocamento, NEX, dinheiro…). */
export function PlayChips({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{children}</div>;
}

/**
 * Faixa de alerta: sangramento, resistências à morte, insanidade. Aparece
 * entre os vitais e as colunas, onde o jogador não tem como não ver.
 */
export function PlayAlert({
  title, tone = "danger", children,
}: {
  title: string;
  tone?: "danger" | "warn";
  children?: React.ReactNode;
}) {
  const color = tone === "danger" ? "#8b0000" : "#e0843c";
  const text = tone === "danger" ? "#ff4444" : "#e0843c";
  return (
    <div
      style={{
        background: tone === "danger" ? "rgba(139,0,0,0.15)" : "rgba(224,132,60,0.12)",
        border: `1px solid ${color}`,
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
      }}
    >
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: text, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: children ? 8 : 0 }}>
        {title}
      </p>
      {children}
    </div>
  );
}
