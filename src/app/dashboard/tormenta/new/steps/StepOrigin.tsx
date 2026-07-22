"use client";

import { ORIGINS, ORIGIN_BY_ID } from "@/lib/tormenta/origins";
import { SKILL_BY_ID } from "@/lib/tormenta/data";
import type { WizardData } from "../CharacterWizard";
import { ACCENT, ACCENT_LIGHT, ACCENT_DIM, ACCENT_BORD } from "../CharacterWizard";
import { Intro } from "./Intro";

interface Props {
  originId: string | null;
  originSkillChoices: string[];
  onChange: (p: Partial<WizardData>) => void;
}

export function StepOrigin({ originId, originSkillChoices, onChange }: Props) {
  const origin = originId ? ORIGIN_BY_ID[originId] : undefined;

  function pick(id: string) {
    if (originId === id) return;
    onChange({ originId: id, originSkillChoices: [] });
  }

  function toggleSkill(id: string) {
    if (!origin) return;
    const chosen = originSkillChoices.includes(id);
    if (chosen) onChange({ originSkillChoices: originSkillChoices.filter((s) => s !== id) });
    else if (originSkillChoices.length < origin.chooseCount) onChange({ originSkillChoices: [...originSkillChoices, id] });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro title="Origem" text="O que seu personagem fazia antes de se tornar aventureiro. Concede um item inicial e perícias treinadas." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
        {ORIGINS.map((o) => {
          const isSel = originId === o.id;
          return (
            <button key={o.id} onClick={() => pick(o.id)}
              style={{ textAlign: "left", padding: "12px 14px", background: isSel ? ACCENT_DIM : "var(--surface)", border: `1px solid ${isSel ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "all 0.15s" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: isSel ? ACCENT_LIGHT : "var(--text)" }}>{o.name}</p>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 3, lineHeight: 1.4 }}>{o.description}</p>
            </button>
          );
        })}
      </div>

      {origin && (
        <div style={{ background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: ACCENT_LIGHT }}>{origin.name}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>{origin.description}</p>
          </div>

          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Item inicial
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>{origin.items}</p>
          </div>

          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Poder da origem — {origin.powerName}
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{origin.powerDesc}</p>
          </div>

          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Perícias treinadas — escolha {origin.chooseCount} ({originSkillChoices.length}/{origin.chooseCount})
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {origin.skillPool.map((id) => {
                const sel = originSkillChoices.includes(id);
                const maxed = !sel && originSkillChoices.length >= origin.chooseCount;
                return (
                  <button key={id} onClick={() => toggleSkill(id)} disabled={maxed}
                    style={{ padding: "5px 12px", background: sel ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${sel ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-full)", color: sel ? ACCENT_LIGHT : "var(--text)", fontSize: "0.78rem", fontWeight: 600, cursor: maxed ? "not-allowed" : "pointer", opacity: maxed ? 0.4 : 1 }}>
                    {SKILL_BY_ID[id]?.name ?? id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
