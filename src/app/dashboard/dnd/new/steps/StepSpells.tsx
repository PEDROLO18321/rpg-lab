"use client";

import { useState } from "react";
import { SPELLCASTING, getSpellsForClass, SCHOOL_COLORS } from "@/lib/dnd/spells";
import type { Spell } from "@/lib/dnd/spells";
import { CLASSES } from "@/lib/dnd/classes";
import type { WizardData } from "../CharacterWizard";

interface Props {
  classId:          string | null;
  selectedCantrips: string[];
  selectedSpells:   string[];
  onChange:         (p: Partial<WizardData>) => void;
}

export function StepSpells({ classId, selectedCantrips, selectedSpells, onChange }: Props) {
  const config  = classId ? SPELLCASTING[classId] : null;
  const cls     = CLASSES.find((c) => c.id === classId);
  const cantrips = classId ? getSpellsForClass(classId, 0)  : [];
  const spells1  = classId ? getSpellsForClass(classId, 1)  : [];

  if (!config) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <StepHeader />
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8H3.5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/></svg>
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {cls?.name ?? "Esta classe"} não conjura magias no nível 1
          </p>
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.6 }}>
            Seu personagem usa força, habilidade e técnica para vencer batalhas.
            Magias podem ser desbloqueadas com itens ou multiclasse em níveis futuros.
          </p>
        </div>
      </div>
    );
  }

  function toggleCantrip(id: string) {
    if (!config) return;
    if (selectedCantrips.includes(id)) {
      onChange({ selectedCantrips: selectedCantrips.filter((x) => x !== id) });
    } else if (selectedCantrips.length < config.cantripsKnown) {
      onChange({ selectedCantrips: [...selectedCantrips, id] });
    }
  }

  function toggleSpell(id: string) {
    if (!config) return;
    if (selectedSpells.includes(id)) {
      onChange({ selectedSpells: selectedSpells.filter((x) => x !== id) });
    } else if (selectedSpells.length < config.spellsKnown) {
      onChange({ selectedSpells: [...selectedSpells, id] });
    }
  }

  const cantripsDone = selectedCantrips.length >= config.cantripsKnown;
  const spellsDone   = selectedSpells.length   >= config.spellsKnown;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <StepHeader />

      {/* Spellcasting summary */}
      <div
        style={{
          background: "var(--accent-dim)",
          border: "1px solid var(--border-accent)",
          borderRadius: "var(--radius-xl)",
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <InfoChip label="Habilidade" value={config.ability} accent />
        <InfoChip label="Espaços (1°)" value={String(config.spellSlots1st)} />
        {config.cantripsKnown > 0 && (
          <InfoChip label="Truques" value={String(config.cantripsKnown)} />
        )}
        <InfoChip
          label={config.type === "known" ? "Magias Conhecidas" : "Magias Preparadas"}
          value={String(config.spellsKnown)}
        />
        {config.type === "prepare" && (
          <InfoChip label="Tipo" value="Preparação diária" />
        )}
      </div>

      {/* Cantrips section */}
      {config.cantripsKnown > 0 && (
        <SpellSection
          title="Truques (Cantrips)"
          subtitle={`Escolha ${config.cantripsKnown} truque${config.cantripsKnown > 1 ? "s" : ""}`}
          selected={selectedCantrips}
          count={config.cantripsKnown}
          done={cantripsDone}
          spells={cantrips}
          onToggle={toggleCantrip}
        />
      )}

      {/* Level 1 spells section */}
      <SpellSection
        title="Magias de 1° Nível"
        subtitle={
          config.type === "known"
            ? `Escolha ${config.spellsKnown} magia${config.spellsKnown > 1 ? "s" : ""} conhecida${config.spellsKnown > 1 ? "s" : ""}`
            : `Escolha ${config.spellsKnown} magia${config.spellsKnown > 1 ? "s" : ""} para preparar hoje (varia com modificador)`
        }
        selected={selectedSpells}
        count={config.spellsKnown}
        done={spellsDone}
        spells={spells1}
        onToggle={toggleSpell}
      />
    </div>
  );
}

/* ── Section header ── */
function StepHeader() {
  return (
    <div>
      <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
        Passo 7 · Magias
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
        Escolha suas <span className="text-gold">Magias</span>
      </h2>
      <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        Selecione os truques e magias que seu personagem conhece ao iniciar sua aventura.
      </p>
    </div>
  );
}

/* ── Info chip ── */
function InfoChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: accent ? "rgba(201,148,31,0.15)" : "var(--surface-2)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "8px 12px",
      }}
    >
      <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: accent ? "var(--accent-light)" : "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}

/* ── Spell section ── */
function SpellSection({
  title, subtitle, selected, count, done, spells, onToggle,
}: {
  title:    string;
  subtitle: string;
  selected: string[];
  count:    number;
  done:     boolean;
  spells:   Spell[];
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.92rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {title}
          </p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2 }}>
            {subtitle}
          </p>
        </div>
        <div
          style={{
            padding: "5px 14px",
            borderRadius: "var(--radius)",
            background: done ? "rgba(201,148,31,0.12)" : "var(--surface-2)",
            border: `1px solid ${done ? "var(--border-accent)" : "var(--border)"}`,
            fontSize: "0.76rem",
            fontWeight: 700,
            color: done ? "var(--accent-light)" : "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {selected.length}/{count} selecionadas
        </div>
      </div>

      {spells.length === 0 ? (
        <div
          style={{
            padding: "24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            textAlign: "center",
            color: "var(--text-subtle)",
            fontSize: "0.82rem",
          }}
        >
          Nenhuma magia disponível para esta classe neste nível.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 10,
          }}
        >
          {spells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell}
              selected={selected.includes(spell.id)}
              disabled={!selected.includes(spell.id) && selected.length >= count}
              onToggle={() => onToggle(spell.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Spell card ── */
function SpellCard({
  spell, selected, disabled, onToggle,
}: {
  spell:    Spell;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = SCHOOL_COLORS[spell.school] ?? "#888";

  return (
    <div
      style={{
        background: selected ? "var(--accent-dim)" : "var(--surface)",
        border: `1px solid ${selected ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
      }}
    >
      {/* Main row (clickable to select) */}
      <button
        onClick={onToggle}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "none",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        {/* Selection indicator */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: selected ? "var(--accent)" : "var(--surface-3)",
            border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
            flexShrink: 0,
            marginTop: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected && (
            <span style={{ fontSize: "0.6rem", color: "#06090f", fontWeight: 900 }}>✓</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.86rem",
                fontWeight: 700,
                color: selected ? "var(--accent-light)" : "var(--text)",
              }}
            >
              {spell.name}
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                padding: "1px 6px",
                borderRadius: "var(--radius-xs)",
                background: `${color}22`,
                border: `1px solid ${color}44`,
                color: color,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {spell.school}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{spell.castingTime}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>·</span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{spell.range}</span>
          </div>
        </div>
      </button>

      {/* Expand button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          padding: "4px 14px 8px",
          background: "none",
          border: "none",
          borderTop: expanded ? "1px solid var(--border)" : "none",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "0.7rem",
          color: "var(--text-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {expanded ? "▲ ocultar" : "▼ detalhes"}
      </button>

      {expanded && (
        <div
          style={{
            padding: "0 14px 12px",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={{ marginBottom: 6 }}>{spell.description}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-subtle)" }}>
              <strong style={{ color: "var(--text-muted)" }}>Duração:</strong> {spell.duration}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
