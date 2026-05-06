"use client";

import { useState, useRef } from "react";
import { CLASSES } from "@/lib/dnd/classes";
import type { DndClass } from "@/lib/dnd/classes";
import type { WizardData } from "../CharacterWizard";

interface Props {
  selected: string | null;
  onChange: (partial: Partial<WizardData>) => void;
}

export function StepClass({ selected, onChange }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const cls: DndClass | undefined = CLASSES.find((c) => c.id === selected);

  function selectClass(classId: string) {
    onChange({ classId, subclassId: "", selectedSkills: [] });
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 2 · Classe
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
          Escolha a <span className="text-gold">Classe</span> do seu personagem
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          A classe define seu papel, habilidades e progressão durante as aventuras.
        </p>
      </div>

      {/* Class grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        {CLASSES.map((c) => {
          const isSelected = selected === c.id;
          const isHovered  = hovered === c.id;
          return (
            <button
              key={c.id}
              onClick={() => selectClass(c.id)}
              onMouseEnter={() => setHovered(c.id)}
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
              <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{c.icon}</span>
              <span
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: isSelected ? "var(--accent-light)" : "var(--text)",
                }}
              >
                {c.name}
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xs)",
                  padding: "2px 6px",
                }}
              >
                D{c.hitDie}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {cls && (
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
              {cls.icon}
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
                {cls.name}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                {cls.description}
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
            {cls.flavor}
          </p>

          {/* Stats chips */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
            }}
          >
            <StatChip label="Dado de Vida" value={`D${cls.hitDie}`} accent />
            <StatChip label="Atributos Primários" value={cls.primaryAbilities.join(", ")} />
            <StatChip label="Saves" value={cls.savingThrows.join(", ")} />
            {cls.spellcasting && cls.spellcastingAbility && (
              <StatChip label="Atrib. Magia" value={cls.spellcastingAbility} accent />
            )}
          </div>

          {/* Proficiencies */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ProfRow label="Armaduras" items={cls.armorProficiencies} />
            <ProfRow label="Armas" items={cls.weaponProficiencies} />
            {cls.toolProficiencies.length > 0 && (
              <ProfRow label="Ferramentas" items={cls.toolProficiencies} />
            )}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Perícias — escolha {cls.skillCount}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cls.skillChoices.map((sk) => (
                  <span
                    key={sk}
                    style={{
                      fontSize: "0.76rem",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xs)",
                      padding: "3px 10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key features — level 1 only */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              Habilidades de Classe · Nível 1
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cls.keyFeatures.filter((f) => {
                const m = f.match(/\((\d+)°\)/);
                return !m || parseInt(m[1]) <= 1;
              }).map((f) => {
                const [title, ...rest] = f.split(" — ");
                return (
                  <div
                    key={f}
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      gap: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>
                      {title}
                    </span>
                    {rest.length > 0 && <span>— {rest.join(" — ")}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Starting equipment */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Equipamento Inicial
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {cls.startingEquipment.map((eq) => (
                <p key={eq} style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  • {eq}
                </p>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
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

function ProfRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.length === 0
          ? <span style={{ fontSize: "0.76rem", color: "var(--text-subtle)" }}>—</span>
          : items.map((item) => (
            <span
              key={item}
              style={{
                fontSize: "0.76rem",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xs)",
                padding: "3px 10px",
                color: "var(--text-muted)",
              }}
            >
              {item}
            </span>
          ))
        }
      </div>
    </div>
  );
}
