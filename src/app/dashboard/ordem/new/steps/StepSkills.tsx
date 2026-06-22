"use client";

import { useEffect } from "react";
import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";
import { SKILLS, ATTR_ABBR } from "@/lib/ordem/data";
import { computeSkillPlan } from "@/lib/ordem/creation";

const ACCENT = "#ffffff";
const ACCENT_LIGHT = "#ffffff";
const ACCENT_BORD = "rgba(255,255,255,0.5)";

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

export function StepSkills({ data, onChange }: Props) {
  // Reconciliação: remove perícias livres que viraram travadas (origem/classe
  // alteradas ao voltar). Hook sempre executado, antes de qualquer early return.
  useEffect(() => {
    const { locked } = computeSkillPlan(data);
    const pruned = data.trainedSkills.filter((id) => !locked.has(id));
    if (pruned.length !== data.trainedSkills.length) onChange({ trainedSkills: pruned });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.originId, data.originSkills, data.classId, data.fixedChoices]);

  if (!data.classId) return null;

  const { locked, need } = computeSkillPlan(data);
  const chosen = data.trainedSkills;
  const full = chosen.length >= need;

  function toggle(id: string) {
    const has = chosen.includes(id);
    if (has) onChange({ trainedSkills: chosen.filter((s) => s !== id) });
    else if (!full) onChange({ trainedSkills: [...chosen, id] });
  }

  const selectable = SKILLS.filter((s) => !locked.has(s.id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro
        title="Perícias"
        text="Escolha as perícias treinadas da sua classe. Perícias garantidas pela origem e pela classe já estão marcadas e não contam no limite."
      />

      {/* Contador */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px",
          background: full ? "rgba(125,200,100,0.08)" : `${ACCENT}14`,
          border: `1px solid ${full ? "rgba(125,200,100,0.3)" : `${ACCENT}44`}`,
          borderRadius: "var(--radius-lg)",
        }}
      >
        <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>Perícias escolhidas</span>
        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: full ? "#7dc864" : ACCENT_LIGHT }}>
          {chosen.length}/{need}
        </span>
      </div>

      {/* Travadas */}
      {locked.size > 0 && (
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Já treinadas (origem / classe)
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SKILLS.filter((s) => locked.has(s.id)).map((s) => (
              <span key={s.id} style={{ padding: "5px 11px", fontSize: "0.76rem", fontWeight: 600, background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`, borderRadius: "var(--radius-full)", color: ACCENT_LIGHT }}>
                ✓ {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selecionáveis */}
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          Disponíveis
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {selectable.map((s) => {
            const on = chosen.includes(s.id);
            const disabled = full && !on;
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                disabled={disabled}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 12px",
                  background: on ? `${ACCENT}1f` : "var(--surface)",
                  border: `1px solid ${on ? ACCENT_BORD : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  color: on ? ACCENT_LIGHT : disabled ? "var(--text-subtle)" : "var(--text)",
                  cursor: disabled ? "default" : "pointer",
                  fontSize: "0.8rem", fontWeight: 600,
                  transition: "all 0.12s",
                }}
              >
                <span>{s.name}</span>
                <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.04em" }}>
                  {ATTR_ABBR[s.attr]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
