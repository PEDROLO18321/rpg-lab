"use client";

import { useState, useRef } from "react";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import type { Background } from "@/lib/dnd/backgrounds";
import type { WizardData } from "../CharacterWizard";

interface Props {
  selected: string | null;
  onChange: (partial: Partial<WizardData>) => void;
}

export function StepBackground({ selected, onChange }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const bg: Background | undefined = BACKGROUNDS.find((b) => b.id === selected);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 3 · Antecedente
        </span>
        <h2
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.2,
          }}
        >
          Escolha o <span className="text-gold">Antecedente</span> do seu personagem
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          O antecedente reflete a origem e experiência de vida do personagem antes de se tornar um aventureiro.
        </p>
      </div>

      {/* Background grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        {BACKGROUNDS.map((b) => {
          const isSelected = selected === b.id;
          const isHovered  = hovered === b.id;
          return (
            <button
              key={b.id}
              onClick={() => {
                  onChange({ backgroundId: isSelected ? "" : b.id });
                  if (!isSelected) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                }}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isSelected ? "var(--accent-dim)" : "var(--surface)",
                border: `1px solid ${isSelected ? "var(--accent)" : isHovered ? "rgba(201,148,31,0.3)" : "var(--border)"}`,
                borderRadius: "var(--radius-xl)",
                padding: "18px 12px",
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s",
                transform: isSelected || isHovered ? "translateY(-2px)" : "none",
                boxShadow: isSelected
                  ? "0 0 24px var(--accent-glow)"
                  : isHovered
                  ? "0 8px 24px rgba(0,0,0,0.25)"
                  : "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{b.icon}</span>
              <span
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: isSelected ? "var(--accent-light)" : "var(--text)",
                }}
              >
                {b.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {bg && (
        <div
          ref={detailRef}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-xl)",
            padding: "28px 28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "var(--radius-lg)",
                background: "var(--accent-dim)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                flexShrink: 0,
              }}
            >
              {bg.icon}
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--accent-light)",
                }}
              >
                {bg.name}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                {bg.description}
              </p>
            </div>
          </div>

          {/* Flavor */}
          <p
            style={{
              fontSize: "0.84rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
              borderLeft: "3px solid var(--accent)",
              paddingLeft: 14,
              lineHeight: 1.6,
            }}
          >
            {bg.flavor}
          </p>

          {/* Proficiency chips */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 10,
            }}
          >
            <InfoChip label="Perícias" value={bg.skills.join(", ")} accent />
            {bg.toolProficiencies.length > 0 && (
              <InfoChip label="Ferramentas" value={bg.toolProficiencies.join(", ")} />
            )}
            {bg.languages > 0 && (
              <InfoChip label="Idiomas" value={`+${bg.languages} à sua escolha`} />
            )}
          </div>

          {/* Feature */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Característica · {bg.feature}
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {bg.featureDesc}
            </p>
          </div>

          {/* Personality preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Características de Personalidade
            </p>
            <TraitList label="Traços" items={bg.personalityTraits} />
            <TraitList label="Ideais" items={bg.ideals} />
            <TraitList label="Vínculos" items={bg.bonds} />
            <TraitList label="Fraquezas" items={bg.flaws} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: accent ? "var(--accent-dim)" : "var(--surface-2)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "8px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: accent ? "var(--accent-light)" : "var(--text)" }}>
        {value}
      </span>
    </div>
  );
}

function TraitList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((item, i) => (
          <p key={i} style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}
