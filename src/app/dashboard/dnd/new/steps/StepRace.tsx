"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { RACES, ABILITY_LABELS, formatBonuses } from "@/lib/dnd/races";
import type { Race, Subrace } from "@/lib/dnd/races";
import type { WizardData } from "../CharacterWizard";

import imgAnao       from "@/assets/D&D-Racas/Anoes.png";
import imgElfo       from "@/assets/D&D-Racas/Elfos.png";
import imgHalfling   from "@/assets/D&D-Racas/Halflings.png";
import imgHumano     from "@/assets/D&D-Racas/Humanos.png";
import imgDraconato  from "@/assets/D&D-Racas/Draconatos.png";
import imgGnomo      from "@/assets/D&D-Racas/Gnomos.png";
import imgMeioElfo   from "@/assets/D&D-Racas/Meio-Elfos.png";
import imgMeioOrc    from "@/assets/D&D-Racas/Meio-Orcs.png";
import imgTiefling   from "@/assets/D&D-Racas/Tiefling.png";

const RACE_IMAGES: Record<string, StaticImageData> = {
  "anao":      imgAnao,
  "elfo":      imgElfo,
  "halfling":  imgHalfling,
  "humano":    imgHumano,
  "draconato": imgDraconato,
  "gnomo":     imgGnomo,
  "meio-elfo": imgMeioElfo,
  "meio-orc":  imgMeioOrc,
  "tiefling":  imgTiefling,
};

interface Props {
  selected:        string | null;
  selectedSubrace: string | null;
  charName:        string;
  onChange:        (partial: Partial<WizardData>) => void;
}

