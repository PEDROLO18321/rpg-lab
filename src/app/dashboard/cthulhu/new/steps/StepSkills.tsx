"use client";

import { useState, useMemo, useEffect } from "react";
import {
  OCCUPATIONS, SKILLS, calcOccupationPoints, getSkillBase, getSkillsForEra,
  type Occupation,
} from "@/lib/cthulhu/data";
import type { WizardData } from "../CthulhuWizard";

const ACCENT       = "#7d9c3e";
const ACCENT_LIGHT  = "#a3b86c";
const ACCENT_DIM   = "rgba(125,156,62,0.12)";
const ACCENT_BORD  = "rgba(125,156,62,0.28)";

interface Props {
  data: Partial<WizardData>;
  onChange: (p: Partial<WizardData>) => void;
}

export function StepSkills({ data, onChange }: Props) {
  const attrs = data.attrs!;
  const era   = data.era ?? "1920s";

  const [selectedOccId, setSelectedOccId] = useState(data.occupationId ?? "");
  const [occPoints,  setOccPoints]  = useState<Record<string, number>>(data.occupationSkills ?? {});
  const [intPoints,  setIntPoints]  = useState<Record<string, number>>(data.interestSkills   ?? {});
  const [freeSlots,  setFreeSlots]  = useState<string[]>([]); // free occupation skill choices

  const availableSkills = useMemo(() => getSkillsForEra(era), [era]);

  const selectedOcc = OCCUPATIONS.find((o) => o.id === selectedOccId) ?? null;

  const totalOccPoints    = selectedOcc ? calcOccupationPoints(selectedOcc.formula, attrs) : 0;
  const usedOccPoints     = Object.values(occPoints).reduce((a, b) => a + b, 0);
  const remainingOccPoints = totalOccPoints - usedOccPoints;

  const totalIntPoints     = attrs.int * 2;
  const usedIntPoints      = Object.values(intPoints).reduce((a, b) => a + b, 0);
  const remainingIntPoints = totalIntPoints - usedIntPoints;

  function skillBase(id: string) {
    const s = availableSkills.find((sk) => sk.id === id);
    if (!s) return 0;
    return getSkillBase(s, attrs.edu, attrs.des);
  }

  function skillTotal(id: string) {
    return skillBase(id) + (occPoints[id] ?? 0) + (intPoints[id] ?? 0);
  }

  function adjustOcc(id: string, delta: number) {
    const current  = occPoints[id] ?? 0;
    const newVal   = Math.max(0, current + delta);
    const wouldUse = usedOccPoints - current + newVal;
    if (wouldUse > totalOccPoints) return;
    setOccPoints((p) => ({ ...p, [id]: newVal }));
  }

  function adjustInt(id: string, delta: number) {
    if (id === "mythos") return;
    const current = intPoints[id] ?? 0;
    const newVal  = Math.max(0, current + delta);
    const wouldUse = usedIntPoints - current + newVal;
    if (wouldUse > totalIntPoints) return;
    setIntPoints((p) => ({ ...p, [id]: newVal }));
  }

  function onOccInput(id: string, raw: string) {
    const newVal = Math.max(0, parseInt(raw) || 0);
    const wouldUse = usedOccPoints - (occPoints[id] ?? 0) + newVal;
    if (wouldUse > totalOccPoints) return;
    setOccPoints((p) => ({ ...p, [id]: newVal }));
  }

  function onIntInput(id: string, raw: string) {
    if (id === "mythos") return;
    const newVal = Math.max(0, parseInt(raw) || 0);
    const wouldUse = usedIntPoints - (intPoints[id] ?? 0) + newVal;
    if (wouldUse > totalIntPoints) return;
    setIntPoints((p) => ({ ...p, [id]: newVal }));
  }

  const creditPoints = occPoints["nivel_credito"] ?? 0;

  function adjustCredit(delta: number) {
    if (!selectedOcc) return;
    const current = occPoints["nivel_credito"] ?? 0;
    const newVal  = Math.max(0, Math.min(selectedOcc.creditRange[1], current + delta));
    const wouldUse = usedOccPoints - current + newVal;
    if (wouldUse > totalOccPoints) return;
    setOccPoints((p) => ({ ...p, nivel_credito: newVal }));
  }

  function setCreditDirect(raw: string) {
    if (!selectedOcc) return;
    const newVal   = Math.max(0, Math.min(selectedOcc.creditRange[1], parseInt(raw) || 0));
    const current  = occPoints["nivel_credito"] ?? 0;
    const wouldUse = usedOccPoints - current + newVal;
    if (wouldUse > totalOccPoints) return;
    setOccPoints((p) => ({ ...p, nivel_credito: newVal }));
  }

  function selectOcc(occ: Occupation) {
    setSelectedOccId(occ.id);
    setOccPoints({});
    setFreeSlots(Array(occ.freeSkillCount).fill(""));
  }

  function setFreeSlot(idx: number, skillId: string) {
    const old = freeSlots[idx];
    if (old && old !== skillId) {
      // Remove points from old free slot if any
      setOccPoints((p) => { const n = { ...p }; delete n[old]; return n; });
    }
    setFreeSlots((prev) => {
      const next = [...prev];
      next[idx] = skillId;
      return next;
    });
  }

  const allOccSkills = useMemo(() => {
    if (!selectedOcc) return [];
    return [
      ...selectedOcc.fixedSkills,
      ...freeSlots.filter(Boolean),
    ];
  }, [selectedOcc, freeSlots]);

  useEffect(() => {
    onChange({ occupationId: selectedOccId, occupationSkills: occPoints, interestSkills: intPoints });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOccId, occPoints, intPoints]);

  const formulaLabel = (f: string) => f.replace("×", " × ").replace("+", " + ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>Etapa 2</span>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 700, color: "var(--text)" }}>
          Ocupação e <span style={{ color: ACCENT }}>Perícias</span>
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.7 }}>
          Escolha uma ocupação e distribua os pontos entre as perícias profissionais. Depois aplique os pontos de interesses pessoais.
        </p>
      </div>

      {/* Occupation select */}
      <div>
        <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Escolher Ocupação
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {OCCUPATIONS.map((occ) => {
            const pts = calcOccupationPoints(occ.formula, attrs);
            const sel = selectedOccId === occ.id;
            return (
              <button
                key={occ.id}
                onClick={() => selectOcc(occ)}
                style={{
                  padding: "12px 14px",
                  background: sel ? ACCENT_DIM : "var(--surface)",
                  border: `1px solid ${sel ? ACCENT_BORD : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "var(--radius)",
                  textAlign: "left", cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)", marginBottom: 4 }}>
                  {occ.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 3 }}>{occ.desc}</div>
                <div style={{ fontSize: "0.68rem", color: sel ? ACCENT : "var(--text-subtle)", fontWeight: 700 }}>
                  {formulaLabel(occ.formula)} = <span style={{ color: sel ? ACCENT_LIGHT : "var(--text-muted)" }}>{pts} pts</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedOcc && (
        <>
          {/* Free skill slots */}
          {freeSlots.length > 0 && (
            <div>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Escolhas Livres ({freeSlots.length} perícia{freeSlots.length > 1 ? "s" : ""})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {freeSlots.map((slot, idx) => (
                  <select
                    key={idx}
                    value={slot}
                    onChange={(e) => setFreeSlot(idx, e.target.value)}
                    style={{
                      background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`,
                      borderRadius: "var(--radius)", padding: "8px 10px",
                      color: "var(--text)", fontSize: "0.84rem", cursor: "pointer",
                    }}
                  >
                    <option value="">— Escolher perícia livre {idx + 1} —</option>
                    {availableSkills
                      .filter((s) => s.id !== "mythos" && !selectedOcc.fixedSkills.includes(s.id) && !freeSlots.filter((_, i) => i !== idx).includes(s.id))
                      .map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                    }
                  </select>
                ))}
              </div>
            </div>
          )}

          {/* Credit Rating — mandatory occupation allocation */}
          {(() => {
            const min = selectedOcc.creditRange[0];
            const max = selectedOcc.creditRange[1];
            const below = creditPoints < min;
            const above = creditPoints > max;
            const bad   = below || above;
            const tier  = creditTierLabel(creditPoints);
            return (
              <div style={{
                padding: "14px 16px",
                background: bad ? "rgba(200,40,40,0.08)" : creditPoints >= min ? ACCENT_DIM : "var(--surface)",
                border: `1px solid ${bad ? "rgba(200,40,40,0.35)" : creditPoints >= min ? ACCENT_BORD : "var(--border)"}`,
                borderRadius: "var(--radius)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Nível de Crédito{" "}
                      <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-subtle)" }}>
                        (obrigatório: {min}–{max})
                      </span>
                    </div>
                    <div style={{ fontSize: "0.7rem", color: bad ? "#e06c6c" : creditPoints >= min ? ACCENT_LIGHT : "var(--text-subtle)", marginTop: 2 }}>
                      {below ? `mínimo ${min} pts obrigatório` : above ? `máximo ${max} pts excedido` : tier !== "—" ? `${tier} — padrão de vida` : "aloque pontos abaixo"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => adjustCredit(-5)}
                      style={{ width: 24, height: 24, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 3, cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >−</button>
                    <input
                      type="number"
                      value={creditPoints}
                      min={0}
                      max={max}
                      onChange={(e) => setCreditDirect(e.target.value)}
                      style={{
                        width: 54, textAlign: "center",
                        background: "var(--surface-2)",
                        border: `1px solid ${bad ? "rgba(200,40,40,0.5)" : creditPoints >= min ? ACCENT_BORD : "var(--border)"}`,
                        borderRadius: 3, padding: "2px 4px",
                        fontSize: "0.84rem", fontWeight: 700,
                        color: bad ? "#e06c6c" : creditPoints >= min ? ACCENT_LIGHT : "var(--text-muted)",
                      }}
                    />
                    <button
                      onClick={() => adjustCredit(5)}
                      style={{ width: 24, height: 24, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 3, cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >+</button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Occupation skill allocation */}
          <SectionWithBadge
            label="Pontos Ocupacionais"
            sub={`${selectedOcc.name} — ${formulaLabel(selectedOcc.formula)} = ${totalOccPoints} pts`}
            remaining={remainingOccPoints}
            accentDim={ACCENT_DIM} accentBord={ACCENT_BORD} accentLight={ACCENT_LIGHT}
          >
            <SkillGrid
              skills={availableSkills.filter((s) => allOccSkills.includes(s.id))}
              points={occPoints}
              skillBase={skillBase}
              skillTotal={skillTotal}
              onAdjust={adjustOcc}
              onInput={onOccInput}
              accent={ACCENT}
              accentLight={ACCENT_LIGHT}
            />
          </SectionWithBadge>

          {/* Personal interest skill allocation */}
          <SectionWithBadge
            label="Interesses Pessoais"
            sub={`INT × 2 = ${attrs.int} × 2 = ${totalIntPoints} pts — distribua em qualquer perícia`}
            remaining={remainingIntPoints}
            accentDim={ACCENT_DIM} accentBord={ACCENT_BORD} accentLight={ACCENT_LIGHT}
          >
            <SkillGrid
              skills={availableSkills.filter((s) => s.id !== "mythos" && s.id !== "nivel_credito")}
              points={intPoints}
              skillBase={skillBase}
              skillTotal={skillTotal}
              onAdjust={adjustInt}
              onInput={onIntInput}
              accent={ACCENT}
              accentLight={ACCENT_LIGHT}
            />
          </SectionWithBadge>
        </>
      )}

    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function creditTierLabel(cr: number): string {
  if (cr <= 0) return "—";
  if (cr < 10)  return "Pobre";
  if (cr < 50)  return "Médio";
  if (cr < 90)  return "Abastado";
  if (cr < 100) return "Rico";
  return "Ricaço";
}

// ─── SectionWithBadge ─────────────────────────────────────────────────────────

function SectionWithBadge({
  label, sub, remaining, accentDim, accentBord, accentLight, children,
}: {
  label: string; sub: string; remaining: number;
  accentDim: string; accentBord: string; accentLight: string;
  children: React.ReactNode;
}) {
  const over = remaining < 0;
  const done = remaining === 0;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 12 }}>
        <div>
          <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {label}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 2 }}>{sub}</div>
        </div>
        <div
          style={{
            flexShrink: 0,
            padding: "4px 12px",
            background: over ? "rgba(200,40,40,0.15)" : done ? accentDim : "var(--surface-2)",
            border: `1px solid ${over ? "rgba(200,40,40,0.4)" : done ? accentBord : "var(--border)"}`,
            borderRadius: "var(--radius-full)",
            fontSize: "0.8rem", fontWeight: 700,
            color: over ? "#e06c6c" : done ? accentLight : "var(--text-muted)",
          }}
        >
          {remaining} pts restantes
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── SkillGrid ────────────────────────────────────────────────────────────────

interface SkillGridProps {
  skills: ReturnType<typeof getSkillsForEra>;
  points: Record<string, number>;
  skillBase:  (id: string) => number;
  skillTotal: (id: string) => number;
  onAdjust: (id: string, delta: number) => void;
  onInput:  (id: string, raw: string) => void;
  accent: string;
  accentLight: string;
}

function SkillGrid({ skills, points, skillBase, skillTotal, onAdjust, onInput, accent, accentLight }: SkillGridProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 6 }}>
      {skills.map((skill) => {
        const added = points[skill.id] ?? 0;
        const total = skillTotal(skill.id);
        const base  = skillBase(skill.id);
        const hasPoints = added > 0;

        return (
          <div
            key={skill.id}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px",
              background: hasPoints ? "rgba(125,156,62,0.07)" : "var(--surface)",
              border: `1px solid ${hasPoints ? "rgba(125,156,62,0.2)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: "var(--radius-xs)",
              transition: "background 0.15s",
            }}
          >
            <span style={{ flex: 1, fontSize: "0.78rem", color: hasPoints ? "var(--text)" : "var(--text-muted)" }}>
              {skill.name}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", minWidth: 24, textAlign: "right" }}>
              {base}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>+</span>
            <button
              onClick={() => onAdjust(skill.id, -5)}
              style={{ width: 20, height: 20, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 3, cursor: "pointer", color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >−</button>
            <input
              type="number"
              value={added}
              min={0}
              onChange={(e) => onInput(skill.id, e.target.value)}
              style={{
                width: 44, textAlign: "center",
                background: "var(--surface-2)", border: `1px solid ${hasPoints ? accent : "var(--border)"}`,
                borderRadius: 3, padding: "1px 4px",
                fontSize: "0.8rem", color: hasPoints ? accentLight : "var(--text-muted)",
                fontWeight: hasPoints ? 700 : 400,
              }}
            />
            <button
              onClick={() => onAdjust(skill.id, 5)}
              style={{ width: 20, height: 20, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 3, cursor: "pointer", color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >+</button>
            <span
              style={{
                minWidth: 32, textAlign: "right",
                fontSize: "0.84rem", fontWeight: 700,
                color: hasPoints ? accentLight : "var(--text-subtle)",
              }}
            >
              {total}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