export function StepRace({ selected, selectedSubrace, charName, onChange }: Props) {
  const [hoveredRace, setHoveredRace] = useState<string | null>(null);

  const race: Race | undefined = RACES.find((r) => r.id === selected);
  const subrace: Subrace | undefined = race?.subraces.find((s) => s.id === selectedSubrace);

  function selectRace(raceId: string) {
    const r = RACES.find((x) => x.id === raceId)!;
    onChange({
      raceId,
      subraceId: r.subraces.length === 1 ? r.subraces[0].id : "",
      charName: charName,
    });
  }

  function pickRandomName() {
    if (!race) return;
    const allNames = [...race.names.male, ...race.names.female];
    const pick = allNames[Math.floor(Math.random() * allNames.length)];
    onChange({ charName: pick });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 1 · Raça
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
          Escolha a <span className="text-gold">Raça</span> do seu personagem
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          A raça define sua herança, bônus de atributos e traços inatos.
        </p>
      </div>

      {/* Race grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {RACES.map((r) => {
          const isSelected = selected === r.id;
          const isHovered  = hoveredRace === r.id;
          return (
            <button
              key={r.id}
              onClick={() => selectRace(r.id)}
              onMouseEnter={() => setHoveredRace(r.id)}
              onMouseLeave={() => setHoveredRace(null)}
              style={{
                background: isSelected ? "var(--accent-dim)" : "var(--surface)",
                border: `1px solid ${isSelected ? "var(--accent)" : isHovered ? "rgba(201,148,31,0.3)" : "var(--border)"}`,
                borderRadius: "var(--radius-xl)",
                padding: "18px 14px",
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
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {RACE_IMAGES[r.id] ? (
                  <Image
                    src={RACE_IMAGES[r.id]}
                    alt={r.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="72px"
                  />
                ) : (
                  <span style={{ fontSize: "1.8rem", lineHeight: "72px", display: "block", textAlign: "center" }}>{r.icon}</span>
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: isSelected ? "var(--accent-light)" : "var(--text)",
                }}
              >
                {r.name}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xs)",
                  padding: "2px 6px",
                }}
              >
                {formatBonuses(r.baseBonus)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel — shown when a race is selected */}
      {race && (
        <div
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
          {/* Race header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                position: "relative",
                flexShrink: 0,
                border: "1px solid var(--border-accent)",
              }}
            >
              {RACE_IMAGES[race.id] ? (
                <Image
                  src={RACE_IMAGES[race.id]}
                  alt={race.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="64px"
                />
              ) : (
                <span style={{ fontSize: "1.6rem", lineHeight: "64px", display: "block", textAlign: "center", background: "var(--accent-dim)" }}>{race.icon}</span>
              )}
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
                {race.name}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                {race.description}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 10,
            }}
          >
            {/* Base bonuses */}
            {(Object.entries(race.baseBonus) as [string, number][]).map(([key, val]) => (
              <StatChip
                key={key}
                label={ABILITY_LABELS[key as keyof typeof ABILITY_LABELS]}
                value={`+${val}`}
                accent
              />
            ))}
            {/* Subrace bonuses */}
            {subrace &&
              (Object.entries(subrace.bonus) as [string, number][]).map(([key, val]) => (
                <StatChip
                  key={`sub-${key}`}
                  label={`${ABILITY_LABELS[key as keyof typeof ABILITY_LABELS]} (sub-raça)`}
                  value={`+${val}`}
                  accent
                />
              ))}
            <StatChip label="Deslocamento" value={`${race.speed}m`} />
            <StatChip label="Tamanho" value={race.size} />
          </div>

          {/* Traits */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Traços Raciais
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[...race.traits, ...(subrace?.traits ?? [])].map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "0.76rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-xs)",
                    padding: "3px 10px",
                    color: "var(--text-muted)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Idiomas
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {race.languages.map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: "0.76rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-xs)",
                    padding: "3px 10px",
                    color: "var(--text-muted)",
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Subraces */}
          {race.subraces.length > 0 && (
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
                Sub-raça
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {race.subraces.map((sub) => {
                  const isSubSelected = selectedSubrace === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onChange({ subraceId: isSubSelected ? "" : sub.id })}
                      style={{
                        background: isSubSelected ? "var(--accent-dim)" : "var(--surface-2)",
                        border: `1px solid ${isSubSelected ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)",
                        padding: "14px 16px",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color: isSubSelected ? "var(--accent-light)" : "var(--text)",
                            marginBottom: 2,
                          }}
                        >
                          {sub.name}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          {sub.description}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          background: isSubSelected ? "var(--accent-dim)" : "var(--surface)",
                          border: `1px solid ${isSubSelected ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: "var(--radius-xs)",
                          padding: "3px 8px",
                          color: isSubSelected ? "var(--accent-light)" : "var(--text-muted)",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {formatBonuses(sub.bonus)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Name field */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              Nome do Personagem
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={charName}
                onChange={(e) => onChange({ charName: e.target.value })}
                placeholder={`Ex.: ${race.names.male[0]}`}
                maxLength={60}
                style={{
                  flex: 1,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <button
                type="button"
                onClick={pickRandomName}
                title="Sugerir nome"
                style={{
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text-muted)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-accent)";
                  e.currentTarget.style.color = "var(--accent-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                🎲 Aleatório
              </button>
            </div>

            {/* Name suggestions */}
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginBottom: 6 }}>
                Nomes masculinos:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {race.names.male.slice(0, 10).map((n) => (
                  <button
                    key={n}
                    onClick={() => onChange({ charName: n })}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xs)",
                      padding: "2px 8px",
                      fontSize: "0.74rem",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-accent)";
                      e.currentTarget.style.color = "var(--accent-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginBottom: 6, marginTop: 8 }}>
                Nomes femininos:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {race.names.female.slice(0, 10).map((n) => (
                  <button
                    key={n}
                    onClick={() => onChange({ charName: n })}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xs)",
                      padding: "2px 8px",
                      fontSize: "0.74rem",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-accent)";
                      e.currentTarget.style.color = "var(--accent-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {race.names.family && (
                <>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginBottom: 6, marginTop: 8 }}>
                    Sobrenomes / Clã:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {race.names.family.slice(0, 8).map((n) => (
                      <button
                        key={n}
                        onClick={() => onChange({ charName: charName ? `${charName} ${n}` : n })}
                        style={{
                          background: "none",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-xs)",
                          padding: "2px 8px",
                          fontSize: "0.74rem",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          transition: "border-color 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--border-accent)";
                          e.currentTarget.style.color = "var(--accent-light)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.color = "var(--text-muted)";
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}
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
      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: accent ? "var(--accent-light)" : "var(--text)" }}>
        {value}
      </span>
    </div>
  );
}
